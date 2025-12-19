import { compare, hash } from "bcryptjs";
import { JWT_SECRET, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "../config";
import { BookSort, BookStatus, JWTPayload, Role } from "./types";
import { GraphQLError } from "graphql";
import * as jwt from 'jsonwebtoken';
import { adminRepository, mailRepository } from "../db/repositories";
import { Book } from "../entities";

export const verifyLogin = async (user: { password: string, id: string, role: Role, username: string }, loginArgs: { email: string, password: string }) => {
    const match = await compare(loginArgs.password, user.password);
    if (match) {
        const payload: jwt.JwtPayload = { id: user.id, role: user.role, username: user.username };
        const token: string = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '1h'
        });
        return token;
    }
    throw errorHandler('Invalid Email or Password','UNAUTHORIZED', loginArgs);
};

export const errorHandler = (message: string, code: string, invalidArgs?: {}) => {
    return new GraphQLError(message, {
        extensions: {
            code: code,
            invalidArgs: invalidArgs
        }
    });
};

export const superAdminCreator = async () => {
    const superAdmin = await adminRepository.findOne({where: {username: 'super'}});
    if (!superAdmin){
        const hahsedPassword = await hash(SUPERADMIN_PASSWORD as string, 7);
        await adminRepository.save(adminRepository.create({username: 'super', email: SUPERADMIN_EMAIL, password: hahsedPassword}));
        await mailRepository.save(mailRepository.create({mail: SUPERADMIN_EMAIL, verified: true, userRole: Role.ADMIN}));
    }
};

export const generatePassword = () =>{
    let value :string = '';
    for (let i = 0; i < 8; i++){
        value = value + String(Math.floor(Math.random() * 9));
    }

    return value;
};

export const sortBooks = (books: Book[], sortBy: BookSort) => {
    switch(sortBy){
        case 'completed':
            return books.filter(b => b.status === BookStatus.COMPLETED);
        case 'latest':
            return books.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
        case 'new':
            return books.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        case 'ratings':
            const bookWithRatings = books.map(b => {
                let totalRating = 0;
                let avgRating = 0
                const numOfReviews = b.reviews.length;

                if(numOfReviews !== 0) {
                    b.reviews.map(r => totalRating += r.rating);
                    avgRating = (totalRating / numOfReviews)
                }

                return {...b, avgRating}
            });
            return bookWithRatings.sort((a,b) => b.avgRating - a.avgRating)
        default:
            return books;


    }
}