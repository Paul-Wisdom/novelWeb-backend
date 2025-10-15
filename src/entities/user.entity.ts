import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne, CreateDateColumn, JoinColumn } from "typeorm";
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

    @OneToMany(() => Review, review => review.user)
    reviews: Relation<Review[]>

    @OneToMany(() => Comment, comment => comment.user)
    comments: Relation<Comment[]>

    @OneToMany(() => Reply, reply => reply.user)
    replies: Relation<Reply[]>

    @OneToOne(() => Library, library => library.user, {nullable: false, cascade: true})
    @JoinColumn()
    library: Relation<Library>

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    joined: Date

    @OneToMany(() => UserNotification, (userNotfification) => userNotfification.user)
    notifications: Relation<UserNotification[]>

}