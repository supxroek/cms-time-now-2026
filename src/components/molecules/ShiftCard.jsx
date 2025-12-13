import PropTypes from "prop-types";
import {
  EditIcon,
  DeleteIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
} from "../atoms/Icons";
import { Switch } from "../atoms/Switch";

export function ShiftCard({ shift, onEdit, onDelete, onStatusChange }) {
  const daysOfWeek = [
    { id: 0, label: "อา" },
    { id: 1, label: "จ" },
    { id: 2, label: "อ" },
    { id: 3, label: "พ" },
    { id: 4, label: "พฤ" },
    { id: 5, label: "ศ" },
    { id: 6, label: "ส" },
  ];

  const parseArrayField = (val) => {
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (Array.isArray(val)) return val;
    return [];
  };

  const workDays = parseArrayField(shift.date);
  const employeeIds = parseArrayField(shift.employeeId);

  const renderDayBadge = (day) => (
    <div
      key={day.id}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        workDays.includes(day.id)
          ? "bg-primary text-white"
          : "bg-gray-100 text-text-muted"
      }`}
    >
      {day.label}
    </div>
  );

  const getMonthName = (monthNum) => {
    if (!monthNum) return "";
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("th-TH", { month: "long" });
  };

  const isActive = shift.is_shift === 1;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all flex flex-col justify-between h-full ${
        isActive ? "" : "opacity-60 grayscale-[0.5] bg-gray-50"
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              {shift.shift_name || shift.name}
            </h3>
            <div className="text-2xl font-bold text-primary mt-1 font-mono">
              {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(shift)}
              className="p-1 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="แก้ไข"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(shift)}
              className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
              title="ลบ"
            >
              <DeleteIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Work Days */}
          <div>
            <div className="text-xs text-text-sub mb-2 uppercase tracking-wider">
              วันทำงาน
            </div>
            <div className="flex gap-1 flex-wrap">
              {daysOfWeek.map((day) => renderDayBadge(day))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* OT Status */}
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-text-sub mb-1">OT</div>
              <div className="font-medium text-sm flex items-center gap-1">
                {shift.is_night_shift === 1 ? (
                  <span className="text-success flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    <span>เปิดใช้งาน</span>
                  </span>
                ) : (
                  <span className="text-text-muted">ปิดใช้งาน</span>
                )}
              </div>
              {shift.is_night_shift === 1 && shift.is_specific === 1 && (
                <div className="text-xs text-primary mt-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {getMonthName(shift.month)}
                </div>
              )}
            </div>

            {/* Break Time */}
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-text-sub mb-1">เวลาพัก</div>
              <div className="font-medium text-sm">
                {shift.is_break === 1 ? (
                  <div className="flex items-center gap-1 text-text-main">
                    <ClockIcon className="w-3 h-3 text-text-sub" />
                    {shift.break_start_time?.slice(0, 5)} -{" "}
                    {shift.break_end_time?.slice(0, 5)}
                  </div>
                ) : (
                  <span className="text-text-muted">ไม่มีพัก</span>
                )}
              </div>
            </div>

            {/* Employees */}
            <div className="bg-gray-50 p-2 rounded border border-gray-100 col-span-2">
              <div className="flex justify-between items-center">
                <div className="text-xs text-text-sub">พนักงานในกะ</div>
                <div className="font-medium text-sm flex items-center gap-1 text-primary">
                  <UsersIcon className="w-3 h-3" />
                  {employeeIds.length} คน
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <span className="text-sm text-text-sub font-medium">
          สถานะการใช้งาน
        </span>
        <Switch
          checked={shift.is_shift === 1}
          onChange={(checked) => onStatusChange(shift, checked)}
        />
      </div>
    </div>
  );
}

ShiftCard.propTypes = {
  shift: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
