import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { http } from "../../api/http";
import "./Incidents.css";

const STATUSES = [
  { value: "OPEN", label: "Abierto" },
  { value: "REVIEW", label: "En revisión" },
  { value: "CLOSED", label: "Cerrado" },
];

export default function Incidents() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    reportedId: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let response;
      if (isAdmin) {
        response = await http.get("/incidents", { params: statusFilter ? { status: statusFilter } : {} });
      } else if (isTeacher && user?.teacher?.id) {
        response = await http.get(`/incidents/teacher/${user.teacher.id}`);
      } else if (isStudent && user?.student?.id) {
        response = await http.get(`/incidents/student/${user.student.id}`);
      }
      if (response) {
        setIncidents(Array.isArray(response.data) ? response.data : []);
      }
      setError("");
    } catch (err) {
      setError("No se pudieron cargar las incidencias.");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateIncident = async (event) => {
    event.preventDefault();
    if (!formData.reportedId || !formData.description) return;
    setSaving(true);
    try {
      await http.post("/incidents", {
        reportedId: Number(formData.reportedId),
        description: formData.description,
        date: formData.date,
        status: "OPEN",
      });
      setFormData({ reportedId: "", description: "", date: new Date().toISOString().slice(0, 10) });
      await fetchIncidents();
      setError("");
    } catch (err) {
      setError("No se pudo registrar la incidencia.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (incidentId, status) => {
    try {
      await http.put(`/incidents/${incidentId}`, { status });
      await fetchIncidents();
    } catch (err) {
      setError("No se pudo actualizar el estado de la incidencia.");
    }
  };

  return (
    <div className="incidents-page">
      <header className="incidents-header">
        <h1>Gestión de incidencias</h1>
        <p>Reporta y da seguimiento a incidentes entre estudiantes y docentes.</p>
      </header>

      {error && <div className="incidents-error">{error}</div>}

      <div className="incidents-grid">
        <section className="incidents-list">
          <div className="list-header">
            <h2>Incidencias registradas</h2>
            {isAdmin && (
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Todas</option>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {loading && <span className="loading">Cargando...</span>}
          <table>
            <thead>
              <tr>
                <th>Reportante</th>
                <th>Reportado</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Detalle</th>
                {isAdmin && <th>Actualizar</th>}
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.reporter?.person?.firstName ?? ""} {incident.reporter?.person?.lastName ?? ""}</td>
                  <td>{incident.reported?.person?.firstName ?? ""} {incident.reported?.person?.lastName ?? ""}</td>
                  <td>{incident.date}</td>
                  <td>
                    <span className={`status ${incident.status?.toLowerCase() ?? ""}`}>
                      {STATUSES.find((status) => status.value === incident.status)?.label ?? incident.status}
                    </span>
                  </td>
                  <td>{incident.description}</td>
                  {isAdmin && (
                    <td>
                      <select
                        value={incident.status}
                        onChange={(event) => handleStatusUpdate(incident.id, event.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}

              {!loading && incidents.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="empty">
                    No hay incidencias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {(isStudent || isTeacher) && (
          <section className="incidents-form">
            <h3>Reportar nueva incidencia</h3>
            <form onSubmit={handleCreateIncident}>
              <label>
                ID del usuario reportado
                <input
                  type="number"
                  value={formData.reportedId}
                  onChange={handleFormChange("reportedId")}
                  required
                />
              </label>
              <label>
                Fecha
                <input type="date" value={formData.date} onChange={handleFormChange("date")} required />
              </label>
              <label>
                Descripción
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={handleFormChange("description")}
                  placeholder="Describe la situación presentada"
                  required
                />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? "Enviando..." : "Enviar reporte"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
