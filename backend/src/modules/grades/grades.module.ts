import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Grade]), CoursesModule, StudentsModule, UsersModule],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
