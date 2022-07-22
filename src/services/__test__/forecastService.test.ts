import { StormGlass } from '@src/clients/stormGlass';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import {Beach, BeachPosition, Forecast} from "@src/services/forecastService";

jest.mock('@src/clients/stormGlass'); //Estaremos mockando o cliente, ou seja, mockaremos o resultado do retorno dos métodos do cliente, que são os dados normalizados.

describe('Forecast Service', () =>{

    it('deve retornar a previsão do tempo para uma lista de praias.', async () =>{
        StormGlass.prototype.fetchPoints = jest.fn().mockResolvedValue(stormGlassNormalizedResponseFixture);

        const beaches: Beach[] = [ //Esse será um exemplo de praias da aplicação. Nesse exemplo, o usuário terá apenas uma praia cadastrada.
            {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: BeachPosition.E,
                user: 'some-id'
            },
        ];

        const expectedResponse = [ //A resposta dessa requisição deverá ser algumas previsões do tempo para essa praia em algumas horas diferentes do dia.
            {
                time: '2020-04-26T00:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 1,
                        swellDirection: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 3.89,
                        time: '2020-04-26T00:00:00+00:00',
                        waveDirection: 231.38,
                        waveHeight: 0.47,
                        windDirection: 299.45,
                        windSpeed: 100,
                    },
                ],
            },
            {
                time: '2020-04-26T01:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 1,
                        swellDirection: 123.41,
                        swellHeight: 0.21,
                        swellPeriod: 3.67,
                        time: '2020-04-26T01:00:00+00:00',
                        waveDirection: 232.12,
                        waveHeight: 0.46,
                        windDirection: 310.48,
                        windSpeed: 100,
                    },
                ],
            },
            {
                time: '2020-04-26T02:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 1,
                        swellDirection: 182.56,
                        swellHeight: 0.28,
                        swellPeriod: 3.44,
                        time: '2020-04-26T02:00:00+00:00',
                        waveDirection: 232.86,
                        waveHeight: 0.46,
                        windDirection: 321.5,
                        windSpeed: 100,
                    },
                ],
            },
        ];

        const forecast = new Forecast(new StormGlass()); //O "Forecast" vai receber uma instância do "StormGlass", que é o cliente de API.
        const beachesWithRating = await forecast.processForecastForBeaches(beaches); //Esse serviço também receberá uma lista de praias com o forecast correto.

        expect(beachesWithRating).toEqual(expectedResponse); //A resposta do método de realizar o processamento para as praias deverá ser igual ao JSON que possui os dados da praia, o rating e outras informações sobre a previsão do tempo naquele instante.
    })
})