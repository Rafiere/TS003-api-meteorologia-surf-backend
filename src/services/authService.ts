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

import bcrypt from "bcrypt";

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
}

