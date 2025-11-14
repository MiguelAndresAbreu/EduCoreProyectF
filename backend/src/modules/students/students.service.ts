import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentInput } from './inputs/create-student.input';
import { UpdateStudentInput } from './inputs/update-student.input';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.studentRepository.find({ relations: ['user', 'person'] });
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'person'],
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return student;
  }

  async findByUserId(userId: number) {
    return this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'user',
        'person',
        'enrollments',
        'enrollments.course',
        'enrollments.course.subject',
        'enrollments.course.teacher',
        'enrollments.course.teacher.person',
        'grades',
        'payments',
      ],
    });
  }

  async create(createStudentInput: CreateStudentInput) {
    const user = await this.usersService.findById(createStudentInput.userId);
    if (user.role !== UserRole.STUDENT && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('El usuario no puede ser estudiante');
    }

    const existingStudent = await this.findByUserId(user.id);
    if (existingStudent) {
      throw new BadRequestException('El estudiante ya existe');
    }

    const student = this.studentRepository.create({
      user,
      person: user.person,
      gradeLevel: createStudentInput.gradeLevel,
      status: createStudentInput.status ?? 'ACTIVE',
    });

    return this.studentRepository.save(student);
  }

  async update(id: number, updateStudentInput: UpdateStudentInput) {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentInput);
    return this.studentRepository.save(student);
  }
}
