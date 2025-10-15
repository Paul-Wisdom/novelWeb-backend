import { Entity, PrimaryGeneratedColumn, Column, Relation, ManyToOne, OneToOne, OneToMany } from "typeorm";
import { Library } from "./library.entity";
import { PaidChapter } from "./chapter.entity";


@Entity('libraryBook')
export class LibraryBook{
    @PrimaryGeneratedColumn('uuid')
    libraryBookId: string;

    @ManyToOne(() => Library, (library) => library.libraryBooks, {nullable: false})
    library: Relation<Library>

    @Column({nullable: false})
    bookId: string

    @Column({default: 1})
    currentChapter: number

    @OneToMany(() => PaidChapter, paidChapter => paidChapter.libraryBook)
    paidChapters: Relation<PaidChapter[]>
}