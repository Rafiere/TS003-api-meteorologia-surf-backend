import AuthService from "@src/services/authService";
import {authMiddleware} from "@src/middlewares/auth";

describe ('AuthMiddleware', () => {

    it('Deve verificar um token JWT e chamar o próximo middleware.', () => {

        const jwtToken = AuthService.generateToken({data: 'fake'}); //Estamos criando um token fake.

        const reqFake = { //Estamos inserindo esse token no header da requisição.
            headers: {
                'x-access-token': jwtToken
            }
        }

        const resFake = {}; //Não será retornado nenhum valor.

        const nextFake = jest.fn(); //Um middleware chamará outro, dessa forma, essa função simulará a chamada para o próximo middleware.

        authMiddleware(reqFake, resFake, nextFake); //Essa é a assinatura que esperamos que o nosso middleware de autenticação tenha.

        expect(nextFake).toHaveBeenCalled();
    });

    it('deve retornar UNAUTHORIZED se existir um problema na verificação do token', () => {

        const reqFake = {
            headers: {
                'x-access-token': 'invalid token',
            },
        };

        const sendMock = jest.fn();
        const resFake = {
            status: jest.fn(() => ({
                send: sendMock,
            })),
        };

        const nextFake = jest.fn();

        authMiddleware(reqFake, resFake as object, nextFake);

        expect(resFake.status).toHaveBeenCalledWith(401);

        expect(sendMock).toHaveBeenCalledWith({
            code: 401,
            error: 'jwt malformed'
        });
    });

    it('deve retornar UNAUTHORIZED se o token não estiver presente na requisição.', () => {

        const reqFake = {
            headers: {}, //Nessa requisição, o token está vazio.
        };

        const sendMock = jest.fn();

        const resFake = {
            status: jest.fn(() => ({
                send: sendMock,
            })),
        };

        const nextFake = jest.fn();

        authMiddleware(reqFake, resFake as object, nextFake);

        expect(resFake.status).toHaveBeenCalledWith(401);

        expect(sendMock).toHaveBeenCalledWith({
            code: 401,
            error: 'jwt must be provided'
        });
    });
});