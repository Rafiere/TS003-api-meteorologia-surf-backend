import {User} from "@src/models/user";
import AuthService from "@src/services/authService";

describe('Testes de integração dos usuários da aplicação.', () => {

    beforeEach(async () => { //Cada vez que os testes forem executados, todos os usuários serão limpos do banco de dados de teste.
        await User.deleteMany({});
    });

    describe('Quando criar um novo usuário', () => {

        it('Deve criar um novo usuário corretamente com a senha encriptada.', async () => {

            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };

            const response = await global.testRequest.post('/users').send(newUser); //Estamos enviando um usuário pelo "body" dessa requisição do tipo "post" e armazenando o retorno dessa requisição na constante "response".

            await expect(AuthService.comparePasswords(newUser.password, response.body.password)).resolves.toBeTruthy(); //Estamos passando a senha antes e a senha depois da encriptação. Se o método que compara os dois hashes retornar "true", isso significa que o método funcionou corretamente.
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining({
                ... newUser,
                ... {password: expect.any(String)}} //O "password" precisa ser qualquer String, assim, não precisaremos gerar um hash igual ao que foi gerado pelo BCrypt para encriptar a senha. Isso está sendo feito pois, logo acima, já verificamos se as senhas são iguais.
            )); //O "objectContaining()" serve para não precisarmos realizar o match do ID, pois ele será variável.
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
                error:'Unprocessable Entity',
                message: 'User validation failed: name: Path `name` is required.',
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
                error: 'Conflict',
                message: 'User validation failed: email: já existe no banco de dados!'
            });
        });
    });

    describe('Quando autenticar um usuário', () => {
        it('Deve gerar um token para um usuário válido.', async() => {

            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234'
            };

            await new User(newUser).save();

            const response = await global.testRequest
                .post('/users/authenticate')
                .send({email: newUser.email, password: newUser.password});

            expect(response.body).toEqual(
                expect.objectContaining({token: expect.any(String)})
            );
        });

        it('Deve retornar \"UNAUTHORIZED\" se nenhum usuário for encontrado com um determinado email.', async() => {

            const response = await global.testRequest
                .post('/users/authenticate')
                .send({email: 'some-email@mail.com', password: '1234'});

            expect(response.status).toBe(401);
        });

        it('Deve retornar \"UNAUTHORIZED\" se o usuário for encontrado mas a senha inserida não dar o match com a senha do banco de dados.', async() => {

            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234'
            };

            await new User(newUser).save();

            const response = await global.testRequest
                .post('/users/authenticate')
                .send({email: newUser.email, password: 'different password'});

            expect(response.status).toBe(401);
        });
    });

    describe('Quando conseguir as informações do usuário', () => {
        it('Deve retornar as informações do perfil do usuário.', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234'
            };

            const user = await new User(newUser).save();
            const token = AuthService.generateToken(user.toJSON());
            const { body, status } = await global.testRequest
                .get('/users/me')
                .set({ 'x-access-token': token});

            expect(status).toBe(200);
            expect(body).toMatchObject(JSON.parse(JSON.stringify({user})));
        });

        it('deve retornar \"Not Found\" quando o usuário não for encontrado.', async () => {
           const newUser = {
               name: 'John Doe',
               email: 'john@mail.com',
               password: '1234',
           };

           //Estamos criando um novo usuário mas não estamos o salvando, assim, ele não será encontrado.

            const user = new User(newUser);
            const token = AuthService.generateToken(user.toJSON());
            const { body, status } = await global.testRequest
                .get('/users/me')
                .set({ 'x-access-token': token});

            expect(status).toBe(404);
            expect(body.message).toBe('User not found!');
        });
    });
});