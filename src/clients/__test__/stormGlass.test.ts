import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios> //O "jest.Mocked()" mockará o axios. Ele pegará os tipos do Axios e adicionará os tipos do "jestMocked" sob o Axios, ou seja, ele juntará os dois. O "as" não deve ser utilizado em um código que não é de teste, pois estamos forçando o TypeScript a realizar uma inferência de tipo.

describe('Storm Glass client', () => {
    it('deve retornar os dados da API da forma esperada pela aplicação.', async () => {

        /**
         * Esse teste simulará que estamos pegando uma requisição de um servidor externo e que
         * estamos devolvendo os dados normalizados.
         */

        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockResolvedValue({data: stormGlassWeather3HoursFixture}); //Estamos mockando a resposta da API com um exemplo de JSON, ou seja, estamos simulando que estamos "batendo" nesse endpoint e recebendo uma requisição.

        const stormGlass = new StormGlass(mockedAxios);

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

        mockedAxios.get.mockResolvedValue({data: incompleteResponse});

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual([]);
    });
})