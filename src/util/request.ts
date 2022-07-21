import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";


/**
 * Essa classe será utilizada para desacoplarmos o nosso módulo de requisição do Axios, para
 * que, se for necessária a utilização de outra biblioteca para a realização de requisições
 * HTTP que não seja o Axios, podemos realizar as alterações apenas nessa classe, e, assim, não
 * alterarmos todos os métodos de requisições da aplicação.
 */

/*eslint-disable @typescript-eslint/no-empty-interface*/
export interface RequestConfig extends AxiosRequestConfig {}

/*eslint-disable @typescript-eslint/no-empty-interface*/
export interface Response<T = any> extends AxiosResponse<T> {}

export class Request {

    constructor(private request = axios){}

    public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
        return this.request.get<T, Response<T>>(url, config);
    }

    public static isRequestError(error: Error): boolean {
        return !!(
            (error as AxiosError).response &&
            (error as AxiosError).response?.status
        ); //Se o erro tiver os campos "response" e "response.status", isso significa que esse é um erro de request. Esse método serve para abstrairmos o "if()" que está nos try-catch() dos clientes que realizam as requisições externas.
    }

    static extractErrorData(err: unknown): Pick<AxiosResponse, 'data' | 'status'> {
        const axiosError = err as AxiosError;
        if(axiosError.response && axiosError.response.status){
            return {
                data: axiosError.response.data,
                status: axiosError.response.status,
            }
        }
        throw Error(`The error ${err} is not a Request Error`);
    }
}