import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity({ name: 'subjects' })
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
