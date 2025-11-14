import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseInput } from './inputs/create-course.input';
import { UpdateCourseInput } from './inputs/update-course.input';
import { SubjectsService } from '../subjects/subjects.service';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly subjectsService: SubjectsService,
    private readonly teachersService: TeachersService,
  ) {}

  findAll() {
    return this.courseRepository.find({
      relations: ['subject', 'teacher', 'teacher.person'],
    });
  }

  async findOne(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'subject',
        'teacher',
        'teacher.person',
        'enrollments',
        'enrollments.student',
        'enrollments.student.person',
      ],
    });
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }
    return course;
  }

  async findByTeacher(teacherId: number) {
    return this.courseRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['subject', 'teacher', 'teacher.person'],
    });
  }

  async create(createCourseInput: CreateCourseInput) {
    const subject = await this.subjectsService.findOne(createCourseInput.subjectId);
    const teacher = await this.teachersService.findOne(createCourseInput.teacherId);

    const course = this.courseRepository.create({
      name: createCourseInput.name,
      subject,
      teacher,
      schedule: createCourseInput.schedule,
      capacity: createCourseInput.capacity ?? 30,
      room: createCourseInput.room,
    });
    return this.courseRepository.save(course);
  }

  async update(id: number, updateCourseInput: UpdateCourseInput) {
    const course = await this.findOne(id);

    if (updateCourseInput.subjectId) {
      course.subject = await this.subjectsService.findOne(updateCourseInput.subjectId);
    }

    if (updateCourseInput.teacherId) {
      course.teacher = await this.teachersService.findOne(updateCourseInput.teacherId);
    }

    Object.assign(course, {
      name: updateCourseInput.name ?? course.name,
      schedule: updateCourseInput.schedule ?? course.schedule,
      capacity: updateCourseInput.capacity ?? course.capacity,
      room: updateCourseInput.room ?? course.room,
    });

    return this.courseRepository.save(course);
  }

  async remove(id: number) {
    await this.courseRepository.delete(id);
  }
}
