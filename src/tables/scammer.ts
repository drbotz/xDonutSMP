import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Scammer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    date: number;

    @Column({ type: "varchar", nullable: false })
    message: string;

    @Column({ type: "varchar", nullable: false })
    messageURL: string;

    @Column({ type: "varchar", nullable: false })
    reporter: string;

    @Column({ type: "varchar", nullable: false })
    reporterUUID: string;

    @Column({ type: "varchar", nullable: false })
    scammerIGN: string;

    @Column({ type: "varchar", nullable: false })
    scammerUUID: string;

    @Column({ type: "varchar", nullable: true })
    scammerDiscord: string;

    @Column({ type: "text", nullable: false })
    description: string;

    @Column({ type: "text", nullable: false })
    proof: string;
}