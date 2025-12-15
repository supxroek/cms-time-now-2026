import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  updateEmployee,
  resignEmployee,
  deleteEmployee,
} from "../store/slices/employeeSlice";
import {
  fetchDepartments,
  fetchCompanyInfo,
} from "../store/slices/companySlice";
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Label } from "../components/atoms/Label";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { Modal, ConfirmModal } from "../components/molecules/Modal";
import {
  EditIcon,
  DeleteIcon,
  UsersIcon,
  UserXIcon,
} from "../components/atoms/Icons";
import { formatDate } from "../utils/dateUtils";

export function EmployeePage() {
  const dispatch = useDispatch();
  const { employees, isLoading } = useSelector((state) => state.employee);
  const { departments, companyInfo } = useSelector((state) => state.company);

  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState({ isOpen: false, employee: null });
  const [resignModal, setResignModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [formData, setFormData] = useState({});
  const [resignDate, setResignDate] = useState("");

  // Local state for optimistic updates
  const [localEmployees, setLocalEmployees] = useState([]);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchCompanyInfo());
  }, [dispatch]);

  // Sync local state with Redux state
  useEffect(() => {
    setLocalEmployees(employees);
  }, [employees]);

  // Memoize active departments for the dropdown
  const activeDepartments = useMemo(() => {
    return departments || [];
  }, [departments]);

  // Memoize department lookup for faster table rendering
  const departmentLookup = useMemo(() => {
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.departmentName;
      return acc;
    }, {});
  }, [departments]);

  const filteredEmployees = useMemo(() => {
    return localEmployees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      return (
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.ID_or_Passport_Number || "").toLowerCase().includes(q) ||
        (departmentLookup[emp.departmentId] || "").toLowerCase().includes(q)
      );
    });
  }, [localEmployees, searchQuery, departmentLookup]);

  const handleEditClick = (employee) => {
    setFormData({
      name: employee.name,
      departmentId: employee.departmentId,
      ID_or_Passport_Number: employee.ID_or_Passport_Number,
      lineUserId: employee.lineUserId || "",
      start_date: employee.start_date ? employee.start_date.split("T")[0] : "",
      dayOff: employee.dayOff || "",
    });
    setEditModal({ isOpen: true, employee });
  };

  const handleResignClick = (employee) => {
    setResignDate(new Date().toISOString().split("T")[0]);
    setResignModal({ isOpen: true, employee });
  };

  const handleDeleteClick = (employee) => {
    setDeleteModal({ isOpen: true, employee });
  };

  const handleEditSubmit = async () => {
    const { id } = editModal.employee;
    const dataToSubmit = {
      ...formData,
      start_date: formData.start_date === "" ? null : formData.start_date,
      lineUserId: formData.lineUserId === "" ? null : formData.lineUserId,
      dayOff: formData.dayOff === "" ? null : formData.dayOff,
    };

    // Optimistic Update
    setLocalEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...dataToSubmit } : emp))
    );
    setEditModal({ isOpen: false, employee: null });

    try {
      await dispatch(
        updateEmployee({
          id,
          data: dataToSubmit,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update employee:", error);
      setLocalEmployees(employees); // Revert on error
    }
  };

  const handleResignSubmit = async () => {
    const { id } = resignModal.employee;

    // Optimistic Update
    setLocalEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id ? { ...emp, resign_date: resignDate } : emp
      )
    );
    setResignModal({ isOpen: false, employee: null });

    try {
      await dispatch(
        resignEmployee({
          id,
          resignDate: resignDate,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to resign employee:", error);
      setLocalEmployees(employees); // Revert on error
    }
  };

  const handleDeleteSubmit = async () => {
    const { id } = deleteModal.employee;

    // Optimistic Update
    setLocalEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setDeleteModal({ isOpen: false, employee: null });

    try {
      await dispatch(deleteEmployee(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      setLocalEmployees(employees); // Revert on error
    }
  };

  const employeeRows = useMemo(() => {
    const colSpan = companyInfo?.hasDepartment === 1 ? 5 : 4;

    // Only show loading if we have absolutely no data (initial load)
    if (isLoading && localEmployees.length === 0) {
      return [
        <tr key="loading">
          <td colSpan={colSpan} className="px-6 py-8 text-center text-text-sub">
            Loading...
          </td>
        </tr>,
      ];
    }
    if (filteredEmployees.length === 0) {
      return [
        <tr key="empty">
          <td
            colSpan={colSpan}
            className="px-6 py-8 text-center text-text-muted"
          >
            ไม่พบข้อมูลพนักงาน
          </td>
        </tr>,
      ];
    }
    return filteredEmployees.map((emp) => (
      <tr key={emp.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 font-medium text-text-main">
          {emp.name}
          <div className="text-xs text-text-sub font-normal mt-0.5">
            {emp.lineUserId ? `Line: ${emp.lineUserId}` : "-"}
          </div>
        </td>
        <td className="px-6 py-4 text-text-sub font-mono text-sm">
          {emp.ID_or_Passport_Number}
        </td>
        {companyInfo?.hasDepartment === 1 && (
          <td className="px-6 py-4">
            <StatusBadge
              status={departmentLookup[emp.departmentId] || "ไม่ระบุ"}
              type="neutral"
            />
          </td>
        )}
        <td className="px-6 py-4">
          {emp.resign_date ? (
            <StatusBadge
              status={`ลาออก (${formatDate(emp.resign_date)})`}
              type="danger"
            />
          ) : (
            <StatusBadge status="ปกติ" type="success" />
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleEditClick(emp)}
              className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
              title="แก้ไขข้อมูล"
              disabled={!!emp.resign_date}
            >
              <EditIcon className="w-4 h-4" />
            </button>
            {!emp.resign_date && (
              <button
                onClick={() => handleResignClick(emp)}
                className="p-1 text-warning hover:bg-warning/10 rounded transition-colors"
                title="แจ้งลาออก"
              >
                <UserXIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDeleteClick(emp)}
              className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
              title="ลบข้อมูลถาวร"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [
    isLoading,
    localEmployees.length,
    filteredEmployees,
    departmentLookup,
    companyInfo,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <UsersIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-main font-display">
            จัดการบุคลากร
          </h2>
          <p className="text-text-sub text-sm">
            ดูและแก้ไขข้อมูลพนักงาน รวมถึงจัดการสถานะการทำงาน
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="w-full max-w-md">
            <Input
              placeholder="ค้นหาชื่อ แผนก หรือบัตรประจำตัว..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-text-sub">
            ทั้งหมด {filteredEmployees.length} คน
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-text-sub font-semibold">
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">รหัสบัตรประชาชน/พาสปอร์ต</th>
                {companyInfo?.hasDepartment === 1 && (
                  <th className="px-6 py-4">แผนก</th>
                )}
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{employeeRows}</tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, employee: null })}
        title="แก้ไขข้อมูลพนักงาน"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEditModal({ isOpen: false, employee: null })}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleEditSubmit}>บันทึกการเปลี่ยนแปลง</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>ชื่อ-นามสกุล</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label>รหัสบัตรประชาชน/พาสปอร์ต</Label>
            <Input
              value={formData.ID_or_Passport_Number || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ID_or_Passport_Number: e.target.value,
                })
              }
            />
          </div>
          {companyInfo?.hasDepartment === 1 && (
            <div>
              <Label>แผนก</Label>
              <select
                className="w-full px-3 py-2 bg-white border border-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                value={formData.departmentId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departmentId: Number.parseInt(e.target.value),
                  })
                }
              >
                <option value="">เลือกแผนก</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label>Line User ID</Label>
            <Input
              value={formData.lineUserId || ""}
              onChange={(e) =>
                setFormData({ ...formData, lineUserId: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>วันที่เริ่มงาน</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>วันหยุดประจำสัปดาห์</Label>
              <Input
                placeholder="เช่น เสาร์-อาทิตย์"
                value={formData.dayOff || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dayOff: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Resign Modal */}
      <Modal
        isOpen={resignModal.isOpen}
        onClose={() => setResignModal({ isOpen: false, employee: null })}
        title="บันทึกการลาออก"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setResignModal({ isOpen: false, employee: null })}
            >
              ยกเลิก
            </Button>
            <Button variant="warning" onClick={handleResignSubmit}>
              ยืนยันการลาออก
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-text-sub">
            คุณต้องการบันทึกสถานะลาออกของพนักงาน{" "}
            <span className="font-semibold text-text-main">
              {resignModal.employee?.name}
            </span>{" "}
            ใช่หรือไม่?
          </p>
          <div>
            <Label>วันที่ลาออก</Label>
            <Input
              type="date"
              value={resignDate}
              onChange={(e) => setResignDate(e.target.value)}
            />
          </div>
          <p className="text-sm text-text-sub">
            * ข้อมูลพนักงานจะไม่ถูกลบ แต่จะถูกเปลี่ยนสถานะเป็น "ลาออก"
          </p>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, employee: null })}
        onConfirm={handleDeleteSubmit}
        title="ลบข้อมูลพนักงาน"
        message={
          <>
            คุณต้องการลบข้อมูลพนักงาน{" "}
            <span className="font-semibold text-text-main">
              {deleteModal.employee?.name}
            </span>{" "}
            ออกจากระบบอย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้
          </>
        }
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        variant="danger"
      />
    </div>
  );
}
