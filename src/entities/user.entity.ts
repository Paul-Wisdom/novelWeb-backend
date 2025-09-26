import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne } from "typeorm";
import { Review } from "./review.entity";
import { Comment, Reply } from "./comment.entity";
import { Library } from "./library.entity";
import { UserNotification } from "./notification.entity";

@Entity('user') 
export class User{
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({unique: true, nullable: false})
    username: string;

    @Column({nullable: false})
    email: string;

    @Column({nullable: false})
    password: string

    @Column({default: []})
    @OneToMany(() => Review, review => review.user)
    reviews: Relation<Review[]>

    @Column({default: []})
    @OneToMany(() => Comment, comment => comment.user)
    comments: Relation<Comment[]>

    @Column({default: []})
    @OneToMany(() => Reply, reply => reply.user)
    replies: Relation<Reply[]>

    @Column({nullable: false})
    @OneToOne(() => Library, library => library.user)
    library: Relation<Library>

    @Column({default: Date.now()})
    joined: Date

    @Column({default: []})
    @OneToMany(() => UserNotification, (userNotfification) => userNotfification.user)
    notifications: Relation<UserNotification[]>

}