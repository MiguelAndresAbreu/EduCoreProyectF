import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchPaymentsByStudent, createPayment as createPaymentMutation } from "../../api/graphqlOperations";
import "./Payments.css";

const METHODS = [
  { value: "CASH", label: "Efectivo" },
  { value: "CARD", label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
];

const STATUSES = [
  { value: "PAID", label: "Pagado" },
  { value: "PENDING", label: "Pendiente" },
];

export default function Payments() {
  const { user } = useOutletContext();
  const isFinance = user?.role === "ADMIN" || user?.role === "FINANCE";
  const isStudent = user?.role === "STUDENT";

  const [studentId, setStudentId] = useState(isStudent ? user?.student?.id ?? "" : "");
  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({ paid: 0, pending: 0, balance: 0 });
  const [formData, setFormData] = useState({
    studentId: "",
    concept: "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    method: "CASH",
    status: "PAID",
  });
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    concept: "",
    amount: "",
    method: "CARD",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isStudent && user?.student?.id) {
      fetchPayments(user.student.id);
    }
  }, [isStudent, user?.student?.id]);

  const fetchPayments = async (id) => {
    try {
      setLoading(true);
      const data = await fetchPaymentsByStudent(Number(id));
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setTotals(data.accountStatus ?? { paid: 0, pending: 0, balance: 0 });
      setError("");
    } catch (err) {
      setError("No se pudo obtener la informacion de pagos.");
      setPayments([]);
      setTotals({ paid: 0, pending: 0, balance: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    if (!formData.studentId || !formData.amount) return;
    setSaving(true);
    try {
      await createPaymentMutation({
        studentId: Number(formData.studentId),
        concept: formData.concept,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        method: formData.method,
        status: formData.status,
      });
      await fetchPayments(formData.studentId);
      setFormData((prev) => ({ ...prev, concept: "", amount: "" }));
      setError("");
    } catch (err) {
      setError("No se pudo registrar el pago. Verifica la informacion ingresada.");
    } finally {
      setSaving(false);
    }
  };

  const handleStudentPay = async (event) => {
    event.preventDefault();
    const studentPaymentId = Number(user?.student?.id);
    if (!studentPaymentId) {
      setError("No se encontro el id de estudiante.");
      return;
    }
    if (!paymentModal.amount || !paymentModal.concept) {
      setError("Completa los datos del pago.");
      return;
    }
    setPaying(true);
    try {
      await createPaymentMutation({
        studentId: studentPaymentId,
        concept: paymentModal.concept.trim(),
        amount: Number(paymentModal.amount),
        paymentDate: new Date().toISOString().slice(0, 10),
        method: paymentModal.method,
        status: "PAID",
      });
      await fetchPayments(user.student.id);
      setPaymentModal({ open: false, concept: "", amount: "", method: "CARD" });
      setError("");
    } catch (err) {
      setError("No se pudo procesar el pago.");
    } finally {
      setPaying(false);
    }
  };

  const currentTotals = useMemo(() => totals, [totals]);

  return (
    <div className="payments-page">
      <header className="payments-header">
        <h1>Control de pagos y estado de cuenta</h1>
        <p>Consulta tu historial de pagos, registra nuevas transacciones y monitorea la deuda pendiente.</p>
      </header>

      {error && <div className="payments-error">{error}</div>}

      {isFinance && (
        <section className="payment-form wide">
          <h3>Registrar nuevo pago</h3>
          <form onSubmit={handleCreatePayment} className="payment-form-grid">
            <label>
              ID Estudiante
              <input
                type="number"
                value={formData.studentId}
                onChange={handleFormChange("studentId")}
                required
              />
            </label>
            <label>
              Concepto
              <input
                type="text"
                value={formData.concept}
                onChange={handleFormChange("concept")}
                placeholder="Mensualidad marzo"
                required
              />
            </label>
            <label>
              Monto
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleFormChange("amount")}
                required
              />
            </label>
            <label>
              Fecha de pago
              <input type="date" value={formData.paymentDate} onChange={handleFormChange("paymentDate")} required />
            </label>
            <label>
              Metodo
              <select value={formData.method} onChange={handleFormChange("method")}>
                {METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select value={formData.status} onChange={handleFormChange("status")}>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="payment-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Registrar pago"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="payments-grid">
        <div className="payments-list-container">
          <div className="table-header">
            <h2>Historial de pagos</h2>
            <div className="header-actions">
              {isFinance && (
                <form
                  className="lookup-inline"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (studentId) {
                      fetchPayments(studentId);
                    }
                  }}
                >
                  <label>
                    Consultar estudiante
                    <div className="lookup-fields">
                      <input
                        type="number"
                        placeholder="ID del estudiante"
                        value={studentId}
                        onChange={(event) => setStudentId(event.target.value)}
                        required
                      />
                      <button type="submit">Buscar</button>
                    </div>
                  </label>
                </form>
              )}
              {loading && <span className="loading">Cargando...</span>}
            </div>
          </div>
          <table className="payments-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Metodo</th>
                <th>Estado</th>
                <th>Fecha</th>
                {isStudent && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.concept}</td>
                  <td>${Number(payment.amount).toFixed(2)}</td>
                  <td>{METHODS.find((method) => method.value === payment.method)?.label ?? payment.method}</td>
                  <td>
                    <span className={`status ${payment.status === "PAID" ? "paid" : "pending"}`}>
                      {STATUSES.find((status) => status.value === payment.status)?.label ?? payment.status}
                    </span>
                  </td>
                  <td>{payment.paymentDate}</td>
                  {isStudent && (
                    <td>
                      {payment.status !== "PAID" ? (
                        <button
                          type="button"
                          className="pay-action"
                          onClick={() =>
                            setPaymentModal({
                              open: true,
                              concept: payment.concept ?? "Pago",
                              amount: payment.amount ? String(payment.amount) : "",
                              method: "CARD",
                            })
                          }
                        >
                          Pagar
                        </button>
                      ) : (
                        <span className="paid-label">Pagado</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan={isStudent ? 6 : 5} className="empty">
                    No hay pagos registrados para este estudiante.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="payments-summary">
          <div className="summary-card highlight">
            <h4>Total pagado</h4>
            <p>${currentTotals.paid?.toFixed?.(2) ?? Number(currentTotals.paid).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Pendiente</h4>
            <p>${currentTotals.pending?.toFixed?.(2) ?? Number(currentTotals.pending).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h4>Balance</h4>
            <p className={currentTotals.balance >= 0 ? "positive" : "negative"}>
              ${currentTotals.balance?.toFixed?.(2) ?? Number(currentTotals.balance).toFixed(2)}
            </p>
          </div>
        </aside>
      </div>

      {paymentModal.open && (
        <div className="modal-backdrop" onClick={() => setPaymentModal((prev) => ({ ...prev, open: false }))}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar pago</h3>
              <button className="ghost-btn" onClick={() => setPaymentModal((prev) => ({ ...prev, open: false }))}>
                Cerrar
              </button>
            </div>
            <form className="payment-modal-form" onSubmit={handleStudentPay}>
              <label>
                Concepto
                <input
                  type="text"
                  value={paymentModal.concept}
                  onChange={(e) => setPaymentModal((prev) => ({ ...prev, concept: e.target.value }))}
                  required
                />
              </label>
              <label>
                Monto
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </label>
              <label>
                Metodo
                <select
                  value={paymentModal.method}
                  onChange={(e) => setPaymentModal((prev) => ({ ...prev, method: e.target.value }))}
                >
                  {METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setPaymentModal((prev) => ({ ...prev, open: false }))}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={paying}>
                  {paying ? "Procesando..." : "Pagar ahora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
