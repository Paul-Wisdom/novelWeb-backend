import { compare } from "bcryptjs";
import { JWT_SECRET } from "../config";
import { Author, User } from "../entities"
import { JWTPayload, Role } from "./types";
import { GraphQLError } from "graphql";
import * as jwt from 'jsonwebtoken'

export const verifyLogin = async (user: { password: string, id: string, role: Role, username: string }, loginArgs: { email: string, password: string }) => {
    const match = await compare(loginArgs.password, user.password);
    if (match) {
        const payload: JWTPayload = { id: user.id, role: user.role, username: user.username }
        const token: string = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h'
        })
        return token
    }
    throw new GraphQLError('Invalid Email or Password', {
        extensions: {
            code: 'UNAUTHORIZED',
            invalidArgs: loginArgs
        }
    })
}

export const errorHandler = (message: string, code: string) => {
    throw new GraphQLError(message, {
        extensions: {
            code: code
        }
    })
}