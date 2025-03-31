/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmailTemplate } from '../../email-templates/entities/email-template.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  receivers: string;

  @Column()
  emailTemplateId: number;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'timestamp', nullable: true })
  plantDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  sendDate: Date;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @ManyToOne(() => EmailTemplate, (emailTemplate) => emailTemplate.transactions)
  emailTemplate: EmailTemplate;
}
