import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/atoms/Button";
import { StatsCard } from "../components/molecules/StatsCard";
import { formatDate, formatTime, getCurrentDate } from "../utils/dateUtils";
import {
  UsersIcon,
  ClockIcon,
  UserCheckIcon,
  UserXIcon,
  CalendarIcon,
} from "../components/atoms/Icons";

export function DashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentDate());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getCurrentDate()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock Data (Replace with API calls later)
  const stats = [
    {
      id: "total-employees",
      title: "พนักงานทั้งหมด",
      value: "124",
      icon: <UsersIcon />,
      color: "primary",
      trend: "up",
      trendValue: "12%",
    },
    {
      id: "on-time-today",
      title: "เข้างานตรงเวลาวันนี้",
      value: "108",
      icon: <UserCheckIcon />,
      color: "success",
      trend: "up",
      trendValue: "95%",
    },
    {
      id: "late-today",
      title: "สายวันนี้",
      value: "12",
      icon: <ClockIcon />,
      color: "warning",
      trend: "down",
      trendValue: "5%",
    },
    {
      id: "absent-today",
      title: "ขาดงานวันนี้",
      value: "4",
      icon: <UserXIcon />,
      color: "danger",
      trend: "down",
      trendValue: "2%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-main">แดชบอร์ด</h2>
          <p className="text-text-sub mt-1">
            ยินดีต้อนรับกลับ, {user?.email || "ผู้ใช้งาน"}
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-3xl font-bold text-primary font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="text-text-muted">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions / Recent Activity Placeholder */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-text-main mb-4">เมนูลัด</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon /> ขอลาหยุด
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ClockIcon /> ขอทำโอที
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
