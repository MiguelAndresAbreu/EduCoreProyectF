import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchIncidentsForAdmin,
  fetchIncidentsByTeacher,
  fetchIncidentsByStudent,
  createIncident as createIncidentMutation,
  updateIncidentStatus as updateIncidentStatusMutation,
  fetchUsersList,
} from "../../api/graphqlOperations";
import "./Incidents.css";

const STATUSES = [
  { value: "OPEN", label: "Abierto" },
  { value: "REVIEW", label: "En revision" },
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
  const [usersOptions, setUsersOptions] = useState([]);
  const [reportedQuery, setReportedQuery] = useState("");

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isTeacher && !isStudent) return;
      try {
        const data = await fetchUsersList();
        setUsersOptions(Array.isArray(data) ? data : []);
      } catch {
        setUsersOptions([]);
      }
    };
    loadUsers();
  }, [isTeacher, isStudent]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const data = await fetchIncidentsForAdmin(statusFilter || undefined);
        setIncidents(Array.isArray(data) ? data : []);
      } else if (isTeacher && user?.teacher?.id) {
        const data = await fetchIncidentsByTeacher(Number(user.teacher.id));
        setIncidents(Array.isArray(data) ? data : []);
      } else if (isStudent && user?.student?.id) {
        const data = await fetchIncidentsByStudent(Number(user.student.id));
        setIncidents(Array.isArray(data) ? data : []);
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

  const handleReportedQueryChange = (value) => {
    setReportedQuery(value);
    const trimmed = value.trim();
    let nextId = "";
    if (/^\\d+$/.test(trimmed)) {
      nextId = trimmed;
    } else {
      const match = usersOptions.find((userOption) => {
        const fullName = `${userOption.person?.firstName ?? ""} ${userOption.person?.lastName ?? ""}`.trim();
        return (
          fullName.toLowerCase() === trimmed.toLowerCase() ||
          userOption.username?.toLowerCase() === trimmed.toLowerCase()
        );
      });
      nextId = match?.id ? String(match.id) : "";
    }
    setFormData((prev) => ({ ...prev, reportedId: nextId }));
  };

  const filteredUsers = usersOptions.filter((userOption) => {
    const fullName = `${userOption.person?.firstName ?? ""} ${userOption.person?.lastName ?? ""}`.trim().toLowerCase();
    const username = userOption.username?.toLowerCase() ?? "";
    if (!reportedQuery) return true;
    const query = reportedQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });

  const handleCreateIncident = async (event) => {
    event.preventDefault();
    let targetId = formData.reportedId;
    if (!targetId && filteredUsers.length === 1) {
      targetId = String(filteredUsers[0].id);
    }
    if (!targetId || !formData.description) {
      setError("Selecciona un usuario valido para reportar.");
      return;
    }
    setSaving(true);
    try {
      await createIncidentMutation({
        reportedId: Number(targetId),
        description: formData.description,
        date: formData.date,
        status: "OPEN",
        reporterId: user?.id ? Number(user.id) : undefined,
      });
      setFormData({ reportedId: "", description: "", date: new Date().toISOString().slice(0, 10) });
      setReportedQuery("");
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
      await updateIncidentStatusMutation(incidentId, status);
      await fetchIncidents();
    } catch (err) {
      setError("No se pudo actualizar el estado de la incidencia.");
    }
  };

  return (
    <div className="incidents-page">
      <header className="incidents-header">
        <h1>Gestion de incidencias</h1>
        <p>Reporta y da seguimiento a incidentes entre estudiantes y docentes.</p>
      </header>

      {error && <div className="incidents-error">{error}</div>}

        {(isStudent || isTeacher || isAdmin) && (
          <div className="incidents-form inline">
            <h3>Reportar nueva incidencia</h3>
            <form onSubmit={handleCreateIncident}>
              <div className="form-row">
                <label>
                Usuario reportado
                <input
                  type="text"
                  value={reportedQuery}
                  onChange={(e) => handleReportedQueryChange(e.target.value)}
                  placeholder="Buscar por nombre o username"
                  list="reported-users"
                  required
                />
                <datalist id="reported-users">
                  {filteredUsers.map((option) => {
                    const fullName = `${option.person?.firstName ?? ""} ${option.person?.lastName ?? ""}`.trim();
                    return (
                      <option key={option.id} value={fullName}>
                        {`${fullName} (${option.username ?? "sin usuario"})`}
                      </option>
                    );
                  })}
                </datalist>
              </label>
              <label>
                Fecha
                <input type="date" value={formData.date} onChange={handleFormChange("date")} required />
              </label>
              <label className="grow">
                Descripcion
                <input
                  type="text"
                  value={formData.description}
                  onChange={handleFormChange("description")}
                  placeholder="Describe la situacion presentada"
                  required
                />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </form>
        </div>
      )}

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

      </div>
    </div>
  );
}
