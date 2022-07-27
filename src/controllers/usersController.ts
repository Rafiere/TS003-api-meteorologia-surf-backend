import {Request, Response} from "express";
import {Controller, Get, Middleware, Post} from "@overnightjs/core";
import {User} from "@src/models/user";
import {BaseController} from "@src/controllers/indexController";
import AuthService from "@src/services/authService";
import logger from "@src/logger";
import {authMiddleware} from "@src/middlewares/auth";

@Controller('users')
export class UsersController extends BaseController {

    @Post('')
    public async create(req: Request, res: Response): Promise<void> {

        try {
            const user = new User(req.body);
            const newUser = await user.save();
            res.status(201).send(newUser);
        }catch(error){
            if(error instanceof Error){
                logger.error(error);
                this.sendCreateUpdateErrorResponse(res, error);
            }
        }
    }

    @Post('authenticate')
    public async authenticate(req: Request, res: Response): Promise<Response> {

        const user = await User.findOne({email: req.body.email}); //Estamos buscando o usuário pelo email.
        if(!user){ //Se nenhum usuário for retornado do banco de dados, esse bloco de código será executado.
            return this.sendErrorResponse(res, {
                code: 401,
                message: 'User not found!',
            });
        }

        if(!(await AuthService.comparePasswords(req.body.password, user.password))){
             return this.sendErrorResponse(res, {
                code: 401,
                message: 'Password does not match!',
            });
        }

        const token = AuthService.generateToken(user.toJSON()); //Estamos transformando o usuário obtido do banco de dados em um JSON para gerarmos o token.

        return res.status(200).send({... user.toJSON(), ...{token}});
    }

    /**
     * Esse endpoint retornará as informações do usuário que tiver o token. Ele será
     * utilizado pelo front-end para obter as informações do usuário.
     */

    @Get('me')
    @Middleware(authMiddleware)
    public async me(req: Request, res: Response): Promise<Response> {
        const email = req.decoded ? req.decoded.email : undefined; //Se o email existir, retornaremos o email, caso contrário, retornaremos "undefined'.
        const user = await User.findOne({email});

        if(!user){
            return this.sendErrorResponse(res, {
                code: 404,
                message: 'User not found!',
            });
        }
        return res.send({ user });
    }
}