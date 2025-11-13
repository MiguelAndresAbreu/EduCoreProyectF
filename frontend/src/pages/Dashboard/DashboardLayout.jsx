import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
import { http } from "../../api/http.js";
import "./Dashboard.css";

export default function DashboardLayout() {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const { data } = await http.get("/auth/me");
      setProfile(data);
    } catch (error) {
      handleLogout();
    } finally {
      setLoadingProfile(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }
    fetchProfile();
  }, [fetchProfile, handleLogout]);

  const displayName = profile
    ? `${profile.person?.firstName ?? ""} ${profile.person?.lastName ?? ""}`.trim()
    : "Usuario";
  const avatarUrl =
    profile?.person?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "U")}&background=1e3a8a&color=fff`;

  let pageTitle = "Panel";
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
      pageTitle = profile?.role === "TEACHER" ? "Panel del Docente" : "Panel del Estudiante";
      break;
    default:
      pageTitle = "";
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? "" : "collapsed"}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          {sidebarOpen && <h2 className="sidebar-title">EduCore</h2>}
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

      <header className="dashboard-header">
        <h1>{pageTitle}</h1>
        <div className="user-menu">
          <div className="user-info" onClick={() => setMenuOpen(!menuOpen)}>
            <img src={avatarUrl} alt="Usuario" />
            <span>{displayName || "Cargando..."}</span>
            <ChevronDown size={18} />
          </div>

          {menuOpen && (
            <div className="dropdown-menu">
              <p>{profile?.role ?? ""}</p>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <Outlet context={{ user: profile, refreshUser: fetchProfile, loading: loadingProfile }} />
      </main>
    </div>
  );
}
