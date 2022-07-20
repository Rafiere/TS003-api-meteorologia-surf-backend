/**
 * Apenas as configurações do Jest devem ser ".js". Os
 * outros arquivos podem utilizar o ".ts".
 *
 * Esse arquivo é responsável por inicializar o servidor para todos
 * os testes funcionais.
 */

import { SetupServer } from '@src/server';
import supertest from 'supertest';

beforeAll(() => {
  //O "beforeAll" será executado antes de todos os testes da aplicação. Ele inicializará a aplicação no modo de testes.
  const server = new SetupServer();
  server.init();
  global.testRequest = supertest(server.getApp());
});
