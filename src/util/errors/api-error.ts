import httpStatusCodes from 'http-status-codes'

/**
 * Essa interface será o padrão para erros de API. Sempre que um erro
 * for lançado, ele deverá seguir esse padrão.
 */
export interface APIError {
    message: string;
    code: number;
    codeAsString?: string;
    description?: string;
    documentation?: string;
}

export interface APIErrorResponse extends Omit<APIError, `codeAsString`> {
    error: string;
}

export default class ApiError {
    //Esse método será responsável por receber um erro e formatá-lo
    //como necessário.
    public static format(error: APIError): APIErrorResponse {
        return {
        ... {
            message: error.message,
            code: error.code,
            error: error.codeAsString ? error.codeAsString : httpStatusCodes.getStatusText(error.code)
            },
            ... (error.documentation && {documentation: error.documentation}),
            ... (error.description && {description: error.description}),
        }
    }
}