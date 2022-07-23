/**
 *
 */

/**
 * Essa interface representará uma praia que estará cadastrada no sistema.
 */

export interface Beach {
    _id?: string; //Às vezes teremos um ID e as vezes não teremos, por isso que esse campo é optional.
    name: string;
    position: BeachPosition;
    lat: number;
    lng: number;
}

/**
 * Esse enum representará os pontos cardeais que a aplicação suportará.
 */

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N'
}

import mongoose, { Document, Model } from 'mongoose';

const schema = new mongoose.Schema(
    {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
        name: {type: String, required: true},
        position: {type: String, required: true},
    },
    {
        toJSON: { //Esse método é padrão do Mongoose. Ele serve para, quando buscarmos uma praia do banco de dados e transformá-lo em JSON, que o JSON será transformado da seguinte forma:
            transform: (_, ret): void => {
                ret.id = ret._id;
                delete ret._id; //Removeremos, da transformação final, os dois campos abaixo, porém, eles não serão removidos do banco de dados, apenas serão removidos quando convertermos os dados do banco no formato JSON.
                delete ret.__v;
            }
        }
    })

/**
 *
 */

interface BeachModel extends Omit<Beach, '_id'>, Document { //Na interface "Beach", o ID nem sempre estará disponível, pois ele será removido, enquanto que, na interface "Document" do Mongoose, é necessário possuir um ID, dessa forma, como estamos realizando a herança dupla e devemos realizar um merge entre os tipos "Beach" e "Document", omitiremos o campo "id" do tipo "Beach", assim, o ID se tornará obrigatório.

}

export const Beach: Model<BeachModel> = mongoose.model<BeachModel>('Beach', schema);