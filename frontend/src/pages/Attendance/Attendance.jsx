import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchCourse,
  fetchAttendanceByCourse,
  fetchAttendanceByStudent,
  recordAttendance as recordAttendanceMutation,
} from "../../api/graphqlOperations";
import { format } from "date-fns";
import "./Attendance.css";

const STATUS_LABELS = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  LATE: "Tarde",
};

export default function Attendance() {
  const { user } = useOutletContext();
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseAttendance, setCourseAttendance] = useState({ records: [], summary: null });
  const [studentAttendance, setStudentAttendance] = useState({ records: [], summary: null });
  const [attendanceDraft, setAttendanceDraft] = useState({});
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
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
  }, [isTeacher, selectedCourse, selectedDate]);

  useEffect(() => {
    if (isStudent && studentId) {
      fetchStudentAttendance(Number(studentId));
    }
  }, [isStudent, studentId]);

  const fetchCourseData = async (courseId) => {
    const id = Number(courseId);
    if (!Number.isInteger(id)) return;
    try {
      setLoading(true);
      const [courseResponse, attendanceResponse] = await Promise.all([
        fetchCourse(id),
        fetchAttendanceByCourse(id, selectedDate),
      ]);

      setCourseAttendance({
        records: attendanceResponse?.records ?? [],
        summary: attendanceResponse?.summary ?? null,
      });
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
                      <td>{format(new Date(selectedDate), "dd/MM/yyyy")}</td>
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
                    <td>{format(new Date(record.date), "dd/MM/yyyy")}</td>
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
    </div>
  );
}
