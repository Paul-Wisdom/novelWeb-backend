import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";
import { AuthorNotification } from "./notification.entity";

@Entity('author') 
export class Author{
    @PrimaryGeneratedColumn('uuid')
    authorId: string;

    @Column({unique: true, nullable: false})
    username: string;

    @Column({nullable: false})
    email: string;

    @Column({nullable: false})
    password: string

    @OneToMany(() => Book, (book) => book.author)
    books: Relation<Book[]>

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    joined: Date

    @OneToMany(() => AuthorNotification, (authorNotfification) => authorNotfification.author)
    notifications: Relation<AuthorNotification[]>
}