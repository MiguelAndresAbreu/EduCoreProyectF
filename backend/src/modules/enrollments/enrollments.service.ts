import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentInput } from './inputs/create-enrollment.input';
import { StudentsService } from '../students/students.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(createEnrollmentInput: CreateEnrollmentInput) {
    const student = await this.studentsService.findOne(createEnrollmentInput.studentId);
    const course = await this.coursesService.findOne(createEnrollmentInput.courseId);

    const activeEnrollments = await this.enrollmentRepository.count({
      where: { course: { id: course.id }, status: 'ACTIVE' },
    });

    if (activeEnrollments >= course.capacity) {
      throw new BadRequestException('El curso ha alcanzado su cupo máximo');
    }

    const existing = await this.enrollmentRepository.findOne({
      where: { student: { id: student.id }, course: { id: course.id } },
    });

    if (existing) {
      throw new BadRequestException('El estudiante ya está inscrito en el curso');
    }

    const enrollment = this.enrollmentRepository.create({
      student,
      course,
      status: createEnrollmentInput.status ?? 'ACTIVE',
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async findByStudentId(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    return this.enrollmentRepository.find({
      where: { student: { id: student.id } },
      relations: ['course', 'course.subject', 'course.teacher', 'course.teacher.person'],
    });
  }

  async findStudentsByCourse(courseId: number) {
    const course = await this.coursesService.findOne(courseId);
    const enrollments = await this.enrollmentRepository.find({
      where: { course: { id: course.id } },
      relations: ['student', 'student.person'],
    });
    return enrollments.map((enrollment) => enrollment.student);
  }

  async remove(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada');
    }
    await this.enrollmentRepository.delete(id);
  }
}
