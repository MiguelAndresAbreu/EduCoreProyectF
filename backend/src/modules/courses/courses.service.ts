import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
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
      relations: ['subject', 'teacher', 'teacher.person'],
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

  async create(createCourseDto: CreateCourseDto) {
    const subject = await this.subjectsService.findOne(createCourseDto.subjectId);
    const teacher = await this.teachersService.findOne(createCourseDto.teacherId);

    const course = this.courseRepository.create({
      name: createCourseDto.name,
      subject,
      teacher,
      schedule: createCourseDto.schedule,
      capacity: createCourseDto.capacity ?? 30,
      room: createCourseDto.room,
    });
    return this.courseRepository.save(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id);

    if (updateCourseDto.subjectId) {
      course.subject = await this.subjectsService.findOne(updateCourseDto.subjectId);
    }

    if (updateCourseDto.teacherId) {
      course.teacher = await this.teachersService.findOne(updateCourseDto.teacherId);
    }

    Object.assign(course, {
      name: updateCourseDto.name ?? course.name,
      schedule: updateCourseDto.schedule ?? course.schedule,
      capacity: updateCourseDto.capacity ?? course.capacity,
      room: updateCourseDto.room ?? course.room,
    });

    return this.courseRepository.save(course);
  }

  async remove(id: number) {
    await this.courseRepository.delete(id);
  }
}
