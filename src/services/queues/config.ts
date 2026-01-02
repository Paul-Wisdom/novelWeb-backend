import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "../../config";
import IORedis from 'ioredis'

// console.log(REDIS_HOST, REDIS_PORT)
const redisConnection = new IORedis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
})

export default redisConnection