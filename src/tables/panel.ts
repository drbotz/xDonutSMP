import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Panel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", nullable: false })
    channelId: string;

    @Column({ type: "varchar", nullable: false })
    guildId: string;

    @Column({ type: "varchar", nullable: false })
    embed: string;

    @Column({ type: "varchar", nullable: false })
    panelMessage: string;
}