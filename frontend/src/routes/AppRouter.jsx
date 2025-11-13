import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import DashboardLayout from "../pages/Dashboard/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Grades from "../pages/Grades/Grades.jsx";
import Payments from "../pages/Payments/Payments.jsx";
import Attendance from "../pages/Attendance/Attendance.jsx";
import Profile from "../pages/Profile/Profile.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas con layout */}
        <Route element={<DashboardLayout pageTitle="Inicio" />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

<Route element={<DashboardLayout pageTitle="Calificaciones" />}>
  <Route path="/grades" element={<Grades />} />
</Route>

<Route element={<DashboardLayout pageTitle="Pagos" />}>
  <Route path="/payments" element={<Payments />} />
</Route>

<Route element={<DashboardLayout pageTitle="Asistencia" />}>
  <Route path="/attendance" element={<Attendance />} />
</Route>

<Route element={<DashboardLayout pageTitle="Perfil" />}>
  <Route path="/profile" element={<Profile />} />
</Route>
      </Routes>
    </BrowserRouter>
  );
}
