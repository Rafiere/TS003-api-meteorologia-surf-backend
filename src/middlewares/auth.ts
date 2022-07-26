/**
 * Um middleware
 */
import {NextFunction, Request, Response} from "express";
import AuthService from "@src/services/authService";

/**
 * Esse middleware receberá um token e deverá decodar esse determinado
 * token. Após isso, ele chamará o próximo middleware, que está no parâmetro
 * "next".
 *
 * Estamos utilizando o "Partial" no request pois queremos apenas inserir o "DecodedUser" nesse
 * campo, assim, todos os outros campos dessa requisição não serão obrigatórios.
 */

export function authMiddleware(req: Partial<Request>, res: Partial<Response>, next: NextFunction): void {

    //Estamos utilizando o "?." para verificarmos se o "headers" existe, já que estamos utilizando o
    //"Partial" na request, e, dessa forma, o atributo "headers" não é mais obrigatório.

    const token = req.headers?.['x-access-token']; //Estamos obtendo o token da requisição.

    try {
         //Estamos decodando o token e obtendo o usuário desse token.
        req.decoded = AuthService.decodeToken(token as string);
        next();
    } catch(err){
        if(err instanceof Error){
            res.status?.(401).send({code: 401, error: err.message})
        }
    }
}