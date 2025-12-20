import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
} from "../store/slices/shiftSlice";
import {
  fetchOvertimes,
  createOvertime,
  updateOvertime,
  deleteOvertime,
} from "../store/slices/overtimeSlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
import {
  fetchDepartments,
  fetchCompanyInfo,
} from "../store/slices/companySlice";
import { Button } from "../components/atoms/Button";
import { Modal } from "../components/molecules/Modal";
import { ClockIcon, PlusIcon } from "../components/atoms/Icons";
import { ShiftCard } from "../components/molecules/ShiftCard";
import { OTCard } from "../components/molecules/OTCard";
import { ShiftForm } from "../components/molecules/ShiftForm";
import { OTForm } from "../components/molecules/OTForm";
import { useNotification } from "../hooks/useNotification";

export function ShiftPage() {
  const dispatch = useDispatch();
  const { shifts, isLoading } = useSelector((state) => state.shifts);
  const { overtimes } = useSelector((state) => state.overtime);
  const { employees } = useSelector((state) => state.employee);
  const { departments, companyInfo } = useSelector((state) => state.company);
  const { success, error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState("shift");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [isOTDeleteModalOpen, setIsOTDeleteModalOpen] = useState(false);

  const [editingShift, setEditingShift] = useState(null);
  const [deletingShift, setDeletingShift] = useState(null);
  const [editingOT, setEditingOT] = useState(null);
  const [deletingOT, setDeletingOT] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    break_start_time: "",
    break_end_time: "",
    work_days: [],
    employeeId: [],
    is_active: true,
    ot_enabled: false,
    is_specific: false,
    month: new Date().getMonth() + 1,
    break_enabled: true,
    assign_type: "individual", // 'individual' or 'department'
    departmentId: [],
  });

  const [otFormData, setOtFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    rate: 1.5,
    employeeId: [],
    assign_type: "individual",
    departmentId: [],
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchOvertimes());
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchCompanyInfo());
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

  // Helpers to reduce cognitive complexity in handleSubmit
  const getFinalEmployeeIds = (form) => {
    let finalEmployeeIds = form.employeeId || [];
    if (form.assign_type === "department" && form.departmentId?.length > 0) {
      const deptEmployees = (employees || [])
        .filter((emp) => form.departmentId.includes(emp.departmentId))
        .map((emp) => emp.id);
      finalEmployeeIds = [...new Set([...finalEmployeeIds, ...deptEmployees])];
    }
    return finalEmployeeIds;
  };

  const buildShiftPayload = (form, finalEmployeeIds) => ({
    shift_name: form.name,
    start_time: form.start_time,
    end_time: form.end_time,
    date: form.work_days,
    is_break: form.break_enabled ? 1 : 0,
    break_start_time: form.break_enabled ? form.break_start_time : null,
    break_end_time: form.break_enabled ? form.break_end_time : null,
    employeeId: finalEmployeeIds,
    is_shift: form.is_active ? 1 : 0,
    is_night_shift: form.ot_enabled ? 1 : 0,
    is_specific: form.is_specific ? 1 : 0,
    month: form.is_specific ? form.month : null,
  });

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
        is_active: shift.is_shift === 1, // Map is_shift to is_active
        ot_enabled: shift.is_night_shift === 1, // Map is_night_shift to ot_enabled
        is_specific: shift.is_specific === 1,
        month: shift.month || new Date().getMonth() + 1,
        break_enabled: shift.is_break === 1,
        assign_type: "individual", // Default to individual for edit for now
        departmentId: [],
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
        is_active: true,
        ot_enabled: false,
        is_specific: false,
        month: new Date().getMonth() + 1,
        break_enabled: true,
        assign_type: "individual",
        departmentId: [],
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
      is_active: true,
      ot_enabled: false,
      is_specific: false,
      month: new Date().getMonth() + 1,
      break_enabled: true,
      assign_type: "individual",
      departmentId: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const finalEmployeeIds = getFinalEmployeeIds(formData);
      const payload = buildShiftPayload(formData, finalEmployeeIds);

      if (editingShift) {
        await dispatch(
          updateShift({ id: editingShift.id, data: payload })
        ).unwrap();
        success("อัพเดทสำเร็จ", "แก้ไขข้อมูลกะการทำงานเรียบร้อยแล้ว");
      } else {
        await dispatch(createShift(payload)).unwrap();
        success("สร้างสำเร็จ", "สร้างกะการทำงานใหม่เรียบร้อยแล้ว");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save shift:", error);
      showError(
        editingShift ? "อัพเดทไม่สำเร็จ" : "สร้างไม่สำเร็จ",
        typeof error === "string"
          ? error
          : error?.message || "ไม่สามารถบันทึกกะการทำงานได้"
      );
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
        success(
          "ลบสำเร็จ",
          `ลบกะการทำงาน "${
            deletingShift.shift_name || deletingShift.name
          }" เรียบร้อยแล้ว`
        );
        setIsDeleteModalOpen(false);
        setDeletingShift(null);
      } catch (error) {
        console.error("Failed to delete shift:", error);
        showError(
          "ลบไม่สำเร็จ",
          typeof error === "string"
            ? error
            : error?.message || "ไม่สามารถลบกะการทำงานได้"
        );
      }
    }
  };

  // OT Handlers
  const handleOpenOTModal = (ot = null) => {
    setSearchTerm("");
    if (ot) {
      setEditingOT(ot);
      const employeeIds = parseArrayField(ot.employeeId);
      setOtFormData({
        name: ot.overTimeName || ot.name || "",
        start_time: ot.ot_start_time || ot.start_time || "",
        end_time: ot.ot_end_time || ot.end_time || "",
        rate: ot.rate || 1.5,
        employeeId: employeeIds,
        assign_type: "individual",
        departmentId: [],
      });
    } else {
      setEditingOT(null);
      setOtFormData({
        name: "",
        start_time: "",
        end_time: "",
        rate: 1.5,
        employeeId: [],
        assign_type: "individual",
        departmentId: [],
      });
    }
    setIsOTModalOpen(true);
  };

  const handleCloseOTModal = () => {
    setIsOTModalOpen(false);
    setEditingOT(null);
  };

  const handleOTSubmit = async () => {
    try {
      let finalEmployeeIds = otFormData.employeeId;
      if (
        otFormData.assign_type === "department" &&
        otFormData.departmentId.length > 0
      ) {
        const deptEmployees = employees
          .filter((emp) => otFormData.departmentId.includes(emp.departmentId))
          .map((emp) => emp.id);
        finalEmployeeIds = [
          ...new Set([...finalEmployeeIds, ...deptEmployees]),
        ];
      }

      const payload = {
        overTimeName: otFormData.name,
        ot_start_time: otFormData.start_time,
        ot_end_time: otFormData.end_time,
        companyId: companyInfo?.id || 1,
        employeeId: finalEmployeeIds,
      };

      if (editingOT) {
        await dispatch(
          updateOvertime({ id: editingOT.id, data: payload })
        ).unwrap();
        success("อัพเดทสำเร็จ", "แก้ไขข้อมูล OT เรียบร้อยแล้ว");
      } else {
        await dispatch(createOvertime(payload)).unwrap();
        success("สร้างสำเร็จ", "สร้าง OT ใหม่เรียบร้อยแล้ว");
      }
      handleCloseOTModal();
    } catch (error) {
      console.error("Failed to save overtime:", error);
      showError(
        editingOT ? "อัพเดทไม่สำเร็จ" : "สร้างไม่สำเร็จ",
        typeof error === "string"
          ? error
          : error?.message || "ไม่สามารถบันทึก OT ได้"
      );
    }
  };

  const handleOTDeleteClick = (ot) => {
    setDeletingOT(ot);
    setIsOTDeleteModalOpen(true);
  };

  const confirmOTDelete = async () => {
    if (deletingOT) {
      try {
        await dispatch(deleteOvertime(deletingOT.id)).unwrap();
        success(
          "ลบสำเร็จ",
          `ลบ OT "${deletingOT.overTimeName || deletingOT.name}" เรียบร้อยแล้ว`
        );
        setIsOTDeleteModalOpen(false);
        setDeletingOT(null);
      } catch (error) {
        console.error("Failed to delete overtime:", error);
        showError(
          "ลบไม่สำเร็จ",
          typeof error === "string"
            ? error
            : error?.message || "ไม่สามารถลบ OT ได้"
        );
      }
    }
  };

  const handleShiftStatusChange = async (shift, checked) => {
    try {
      await dispatch(
        updateShift({ id: shift.id, data: { is_shift: checked ? 1 : 0 } })
      ).unwrap();
      success(
        "อัพเดทสำเร็จ",
        checked ? "เปิดใช้งานกะการทำงานแล้ว" : "ปิดใช้งานกะการทำงานแล้ว"
      );
    } catch (error) {
      console.error("Failed to update shift status:", error);
      showError("อัพเดทไม่สำเร็จ", "ไม่สามารถเปลี่ยนสถานะกะการทำงานได้");
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

  const renderLoading = (key = "loading") => [
    <div key={key} className="col-span-full text-center py-8 text-text-sub">
      Loading...
    </div>,
  ];

  const renderEmpty = (key, text, buttonText, onClick) => [
    <div
      key={key}
      className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300"
    >
      <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-text-sub">{text}</p>
      <Button variant="ghost" className="mt-2" onClick={onClick}>
        {buttonText}
      </Button>
    </div>,
  ];

  const renderShiftContent = () => {
    if (isLoading) return renderLoading();
    if (safeShifts.length === 0)
      return renderEmpty("empty", "ยังไม่มีข้อมูลกะงาน", "สร้างกะงานแรก", () =>
        handleOpenModal()
      );
    return safeShifts.map((shift, index) => (
      <ShiftCard
        key={shift.id || index}
        shift={shift}
        onEdit={handleOpenModal}
        onDelete={handleDeleteClick}
        onStatusChange={handleShiftStatusChange}
      />
    ));
  };

  const renderOvertimeContent = () => {
    if (isLoading) return renderLoading();
    if (!Array.isArray(overtimes) || overtimes.length === 0)
      return renderEmpty(
        "empty",
        "ยังไม่มีข้อมูลการทำงานล่วงเวลา",
        "สร้างรายการ OT แรก",
        () => handleOpenOTModal()
      );
    return overtimes.map((ot, index) => (
      <OTCard
        key={ot.id || index}
        ot={ot}
        onEdit={handleOpenOTModal}
        onDelete={handleOTDeleteClick}
      />
    ));
  };

  const renderContent =
    activeTab === "shift" ? renderShiftContent() : renderOvertimeContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-main font-display">
              {activeTab === "shift" ? "จัดการกะงาน" : "จัดการการทำงานล่วงเวลา"}
            </h2>
            <p className="text-text-sub text-sm">
              {activeTab === "shift"
                ? "กำหนดช่วงเวลาทำงานและวันทำงานสำหรับพนักงาน"
                : "กำหนดเงื่อนไขและช่วงเวลาสำหรับการทำงานล่วงเวลา"}
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            activeTab === "shift" ? handleOpenModal() : handleOpenOTModal()
          }
          icon={<PlusIcon className="w-4 h-4" />}
        >
          {activeTab === "shift" ? "สร้างกะงานใหม่" : "สร้างรายการ OT"}
        </Button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`p-2 px-1 transition-colors ${
            activeTab === "shift"
              ? "border-b-2 border-primary text-primary font-medium"
              : "text-text-sub hover:text-text-main"
          }`}
          onClick={() => setActiveTab("shift")}
        >
          จัดการกะงาน
        </button>
        <button
          className={`pb-2 px-1 transition-colors ${
            activeTab === "overtime"
              ? "border-b-2 border-primary text-primary font-medium"
              : "text-text-sub hover:text-text-main"
          }`}
          onClick={() => setActiveTab("overtime")}
        >
          จัดการการทำงานล่วงเวลา
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent}
      </div>

      {/* Shift Modal */}
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
        <ShiftForm
          formData={formData}
          setFormData={setFormData}
          overtimes={overtimes}
          daysOfWeek={daysOfWeek}
          toggleDay={toggleDay}
          departments={departments}
          filteredEmployees={filteredEmployees}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSelectAll={handleSelectAll}
          handleClearAll={handleClearAll}
          toggleEmployeeId={toggleEmployeeId}
        />
      </Modal>

      {/* OT Modal */}
      <Modal
        isOpen={isOTModalOpen}
        onClose={handleCloseOTModal}
        title={editingOT ? "แก้ไขรายการ OT" : "สร้างรายการ OT ใหม่"}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseOTModal}>
              ยกเลิก
            </Button>
            <Button onClick={handleOTSubmit}>บันทึก</Button>
          </>
        }
      >
        <OTForm
          otFormData={otFormData}
          setOtFormData={setOtFormData}
          departments={departments}
          filteredEmployees={filteredEmployees}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
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

      <Modal
        isOpen={isOTDeleteModalOpen}
        onClose={() => setIsOTDeleteModalOpen(false)}
        title="ยืนยันการลบรายการ OT"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsOTDeleteModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-status-late hover:bg-red-600 text-white"
              onClick={confirmOTDelete}
            >
              ลบรายการ OT
            </Button>
          </>
        }
      >
        <p className="text-text-main">
          คุณแน่ใจหรือไม่ว่าต้องการลบรายการ OT{" "}
          <span className="font-bold">{deletingOT?.name}</span>
          <span>? การกระทำนี้ไม่สามารถย้อนกลับได้</span>
        </p>
      </Modal>
    </div>
  );
}
