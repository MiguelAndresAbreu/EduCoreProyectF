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
  Bell,
  BarChart2,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { http } from "../../api/http.js";
import "./Dashboard.css";

export default function DashboardLayout() {
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(() => !profile);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setProfile(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const { data } = await http.get("/auth/me");
      setProfile(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
    } catch (error) {
      console.error("No se pudo cargar el perfil", error);
      localStorage.removeItem("currentUser");
      handleLogout();
    } finally {
      setLoadingProfile(false);
    }
  }, [handleLogout]);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    try {
      setLoadingNotifications(true);
      const { data } = await http.get(`/notifications/user/${profile.id}`);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("No se pudieron cargar las notificaciones", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [profile]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }
    fetchProfile();
  }, [fetchProfile, handleLogout]);

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
  }, [profile, fetchNotifications]);

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
    case "/reports":
      pageTitle = "Reportes";
      break;
    case "/incidents":
      pageTitle = "Incidencias";
      break;
    case "/finance":
      pageTitle = "Caja";
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
              <Link to="/reports">
                <BarChart2 size={18} />
                <span>Reportes</span>
              </Link>
            </li>
            {(profile?.role === "ADMIN" || profile?.role === "FINANCE") && (
              <li>
                <Link to="/finance">
                  <Wallet size={18} />
                  <span>Caja</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/incidents">
                <AlertTriangle size={18} />
                <span>Incidencias</span>
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
          <div
            className={`notification-bell ${notificationsOpen ? "active" : ""}`}
            onClick={async () => {
              const next = !notificationsOpen;
              setNotificationsOpen(next);
              if (next && profile) {
                try {
                  await http.put(`/notifications/user/${profile.id}/read`);
                  await fetchNotifications();
                } catch {
                  // ignore errors silently
                }
              }
            }}
          >
            <Bell size={20} />
            {notifications.some((notification) => !notification.read) && (
              <span className="notification-dot" />
            )}
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <header>
                  <strong>Notificaciones</strong>
                  {loadingNotifications && <span>Cargando...</span>}
                </header>
                <ul>
                  {notifications.length === 0 && !loadingNotifications && (
                    <li className="empty">Sin notificaciones</li>
                  )}
                  {notifications.map((notification) => (
                    <li key={notification.id} className={notification.read ? "read" : "unread"}>
                      <div>
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.stopPropagation();
                            try {
                              await http.put(`/notifications/${notification.id}/read`);
                              await fetchNotifications();
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          Marcar leído
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
