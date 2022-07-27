import {ClassMiddleware, Controller, Get, Middleware} from '@overnightjs/core';
import { Request, Response } from 'express';
import {Forecast} from "@src/services/forecastService";
import {Beach} from "@src/models/beach";
import {authMiddleware} from "@src/middlewares/auth";
import logger from "@src/logger";
import rateLimit from 'express-rate-limit';
import {BaseController} from "@src/controllers/indexController";
import ApiError from "@src/util/errors/api-error";

/**
 * Os controllers são utilizados para receber uma determinada requisição e
 * delegá-la para algum lugar na aplicação.
 *
 * Nessa aplicação, os "clients" serão as unidades responsáveis por conversar com
 * serviços externos, como a API que estamos utilizando.
 */

const forecast = new Forecast();

/**
 * Esse é um middleware que limitará a quantidade de requisições que podem ser
 * realizadas em um intervalo de tempo de um minuto, assim como tratará o
 * erro que será enviado para o usuário se esse limite for ultrapassado.
 */

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, //A cada um minuto os dados dessa janela valerão.
  max: 10, //Poderão ser realizadas, no máximo, 10 requisições nesse intervalo da janela.
  keyGenerator(req: Request): string {
    return req.ip; //Esse método retornará o IP de quem realizou a requisição.
  },
  handler(_, res: Response): void { //Quando o número máximo de requisições for alcançada, será retornado o erro no formato da nossa api, que está definido no "ApiError".
    res.status(429).send(ApiError.format({code: 429, message: 'Too many requests to the \'/forecast\' endpoint.'}))
  }
});

@Controller('forecast')
@ClassMiddleware(authMiddleware) //Esse middleware garantirá que o usuário que fez a requisição esteja inserido dentro da requisição.
export class ForecastController extends BaseController {

  @Get('')
  @Middleware(rateLimiter) //Esse middleware será aplicado apenas nessa rota.
  public async getForecastForgeLoggedUser(req: Request, res: Response): Promise<void> {

    try {

      const beaches = await Beach.find({user: req.decoded?.id});
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).send(forecastData);

    }catch(error: unknown){
      this.sendErrorResponse(res, {code: 500, message: 'Something went wrong!'});
    }
  }
}
