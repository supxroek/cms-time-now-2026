import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OrganizationPage } from "./pages/OrganizationPage";
import { EmployeePage } from "./pages/EmployeePage";
import { ShiftPage } from "./pages/ShiftPage";
import { AttendancePage } from "./pages/AttendancePage";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "./hooks/useAuth";

import PropTypes from "prop-types";

// Component สำหรับป้องกัน Route ที่ต้อง Login
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
};

// Component สำหรับป้องกัน Route ที่ Login แล้ว (เช่น หน้า Login)
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold text-text-muted">{title}</h2>
    <p className="text-text-sub mt-2">Coming Soon...</p>
  </div>
);

// กำหนด PropTypes สำหรับ PlaceholderPage
PlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired,
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (เข้าได้เฉพาะตอนยังไม่ Login) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes (ต้อง Login ก่อน) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organization" element={<OrganizationPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/shifts" element={<ShiftPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route
            path="/requests"
            element={<PlaceholderPage title="Request Management" />}
          />
          <Route
            path="/reports"
            element={<PlaceholderPage title="Reports" />}
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 Not Found - Redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
