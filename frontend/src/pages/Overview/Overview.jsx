import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  CalendarCheck,
  Wallet,
  BarChart3,
  UsersRound,
  AlertTriangle,
} from "lucide-react";
import "./Overview.css";

const coreModules = [
  {
    title: "Panel integral",
    description: "Navegación lateral dinámica, notificaciones y resumen personalizado por rol.",
    details: "Los usuarios autenticados acceden a un panel central que agrupa accesos rápidos, indicadores y mensajes importantes.",
    icon: LayoutDashboard,
  },
  {
    title: "Seguridad y usuarios",
    description: "Autenticación con JWT, registro y perfiles conectados a personas y roles.",
    details: "Cada cuenta se vincula con datos personales, roles (ADMIN, TEACHER, STUDENT, FINANCE, STAFF) y permisos contextuales.",
    icon: ShieldCheck,
  },
  {
    title: "Gestión académica",
    description: "Cursos, materias, calificaciones e inscripciones para docentes y estudiantes.",
    details: "Los profesores pueden registrar notas y asistencia; los estudiantes consultan su historial en tiempo real.",
    icon: GraduationCap,
  },
  {
    title: "Asistencia y reportes",
    description: "Registro de asistencia por fecha y generación de reportes académicos.",
    details: "Ofrece vistas filtradas para identificar ausencias, puntualidad y métricas clave por curso o estudiante.",
    icon: CalendarCheck,
  },
  {
    title: "Finanzas y pagos",
    description: "Control de cuentas por cobrar, registro de transacciones y estados de cuenta.",
    details: "El personal de caja puede registrar pagos, consultar balances y generar reportes de caja en un solo lugar.",
    icon: Wallet,
  },
  {
    title: "Alertas e incidencias",
    description: "Módulo para seguimiento de eventos y comunicación con la comunidad educativa.",
    details: "Permite asignar incidencias, marcarlas como atendidas y notificar a los usuarios involucrados.",
    icon: AlertTriangle,
  },
];

const collaboration = [
  {
    title: "Perfiles conectados",
    copy: "Cada usuario está asociado a una persona y puede tener rol docente, administrativo o estudiantil.",
    icon: UsersRound,
  },
  {
    title: "Datos en tiempo real",
    copy: "El frontend consulta a la API mediante Axios y actualiza la interfaz sin recargar la página.",
    icon: BarChart3,
  },
  {
    title: "API documentada",
    copy: "NestJS publica documentación Swagger para probar endpoints y compartir contratos con terceros.",
    icon: ShieldCheck,
  },
];

export default function Overview() {
  return (
    <div className="overview-page">
      <header className="overview-hero">
        <span className="tag">Descubre EduCore</span>
        <h1>ERP académico para gestionar tu institución en un solo lugar</h1>
        <p>
          EduCore integra autenticación, módulos académicos, finanzas y comunicación interna. Usa esta guía visual para conocer
          las capacidades principales antes de iniciar sesión.
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" to="/login">
            Ir al inicio de sesión
          </Link>
          <a className="btn-secondary" href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer">
            Ver API Swagger
          </a>
        </div>
      </header>

      <section className="overview-section">
        <h2>Funciones destacadas</h2>
        <div className="cards-grid">
          {coreModules.map(({ title, description, details, icon: Icon }) => (
            <article key={title} className="feature-card">
              <div className="icon-wrapper">
                <Icon size={26} />
              </div>
              <h3>{title}</h3>
              <p className="summary">{description}</p>
              <p className="details">{details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overview-section highlighted">
        <h2>Cómo trabajan juntos los módulos</h2>
        <div className="cards-grid three">
          {collaboration.map(({ title, copy, icon: Icon }) => (
            <article key={title} className="feature-card compact">
              <div className="icon-wrapper">
                <Icon size={24} />
              </div>
              <h3>{title}</h3>
              <p className="summary">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="overview-section callout">
        <h2>Prueba el flujo completo</h2>
        <ol>
          <li>
            <strong>Configura el backend</strong> con PostgreSQL y las variables de entorno indicadas en el README.
          </li>
          <li>
            <strong>Crea un usuario</strong> desde `/api/auth/register` y obtén un token iniciando sesión en la web.
          </li>
          <li>
            <strong>Recorre el panel</strong> para registrar calificaciones, pagos, asistencia e incidencias según tu rol.
          </li>
        </ol>
        <Link className="btn-primary" to="/login">
          Comenzar ahora
        </Link>
      </section>
    </div>
  );
}
