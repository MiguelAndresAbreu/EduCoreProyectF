import "./Grades.css";

export default function Grades() {
  return (
    <div className="grades-page">
      <header className="grades-header">
        <p>Revisa tus calificaciones más recientes, promedio general y rendimiento por materia.</p>
      </header>

      <div className="grades-grid">
        {/* Tabla de calificaciones */}
        <div className="grades-table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Nota</th>
                <th>Profesor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Matemáticas</td>
                <td>90</td>
                <td>Lic. Gómez</td>
                <td>Excelente</td>
              </tr>
              <tr>
                <td>Lengua Española</td>
                <td>95</td>
                <td>Lic. Ramírez</td>
                <td>Excelente</td>
              </tr>
              <tr>
                <td>Ciencias</td>
                <td>88</td>
                <td>Lic. Rodríguez</td>
                <td>Bueno</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen de rendimiento */}
        <div className="grades-summary">
          <div className="summary-card">
            <h3>Promedio General</h3>
            <p>91.0</p>
          </div>
          <div className="summary-card">
            <h3>Materias Aprobadas</h3>
            <p>3 / 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
