/**
 * Esses testes verificarão o comportamento do API Error, que é o
 * módulo responsável por gerar o padrão de testes de nossa API.
 */

import ApiError from "@src/util/errors/api-error";

describe('ApiError', () => {

   it('Deve formatar um erro com os campos obrigatórios.', async () => {

      const error = ApiError.format({code: 404, message: 'User not found!'});

      expect(error).toEqual({
         message: 'User not found!',
         error: 'Not Found',
         code: 404,
      });
   });

   it('Deve formatar um erro com os campos obrigatórios e com a descrição.', async () => {

      const error = ApiError.format({
         code: 404,
         message: 'User not found!',
         description: 'This error happens when there is no user created',
      });

      expect(error).toEqual({
         message: 'User not found!',
         error: 'Not Found',
         code: 404,
         description: 'This error happens when there is no user created',
      });
   });

   it('Deve formatar um erro com os campos obrigatórios, a descrição e a documentação.', async () => {

      const error = ApiError.format({
         code: 404,
         message: 'User not found!',
         description: 'This error happens when there is no user created',
         documentation: 'https://mydocs.com/error-404'
      });

      expect(error).toEqual({
         message: 'User not found!',
         error: 'Not Found',
         code: 404,
         description: 'This error happens when there is no user created',
         documentation: 'https://mydocs.com/error-404'
      });
   });
});