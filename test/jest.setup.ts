/**
 * Apenas as configurações do Jest devem ser ".js". Os
 * outros arquivos podem utilizar o ".ts".
 *
 * Esse arquivo é responsável por inicializar o servidor para todos
 * os testes funcionais.
 */

import { SetupServer } from '@src/server';
import supertest from 'supertest';

let server: SetupServer;

beforeAll(async() => {
  //O "beforeAll" será executado antes de todos os testes da aplicação. Ele inicializará a aplicação no modo de testes.
  server = new SetupServer();
  await server.init();
  global.testRequest = supertest(server.getApp());
});

afterAll(async() => await server.close()); //Após os testes passarem, o banco de dados será encerrado.