import { startStandaloneServer } from "@apollo/server/standalone";
import { env, JWT_SECRET } from "./config";
import { AppDataSource } from "./db/dataSource";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./graphQL/typedefs";
import { resolvers } from "./graphQL/resolvers";
import * as jwt from 'jsonwebtoken'
import { Context, JWTPayload, Role } from "./utils/types";
import { Admin, Author, User } from "./entities";
import { errorHandler, superAdminCreator } from "./utils";

const userRepository = AppDataSource.getRepository(User)
const authorRepository = AppDataSource.getRepository(Author)
const adminRepository = AppDataSource.getRepository(Admin)

AppDataSource.initialize().then((res) => {
    console.log(env)
    return superAdminCreator()
}).then(() => {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })
    return startStandaloneServer(server, {
        listen: {
            port: 3003
        },
        context: async ({ req }): Promise<Context> => {
            let returnObj: Context = {}
            const auth = req.headers.authorization
            if (auth && auth.startsWith('Bearer ')) {
                const token = auth.split(' ')[1]
                console.log(token)
                try {
                    const decodedToken: jwt.JwtPayload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
                    if (decodedToken.role === Role.USER) {
                        const user = await userRepository.findOne({ where: { userId: decodedToken.id } })
                        if (user) returnObj.user = user
                    }
                    else if (decodedToken.role === Role.AUTHOR) {
                        const author = await authorRepository.findOne({ where: { authorId: decodedToken.id } })
                        if (author) returnObj.author = author
                    }
                    else{
                        const admin = await adminRepository.findOne({where: {adminId: decodedToken.id}})
                        if (admin && admin.username === 'super') returnObj.superAdmin = admin
                        else if (admin) returnObj.admin = admin
                    }
                } catch (e) {
                    errorHandler('Unauthorized', 'UNAUTHORIZED')
                }

            }
            return returnObj
        }
        // context req parameter type as well as context type for resolvers
    })
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
}).catch((e) => {
    console.log(e)
})

