import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments.service';
import { EnrollmentModel } from '../models/enrollment.model';
import { CreateEnrollmentInput } from '../inputs/create-enrollment.input';
import { UserRole } from '../../users/entities/user.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../../students/students.service';
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {RolesGuard} from "@/common/guards/roles.guard";
import {Roles} from "@/common/decorators/roles.decorator";
import {CurrentUser} from "@/common/decorators/current-user.decorator";

@Resolver(() => EnrollmentModel)
export class EnrollmentsResolver {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly studentsService: StudentsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Mutation(() => EnrollmentModel)
  async createEnrollment(
    @Args('input') input: CreateEnrollmentInput,
  ): Promise<EnrollmentModel> {
    const enrollment = await this.enrollmentsService.create(input);
    return EnrollmentModel.fromEntity(enrollment, { includeCourse: true });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Query(() => [EnrollmentModel])
  async enrollmentsByStudent(
    @Args('studentId', { type: () => Int }) studentId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<EnrollmentModel[]> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No puedes ver inscripciones de otro estudiante');
      }
    }

    const enrollments = await this.enrollmentsService.findByStudentId(studentId);
    return enrollments.map((enrollment) =>
      EnrollmentModel.fromEntity(enrollment, { includeCourse: true }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async removeEnrollment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.enrollmentsService.remove(id);
    return true;
  }
}
