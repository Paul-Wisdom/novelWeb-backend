import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";

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
    
    @Column({nullable: false})
    @ManyToOne(() => Book, book => book.chapters)
    book: Relation<Book>

    @Column({default: Date.now()})
    updatedAt: Date
}