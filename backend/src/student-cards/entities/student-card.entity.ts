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

  @ManyToOne(() => User, (user) => user.studentCards)
  user: User;
}
