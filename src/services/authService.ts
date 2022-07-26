import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import config from 'config';
import {User} from "@src/models/user";

/**
 * Esse módulo conterá os métodos necessários para a realização de tarefas
 * relacionadas à autenticação do usuário.
 */

/**
 * Não serão realizados testes unitários nos métodos relacionados ao BCrypt pois
 * os métodos são muitos simples, e isso seria a mesma coisa de testarmos a própria
 * biblioteca do BCrypt. Os testes end-to-end farão a cobertura desses métodos de
 * encriptação.
 */

/**
 * Essa interface representará o usuário que será decodado, ou seja, que
 * será extraído do Token JWT.
 */

export interface DecodedUser extends Omit<User, '_id'> {
    id: string;
}

export default class AuthService {
    /**
     * Esse método receberá a senha do usuário e fará a encriptação dessa
     * senha através do BCrypt.
     */
    public static hashPassword(password: string, salt = 10): Promise<string> {

        return bcrypt.hash(password, salt);
    }

    /**
     * Esse método receberá uma senha do usuário e a senha desse usuário, hasheada, que está
     * em nosso banco de dados e fará a comparação dos dois hashes. Se eles forem iguais, as
     * senhas serão iguais e o usuário poderá logar na aplicação.
     */
    public static async comparePasswords(originalPassword: string, hashedPassword: string): Promise<boolean> {

        return await bcrypt.compare(originalPassword, hashedPassword);
    }


    /**
     * Esse método será responsável por gerar o token JWT.
     */
    public static generateToken(payload: object): string{

        return jwt.sign(payload, config.get('App.auth.key'), { //Estamos gerando e retornando o token JWT.
            expiresIn: config.get('App.auth.tokenExpiresIn'),
        });
    }

    public static decodeToken(token: string): DecodedUser {
        return jwt.verify(token, config.get('App.auth.key')) as DecodedUser //Estamos forçando o casting de "string" para "DecodedUser".
    }
}

