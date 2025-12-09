import { graphqlRequest } from './graphqlClient';

const PROFILE_FIELDS = `
  id
  username
  email
  role
  isActive
  person {
    id
    firstName
    lastName
    email
    phone
    address
    birthDate
    avatar
  }
  teacher {
    id
    hireDate
    subjects
    person {
      id
      firstName
      lastName
      email
      phone
    }
  }
  courses {
    id
    name
    schedule
    capacity
    room
    subject {
      id
      name
      code
      description
    }
    teacher {
      id
      person {
        id
        firstName
        lastName
      }
    }
    enrollments {
      id
      status
      enrolledAt
      student {
        id
        person {
          id
          firstName
          lastName
        }
      }
    }
  }
  student {
    id
    enrollmentDate
    status
    gradeLevel
    person {
      id
      firstName
      lastName
      email
      phone
      address
      birthDate
      avatar
    }
  }
  enrollments {
    id
    status
    enrolledAt
    course {
      id
      name
      schedule
      subject {
        id
        name
      }
    }
  }
  grades {
    id
    type
    value
    date
    course {
      id
      name
      subject {
        id
        name
      }
    }
    student {
      id
      person {
        id
        firstName
        lastName
      }
    }
  }
`;

export async function login(identifier, password) {
  const data = await graphqlRequest(
    `mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user {
          ${PROFILE_FIELDS}
        }
      }
    }`,
    { input: { identifier, password } },
  );
  return data.login;
}

export async function register(input) {
  const data = await graphqlRequest(
    `mutation Register($input: RegisterInput!) {
      register(input: $input) {
        accessToken
        user {
          ${PROFILE_FIELDS}
        }
      }
    }`,
    { input },
  );
  return data.register;
}

export async function fetchProfile() {
  const data = await graphqlRequest(
    `query Me {
      me {
        ${PROFILE_FIELDS}
      }
    }`,
  );
  return data.me;
}

export async function updateProfile(userId, personId, personInput, userInput) {
  const data = await graphqlRequest(
    `mutation UpdateProfile($userId: Int!, $personId: Int!, $input: UpdateProfileInput!) {
      updateProfile(userId: $userId, personId: $personId, input: $input) {
        ${PROFILE_FIELDS}
      }
    }`,
    {
      userId,
      personId,
      input: {
        person: personInput,
        ...(userInput ? { user: userInput } : {}),
      },
    },
  );
  return data.updateProfile;
}

export async function fetchNotifications(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id)) {
    throw new Error('userId invA!lido para notificaciones');
  }
  const data = await graphqlRequest(
    `query Notifications($userId: Int!) {
      notificationsByUser(userId: $userId) {
        id
        title
        message
        type
        read
        createdAt
      }
    }`,
    { userId: id },
  );
  return data.notificationsByUser;
}

export async function markNotificationRead(id) {
  const notificationId = Number(id);
  if (!Number.isInteger(notificationId)) {
    throw new Error('id invA!lido para marcar notificaciA3n');
  }
  await graphqlRequest(
    `mutation MarkNotification($id: Int!) {
      markNotificationAsRead(id: $id) { id }
    }`,
    { id: notificationId },
  );
}

export async function markAllNotificationsRead(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id)) {
    throw new Error('userId invA!lido para marcar notificaciones');
  }
  await graphqlRequest(
    `mutation MarkAllNotifications($userId: Int!) {
      markAllNotificationsAsRead(userId: $userId) { id }
    }`,
    { userId: id },
  );
}

export async function fetchFinanceOverview() {
  const data = await graphqlRequest(
    `query FinanceOverview {
      financeOverview {
        dashboard {
          daily { income expense balance }
          weekly { income expense balance }
          monthly { income expense balance }
        }
        balance { income expense balance }
      }
    }`,
  );
  return data.financeOverview;
}

export async function createFinanceRecord(input) {
  const data = await graphqlRequest(
    `mutation CreateFinanceRecord($input: CreateFinanceRecordInput!) {
      createFinanceRecord(input: $input) {
        id
      }
    }`,
    { input },
  );
  return data.createFinanceRecord;
}

export async function fetchCourses() {
  const data = await graphqlRequest(
    `query Courses {
      courses {
        id
        name
        schedule
        capacity
        room
        subject { id name code }
        teacher { id person { firstName lastName } }
      }
    }`,
  );
  return data.courses;
}

export async function fetchIncidentsForAdmin(status) {
  const data = await graphqlRequest(
    `query Incidents($status: IncidentStatus) {
      incidents(status: $status) {
        id
        description
        date
        status
        reporter {
          id
          person { firstName lastName }
        }
        reported {
          id
          person { firstName lastName }
        }
        createdAt
      }
    }`,
    { status: status || null },
  );
  return data.incidents;
}

export async function fetchIncidentsByTeacher(teacherId) {
  const id = Number(teacherId);
  if (!Number.isInteger(id)) {
    throw new Error('teacherId invalido para incidencias por docente');
  }
  const data = await graphqlRequest(
    `query IncidentsByTeacher($teacherId: Int!) {
      incidentsByTeacher(teacherId: $teacherId) {
        id
        description
        date
        status
        reporter { id person { firstName lastName } }
        reported { id person { firstName lastName } }
      }
    }`,
    { teacherId: id },
  );
  return data.incidentsByTeacher;
}

export async function fetchIncidentsByStudent(studentId) {
  const id = Number(studentId);
  if (!Number.isInteger(id)) {
    throw new Error('studentId invalido para incidencias por estudiante');
  }
  const data = await graphqlRequest(
    `query IncidentsByStudent($studentId: Int!) {
      incidentsByStudent(studentId: $studentId) {
        id
        description
        date
        status
        reporter { id person { firstName lastName } }
        reported { id person { firstName lastName } }
      }
    }`,
    { studentId: id },
  );
  return data.incidentsByStudent;
}

export async function createIncident(input) {
  const normalized = {
    ...input,
    reporterId: input.reporterId !== undefined ? Number(input.reporterId) : undefined,
    reportedId: Number(input.reportedId),
  };
  if (!Number.isInteger(normalized.reportedId)) {
    throw new Error('reportedId invalido para crear incidencia');
  }
  if (normalized.reporterId !== undefined && !Number.isInteger(normalized.reporterId)) {
    throw new Error('reporterId invalido para crear incidencia');
  }
  const data = await graphqlRequest(
    `mutation CreateIncident($input: CreateIncidentInput!) {
      createIncident(input: $input) { id }
    }`,
    { input: normalized },
  );
  return data.createIncident;
}

export async function updateIncidentStatus(id, status) {
  await graphqlRequest(
    `mutation UpdateIncident($input: UpdateIncidentStatusInput!) {
      updateIncidentStatus(input: $input) { id }
    }`,
    { input: { id, status } },
  );
}

export async function fetchPaymentsByStudent(studentId) {
  const data = await graphqlRequest(
    `query PaymentsByStudent($studentId: Int!) {
      paymentsByStudent(studentId: $studentId) {
        payments {
          id
          amount
          concept
          paymentDate
          method
          status
        }
        accountStatus {
          paid
          pending
          balance
        }
      }
    }`,
    { studentId },
  );
  return data.paymentsByStudent;
}

export async function createPayment(input) {
  const data = await graphqlRequest(
    `mutation CreatePayment($input: CreatePaymentInput!) {
      createPayment(input: $input) { id }
    }`,
    { input },
  );
  return data.createPayment;
}

export async function fetchCourse(courseId) {
  const id = Number(courseId);
  if (!Number.isInteger(id)) {
    throw new Error('courseId invalido para consultar curso');
  }
  const data = await graphqlRequest(
    `query Course($id: Int!) {
      course(id: $id) {
        id
        name
        schedule
        capacity
        room
        subject { id name code }
        teacher {
          id
          person { firstName lastName }
        }
        enrollments {
          id
          status
          student {
            id
            person { firstName lastName }
          }
        }
      }
    }`,
    { id },
  );
  return data.course;
}

export async function createCourse(input) {
  const normalized = {
    ...input,
    subjectId: Number(input.subjectId),
    teacherId: Number(input.teacherId),
    capacity: input.capacity !== undefined ? Number(input.capacity) : undefined,
  };
  const data = await graphqlRequest(
    `mutation CreateCourse($input: CreateCourseInput!) {
      createCourse(input: $input) {
        id
        name
        schedule
        capacity
        room
        subject { id name code }
        teacher { id person { firstName lastName } }
        enrollments {
          id
          status
          student { id person { firstName lastName } }
        }
      }
    }`,
    { input: normalized },
  );
  return data.createCourse;
}

export async function updateCourse(id, input) {
  const courseId = Number(id);
  const normalized = {
    ...input,
    subjectId: input.subjectId !== undefined ? Number(input.subjectId) : undefined,
    teacherId: input.teacherId !== undefined ? Number(input.teacherId) : undefined,
    capacity: input.capacity !== undefined ? Number(input.capacity) : undefined,
  };
  const data = await graphqlRequest(
    `mutation UpdateCourse($id: Int!, $input: UpdateCourseInput!) {
      updateCourse(id: $id, input: $input) {
        id
        name
        schedule
        capacity
        room
        subject { id name code }
        teacher { id person { firstName lastName } }
        enrollments {
          id
          status
          student { id person { firstName lastName } }
        }
      }
    }`,
    { id: courseId, input: normalized },
  );
  return data.updateCourse;
}

export async function removeCourse(id) {
  const courseId = Number(id);
  await graphqlRequest(
    `mutation RemoveCourse($id: Int!) {
      removeCourse(id: $id)
    }`,
    { id: courseId },
  );
}

export async function fetchSubjects() {
  const data = await graphqlRequest(
    `query Subjects {
      subjects {
        id
        name
        code
        description
      }
    }`,
  );
  return data.subjects;
}

export async function fetchTeachers() {
  const data = await graphqlRequest(
    `query Teachers {
      teachers {
        id
        person { firstName lastName email }
      }
    }`,
  );
  return data.teachers;
}

export async function fetchStudents() {
  const data = await graphqlRequest(
    `query Students {
      students {
        id
        status
        gradeLevel
        person { firstName lastName email }
      }
    }`,
  );
  return data.students;
}

export async function enrollStudent(courseId, studentId) {
  const data = await graphqlRequest(
    `mutation EnrollStudent($input: CreateEnrollmentInput!) {
      createEnrollment(input: $input) {
        id
        status
        student { id person { firstName lastName } }
      }
    }`,
    {
      input: {
        courseId: Number(courseId),
        studentId: Number(studentId),
      },
    },
  );
  return data.createEnrollment;
}

export async function removeEnrollment(enrollmentId) {
  const id = Number(enrollmentId);
  await graphqlRequest(
    `mutation RemoveEnrollment($id: Int!) {
      removeEnrollment(id: $id)
    }`,
    { id },
  );
}

export async function fetchGradesByCourse(courseId) {
  const id = Number(courseId);
  if (!Number.isInteger(id)) {
    throw new Error('courseId invalido para calificaciones por curso');
  }
  const data = await graphqlRequest(
    `query GradesByCourse($courseId: Int!) {
      gradesByCourse(courseId: $courseId) {
        id
        type
        value
        date
        student {
          id
          person { firstName lastName }
        }
      }
    }`,
    { courseId: id },
  );
  return data.gradesByCourse;
}

export async function fetchGradesByStudent(studentId) {
  const id = Number(studentId);
  const data = await graphqlRequest(
    `query GradesByStudent($studentId: Int!) {
      gradesByStudent(studentId: $studentId) {
        id
        type
        value
        date
        course { id name subject { name } }
      }
    }`,
    { studentId: id },
  );
  return data.gradesByStudent;
}

export async function createGrade(input) {
  const normalized = {
    ...input,
    courseId: Number(input.courseId),
    studentId: Number(input.studentId),
    teacherId: input.teacherId !== undefined ? Number(input.teacherId) : undefined,
  };
  if (!Number.isInteger(normalized.courseId) || !Number.isInteger(normalized.studentId)) {
    throw new Error('courseId o studentId invA!lido al crear calificaciA3n');
  }
  if (normalized.teacherId !== undefined && !Number.isInteger(normalized.teacherId)) {
    throw new Error('teacherId invA!lido al crear calificaciA3n');
  }
  const data = await graphqlRequest(
    `mutation CreateGrade($input: CreateGradeInput!) {
      createGrade(input: $input) { id }
    }`,
    { input: normalized },
  );
  return data.createGrade;
}

export async function fetchAttendanceByCourse(courseId, date) {
  const id = Number(courseId);
  if (!Number.isInteger(id)) {
    throw new Error('courseId invA!lido para asistencia por curso');
  }
  const data = await graphqlRequest(
    `query AttendanceByCourse($courseId: Int!, $date: String) {
      attendanceByCourse(courseId: $courseId, date: $date) {
        records {
          id
          date
          status
          student { id person { firstName lastName } }
        }
        summary {
          total
          present
          absent
          late
          attendanceRate
        }
      }
    }`,
    { courseId: id, date: date || null },
  );
  return data.attendanceByCourse;
}

export async function fetchAttendanceByStudent(studentId) {
  const id = Number(studentId);
  if (!Number.isInteger(id)) {
    throw new Error('studentId invA!lido para asistencia de estudiante');
  }
  const data = await graphqlRequest(
    `query AttendanceByStudent($studentId: Int!) {
      attendanceByStudent(studentId: $studentId) {
        records {
          id
          date
          status
          course { id name }
        }
        summary {
          total
          present
          absent
          late
          attendanceRate
        }
      }
    }`,
    { studentId: id },
  );
  return data.attendanceByStudent;
}

export async function recordAttendance(input) {
  const normalized = {
    ...input,
    courseId: Number(input.courseId),
    studentId: Number(input.studentId),
    teacherId: input.teacherId !== undefined ? Number(input.teacherId) : undefined,
  };
  if (!Number.isInteger(normalized.courseId) || !Number.isInteger(normalized.studentId)) {
    throw new Error('courseId o studentId invA!lido para registrar asistencia');
  }
  if (normalized.teacherId !== undefined && !Number.isInteger(normalized.teacherId)) {
    throw new Error('teacherId invA!lido para registrar asistencia');
  }
  const data = await graphqlRequest(
    `mutation RecordAttendance($input: RecordAttendanceInput!) {
      recordAttendance(input: $input) { id }
    }`,
    { input: normalized },
  );
  return data.recordAttendance;
}

export async function fetchPerformanceReport(studentId) {
  const data = await graphqlRequest(
    `query Performance($studentId: Int!) {
      studentPerformance(studentId: $studentId) {
        averageGrade
        attendanceRate
        financialStatus { paid pending balance }
        attendance { total present absent late attendanceRate }
        grades {
          id
          type
          value
          date
          course { id name }
        }
        payments {
          id
          amount
          concept
          paymentDate
          status
        }
      }
    }`,
    { studentId },
  );
  return data.studentPerformance;
}

export async function fetchReports(params) {
  const baseFilters = {
    courseId: params.courseId ? Number(params.courseId) : null,
    studentId: params.studentId ? Number(params.studentId) : null,
    startDate: params.startDate || null,
    endDate: params.endDate || null,
  };

  const [attendance, grades, payments] = await Promise.all([
    graphqlRequest(
      `query AttendanceReport($courseId: Int, $studentId: Int, $teacherId: Int, $startDate: String, $endDate: String) {
        attendanceReport(courseId: $courseId, studentId: $studentId, teacherId: $teacherId, startDate: $startDate, endDate: $endDate) {
          records { id }
          summary { total present absent late attendanceRate }
        }
      }`,
      { ...baseFilters, teacherId: params.teacherId ? Number(params.teacherId) : null },
    ),
    graphqlRequest(
      `query GradesReport($courseId: Int, $studentId: Int, $startDate: String, $endDate: String) {
        gradesReport(courseId: $courseId, studentId: $studentId, startDate: $startDate, endDate: $endDate) {
          data { id }
          average
          averagesByStudent { studentId average }
        }
      }`,
      baseFilters,
    ),
    graphqlRequest(
      `query PaymentsReport($studentId: Int, $startDate: String, $endDate: String) {
        paymentsReport(studentId: $studentId, startDate: $startDate, endDate: $endDate) {
          payments { id }
          totals { paid pending balance }
        }
      }`,
      baseFilters,
    ),
  ]);

  return {
    attendance: attendance.attendanceReport,
    grades: grades.gradesReport,
    payments: payments.paymentsReport,
  };
}
