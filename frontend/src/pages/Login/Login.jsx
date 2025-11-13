import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <form className="login-container" onSubmit={handleSubmit}>
      <p class="form-pretitle">EDUCORE</p>
      <p class="form-title">
        <strong>Iniciar Sesion</strong>
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
          Recordar por 30 días{" "}
          <a href="#" class="form-forgot-link">
            Forgot password?
          </a>
        </label>
      </div>
      <button className="Login-btn" type="submit">
        Ingresar
      </button>
      <button
        type="button"
        className="register-btn"
        onClick={() => alert("Funcionalidad de registro pendiente")}
      >
        Registrarte
      </button>
    </form>
  );
}
