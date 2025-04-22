import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class StudentCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullNameNS: string;

  @Column()
  studentCode: string;

  @Column()
  email: string;

  @Column()
  cardCode: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column()
  createdBy: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => User, (user) => user.studentCards)
  user: User;
  cardNumber: string;
}
