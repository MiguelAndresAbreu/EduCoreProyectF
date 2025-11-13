import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity({ name: 'subjects' })
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  name: string;


  @Column('varchar',{ unique: true })
  code: string;

  @Column('varchar', { length: 100, nullable: true })
  description?: string;

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
