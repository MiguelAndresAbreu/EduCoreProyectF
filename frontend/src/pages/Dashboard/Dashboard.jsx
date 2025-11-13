import "./DashboardPage.css";

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-welcome-header">
        <h1>Bienvenido, Jhon Michael</h1>
        <p>Selecciona una opción del menú para comenzar a explorar tu panel.</p>
      </header>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Calificaciones</h3>
          <p>Consulta tus notas y rendimiento por materia.</p>
        </div>
        <div className="card">
          <h3>Pagos</h3>
          <p>Revisa el estado de tus pagos y cuotas pendientes.</p>
        </div>
        <div className="card">
          <h3>Asistencia</h3>
          <p>Mira tu historial de asistencia y clases faltadas.</p>
        </div>
        <div className="card">
          <h3>Perfil</h3>
          <p>Visualiza y actualiza tus datos personales de manera segura.</p>
        </div>
      </div>
    </div>
  );
}
