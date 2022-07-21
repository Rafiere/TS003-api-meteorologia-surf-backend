import { AxiosStatic } from "axios";

/**
 * Os "clients" serão responsáveis por realizar a comunicação com
 * APIs externas.
 */

/**
 * Essas interfaces são uma "forma" da response que será retornada pela API ao
 * enviarmos uma requisição "get()".
 */

export interface StormGlassPointSource {
    readonly [key: string]: number; //A chave será "string" e o valor "number". O "[]" representa a chave, e o ":number" representa o valor.
}

export interface StormGlassPoint {
    readonly time: string;
    readonly waveHeight: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly swellDirection: StormGlassPointSource;
    readonly swellHeight: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly windDirection: StormGlassPointSource;
    readonly windSpeed: StormGlassPointSource;

}

export interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
}

/**
 * Essa interface representará os dados normalizados. Um exemplo desses dados está na pasta "fixture".
 */
export interface ForecastPoint {
    time: string;
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export class StormGlass {

    readonly stormGlassAPIParameters = //Esses são os parâmetros que serão enviados na requisição para que a API possa retorná-los.
        'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

    readonly stormGlassAPISource = 'noaa'; //O "source" é de onde os dados metereológicos dessa API virão.

    constructor(protected request: AxiosStatic) { //O Axios será utilizado para realizarmos requisições para API externas.
    }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]>{

        const response = await this.request.get<StormGlassForecastResponse>(
            `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParameters}&source=${this.stormGlassAPISource}`,
            {
                headers: {
                    Authorization: 'fake-token'
                },
            });

        return this.normalizeResponse(response.data);
    }

    /**
     *  Um "StormGlassForecastResponse" possui uma lista de points. Estamos passando cada point
     *  dessa lista para o filtro, descartando os points que não são válidos, ou seja, os points
     *  que, por ventura, vieram incompletos, com informações faltantes. Após
     *  isso, os points que estão completos serão passados para o "map()", que transformará
     *  cada ponto em um ponto normalizado, que é um "ForecastPoint". Serão retornados vários
     *  desses pontos.
     *
     *  Cada "ForecastPoint" retornado por esse ponto será um ponto normalizado, ou seja, um ponto, que
     *  foi retornado pela API e que está adaptado ao formato do JSON que desejamos. Esse formato está dentro
     *  da pasta "fixtures".
     */

    private normalizeResponse(points: StormGlassForecastResponse): ForecastPoint[] { //Essa função será um "mapper". Ela receberá a resposta da API e retornará os dados normalizados. O dado normalizado final será do tipo "ForecastPoint".
        return points.hours.filter(this.isValidPoint.bind(this)) //O "bind" faz o "isValidPoint()" ser chamado passando os próprios pontos. Apenas os pontos válidos, ou seja, os JSONs que não possuem valores faltantes serão enviados para o método "map()". Se não utilizarmos o "bind", ele estará "undefined" quando essa função for invocada, pois ela está sendo invocada pelo filtro.
            .map((point) => ({ //Retornaremos um array de "ForecastPoint". Um elemento desse array será um "Point", ou seja, um argumento que
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                time: point.time,
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource]
            }));
    }

    //Basicamente, o "partial" transforma todas as chaves da interface como opcional, assim, ele nos força a verificarmos se as chaves estão presentes.
    private isValidPoint(point: Partial<StormGlassPoint>): boolean { //O "partial" permite que as propriedades sejam opcionais, ou seja, undefined. Isso é necessário pois, como esse método verificará se o "StormGlassPoint" é válido, ou seja, se a API retornou todas as propriedades corretamente, algumas propriedades podem vir com o valor "null", assim, esse método fará essa validação, por isso, temos que utilizar o "Partial" para permitir propriedades nulas.
        return !!( //O "!!" força o retorno a ser booleano.
            point.time && //Esse método retornará boolean apenas se todas as chaves estiverem setadas corretamente.
            point.swellDirection?.[this.stormGlassAPISource] && //O "?." é o optional chaining. Nessa linha, por exemplo, estamos verificando se o objeto "swellDirection" possui o atributo "noaaa" dentro dele, que é o "this.stormGlassAPISource". Para um "point" ser válido, todas as validações precisam retornar "true".
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }

}