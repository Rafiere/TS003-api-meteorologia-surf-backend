/**
 * Basicamente, um teste consiste em acessarmos uma determinada URL e a
 * resposta dessa URL estar de acordo com a resposta esperada.
 *
 * Ele contém o JSON final, que é esperado para ser devolvido pelo usuário, por isso
 * que ele é um teste end-to-end.
 */

import {Beach, BeachPosition} from "@src/models/beach";
import nock from 'nock';
import api_forecast_response_1_beach from "@test/fixtures/api_forecast_response_1_beach.json"
import stormglass_weather_3_hours from "@test/fixtures/stormglass_weather_3_hours.json"

describe('Beach forecast functional tests', () => {

    beforeEach(async () => {
        await Beach.deleteMany({});

        const defaultBeach = {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: BeachPosition.E
        };

        const beach = new Beach(defaultBeach);
        await beach.save();
    });

    //Estamos descrevendo um bloco de testes. Dentro desse bloco teremos vários outros testes.
    it('should return a forecast with just a few times', async () => {
        //O "it" contém a descrição do teste.

        nock('https://api.stormglass.io:443', {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: (): boolean => true,
            },
        })
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get('/v2/weather/point')
            .query({
                lat: '-33.792726',
                lng: '151.289824',
                params: /(.*)/,
                source: 'noaa',
            })
            .reply(200, stormglass_weather_3_hours);

        const { body, status } = await global.testRequest.get('/forecast');

        expect(status).toBe(200);

        expect(body).toEqual(api_forecast_response_1_beach);
    });

    it('should return 500 if something goes wrong during the processing', async () => {
        nock('https://api.stormglass.io:443', {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: (): boolean => true,
            },
        })
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get('/v2/weather/point')
            .query({ lat: '-33.792726', lng: '151.289824' })
            .replyWithError('Something went wrong');

        const { status } = await global.testRequest.get(`/forecast`);

        expect(status).toBe(500);
    });
});
