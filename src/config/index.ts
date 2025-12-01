import * as dotenv from "dotenv"
dotenv.configDotenv()

export const env = process.env.NODE_ENV

export const DB = process.env.DB
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT

export const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL

export const JWT_SECRET = process.env.JWT_SECRET as string
export const PASSWORD_HASH_SALT = process.env.PASSWORD_HASH_SALT as string

export const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL
export const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD

export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET
export const CLOUD_KEY = process.env.CLOUD_KEY
export const CLOUD_NAME = process.env.CLOUD_NAME

export const REDIS_HOST = process.env.REDIS_HOST as string
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string
export const REDIS_PORT = process.env.REDIS_PORT as unknown as number

export const SMTP_EMAIL = process.env.SMTP_EMAIL
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string
export const GOOGLE_AUTHORIZATION_URL = process.env.GOOGLE_AUTHORIZATION_URL as string
export const GOOGLE_OAUTH_CALLBACK_URL = process.env.GOOGLE_OAUTH_CALLBACK_URL as string

export const PAY_STACK_SECRET_KEY = process.env.PAY_STACK_SECRET_KEY
export const PAYSTACK_API_URL = process.env.PAYSTACK_API_URL
export const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL

export const POINTS_PER_CHAPTER = Number(process.env.POINTS_PER_CHAPTER as string)