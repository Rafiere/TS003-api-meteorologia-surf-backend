import {StormGlass} from '@src/clients/stormGlass';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import {Forecast} from "@src/services/forecastService";
import {Beach, GeoPosition} from "@src/models/beach";

jest.mock('@src/clients/stormGlass'); //Estaremos mockando o cliente, ou seja, mockaremos o resultado do retorno dos métodos do cliente, que são os dados normalizados.

const mockedStormGlassService = new StormGlass as jest.Mocked<StormGlass>; //Estamos adicionando os tipos do "Jest" ao serviço "StormGlass".


describe('Forecast Service', () =>{

    it('Deve retornar o forecast para múltiplas praias no mesmo horário com ratings diferentes.', async () => {

        //Como estamos mockando duas vezes, na primeira chamada, será retornado o JSON abaixo, e na segunda chamada, será
        //retornado o segundo JSON.

        mockedStormGlassService.fetchPoints.mockResolvedValueOnce([ //O Jest está mockando a chamada para o StormGlass service e retornando o valor abaixo.
            {
                swellDirection: 123.41,
                swellHeight: 0.21,
                swellPeriod: 3.67,
                time: '2020-04-26T00:00:00+00:00',
                waveDirection: 232.12,
                waveHeight: 0.46,
                windDirection: 310.48,
                windSpeed: 100,
            },
        ]);

        mockedStormGlassService.fetchPoints.mockResolvedValueOnce([ //Esse ponto é melhor para surfar do que o ponto anterior.
            {
                swellDirection: 64.26,
                swellHeight: 0.15,
                swellPeriod: 13.89,
                time: '2020-04-26T00:00:00+00:00',
                waveDirection: 231.38,
                waveHeight: 2.07,
                windDirection: 299.45,
                windSpeed: 100,
            },
        ]);

        //Estamos criando duas praias, com diferentes altitudes e longitudes.

        const beaches: Beach[] = [
            {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: GeoPosition.E,
                user: 'fake-id',
            },
            {
                lat: -33.792726,
                lng: 141.289824,
                name: 'Dee Why',
                position: GeoPosition.S,
                user: 'fake-id',
            },
        ];

        //Essas são as respostas esperadas para as praias e os pontos acima.

        const expectedResponse = [
            {
                time: '2020-04-26T00:00:00+00:00',
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: 'Manly',
                        position: 'E',
                        rating: 2,
                        swellDirection: 123.41,
                        swellHeight: 0.21,
                        swellPeriod: 3.67,
                        time: '2020-04-26T00:00:00+00:00',
                        waveDirection: 232.12,
                        waveHeight: 0.46,
                        windDirection: 310.48,
                        windSpeed: 100,
                    },
                    {
                        lat: -33.792726,
                        lng: 141.289824,
                        name: 'Dee Why',
                        position: 'S',
                        rating: 3,
                        swellDirection: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 13.89,
                        time: '2020-04-26T00:00:00+00:00',
                        waveDirection: 231.38,
                        waveHeight: 2.07,
                        windDirection: 299.45,
                        windSpeed: 100,
                    },
                ],
            },
        ];
        const forecast = new Forecast(mockedStormGlassService);
        const beachesWithRating = await forecast.processForecastForBeaches(beaches);
        expect(beachesWithRating).toEqual(expectedResponse);
    });


    it('deve retornar a previsão do tempo para uma lista de praias.', async () =>{
        // StormGlass.prototype.fetchPoints = jest.fn().mockResolvedValue(stormGlassNormalizedResponseFixture);

        mockedStormGlassService.fetchPoints.mockResolvedValue(
            stormGlassNormalizedResponseFixture
        );

        const beaches: Beach[] = [ //Esse será um exemplo de praias da aplicação. Nesse exemplo, o usuário terá apenas uma praia cadastrada.
            {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: GeoPosition.E,
                user: 'fake-id'
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
                        rating: 2,
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
                        rating: 2,
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
                        rating: 2,
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

        const forecast = new Forecast(mockedStormGlassService); //O "Forecast" vai receber uma instância do mock do "StormGlass", que é o cliente de API.
        const beachesWithRating = await forecast.processForecastForBeaches(beaches); //Esse serviço também receberá uma lista de praias com o forecast correto.

        expect(beachesWithRating).toEqual(expectedResponse); //A resposta do método de realizar o processamento para as praias deverá ser igual ao JSON que possui os dados da praia, o rating e outras informações sobre a previsão do tempo naquele instante.
    });

    it('deve retornar uma lista vazia se o usuário não possui nenhuma praia cadastrada', async() => {
        const forecast = new Forecast();
        const response = await forecast.processForecastForBeaches([]);

        expect(response).toEqual([]); //Se o usuário não possui nenhuma praia cadastrada, deve ser retornado um array vazio.
    });

    it('deve lançar um internal processing error quando algo de errado ocorrer durante o processo de rating', async() => {
        const beaches: Beach[] = [ //Estamos simulando que o usuário, nesse teste, terá apenas uma praia cadastrada.
            {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: GeoPosition.E,
                user: 'fake-id'
            },
        ];

        mockedStormGlassService.fetchPoints.mockRejectedValue(
            'Error fetching data'
        );

        const forecast = new Forecast(mockedStormGlassService);
        await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(Error); //Queremos que o método do service, que processará o tempo para as praias do usuário, retorne um erro.
    });
})