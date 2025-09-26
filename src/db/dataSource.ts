import {DataSource} from 'typeorm'
import { env, DB, DB_PASSWORD, DB_USERNAME, DB_PORT, DB_HOST } from '../config'
import path from 'path'

const syncValue : boolean  = env === 'dev' ? true : false
export const AppDataSource = new DataSource({
    type: 'postgres',
    database: DB,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT as string),
    host: DB_HOST,
    synchronize: syncValue,
    logging: true,
    entities: [path.join(__dirname, '/../**/*.entity.{js, ts}')]
})