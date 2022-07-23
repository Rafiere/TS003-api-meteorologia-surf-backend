import mongoose, {Document, Model} from "mongoose";
import AuthService from "@src/services/authService";

export interface User {

    _id?: string;
    name: string;
    email: string;
    password: string;
}

export enum CUSTOM_VALIDATION {
    DUPLICATED = 'DUPLICATED'
}

interface UserModel extends Omit<User, '_id'>, Document { //Estamos reaproveitando os atributos da interface "User", exceto o atributo "id".

}

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true, //Será verificado se o email já está cadastrado no banco de dados. Se ele já estiver cadastrado, esse email não será criado.
        },
        password: {type: String, required: true}
    },
    {
        toJSON: { //Esse método remove o "_id" e o "__v", transformando o JSON que veio do banco no objeto que será utilizado na aplicação.
            transform: (_, ret): void => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

/**
 * Esse método fará uma busca no banco de dados para verificar se o email que está
 * sendo recebido como argumento já está cadastrado no banco de dados.
 */

schema.path('email').validate(async (email: string) => { //Criando uma validação customizada para verificar se o email já existe no banco de dados.
   const emailCount = await mongoose.models.User.countDocuments({email});
   return !emailCount; //Se tiver mais do que zero emails já cadastrados no banco, será retornado que esse email já existe no banco de dados.
}, 'já existe no banco de dados!', CUSTOM_VALIDATION.DUPLICATED); //Criamos um tipo personalizado para esse erro e estamos utilizando esse tipo personalizado.

schema.pre<UserModel>('save', async function(): Promise<void>{ //Estamos utilizando o "function" ao invés do "()" para utilizarmos o "this" no contexto de dentro da função, e não no contexto do módulo inteiro.
   if(!this.password || !this.isModified('password')){ //Se o password está definido e ele realmente foi alterado, ou seja, foi encriptado, nenhuma ação será realizada.
       return;
   }

   try {
       this.password = await AuthService.hashPassword(this.password);
   }catch(err){
       console.error(`Error hashing the password for the user ${this.name}`);
   }
});

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);

