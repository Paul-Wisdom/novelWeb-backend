import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";
import { OneToOne } from "typeorm/browser";
import { LibraryBook } from "./libraryBook.entity";

@Entity('chapter')
export class Chapter{
    @PrimaryGeneratedColumn('uuid')
    chapterId: string

    @Column({nullable: false})
    title: string

    @Column({nullable: false})
    number: number

    @Column({nullable: false, default: false})
    paywall: boolean

    @Column({nullable: false})
    content: string
    
    @ManyToOne(() => Book, book => book.chapters, {nullable: false})
    book: Relation<Book>

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedAt: Date
}

@Entity('paidChapter')
export class PaidChapter{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({nullable: false})
    chapterId: string;

    @ManyToOne(() => LibraryBook, libraryBook => libraryBook.paidChapters)
    libraryBook: Relation<LibraryBook>
}