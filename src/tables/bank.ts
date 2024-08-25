import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Bank {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discordId: string;

    @Column()
    balance: number;
}