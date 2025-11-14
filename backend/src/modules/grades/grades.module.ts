import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { GradesService } from './grades.service';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { GradesResolver } from './resolvers/grades.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Grade]), CoursesModule, StudentsModule, TeachersModule],
  controllers: [],
  providers: [GradesService, GradesResolver],
  exports: [GradesService],
})
export class GradesModule {}
