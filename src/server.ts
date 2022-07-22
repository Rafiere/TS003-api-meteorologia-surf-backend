/**
 * Esse arquivo será o arquivo principal da aplicação.
 */

import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from '@src/controllers/ForecastController';
import { Application } from 'express'; //Importando os apelidos dos imports para a aplicação. Esses apelidos precisam ser o primeiro import desse arquivo.
import * as database from '@src/database';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    //A porta da nossa aplicação será a "3000".
    super();
  }

  public async init(): Promise<void> {
    //Esse método inicializará a aplicação.
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json()); //Estamos permitindo que a nossa aplicação transacione dados via JSON.
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }

  private async databaseSetup(): Promise<void> { //Esse método será responsável por inicializar a conexão com o banco de dados.
    await database.connect();
  }

  public async close(): Promise<void> { //No momento, esse método desliga apenas o banco de dados, porém, no futuro, ele será responsável por desligar toda a aplicação.
    await database.close();
  }

  public getApp(): Application {
    //Esse método retorna uma instância da aplicação do Express.
    return this.app;
  }
}
