import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { CoursesModule } from '../courses/courses.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), CoursesModule, StudentsModule, TeachersModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
