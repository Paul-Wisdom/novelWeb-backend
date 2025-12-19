import { Admin, Author, User } from "../entities"

export enum Role {
    USER,
    AUTHOR,
    ADMIN,
    SUPERADMIN
}

export enum BookStatus {
    ONGOING,
    COMPLETED,
    HIATUS,
    DROPPED
}

export enum TransactionStatus{
    SUCCESS,
    FAILED,
    ONGOING
}
export enum TransactionType{
    POINT_PURCHASE
}

export enum NotificationStatus{
    UNREAD,
    READ
}
export type JWTPayload = {
    id: string
    username: string
    role: Role
}

export interface Context{
    user?: User
    author?: Author
    admin?: Admin
    superAdmin?: Admin
}

export interface EmailQueueJobData {
    to: string
    content: string
    subject: string
}

export type BookSort = 'latest' | 'new' | 'ratings' | 'completed'
