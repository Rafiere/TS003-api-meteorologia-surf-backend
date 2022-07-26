import {ClassMiddleware, Controller, Get} from '@overnightjs/core';
import { Request, Response } from 'express';
import {Forecast} from "@src/services/forecastService";
import {Beach} from "@src/models/beach";
import {authMiddleware} from "@src/middlewares/auth";
import logger from "@src/logger";

/**
 * Os controllers são utilizados para receber uma determinada requisição e
 * delegá-la para algum lugar na aplicação.
 *
 * Nessa aplicação, os "clients" serão as unidades responsáveis por conversar com
 * serviços externos, como a API que estamos utilizando.
 */

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware) //Esse middleware garantirá que o usuário que fez a requisição esteja inserido dentro da requisição.
export class ForecastController {
  @Get('')
  public async getForecastForgeLoggedUser(req: Request, res: Response): Promise<void> {

    try {

      const beaches = await Beach.find({user: req.decoded?.id});
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).send(forecastData);

    }catch(error: unknown){
      logger.error(error);
      res.status(500).send({error: 'Something went wrong!'});
    }
  }
}
