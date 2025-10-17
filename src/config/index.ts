import * as dotenv from "dotenv"
dotenv.configDotenv()

export const env = process.env.NODE_ENV
export const DB = process.env.DB
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT
export const JWT_SECRET = process.env.JWT_SECRET as string
export const PASSWORD_HASH_SALT = process.env.PASSWORD_HASH_SALT as string
export const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL
export const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD
export const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET
export const CLOUD_KEY = process.env.CLOUD_KEY
export const CLOUD_NAME = process.env.CLOUD_NAME