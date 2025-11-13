import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  Home,
  BookOpen,
  CreditCard,
  Calendar,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import "./Dashboard.css";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setUser({
      name: "Jhon Michael Sierra Rodríguez",
      role: "Estudiante",
      avatar:
        "https://ui-avatars.com/api/?name=Jhon+Sierra&background=1e3a8a&color=fff",
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Título dinámico según la ruta
  let pageTitle = "Panel del Estudiante";
  switch (location.pathname) {
    case "/grades":
      pageTitle = "Calificaciones";
      break;
    case "/payments":
      pageTitle = "Pagos";
      break;
    case "/attendance":
      pageTitle = "Asistencia";
      break;
    case "/profile":
      pageTitle = "Perfil";
      break;
    case "/dashboard":
      pageTitle = "Panel del Estudiante";
      break;
    default:
      pageTitle = "";
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? "" : "collapsed"}`}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          {sidebarOpen && <h2 className="sidebar-title">EduCore</h2>}
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className="dashboard-menu">
          <ul>
            <li>
              <Link to="/dashboard">
                <Home size={18} />
                <span>Inicio</span>
              </Link>
            </li>
            <li>
              <Link to="/grades">
                <BookOpen size={18} />
                <span>Calificaciones</span>
              </Link>
            </li>
            <li>
              <Link to="/payments">
                <CreditCard size={18} />
                <span>Pagos</span>
              </Link>
            </li>
            <li>
              <Link to="/attendance">
                <Calendar size={18} />
                <span>Asistencia</span>
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <User size={18} />
                <span>Perfil</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Header */}
      <header className="dashboard-header">
        <h1>{pageTitle}</h1>
        <div className="user-menu">
          <div className="user-info" onClick={() => setMenuOpen(!menuOpen)}>
            <img src={user?.avatar} alt="Usuario" />
            <span>{user?.name}</span>
            <ChevronDown size={18} />
          </div>

          {menuOpen && (
            <div className="dropdown-menu">
              <p>{user?.role}</p>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
