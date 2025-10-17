import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Author } from "./author.entity";
import { Chapter } from "./chapter.entity";
import { Review } from "./review.entity";
import { Comment } from "./comment.entity";
import { BookStatus } from "../utils/types";

@Entity('book')
export class Book{
    @PrimaryGeneratedColumn('uuid')
    bookId: string;

    @Column({unique: true, nullable: false})
    name: string;

    @Column({nullable: false})
    summary: string

    @ManyToMany(() => Tag, tag => tag.books)
    @JoinTable()
    tags: Relation<Tag[]>

    @Column({nullable: true})
    photoUrl: string

    @ManyToOne(() => Author, (author) => author.books, {nullable: false})
    author: Relation <Author>

    @OneToMany(() => Chapter, chapter => chapter.book)
    chapters: Relation<Chapter[]>

    @OneToMany(() => Review, review => review.book)
    reviews: Relation<Review[]>

    @OneToMany(() => Comment, comment => comment.book)
    comments: Relation<Comment[]>

    @OneToMany(() => AuthorNote, authorNote => authorNote.book)
    authorNotes: Relation<AuthorNote[]>

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date

    @Column({default: BookStatus.ONGOING})
    status: BookStatus
}

@Entity('authorNote')
export class AuthorNote{
    @PrimaryGeneratedColumn('uuid')
    authorNoteId: string

    @Column({nullable: false})
    note: string

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    date: Date

    @ManyToOne(() => Book, book => book.authorNotes)
    book: Relation<Book>
}

@Entity('tag')
export class Tag{
    @PrimaryGeneratedColumn('uuid')
    tagId: string

    @Column({nullable: false})
    name: string

    @ManyToMany(() => Book, book => book.tags)
    books: Relation<Book[]>
}