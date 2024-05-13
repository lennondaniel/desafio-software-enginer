import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('accounts')
export class Account {
    @PrimaryColumn()
    id: string;

    @Column()
    balance: number;
}