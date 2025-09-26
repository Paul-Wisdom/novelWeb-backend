import { startStandaloneServer } from "@apollo/server/standalone";
import { env, JWT_SECRET } from "./config";
import { AppDataSource } from "./db/dataSource";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./graphQL/typedefs";
import { resolvers } from "./graphQL/resolvers";
import * as jwt from 'jsonwebtoken'
import { Context, JWTPayload, Role } from "./utils/types";
import { Author, User } from "./entities";

const userRepository = AppDataSource.getRepository(User)
const authorRepository = AppDataSource.getRepository(Author)

AppDataSource.initialize().then((res) => {
    console.log(env)
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })
    return startStandaloneServer(server, {
        listen: {
            port: 3003
        },
        context: async ({req}): Promise<Context> => {
            let returnObj: Context = {}
            const auth = req.headers.authorization
            if(auth && auth.startsWith('Bearer ')){
                const token = auth.split(' ')[1]
                console.log(token)
                const decodedToken: JWTPayload = jwt.verify(token, JWT_SECRET)
                if (decodedToken.role === Role.User){
                    const user = await userRepository.findOne({where: {userId: decodedToken.id}})
                    if (user) returnObj.user = user
                }
                else{
                    const author = await authorRepository.findOne({where: {authorId: decodedToken.id}})
                    if (author) returnObj.author = author
                }
            }
            return returnObj
        } 
        // context req parameter type as well as context type for resolvers
    })
}).then(({url}) => {
    console.log(`Server ready at ${url}`)
}).catch((e) => {
    console.log(e)
})

console.log('here')
