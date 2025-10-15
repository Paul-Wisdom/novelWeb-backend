import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";
import { User } from "./user.entity";

@Entity('comment')
export class Comment{
    @PrimaryGeneratedColumn('uuid')
    commentId: string

    @Column({nullable: false})
    content: string

    @Column({default: false})
    edited: boolean

    @ManyToOne(() => Book, book => book.comments, {nullable: false})
    book: Relation<Book>

    @ManyToOne(() => User, user => user.comments, {nullable: false})
    user: Relation<User>

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    dateModified: Date

    @OneToMany(() => Reply, reply => reply.comment)
    replies: Relation<Reply[]>
}

@Entity('reply')
export class Reply{
    @PrimaryGeneratedColumn('uuid')
    replyId: string

    @ManyToOne(() => Comment, comment => comment.replies, {nullable: false})
    comment: Relation<Comment>

    @ManyToOne(() => User, user => user.replies, {nullable: false})
    user: Relation<User> 

    @Column({nullable: false})
    content: string

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    date: Date
}