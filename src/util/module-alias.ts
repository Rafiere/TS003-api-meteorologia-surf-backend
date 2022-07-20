/**
 * Esse arquivo, juntamente com as configurações de "paths" no "tsconfig.json" nos
 * permitirá utilizar "@src" e "@test" para importarmos quaisquer arquivos em nosso
 * projeto, diminuindo o tamanho dos imports.
 */

import * as path from 'path';
import moduleAlias from 'module-alias';

const files = path.resolve(__dirname, '../..');

moduleAlias.addAliases({
  '@src': path.join(files, 'src'),
  '@test': path.join(files, 'test'),
});
