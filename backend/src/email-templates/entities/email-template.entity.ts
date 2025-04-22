import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.emailTemplates)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.emailTemplate)
  transactions: Transaction[];
}
