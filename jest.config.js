/**
 * Esse arquivo terá a configuração do Jest globalmente.
 *
 * Estamos utilizando a configuração em ".js" para diminuir a dificuldade de
 * utilizar o TS para configurarmos o Jest.
 */

const {resolve} = require('path')
const root = resolve(__dirname);
module.exports = {
 rootDir: root, //Esse diretório é o diretório em que o "jest.config.ts" se encontra.
 displayName: 'root-tests', //Se os testes estiverem utilizando essa configuração, eles serão exibidos com essa label. Isso serve para diferenciar as configurações que os testes utilizam.
 testMatch: ['<rootDir>/src/**/*.test.ts'], //Esse arquivo de configuração poderá ser utilizados apenas nos testes que estão dentro da pasta "/src". Os testes de unidade ficarão dentro dessa pasta. Os testes funcionais são end-to-end e ficarão dentro da pasta "test", fora do "src".
 testEnvironment: 'node', //O Jest utilizará o node para realizar os testes.
 clearMocks: true, //Os mocks serão limpados por padrão.
 preset: 'ts-jest',
 moduleNameMapper: { //Estamos setando os atalhos de mapeamento que utilizamos na aplicação. Eles são muito úteis, mas eles devem ser configurados no TS, no código final e na ferramenta de testes.
  '@src/(.*)': '<rootDir>/src/$1',
  '@test/(.*)': '<rootDir>/test/$1',
 },
}