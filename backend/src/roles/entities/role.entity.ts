import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
