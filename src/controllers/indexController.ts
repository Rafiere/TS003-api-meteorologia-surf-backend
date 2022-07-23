/**
 * Essa classe será uma classe abstrata para abstrair as validações que
 * estão sendo inseridas em vários controllers, de forma repetida, apenas
 * nesse controller.
 */
import {Request, Response} from "express";
import mongoose from "mongoose";
import {CUSTOM_VALIDATION} from "@src/models/user";

export abstract class BaseController {

    protected sendCreateUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError | Error): void { //Apenas quem herdar do controller base poderá utilizar esse método, pois ele possui o modificador de visibilidade "protected".

        if(error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error);
            res.status(clientErrors.code).send({code: clientErrors.code, error: clientErrors.error })
        }else{
            res.status(500).send({code: 500, error: 'Something went wrong!'});
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): {code: number; error: string} {
        const duplicatedKindErrors = Object.values(error.errors).filter((err) => err.kind === CUSTOM_VALIDATION.DUPLICATED);

        if(duplicatedKindErrors.length){
            return {code: 409, error: error.message};
        }else{
            return {code: 422, error: error.message};
        }
    }
}