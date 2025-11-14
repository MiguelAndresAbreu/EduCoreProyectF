import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { login as loginMutation } from "../../api/graphqlOperations";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const remembered = localStorage.getItem("rememberUser");
    if (remembered) {
      setIdentifier(remembered);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedIdentifier = identifier.trim();
      if (!normalizedIdentifier) {
        throw new Error("Debes ingresar tu usuario o correo");
      }

      const data = await loginMutation(normalizedIdentifier, pass);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      if (remember) {
        localStorage.setItem("rememberUser", normalizedIdentifier);
      } else {
        localStorage.removeItem("rememberUser");
      }
      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Credenciales inválidas";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <p className="form-pretitle">EDUCORE</p>
      <p className="form-title">
        <strong>Iniciar Sesión</strong>
      </p>
      <div>
        <label>Usuario o correo:</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
      </div>
      <div className="login-options">
        <label className="remember-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
          />
          Recordar por 30 días
          <a href="#" className="form-forgot-link">
            Forgot password?
          </a>
        </label>
      </div>
      {error && <p className="login-error">{error}</p>}
      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
      <button
        type="button"
        className="register-btn"
        onClick={() => navigate("/register")}
      >
        Registrarte
      </button>
      <Link to="/overview" className="tour-link">
        Ver cómo funciona EduCore
      </Link>
    </form>
  );
}
