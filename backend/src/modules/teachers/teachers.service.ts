import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherInput } from './inputs/create-teacher.input';
import { UpdateTeacherInput } from './inputs/update-teacher.input';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.teacherRepository.find({ relations: ['user', 'courses'] });
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['user', 'courses', 'courses.subject'],
    });
    if (!teacher) {
      throw new NotFoundException('Docente no encontrado');
    }
    return teacher;
  }

  async findByUserId(userId: number) {
    return this.teacherRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'courses', 'courses.subject'],
    });
  }

  async create(createTeacherInput: CreateTeacherInput) {
    const user = await this.usersService.findById(createTeacherInput.userId);
    if (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('El usuario no puede ser docente');
    }

    const existingTeacher = await this.findByUserId(user.id);
    if (existingTeacher) {
      throw new BadRequestException('El docente ya existe');
    }

    const teacher = this.teacherRepository.create({
      user,
      person: user.person,
      hireDate: createTeacherInput.hireDate,
      subjects: createTeacherInput.subjects ?? [],
    });

    return this.teacherRepository.save(teacher);
  }

  async update(id: number, updateTeacherInput: UpdateTeacherInput) {
    const teacher = await this.findOne(id);
    Object.assign(teacher, updateTeacherInput);
    return this.teacherRepository.save(teacher);
  }
}
