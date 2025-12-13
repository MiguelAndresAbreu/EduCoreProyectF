import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchCourse,
  fetchCourses,
  fetchGradesByCourse,
  fetchGradesByStudent,
  createGrade as createGradeMutation,
} from "../../api/graphqlOperations";
import { format } from "date-fns";
import "./Grades.css";

const GRADE_TYPES = [
  { value: "EXAM", label: "Examen" },
  { value: "HOMEWORK", label: "Tarea" },
  { value: "QUIZ", label: "Quiz" },
  { value: "PROJECT", label: "Proyecto" },
  { value: "PARTICIPATION", label: "Participación" },
];

export default function Grades() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseGrades, setCourseGrades] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentFilter, setStudentFilter] = useState("ALL");
  const [studentCourseFilter, setStudentCourseFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    studentId: "",
    type: "EXAM",
    value: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isTeacher && Array.isArray(user?.courses)) {
      const normalizedCourses = user.courses.map((course) => ({
        ...course,
        id: Number(course.id),
      }));
      setCourseOptions(normalizedCourses);
      setSelectedCourseId(normalizedCourses[0]?.id ?? null);
    }
  }, [isTeacher, user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllCourses();
    }
  }, [isAdmin]);

  useEffect(() => {
    if ((isTeacher || isAdmin) && selectedCourseId) {
      fetchCourseGrades(selectedCourseId);
    }
  }, [isTeacher, isAdmin, selectedCourseId]);

  useEffect(() => {
    if (isStudent && user?.student?.id) {
      fetchStudentGrades(Number(user.student.id));
    }
  }, [isStudent, user?.student?.id]);

  const fetchCourseGrades = async (courseId) => {
    const normalizedCourseId = Number(courseId);
    if (!Number.isInteger(normalizedCourseId)) return;
    try {
      setLoading(true);
      const [course, courseGrades] = await Promise.all([
        fetchCourse(normalizedCourseId),
        fetchGradesByCourse(normalizedCourseId),
      ]);
      setCourseDetails(course);
      setCourseGrades(Array.isArray(courseGrades) ? courseGrades : []);
      setStudentFilter("ALL");
      setError("");
    } catch (err) {
      setError("No se pudo cargar la informacion del curso.");
      setCourseGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchCourses();
      const normalized = Array.isArray(data) ? data.map((course) => ({ ...course, id: Number(course.id) })) : [];
      setCourseOptions(normalized);
      setSelectedCourseId((prev) => prev ?? normalized[0]?.id ?? null);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los cursos.");
      setCourseOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentGrades = async (studentId) => {
    try {
      setLoading(true);
      const data = await fetchGradesByStudent(studentId);
      setStudentGrades(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar tus calificaciones.");
      setStudentGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateGrade = async (event) => {
    event.preventDefault();
    if (!selectedCourseId || !formData.studentId || !formData.value) return;
    setSaving(true);
    try {
      const teacherId = Number(user?.teacher?.id ?? courseDetails?.teacher?.id);
      await createGradeMutation({
        courseId: Number(selectedCourseId),
        studentId: Number(formData.studentId),
        teacherId,
        type: formData.type,
        value: Number(formData.value),
        date: formData.date,
      });
      await fetchCourseGrades(selectedCourseId);
      setFormData((prev) => ({ ...prev, value: "" }));
      setError("");
    } catch (err) {
      setError("No se pudo registrar la calificación.");
    } finally {
      setSaving(false);
    }
  };

  const gradesToDisplay = (isTeacher || isAdmin) ? courseGrades : studentGrades;

  const filteredCourseGrades = useMemo(() => {
    if (!isTeacher) return courseGrades;
    if (studentFilter === "ALL") return courseGrades;
    const id = Number(studentFilter);
    return courseGrades.filter((grade) => Number(grade.student?.id) === id);
  }, [courseGrades, isTeacher, studentFilter]);

  const filteredStudentGrades = useMemo(() => {
    if (!isStudent) return studentGrades;
    if (studentCourseFilter === "ALL") return studentGrades;
    const targetKey = studentCourseFilter;
    return studentGrades.filter((grade) => {
      const courseKey =
        grade.course?.id !== undefined && grade.course?.id !== null
          ? String(grade.course.id)
          : grade.course?.name ?? "";
      return courseKey === targetKey;
    });
  }, [studentGrades, isStudent, studentCourseFilter]);

  const studentCourseOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    studentGrades.forEach((grade) => {
      const courseKey =
        grade.course?.id !== undefined && grade.course?.id !== null
          ? String(grade.course.id)
          : grade.course?.name ?? "";
      if (!courseKey || seen.has(courseKey)) {
        return;
      }
      seen.add(courseKey);
      options.push({
        id: courseKey,
        name: grade.course?.name ?? "Curso",
      });
    });
    return options;
  }, [studentGrades]);

  const averageGrade = useMemo(() => {
    if (!gradesToDisplay.length) return 0;
    const total = gradesToDisplay.reduce((acc, grade) => acc + Number(grade.value ?? grade.score ?? 0), 0);
    return (total / gradesToDisplay.length).toFixed(2);
  }, [gradesToDisplay]);

  const currentStudents = useMemo(() => {
    if (!courseDetails?.enrollments) return [];
    return courseDetails.enrollments.map((enrollment) => enrollment.student);
  }, [courseDetails]);

  return (
    <div className="grades-page">
      <header className="grades-header">
        <h1>Gestión de calificaciones</h1>
        <p>Consulta y registra notas por materia con cálculo automático de promedios.</p>
      </header>

      {error && <div className="grades-error">{error}</div>}

      {(isTeacher || isAdmin) && (
        <section className="grades-controls">
          <div className="control-group">
            <label htmlFor="course">Curso</label>
            <select
              id="course"
              value={selectedCourseId ?? ""}
              onChange={(event) => setSelectedCourseId(Number(event.target.value))}
            >
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} • {course.subject?.name ?? "Materia"}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {isTeacher && (
        <div className="grade-form-wrapper">
          <form className="grade-form inline" onSubmit={handleCreateGrade}>
            <label>
              Estudiante
              <select value={formData.studentId} onChange={handleFormChange("studentId")} required>
                <option value="" disabled>
                  Selecciona un estudiante
                </option>
                {currentStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {`${student.person?.firstName ?? ""} ${student.person?.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo
              <select value={formData.type} onChange={handleFormChange("type")}>
                {GRADE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nota
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.value}
                onChange={handleFormChange("value")}
                required
              />
            </label>
            <label>
              Fecha
              <input type="date" value={formData.date} onChange={handleFormChange("date")} required />
            </label>
            <button type="submit" disabled={saving || !formData.studentId}>
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </form>
        </div>
      )}

      <div className={`grades-grid ${isTeacher ? "teacher" : isAdmin ? "admin" : "student"}`}>
        <div className="grades-table-container">
          <div className="table-header">
            <h2>{(isTeacher || isAdmin) ? "Calificaciones del curso" : "Historial academico"}</h2>
            <div className="header-actions">
              {isTeacher && (
                <label className="header-filter">
                  Estudiante
                  <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}>
                    <option value="ALL">Todos</option>
                    {currentStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {`${student.person?.firstName ?? ""} ${student.person?.lastName ?? ""}`.trim()}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {isStudent && (
                <label className="header-filter">
                  Curso
                  <select value={studentCourseFilter} onChange={(e) => setStudentCourseFilter(e.target.value)}>
                    <option value="ALL">Todos</option>
                    {studentCourseOptions.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {loading && <span className="loading">Cargando...</span>}
            </div>
          </div>
          <table className="grades-table">
            <thead>
              <tr>
                <th>{(isTeacher || isAdmin) ? "Estudiante" : "Curso"}</th>
                <th>Tipo</th>
                <th>Nota</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(isTeacher ? filteredCourseGrades : isStudent ? filteredStudentGrades : gradesToDisplay).map((grade) => (
                <tr key={grade.id}>
                  <td>
                    {(isTeacher || isAdmin)
                      ? `${grade.student?.person?.firstName ?? ""} ${grade.student?.person?.lastName ?? ""}`.trim()
                      : grade.course?.name ?? "Materia"}
                  </td>
                  <td>{GRADE_TYPES.find((item) => item.value === grade.type)?.label ?? grade.type}</td>
                  <td className="score">{Number(grade.value ?? grade.score).toFixed(2)}</td>
                  <td>{grade.date ? format(new Date(grade.date), "dd/MM/yyyy") : "--"}</td>
                </tr>
              ))}

              {!loading && gradesToDisplay.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    {isTeacher ? "Aún no se registran calificaciones." : "Sin calificaciones disponibles."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grades-summary bottom-summary">
        <div className="summary-card highlight">
          <h4>Promedio general</h4>
          <p>{averageGrade}</p>
        </div>
      </div>
    </div>
  );
}
