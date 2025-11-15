import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../utils/types";

@Entity('mail')
export class Mail{
 @PrimaryGeneratedColumn('identity')
 id: string

 @Column()
 mail: string

 @Column({default: false})
 verified: boolean

 @Column({default: ''})
 verificationCode: string

 @Column({type: 'timestamptz', nullable: true})
 verificationCodeExpiry: Date

 @Column({default: ''})
 passwordChangeCode: string

 @Column({type: 'timestamptz', nullable: true})
 passwordCodeExpiry: Date

 @Column({default: ''})
 newPassword: string

 @Column()
 userRole: Role
}