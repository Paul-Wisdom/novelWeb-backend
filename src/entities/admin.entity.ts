import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('admin')
export class Admin{
    @PrimaryGeneratedColumn('uuid')
    adminId: string

    @Column()
    email: string

    @Column()
    username: string;

    @Column()
    password: string
}