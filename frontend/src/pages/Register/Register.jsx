import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http.js";
import "./Register.css";

const initialPersonState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
};

const initialUserState = {
  username: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [person, setPerson] = useState(initialPersonState);
  const [user, setUser] = useState(initialUserState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePerson = (field, value) => {
    setPerson((prev) => ({ ...prev, [field]: value }));
  };

  const updateUser = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonSubmit = (event) => {
    event.preventDefault();
    setError("");
    setStep(2);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (user.password !== user.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const payload = {
      username: user.username.trim(),
      password: user.password,
      email: person.email.trim(),
      firstName: person.firstName.trim(),
      lastName: person.lastName.trim(),
      phone: person.phone?.trim() || undefined,
      address: person.address?.trim() || undefined,
      birthDate: person.birthDate || undefined,
    };

    setLoading(true);
    try {
      const { data } = await http.post("/auth/register", payload);
      localStorage.setItem("token", data.accessToken);
      localStorage.removeItem("rememberUser");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo completar el registro";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Crear cuenta</h1>
        <p className="register-subtitle">
          Completa tus datos para unirte a EduCore y acceder a tu panel personalizado.
        </p>

        <div className="register-steps">
          <span className={`step ${step === 1 ? "active" : ""}`}>1. Datos personales</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2. Datos de usuario</span>
        </div>

        {error && <div className="register-error">{error}</div>}

        {step === 1 ? (
          <form className="register-form" onSubmit={handlePersonSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                type="text"
                value={person.firstName}
                onChange={(event) => updatePerson("firstName", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                type="text"
                value={person.lastName}
                onChange={(event) => updatePerson("lastName", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={person.email}
                onChange={(event) => updatePerson("email", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                value={person.phone}
                onChange={(event) => updatePerson("phone", event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <input
                id="address"
                type="text"
                value={person.address}
                onChange={(event) => updatePerson("address", event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Fecha de nacimiento</label>
              <input
                id="birthDate"
                type="date"
                value={person.birthDate}
                onChange={(event) => updatePerson("birthDate", event.target.value)}
              />
            </div>

            <div className="form-actions single">
              <button type="submit" className="register-next-btn">
                Continuar
              </button>
            </div>

            <button
              type="button"
              className="register-secondary-btn"
              onClick={() => navigate("/login")}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </form>
        ) : (
          <form className="register-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={person.email} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                id="username"
                type="text"
                value={user.username}
                onChange={(event) => updateUser("username", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={user.password}
                onChange={(event) => updateUser("password", event.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={user.confirmPassword}
                onChange={(event) => updateUser("confirmPassword", event.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="register-secondary-btn"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Atrás
              </button>
              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

