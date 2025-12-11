import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MainLayout } from "./layouts/MainLayout";
import { useAuth } from "./hooks/useAuth";

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
          <Route
            path="/organization"
            element={<PlaceholderPage title="Organization Management" />}
          />
          <Route
            path="/employees"
            element={<PlaceholderPage title="Employee Management" />}
          />
          <Route
            path="/shifts"
            element={<PlaceholderPage title="Shift Management" />}
          />
          <Route
            path="/attendance"
            element={<PlaceholderPage title="Attendance Monitor" />}
          />
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
