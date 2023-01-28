import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Pricing } from "./pricing.entity";
import { Event } from "./event.entity";

@Entity("tickets")
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticket_id: string;

  @JoinColumn({ name: "event_id" })
  @ManyToOne(() => Event)
  event: Event;

  @JoinColumn({ name: "pricing_id" })
  @ManyToOne(() => Pricing)
  pricing: Pricing;

  @Column()
  sold_type: string;

  @Column()
  sold: number;

  @Column()
  user_id: number;

  @Column()
  pre_sell: boolean;

  @Column()
  phone: string;

  @Column()
  names: string;

  @Column()
  scanned_at: Date;

  @Column()
  scanned_by: string;

  @Column()
  status: number;

  @Column()
  event_id: number;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
