import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsResolver } from './resolvers/enrollments.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment]), StudentsModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsResolver],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
