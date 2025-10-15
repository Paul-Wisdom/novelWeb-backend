import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('mail')
export class Mail{
 @PrimaryGeneratedColumn('identity')
 id: string

 @Column()
 mail: string
}