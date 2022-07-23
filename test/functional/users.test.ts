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

        it('deve lançar um erro com código 400 quando existir um erro de validação.', async () => {
           const newUser = {
               email: 'john@mail.com',
               password: '1234',
           };
        });
    });
});