/**
 * Essa classe representará os erros internos da aplicação, ou seja, os erros
 * que não serão propagados para o usuário.
 *
 * Todos os erros internos da aplicação serão derivados do "InternalError".
 */

export class InternalError extends Error {

    constructor(public message: string,
                protected code: number = 500, //Esse será o código padrão de erro, pois o "500" significa que um erro interno do servidor ocorreu.
                protected description?: string){

        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor); //Se um erro for chamado, excluiremos essa classe e exibiremos a partir de onde o erro for chamado. Basicamente, isso ajuda na legibilidade do erro.
    }
}