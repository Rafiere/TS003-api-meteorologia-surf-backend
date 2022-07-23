import {User} from "@src/models/user";

describe('Testes de integração dos usuários da aplicação.', () => {

    beforeEach(async () => { //Cada vez que os testes forem executados, todos os usuários serão limpos do banco de dados de teste.
        await User.deleteMany({});
    });

    describe('Quando criar um novo usuário', () => {

        it('Deve criar um novo usuário corretamente', async () => {

            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };

            const response = await global.testRequest.post('/users').send(newUser); //Estamos enviando um usuário pelo "body" dessa requisição do tipo "post" e armazenando o retorno dessa requisição na constante "response".

            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newUser)); //O "objectContaining()" serve para não precisarmos realizar o match do ID, pois ele será variável.
        });

        it('deve lançar um erro com código 422 quando existir um erro de validação.', async () => {
            const newUser = {
                email: 'john@mail.com',
                password: '1234',
            };

            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.',
            });
        });

        it('deve retornar o status 409 quando o email do usuário já existir', async () => {

            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234'
            };

            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'User validation failed: email: já existe no banco de dados!'
            });
        });
    });
});