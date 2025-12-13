import PropTypes from "prop-types";
import { EditIcon, DeleteIcon } from "../atoms/Icons";
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-main">
              {shift.shift_name || shift.name}
            </h3>
            <div className="text-2xl font-bold text-primary mt-1">
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

        <div className="space-y-3">
          <div>
            <div className="text-xs text-text-sub mb-2">วันทำงาน</div>
            <div className="flex gap-1">
              {daysOfWeek.map((day) => renderDayBadge(day))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <span className="text-sm text-text-sub">สถานะการใช้งาน</span>
        <Switch
          checked={shift.is_active}
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
