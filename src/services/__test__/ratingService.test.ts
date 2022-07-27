import {Beach, GeoPosition} from "@src/models/beach";
import {RatingService} from "@src/services/ratingService";

/**
 * O rating de uma praia será calculado através de diversos fatores.
 *
 * Como o "rating" é o core da aplicação, ou seja, a funcionalidade
 * principal, temos que efetuar a maior quantidade de testes possíveis.
 */

describe('Rating Service', () => {

    const defaultBeach: Beach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'some-user'
    };

    const defaultRating = new RatingService(defaultBeach);

    describe('Calculando a nota de um determinado ponto', () => {
        //Esse teste verificará o cálculo da nota final da praia, que é a nota
        //que será devolvida para o usuário.

        const defaultPoint = {
            swellDirection: 110,
            swellHeight: 0.1,
            swellPeriod: 5,
            time: 'test',
            waveDirection: 110,
            waveHeight: 0.1,
            windDirection: 100,
            windSpeed: 100
        };

        //Um ponto é composto de várias informações sobre as ondas e os ventos em uma
        //determinada hora.
        it('Deve obter uma nota menor do que 1 para um ponto muito ruim.', () => {
            const rating = defaultRating.getRateForPoint(defaultPoint);
            expect(rating).toBe(1);
        });

        it('Deve obter uma nota 1 para um ponto OK.', () => {

            const pointData = {
                swellHeight: 0.4,
            };

            const point = { ...defaultPoint, ...pointData };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(1);
        })

        it('Deve obter uma nota 3 para um ponto com ventos offshore e a altura da onda está ' +
            'na cintura. ', () => {

            const point = { //Criando um ponto personalizado com os dados desejados.
                ...defaultPoint,
                ... {
                    swellHeight: 0.7,
                    windDirection: 250,
                },
            };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(3);
        });

        it('Deve obter uma nota 4 para um ponto com ventos offshore, em que a altura da onda está ' +
            'na cintura e que possui um bom intervalo.', () => {

            const point = { //Criando um ponto personalizado com os dados desejados.
                ...defaultPoint,
                ... {
                    swellHeight: 0.7,
                    swellPeriod: 12,
                    windDirection: 250,
                },
            };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(4);
        });

        it('Deve obter uma nota 4 para um ponto com ventos offshore, em que a altura da onda está ' +
            'no ombro e que possui um bom intervalo.', () => {

            const point = { //Criando um ponto personalizado com os dados desejados.
                ...defaultPoint,
                ... {
                    swellHeight: 1.5,
                    swellPeriod: 12,
                    windDirection: 250,
                },
            };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(4);
        });

        it('Deve obter uma nota 5 em um dia clássico para surfar!', () => {

            const point = { //Criando um ponto personalizado com os dados desejados.
                ...defaultPoint,
                ... {
                    swellHeight: 2.5,
                    swellPeriod: 16,
                    windDirection: 250,
                },
            };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(5);
        });

        it('Deve obter uma nota 4 para uma boa condição mas com ventos crossshore.', () => {

            const point = { //Criando um ponto personalizado com os dados desejados.
                ...defaultPoint,
                ... {
                    swellHeight: 2.5,
                    swellPeriod: 16,
                    windDirection: 130,
                },
            };

            const rating = defaultRating.getRateForPoint(point);
            expect(rating).toBe(4);
        });
    });

    describe('Deve obter o rating baseado na posição do vento e da onda.', () => {

        it('Deve obter a nota \'1\' para uma praia com ventos \'onshore\', que são os' +
            'ventos que estão a favor da praia, pois isso é muito ruim para a geração de ondas.', async () => {

            const rating = defaultRating.getRatingBasedOnWindAndWavePositions(GeoPosition.E, GeoPosition.E);

            expect(rating).toBe(1);
        })

        it('Deve obter a nota 3 para uma praia que possui \'cross winds\' ', async () => {

            const rating = defaultRating.getRatingBasedOnWindAndWavePositions(GeoPosition.E, GeoPosition.S);

            expect(rating).toBe(3);

        });

        it('Deve retornar a nota 5 para uma praia que possui ventos \'offshore\', ou seja, ventos em que ' +
            'estão na direção oposta da praia.', async () => {

            const rating = defaultRating.getRatingBasedOnWindAndWavePositions(GeoPosition.E, GeoPosition.W);

            expect(rating).toBe(5);

        });
    });

    describe('Obter uma nota baseada no período da ondulação. Quanto maior esse período, mais alta a nota deve ser.', () => {

        it('Deve obter a nota 1 para um período de 5 segundos.', () => {

            const rating = defaultRating.getRatingForSwellPeriod(5);
            expect(rating).toBe(1);
        });

        it('Deve obter a nota 2 para um período de 9 segundos.', () => {

            const rating = defaultRating.getRatingForSwellPeriod(9);
            expect(rating).toBe(2);
        });

        it('Deve obter a nota 1 para um período de 5 segundos.', () => {

            const rating = defaultRating.getRatingForSwellPeriod(12);
            expect(rating).toBe(4);
        });

        it('Deve obter a nota 1 para um período de 5 segundos.', () => {

            const rating = defaultRating.getRatingForSwellPeriod(16);
            expect(rating).toBe(5);
        });
    });

    describe('Obter uma nota baseada na altura das ondulações.', () => {

        it('Deve obter a nota 1 para um swell height menor do tornozelo até o joelho', () => {
            const rating = defaultRating.getRatingForSwellSize(0.2); //Estamos passando o tamanho do swell height, em metros.
            expect(rating).toBe(1);
        });

        it('Deve obter a nota 2 para um swell height do tornozelo até o joelho', () => {
            const rating = defaultRating.getRatingForSwellSize(0.6);
            expect(rating).toBe(2);
        });

        it('Deve obter a nota 3 para um swell height até a cintura', () => {
            const rating = defaultRating.getRatingForSwellSize(1.5);
            expect(rating).toBe(3);
        });

        it('Deve obter a nota 5 para um swell height acima da cabeça', () => {
            const rating = defaultRating.getRatingForSwellSize(2.5);
            expect(rating).toBe(5);
        });
    });

    describe('Obter a posição baseada na localização dos pontos.', () => {

        it('Deve obter o ponto baseado em uma localização EAST.', async () => {
            const response = defaultRating.getPositionFromLocation(92);
            expect(response).toBe(GeoPosition.E);
        });

        it('Deve obter o ponto baseado em uma localização NORTH 1.', async () => {
            const response = defaultRating.getPositionFromLocation(360);
            expect(response).toBe(GeoPosition.N);
        });

        it('Deve obter o ponto baseado em uma localização NORTH 2.', async () => {
            const response = defaultRating.getPositionFromLocation(40);
            expect(response).toBe(GeoPosition.N);
        });

        it('Deve obter o ponto baseado em uma localização SOUTH.', async () => {
            const response = defaultRating.getPositionFromLocation(200);
            expect(response).toBe(GeoPosition.S);
        });

        it('Deve obter o ponto baseado em uma localização WEST.', async () => {
            const response = defaultRating.getPositionFromLocation(300);
            expect(response).toBe(GeoPosition.W);
        });
    });
});