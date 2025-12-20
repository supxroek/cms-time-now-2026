import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportData } from "../store/slices/reportSlice";
import { StatsCard } from "../components/molecules/StatsCard";
import { Input } from "../components/atoms/Input";
import { Label } from "../components/atoms/Label";
import { Modal } from "../components/molecules/Modal";
import {
  ReportsIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  SettingsIcon,
} from "../components/atoms/Icons";

// Simple inline SVG Line Chart
function LineChart({
  data = [],
  width = 600,
  height = 200,
  stroke = "#3b82f6",
}) {
  if (!data.length) return null;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const padding = 20;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * w;
      const y = padding + h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const pointsArray = points.split(" ").map((p) => p.split(",").map(Number));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
      {data.map((d, i) => {
        const [x, y] = pointsArray[i];
        return <circle key={d.label || i} cx={x} cy={y} r={3} fill={stroke} />;
      })}
      {/* labels */}
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * w;
        return (
          <text
            key={d.label || i}
            x={x}
            y={height - 4}
            fontSize="10"
            textAnchor="middle"
            fill="#6b7280"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
// Line Chart Props
LineChart.propTypes = {
  data: Array,
  width: Number,
  height: Number,
  stroke: String,
};

// Simple inline SVG Pie Chart
function PieChart({ data = [], width = 200, height = 200, colors }) {
  const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 6;
  const defaultColors = ["#3b82f6", "#a78bfa", "#fb923c", "#ef4444", "#10b981"];

  // Precompute start and end angles without mutating variables during render
  const slices = data.reduce((acc, d, i) => {
    const prevEnd = acc.length ? acc[acc.length - 1].end : -Math.PI / 2;
    const slice = (d.count / total) * Math.PI * 2;
    const start = prevEnd;
    const end = prevEnd + slice;
    acc.push({ ...d, start, end, slice, index: i });
    return acc;
  }, []);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {slices.map((s, i) => {
        const x1 = cx + r * Math.cos(s.start);
        const y1 = cy + r * Math.sin(s.start);
        const x2 = cx + r * Math.cos(s.end);
        const y2 = cy + r * Math.sin(s.end);
        const large = s.slice > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        return (
          <path
            key={s.department || i}
            d={path}
            fill={
              (colors || defaultColors)[
                s.index % (colors || defaultColors).length
              ]
            }
            stroke="#fff"
          />
        );
      })}
      {/* legend */}
      {data.map((d, i) => (
        <g
          key={d.department || i}
          transform={`translate(${10}, ${10 + i * 18})`}
        >
          <rect
            width="12"
            height="12"
            fill={
              (colors || [
                "#3b82f6",
                "#a78bfa",
                "#fb923c",
                "#ef4444",
                "#10b981",
              ])[i % 5]
            }
          />
          <text x="18" y="10" fontSize="11" fill="#374151">
            {d.department} ({d.count})
          </text>
        </g>
      ))}
    </svg>
  );
}
// Pie Chart Props
PieChart.propTypes = {
  data: Array,
  width: Number,
  height: Number,
  colors: Array,
};

// LocalStorage keys to persist selected card IDs and their order
const STATS_STORAGE_KEY = "report:selectedStatsIds";
const HOURS_STORAGE_KEY = "report:selectedHourIds";

export function ReportPage() {
  const dispatch = useDispatch();

  // Redux state
  const {
    overviewStats,
    hourSummary,
    attendanceTrend: attendanceTrendData,
    departmentDistribution: departmentDistributionData,
    monthlySummary: monthlySummaryData,
    individualSummary: individualSummaryData,
    loading,
    error,
  } = useSelector((state) => state.report);

  // ตั้งค่าเริ่มต้นเป็นเดือนปัจจุบัน
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [showStatsSettings, setShowStatsSettings] = useState(false);
  const [showHourSettings, setShowHourSettings] = useState(false);

  // Fetch data on mount only
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    dispatch(
      fetchReportData({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        year: currentYear,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Refetch when search button is clicked
  const handleSearch = () => {
    const currentYear = new Date().getFullYear();
    dispatch(fetchReportData({ startDate, endDate, year: currentYear }));
  };

  // Stats cards - ต้องเลือก 4 อันเสมอ (เก็บเป็น array ของ id ที่เลือก)
  const STATS_DEFAULT = [
    "totalEmployees",
    "avgAttendance",
    "totalOvertime",
    "avgLate",
  ];

  // Hour summary cards - ต้องเลือก 3 อันเสมอ
  const HOURS_DEFAULT = ["totalOT", "avgOT", "maxOT"];

  // Initialize from localStorage if available to remember selection + order
  const [selectedStatsIds, setSelectedStatsIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STATS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore parse errors
      console.error(e);
    }
    return STATS_DEFAULT;
  });

  const [selectedHourIds, setSelectedHourIds] = useState(() => {
    try {
      const raw = localStorage.getItem(HOURS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore parse errors
      console.error(e);
    }
    return HOURS_DEFAULT;
  });

  // Keep localStorage in sync if other code updates these arrays
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(selectedStatsIds));
    } catch (e) {
      console.error(e);
    }
  }, [selectedStatsIds]);

  useEffect(() => {
    try {
      localStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify(selectedHourIds));
    } catch (e) {
      console.error(e);
    }
  }, [selectedHourIds]);

  // Available Stats Cards Configuration - ใช้ค่าจาก API
  const allStatsCards = [
    {
      id: "totalEmployees",
      title: "พนักงานทั้งหมด",
      value: overviewStats?.totalEmployees?.toString() || "0",
      icon: "users",
      color: "primary",
      trend: "up",
      trendValue: "4%",
    },
    {
      id: "avgAttendance",
      title: "ค่าเฉลี่ยการเข้าทำงาน",
      value: `${overviewStats?.avgAttendanceRate || 0}%`,
      icon: "clock",
      color: "success",
      trend: "up",
      trendValue: "1.2%",
    },
    {
      id: "totalOvertime",
      title: "ชั่วโมงล่วงเวลาทั้งหมด",
      value: `${overviewStats?.totalOvertimeHours || 0}h`,
      icon: "calendar",
      color: "warning",
      trend: "down",
      trendValue: "5%",
    },
    {
      id: "avgLate",
      title: "ค่าเฉลี่ยการมาสาย",
      value: `${overviewStats?.avgLateRate || 0}%`,
      icon: "reports",
      color: "danger",
      trend: "down",
      trendValue: "2%",
    },
    {
      id: "totalAbsent",
      title: "จำนวนขาดงาน",
      value: overviewStats?.absentCount?.toString() || "0",
      icon: "calendar",
      color: "danger",
      trend: "down",
      trendValue: "3%",
    },
    {
      id: "totalLeave",
      title: "จำนวนลางาน",
      value: overviewStats?.leaveCount?.toString() || "0",
      icon: "calendar",
      color: "info",
      trend: "up",
      trendValue: "1%",
    },
    {
      id: "newEmployees",
      title: "พนักงานใหม่",
      value: overviewStats?.newEmployees?.toString() || "0",
      icon: "users",
      color: "success",
      trend: "up",
      trendValue: "2%",
    },
    {
      id: "resignedEmployees",
      title: "พนักงานลาออก",
      value: overviewStats?.resignedEmployees?.toString() || "0",
      icon: "users",
      color: "danger",
      trend: "down",
      trendValue: "1%",
    },
  ];

  // Hour Summary Cards Configuration - ใช้ค่าจาก API
  const allHourCards = [
    {
      id: "totalOT",
      title: "รวมชั่วโมง OT",
      value: `${hourSummary?.totalOTHours || 0}h`,
      subtext: "+5% เมื่อเทียบเดือนก่อนหน้า",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-600",
      valueColor: "text-blue-800",
      subTextColor: "text-blue-500",
    },
    {
      id: "avgOT",
      title: "ค่าเฉลี่ย OT ต่อพนักงาน",
      value: `${hourSummary?.avgOTPerEmployee || 0}h`,
      subtext: "-2% เมื่อเทียบเดือนก่อนหน้า",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      textColor: "text-purple-600",
      valueColor: "text-purple-800",
      subTextColor: "text-purple-500",
    },
    {
      id: "maxOT",
      title: "ชั่วโมง OT สูงสุด",
      value: `${hourSummary?.maxOTHours || 0}h ต่อพนักงาน`,
      subtext: "คำนวณจากอัตราเฉลี่ย",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      textColor: "text-orange-600",
      valueColor: "text-orange-800",
      subTextColor: "text-orange-500",
    },
    {
      id: "totalWorkHours",
      title: "รวมชั่วโมงทำงาน",
      value: `${(hourSummary?.totalWorkHours || 0).toLocaleString()}h`,
      subtext: "ชั่วโมงทำงานปกติทั้งหมด",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-600",
      valueColor: "text-green-800",
      subTextColor: "text-green-500",
    },
    {
      id: "avgWorkHours",
      title: "ค่าเฉลี่ยชั่วโมงทำงาน",
      value: `${hourSummary?.avgWorkHoursPerWeek || 40}h/สัปดาห์`,
      subtext: "ต่อพนักงาน 1 คน",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-100",
      textColor: "text-teal-600",
      valueColor: "text-teal-800",
      subTextColor: "text-teal-500",
    },
    {
      id: "leaveHours",
      title: "รวมชั่วโมงลางาน",
      value: `${hourSummary?.totalBreakHours || 0}h`,
      subtext: "ลาป่วย, ลากิจ, ลาพักร้อน",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      textColor: "text-amber-600",
      valueColor: "text-amber-800",
      subTextColor: "text-amber-500",
    },
    {
      id: "trainingHours",
      title: "รวมชั่วโมงอบรม",
      value: `${hourSummary?.trainingHours || 0}h`,
      subtext: "+15% เมื่อเทียบเดือนก่อนหน้า",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      textColor: "text-indigo-600",
      valueColor: "text-indigo-800",
      subTextColor: "text-indigo-500",
    },
    {
      id: "meetingHours",
      title: "รวมชั่วโมงประชุม",
      value: `${hourSummary?.meetingHours || 0}h`,
      subtext: "เฉลี่ย 1.6h ต่อพนักงาน",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
      textColor: "text-pink-600",
      valueColor: "text-pink-800",
      subTextColor: "text-pink-500",
    },
    {
      id: "otCost",
      title: "ค่าใช้จ่าย OT",
      value: `฿${(hourSummary?.estimatedOTCost || 0).toLocaleString()}`,
      subtext: "+8% เมื่อเทียบเดือนก่อนหน้า",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      textColor: "text-red-600",
      valueColor: "text-red-800",
      subTextColor: "text-red-500",
    },
  ];

  // Icon mapping for stats cards
  const iconMap = {
    users: <UsersIcon className="w-6 h-6" />,
    clock: <ClockIcon className="w-6 h-6" />,
    calendar: <CalendarIcon className="w-6 h-6" />,
    reports: <ReportsIcon className="w-6 h-6" />,
  };

  // Toggle stats card selection (max 4)
  const toggleStatsCard = (cardId) => {
    setSelectedStatsIds((prev) => {
      let next;
      if (prev.includes(cardId)) {
        // ลบออก
        next = prev.filter((id) => id !== cardId);
      } else if (prev.length < 4) {
        // เพิ่มเข้าไป (append -> preserves ordering)
        next = [...prev, cardId];
      } else {
        next = prev; // ถ้าครบ 4 แล้ว ไม่ทำอะไร
      }
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Toggle hour card selection (max 3)
  const toggleHourCard = (cardId) => {
    setSelectedHourIds((prev) => {
      let next;
      if (prev.includes(cardId)) {
        // ลบออก
        next = prev.filter((id) => id !== cardId);
      } else if (prev.length < 3) {
        // เพิ่มเข้าไป (append -> preserves ordering)
        next = [...prev, cardId];
      } else {
        next = prev; // ถ้าครบ 3 แล้ว ไม่ทำอะไร
      }
      try {
        localStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Get selected stats cards in order
  const selectedStatsCards = selectedStatsIds
    .map((id) => allStatsCards.find((card) => card.id === id))
    .filter(Boolean);

  // Get selected hour cards in order
  const selectedHourCards = selectedHourIds
    .map((id) => allHourCards.find((card) => card.id === id))
    .filter(Boolean);

  // ใช้ข้อมูลจาก API (หรือค่าเริ่มต้นถ้ายังโหลดไม่เสร็จ)
  const monthlySummary = monthlySummaryData || [];
  const attendanceTrend = attendanceTrendData || [];
  const departmentDistribution = departmentDistributionData || [];
  const individualSummary = individualSummaryData || [];

  const totalDept =
    departmentDistribution.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ReportsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">รายงาน</h1>
            <p className="text-text-sub mt-1">ภาพรวมและการวิเคราะห์</p>
          </div>
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <Label>วันที่เริ่ม</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <Label>วันที่สิ้นสุด</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors h-10 disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "ค้นหา"}
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-text-main rounded-md text-sm font-medium hover:bg-gray-50 transition-colors h-10">
            ส่งออก
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-text-sub">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-text-main">ภาพรวมสถิติ</h2>
              <button
                onClick={() => setShowStatsSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-sub hover:text-text-main hover:bg-gray-100 rounded-md transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                ตั้งค่าการ์ด
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {selectedStatsCards.map((card) => (
                <StatsCard
                  key={card.id}
                  title={card.title}
                  value={card.value}
                  icon={
                    <span className={`text-${card.color}`}>
                      {React.cloneElement(iconMap[card.icon], {
                        className: "w-4 h-4",
                      })}
                    </span>
                  }
                  color={card.color}
                  trend={card.trend}
                  trendValue={card.trendValue}
                />
              ))}
            </div>
          </div>

          {/* Hour Summary Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-main">สรุปชั่วโมง</h2>
              <button
                onClick={() => setShowHourSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-sub hover:text-text-main hover:bg-gray-100 rounded-md transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                ตั้งค่าการ์ด
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedHourCards.map((card) => (
                <div
                  key={card.id}
                  className={`p-4 ${card.bgColor} rounded-lg border ${card.borderColor}`}
                >
                  <div className={`text-sm ${card.textColor} font-medium`}>
                    {card.title}
                  </div>
                  <div className={`text-2xl font-bold ${card.valueColor} mt-1`}>
                    {card.value}
                  </div>
                  <div className={`text-xs ${card.subTextColor} mt-1`}>
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Summary Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-text-main">
                สรุปการเข้างานรายบุคคล
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-text-sub font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">พนักงาน</th>
                    <th className="px-6 py-3">แผนก</th>
                    <th className="px-6 py-3">อัตราการเข้าทำงาน</th>
                    <th className="px-6 py-3">สาย (วัน)</th>
                    <th className="px-6 py-3">ขาดงาน (วัน)</th>
                    <th className="px-6 py-3">ชั่วโมง OT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {individualSummary.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-main">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-text-sub">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-success font-medium">
                        {item.attendanceRate}
                      </td>
                      <td className="px-6 py-4 text-warning">
                        {item.lateCount}
                      </td>
                      <td className="px-6 py-4 text-danger">
                        {item.absentCount}
                      </td>
                      <td className="px-6 py-4 text-primary">{item.otHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Summary Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-text-main">
                Monthly Attendance Summary
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-text-sub font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3">Attendance Rate</th>
                    <th className="px-6 py-3">Late Rate</th>
                    <th className="px-6 py-3">Total Overtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlySummary.map((item) => (
                    <tr
                      key={item.month}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-text-main">
                        {item.month}
                      </td>
                      <td className="px-6 py-4 text-success font-medium">
                        {item.attendance}
                      </td>
                      <td className="px-6 py-4 text-danger">{item.late}</td>
                      <td className="px-6 py-4 text-text-sub">
                        {item.overtime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-64">
              <h3 className="text-sm font-medium text-text-main mb-2">
                Attendance Trend
              </h3>
              <div className="w-full h-52">
                <LineChart data={attendanceTrend} stroke="#3b82f6" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-64">
              <h3 className="text-sm font-medium text-text-main mb-2">
                Department Distribution
              </h3>
              <div className="w-full h-52 flex items-center">
                <div className="w-1/2 h-full">
                  <PieChart
                    data={departmentDistribution}
                    width={220}
                    height={220}
                  />
                </div>
                <div className="w-1/2 pl-4">
                  <ul className="text-sm text-text-sub">
                    {departmentDistribution.map((d) => (
                      <li key={d.department} className="mb-2">
                        <span className="font-medium">{d.department}</span>
                        <span className="ml-2">
                          — {d.count} ({Math.round((d.count / totalDept) * 100)}
                          %)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stats Settings Modal */}
      <Modal
        isOpen={showStatsSettings}
        onClose={() => setShowStatsSettings(false)}
        title="ตั้งค่าการ์ดภาพรวมสถิติ"
        size="lg"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-sub">
              เลือกการ์ด 4 รายการที่ต้องการแสดง (คลิกเพื่อเลือก/ยกเลิก)
            </p>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                selectedStatsIds.length === 4
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {selectedStatsIds.length}/4
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allStatsCards.map((card) => {
              const isSelected = selectedStatsIds.includes(card.id);
              const order = selectedStatsIds.indexOf(card.id) + 1;
              const isDisabled = !isSelected && selectedStatsIds.length >= 4;

              const getButtonClass = () => {
                if (isSelected)
                  return `bg-${card.color}/5 border-${card.color} shadow-sm`;
                if (isDisabled)
                  return "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed";
                // show subtle colored border when selectable but not selected
                return `bg-white border-gray-200 hover:border-${card.color}-200 hover:shadow-sm`;
              };

              const getIconClass = () => {
                if (isSelected)
                  return `p-2 rounded-md bg-${card.color}/10 text-${card.color}`;
                if (isDisabled)
                  return "p-2 rounded-md bg-gray-100 text-gray-400";
                // selectable but not selected -> show light color tone
                return `p-2 rounded-md bg-${card.color}/5 text-${card.color}`;
              };

              return (
                <button
                  key={card.id}
                  onClick={() => toggleStatsCard(card.id)}
                  disabled={isDisabled}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${getButtonClass()}`}
                >
                  {isSelected && (
                    <span
                      className={`absolute top-2 right-2 w-6 h-6 bg-${card.color} text-white text-xs font-bold rounded-full flex items-center justify-center`}
                    >
                      {order}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={getIconClass()}>
                      {React.cloneElement(iconMap[card.icon], {
                        className: "w-4 h-4",
                      })}
                    </div>
                    <p className="font-medium text-text-main text-sm">
                      {card.title}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-text-main">
                    {card.value}
                  </p>
                  <p className="text-xs text-text-sub mt-1">
                    {card.trend === "up" ? "↑" : "↓"} {card.trendValue}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedStatsIds.length !== 4 && (
            <p className="text-sm text-warning text-center">
              กรุณาเลือกให้ครบ 4 การ์ด
            </p>
          )}
        </div>
      </Modal>

      {/* Hour Settings Modal */}
      <Modal
        isOpen={showHourSettings}
        onClose={() => setShowHourSettings(false)}
        title="ตั้งค่าการ์ดสรุปชั่วโมง"
        size="lg"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-sub">
              เลือกการ์ด 3 รายการที่ต้องการแสดง (คลิกเพื่อเลือก/ยกเลิก)
            </p>
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                selectedHourIds.length === 3
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {selectedHourIds.length}/3
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {allHourCards.map((card) => {
              const isSelected = selectedHourIds.includes(card.id);
              const order = selectedHourIds.indexOf(card.id) + 1;
              const isDisabled = !isSelected && selectedHourIds.length >= 3;

              const getButtonClass = () => {
                if (isSelected)
                  return `${card.bgColor} ${card.borderColor} border-2 shadow-sm`;
                if (isDisabled)
                  return "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed";
                // selectable but not selected: subtle neutral border, color on hover
                let hoverBase = "gray";
                if (card.id.startsWith("total")) hoverBase = "blue";
                else if (card.textColor)
                  hoverBase = card.textColor.replace("text-", "");
                return `bg-white border-gray-200 hover:border-${hoverBase}-200 hover:shadow-sm`;
              };

              const getTextClass = () => {
                if (isDisabled) return "text-text-sub";
                // show card color for available but not selected to aid UX
                return card.textColor;
              };

              const getValueClass = () => {
                if (isDisabled) return "text-text-main";
                return card.valueColor;
              };

              return (
                <button
                  key={card.id}
                  onClick={() => toggleHourCard(card.id)}
                  disabled={isDisabled}
                  className={`relative p-3 rounded-lg border-2 text-left transition-all ${getButtonClass()}`}
                >
                  {isSelected && (
                    <span
                      className={`${card.valueColor
                        .replace("text-", "bg-")
                        .replace(
                          "-800",
                          "-600"
                        )} absolute top-2 right-2 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center`}
                    >
                      {order}
                    </span>
                  )}
                  <p
                    className={`font-medium text-sm ${
                      isSelected ? card.textColor : getTextClass()
                    }`}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      isSelected ? card.valueColor : getValueClass()
                    }`}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {card.subtext}
                  </p>
                </button>
              );
            })}
          </div>
          {selectedHourIds.length !== 3 && (
            <p className="text-sm text-warning text-center">
              กรุณาเลือกให้ครบ 3 การ์ด
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
