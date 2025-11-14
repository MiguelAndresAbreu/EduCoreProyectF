import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../../api/http.js";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const remembered = localStorage.getItem("rememberUser");
    if (remembered) {
      setUser(remembered);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await http.post("/auth/login", {
        username: user,
        password: pass,
      });
      localStorage.setItem("token", data.accessToken);
      if (remember) {
        localStorage.setItem("rememberUser", user);
      } else {
        localStorage.removeItem("rememberUser");
      }
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Credenciales inválidas";
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
        <label>Usuario:</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
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
