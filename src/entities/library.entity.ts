import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { User } from "./user.entity";
import { LibraryBook } from "./libraryBook.entity";

@Entity('library')
export class Library{
    @PrimaryGeneratedColumn('uuid')
    libraryId: string;

    @OneToOne(() => User, user => user.library, {nullable: false})
    user: Relation<User>

    @OneToMany(() => LibraryBook, (libraryBook) => libraryBook.library)
    libraryBooks: Relation<LibraryBook[]>
}