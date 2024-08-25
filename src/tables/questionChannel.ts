import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class QuestionChannel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    channelId: string;

    @Column({ type: "varchar", nullable: false })
    guildId: string;

    @Column({ type: "text", nullable: false })
    qna: string;

    @Column({ type: "varchar", nullable: false })
    currentQuestion: string;

    @Column({ type: "varchar", nullable: false })
    questionMessage: string;

    @Column({ type: "bigint", nullable: false })
    createdAt: number;
}