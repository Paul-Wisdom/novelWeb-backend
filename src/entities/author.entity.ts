import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
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

    @Column({nullable: false, default: []})
    @OneToMany(() => Book, (book) => book.author)
    books: Relation<Book[]>

    @Column({default: Date.now()})
    joined: Date

    @Column({default: []})
    @OneToMany(() => AuthorNotification, (authorNotfification) => authorNotfification.author)
    notifications: Relation<AuthorNotification[]>
}