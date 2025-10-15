import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Book } from "./book.entity";
import { User } from "./user.entity";

@Entity('review')
export class Review{
    @PrimaryGeneratedColumn('uuid')
    reviewId: string

    @Column({nullable: false})
    rating: number

    @ManyToOne(() => Book, book => book.reviews, {nullable: false})
    book: Relation<Book>

    @ManyToOne(() => User, user => user.reviews, {nullable: false})
    user: Relation<User>
}