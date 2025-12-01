import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TransactionStatus, TransactionType } from "../utils/types";

@Entity('transaction')
export class Transaction{
    @PrimaryGeneratedColumn('uuid')
    transactionId: string;

    @Column({nullable: false})
    userEmail: string

    @Column({default: TransactionStatus.ONGOING, nullable: false})
    status: TransactionStatus

    @Column({nullable: false})
    type: TransactionType

    @CreateDateColumn({type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    date: Date

    @Column({nullable: false})
    points: number

    @CreateDateColumn({type: 'timestamptz', nullable: true})
    paidAt: Date
}