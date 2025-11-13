import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly usersService: UsersService,
  ) {}

  async registerAttendance(
    createAttendanceDto: CreateAttendanceDto,
    recordedByUserId: number,
  ) {
    const course = await this.coursesService.findOne(createAttendanceDto.courseId);
    const student = await this.studentsService.findOne(createAttendanceDto.studentId);
    const recordedBy = await this.usersService.findById(recordedByUserId);

    const existing = await this.attendanceRepository.findOne({
      where: {
        course: { id: course.id },
        student: { id: student.id },
        date: createAttendanceDto.date,
      },
    });

    if (existing) {
      throw new BadRequestException('La asistencia ya fue registrada para esta fecha');
    }

    const attendance = this.attendanceRepository.create({
      course,
      student,
      date: createAttendanceDto.date,
      status: createAttendanceDto.status,
      recordedBy,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findByCourse(courseId: number, date?: string) {
    const course = await this.coursesService.findOne(courseId);
    const where: any = { course: { id: course.id } };
    if (date) {
      where.date = date;
    }
    return this.attendanceRepository.find({
      where,
      relations: ['student', 'student.person', 'recordedBy'],
      order: { date: 'DESC' },
    });
  }
}
