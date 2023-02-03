import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("ussd_airtime_request")
export class UssdAirtimeRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({ nullable: false })
  text: string;

  @Column()
  requestPhoneNumber: string;

  @Column({ nullable: false })
  receiverPhoneNumber: string;

  @Column({ nullable: false })
  amount: string;

  @CreateDateColumn()
  created_at: Date;
}
