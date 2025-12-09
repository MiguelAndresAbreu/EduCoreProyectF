import { useEffect, useMemo, useState } from "react";
import {
  fetchCourses,
  fetchCourse,
  fetchStudents,
  fetchTeachers,
  fetchSubjects,
  createCourse,
  updateCourse,
  enrollStudent,
  removeEnrollment,
} from "../../api/graphqlOperations";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    subjectId: "",
    teacherId: "",
    schedule: "",
    capacity: "",
    room: "",
    studentIds: [],
  });
  const [savingCourse, setSavingCourse] = useState(false);

  const [addingStudentId, setAddingStudentId] = useState("");
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const loadCatalogs = async () => {
    try {
      const [subjectsData, teachersData, studentsData] = await Promise.all([
        fetchSubjects(),
        fetchTeachers(),
        fetchStudents(),
      ]);
      setSubjects(subjectsData ?? []);
      setTeachers(teachersData ?? []);
      setStudents(studentsData ?? []);
    } catch (err) {
      console.error("No se pudieron cargar catA!logos", err);
    }
  };

  const loadCourses = async () => {
    setLoadingList(true);
    setError("");
    try {
      const data = await fetchCourses();
      setCourses(Array.isArray(data) ? data : []);
      if (data?.length && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      setError("No se pudieron cargar los cursos");
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadCourseDetail = async (courseId) => {
    if (!courseId) return;
    setLoadingDetail(true);
    setError("");
    try {
      const detail = await fetchCourse(courseId);
      setCourseDetail(detail);
    } catch (err) {
      setError("No se pudo cargar el detalle del curso");
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseDetail(selectedCourseId);
    }
  }, [selectedCourseId]);

  const enrolledStudentIds = useMemo(
    () => new Set((courseDetail?.enrollments ?? []).map((enr) => enr.student?.id)),
    [courseDetail],
  );

  const availableStudents = useMemo(
    () => (students ?? []).filter((s) => !enrolledStudentIds.has(s.id)),
    [students, enrolledStudentIds],
  );

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormState({
      name: "",
      subjectId: subjects[0]?.id ?? "",
      teacherId: teachers[0]?.id ?? "",
      schedule: "",
      capacity: "",
      room: "",
      studentIds: [],
    });
    setModalOpen(true);
  };

  const openEditModal = () => {
    if (!courseDetail) return;
    setEditingCourse(courseDetail);
    setFormState({
      name: courseDetail.name ?? "",
      subjectId: courseDetail.subject?.id ?? "",
      teacherId: courseDetail.teacher?.id ?? "",
      schedule: courseDetail.schedule ?? "",
      capacity: courseDetail.capacity ?? "",
      room: courseDetail.room ?? "",
      studentIds: (courseDetail.enrollments ?? []).map((enr) => enr.student?.id).filter(Boolean),
    });
    setModalOpen(true);
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    setSavingCourse(true);
    setError("");
    try {
      const payload = {
        name: formState.name.trim(),
        subjectId: Number(formState.subjectId),
        teacherId: Number(formState.teacherId),
        schedule: formState.schedule || null,
        capacity: formState.capacity ? Number(formState.capacity) : null,
        room: formState.room || null,
      };

      if (!payload.name || !payload.subjectId || !payload.teacherId) {
        setError("Nombre, materia y profesor son obligatorios");
        setSavingCourse(false);
        return;
      }

      let updatedCourse;
      if (editingCourse) {
        updatedCourse = await updateCourse(editingCourse.id, payload);
      } else {
        updatedCourse = await createCourse(payload);
      }

      // Actualizar listados
      await loadCourses();
      setSelectedCourseId(updatedCourse.id);
      await loadCourseDetail(updatedCourse.id);

      // Inscribir estudiantes seleccionados en creación
      if (!editingCourse && formState.studentIds?.length) {
        for (const studentId of formState.studentIds) {
          try {
            await enrollStudent(updatedCourse.id, studentId);
          } catch (err) {
            console.error("No se pudo inscribir estudiante", studentId, err);
          }
        }
        await loadCourseDetail(updatedCourse.id);
      }

      setModalOpen(false);
    } catch (err) {
      setError(err?.message || "Error al guardar el curso");
      console.error(err);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!addingStudentId || !selectedCourseId) return;
    setLoadingEnrollment(true);
    setError("");
    try {
      await enrollStudent(selectedCourseId, addingStudentId);
      await loadCourseDetail(selectedCourseId);
      setAddingStudentId("");
    } catch (err) {
      setError(err?.message || "No se pudo inscribir el estudiante");
      console.error(err);
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId) => {
    setLoadingEnrollment(true);
    setError("");
    try {
      await removeEnrollment(enrollmentId);
      await loadCourseDetail(selectedCourseId);
    } catch (err) {
      setError(err?.message || "No se pudo remover la inscripciA3n");
      console.error(err);
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const renderCourseCard = (course) => {
    const isActive = course.id === selectedCourseId;
    return (
      <button
        key={course.id}
        className={`course-card ${isActive ? "active" : ""}`}
        onClick={() => setSelectedCourseId(course.id)}
      >
        <div className="course-card-title">
          <h4>{course.name}</h4>
          <span>{course.subject?.name || "Sin materia"}</span>
        </div>
        <div className="course-card-meta">
          <small>{course.schedule || "Horario no definido"}</small>
          <small>{course.teacher?.person?.firstName} {course.teacher?.person?.lastName}</small>
        </div>
      </button>
    );
  };

  const enrolledCount = courseDetail?.enrollments?.length ?? 0;
  const availableSeats = (courseDetail?.capacity ?? 0) - enrolledCount;

  return (
    <div className="courses-page">
      <header className="courses-header">
        <div>
          <p className="eyebrow">GestiA3n de cursos</p>
          <h1>Administra cursos, profesores y estudiantes</h1>
          {error && <div className="error-banner">{error}</div>}
        </div>
        <button className="primary-btn" onClick={openCreateModal}>
          + Nuevo curso
        </button>
      </header>

      <div className="courses-body">
        <section className="courses-list">
          <div className="list-header">
            <h3>Cursos ({courses.length})</h3>
            {loadingList && <span className="muted">Cargando...</span>}
          </div>
          <div className="list-content">
            {courses.length === 0 && !loadingList && <p className="muted">No hay cursos registrados</p>}
            {courses.map(renderCourseCard)}
          </div>
        </section>

        <section className="courses-detail">
          {loadingDetail && <p>Cargando detalle...</p>}
          {!loadingDetail && courseDetail && (
            <>
              <div className="detail-header">
                <div>
                  <p className="eyebrow">Curso</p>
                  <h2>{courseDetail.name}</h2>
                  <p className="muted">{courseDetail.subject?.name} | {courseDetail.schedule || "Horario no definido"}</p>
                </div>
                <button className="ghost-btn" onClick={openEditModal}>Editar curso</button>
              </div>

              <div className="detail-grid">
                <div className="info-card">
                  <p className="eyebrow">Profesor</p>
                  <h4>
                    {courseDetail.teacher?.person
                      ? `${courseDetail.teacher.person.firstName} ${courseDetail.teacher.person.lastName}`
                      : "No asignado"}
                  </h4>
                  <p className="muted">Capacidad: {courseDetail.capacity ?? "-"} | Salon: {courseDetail.room || "N/A"}</p>
                  <p className="muted">Cupos disponibles: {availableSeats >= 0 ? availableSeats : 0}</p>
                </div>

                <div className="info-card">
                  <p className="eyebrow">Materia</p>
                  <h4>{courseDetail.subject?.name || "Sin materia"}</h4>
                  <p className="muted">{courseDetail.subject?.code}</p>
                </div>
              </div>

              <div className="enrollments-section">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Estudiantes inscritos</p>
                    <h3>{enrolledCount} estudiantes</h3>
                  </div>
                  <div className="enroll-actions">
                    <select
                      value={addingStudentId}
                      onChange={(e) => setAddingStudentId(e.target.value)}
                    >
                      <option value="">Seleccionar estudiante</option>
                      {availableStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.person?.firstName} {student.person?.lastName} ({student.person?.email})
                        </option>
                      ))}
                    </select>
                    <button
                      className="primary-btn"
                      onClick={handleEnrollStudent}
                      disabled={loadingEnrollment || !addingStudentId}
                    >
                      {loadingEnrollment ? "Agregando..." : "Agregar"}
                    </button>
                  </div>
                </div>

                <div className="enrollments-list">
                  {enrolledCount === 0 && <p className="muted">Sin estudiantes inscritos</p>}
                  {courseDetail.enrollments?.map((enrollment) => (
                    <div key={enrollment.id} className="enrollment-row">
                      <div>
                        <strong>{enrollment.student?.person?.firstName} {enrollment.student?.person?.lastName}</strong>
                        <p className="muted">Estado: {enrollment.status}</p>
                      </div>
                      <button
                        className="danger-btn"
                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                        disabled={loadingEnrollment}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {!loadingDetail && !courseDetail && (
            <p className="muted">Selecciona un curso para ver detalles</p>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCourse ? "Editar curso" : "Crear curso"}</h3>
              <button className="ghost-btn" onClick={() => setModalOpen(false)}>Cerrar</button>
            </div>
            <form className="course-form" onSubmit={handleCourseSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </label>

              <label>
                Materia
                <select
                  value={formState.subjectId}
                  onChange={(e) => setFormState({ ...formState, subjectId: e.target.value })}
                  required
                >
                  <option value="">Selecciona una materia</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Profesor
                <select
                  value={formState.teacherId}
                  onChange={(e) => setFormState({ ...formState, teacherId: e.target.value })}
                  required
                >
                  <option value="">Selecciona un profesor</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.person?.firstName} {teacher.person?.lastName} ({teacher.person?.email})
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-row">
                <label>
                  Horario
                  <input
                    type="text"
                    value={formState.schedule}
                    onChange={(e) => setFormState({ ...formState, schedule: e.target.value })}
                    placeholder="Ej: Lun-Mie 8:00-10:00"
                  />
                </label>
                <label>
                  Capacidad
                  <input
                    type="number"
                    min="1"
                    value={formState.capacity}
                    onChange={(e) => setFormState({ ...formState, capacity: e.target.value })}
                  />
                </label>
              </div>

              <label>
                SalA3n (opcional)
                <input
                  type="text"
                  value={formState.room}
                  onChange={(e) => setFormState({ ...formState, room: e.target.value })}
                />
              </label>

              {!editingCourse && (
                <label>
                  Estudiantes a inscribir (opcional)
                  <select
                    multiple
                    value={formState.studentIds}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        studentIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                      })
                    }
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.person?.firstName} {student.person?.lastName} ({student.person?.email})
                      </option>
                    ))}
                  </select>
                  <small className="muted">Puedes agregarlos luego desde el detalle del curso.</small>
                </label>
              )}

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={savingCourse}>
                  {savingCourse ? "Guardando..." : editingCourse ? "Guardar cambios" : "Crear curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
