import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { CourseModel } from '../models/course.model';
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
}
