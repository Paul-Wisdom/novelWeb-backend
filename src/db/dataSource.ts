import {DataSource} from 'typeorm'
import { env, DB, DB_PASSWORD, DB_USERNAME, DB_PORT, DB_HOST, DB_CONNECTION_URL } from '../config'
import path from 'path'
import { Admin, Author, AuthorNote, Book, Chapter, Comment, Library, LibraryBook, PaidChapter, Reply, Review, Tag, Transaction, User } from '../entities'
import { AuthorNotification, UserNotification } from '../entities/notification.entity'
import { Mail } from '../entities/mail.entity'

console.log(DB_CONNECTION_URL)
const syncValue : boolean  = env === 'dev' ? true : false
export const AppDataSource = new DataSource({
    type: 'postgres',
    // database: DB,
    url: DB_CONNECTION_URL,
    // username: DB_USERNAME,
    // password: DB_PASSWORD,
    // port: parseInt(DB_PORT as string),
    // host: DB_HOST,
    // schema: "public",
    synchronize: syncValue,
    logging: true,
    entities: [
        Author,
        Book,
        Chapter,
        Comment,
        Library,
        LibraryBook,
        UserNotification,
        AuthorNotification,
        Review,
        User,
        Reply,
        PaidChapter,
        AuthorNote,
        Tag,
        Admin,
        Mail,
        Transaction
    ]
})