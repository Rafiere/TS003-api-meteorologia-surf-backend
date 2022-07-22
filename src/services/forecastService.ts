import {ForecastPoint, StormGlass} from "@src/clients/stormGlass";

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
 * Esse enum representará os pontos cardeais que a aplicação suportará.
 */

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N'
}

/**
 * Essa interface representará uma praia que estará cadastrada no sistema.
 */

export interface Beach {
    name: string;
    position: BeachPosition;
    lat: number;
    lng: number;
    user: string;
}

/**
 * Esse tipo representará a previsão do tempo final, com a informação
 * das praias, ou seja, a junção de tudo. Ele terá todos os campos das interfaces "Beach" e "ForecastPoint", exceto
 * o campo "user" dessa interface.
 */

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint { //Como não utilizaremos o "user" nessa resposta, herdaremos todos os atributos, para evitar a repetição de código, menos o atributo "user" da interface "Beach".

}

export class Forecast {

    constructor(protected stormGlass = new StormGlass()){}

    /**
     * Esse método receberá uma lista de praias e fará a junção entre
     * a previsão para essas praias, a informação sobre essas praias e o rating
     * dessas praias em um determinado momento.
     * @param beaches
     */

    public async processForecastForBeaches(beaches: Beach[]): Promise<BeachForecast[]> {
        const pointsWithCorrectSources: BeachForecast[] = []; //Esse será o array de responses finais.

        for(const beach of beaches){ //Pegaremos a informação de cada praia registrada pelo usuário.
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
            const enrichedBeachData = points.map((e) => ({ //Adicionaremos as outras informações necessárias, além das informações já existentes sobre um determinado ponto, de outro serviço.
                ...{ //Realizando o merge entre os points normalizados, que foram obtidos do cliente do stormglass e os outros dados, que serão obtidos de outros serviços.
                    lat: beach.lat,
                    lng: beach.lng,
                    name: beach.name,
                    position: beach.position,
                    rating: 1 //Ainda não temos a lógica desse serviço implementada.
                },
                ... e //Nessa linha estamos juntando todos os cinco parâmetros acima com os dados que são enviados pela API externa do stormglass, que é representado pela letra "e".
            }));
            pointsWithCorrectSources.push(...enrichedBeachData); //Adicionaremos na lista de resposta final esse objeto do "for()". Todos os atributos desse objeto ficarão no mesmo nível pois estamos utilizando o "...", que é o spread operator.
        }
        return pointsWithCorrectSources;
    }
}