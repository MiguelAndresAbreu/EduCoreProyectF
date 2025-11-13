import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SubjectsModule } from '../subjects/subjects.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), SubjectsModule, TeachersModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
