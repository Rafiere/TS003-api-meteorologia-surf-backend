import {ForecastPoint, StormGlass} from "@src/clients/stormGlass";
import {InternalError} from "@src/util/errors/internal-error";
import {Beach} from "@src/models/beach";
import logger from "@src/logger";

/**
 * Esse serviço chamará o cliente "stormGlass", obterá os dados normalizados
 * desse cliente, e, através desses dados normalizados que foram obtidos, chamará
 * o "ratingService", que será responsável por calcular a nota de uma determinada praia
 * de acordo com os dados que foram obtidos.
 *
 * Após obter todos esses dados, esse serviço apenas montará o formato que
 * será devolvido para o controller, e, consequentemente, que o controller retornará
 * para o usuário.
 */

/**
 * Esse tipo representará a previsão do tempo final, com a informação
 * das praias, ou seja, a junção de tudo. Ele terá todos os campos das interfaces "Beach" e "ForecastPoint", exceto
 * o campo "user" dessa interface.
 */

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint { //Como não utilizaremos o "user" nessa resposta, herdaremos todos os atributos, para evitar a repetição de código, menos o atributo "user" da interface "Beach".

}

/**
 * Essa interface representará o "BeachForecast" dividido por horas.
 */

export interface TimeForecast {
    time: string;
    forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {

    constructor(message: string){
        super(`Unexpected error during the forecast processing: ${message}`);
    }
}

export class Forecast {

    constructor(protected stormGlass = new StormGlass()){}

    /**
     * Esse método receberá uma lista de praias e fará a junção entre
     * a previsão para essas praias, a informação sobre essas praias e o rating
     * dessas praias em um determinado momento.
     * @param beaches
     */

    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        const pointsWithCorrectSources: BeachForecast[] = []; //Esse será o array de responses finais.

        try {
            for(const beach of beaches){ //Pegaremos a informação de cada praia registrada pelo usuário.
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enrichedBeachData = this.enrichBeachData(points, beach);
                pointsWithCorrectSources.push(...enrichedBeachData); //Adicionaremos na lista de resposta final esse objeto do "for()". Todos os atributos desse objeto ficarão no mesmo nível pois estamos utilizando o "...", que é o spread operator.
                logger.info(`Preparing the forecast for ${beaches.length} beaches.`);
            }

            return this.mapForecastByTime(pointsWithCorrectSources);

        }catch(error: unknown){
            logger.error(error);
            throw new ForecastProcessingInternalError((error as Error).message);
        }
    }

    private enrichBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[]{
        return points.map((e) => ({ //Adicionaremos as outras informações necessárias, além das informações já existentes sobre um determinado ponto, de outro serviço.
            ...{ //Realizando o merge entre os points normalizados, que foram obtidos do cliente do stormglass e os outros dados, que serão obtidos de outros serviços.
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1 //Ainda não temos a lógica desse serviço implementada.
            },
            ... e //Nessa linha estamos juntando todos os cinco parâmetros acima com os dados que são enviados pela API externa do stormglass, que é representado pela letra "e".
        }));
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[]{
        const forecastByTime: TimeForecast[] = []; //Esse será o array final.

        for(const point of forecast){
            const timePoint = forecastByTime.find((f) => f.time === point.time); //Se já existir um objeto, no formato JSON, para aquela hora, apenas adicionaremos mais um ponto nesse objeto. Se não existir, criaremos um novo objeto com essa determinada hora e adicionaremos o ponto necessário.
            if(timePoint){ //Se essa hora já existir no JSON, apenas adicionaremos um novo ponto nessa hora.
                timePoint.forecast.push(point);
            }else { //Se essa hora não existir, criaremos uma determinada hora e adicionaremos o ponto dentro dessa hora. Lembrando que, nesse método, estamos formando o JSON que será devolvido.
                forecastByTime.push({
                   time: point.time,
                   forecast: [point]
                });
            }
        }
        return forecastByTime;
    }
}