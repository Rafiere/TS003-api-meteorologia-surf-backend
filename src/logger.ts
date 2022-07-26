/**
 * Essa classe será um singleton, ou seja, ela estará disponível para
 * ser utilizada na aplicação inteira.
 */

import pino from 'pino'
import config from 'config'

export default pino({ //Estamos exportando uma instância do Pino por padrão.

    enabled: config.get('App.logger.enabled'),
    level: config.get('App.logger.level')
});