/**
 * Essa classe contém os métodos necessários para o MongoDB criar
 * e encerrar a conexão.
 *
 * É recomendado utilizarmos o método "close()" ao finalizarmos a
 * aplicação, garantindo que não haja nenhuma inconsistência.
 */

import config, { IConfig } from 'config';
import { connect as mongooseConnect, connection } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

export const connect = async (): Promise<void> => {
    await mongooseConnect(dbConfig.get('mongoUrl'));
};

export const close = (): Promise<void> => connection.close();