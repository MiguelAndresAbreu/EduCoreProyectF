import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { AttendanceResolver } from './resolvers/attendance.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), CoursesModule, StudentsModule, TeachersModule],
  controllers: [],
  providers: [AttendanceService, AttendanceResolver],
  exports: [AttendanceService],
})
export class AttendanceModule {}
