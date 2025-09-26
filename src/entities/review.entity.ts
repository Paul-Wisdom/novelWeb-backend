import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";
import { User } from "./user.entity";

@Entity('review')
export class Review{
    @PrimaryGeneratedColumn('uuid')
    reviewId: string

    @Column({nullable: false})
    rating: number

    @Column({nullable: false})
    @ManyToOne(() => Book, book => book.reviews)
    book: Relation<Book>

    @Column({nullable: false})
    @ManyToOne(() => User, user => user.reviews)
    user: Relation<User>
}