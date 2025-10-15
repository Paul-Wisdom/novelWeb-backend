import { compare, hash } from "bcryptjs";
import { JWT_SECRET, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "../config";
import { Admin, Author, User } from "../entities"
import { JWTPayload, Role } from "./types";
import { GraphQLError } from "graphql";
import * as jwt from 'jsonwebtoken'
import { AppDataSource } from "../db/dataSource";

export const verifyLogin = async (user: { password: string, id: string, role: Role, username: string }, loginArgs: { email: string, password: string }) => {
    const match = await compare(loginArgs.password, user.password);
    if (match) {
        const payload: jwt.JwtPayload = { id: user.id, role: user.role, username: user.username }
        const token: string = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h'
        })
        return token
    }
    throw errorHandler('Invalid Email or Password','UNAUTHORIZED', loginArgs)
}

export const errorHandler = (message: string, code: string, invalidArgs?: {}) => {
    return new GraphQLError(message, {
        extensions: {
            code: code,
            invalidArgs: invalidArgs
        }
    })
}

export const superAdminCreator = async () => {
    const adminRepository = AppDataSource.getRepository(Admin) 
    const superAdmin = await adminRepository.findOne({where: {username: 'super'}})
    if (!superAdmin){
        const hahsedPassword = await hash(SUPERADMIN_PASSWORD as string, 7)
        await adminRepository.save(adminRepository.create({username: 'super', email: SUPERADMIN_EMAIL, password: hahsedPassword}))
    }
}

export const generatePassword = () =>{
    let value :string = ''
    for (let i = 0; i < 8; i++){
        value = value + String(Math.floor(Math.random() * 9))
    }

    return value
}