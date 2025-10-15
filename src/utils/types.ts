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

export enum NotificationStatus{
    UNREAD,
    READ
}
export type JWTPayload = {
    id: string
    username: string
    role: Role
}

export type Context = {
    user?: User
    author?: Author
    admin?: Admin
    superAdmin?: Admin
}