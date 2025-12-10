import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createUserWithProfile, fetchUsersList } from "../../api/graphqlOperations";
import "./Users.css";

const ROLE_OPTIONS = ["ADMIN", "TEACHER", "STUDENT", "STAFF", "FINANCE"];

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "STUDENT",
  phone: "",
  address: "",
  birthDate: "",
  avatar: "",
};

export default function Users() {
  const { user: currentUser } = useOutletContext();
  const [form, setForm] = useState(initialFormState);
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const orderedUsers = useMemo(
    () =>
      [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [users],
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingList(true);
    try {
      const data = await fetchUsersList();
      setUsers(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.message || "No se pudo cargar la lista de usuarios");
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = (role = "STUDENT") => {
    setForm({ ...initialFormState, role });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      birthDate: form.birthDate || undefined,
      avatar: form.avatar.trim() || undefined,
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.username || !payload.password) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const created = await createUserWithProfile(payload);
      if (created) {
        setUsers((prev) => [created, ...prev.filter((u) => u.id !== created.id)]);
        resetForm(form.role);
        setSuccess("Usuario creado correctamente");
      } else {
        setError("No se pudo crear el usuario");
      }
    } catch (err) {
      setError(err?.message || "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="users-page">
        <header className="users-header">
          <div>
            <p className="eyebrow">Usuarios</p>
            <h1>Acceso restringido</h1>
            <p className="muted">Solo los administradores pueden crear y gestionar cuentas.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div>
          <p className="eyebrow">Administracion de usuarios</p>
          <h1>Crea cuentas con roles y datos completos</h1>
          <p className="muted">
            Ingresa toda la informacion requerida para registrar nuevos usuarios en la plataforma.
          </p>
        </div>
        <button className="ghost-btn" onClick={loadUsers} disabled={loadingList}>
          {loadingList ? "Actualizando..." : "Recargar lista"}
        </button>
      </header>

      <div className="users-grid">
        <section className="users-form-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Nuevo usuario</p>
              <h3>Datos obligatorios y rol</h3>
            </div>
            <span className="role-chip">{form.role}</span>
          </div>

          {error && <div className="users-alert error">{error}</div>}
          {success && <div className="users-alert success">{success}</div>}

          <form className="user-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Nombre *
                <input type="text" value={form.firstName} onChange={handleChange("firstName")} required />
              </label>
              <label>
                Apellido *
                <input type="text" value={form.lastName} onChange={handleChange("lastName")} required />
              </label>
            </div>

            <div className="form-row">
              <label>
                Correo electronico *
                <input type="email" value={form.email} onChange={handleChange("email")} required />
              </label>
              <label>
                Telefono
                <input type="tel" value={form.phone} onChange={handleChange("phone")} placeholder="Opcional" />
              </label>
            </div>

            <label>
              Direccion
              <input type="text" value={form.address} onChange={handleChange("address")} placeholder="Opcional" />
            </label>

            <div className="form-row">
              <label>
                Fecha de nacimiento
                <input type="date" value={form.birthDate} onChange={handleChange("birthDate")} />
              </label>
              <label>
                Avatar (URL)
                <input type="url" value={form.avatar} onChange={handleChange("avatar")} placeholder="https://..." />
              </label>
            </div>

            <div className="form-row">
              <label>
                Usuario *
                <input type="text" value={form.username} onChange={handleChange("username")} required />
              </label>
              <label>
                Rol *
                <select value={form.role} onChange={handleChange("role")} required>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Contrasena *
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  minLength={6}
                  required
                />
              </label>
              <label>
                Confirmar contrasena *
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  minLength={6}
                  required
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="ghost-btn" onClick={() => resetForm(form.role)} disabled={saving}>
                Limpiar
              </button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        </section>

        <section className="users-list-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Usuarios registrados</p>
              <h3>{users.length} usuarios</h3>
            </div>
            {loadingList && <span className="muted">Cargando...</span>}
          </div>

          <div className="users-list">
            {orderedUsers.length === 0 && !loadingList && (
              <div className="empty-state">
                <p className="muted">Aun no hay usuarios creados.</p>
              </div>
            )}

            {orderedUsers.map((u) => (
              <article key={u.id} className="user-row">
                <div className="user-initial">
                  {(u.person?.firstName?.[0] || u.username?.[0] || "?").toUpperCase()}
                </div>
                <div className="user-meta">
                  <div className="user-name">
                    <strong>
                      {u.person?.firstName} {u.person?.lastName}
                    </strong>
                    <span className="role-chip small">{u.role}</span>
                  </div>
                  <p className="muted">{u.email}</p>
                  {u.person?.phone && <p className="muted">Tel: {u.person.phone}</p>}
                </div>
                <div className="user-extra">
                  <span className={`status-dot ${u.isActive ? "on" : "off"}`} />
                  <small className="muted">
                    Creado: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
