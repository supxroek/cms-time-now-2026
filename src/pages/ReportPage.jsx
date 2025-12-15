import { useState } from "react";
import { StatsCard } from "../components/molecules/StatsCard";
import { Input } from "../components/atoms/Input";
import { Label } from "../components/atoms/Label";
import {
  ReportsIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
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
        return <circle key={d.label} cx={x} cy={y} r={3} fill={stroke} />;
      })}
      {/* labels */}
      {data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * w;
        return (
          <text
            key={d.label}
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
      {slices.map((s) => {
        const x1 = cx + r * Math.cos(s.start);
        const y1 = cy + r * Math.sin(s.start);
        const x2 = cx + r * Math.cos(s.end);
        const y2 = cy + r * Math.sin(s.end);
        const large = s.slice > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        return (
          <path
            key={s.department}
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
        <g key={d.department} transform={`translate(${10}, ${10 + i * 18})`}>
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

export function ReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Mock Data for Monthly Summary
  const monthlySummary = [
    { month: "January", attendance: "98%", late: "2%", overtime: "120h" },
    { month: "February", attendance: "97%", late: "3%", overtime: "110h" },
    { month: "March", attendance: "99%", late: "1%", overtime: "130h" },
    { month: "April", attendance: "96%", late: "4%", overtime: "100h" },
    { month: "May", attendance: "98%", late: "2%", overtime: "125h" },
  ];

  // Mock Data for Charts
  const attendanceTrend = [
    { label: "01 Apr", value: 96 },
    { label: "08 Apr", value: 97 },
    { label: "15 Apr", value: 95 },
    { label: "22 Apr", value: 98 },
    { label: "29 Apr", value: 99 },
    { label: "06 May", value: 98 },
    { label: "13 May", value: 97 },
    { label: "20 May", value: 98 },
    { label: "27 May", value: 99 },
  ];

  const departmentDistribution = [
    { department: "IT", count: 32 },
    { department: "HR", count: 12 },
    { department: "Sales", count: 40 },
    { department: "Finance", count: 20 },
  ];

  const totalDept = departmentDistribution.reduce((s, d) => s + d.count, 0);

  // Mock Data for Individual Summary
  const individualSummary = [
    {
      name: "Somchai Jai-dee",
      department: "IT",
      attendanceRate: "100%",
      lateCount: 0,
      absentCount: 0,
      otHours: "10h",
    },
    {
      name: "Somsri Rak-ngan",
      department: "HR",
      attendanceRate: "95%",
      lateCount: 2,
      absentCount: 0,
      otHours: "5h",
    },
    {
      name: "Mana Dee-mak",
      department: "Sales",
      attendanceRate: "90%",
      lateCount: 4,
      absentCount: 1,
      otHours: "20h",
    },
  ];

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
          <button className="px-4 py-2 bg-white border border-gray-200 text-text-main rounded-md text-sm font-medium hover:bg-gray-50 transition-colors h-10">
            ส่งออก
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="พนักงานทั้งหมด"
          value="124"
          icon={<UsersIcon className="w-6 h-6" />}
          color="primary"
          trend="up"
          trendValue="4%"
        />
        <StatsCard
          title="ค่าเฉลี่ยการเข้าทำงาน"
          value="98.2%"
          icon={<ClockIcon className="w-6 h-6" />}
          color="success"
          trend="up"
          trendValue="1.2%"
        />
        <StatsCard
          title="ชั่วโมงล่วงเวลาทั้งหมด"
          value="450h"
          icon={<CalendarIcon className="w-6 h-6" />}
          color="warning"
          trend="down"
          trendValue="5%"
        />
        <StatsCard
          title="การมาสาย"
          value="12"
          icon={<ReportsIcon className="w-6 h-6" />}
          color="danger"
          trend="down"
          trendValue="2%"
        />
      </div>

      {/* OT Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-text-main mb-4">
          สรุปชั่วโมงล่วงเวลา
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">
              รวมชั่วโมง OT
            </div>
            <div className="text-2xl font-bold text-blue-800 mt-1">450h</div>
            <div className="text-xs text-blue-500 mt-1">
              +5% เมื่อเทียบเดือนก่อนหน้า
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-600 font-medium">
              ค่าเฉลี่ย OT ต่อพนักงาน
            </div>
            <div className="text-2xl font-bold text-purple-800 mt-1">3.6h</div>
            <div className="text-xs text-purple-500 mt-1">
              -2% เมื่อเทียบเดือนก่อนหน้า
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-sm text-orange-600 font-medium">
              ค่าใช้จ่าย OT (ประมาณการ)
            </div>
            <div className="text-2xl font-bold text-orange-800 mt-1">
              ฿45,000
            </div>
            <div className="text-xs text-orange-500 mt-1">
              คำนวณจากอัตราเฉลี่ย
            </div>
          </div>
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
                  <td className="px-6 py-4 text-text-sub">{item.department}</td>
                  <td className="px-6 py-4 text-success font-medium">
                    {item.attendanceRate}
                  </td>
                  <td className="px-6 py-4 text-warning">{item.lateCount}</td>
                  <td className="px-6 py-4 text-danger">{item.absentCount}</td>
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
                  <td className="px-6 py-4 text-text-sub">{item.overtime}</td>
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
                      — {d.count} ({Math.round((d.count / totalDept) * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
