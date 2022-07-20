/**
 * Essa configuração será utilizada apenas para os testes funcionais, que
 * são os testes end-to-end.
 */

const {resolve} = require('path');
const root = resolve(__dirname, '..');
const rootConfig = require(`${root}/jest.config.js`); //Estamos importando a configuração global do Jest, pois ela será utilizada, mas será sobrescrita em algumas partes.

//O "...rootConfig, ...{}" é o "merge syntax", assim, pegaremos a configuração padrão e sobrescrevemos apenas as configurações que estão dentro da chave, para termos uma configuração padrão para esse tipo de teste.

module.exports = { ...rootConfig, ... { //Estamos utilizando toda a configuração global dos testes, porém, estamos sobrescrevendo algumas informações.
    rootDir: root,
    displayName: "end2end-tests", //Estamos alterando a label para identificar os testes end-to-end.
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"], //Esse arquivo será executado antes de executarmos os testes. Ele servirá para realizarmos diversos setups, como os setups de database, do servidor e etc.
    testMatch: ["<rootDir>/test/**/*.test.ts"] //Essa configuração será aplicada apenas aos arquivos que possuem ".test.ts" que estão dentro da pasta "test".
}}