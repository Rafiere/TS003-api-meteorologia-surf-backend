import {ClassMiddleware, Controller, Post} from "@overnightjs/core";
import {Request, Response} from "express";
import {Beach} from "@src/models/beach";
import mongoose from "mongoose";
import {authMiddleware} from "@src/middlewares/auth";
import logger from "@src/logger";
import {BaseController} from "@src/controllers/indexController";

@Controller('beaches')
@ClassMiddleware(authMiddleware) //Todas as rotas desse controller utilizarão esse middleware, ou seja, antes da requisição chegar na rota, ela passará por esse middleware.
export class BeachesController extends BaseController {

    @Post('')
    public async create(req: Request, res: Response): Promise<void> {

        try {

            const beach = new Beach({... req.body, ...{user: req.decoded?.id}});

            const result = await beach.save();

            res.status(201).send(result); //O .toJSON() do "result" será chamado automaticamente, que é o método que está no "beach.ts", e retirará os dois campos desse objeto antes de devolvê-lo para o usuário.

        }catch(error: unknown){
            if(error instanceof Error){
                this.sendCreateUpdateErrorResponse(res, error);
            }
        }
    }
}