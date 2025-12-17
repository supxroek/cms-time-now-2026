import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CompanyPage } from "./pages/CompanyPage";
import { EmployeePage } from "./pages/EmployeePage";
import { ShiftPage } from "./pages/ShiftPage";
import { RequestPage } from "./pages/RequestPage";
import { ReportPage } from "./pages/ReportPage";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "./hooks/useAuth";
import { Toast } from "./components/atoms/Toast";
import { ConnectionStatus } from "./components/molecules/ConnectionStatus";
import { ErrorBoundary } from "./components/molecules/ErrorBoundary";

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
    <ErrorBoundary message="เกิดข้อผิดพลาดในการโหลดแอปพลิเคชัน">
      <BrowserRouter>
        {/* Toast Container สำหรับแสดง notifications */}
        <Toast position="top-right" />

        {/* Connection Status Indicator */}
        <ConnectionStatus />

        <Routes>
          {/* Public Routes (เข้าได้เฉพาะตอนยังไม่ Login) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
          </Route>

          {/* Protected Routes (ต้อง Login ก่อน) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/shifts" element={<ShiftPage />} />
            <Route path="/requests" element={<RequestPage />} />
            <Route path="/reports" element={<ReportPage />} />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 404 Not Found - Redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
