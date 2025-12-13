import PropTypes from "prop-types";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";

export function OTForm({
  otFormData,
  setOtFormData,
  departments,
  filteredEmployees,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>ชื่อรายการ OT</Label>
        <Input
          placeholder="เช่น OT หลังเลิกงาน, OT วันหยุด"
          value={otFormData.name}
          onChange={(e) =>
            setOtFormData({ ...otFormData, name: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>เวลาเริ่ม</Label>
          <Input
            type="time"
            value={otFormData.start_time}
            onChange={(e) =>
              setOtFormData({ ...otFormData, start_time: e.target.value })
            }
          />
        </div>
        <div>
          <Label>เวลาสิ้นสุด</Label>
          <Input
            type="time"
            value={otFormData.end_time}
            onChange={(e) =>
              setOtFormData({ ...otFormData, end_time: e.target.value })
            }
          />
        </div>
      </div>
      <div>
        <Label>อัตราจ่าย (เท่า)</Label>
        <Input
          type="number"
          step="0.5"
          value={otFormData.rate}
          onChange={(e) =>
            setOtFormData({ ...otFormData, rate: e.target.value })
          }
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>ผู้มีสิทธิ์ทำ OT</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ot_assign_type"
                value="individual"
                checked={otFormData.assign_type === "individual"}
                onChange={() =>
                  setOtFormData({
                    ...otFormData,
                    assign_type: "individual",
                  })
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">รายบุคคล</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ot_assign_type"
                value="department"
                checked={otFormData.assign_type === "department"}
                onChange={() =>
                  setOtFormData({
                    ...otFormData,
                    assign_type: "department",
                  })
                }
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">รายแผนก</span>
            </label>
          </div>
        </div>

        {otFormData.assign_type === "department" ? (
          <div className="space-y-2">
            <div className="border border-gray-200 rounded-md p-2 max-h-60 overflow-y-auto bg-gray-50">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`ot-dept-${dept.id}`}
                    checked={otFormData.departmentId.includes(dept.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newDeptIds = checked
                        ? [...otFormData.departmentId, dept.id]
                        : otFormData.departmentId.filter(
                            (id) => id !== dept.id
                          );
                      setOtFormData({
                        ...otFormData,
                        departmentId: newDeptIds,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`ot-dept-${dept.id}`}
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
                เลือกแล้ว {otFormData.employeeId.length} คน
              </span>
            </div>
            <Input
              placeholder="ค้นหาพนักงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />

            <div className="border border-gray-200 rounded-md p-2 max-h-60 overflow-y-auto bg-gray-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`ot-emp-${emp.id}`}
                      checked={otFormData.employeeId.includes(emp.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newIds = checked
                          ? [...otFormData.employeeId, emp.id]
                          : otFormData.employeeId.filter((id) => id !== emp.id);
                        setOtFormData({
                          ...otFormData,
                          employeeId: newIds,
                        });
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label
                      htmlFor={`ot-emp-${emp.id}`}
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

OTForm.propTypes = {
  otFormData: PropTypes.object.isRequired,
  setOtFormData: PropTypes.func.isRequired,
  departments: PropTypes.array.isRequired,
  filteredEmployees: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};
