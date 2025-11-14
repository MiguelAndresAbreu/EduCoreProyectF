import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeachersService } from '../teachers.service';
import { TeacherModel } from '../models/teacher.model';
import { CreateTeacherInput } from '../inputs/create-teacher.input';
import { UpdateTeacherInput } from '../inputs/update-teacher.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => TeacherModel)
export class TeachersResolver {
  constructor(private readonly teachersService: TeachersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => TeacherModel)
  async createTeacher(
    @Args('input') input: CreateTeacherInput,
  ): Promise<TeacherModel> {
    const teacher = await this.teachersService.create(input);
    const model = TeacherModel.fromEntity(teacher);
    if (!model) {
      throw new Error('No se pudo crear el docente');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Query(() => [TeacherModel])
  async teachers(): Promise<TeacherModel[]> {
    const teachers = await this.teachersService.findAll();
    return teachers
      .map((teacher) => TeacherModel.fromEntity(teacher))
      .filter((teacher): teacher is TeacherModel => !!teacher);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => TeacherModel)
  async teacher(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TeacherModel> {
    const teacher = await this.teachersService.findOne(id);
    const model = TeacherModel.fromEntity(teacher);
    if (!model) {
      throw new Error('Docente no encontrado');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => TeacherModel)
  async updateTeacher(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateTeacherInput,
  ): Promise<TeacherModel> {
    const teacher = await this.teachersService.update(id, input);
    const model = TeacherModel.fromEntity(teacher);
    if (!model) {
      throw new Error('Docente no encontrado');
    }
    return model;
  }
}
