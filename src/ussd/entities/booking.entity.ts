import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("event_bookings")
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  tickets_number: number;

  @Column()
  event_id: number;

  @Column()
  pricing_id: number;

  @Column()
  payment_mode_id: number;

  @Column()
  trans_id: string;

  @Column()
  price: number;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
