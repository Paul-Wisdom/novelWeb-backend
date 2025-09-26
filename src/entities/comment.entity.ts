import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
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

    @Column({nullable: false})
    @ManyToOne(() => Book, book => book.comments)
    book: Relation<Book>

    @Column({nullable: false})
    @ManyToOne(() => User, user => user.comments)
    user: Relation<User>

    @Column({default: Date.now()})
    dateModified: Date

    @Column({default: []})
    @OneToMany(() => Reply, reply => reply.comment)
    replies: Relation<Reply[]>
}

@Entity('reply')
export class Reply{
    @PrimaryGeneratedColumn('uuid')
    replyId: string

    @Column({nullable: false})
    @ManyToOne(() => Comment, comment => comment.replies)
    comment: Relation<Comment>

    @Column({nullable: false})
    @ManyToOne(() => User, user => user.replies)
    user: Relation<User> 

    @Column({nullable: false})
    content: string

    @Column({default: Date.now()})
    date: Date
}