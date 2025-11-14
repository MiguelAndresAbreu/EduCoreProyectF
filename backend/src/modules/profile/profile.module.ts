import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesModule } from '../courses/courses.module';
import { GradesModule } from '../grades/grades.module';
import { PersonModule } from '../person/person.module';
import { UsersModule } from '../users/users.module';
import { ProfileResolver } from './resolvers/profile.resolver';

@Module({
  imports: [
    forwardRef(() => StudentsModule),
    forwardRef(() => TeachersModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => GradesModule),
    forwardRef(() => PersonModule),
    forwardRef(() => UsersModule),
  ],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
