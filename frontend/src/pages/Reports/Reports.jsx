import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchPerformanceReport, fetchReports } from "../../api/graphqlOperations";
import "./Reports.css";

export default function Reports() {
  const { user } = useOutletContext();
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAllowed = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "FINANCE";
  const [filters, setFilters] = useState({
    courseId: "",
    studentId: "",
    startDate: "",
    endDate: "",
  });
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [gradesReport, setGradesReport] = useState(null);
  const [paymentsReport, setPaymentsReport] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isStudent && user?.student?.id) {
      fetchPerformance(user.student.id);
    }
  }, [isStudent, user?.student?.id]);

  const fetchPerformance = async (studentId) => {
    try {
      setLoading(true);
      const data = await fetchPerformanceReport(studentId);
      setPerformanceReport(data);
      setError("");
    } catch (err) {
      setError("No se pudo cargar el reporte de rendimiento.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleGenerateReports = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const params = {
        ...(filters.courseId ? { courseId: filters.courseId } : {}),
        ...(filters.studentId ? { studentId: filters.studentId } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      };

      const { attendance, grades, payments } = await fetchReports(params);

      setAttendanceReport(attendance);
      setGradesReport(grades);
      setPaymentsReport(payments);
      setError("");
    } catch (err) {
      setError("No se pudieron generar los reportes. Verifica los filtros seleccionados.");
      setAttendanceReport(null);
      setGradesReport(null);
      setPaymentsReport(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isAllowed) {
    return (
      <div className="reports-page">
        <header className="reports-header">
          <h1>Centro de reportes</h1>
          <p>No tienes permisos para acceder a los reportes.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Centro de reportes</h1>
        <p>Genera reportes integrados de asistencia, calificaciones y pagos para tomar decisiones informadas.</p>
      </header>

      {error && <div className="reports-error">{error}</div>}

      {!isStudent && !isTeacher && (
        <form className="reports-filters" onSubmit={handleGenerateReports}>
          <div className="filter-group">
            <label>
              ID Curso
              <input type="number" value={filters.courseId} onChange={handleFilterChange("courseId")} />
            </label>
            <label>
              ID Estudiante
              <input type="number" value={filters.studentId} onChange={handleFilterChange("studentId")} />
            </label>
            <label>
              Desde
              <input type="date" value={filters.startDate} onChange={handleFilterChange("startDate")} />
            </label>
            <label>
              Hasta
              <input type="date" value={filters.endDate} onChange={handleFilterChange("endDate")} />
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar reportes"}
          </button>
        </form>
      )}

      <div className="reports-grid">
        {attendanceReport && (
          <section className="report-card">
            <h3>Asistencia</h3>
            <div className="stats-grid">
              <div>
                <span>Total</span>
                <strong>{attendanceReport.summary?.total ?? attendanceReport.total ?? 0}</strong>
              </div>
              <div>
                <span>Presentes</span>
                <strong>{attendanceReport.summary?.present ?? 0}</strong>
              </div>
              <div>
                <span>Inasistencias</span>
                <strong>{attendanceReport.summary?.absent ?? 0}</strong>
              </div>
              <div>
                <span>Porcentaje</span>
                <strong>{attendanceReport.summary?.attendanceRate ?? 0}%</strong>
              </div>
            </div>
          </section>
        )}

        {gradesReport && (
          <section className="report-card">
            <h3>Calificaciones</h3>
            <div className="stats-grid">
              <div>
                <span>Cantidad</span>
                <strong>{gradesReport.data?.length ?? gradesReport.length ?? 0}</strong>
              </div>
              <div>
                <span>Promedio general</span>
                <strong>{gradesReport.average ?? 0}</strong>
              </div>
            </div>
            {gradesReport.averagesByStudent && gradesReport.averagesByStudent.length > 0 && (
              <ul className="student-averages">
                {gradesReport.averagesByStudent.map((item) => (
                  <li key={item.studentId}>
                    <span>ID {item.studentId}</span>
                    <strong>{item.average}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {paymentsReport && (
          <section className="report-card">
            <h3>Pagos</h3>
            <div className="stats-grid">
              <div>
                <span>Total pagado</span>
                <strong>${paymentsReport.totals?.paid?.toFixed?.(2) ?? Number(paymentsReport.totals?.paid ?? 0).toFixed(2)}</strong>
              </div>
              <div>
                <span>Pendiente</span>
                <strong>${paymentsReport.totals?.pending?.toFixed?.(2) ?? Number(paymentsReport.totals?.pending ?? 0).toFixed(2)}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>${paymentsReport.totals?.balance?.toFixed?.(2) ?? Number(paymentsReport.totals?.balance ?? 0).toFixed(2)}</strong>
              </div>
            </div>
          </section>
        )}

        {performanceReport && (
          <section className="report-card wide">
            <h3>Rendimiento académico</h3>
            <div className="stats-grid">
              <div>
                <span>Promedio</span>
                <strong>{performanceReport.averageGrade}</strong>
              </div>
              <div>
                <span>Asistencia</span>
                <strong>{performanceReport.attendanceRate}%</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>${performanceReport.financialStatus?.balance?.toFixed?.(2) ?? Number(performanceReport.financialStatus?.balance ?? 0).toFixed(2)}</strong>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
