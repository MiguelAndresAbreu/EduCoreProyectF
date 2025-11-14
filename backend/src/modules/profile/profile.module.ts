import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesModule } from '../courses/courses.module';
import { GradesModule } from '../grades/grades.module';

@Module({
  imports: [
    forwardRef(() => StudentsModule),
    forwardRef(() => TeachersModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => GradesModule),
  ],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
