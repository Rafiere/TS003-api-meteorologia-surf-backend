/**
 * Esse arquivo será o arquivo principal da aplicação.
 */

import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from '@src/controllers/ForecastController';
import { Application } from 'express'; //Importando os apelidos dos imports para a aplicação. Esses apelidos precisam ser o primeiro import desse arquivo.

export class SetupServer extends Server {
  constructor(private port = 3000) {
    //A porta da nossa aplicação será a "3000".
    super();
  }

  public init(): void {
    //Esse método inicializará a aplicação.
    this.setupExpress();
    this.setupControllers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json()); //Estamos permitindo que a nossa aplicação transacione dados via JSON.
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }

  public getApp(): Application {
    //Esse método retorna uma instância da aplicação do Express.
    return this.app;
  }
}
