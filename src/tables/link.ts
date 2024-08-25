import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Link {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ign: string;

    @Column()
    discordId: string;
}