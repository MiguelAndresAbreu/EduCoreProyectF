import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import Overview from "../pages/Overview/Overview.jsx";
import DashboardLayout from "../pages/Dashboard/DashboardLayout.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Grades from "../pages/Grades/Grades.jsx";
import Payments from "../pages/Payments/Payments.jsx";
import Attendance from "../pages/Attendance/Attendance.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import Reports from "../pages/Reports/Reports.jsx";
import Finance from "../pages/Finance/Finance.jsx";
import Incidents from "../pages/Incidents/Incidents.jsx";
import Courses from "../pages/Courses/Courses.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/overview" element={<Overview />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
