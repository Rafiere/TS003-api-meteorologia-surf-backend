/**
 * Essa classe será uma classe abstrata para abstrair as validações que
 * estão sendo inseridas em vários controllers, de forma repetida, apenas
 * nesse controller.
 */
import {Request, Response} from "express";
import mongoose from "mongoose";
import {CUSTOM_VALIDATION} from "@src/models/user";
import logger from "@src/logger";
import ApiError, {APIError} from "@src/util/errors/api-error";

export abstract class BaseController {

    protected sendCreateUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError | Error): void { //Apenas quem herdar do controller base poderá utilizar esse método, pois ele possui o modificador de visibilidade "protected".

        if(error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error);
            res.status(clientErrors.code).send(ApiError.format({code: clientErrors.code, message: clientErrors.error }))
        }else{
            logger.error(error);
            res.status(500).send(ApiError.format({code: 500, message: 'Something went wrong!'}));
        }
    }

    protected sendErrorResponse(res: Response, apiError: APIError): Response {
        return res.status(apiError.code).send(ApiError.format(apiError));
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