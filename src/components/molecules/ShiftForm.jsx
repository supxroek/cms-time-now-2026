import PropTypes from "prop-types";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { Switch } from "../atoms/Switch";

export function ShiftForm({
  formData,
  setFormData,
  overtimes,
  daysOfWeek,
  toggleDay,
  departments,
  filteredEmployees,
  searchTerm,
  setSearchTerm,
  handleSelectAll,
  handleClearAll,
  toggleEmployeeId,
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>ชื่อกะงาน</Label>
        <Input
          placeholder="เช่น กะเช้า, กะบ่าย"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>เวลาเข้างาน</Label>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) =>
              setFormData({ ...formData, start_time: e.target.value })
            }
          />
        </div>
        <div>
          <Label>เวลาออกงาน</Label>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) =>
              setFormData({ ...formData, end_time: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Label>อนุญาตให้ทำ OT</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-sub">
            {formData.ot_enabled ? "ใช่" : "ไม่ใช่"}
          </span>
          <Switch
            checked={formData.ot_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, ot_enabled: checked })
            }
          />
        </div>
      </div>

      {formData.ot_enabled && (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <Label className="mb-2 block">รายการ OT ที่มีอยู่</Label>
          {overtimes.length > 0 ? (
            <ul className="space-y-1 text-sm text-text-sub">
              {overtimes.map((ot) => (
                <li key={ot.id} className="flex justify-between">
                  <span>{ot.overTimeName || ot.name}</span>
                  <span>
                    {(ot.ot_start_time || ot.start_time)?.slice(0, 5)} -{" "}
                    {(ot.ot_end_time || ot.end_time)?.slice(0, 5)}{" "}
                    {ot.rate ? `(x${ot.rate})` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">
              ยังไม่มีรายการ OT (ไปที่แท็บจัดการการทำงานล่วงเวลาเพื่อสร้าง)
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <Label>มีเวลาพัก</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-sub">
            {formData.break_enabled ? "มี" : "ไม่มี"}
          </span>
          <Switch
            checked={formData.break_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, break_enabled: checked })
            }
          />
        </div>
      </div>

      {formData.break_enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>เวลาเริ่มพัก</Label>
            <Input
              type="time"
              value={formData.break_start_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  break_start_time: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label>เวลาสิ้นสุดพัก</Label>
            <Input
              type="time"
              value={formData.break_end_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  break_end_time: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      <div>
        <Label>วันทำงาน</Label>
        <div className="flex gap-2 mt-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                formData.work_days.includes(day.id)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-gray-200 text-text-sub hover:border-primary hover:text-primary"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>มอบหมายให้</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="assign_type"
                value="individual"
                checked={formData.assign_type === "individual"}
                onChange={() =>
                  setFormData({ ...formData, assign_type: "individual" })
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">รายบุคคล</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="assign_type"
                value="department"
                checked={formData.assign_type === "department"}
                onChange={() =>
                  setFormData({ ...formData, assign_type: "department" })
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">รายแผนก</span>
            </label>
          </div>
        </div>

        {formData.assign_type === "department" ? (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded-md p-2 max-h-60 overflow-y-auto bg-gray-50">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`dept-${dept.id}`}
                    checked={formData.departmentId.includes(dept.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newDeptIds = checked
                        ? [...formData.departmentId, dept.id]
                        : formData.departmentId.filter((id) => id !== dept.id);
                      setFormData({
                        ...formData,
                        departmentId: newDeptIds,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`dept-${dept.id}`}
                    className="flex-1 text-sm text-text-main cursor-pointer select-none"
                  >
                    {dept.departmentName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-sub">
                เลือกแล้ว {formData.employeeId.length} คน
              </span>
            </div>
            <Input
              placeholder="ค้นหาพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-primary hover:underline"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-status-late hover:underline"
              >
                ล้างการเลือก
              </button>
            </div>

            <div className="border border-gray-200 rounded-md p-2 max-h-60 overflow-y-auto bg-gray-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`emp-${emp.id}`}
                      checked={formData.employeeId.includes(emp.id)}
                      onChange={(e) =>
                        toggleEmployeeId(emp.id, e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label
                      htmlFor={`emp-${emp.id}`}
                      className="flex-1 text-sm text-text-main cursor-pointer select-none flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span>{emp.name || "ไม่ระบุชื่อ"}</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-sub text-center py-4">
                  ไม่พบพนักงานที่ค้นหา
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ShiftForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  overtimes: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  toggleDay: PropTypes.func.isRequired,
  departments: PropTypes.array.isRequired,
  filteredEmployees: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  handleClearAll: PropTypes.func.isRequired,
  toggleEmployeeId: PropTypes.func.isRequired,
};
