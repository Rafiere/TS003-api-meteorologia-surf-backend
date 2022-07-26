import * as http from 'http';
import {DecodedUser} from "@src/services/authService";

/**
 * Como queremos que toda requisição do Express tenha o usuário, estamos
 * criando uma interface com o atributo desejado, que é o atributo
 * "decoded", que será opcional e do tipo "DecodedUser", ou seja, conterá
 * o usuário decodificado, que será obtido após a requisição passar pelo
 * middleware, assim, toda requisição poderá ter o atributo "decoded".
 */

declare module 'express-serve-static-core' {

    export interface Request extends http.IncomingMessage, Express.Request {

        decoded?: DecodedUser;
    }

}