import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createGradeDto: CreateGradeDto, gradedByUserId: number) {
    const course = await this.coursesService.findOne(createGradeDto.courseId);
    const student = await this.studentsService.findOne(createGradeDto.studentId);
    const gradedBy = await this.usersService.findById(gradedByUserId);

    const grade = this.gradeRepository.create({
      course,
      student,
      type: createGradeDto.type,
      score: createGradeDto.score,
      maxScore: createGradeDto.maxScore,
      date: createGradeDto.date,
      gradedBy,
    });

    return this.gradeRepository.save(grade);
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    return this.gradeRepository.find({
      where: { student: { id: student.id } },
      relations: ['course', 'course.subject', 'gradedBy'],
      order: { date: 'DESC' },
    });
  }
}
