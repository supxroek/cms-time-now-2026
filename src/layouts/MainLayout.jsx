import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchCompanyInfo } from "../store/slices/companySlice";
import { UserProfile } from "../components/molecules/UserProfile";
import { Button } from "../components/atoms/Button";
import { isTokenExpired } from "../utils/authUtils";
import {
  CompanyIcon,
  EmployeesIcon,
  DashboardIcon,
  RequestsIcon,
  ReportsIcon,
  SignOutIcon,
  ClockIcon,
} from "../components/atoms/Icons";

import PropTypes from "prop-types";

const MenuIcon = ({ name }) => {
  switch (name) {
    case "Dashboard":
      return <DashboardIcon />;
    case "Company":
      return <CompanyIcon />;
    case "Employees":
      return <EmployeesIcon />;
    case "Shifts":
      return <ClockIcon className="w-5 h-5" />;

    case "Requests":
      return <RequestsIcon />;
    case "Reports":
      return <ReportsIcon />;
    default:
      return null;
  }
};

export function MainLayout() {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company.companyInfo);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token, logout, location]);

  // Load company info (so branch is available)
  useEffect(() => {
    dispatch(fetchCompanyInfo());
  }, [dispatch]);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Company", path: "/company" },
    { name: "Employees", path: "/employees" },
    { name: "Shifts", path: "/shifts" },
    { name: "Requests", path: "/requests" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="xl:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img className="w-6 h-6" src="/src/assets/clock.png" alt="Clock" />
          <span className="text-xl font-bold text-primary">Time Now</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-500 hover:text-primary focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 xl:hidden w-full h-full cursor-default"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } xl:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <img className="w-6 h-6" src="/src/assets/clock.png" alt="Clock" />
            <span>Time Now</span>
          </h1>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="xl:hidden text-gray-500 hover:text-primary focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              onClick={() => setIsSidebarOpen(false)}
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
              name={user?.email || "User Name"}
              role={"Branch: " + (company?.branch || "N/A")}
              avatarUrl={user?.avatar}
              size="sm"
            />
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full mt-3 text-xs justify-start text-danger hover:bg-danger/5 hover:text-danger"
              icon={<SignOutIcon />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 xl:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="w-full xl:max-w-7xl mx-auto animate-fade-in">
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
