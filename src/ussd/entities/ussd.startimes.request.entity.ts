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

@Entity("ussd_startimes_request")
export class UssdStartimesRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({ nullable: false })
  text: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: false })
  cardNumber: string;

  @Column({ nullable: false })
  amount: string;

  @Column({ nullable: false })
  token: string;

  @CreateDateColumn()
  created_at: Date;
}
