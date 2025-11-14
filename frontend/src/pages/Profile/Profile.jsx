import { useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Layers,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import { updateProfile as updateProfileMutation } from "../../api/graphqlOperations";
import "./Profile.css";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Profile() {
  const { user, refreshUser, loading } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    avatar: "",
  });

  useEffect(() => {
    if (user?.person) {
      setFormValues({
        firstName: user.person.firstName || "",
        lastName: user.person.lastName || "",
        email: user.person.email || user.email || "",
        phone: user.person.phone || "",
        address: user.person.address || "",
        birthDate: toInputDate(user.person.birthDate),
        avatar: user.person.avatar || "",
      });
    }
  }, [user]);

  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const totalCourses = useMemo(() => {
    if (!user) return 0;
    if (isTeacher) return user.courses?.length ?? 0;
    if (isStudent) return user.enrollments?.length ?? 0;
    return 0;
  }, [user, isTeacher, isStudent]);

  const averageGrade = useMemo(() => {
    if (!isStudent || !user?.grades?.length) return null;
    const total = user.grades.reduce((sum, grade) => sum + Number(grade.value ?? 0), 0);
    if (!user.grades.length) return null;
    return (total / user.grades.length).toFixed(1);
  }, [user, isStudent]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setStatus({ type: "idle", message: "" });
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    if (user?.person) {
      setFormValues({
        firstName: user.person.firstName || "",
        lastName: user.person.lastName || "",
        email: user.person.email || user.email || "",
        phone: user.person.phone || "",
        address: user.person.address || "",
        birthDate: toInputDate(user.person.birthDate),
        avatar: user.person.avatar || "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.person) return;

    setSaving(true);
    setStatus({ type: "idle", message: "" });

    const personPayload = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim() || undefined,
      address: formValues.address.trim() || undefined,
      birthDate: formValues.birthDate || undefined,
      avatar: formValues.avatar.trim() || undefined,
    };

    Object.keys(personPayload).forEach((key) => {
      if (personPayload[key] === undefined || personPayload[key] === "") {
        delete personPayload[key];
      }
    });

    try {
      const userPayload = personPayload.email ? { email: personPayload.email } : undefined;
      await updateProfileMutation(user.id, user.person.id, personPayload, userPayload);
      await refreshUser();
      setStatus({ type: "success", message: "Perfil actualizado correctamente." });
      setIsEditing(false);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "No se pudo actualizar el perfil. Intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  };

  const teacherCourses = user?.courses ?? [];
  const studentEnrollments = user?.enrollments ?? [];
  const grades = user?.grades ?? [];

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div>
          <h2>Mi perfil</h2>
          <p>Visualiza y actualiza tus datos personales.</p>
        </div>
        <button className="profile-edit-button" onClick={handleOpenModal} disabled={!user}>
          <Pencil size={16} /> Editar Perfil
        </button>
      </header>

      {status.type !== "idle" && (
        <div className={`profile-status profile-status--${status.type}`}>
          {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{status.message}</span>
        </div>
      )}

      {loading ? (
        <div className="profile-loading">Cargando información...</div>
      ) : (
        <>
          <div className="profile-grid">
            <div className="profile-info-compact">
              <img
                src={
                  user?.person?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${user?.person?.firstName ?? ""} ${user?.person?.lastName ?? ""}`.trim() || "Usuario",
                  )}&background=1e3a8a&color=fff`
                }
                alt="Perfil"
                className="profile-avatar"
              />
              <ul className="profile-details">
                <li>
                  <strong>Nombre:</strong> {user ? `${user.person?.firstName} ${user.person?.lastName}` : "-"}
                </li>
                <li>
                  <strong>Rol:</strong> {user?.role ?? "-"}
                </li>
                <li>
                  <strong>Email:</strong> {user?.person?.email ?? user?.email ?? "-"}
                </li>
                {user?.person?.phone && (
                  <li>
                    <strong>Teléfono:</strong> {user.person.phone}
                  </li>
                )}
                {user?.person?.address && (
                  <li>
                    <strong>Dirección:</strong> {user.person.address}
                  </li>
                )}
                {user?.person?.birthDate && (
                  <li>
                    <strong>Fecha de nacimiento:</strong> {formatDate(user.person.birthDate)}
                  </li>
                )}
              </ul>
            </div>

            <div className="profile-summary">
              <div className="summary-card">
                <h3>{isTeacher ? "Cursos asignados" : "Cursos inscritos"}</h3>
                <p>{totalCourses}</p>
              </div>
              {isStudent && (
                <div className="summary-card">
                  <h3>Promedio general</h3>
                  <p>{averageGrade ?? "-"}</p>
                </div>
              )}
              {isTeacher && (
                <div className="summary-card">
                  <h3>Última actualización</h3>
                  <p>{formatDate(user?.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>

          <section className="profile-section">
            <h3>Accesos rápidos</h3>
            <div className="profile-quick-actions">
              <Link to="/attendance" className="profile-quick-link">
                <Calendar size={18} /> Ver asistencia
              </Link>
              <Link to="/grades" className="profile-quick-link">
                <BookOpen size={18} /> Ver calificaciones
              </Link>
              {isTeacher && (
                <Link to="/dashboard" className="profile-quick-link">
                  <Layers size={18} /> Gestionar cursos
                </Link>
              )}
            </div>
          </section>

          {isTeacher && (
            <section className="profile-section">
              <h3>
                <GraduationCap size={20} /> Cursos que impartes
              </h3>
              <div className="profile-card-list">
                {teacherCourses.length === 0 && <p className="profile-empty">Aún no tienes cursos asignados.</p>}
                {teacherCourses.map((course) => (
                  <article key={course.id} className="profile-card">
                    <h4>{course.name}</h4>
                    <p>{course.subject?.name}</p>
                    <span>{course.schedule || "Horario por definir"}</span>
                    <span>Cupo: {course.capacity}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {isStudent && (
            <section className="profile-section">
              <h3>
                <GraduationCap size={20} /> Mis cursos
              </h3>
              <div className="profile-card-list">
                {studentEnrollments.length === 0 && <p className="profile-empty">Aún no te has inscrito en cursos.</p>}
                {studentEnrollments.map((enrollment) => (
                  <article key={enrollment.id} className="profile-card">
                    <h4>{enrollment.course?.name}</h4>
                    <p>{enrollment.course?.subject?.name}</p>
                    <span>{enrollment.course?.schedule || "Horario por definir"}</span>
                    <span>Estado: {enrollment.status}</span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {isStudent && grades.length > 0 && (
            <section className="profile-section">
              <h3>
                <BookOpen size={20} /> Últimas calificaciones
              </h3>
              <div className="profile-card-list profile-card-list--compact">
                {grades.slice(0, 4).map((grade) => (
                  <article key={grade.id} className="profile-card profile-card--compact">
                    <h4>{grade.course?.name}</h4>
                    <p>{grade.type}</p>
                    <span>
                      Puntaje: {grade.score}/{grade.maxScore}
                    </span>
                    <span>{formatDate(grade.date)}</span>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {isEditing && (
        <div className="profile-modal" role="dialog" aria-modal="true">
          <div className="profile-modal-content">
            <div className="profile-modal-header">
              <h3>Editar perfil</h3>
              <button className="profile-modal-close" onClick={handleCloseModal} type="button">
                <X size={18} />
              </button>
            </div>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form-row">
                <label>
                  Nombre
                  <input
                    type="text"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Apellido
                  <input
                    type="text"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
              <div className="profile-form-row">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <label>
                Dirección
                <input
                  type="text"
                  name="address"
                  value={formValues.address}
                  onChange={handleInputChange}
                />
              </label>
              <div className="profile-form-row">
                <label>
                  Fecha de nacimiento
                  <input
                    type="date"
                    name="birthDate"
                    value={formValues.birthDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Avatar (URL)
                  <input
                    type="url"
                    name="avatar"
                    value={formValues.avatar}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <div className="profile-form-actions">
                <button type="button" className="profile-button-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="profile-button-primary" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
