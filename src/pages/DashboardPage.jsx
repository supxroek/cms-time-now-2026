import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { checkIn, checkOut } from "../store/slices/attendanceSlice";
import { Button } from "../components/atoms/Button";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { UserProfile } from "../components/molecules/UserProfile";
import { formatDate, formatTime, getCurrentDate } from "../utils/dateUtils";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const { status, todayRecord, isLoading, error } = useSelector(
    (state) => state.attendance
  );

  const [currentTime, setCurrentTime] = useState(getCurrentDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    // ให้บันทึกเวลาปัจจุบันเป็นเวลาเข้างาน
    dispatch(checkIn({ timestamp: new Date().toISOString() }));
  };

  const handleCheckOut = () => {
    dispatch(checkOut({ timestamp: new Date().toISOString() }));
  };

  // สร้างป้ายสถานะวันนี้
  const todayStatusLabel = (() => {
    if (status === "working") return "Working";
    if (todayRecord) return "Present";
    return "Absent";
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-brand-primary">Time Now</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserProfile
            name={user?.name || "User"}
            role={user?.role || "Employee"}
            avatarUrl={user?.avatar}
          />
          <Button variant="ghost" onClick={logout} className="text-sm">
            ออกจากระบบ
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-card p-8 shadow-sm text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-bold text-text-header">
              {formatTime(currentTime)}
            </h2>
            <p className="text-text-muted">{formatDate(currentTime)}</p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            {status === "working" ? (
              <Button
                variant="danger"
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-40 h-12 text-lg"
              >
                {isLoading ? "กำลังบันทึก..." : "ลงเวลาออก"}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleCheckIn}
                disabled={isLoading}
                className="w-40 h-12 text-lg"
              >
                {isLoading ? "กำลังบันทึก..." : "ลงเวลาเข้า"}
              </Button>
            )}
          </div>

          {error && <p className="text-status-error text-sm mt-2">{error}</p>}
        </div>

        {/* Today's Status */}
        <div className="bg-white rounded-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">สถานะวันนี้</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-text-muted">เวลาเข้างาน</span>
              <span className="font-medium">
                {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <StatusBadge status={todayStatusLabel} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
