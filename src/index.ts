import { SetupServer } from './server';
import config from 'config';

(async(): Promise<void> => { //Essa função será criada e chamada ao mesmo tempo.
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();
})();