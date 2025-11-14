import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { RecordAttendanceInput } from './inputs/record-attendance.input';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  async registerAttendance(recordAttendanceInput: RecordAttendanceInput) {
    const course = await this.coursesService.findOne(recordAttendanceInput.courseId);
    const student = await this.studentsService.findOne(recordAttendanceInput.studentId);
    if (!recordAttendanceInput.teacherId) {
      throw new BadRequestException('Debe indicar el docente que registra la asistencia');
    }
    const teacher = await this.teachersService.findOne(recordAttendanceInput.teacherId);

    if (course.teacher.id !== teacher.id) {
      throw new BadRequestException('El docente no está asignado a este curso');
    }

    const existing = await this.attendanceRepository.findOne({
      where: {
        course: { id: course.id },
        student: { id: student.id },
        date: recordAttendanceInput.date,
      },
    });

    if (existing) {
      throw new BadRequestException('La asistencia ya fue registrada para esta fecha');
    }

    const attendance = this.attendanceRepository.create({
      course,
      student,
      teacher,
      date: recordAttendanceInput.date,
      status: recordAttendanceInput.status,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findByCourse(courseId: number, date?: string) {
    const course = await this.coursesService.findOne(courseId);
    const where: any = { course: { id: course.id } };
    if (date) {
      where.date = date;
    }
    const records = await this.attendanceRepository.find({
      where,
      relations: ['student', 'student.person', 'teacher'],
      order: { date: 'DESC' },
    });

    return {
      records,
      summary: this.getAttendanceSummary(records),
    };
  }

  async findByStudent(studentId: number, options?: { startDate?: string; endDate?: string }) {
    const student = await this.studentsService.findOne(studentId);
    const where: any = { student: { id: student.id } };

    if (options?.startDate && options?.endDate) {
      where.date = Between(options.startDate, options.endDate);
    }

    const records = await this.attendanceRepository.find({
      where,
      relations: ['course', 'course.subject', 'teacher'],
      order: { date: 'DESC' },
    });

    return {
      records,
      summary: this.getAttendanceSummary(records),
    };
  }

  async getReport(options: {
    courseId?: number;
    studentId?: number;
    teacherId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (options.courseId) {
      where.course = { id: options.courseId };
    }

    if (options.studentId) {
      where.student = { id: options.studentId };
    }

    if (options.teacherId) {
      where.teacher = { id: options.teacherId };
    }

    if (options.startDate && options.endDate) {
      where.date = Between(options.startDate, options.endDate);
    }

    const records = await this.attendanceRepository.find({
      where,
      relations: ['course', 'course.subject', 'student', 'student.person', 'teacher'],
      order: { date: 'DESC' },
    });

    return {
      records,
      summary: this.getAttendanceSummary(records),
    };
  }

  getAttendanceSummary(records: Attendance[]) {
    const total = records.length;
    const counts = records.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<AttendanceStatus, number>,
    );

    const present = counts[AttendanceStatus.PRESENT] ?? 0;
    const absent = counts[AttendanceStatus.ABSENT] ?? 0;
    const late = counts[AttendanceStatus.LATE] ?? 0;

    const attendanceRate = total ? Number(((present / total) * 100).toFixed(2)) : 0;

    return {
      total,
      present,
      absent,
      late,
      attendanceRate,
    };
  }
}
