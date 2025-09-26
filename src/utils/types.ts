import { Author, User } from "../entities"

export enum Role {
    User,
    Author
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
}