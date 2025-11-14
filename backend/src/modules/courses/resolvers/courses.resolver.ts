import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { CourseModel } from '../models/course.model';
import { CreateCourseInput } from '../inputs/create-course.input';
import { UpdateCourseInput } from '../inputs/update-course.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => CourseModel)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [CourseModel])
  async courses(): Promise<CourseModel[]> {
    const courses = await this.coursesService.findAll();
    return courses
      .map((course) => CourseModel.fromEntity(course, { includeEnrollments: false }))
      .filter(Boolean) as CourseModel[];
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Query(() => CourseModel)
  async course(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CourseModel> {
    const course = await this.coursesService.findOne(id);
    return CourseModel.fromEntity(course);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Mutation(() => CourseModel)
  async createCourse(
    @Args('input') input: CreateCourseInput,
  ): Promise<CourseModel> {
    const course = await this.coursesService.create(input);
    const created = await this.coursesService.findOne(course.id);
    return CourseModel.fromEntity(created);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Mutation(() => CourseModel)
  async updateCourse(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCourseInput,
  ): Promise<CourseModel> {
    const updated = await this.coursesService.update(id, input);
    const course = await this.coursesService.findOne(updated.id);
    return CourseModel.fromEntity(course);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async removeCourse(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.coursesService.remove(id);
    return true;
  }
}
