import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuth } from "./hooks/useAuth";

// Component สำหรับป้องกัน Route ที่ต้อง Login
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Component สำหรับป้องกัน Route ที่ Login แล้ว (เช่น หน้า Login)
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
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
