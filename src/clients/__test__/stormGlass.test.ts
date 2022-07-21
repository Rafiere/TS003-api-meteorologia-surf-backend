import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUtil from '@src/util/request';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import mock = jest.mock;

jest.mock('@src/util/request');

const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>

const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

describe('Storm Glass client', () => {
    it('deve retornar os dados da API da forma esperada pela aplicação.', async () => {

        /**
         * Esse teste simulará que estamos pegando uma requisição de um servidor externo e que
         * estamos devolvendo os dados normalizados.
         */

        const lat = -33.792726;
        const lng = 151.289824;

        mockedRequest.get.mockResolvedValue({data: stormGlassWeather3HoursFixture} as HTTPUtil.Response); //Estamos mockando a resposta da API com um exemplo de JSON, ou seja, estamos simulando que estamos "batendo" nesse endpoint e recebendo uma requisição.

        const stormGlass = new StormGlass(mockedRequest);

        const response = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual(stormGlassNormalized3HoursFixture);
    });

    /**
     * Esse teste verificará o comportamento do método "isValidPoint()"
     * do client, que deve excluir os pontos caso eles cheguem de forma incompleta
     * da API externa. Lembrando que ele não fará, realmente, uma requisição para
     * a API externa, e sim, mockaremos o retorno da requisição para essa API.
     */

    it('deve excluir os pontos que não estão completos.', async () => {
        const lat = -33.792726
        const lng = 151.289824;

        const incompleteResponse = { //Essa resposta possui chaves incompletas, logo, ela deve passar pelo "isValidPoint()" e falhar.
            hours: [
                {
                    windDirection: {
                        noaa: 300,
                    },
                    time: '2020-04-26T00:00:00+00:00',
                },
            ],
        };

        mockedRequest.get.mockResolvedValue({data: incompleteResponse} as HTTPUtil.Response);

        const stormGlass = new StormGlass(mockedRequest);
        const response = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual([]);
    });

    /**
     * Esse teste verificará se um erro genérico será lançado caso a request que
     * enviaremos esteja incompleta. Essa verificação na requisição será
     * realizada antes da requisição chegar ao serviço externo.
     */

    it('deve obter um erro genérico do serviço do StormGlass quando a requisição falhar antes de alcançar o serviço', async () => {

        const lat = -33.792726;
        const lng = 151.289824;

        mockedRequest.get.mockRejectedValue('Network Error'); //Nesse caso de teste, o "get()" vai rejeitar a promise, ou seja, a requisição, com a mensagem "Network Error". Essa mensagem será enviada caso a nossa requisição tenha algum erro.

        const stormGlass = new StormGlass(mockedRequest);

        // const response = await stormGlass.fetchPoints(lat, lng);

        // await expect(response).rejects.toThrow( //Um "reject" será enviado quando a promise for rejeitada, ou seja, quando o serviço não enviar uma resposta para a requisição. Antes de chegarmos ao serviço.
        //     'Unexpected error when trying to communicate to StormGlass: Network Error'
        // )

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: \"Network Error\"'
        );
    });

    it('deve retornar um "StormGlassResponseError" quando o serviço do StormGlass retorna algum erro. ', async () => {

        const lat = -33.792726;
        const lng = 151.289824;

        class FakeAxiosError extends Error {
            constructor(public response: object){
                super();
            }
        }

        MockedRequestClass.isRequestError.mockReturnValue(true); //Estamos mockando o método estático e dizendo que ele deverá retornar "true", informando que o erro é um erro de request.

        mockedRequest.get.mockRejectedValue( //Estamos mockando o retorno do método "get()".
            new FakeAxiosError({
                status: 429,
                data: { errors: ['Rate Limit reached'] },
            })
        );

        MockedRequestClass.extractErrorData.mockReturnValue({ //Estamos mockando o retorno do  método "extractErrorData()".
            status: 429,
            data: { errors: ['Rate Limit reached'] },
        });

        const stormGlass = new StormGlass(mockedRequest);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
        );

    });
})