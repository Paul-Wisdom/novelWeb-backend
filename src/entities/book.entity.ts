import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
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

    @Column({default: []})
    tags: string[]

    @Column({nullable: false})
    @ManyToOne(() => Author, (author) => author.books)
    author: Relation <Author>

    @Column({nullable: false, default: []})
    @OneToMany(() => Chapter, chapter => chapter.book)
    chapters: Relation<Chapter[]>

    @Column({nullable: false, default: []})
    @OneToMany(() => Review, review => review.book)
    reviews: Relation<Review[]>

    @Column({nullable: false, default: []})
    @OneToMany(() => Comment, comment => comment.book)
    comments: Relation<Comment[]>

    @Column({default: []})
    authorNotes: {
        note: string,
        date: number
    }[]

    @Column({default: Date.now()})
    createdAt: Date

    @Column({default: BookStatus.ONGOING})
    status: BookStatus
}
