import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    channel: string;

    @Column({ type: "varchar", nullable: false })
    scammer: string;

    @Column({ type: "varchar", nullable: false })
    messageId: string;
}