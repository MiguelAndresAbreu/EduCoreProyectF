import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
  FINANCE = 'FINANCE',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { select: false })
  password: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @OneToOne(() => Person, (person) => person.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @OneToOne(() => Student, (student) => student.user)
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher?: Teacher;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
