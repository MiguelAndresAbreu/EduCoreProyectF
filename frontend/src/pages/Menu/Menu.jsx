import { NavLink } from "react-router-dom";
import "./Menu.css";

export default function Menu() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <span className="navbar-logo">EduCore</span>
        <div className="navbar-links">
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/students" className="nav-link">
            Estudiantes
          </NavLink>
          <NavLink to="/courses" className="nav-link">
            Cursos
          </NavLink>
          <NavLink to="/grades" className="nav-link">
            Notas
          </NavLink>
          <NavLink to="/attendance" className="nav-link">
            Asistencia
          </NavLink>
          <NavLink to="/payments" className="nav-link">
            Pagos
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
