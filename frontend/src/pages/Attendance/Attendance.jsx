import "./Attendance.css";

export default function Attendance() {
  return (
    <div className="attendance-page">
      <header className="attendance-header">
        <p>Visualiza tu asistencia en cada materia y estadísticas generales.</p>
      </header>

      <div className="attendance-grid">
        {/* Tabla de asistencia */}
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Asistencias</th>
                <th>Inasistencias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Matemáticas</td>
                <td>18</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Lengua Española</td>
                <td>19</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Ciencias</td>
                <td>20</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="attendance-summary">
          <div className="summary-card">
            <h3>Total Clases</h3>
            <p>60</p>
          </div>
          <div className="summary-card">
            <h3>Asistencias</h3>
            <p>57</p>
          </div>
          <div className="summary-card">
            <h3>Inasistencias</h3>
            <p>3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
