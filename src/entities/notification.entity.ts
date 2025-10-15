import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Author } from "./author.entity";
import { NotificationStatus } from "../utils/types";

class Notification{
    @PrimaryGeneratedColumn('uuid')
    notificationId: string

    @Column({nullable: false})
    content: string

    @Column({nullable: false})
    title: string

    @Column({default: NotificationStatus.UNREAD})
    status: NotificationStatus

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    date: Date
}

@Entity('userNotification')
export class UserNotification extends Notification{
    @ManyToOne(() => User, user => user.notifications)
    user: Relation<User>
}

@Entity('authorNotification')
export class AuthorNotification extends Notification{
    @ManyToOne(() => Author, author => author.notifications)
    author: Relation<Author>
}