import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class WeeklyFee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    discordId: string;

    @Column()
    ign: string;

    @Column()
    amount: number;
}