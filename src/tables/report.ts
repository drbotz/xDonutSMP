import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    date: number;

    @Column({ type: "varchar", nullable: false })
    channel: string;

    @Column({ type: "varchar", nullable: false })
    reporter: string;

    @Column({ type: "varchar", nullable: false })
    reporterUUID: string;

    @Column({ type: "varchar", nullable: false })
    scammer: string | null;

    @Column({ type: "varchar", nullable: false })
    scammerUUID: string;

    @Column({ type: "varchar", nullable: true })
    scammerDiscord: string;

    @Column({ type: "text", nullable: false })
    description: string;

    @Column({ type: "text", nullable: false })
    proof: string;
}