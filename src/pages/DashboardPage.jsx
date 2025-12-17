import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StatsCard } from "../components/molecules/StatsCard";
import { Modal } from "../components/molecules/Modal";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { Avatar } from "../components/atoms/Avatar";
import { Input } from "../components/atoms/Input";
import { Button } from "../components/atoms/Button";
import {
  DashboardIcon,
  ClockIcon,
  UserCheckIcon,
  UserXIcon,
  ReportsIcon,
  PauseIcon,
  CalendarIcon,
  SyncIcon,
} from "../components/atoms/Icons";
import {
  fetchDashboardData,
  fetchTodayAttendance,
  fetchRecentActivities,
  fetchEmployeeHistory,
  setSelectedEmployee,
  clearSelectedEmployee,
} from "../store/slices/dashboardSlice";

// Status options สำหรับ filter
const statuses = ["All", "working", "late", "break", "present", "absent"];

export function DashboardPage() {
  const dispatch = useDispatch();

  // Redux state
  const {
    stats,
    recentActivities,
    attendanceRecords,
    attendancePagination,
    departments,
    selectedEmployee,
    employeeHistory,
    isLoading,
    isLoadingActivities,
    isLoadingAttendance,
    isLoadingHistory,
    error,
  } = useSelector((state) => state.dashboard);

  // Local state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // โหลดข้อมูล Dashboard เมื่อ component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // โหลดข้อมูล attendance เมื่อ filter เปลี่ยน
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      department: filterDepartment,
      status: filterStatus,
      search: searchTerm,
    };
    dispatch(fetchTodayAttendance(params));
  }, [dispatch, currentPage, filterDepartment, filterStatus, searchTerm]);

  // Refresh กิจกรรมล่าสุดทุก 30 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchRecentActivities(20));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Handler สำหรับเปิด Modal พนักงาน
  const handleViewEmployee = useCallback(
    (record) => {
      dispatch(setSelectedEmployee(record));
      if (record.id) {
        dispatch(fetchEmployeeHistory({ employeeId: record.id, days: 5 }));
      }
    },
    [dispatch]
  );

  // Handler สำหรับปิด Modal
  const handleCloseModal = useCallback(() => {
    dispatch(clearSelectedEmployee());
  }, [dispatch]);

  // Handler สำหรับเปลี่ยนหน้า
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler สำหรับ search (debounce)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset หน้าเมื่อค้นหาใหม่
  };

  // Helper functions
  const getActivityLabel = (type) => {
    switch (type) {
      case "check-in":
        return "เข้างาน";
      case "check-out":
        return "ออกงาน";
      case "break-start":
        return "พักเบรค";
      case "break-end":
        return "กลับจากพัก";
      default:
        return type;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "check-in":
        return <UserCheckIcon className="w-4 h-4 text-white" />;
      case "check-out":
        return <UserXIcon className="w-4 h-4 text-white" />;
      case "break-start":
      case "break-end":
        return <ClockIcon className="w-4 h-4 text-white" />;
      default:
        return <DashboardIcon className="w-4 h-4 text-white" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "check-in":
        return "bg-success";
      case "check-out":
        return "bg-danger";
      case "break-start":
      case "break-end":
        return "bg-warning";
      default:
        return "bg-primary";
    }
  };

  // แสดง Loading state
  if (isLoading && !stats.totalEmployees) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <SyncIcon className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-text-sub">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แสดง Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-danger mb-2">เกิดข้อผิดพลาด: {error}</p>
          <Button onClick={() => dispatch(fetchDashboardData())}>
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <DashboardIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-main font-display">
            ตรวจสอบการเข้างาน
          </h2>
          <p className="text-text-sub text-sm">
            ดูประวัติการบันทึกเวลาเข้า-ออกงานของพนักงาน
          </p>
        </div>
        <div className="ml-auto text-sm text-text-sub font-mono">
          <div className="text-3xl font-bold text-primary font-mono tracking-tight leading-none">
            {currentTime.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-sm text-text-sub mt-1 font-medium">
            {currentTime.toLocaleDateString("th-TH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="พนักงานทั้งหมด"
          value={stats.totalEmployees?.toString() || "0"}
          icon={<UserCheckIcon className="w-6 h-6" />}
          color="primary"
        />
        <StatsCard
          title="เข้างานตรงเวลา"
          value={stats.onTimeCount?.toString() || "0"}
          icon={<ClockIcon className="w-6 h-6" />}
          color="success"
        />
        <StatsCard
          title="เข้างานสาย"
          value={stats.lateCount?.toString() || "0"}
          icon={<ReportsIcon className="w-6 h-6" />}
          color="warning"
        />
        <StatsCard
          title="ขาดงาน/ลา"
          value={stats.absentCount?.toString() || "0"}
          icon={<UserXIcon className="w-6 h-6" />}
          color="danger"
        />
      </div>

      {/* Top Section: Live Activity & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col h-125">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SyncIcon
                className={`w-5 h-5 text-primary ${
                  isLoadingActivities ? "animate-spin" : ""
                }`}
              />
              <h3 className="text-lg font-bold text-text-main">
                ความเคลื่อนไหวล่าสุด
              </h3>
            </div>
            <span className="text-xs text-text-sub bg-gray-100 px-2 py-1 rounded-full">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                LIVE
              </div>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {recentActivities.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-sub">
                ยังไม่มีกิจกรรมในวันนี้
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-text-main truncate">
                        {activity.user?.name || "ไม่ทราบชื่อ"}
                      </p>
                      <span className="font-mono text-sm font-bold text-primary/80">
                        {activity.time || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-sub">
                        {getActivityLabel(activity.type)}
                      </span>
                      <StatusBadge status={activity.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
            {/* Load More Button */}
            <div className="pt-2 text-center">
              <button
                className="text-sm text-primary hover:text-primary-hover font-medium"
                onClick={() => dispatch(fetchRecentActivities(50))}
              >
                โหลดข้อมูลเพิ่มเติม...
              </button>
            </div>
          </div>
        </div>

        {/* Right: Summary Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
            <h3 className="text-lg font-bold text-text-main mb-4">
              สถิติประจำวัน
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-sub">
                    เวลาเข้างานเฉลี่ย
                  </span>
                  <ClockIcon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-mono font-bold text-text-main">
                  {stats.avgCheckInTime || "--:--"}{" "}
                  <span className="text-xs text-text-sub font-sans">น.</span>
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-sub">
                    สายเฉลี่ย (นาที)
                  </span>
                  <ReportsIcon className="w-4 h-4 text-warning" />
                </div>
                <p className="text-2xl font-mono font-bold text-text-main">
                  {stats.avgLateMinutes || 0}{" "}
                  <span className="text-xs text-text-sub font-sans">นาที</span>
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-sub">
                    พักเบรคเฉลี่ย (นาที)
                  </span>
                  <PauseIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-mono font-bold text-text-main">
                  {stats.avgBreakMinutes || 0}{" "}
                  <span className="text-xs text-text-sub font-sans">นาที</span>
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-sub">ทำ OT (คน)</span>
                  <UserCheckIcon className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl font-mono font-bold text-text-main">
                  {stats.otCount || 0}{" "}
                  <span className="text-xs text-text-sub font-sans">คน</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Daily Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-text-main">
              รายการเข้างานวันนี้
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "ทุกแผนก" : dept}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "ทุกสถานะ" : status}
                </option>
              ))}
            </select>
            <div className="w-full sm:w-64">
              <Input
                placeholder="ค้นหาชื่อพนักงาน..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoadingAttendance ? (
            <div className="flex items-center justify-center py-12">
              <SyncIcon className="w-6 h-6 text-primary animate-spin" />
              <span className="ml-2 text-text-sub">กำลังโหลด...</span>
            </div>
          ) : (
            <table className="w-full min-w-250">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    พนักงาน
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">
                    แผนก
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-sub uppercase tracking-wider bg-blue-50/50">
                    เข้างาน
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-sub uppercase tracking-wider">
                    เริ่มพัก
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-sub uppercase tracking-wider">
                    สิ้นสุดพัก
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-sub uppercase tracking-wider bg-blue-50/50">
                    ออกงาน
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-orange-600 bg-orange-50/50">
                    OT เข้า
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-orange-600 bg-orange-50/50">
                    OT ออก
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-sub uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-sub uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={record.user?.avatar}
                          alt={record.user?.name}
                          size="sm"
                        />
                        <div>
                          <div className="text-sm font-medium text-text-main">
                            {record.user?.name || "ไม่ทราบชื่อ"}
                          </div>
                          <div className="text-xs text-text-sub">
                            {record.user?.role || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-sub">
                      {record.user?.department || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-main font-mono text-center bg-blue-50/30">
                      {record.checkIn}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-sub font-mono text-center">
                      {record.breakStart}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-sub font-mono text-center">
                      {record.breakEnd}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-main font-mono text-center bg-blue-50/30">
                      {record.checkOut}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600 font-mono text-center bg-orange-50/30">
                      {record.otCheckIn}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600 font-mono text-center bg-orange-50/30">
                      {record.otCheckOut}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white z-10">
                      <button
                        className="text-primary hover:text-primary-hover"
                        onClick={() => handleViewEmployee(record)}
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= attendancePagination.totalPages}
            >
              ถัดไป
            </Button>
          </div>
          <div className="hidden sm:flex flex-1 items-center justify-between">
            <div>
              <p className="text-sm text-text-sub">
                แสดง{" "}
                <span className="font-medium">
                  {attendancePagination.total > 0
                    ? (currentPage - 1) * attendancePagination.limit + 1
                    : 0}
                </span>{" "}
                ถึง{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * attendancePagination.limit,
                    attendancePagination.total
                  )}
                </span>{" "}
                จาก{" "}
                <span className="font-medium">
                  {attendancePagination.total}
                </span>{" "}
                รายการ
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {attendancePagination.totalPages > 0 &&
                  Array.from(
                    { length: Math.min(attendancePagination.totalPages, 5) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? "z-10 bg-primary text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= attendancePagination.totalPages}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {attendanceRecords.length === 0 && !isLoadingAttendance && (
          <div className="text-center py-12 text-text-sub">
            ไม่พบข้อมูลพนักงานตามเงื่อนไขที่กำหนด
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={handleCloseModal}
        title="รายละเอียดพนักงาน"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={selectedEmployee.user?.avatar}
                alt={selectedEmployee.user?.name}
                size="lg"
              />
              <div>
                <h3 className="text-xl font-bold text-text-main">
                  {selectedEmployee.user?.name || "ไม่ทราบชื่อ"}
                </h3>
                <p className="text-text-sub">
                  {selectedEmployee.user?.role || "-"} •{" "}
                  {selectedEmployee.user?.department || "-"}
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedEmployee.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-xs text-text-sub mb-1">เวลาเข้างาน</p>
                <p className="text-lg font-mono font-medium text-text-main">
                  {selectedEmployee.checkIn}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-text-sub mb-1">เริ่มพัก</p>
                <p className="text-lg font-mono font-medium text-text-main">
                  {selectedEmployee.breakStart}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-text-sub mb-1">สิ้นสุดพัก</p>
                <p className="text-lg font-mono font-medium text-text-main">
                  {selectedEmployee.breakEnd}
                </p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <p className="text-xs text-text-sub mb-1">เวลาออกงาน</p>
                <p className="text-lg font-mono font-medium text-text-main">
                  {selectedEmployee.checkOut}
                </p>
              </div>
            </div>

            {(selectedEmployee.otCheckIn !== "-" ||
              selectedEmployee.otCheckOut !== "-") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600/70 mb-1">OT เข้า</p>
                  <p className="text-lg font-mono font-medium text-orange-700">
                    {selectedEmployee.otCheckIn}
                  </p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600/70 mb-1">OT ออก</p>
                  <p className="text-lg font-mono font-medium text-orange-700">
                    {selectedEmployee.otCheckOut}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-text-main mb-3">
                ประวัติการเข้างานย้อนหลัง 5 วัน
              </h4>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <SyncIcon className="w-5 h-5 text-primary animate-spin" />
                  <span className="ml-2 text-text-sub text-sm">
                    กำลังโหลด...
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {employeeHistory.length === 0 ? (
                    <div className="text-center py-4 text-text-sub text-sm">
                      ไม่มีประวัติการเข้างาน
                    </div>
                  ) : (
                    employeeHistory.map((history) => (
                      <div
                        key={history.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              history.status === "On Time"
                                ? "bg-success"
                                : "bg-warning"
                            }`}
                          ></div>
                          <span className="text-sm text-text-main">
                            {history.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-mono text-text-sub">
                            {history.checkIn} - {history.checkOut}
                          </span>
                          <span
                            className={`font-medium ${
                              history.status === "On Time"
                                ? "text-success"
                                : "text-warning"
                            }`}
                          >
                            {history.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
