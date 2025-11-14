import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesService } from './courses.service';
import { SubjectsModule } from '../subjects/subjects.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesResolver } from './resolvers/courses.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), SubjectsModule, TeachersModule],
  controllers: [],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}
