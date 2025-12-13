import PropTypes from "prop-types";
import { EditIcon, DeleteIcon, UsersIcon } from "../atoms/Icons";

export function OTCard({ ot, onEdit, onDelete }) {
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

  if (!ot) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-main">
            {ot.overTimeName || ot.name}
          </h3>
          <div className="text-2xl font-bold text-primary mt-1">
            {(ot.ot_start_time || ot.start_time)?.slice(0, 5)} -{" "}
            {(ot.ot_end_time || ot.end_time)?.slice(0, 5)}
          </div>
          {ot.rate && (
            <div className="text-sm text-text-sub mt-1">
              อัตราจ่าย: x{ot.rate}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(ot)}
            className="p-1 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="แก้ไข"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(ot)}
            className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
            title="ลบ"
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-text-sub">
          <UsersIcon className="w-4 h-4" />
          <span>
            {parseArrayField(ot.employeeId).length} พนักงานที่ได้รับสิทธิ์
          </span>
        </div>
      </div>
    </div>
  );
}

OTCard.propTypes = {
  ot: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
