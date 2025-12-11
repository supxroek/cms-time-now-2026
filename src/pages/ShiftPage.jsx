import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../store/slices/shiftSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Label } from "../components/atoms/Label";
import { Modal } from "../components/molecules/Modal";
import {
  ClockIcon,
  EditIcon,
  PlusIcon,
  DeleteIcon,
} from "../components/atoms/Icons";

export function ShiftPage() {
  const dispatch = useDispatch();
  const { shifts, isLoading } = useSelector((state) => state.shifts);
  const { employees } = useSelector((state) => state.employee);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deletingShift, setDeletingShift] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    work_days: [],
    employeeId: [],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchEmployees());
  }, [dispatch]);

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

  const handleOpenModal = (shift = null) => {
    setSearchTerm(""); // Reset search term

    if (shift) {
      setEditingShift(shift);

      const workDays = parseArrayField(shift.date);
      const employeeIds = parseArrayField(shift.employeeId);

      setFormData({
        name: shift.shift_name || shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        break_start_time: shift.break_start_time || "",
        break_end_time: shift.break_end_time || "",
        work_days: workDays,
        employeeId: employeeIds,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        start_time: "",
        end_time: "",
        break_start_time: "",
        break_end_time: "",
        work_days: [1, 2, 3, 4, 5], // Default Mon-Fri
        employeeId: [],
      });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    setFormData({
      name: "",
      start_time: "",
      end_time: "",
      break_start_time: "",
      break_end_time: "",
      work_days: [],
      employeeId: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        shift_name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        date: formData.work_days,
        is_break: formData.break_start_time && formData.break_end_time ? 1 : 0,
        break_start_time: formData.break_start_time || null,
        break_end_time: formData.break_end_time || null,
        employeeId: formData.employeeId,
      };

      if (editingShift) {
        await dispatch(
          updateShift({ id: editingShift.id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createShift(payload)).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save shift:", error);
    }
  };

  const handleDeleteClick = (shift) => {
    setDeletingShift(shift);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingShift) {
      try {
        await dispatch(deleteShift(deletingShift.id)).unwrap();
        setIsDeleteModalOpen(false);
        setDeletingShift(null);
      } catch (error) {
        console.error("Failed to delete shift:", error);
      }
    }
  };

  const daysOfWeek = [
    { id: 0, label: "อา" },
    { id: 1, label: "จ" },
    { id: 2, label: "อ" },
    { id: 3, label: "พ" },
    { id: 4, label: "พฤ" },
    { id: 5, label: "ศ" },
    { id: 6, label: "ส" },
  ];

  const toggleDay = (dayId) => {
    setFormData((prev) => {
      const newDays = prev.work_days.includes(dayId)
        ? prev.work_days.filter((d) => d !== dayId)
        : [...prev.work_days, dayId].sort((a, b) => a - b);
      return { ...prev, work_days: newDays };
    });
  };

  const safeShifts = Array.isArray(shifts) ? shifts : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const filteredEmployees = safeEmployees.filter((emp) =>
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    const allIds = filteredEmployees.map((emp) => emp.id);
    setFormData((prev) => ({
      ...prev,
      employeeId: [...new Set([...prev.employeeId, ...allIds])],
    }));
  };

  const handleClearAll = () => {
    const filteredIdSet = new Set(filteredEmployees.map((emp) => emp.id));
    setFormData((prev) => ({
      ...prev,
      employeeId: prev.employeeId.filter((id) => !filteredIdSet.has(id)),
    }));
  };

  const toggleEmployeeId = (empId, checked) => {
    setFormData((prev) => {
      if (checked) {
        if (prev.employeeId.includes(empId)) return prev;
        return { ...prev, employeeId: [...prev.employeeId, empId] };
      }
      return {
        ...prev,
        employeeId: prev.employeeId.filter((id) => id !== empId),
      };
    });
  };

  const renderShifts = (() => {
    if (isLoading) {
      return [
        <div
          key="loading"
          className="col-span-full text-center py-8 text-text-sub"
        >
          Loading...
        </div>,
      ];
    }

    if (safeShifts.length === 0) {
      return [
        <div
          key="empty"
          className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300"
        >
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-sub">ยังไม่มีข้อมูลกะงาน</p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => handleOpenModal()}
          >
            สร้างกะงานแรก
          </Button>
        </div>,
      ];
    }

    return safeShifts.map((shift) => (
      <div
        key={shift.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
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
              onClick={() => handleOpenModal(shift)}
              className="p-1 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="แก้ไข"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteClick(shift)}
              className="p-1 text-text-sub hover:text-status-late hover:bg-status-late/10 rounded transition-colors"
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
              {daysOfWeek.map((day) => {
                const workDays = parseArrayField(shift.date);
                return (
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
              })}
            </div>
          </div>
        </div>
      </div>
    ));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-main font-display">
              จัดการกะงาน
            </h2>
            <p className="text-text-sub text-sm">
              กำหนดช่วงเวลาทำงานและวันทำงานสำหรับพนักงาน
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="w-4 h-4 mr-2" />
          สร้างกะงานใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderShifts}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingShift ? "แก้ไขกะงาน" : "สร้างกะงานใหม่"}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit}>บันทึก</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>ชื่อกะงาน</Label>
            <Input
              placeholder="เช่น กะเช้า, กะบ่าย"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>เวลาเริ่มพัก</Label>
              <Input
                type="time"
                value={formData.break_start_time}
                onChange={(e) =>
                  setFormData({ ...formData, break_start_time: e.target.value })
                }
              />
            </div>
            <div>
              <Label>เวลาสิ้นสุดพัก</Label>
              <Input
                type="time"
                value={formData.break_end_time}
                onChange={(e) =>
                  setFormData({ ...formData, break_end_time: e.target.value })
                }
              />
            </div>
          </div>
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
              <Label>พนักงานในกะนี้</Label>
              <span className="text-xs text-text-sub">
                เลือกแล้ว {formData.employeeId.length} คน
              </span>
            </div>

            <div className="space-y-2">
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
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="ยืนยันการลบกะงาน"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-status-late hover:bg-red-600 text-white"
              onClick={confirmDelete}
            >
              ลบกะงาน
            </Button>
          </>
        }
      >
        <p className="text-text-main">
          คุณแน่ใจหรือไม่ว่าต้องการลบกะงาน{" "}
          <span className="font-bold">
            {deletingShift?.shift_name || deletingShift?.name}
          </span>
          <span>? การกระทำนี้ไม่สามารถย้อนกลับได้</span>
        </p>
      </Modal>
    </div>
  );
}
