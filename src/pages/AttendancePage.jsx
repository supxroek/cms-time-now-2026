import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceHistory } from "../store/slices/attendanceSlice";
import { Input } from "../components/atoms/Input";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { StatsCard } from "../components/molecules/StatsCard";
import {
  AttendanceIcon,
  ClockIcon,
  UserCheckIcon,
  UserXIcon,
  ReportsIcon,
} from "../components/atoms/Icons";
import { formatDate, formatTime } from "../utils/dateUtils";

// Mock data used when no real history is available
const MOCK_HISTORY = (() => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return [
    {
      id: "m-1",
      date: today,
      employee_name: "Somchai Prasert",
      department_name: "IT",
      check_in_time: "08:01",
      check_out_time: "17:00",
      break_time: "01:00",
      overtime: 0.5,
      status: "On Time",
    },
    {
      id: "m-2",
      date: today,
      employee_name: "Suda Wong",
      department_name: "HR",
      check_in_time: "08:35",
      check_out_time: "17:05",
      break_time: "01:00",
      overtime: 0,
      status: "Late",
    },
    {
      id: "m-3",
      date: today,
      employee_name: "Kanokwan Chai",
      department_name: "Sales",
      check_in_time: null,
      check_out_time: null,
      status: "Absent",
    },
    {
      id: "m-4",
      date: today,
      employee_name: "Arthit Srisuk",
      department_name: "Finance",
      check_in_time: null,
      check_out_time: null,
      status: "Leave",
    },
    {
      id: "m-5",
      date: yesterday,
      employee_name: "Nicha Kaew",
      department_name: "Marketing",
      check_in_time: "09:10",
      check_out_time: "18:00",
      break_time: null,
      overtime: 2,
      status: "Late",
    },
  ];
})();

export function AttendancePage() {
  const dispatch = useDispatch();
  const { history: rawHistory, isLoading } = useSelector(
    (state) => state.attendance
  );
  // Ensure history is always an array to avoid runtime errors when backend
  // returns an object or null. Use MOCK_HISTORY when no real data is present.
  const history =
    Array.isArray(rawHistory) && rawHistory.length > 0
      ? rawHistory
      : MOCK_HISTORY;
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    dispatch(fetchAttendanceHistory({ date: filterDate }));
  }, [dispatch, filterDate]);

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  // Calculate stats from history
  const stats = useMemo(() => {
    const total = history.length;
    const onTime = history.filter(
      (r) => r.status === "Present" || r.status === "On Time"
    ).length;
    const late = history.filter((r) => r.status === "Late").length;
    const absent = history.filter((r) => r.status === "Absent").length;
    const leave = history.filter((r) => r.status === "Leave").length;

    return { total, onTime, late, absent, leave };
  }, [history]);

  // Render break time as start - end and show a badge when currently on break
  const renderBreakCell = useCallback((record) => {
    const bt = record.break_time;

    const getFormatted = (t) => {
      if (t === null || t === undefined) return null;
      if (/^\d{2}:\d{2}$/.test(t)) return t;
      try {
        return formatTime(t, "HH:mm");
      } catch {
        return String(t);
      }
    };

    const extractStartEnd = (b) => {
      if (b && typeof b === "object") {
        return {
          start: b.start ?? null,
          end: b.end ?? null,
          isOnBreak: !!b.isOnBreak,
        };
      }
      if (typeof b === "string" && b.includes("-")) {
        const [s, e] = b.split("-");
        return { start: s || null, end: e || null, isOnBreak: false };
      }
      return { start: null, end: null, isOnBreak: false };
    };

    const {
      start: sFromBt,
      end: eFromBt,
      isOnBreak: isOnBreakFromBt,
    } = extractStartEnd(bt);

    const start = sFromBt ?? record.break_start ?? record.breakStart ?? null;
    const end = eFromBt ?? record.break_end ?? record.breakEnd ?? null;
    const isOnBreak = isOnBreakFromBt || !!record.is_break || !!record.on_break;

    if (start || end) {
      const s = getFormatted(start);
      const e = getFormatted(end);
      return (
        <div>
          <div>
            {s ? `เวลาเริ่มพัก ${s}` : "-"}
            {e ? ` และสิ้นสุดการพัก ${e}` : ""}
          </div>
          {!e && isOnBreak && (
            <div className="mt-1">
              <StatusBadge status="กำลังพักอยู่" type="warning" />
            </div>
          )}
        </div>
      );
    }

    if (bt != null) {
      if (typeof bt === "number") {
        return `${bt} ชม.`;
      }
      if (/^\d{1,2}:\d{2}$/.test(bt)) return bt;
      try {
        return formatTime(bt, "HH:mm");
      } catch {
        return String(bt);
      }
    }

    return "-";
  }, []);

  // Prepare table body content using useMemo to avoid nested ternary and
  // duplicated implementations. This produces the rows or placeholder
  // messages depending on loading / data state.
  const tableBody = useMemo(() => {
    const rows = [];

    if (isLoading) {
      rows.push(
        <tr key="loading">
          <td colSpan={7} className="px-6 py-8 text-center text-text-sub">
            Loading...
          </td>
        </tr>
      );
      return rows;
    }

    if (!history || history.length === 0) {
      rows.push(
        <tr key="empty">
          <td colSpan={7} className="px-6 py-8 text-center text-text-muted">
            ไม่พบข้อมูลการเข้างานในวันที่เลือก
          </td>
        </tr>
      );
      return rows;
    }

    return history.map((record) => {
      const formatField = (val) => {
        if (val == null) return "-";
        if (/^\d{2}:\d{2}$/.test(val)) return val;
        try {
          return formatTime(val, "HH:mm");
        } catch {
          return String(val);
        }
      };

      const checkInDisplay = record.check_in_time
        ? formatField(record.check_in_time)
        : "-";

      const checkOutDisplay = record.check_out_time
        ? formatField(record.check_out_time)
        : "-";

      let overtimeDisplay = "-";
      if (record.overtime != null) {
        if (typeof record.overtime === "number") {
          overtimeDisplay = `${record.overtime} ชม.`;
        } else if (/^\d{1,2}:\d{2}$/.test(record.overtime)) {
          overtimeDisplay = record.overtime;
        } else {
          try {
            overtimeDisplay = formatTime(record.overtime, "HH:mm");
          } catch {
            overtimeDisplay = String(record.overtime);
          }
        }
      }

      let statusType = "success";
      if (record.status === "Late") statusType = "warning";
      else if (record.status === "Absent") statusType = "danger";

      return (
        <tr key={record.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 text-text-main">
            {formatDate(record.date)}
          </td>
          <td className="px-6 py-4 font-medium text-text-main">
            {record.employee_name}
            <div className="text-xs text-text-sub font-normal mt-0.5">
              {record.department_name || "-"}
            </div>
          </td>
          <td className="px-6 py-4 text-text-main font-mono">
            {checkInDisplay}
          </td>
          <td className="px-6 py-4 text-text-main font-mono">
            {checkOutDisplay}
          </td>
          <td className="px-6 py-4 text-text-main font-mono">
            {renderBreakCell(record)}
          </td>
          <td className="px-6 py-4 text-text-main font-mono">
            {overtimeDisplay}
          </td>
          <td className="px-6 py-4">
            <StatusBadge status={record.status || "ปกติ"} type={statusType} />
          </td>
        </tr>
      );
    });
  }, [isLoading, history, renderBreakCell]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <AttendanceIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-main font-display">
            ตรวจสอบการเข้างาน
          </h2>
          <p className="text-text-sub text-sm">
            ดูประวัติการบันทึกเวลาเข้า-ออกงานของพนักงาน
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="เข้างานทั้งหมด"
          value={stats.total}
          icon={<UserCheckIcon className="w-6 h-6" />}
          color="primary"
        />
        <StatsCard
          title="เข้างานตรงเวลา"
          value={stats.onTime}
          icon={<ClockIcon className="w-6 h-6" />}
          color="success"
        />
        <StatsCard
          title="เข้างานสาย"
          value={stats.late}
          icon={<ReportsIcon className="w-6 h-6" />}
          color="warning"
        />
        <StatsCard
          title="ขาดงาน/ลา"
          value={stats.absent + stats.leave}
          icon={<UserXIcon className="w-6 h-6" />}
          color="danger"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="w-full max-w-xs">
            <Input type="date" value={filterDate} onChange={handleDateChange} />
          </div>
          <div className="text-sm text-text-sub">
            รายการทั้งหมด {history.length} รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-text-sub font-semibold">
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">พนักงาน</th>
                <th className="px-6 py-4">เวลาเข้างาน</th>
                <th className="px-6 py-4">เวลาออกงาน</th>
                <th className="px-6 py-4">เวลาพัก</th>
                <th className="px-6 py-4">OT</th>
                <th className="px-6 py-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{tableBody}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
