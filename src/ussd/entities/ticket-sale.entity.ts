import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("ticket_sales")
export class TicketSale extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @Column()
  pricing_id: number;
  @Column()
  ticket_id: number;
  @Column()
  client_names: string;
  @Column()
  client_phone: string;
  @Column()
  pre_sell: number;
  @Column()
  price: number;
  @Column()
  seller_id: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
