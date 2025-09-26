import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./user.entity";
import { LibraryBook } from "./libraryBook.entity";

@Entity('library')
export class Library{
    @PrimaryGeneratedColumn('uuid')
    libraryId: string;

    @Column({nullable: false})
    @OneToOne(() => User, user => user.library)
    user: Relation<User>

    @Column({default: []})
    @OneToMany(() => LibraryBook, (libraryBook) => libraryBook.library)
    libraryBooks: Relation<LibraryBook[]>
}