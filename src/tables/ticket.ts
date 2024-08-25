import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    date: number;

    @Column({ type: "varchar", nullable: true })
    channel: string;

    @Column({ type: "varchar", nullable: false })
    startingMessage: string;

    @Column({ type: "varchar", nullable: false })
    user: string;

    @Column({ type: "varchar", nullable: false })
    state: string;
    
    @Column({ type: "text", nullable: true })
    added: string;
}