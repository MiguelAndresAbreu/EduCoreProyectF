import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity({ name: 'persons' })
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'first_name' })
  firstName: string;

  @Column('varchar', { name: 'last_name' })
  lastName: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('varchar', { nullable: true })
  address?: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: string;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @OneToOne(() => User, (user) => user.person)
  user: User;

  @OneToOne(() => Student, (student) => student.person)
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.person)
  teacher?: Teacher;
}
