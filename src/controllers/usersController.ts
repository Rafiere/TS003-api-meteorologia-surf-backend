import {Request, Response} from "express";
import {Controller, Post} from "@overnightjs/core";
import {User} from "@src/models/user";
import {BaseController} from "@src/controllers/indexController";
import AuthService from "@src/services/authService";

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
                this.sendCreateUpdateErrorResponse(res, error);
            }
        }
    }

    @Post('authenticate')
    public async authenticate(req: Request, res: Response): Promise<Response> {

        const user = await User.findOne({email: req.body.email}); //Estamos buscando o usuário pelo email.
        if(!user){ //Se nenhum usuário for retornado do banco de dados, esse bloco de código será executado.
            return res.status(401).send({
                code: 401,
                error: 'User not found!'
            });
        }

        if(!(await AuthService.comparePasswords(req.body.password, user.password))){
            return res.status(401).send({
                code: 401,
                error: 'Password does not match!'
            });
        }

        const token = AuthService.generateToken(user.toJSON()); //Estamos transformando o usuário obtido do banco de dados em um JSON para gerarmos o token.

        return res.status(200).send({... user.toJSON(), ...{token}});
    }
}