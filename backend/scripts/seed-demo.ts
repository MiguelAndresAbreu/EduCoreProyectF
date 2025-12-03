import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { SubjectsService } from '../src/modules/subjects/subjects.service';
import { Subject } from '../src/modules/subjects/entities/subject.entity';
import { TeachersService } from '../src/modules/teachers/teachers.service';
import { StudentsService } from '../src/modules/students/students.service';
import { CoursesService } from '../src/modules/courses/courses.service';
import { EnrollmentsService } from '../src/modules/enrollments/enrollments.service';
import { AttendanceService } from '../src/modules/attendance/attendance.service';
import { AttendanceStatus } from '../src/modules/attendance/entities/attendance.entity';
import { GradesService } from '../src/modules/grades/grades.service';
import { GradeType } from '../src/modules/grades/entities/grade.entity';
import { UserRole } from '../src/modules/users/entities/user.entity';
import { Enrollment } from '../src/modules/enrollments/entities/enrollment.entity';
import { Attendance } from '../src/modules/attendance/entities/attendance.entity';

type SeedUser = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type SeedStudent = SeedUser & { gradeLevel?: string };

type SeedCourse = {
  name: string;
  subjectCode: string;
  teacherUsername: string;
  schedule: string;
  room: string;
  students: SeedStudent[];
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const subjectsService = app.get(SubjectsService);
  const teachersService = app.get(TeachersService);
  const studentsService = app.get(StudentsService);
  const coursesService = app.get(CoursesService);
  const enrollmentsService = app.get(EnrollmentsService);
  const attendanceService = app.get(AttendanceService);
  const gradesService = app.get(GradesService);
  const subjectRepo = app.get<Repository<Subject>>(getRepositoryToken(Subject));
  const enrollmentRepo = app.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
  const attendanceRepo = app.get<Repository<Attendance>>(getRepositoryToken(Attendance));

  const subjects = [
    { code: 'MAT-101', name: 'Matematicas I', description: 'Algebra basica y fundamentos' },
    { code: 'FIS-201', name: 'Fisica General', description: 'Mecanica y movimiento' },
    { code: 'HIS-301', name: 'Historia Universal', description: 'Linea de tiempo y eventos clave' },
    { code: 'LIT-401', name: 'Literatura Moderna', description: 'Narrativa y analisis de textos' },
    { code: 'CS-501', name: 'Programacion I', description: 'Algoritmos y estructuras basicas' },
  ];

  const teachers: SeedUser[] = [
    { username: 'prof-mat', email: 'prof.mat@educore.test', firstName: 'Elena', lastName: 'Suarez', password: 'Password123!' },
    { username: 'prof-fis', email: 'prof.fis@educore.test', firstName: 'Rafael', lastName: 'Mendez', password: 'Password123!' },
    { username: 'prof-his', email: 'prof.his@educore.test', firstName: 'Marina', lastName: 'Campos', password: 'Password123!' },
    { username: 'prof-lit', email: 'prof.lit@educore.test', firstName: 'Sofia', lastName: 'Lozano', password: 'Password123!' },
    { username: 'prof-cs', email: 'prof.cs@educore.test', firstName: 'Diego', lastName: 'Vargas', password: 'Password123!' },
  ];

  const courses: SeedCourse[] = [
    {
      name: 'Algebra I',
      subjectCode: 'MAT-101',
      teacherUsername: 'prof-mat',
      schedule: 'Lun-Mie 09:00-11:00',
      room: 'A101',
      students: [
        { username: 'mat-alumno1', email: 'mat.alumno1@educore.test', firstName: 'Camila', lastName: 'Torres', password: 'Password123!' },
        { username: 'mat-alumno2', email: 'mat.alumno2@educore.test', firstName: 'Luis', lastName: 'Garcia', password: 'Password123!' },
        { username: 'mat-alumno3', email: 'mat.alumno3@educore.test', firstName: 'Valeria', lastName: 'Rojas', password: 'Password123!' },
        { username: 'mat-alumno4', email: 'mat.alumno4@educore.test', firstName: 'Carlos', lastName: 'Molina', password: 'Password123!' },
        { username: 'mat-alumno5', email: 'mat.alumno5@educore.test', firstName: 'Javier', lastName: 'Acosta', password: 'Password123!' },
      ],
    },
    {
      name: 'Fisica I',
      subjectCode: 'FIS-201',
      teacherUsername: 'prof-fis',
      schedule: 'Mar-Jue 10:00-12:00',
      room: 'B202',
      students: [
        { username: 'fis-alumno1', email: 'fis.alumno1@educore.test', firstName: 'Daniela', lastName: 'Suarez', password: 'Password123!' },
        { username: 'fis-alumno2', email: 'fis.alumno2@educore.test', firstName: 'Mateo', lastName: 'Paredes', password: 'Password123!' },
        { username: 'fis-alumno3', email: 'fis.alumno3@educore.test', firstName: 'Angela', lastName: 'Silva', password: 'Password123!' },
        { username: 'fis-alumno4', email: 'fis.alumno4@educore.test', firstName: 'Andres', lastName: 'Leal', password: 'Password123!' },
        { username: 'fis-alumno5', email: 'fis.alumno5@educore.test', firstName: 'Pablo', lastName: 'Nieto', password: 'Password123!' },
      ],
    },
    {
      name: 'Historia Universal',
      subjectCode: 'HIS-301',
      teacherUsername: 'prof-his',
      schedule: 'Lun-Jue 14:00-15:30',
      room: 'C303',
      students: [
        { username: 'his-alumno1', email: 'his.alumno1@educore.test', firstName: 'Sara', lastName: 'Lopez', password: 'Password123!' },
        { username: 'his-alumno2', email: 'his.alumno2@educore.test', firstName: 'Julian', lastName: 'Castro', password: 'Password123!' },
        { username: 'his-alumno3', email: 'his.alumno3@educore.test', firstName: 'Natalia', lastName: 'Diaz', password: 'Password123!' },
        { username: 'his-alumno4', email: 'his.alumno4@educore.test', firstName: 'Felipe', lastName: 'Rincon', password: 'Password123!' },
        { username: 'his-alumno5', email: 'his.alumno5@educore.test', firstName: 'Lina', lastName: 'Vergara', password: 'Password123!' },
      ],
    },
    {
      name: 'Literatura Moderna',
      subjectCode: 'LIT-401',
      teacherUsername: 'prof-lit',
      schedule: 'Mie-Vie 11:00-12:30',
      room: 'D404',
      students: [
        { username: 'lit-alumno1', email: 'lit.alumno1@educore.test', firstName: 'Isabela', lastName: 'Rubio', password: 'Password123!' },
        { username: 'lit-alumno2', email: 'lit.alumno2@educore.test', firstName: 'Hector', lastName: 'Santos', password: 'Password123!' },
        { username: 'lit-alumno3', email: 'lit.alumno3@educore.test', firstName: 'Mariana', lastName: 'Ayala', password: 'Password123!' },
        { username: 'lit-alumno4', email: 'lit.alumno4@educore.test', firstName: 'Sebastian', lastName: 'Jaramillo', password: 'Password123!' },
        { username: 'lit-alumno5', email: 'lit.alumno5@educore.test', firstName: 'Laura', lastName: 'Martinez', password: 'Password123!' },
      ],
    },
    {
      name: 'Programacion I',
      subjectCode: 'CS-501',
      teacherUsername: 'prof-cs',
      schedule: 'Mar-Jue 08:00-10:00',
      room: 'Lab-1',
      students: [
        { username: 'cs-alumno1', email: 'cs.alumno1@educore.test', firstName: 'Oscar', lastName: 'Reyes', password: 'Password123!' },
        { username: 'cs-alumno2', email: 'cs.alumno2@educore.test', firstName: 'Elisa', lastName: 'Cortes', password: 'Password123!' },
        { username: 'cs-alumno3', email: 'cs.alumno3@educore.test', firstName: 'Bruno', lastName: 'Navarro', password: 'Password123!' },
        { username: 'cs-alumno4', email: 'cs.alumno4@educore.test', firstName: 'Irene', lastName: 'Carrillo', password: 'Password123!' },
        { username: 'cs-alumno5', email: 'cs.alumno5@educore.test', firstName: 'Gabriel', lastName: 'Mejia', password: 'Password123!' },
      ],
    },
  ];

  try {
    await ensureSubjects(subjectsService, subjectRepo, subjects);
    const teacherMap = await ensureTeachers(authService, usersService, teachersService, teachers);
    const createdCourses = await ensureCourses(coursesService, subjectsService, courses, teacherMap);
    await seedStudentsAndRecords({
      authService,
      usersService,
      studentsService,
      enrollmentsService,
      attendanceService,
      gradesService,
      enrollmentRepo,
      attendanceRepo,
      courses,
      createdCourses,
      teacherMap,
    });

    console.log('Seed finalizado con exito');
  } catch (error) {
    console.error('Error durante el seed:', error);
  } finally {
    await app.close();
  }
}

async function ensureSubjects(
  subjectsService: SubjectsService,
  subjectRepo: Repository<Subject>,
  subjects: { code: string; name: string; description?: string }[],
) {
  for (const subject of subjects) {
    const existing = await subjectRepo.findOne({ where: { code: subject.code } });
    if (existing) {
      continue;
    }
    await subjectsService.create(subject);
  }
}

async function ensureTeachers(
  authService: AuthService,
  usersService: UsersService,
  teachersService: TeachersService,
  teachers: SeedUser[],
) {
  const teacherMap = new Map<string, number>();

  for (const teacher of teachers) {
    const existingUser = await usersService.findByUsername(teacher.username);
    let userId = existingUser?.id;

    if (!existingUser) {
      const created = await authService.register({
        ...teacher,
        role: UserRole.TEACHER,
      });
      userId = created.user.id;
    }

    if (!userId) {
      throw new Error(`No se pudo crear u obtener el usuario para ${teacher.username}`);
    }

    const teacherEntity = await teachersService.findByUserId(userId);
    if (!teacherEntity) {
      throw new Error(`No se pudo obtener el docente para ${teacher.username}`);
    }
    teacherMap.set(teacher.username, teacherEntity.id);
  }

  return teacherMap;
}

async function ensureCourses(
  coursesService: CoursesService,
  subjectsService: SubjectsService,
  courses: SeedCourse[],
  teacherMap: Map<string, number>,
) {
  const createdCourses: Record<string, { id: number; teacherId: number }> = {};

  for (const course of courses) {
    const subject = await subjectsService.findAll().then((list) => list.find((s) => s.code === course.subjectCode));
    if (!subject) {
      throw new Error(`Asignatura ${course.subjectCode} no encontrada`);
    }

    const teacherId = teacherMap.get(course.teacherUsername);
    if (!teacherId) {
      throw new Error(`Docente para ${course.teacherUsername} no encontrado`);
    }

    const existing = await coursesService.findAll();
    const found = existing.find(
      (c) => c.name === course.name && c.subject.code === course.subjectCode && c.teacher.id === teacherId,
    );

    const saved =
      found ||
      (await coursesService.create({
        name: course.name,
        subjectId: subject.id,
        teacherId,
        schedule: course.schedule,
        room: course.room,
        capacity: 30,
      }));

    createdCourses[course.name] = { id: saved.id, teacherId };
  }

  return createdCourses;
}

async function seedStudentsAndRecords(params: {
  authService: AuthService;
  usersService: UsersService;
  studentsService: StudentsService;
  enrollmentsService: EnrollmentsService;
  attendanceService: AttendanceService;
  gradesService: GradesService;
  enrollmentRepo: Repository<Enrollment>;
  attendanceRepo: Repository<Attendance>;
  courses: SeedCourse[];
  createdCourses: Record<string, { id: number; teacherId: number }>;
  teacherMap: Map<string, number>;
}) {
  const {
    authService,
    usersService,
    studentsService,
    enrollmentsService,
    attendanceService,
    gradesService,
    enrollmentRepo,
    attendanceRepo,
    courses,
    createdCourses,
    teacherMap,
  } = params;

  for (const course of courses) {
    const courseInfo = createdCourses[course.name];
    if (!courseInfo) continue;

    for (const student of course.students) {
      const existingUser = await usersService.findByUsername(student.username);
      let userId = existingUser?.id;

      if (!existingUser) {
        const created = await authService.register({
          ...student,
          role: UserRole.STUDENT,
        });
        userId = created.user.id;
      }

      if (!userId) {
        throw new Error(`No se pudo crear u obtener el usuario para ${student.username}`);
      }

      const studentEntity = await studentsService.findByUserId(userId);
      if (!studentEntity) {
        throw new Error(`No se pudo obtener el estudiante para ${student.username}`);
      }

      const existingEnrollment = await enrollmentRepo.findOne({
        where: {
          student: { id: studentEntity.id },
          course: { id: courseInfo.id },
        },
      });

      if (!existingEnrollment) {
        try {
          await enrollmentsService.create({
            studentId: studentEntity.id,
            courseId: courseInfo.id,
            status: 'ACTIVE',
          });
        } catch (err) {
          console.warn(`No se pudo inscribir a ${student.username} en ${course.name}: ${(err as Error).message}`);
        }
      }

      const today = new Date();
      const date = today.toISOString().slice(0, 10);

      const attendanceExists = await attendanceRepo.findOne({
        where: {
          course: { id: courseInfo.id },
          student: { id: studentEntity.id },
          date,
        },
      });

      if (!attendanceExists) {
        try {
          await attendanceService.registerAttendance({
            courseId: courseInfo.id,
            studentId: studentEntity.id,
            teacherId: courseInfo.teacherId,
            date,
            status: AttendanceStatus.PRESENT,
          });
        } catch (err) {
          console.warn(`No se pudo registrar asistencia de ${student.username} en ${course.name}: ${(err as Error).message}`);
        }
      }

      await gradesService.create({
        courseId: courseInfo.id,
        studentId: studentEntity.id,
        teacherId: courseInfo.teacherId,
        type: GradeType.EXAM,
        value: Number((80 + Math.random() * 20).toFixed(2)),
        date,
      });
    }
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
