import {Beach} from "@src/models/beach";
import {User} from "@src/models/user";
import AuthService from "@src/services/authService";

describe('Testes funcionais para as \'Beaches\' da aplicação.', () => {

    const defaultUser = {
        name: 'John Doe',
        email: 'John2@mail.com',
        password: '1234',
    }

    let token: string;

    beforeAll(async () => await Beach.deleteMany({})); //Antes de todos os testes começarem, todas as praias do banco de dados serão deletadas. Isso garantirá que o estado do teste estará limpo quando ele for executado.

    beforeEach(async() => {
        await Beach.deleteMany({});
        await User.deleteMany({});
        const user = await new User(defaultUser).save();

        token = AuthService.generateToken(user.toJSON()); //Estamos gerando um token para o usuário e definindo que esse token será utilizado em todas as requisições.
    })

    describe('Quando criarmos uma praia: ', () => { //Criamos dois "describes" para melhorar a legibilidade dos testes.

        /**
         * Esse teste verificará se, ao enviarmos uma requisição "post" para o "/beaches", uma nova
         * praia será criada.
         */

        it('deve criar uma praia com sucesso.', async() => {

            const newBeach = {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: 'E'
            };

            const response = await global.testRequest.post('/beaches').set({'x-access-token': token}).send(newBeach);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newBeach)); //Como será enviado o "ID" junto com o objeto "newBeach" para o controller, e esse ID será diferente a cada instante, ao invés de compararmos todos os atributos desse objeto para o teste passar, vamos passar a verificar apenas se o objeto que será retornado pelo controller terá os atributos do objeto "newBeach". Se ele tiver qualquer atributo a mais, como um ID, o teste passará da mesma forma.

        });

        it('deve retornar o status 422 quando ocorrer um erro de validação', async () => {

            const newBeach = { //Estamos criando uma praia com o atributo "lat" inválido.
                lat: 'invalid_string',
                lng: 151.289824,
                name: 'Manly',
                position: 'E'
            };

            const response = await global.testRequest.post('/beaches').set({'x-access-token': token}).send(newBeach);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({ //Estamos esperando que esse erro, que é o padrão do Mongoose, seja lançado.
                code: 422,
                error: 'Unprocessable Entity',
                message: 'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
            });
        });
    });
});