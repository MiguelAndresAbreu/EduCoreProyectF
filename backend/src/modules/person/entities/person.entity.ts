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

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToOne(() => User, (user) => user.person)
  user: User;

  @OneToOne(() => Student, (student) => student.person)
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.person)
  teacher?: Teacher;
}
