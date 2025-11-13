import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity({ name: 'teachers' })
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Person, (person) => person.teacher, { eager: true })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @OneToOne(() => User, (user) => user.teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'hire_date', nullable: true })
  hireDate?: string;

  @Column({ type: 'simple-array', nullable: true })
  subjects?: string[];

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];
}
