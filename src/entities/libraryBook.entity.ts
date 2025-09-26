import { Entity, PrimaryGeneratedColumn, Column, Relation, ManyToOne } from "typeorm";
import { Library } from "./library.entity";


@Entity('libraryBook')
export class LibraryBook{
    @PrimaryGeneratedColumn('uuid')
    libraryBookId: string;

    @Column({nullable: false})
    @ManyToOne(() => Library, (library) => library.libraryBooks)
    library: Relation<Library>

    @Column({nullable: false})
    bookId: string

    @Column({default: 1})
    currentChapter: number

    @Column({default: []})
    paidChapters: number[]
}