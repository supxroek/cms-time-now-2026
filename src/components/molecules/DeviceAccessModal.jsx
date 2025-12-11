import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "./Modal";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { StatusBadge } from "../atoms/StatusBadge";
import { updateDevice } from "../../store/slices/companySlice";
import { UsersIcon } from "../atoms/Icons";

export function DeviceAccessModal({ isOpen, onClose, device }) {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employee);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, selected, unselected

  useEffect(() => {
    if (device && device.employeeIds) {
      setSelectedEmployeeIds(device.employeeIds);
    } else {
      setSelectedEmployeeIds([]);
    }
    setSearchQuery("");
    setFilterType("all");
  }, [device]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const isSelected = selectedEmployeeIds.includes(emp.id);
      if (filterType === "selected") return isSelected;
      if (filterType === "unselected") return !isSelected;
      return true;
    });
  }, [employees, searchQuery, selectedEmployeeIds, filterType]);

  const handleToggleEmployee = (employeeId) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredEmployees.map((emp) => emp.id);
    setSelectedEmployeeIds((prev) => {
      const newSet = new Set([...prev, ...idsToAdd]);
      return Array.from(newSet);
    });
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = filteredEmployees.map((emp) => emp.id);
    setSelectedEmployeeIds((prev) =>
      prev.filter((id) => !idsToRemove.includes(id))
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateDevice({
          id: device.id,
          employeeIds: selectedEmployeeIds,
        })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update device access:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!device) return null;

  const selectedCount = selectedEmployeeIds.length;
  const totalCount = employees.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main">
              จัดการสิทธิ์การเข้าถึง
            </h3>
            <p className="text-sm font-normal text-text-sub">
              อุปกรณ์: {device.name}
            </p>
          </div>
        </div>
      }
      maxWidth="max-w-3xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-text-sub">
            เลือกแล้ว{" "}
            <span className="font-bold text-primary">{selectedCount}</span> จาก{" "}
            {totalCount} คน
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} isLoading={isSubmitting}>
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-bg-sub p-4 rounded-lg border border-border-base">
          <div className="w-full sm:w-1/2">
            <Input
              placeholder="ค้นหาชื่อ หรือ แผนก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex bg-white rounded-lg border border-border-base p-1">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === "all"
                    ? "bg-primary/10 text-primary"
                    : "text-text-sub hover:bg-gray-50"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType("selected")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === "selected"
                    ? "bg-success/10 text-success"
                    : "text-text-sub hover:bg-gray-50"
                }`}
              >
                เลือกแล้ว
              </button>
              <button
                onClick={() => setFilterType("unselected")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === "unselected"
                    ? "bg-gray-100 text-text-main"
                    : "text-text-sub hover:bg-gray-50"
                }`}
              >
                ยังไม่เลือก
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex justify-end gap-4 text-sm">
          <button
            onClick={handleSelectAllFiltered}
            className="text-primary hover:underline font-medium"
          >
            เลือกทั้งหมดในรายการ ({filteredEmployees.length})
          </button>
          <span className="text-border-base">|</span>
          <button
            onClick={handleDeselectAllFiltered}
            className="text-text-sub hover:text-danger hover:underline"
          >
            ยกเลิกทั้งหมดในรายการ
          </button>
        </div>

        {/* Employee List */}
        <div className="border border-border-base rounded-lg overflow-hidden flex flex-col h-[400px]">
          <div className="overflow-y-auto flex-1 p-2 space-y-1 bg-gray-50/50">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const isSelected = selectedEmployeeIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleToggleEmployee(emp.id)}
                    className={`
                      group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "bg-primary/5 border-primary/30 shadow-sm"
                          : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-gray-300 group-hover:border-primary"
                        }
                      `}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div
                          className={`font-medium ${
                            isSelected ? "text-primary" : "text-text-main"
                          }`}
                        >
                          {emp.name}
                        </div>
                        <div className="text-xs text-text-sub">
                          {emp.department?.name || "ไม่ระบุแผนก"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <StatusBadge
                        status={isSelected ? "Authorized" : "No Access"}
                        type={isSelected ? "success" : "neutral"}
                        className="text-xs"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-sub opacity-60">
                <UsersIcon className="w-12 h-12 mb-2" />
                <p>ไม่พบรายชื่อพนักงาน</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

DeviceAccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  device: PropTypes.object,
};
