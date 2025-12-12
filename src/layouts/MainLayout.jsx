import { useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserProfile } from "../components/molecules/UserProfile";
import { Button } from "../components/atoms/Button";
import { isTokenExpired } from "../utils/authUtils";
import {
  CompanyIcon,
  EmployeesIcon,
  AttendanceIcon,
  RequestsIcon,
  ReportsIcon,
  SignOutIcon,
  ClockIcon,
} from "../components/atoms/Icons";

import PropTypes from "prop-types";

const MenuIcon = ({ name }) => {
  switch (name) {
    case "การเข้าทำงาน":
      return <AttendanceIcon />;
    case "บริษัท":
      return <CompanyIcon />;
    case "พนักงาน":
      return <EmployeesIcon />;
    case "กะงาน":
      return <ClockIcon className="w-5 h-5" />;

    case "คำขอ":
      return <RequestsIcon />;
    case "รายงาน":
      return <ReportsIcon />;
    default:
      return null;
  }
};

export function MainLayout() {
  const { user, logout, token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout, location]);

  const menuItems = [
    { name: "การเข้าทำงาน", path: "/attendance" },
    { name: "บริษัท", path: "/company" },
    { name: "พนักงาน", path: "/employees" },
    { name: "กะงาน", path: "/shifts" },
    { name: "คำขอ", path: "/requests" },
    { name: "รายงาน", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <img className="w-6 h-6" src="/src/assets/clock.png" alt="Clock" />
            <span>Time Now</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-primary/5 text-primary font-medium shadow-sm"
                    : "text-text-sub hover:bg-gray-50 hover:text-text-main"
                }`
              }
            >
              <MenuIcon name={item.name} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Logged in as</p>
            <UserProfile
              name={user?.email || "User"}
              role={user?.role || "Admin"}
              avatarUrl={user?.avatar}
              size="sm"
            />
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full mt-3 text-xs justify-start text-danger hover:bg-danger/5 hover:text-danger"
            >
              <SignOutIcon />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// กำหนด PropTypes สำหรับ MenuIcon (เพื่อไม่ให้มันแสดงคำเตือนเฉยๆ สามารถลบได้ถ้าไม่ต้องการ)
MenuIcon.propTypes = {
  name: PropTypes.string.isRequired,
};
