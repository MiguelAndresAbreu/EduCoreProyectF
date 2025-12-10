import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchCourse,
  fetchAttendanceByCourse,
  fetchAttendanceByStudent,
  fetchAttendanceReport,
  recordAttendance as recordAttendanceMutation,
} from "../../api/graphqlOperations";
import { format, parse } from "date-fns";
import "./Attendance.css";

const STATUS_LABELS = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  LATE: "Tarde",
};

export default function Attendance() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseAttendance, setCourseAttendance] = useState({ records: [], summary: null });
  const [savedAttendance, setSavedAttendance] = useState({ records: [], summary: null });
  const [studentAggregates, setStudentAggregates] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({ records: [], summary: null });
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [savedDateFilter, setSavedDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [adminDate, setAdminDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [adminAttendance, setAdminAttendance] = useState({ records: [], summary: null });
  const [selectedAdminCourse, setSelectedAdminCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const studentId = user?.student?.id;

  useEffect(() => {
    if (isTeacher && Array.isArray(user?.courses)) {
      const normalizedCourses = user.courses.map((course) => ({
        ...course,
        id: Number(course.id),
      }));
      setCourseOptions(normalizedCourses);
      setSelectedCourse(normalizedCourses[0]?.id ?? null);
    }
  }, [isTeacher, user]);

  useEffect(() => {
    if (isTeacher && selectedCourse) {
      fetchCourseData(selectedCourse);
    }
  }, [isTeacher, selectedCourse, selectedDate, savedDateFilter]);

  useEffect(() => {
    if (isStudent && studentId) {
      fetchStudentAttendance(Number(studentId));
    }
  }, [isStudent, studentId]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminAttendance(adminDate);
    }
  }, [isAdmin, adminDate]);

  const buildStudentAggregates = (records) => {
    const grouped = records.reduce((acc, record) => {
      const studentId = record.student?.id;
      const statusKey = (record.status ?? "").toLowerCase();
      if (!studentId) return acc;
      if (!statusKey) return acc;
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          name: `${record.student.person?.firstName ?? ""} ${record.student.person?.lastName ?? ""}`.trim(),
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      acc[studentId][statusKey] = (acc[studentId][statusKey] ?? 0) + 1;
      acc[studentId].total += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };

  const buildCourseAggregates = (records) => {
    const grouped = records.reduce((acc, record) => {
      const courseId = record.course?.id;
      if (!courseId) return acc;
      const statusKey = (record.status ?? "").toLowerCase();
      if (!statusKey) return acc;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          name: record.course?.name ?? `Curso ${courseId}`,
          subject: record.course?.subject?.name ?? "",
          teacher: record.teacher
            ? `${record.teacher.person?.firstName ?? ""} ${record.teacher.person?.lastName ?? ""}`.trim()
            : "",
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      acc[courseId][statusKey] = (acc[courseId][statusKey] ?? 0) + 1;
      acc[courseId].total += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchCourseData = async (courseId) => {
    const id = Number(courseId);
    if (!Number.isInteger(id)) return;
    try {
      setLoading(true);
      const [courseResponse, attendanceResponse, savedResponse, historyResponse] = await Promise.all([
        fetchCourse(id),
        fetchAttendanceByCourse(id, selectedDate),
        fetchAttendanceByCourse(id, savedDateFilter || null),
        fetchAttendanceByCourse(id, null),
      ]);

      setCourseAttendance({
        records: attendanceResponse?.records ?? [],
        summary: attendanceResponse?.summary ?? null,
      });
      setSavedAttendance({
        records: savedResponse?.records ?? [],
        summary: savedResponse?.summary ?? null,
      });
      setStudentAggregates(buildStudentAggregates(historyResponse?.records ?? []));
      setCourseDetails(courseResponse);
      const initialDraft = {};
      courseResponse?.enrollments?.forEach((enrollment) => {
        initialDraft[enrollment.student.id] = "PRESENT";
      });
      setAttendanceDraft(initialDraft);
      setError("");
    } catch (err) {
      setError("No se pudo cargar la información del curso.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminAttendance = async (date) => {
    try {
      setLoading(true);
      const report = await fetchAttendanceReport({ startDate: date, endDate: date });
      setAdminAttendance({
        records: report?.records ?? [],
        summary: report?.summary ?? null,
      });
      if (report?.records?.length) {
        const firstCourse = report.records[0].course?.id ?? null;
        const hasPrevious = report.records.some((record) => record.course?.id === selectedAdminCourse);
        setSelectedAdminCourse(hasPrevious ? selectedAdminCourse : firstCourse);
      } else {
        setSelectedAdminCourse(null);
      }
      setError("");
    } catch (err) {
      setError("No se pudo cargar la asistencia para la fecha indicada.");
      setAdminAttendance({ records: [], summary: null });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async (id) => {
    try {
      setLoading(true);
      const data = await fetchAttendanceByStudent(id);
      setStudentAttendance({
        records: data?.records ?? [],
        summary: data?.summary ?? null,
      });
      setError("");
    } catch (err) {
      setError("No se pudo cargar tu historial de asistencia.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = (studentId, status) => {
    setAttendanceDraft((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRegisterAttendance = async () => {
    if (!selectedCourse || !courseDetails) return;
    setSaving(true);
    try {
      const requests = Object.entries(attendanceDraft).map(([studentId, status]) =>
        recordAttendanceMutation({
          courseId: Number(selectedCourse),
          studentId: Number(studentId),
          teacherId: Number(user.teacher.id),
          status,
          date: selectedDate,
        })
      );
      await Promise.all(requests);
      await fetchCourseData(selectedCourse);
    } catch (err) {
      setError("No se pudo registrar la asistencia. Verifica que no esté duplicada.");
    } finally {
      setSaving(false);
    }
  };

  const currentStudents = useMemo(() => {
    if (!courseDetails?.enrollments) return [];
    return courseDetails.enrollments.map((enrollment) => enrollment.student);
  }, [courseDetails]);

  const summaryCards = isTeacher ? courseAttendance.summary : studentAttendance.summary;
  const recordsToShow = isTeacher ? courseAttendance.records : studentAttendance.records;
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "-";
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return format(parsed, "dd/MM/yyyy");
  };
  const adminCourseAggregates = buildCourseAggregates(adminAttendance.records);
  const selectedAdminRecords = adminAttendance.records.filter(
    (record) => record.course?.id === selectedAdminCourse
  );

  if (isAdmin) {
    const selectedCourseInfo = adminCourseAggregates.find((c) => c.courseId === selectedAdminCourse);
    return (
      <div className="attendance-page">
        <header className="attendance-header">
          <h1>Control de asistencia</h1>
          <p>Consulta los cursos que registraron asistencia por fecha y revisa los detalles guardados.</p>
        </header>

        {error && <div className="attendance-error">{error}</div>}

        <section className="attendance-controls admin-controls">
          <div className="control-group">
            <label htmlFor="admin-date">Fecha</label>
            <input
              id="admin-date"
              type="date"
              value={adminDate}
              onChange={(event) => setAdminDate(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="attendance-submit"
            onClick={() => fetchAdminAttendance(adminDate)}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar registros"}
          </button>
        </section>

        <div className="attendance-grid admin">
          <div className="attendance-table-container">
            <div className="table-header">
              <h2>Cursos con asistencia</h2>
              {loading && <span className="loading">Cargando...</span>}
            </div>
            <table className="attendance-table compact">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {adminCourseAggregates.map((course) => (
                  <tr
                    key={course.courseId}
                    className={course.courseId === selectedAdminCourse ? "selected" : ""}
                    onClick={() => setSelectedAdminCourse(course.courseId)}
                  >
                    <td>{course.name}</td>
                    <td>{course.subject || "-"}</td>
                    <td>{course.teacher || "-"}</td>
                    <td>{course.total ?? 0}</td>
                  </tr>
                ))}
                {!loading && adminCourseAggregates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">Sin cursos con asistencia para esta fecha.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="attendance-table-container">
            <div className="table-header">
              <div>
                <h2>Asistencia guardada</h2>
                <p>{selectedCourseInfo ? `${selectedCourseInfo.name} · ${formatDisplayDate(adminDate)}` : "Selecciona un curso"}</p>
              </div>
              {loading && <span className="loading">Cargando...</span>}
            </div>
            <table className="attendance-table compact">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Docente</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {selectedAdminRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{`${record.student?.person?.firstName ?? ""} ${record.student?.person?.lastName ?? ""}`.trim()}</td>
                    <td>{STATUS_LABELS[record.status] ?? record.status}</td>
                    <td>{record.teacher ? `${record.teacher.person?.firstName ?? ""} ${record.teacher.person?.lastName ?? ""}`.trim() : "-"}</td>
                    <td>{formatDisplayDate(record.date)}</td>
                  </tr>
                ))}
                {!loading && selectedAdminRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">No hay registros para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <header className="attendance-header">
        <h1>Control de asistencia</h1>
        <p>Registra y consulta la asistencia por curso con métricas automáticas.</p>
      </header>

      {error && <div className="attendance-error">{error}</div>}

      {isTeacher && (
        <section className="attendance-controls">
          <div className="control-group">
            <label htmlFor="course">Curso</label>
            <select
              id="course"
              value={selectedCourse ?? ""}
              onChange={(event) => setSelectedCourse(Number(event.target.value))}
            >
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} • {course.subject?.name ?? "Materia"}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="date">Fecha</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="saved-date">Fecha registros guardados</label>
            <input
              id="saved-date"
              type="date"
              value={savedDateFilter}
              onChange={(event) => setSavedDateFilter(event.target.value)}
            />
          </div>
        </section>
      )}

      <div className={`attendance-grid ${isTeacher ? "teacher" : "student"}`}>
        <div className="attendance-table-container">
          <div className="table-header">
            <h2>{isTeacher ? "Registro de asistencia" : "Historial"}</h2>
            {loading && <span className="loading">Cargando...</span>}
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>{isTeacher ? "Estudiante" : "Curso"}</th>
                <th>Fecha</th>
                <th>Estado</th>
                {isTeacher && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {isTeacher && currentStudents.length > 0 && (
                currentStudents.map((student) => {
                  const currentStatus = attendanceDraft[student.id] ?? "PRESENT";
                  return (
                    <tr key={student.id}>
                      <td>{`${student.person?.firstName ?? ""} ${student.person?.lastName ?? ""}`.trim()}</td>
                      <td>{formatDisplayDate(selectedDate)}</td>
                      <td>{STATUS_LABELS[currentStatus]}</td>
                      <td className="actions">
                        {Object.keys(STATUS_LABELS).map((statusKey) => (
                          <button
                            key={statusKey}
                            className={currentStatus === statusKey ? "active" : ""}
                            onClick={() => handleMarkStatus(student.id, statusKey)}
                            type="button"
                          >
                            {STATUS_LABELS[statusKey]}
                          </button>
                        ))}
                      </td>
                    </tr>
                  );
                })
              )}

              {!isTeacher && recordsToShow.length > 0 &&
                recordsToShow.map((record) => (
                  <tr key={record.id}>
                    <td>{record.course?.name ?? "Curso"}</td>
                    <td>{formatDisplayDate(record.date)}</td>
                    <td>{STATUS_LABELS[record.status] ?? record.status}</td>
                  </tr>
                ))}

              {!loading && ((isTeacher && currentStudents.length === 0) || (!isTeacher && recordsToShow.length === 0)) && (
                <tr>
                  <td colSpan={isTeacher ? 4 : 3} className="empty">
                    {isTeacher ? "No hay estudiantes inscritos en este curso." : "Sin registros disponibles."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="attendance-summary">
          <h3>Resumen</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total</h4>
              <p>{summaryCards?.total ?? 0}</p>
            </div>
            <div className="summary-card">
              <h4>Asistencias</h4>
              <p>{summaryCards?.present ?? 0}</p>
            </div>
            <div className="summary-card">
              <h4>Inasistencias</h4>
              <p>{summaryCards?.absent ?? 0}</p>
            </div>
            <div className="summary-card">
              <h4>Tardanzas</h4>
              <p>{summaryCards?.late ?? 0}</p>
            </div>
            <div className="summary-card highlight">
              <h4>Porcentaje</h4>
              <p>{summaryCards?.attendanceRate ?? 0}%</p>
            </div>
          </div>

          {isTeacher && (
            <button
              type="button"
              className="attendance-submit"
              onClick={handleRegisterAttendance}
              disabled={saving || currentStudents.length === 0}
            >
              {saving ? "Guardando..." : "Registrar asistencia"}
            </button>
          )}
        </div>
      </div>

      {isTeacher && (
        <div className="attendance-history">
          <section className="attendance-table-container saved-records">
            <div className="table-header">
              <div>
                <h2>Asistencia guardada</h2>
                <p>Registros confirmados para la fecha seleccionada.</p>
              </div>
              {loading && <span className="loading">Cargando...</span>}
            </div>
            <table className="attendance-table compact">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Docente</th>
                </tr>
              </thead>
              <tbody>
                {savedAttendance.records.map((record) => (
                  <tr key={record.id}>
                    <td>{`${record.student?.person?.firstName ?? ""} ${record.student?.person?.lastName ?? ""}`.trim()}</td>
                    <td>{formatDisplayDate(record.date)}</td>
                    <td>{STATUS_LABELS[record.status] ?? record.status}</td>
                    <td>{record.teacher ? `${record.teacher.person?.firstName ?? ""} ${record.teacher.person?.lastName ?? ""}`.trim() : "-"}</td>
                  </tr>
                ))}
                {!loading && savedAttendance.records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">Sin asistencia registrada para esta fecha.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="attendance-table-container aggregate-records">
            <div className="table-header">
              <div>
                <h2>Resumen por estudiante</h2>
                <p>Totales de asistencias, tardanzas e inasistencias acumulados.</p>
              </div>
            </div>
            <table className="attendance-table compact">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Asistencias</th>
                  <th>Tardanzas</th>
                  <th>Inasistencias</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {studentAggregates.map((item) => (
                  <tr key={item.studentId}>
                    <td>{item.name || `ID ${item.studentId}`}</td>
                    <td>{item.present ?? 0}</td>
                    <td>{item.late ?? 0}</td>
                    <td>{item.absent ?? 0}</td>
                    <td>{item.total ?? 0}</td>
                  </tr>
                ))}
                {!loading && studentAggregates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">Aún no hay registros para calcular el resumen.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
