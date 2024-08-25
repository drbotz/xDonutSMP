import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class AhItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    stack: number;
}