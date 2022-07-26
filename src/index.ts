import { SetupServer } from './server';
import config from 'config';
import logger from "@src/logger";

enum ExitStatus {
    Failure = 1,
    Success = 0
}

//Esse listener escutará todas as promises que ficaram perdidas na aplicação, ou seja, que ninguém
//deu um "catch" para ela, assim, ela é uma promise rejeitada.
process.on('unhandledRejection', (reason, promise) => {
    logger.error(
        `O aplicativo encerrou devido a uma promise que não foi cumprida. ${promise} and reason ${reason}.`
    );
    throw reason;
});

(async(): Promise<void> => { //Essa função será criada e chamada ao mesmo tempo.

    try { //Se ocorrer algum erro no início da aplicação, ele será capturado por esse try-catch.
        const server = new SetupServer(config.get('App.port'));
        await server.init();
        server.start();

        const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']; //Quando a nossa aplicação receber um desses três sinais, ela saberá como desligar a aplicação.
        exitSignals.map((sig) => process.on(sig, async () => {
            try {
                await server.close
                logger.info(`O app encerrou com sucesso!`)
                process.exit(ExitStatus.Success); //Isso se chama "graceful shutdown".
            }catch(error: unknown){ //Quando qualquer um dos sinais acima acontecerem, essa função será executada.
                if(error instanceof Error){
                    logger.error(`O aplicativo encerrou com erro ${error}.`);
                    process.exit(ExitStatus.Failure);
                }
            }
        }))
    }catch(error){
        if(error instanceof Error){
            logger.error(`A aplicação encerrou com um erro: ${error}`);
            process.exit(ExitStatus.Failure); //Estamos encerrando a aplicação enviando o código de erro "1".
        }
    }
})();