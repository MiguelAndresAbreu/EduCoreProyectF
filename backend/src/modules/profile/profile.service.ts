import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { CoursesService } from '../courses/courses.service';
import { GradesService } from '../grades/grades.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
    private readonly coursesService: CoursesService,
    private readonly gradesService: GradesService,
  ) {}

  async buildProfile(user: User) {
    const profile: any = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      person: user.person,
    };

    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.id);
      profile.teacher = teacher;
      profile.courses = teacher ? await this.coursesService.findByTeacher(teacher.id) : [];
    }

    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.id);
      profile.student = student;
      profile.enrollments = student?.enrollments ?? [];
      profile.grades = student ? await this.gradesService.findByStudent(student.id) : [];
    }

    return profile;
  }

  async ensureProfile(user: User) {
    if (user.role === UserRole.STUDENT) {
      const existingStudent = await this.studentsService.findByUserId(user.id);
      if (!existingStudent) {
        await this.studentsService.create({ userId: user.id });
      }
    }

    if (user.role === UserRole.TEACHER) {
      const existingTeacher = await this.teachersService.findByUserId(user.id);
      if (!existingTeacher) {
        await this.teachersService.create({ userId: user.id });
      }
    }
  }
}
