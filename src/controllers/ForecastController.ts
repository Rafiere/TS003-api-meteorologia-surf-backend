import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import {Forecast} from "@src/services/forecastService";
import {Beach} from "@src/models/beach";

/**
 * Os controllers são utilizados para receber uma determinada requisição e
 * delegá-la para algum lugar na aplicação.
 *
 * Nessa aplicação, os "clients" serão as unidades responsáveis por conversar com
 * serviços externos, como a API que estamos utilizando.
 */

const forecast = new Forecast();

@Controller('forecast')
export class ForecastController {
  @Get('')
  public async getForecastForgeLoggedUser(_: Request, res: Response): Promise<void> {

    try {

      const beaches = await Beach.find({});
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).send(forecastData);

    }catch(error: unknown){

      res.status(500).send({error: 'Something went wrong!'});
    }
  }
}
