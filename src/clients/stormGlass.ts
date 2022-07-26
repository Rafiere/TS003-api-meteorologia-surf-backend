import {AxiosError, AxiosStatic } from "axios";
import {InternalError} from "@src/util/errors/internal-error";
import config, {IConfig} from "config";
import * as HTTPUtil from '@src/util/request';
import {TimeUtil} from "@src/util/time";

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

/**
 * Esse erro representará todos os erros que são do client, ou seja, que
 * porem ocorrer dentro de nosso cliente ao realizarmos a requisição.
 */

export class ClientRequestError extends InternalError {
    constructor(message: string){
        const internalMessage = `Unexpected error when trying to communicate to StormGlass`; //Não precisamos tipar as constantes pois o TypeScript consegue, facilmente, inferir o tipo.
        super(`${internalMessage}: ${message}`); //Vamos enviar a mensagem interna do erro e concatenarmos com a resposta que o usuário enviar.
    }
}

/**
 * Esse erro representará todos os erros que possam ocorrer na API que estamos
 * consumindo, como, por exemplo, ao chegarmos no limite máximo de requisições
 * diárias.
 */

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass'); //Estamos importando as configurações do arquivo de configuração que foi criado no diretório "/config".


export class StormGlass {

    readonly stormGlassAPIParameters = //Esses são os parâmetros que serão enviados na requisição para que a API possa retorná-los.
        'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

    readonly stormGlassAPISource = 'noaa'; //O "source" é de onde os dados metereológicos dessa API virão.

    constructor(protected request = new HTTPUtil.Request()) { //O Axios será utilizado para realizarmos requisições para API externas.
    }

    public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
        const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(1);
        try {
            const response = await this.request.get<StormGlassForecastResponse>(
                `${stormGlassResourceConfig.get('apiUrl')}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParameters}&source=${this.stormGlassAPISource}&end=${endTimestamp}`,
                {
                    headers: {
                        Authorization: stormGlassResourceConfig.get('apiToken'), //O Token de autorização será obtido através de arquivos externos.
                    },
                });

            return this.normalizeResponse(response.data);

        } catch (err) { //O TypeScript não permite que um erro seja tipado, assim, podemos receber vários tipos de erros. O máximo que conseguimos fazer é verificar se um erro é de um determinado tipo, e se for, executar uma determinada ação.
            if (err instanceof Error && HTTPUtil.Request.isRequestError(err)){
                const error = HTTPUtil.Request.extractErrorData(err); //Extraindo as informações do erro.
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
                );
            }
            throw new ClientRequestError(JSON.stringify(err));
        }
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