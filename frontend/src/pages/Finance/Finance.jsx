import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { http } from "../../api/http";
import "./Finance.css";

const TYPES = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Egreso" },
];

export default function Finance() {
  const { user } = useOutletContext();
  const isAuthorized = user?.role === "ADMIN" || user?.role === "FINANCE";

  const [dashboard, setDashboard] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "INCOME",
    amount: "",
    concept: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  useEffect(() => {
    if (isAuthorized) {
      fetchSummary();
    }
  }, [isAuthorized]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, balanceResponse] = await Promise.all([
        http.get("/finance/dashboard"),
        http.get("/finance/balance"),
      ]);
      setDashboard(dashboardResponse.data);
      setBalance(balanceResponse.data);
      setError("");
    } catch (err) {
      setError("No se pudo cargar la información financiera.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    if (!formData.amount || !formData.concept) return;
    setSaving(true);
    try {
      await http.post("/finance", {
        type: formData.type,
        amount: Number(formData.amount),
        concept: formData.concept,
        date: formData.date,
        notes: formData.notes,
      });
      await fetchSummary();
      setFormData((prev) => ({ ...prev, amount: "", concept: "", notes: "" }));
      setError("");
    } catch (err) {
      setError("No se pudo registrar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="finance-page">
        <header className="finance-header">
          <h1>Acceso restringido</h1>
          <p>Solo el personal administrativo puede visualizar el módulo de caja.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <header className="finance-header">
        <h1>Dashboard de caja</h1>
        <p>Controla ingresos, egresos y balance general de la institución.</p>
      </header>

      {error && <div className="finance-error">{error}</div>}

      <div className="finance-grid">
        <section className="finance-card">
          <h3>Resumen general</h3>
          {loading && <span className="loading">Cargando...</span>}
          {balance && (
            <div className="stats-grid">
              <div>
                <span>Ingresos</span>
                <strong>${Number(balance.income).toFixed(2)}</strong>
              </div>
              <div>
                <span>Egresos</span>
                <strong>${Number(balance.expense).toFixed(2)}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong className={balance.balance >= 0 ? "positive" : "negative"}>
                  ${Number(balance.balance).toFixed(2)}
                </strong>
              </div>
            </div>
          )}
        </section>

        {dashboard && (
          <section className="finance-card">
            <h3>Totales por periodo</h3>
            <div className="period-grid">
              <div>
                <h4>Hoy</h4>
                <p>${Number(dashboard.daily?.income ?? 0).toFixed(2)} / ${Number(dashboard.daily?.expense ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <h4>Semana</h4>
                <p>${Number(dashboard.weekly?.income ?? 0).toFixed(2)} / ${Number(dashboard.weekly?.expense ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <h4>Mes</h4>
                <p>${Number(dashboard.monthly?.income ?? 0).toFixed(2)} / ${Number(dashboard.monthly?.expense ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </section>
        )}

        <section className="finance-card">
          <h3>Registrar movimiento</h3>
          <form className="finance-form" onSubmit={handleCreateRecord}>
            <label>
              Tipo
              <select value={formData.type} onChange={handleFormChange("type")}>
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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
              Concepto
              <input
                type="text"
                value={formData.concept}
                onChange={handleFormChange("concept")}
                placeholder="Pago de proveedores"
                required
              />
            </label>
            <label>
              Fecha
              <input type="date" value={formData.date} onChange={handleFormChange("date")} required />
            </label>
            <label>
              Notas
              <textarea value={formData.notes} onChange={handleFormChange("notes")} rows={3} />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
