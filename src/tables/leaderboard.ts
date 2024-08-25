import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Leaderboard {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    message: string;

    @Column()
    channelId: string;

    @Column()
    guild: string;

    @Column()
    type: string;
}