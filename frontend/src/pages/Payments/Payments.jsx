import "./Payments.css";

export default function Payments() {
  return (
    <div className="payments-page">
      <header className="payments-header">
        <p>Consulta tus pagos, cuotas pendientes y el historial de transacciones.</p>
      </header>

      <div className="payments-grid">
        {/* Lista de pagos */}
        <div className="payments-list-container">
          <ul className="payments-list">
            <li>
              <span>Inscripción:</span>
              <span className="paid">Pagado ✔️</span>
            </li>
            <li>
              <span>Mensualidad Febrero:</span>
              <span className="pending">Pendiente ❌</span>
            </li>
            <li>
              <span>Mensualidad Marzo:</span>
              <span className="paid">Pagado ✔️</span>
            </li>
          </ul>
        </div>

        {/* Resumen de pagos */}
        <div className="payments-summary">
          <div className="summary-card">
            <h3>Total Pagado</h3>
            <p>$500</p>
          </div>
          <div className="summary-card">
            <h3>Total Pendiente</h3>
            <p>$200</p>
          </div>
        </div>
      </div>
    </div>
  );
}
