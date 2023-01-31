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

@Entity("ussd_request")
export class UssdRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({ nullable: true })
  text: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  data: string;

  @CreateDateColumn()
  created_at: Date;
}
