import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StudentsService } from '../students.service';
import { StudentModel } from '../models/student.model';
import { CreateStudentInput } from '../dto/create-student.input';
import { UpdateStudentInput } from '../dto/update-student.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => StudentModel)
export class StudentsResolver {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => StudentModel)
  async createStudent(
    @Args('input') input: CreateStudentInput,
  ): Promise<StudentModel> {
    const student = await this.studentsService.create(input);
    const model = StudentModel.fromEntity(student);
    if (!model) {
      throw new Error('No se pudo crear el estudiante');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Query(() => [StudentModel])
  async students(): Promise<StudentModel[]> {
    const students = await this.studentsService.findAll();
    return students
      .map((student) => StudentModel.fromEntity(student))
      .filter((student): student is StudentModel => !!student);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => StudentModel)
  async student(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<StudentModel> {
    const student = await this.studentsService.findOne(id);
    const model = StudentModel.fromEntity(student);
    if (!model) {
      throw new Error('Estudiante no encontrado');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => StudentModel)
  async updateStudent(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateStudentInput,
  ): Promise<StudentModel> {
    const student = await this.studentsService.update(id, input);
    const model = StudentModel.fromEntity(student);
    if (!model) {
      throw new Error('Estudiante no encontrado');
    }
    return model;
  }
}
