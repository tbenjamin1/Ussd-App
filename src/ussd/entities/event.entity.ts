import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "events", synchronize: false })
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
  @Column()
  slug: string;
  @Column()
  organiser: string;
  @Column()
  location: string;
  @Column()
  country: string;
  @Column()
  longitude: string;
  @Column()
  latitude: string;
  @Column()
  pre_sell: boolean;
  @Column()
  description: string;
  @Column()
  currency_symbol: string;
  @Column()
  date: Date;
  @Column()
  status: number;
  @Column()
  phoneNumber: string;
  @Column()
  ishema_percent: number;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
