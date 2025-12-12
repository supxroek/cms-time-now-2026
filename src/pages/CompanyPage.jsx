// import React และ hooks ที่จำเป็น
import { useEffect, useState } from "react";
// import Redux hooks และ actions ที่จำเป็น
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanyInfo,
  updateCompanyInfo,
  fetchDepartments,
  fetchDevices,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addDevice,
  updateDevice,
  deleteDevice,
  syncDevice,
} from "../store/slices/companySlice";
import { fetchEmployees } from "../store/slices/employeeSlice";
// import components ที่จำเป็นในส่วนของ UI จาก Atom และ Molecules
import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Label } from "../components/atoms/Label";
import { Switch } from "../components/atoms/Switch";
import { StatusBadge } from "../components/atoms/StatusBadge";
import { Tooltip } from "../components/atoms/Tooltip";
import {
  CompanyIcon,
  DevicesIcon,
  SyncIcon,
  EditIcon,
  DeleteIcon,
  UsersIcon,
} from "../components/atoms/Icons";
import { Modal, ConfirmModal } from "../components/molecules/Modal";
import { DeviceAccessModal } from "../components/molecules/DeviceAccessModal";

import PropTypes from "prop-types";

// จัดการปุ่มแท็บ
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-text-sub hover:text-text-main hover:border-gray-300"
    }`}
  >
    {children}
  </button>
);
// กำหนด prop types สำหรับ TabButton
TabButton.propTypes = {
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// จัดการแถวแสดงข้อมูล
const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
    <dt className="text-sm font-medium text-text-sub">{label}</dt>
    <dd className="text-sm text-text-main sm:col-span-2">{value || "-"}</dd>
  </div>
);
// กำหนด prop types สำหรับ InfoRow
InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// ========================================================================
// ========================= ส่วนจัดการ logic ของหน้าจัดการองค์กร ================
// ========================================================================
function useCompanyLogic() {
  const dispatch = useDispatch();
  const { companyInfo, departments, devices, isLoading } = useSelector(
    (state) => state.company
  );

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [syncingDevices, setSyncingDevices] = useState(new Set());
  const [isTogglingDepartment, setIsTogglingDepartment] = useState(false);

  const [deptModal, setDeptModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [deviceModal, setDeviceModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    name: "",
  });
  const [accessModal, setAccessModal] = useState({
    isOpen: false,
    device: null,
  });

  // ดึงข้อมูลบริษัท แผนก และอุปกรณ์เมื่อโหลดหน้า
  useEffect(() => {
    dispatch(fetchCompanyInfo());
    dispatch(fetchDepartments());
    dispatch(fetchDevices());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // ========================= ส่วนจัดการฟอร์มข้อมูลบริษัท =========================
  // จัดการการเปลี่ยนแปลงข้อมูลฟอร์ม
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };
  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลบริษัท
  const validateCompanyInfo = (data) => {
    const errors = {};
    if (!data.name) errors.name = "กรุณาระบุชื่อบริษัท";
    if (!data.branch) errors.branch = "กรุณาระบุสาขา";
    if (!data.tax_id) errors.tax_id = "กรุณาระบุเลขผู้เสียภาษี";
    return errors;
  };
  // จัดการการส่งข้อมูลฟอร์ม
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateCompanyInfo(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    // ส่งข้อมูลอัปเดตบริษัท
    dispatch(updateCompanyInfo(formData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setValidationErrors({});
      })
      .catch((error) => console.error("Failed to update company info:", error));
  };
  // เริ่มแก้ไขข้อมูล
  const handleEditClick = () => {
    setFormData(companyInfo || {});
    setIsEditing(true);
    setValidationErrors({});
  };
  // ยกเลิกการแก้ไข
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setValidationErrors({});
  };

  // ========================= ส่วนจัดการแผนก ==============================
  // เปิดโมดอลแผนก
  const openDeptModal = (mode, data = null) => {
    setDeptModal({ isOpen: true, mode, data: data || {} });
    setValidationErrors({});
  };
  // ปิดโมดอลแผนก
  const closeDeptModal = () => {
    setDeptModal({ isOpen: false, mode: "add", data: null });
    setValidationErrors({});
  };
  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลแผนก
  const validateDepartment = (data) => {
    const errors = {};
    if (!data.departmentName) errors.departmentName = "กรุณาระบุชื่อแผนก";
    return errors;
  };
  // จัดการการส่งข้อมูลฟอร์มแผนก
  const handleDeptSubmit = (e) => {
    e.preventDefault();
    const errors = validateDepartment(deptModal.data || {});
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    const action = deptModal.mode === "add" ? addDepartment : updateDepartment;
    dispatch(action(deptModal.data))
      .unwrap()
      .then(() => {
        closeDeptModal();
        // ดึงข้อมูลใหม่ทันทีเพื่อให้แนใจว่าข้อมูลตรงกับฐานข้อมูล
        dispatch(fetchDepartments());
      })
      .catch((err) => console.error(err));
  };
  // จัดการการเปลี่ยนแปลงข้อมูลฟอร์มแผนก
  const handleDeptInputChange = (e) => {
    const { name, value } = e.target;
    setDeptModal((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ========================= ส่วนจัดการอุปกรณ์ ==============================
  // เปิดโมดอลอุปกรณ์
  const openDeviceModal = (mode, data = null) => {
    setDeviceModal({ isOpen: true, mode, data: data || {} });
    setValidationErrors({});
  };
  // ปิดโมดอลอุปกรณ์
  const closeDeviceModal = () => {
    setDeviceModal({ isOpen: false, mode: "add", data: null });
    setValidationErrors({});
  };
  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลอุปกรณ์
  const validateDevice = (data) => {
    const errors = {};
    if (!data.name) errors.name = "กรุณาระบุชื่ออุปกรณ์";
    if (!data.hwid) errors.hwid = "กรุณาระบุ HWID";
    if (!data.locationURL) errors.locationURL = "กรุณาระบุ Location URL";
    if (!data.passcode) errors.passcode = "กรุณาระบุ Passcode";
    return errors;
  };
  // จัดการการส่งข้อมูลฟอร์มอุปกรณ์
  const handleDeviceSubmit = (e) => {
    e.preventDefault();
    const errors = validateDevice(deviceModal.data || {});
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    // เลือก action เพิ่มหรือแก้ไข
    const action = deviceModal.mode === "add" ? addDevice : updateDevice;
    dispatch(action(deviceModal.data))
      .unwrap()
      .then(() => {
        closeDeviceModal();
        // ดึงข้อมูลใหม่ทันทีเพื่อให้แนใจว่าข้อมูลตรงกับฐานข้อมูล
        dispatch(fetchDevices());
      })
      .catch((err) => console.error(err));
  };
  // จัดการการเปลี่ยนแปลงข้อมูลฟอร์มอุปกรณ์
  const handleDeviceInputChange = (e) => {
    const { name, value } = e.target;
    setDeviceModal((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ========================= ส่วนจัดการการตั้งค่าแผนก (เปิด/ปิด) ==============================
  // จัดการการสลับสถานะการใช้ระบบแผนก
  const handleCompanyDepartmentToggle = (checked) => {
    setIsTogglingDepartment(true);
    // ส่งเฉพาะค่าที่เปลี่ยนแปลง (hasDepartment) เพื่อป้องกันปัญหา Validation กับ field อื่น
    dispatch(updateCompanyInfo({ hasDepartment: checked ? 1 : 0 }))
      .unwrap()
      .then(() => setIsTogglingDepartment(false))
      .catch((err) => {
        console.error("Failed to update company department status:", err);
        setIsTogglingDepartment(false);
      });
  };

  // ========================= ส่วนจัดการการซิงค์อุปกรณ์ ==============================
  // จัดการสถานะการซิงค์อุปกรณ์
  const addSyncingDevice = (id) =>
    setSyncingDevices((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  // ลบสถานะการซิงค์อุปกรณ์
  const removeSyncingDevice = (id) =>
    setSyncingDevices((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  // จัดการการซิงค์อุปกรณ์
  const handleSyncDevice = (deviceId) => {
    addSyncingDevice(deviceId);
    dispatch(syncDevice(deviceId))
      .unwrap()
      .then(() => {
        console.log("Device synced successfully");
        setTimeout(() => removeSyncingDevice(deviceId), 1000);
      })
      .catch((err) => {
        console.error("Failed to sync device:", err);
        removeSyncingDevice(deviceId);
      });
  };

  // ========================= ส่วนจัดการการลบแผนก/อุปกรณ์ ==============================
  // เปิดโมดอลยืนยันการลบ
  const openDeleteModal = (type, item) => {
    setDeleteModal({
      isOpen: true,
      type,
      id: item.id,
      name: type === "department" ? item.departmentName : item.name,
    });
  };
  // ปิดโมดอลยืนยันการลบ
  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, type: null, id: null, name: "" });
  // จัดการการยืนยันลบแผนก/อุปกรณ์
  const handleConfirmDelete = () => {
    const action =
      deleteModal.type === "department" ? deleteDepartment : deleteDevice;
    dispatch(action(deleteModal.id))
      .unwrap()
      .then(() => closeDeleteModal())
      .catch((err) => console.error(err));
  };

  // ========================= ส่วนจัดการสิทธิ์การเข้าถึงอุปกรณ์ ==============================
  const openAccessModal = (device) => {
    setAccessModal({ isOpen: true, device });
  };

  const closeAccessModal = () => {
    setAccessModal({ isOpen: false, device: null });
  };

  return {
    companyInfo,
    departments,
    devices,
    isLoading,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    deptModal,
    deviceModal,
    deleteModal,
    accessModal,
    validationErrors,
    syncingDevices,
    isTogglingDepartment,
    handleInputChange,
    handleSubmit,
    handleEditClick,
    handleCancel,
    openDeptModal,
    closeDeptModal,
    handleDeptSubmit,
    handleDeptInputChange,
    openDeviceModal,
    closeDeviceModal,
    handleDeviceSubmit,
    handleDeviceInputChange,
    handleCompanyDepartmentToggle,
    handleSyncDevice,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,
    openAccessModal,
    closeAccessModal,
  };
}

// ========================================================================
// ========================= ส่วนแสดงข้อมูลบริษัท ==============================
// ========================================================================

// ฟังก์ชันแสดงข้อมูลบริษัท
function InfoSection({
  companyInfo, // ข้อมูลบริษัท
  isEditing, // สถานะการแก้ไข
  formData, // ข้อมูลฟอร์ม
  handleInputChange, // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลฟอร์ม
  handleSubmit, // ฟังก์ชันจัดการการส่งข้อมูลฟอร์ม
  handleCancel, // ฟังก์ชันจัดการการยกเลิกการแก้ไข
  isLoading, // สถานะการโหลด
  validationErrors, // ข้อผิดพลาดการตรวจสอบความถูกต้องของข้อมูล
}) {
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-primary border-b pb-2 font-display">
              ข้อมูลทั่วไป
            </h4>
            <div>
              <Label htmlFor="name">ชื่อบริษัท</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                error={validationErrors?.name}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">สาขาที่</Label>
                <Input
                  id="branch"
                  name="branch"
                  value={formData.branch || ""}
                  onChange={handleInputChange}
                  error={validationErrors?.branch}
                />
              </div>
              <div>
                <Label htmlFor="tax_id">เลขประจำตัวผู้เสียภาษี</Label>
                <Input
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id || ""}
                  onChange={handleInputChange}
                  error={validationErrors?.tax_id}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="employeeLimit">จำกัดจำนวนพนักงาน</Label>
              <Input
                id="employeeLimit"
                name="employeeLimit"
                type="number"
                value={formData.employeeLimit || ""}
                onChange={handleInputChange}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-primary border-b pb-2 font-display">
              ข้อมูลการติดต่อ
            </h4>
            <div>
              <Label htmlFor="contactPerson">ผู้ติดต่อหลัก</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">ที่อยู่</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sub_district">แขวง/ตำบล</Label>
                <Input
                  id="sub_district"
                  name="sub_district"
                  value={formData.sub_district || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="district">เขต/อำเภอ</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="province">จังหวัด</Label>
                <Input
                  id="province"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="postal_code">รหัสไปรษณีย์</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <h4 className="font-medium text-primary border-b pb-2 font-display">
              ข้อมูลฝ่ายบุคคล (HR)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="hr_name">ชื่อ HR</Label>
                <Input
                  id="hr_name"
                  name="hr_name"
                  value={formData.hr_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="hr_email">อีเมล HR</Label>
                <Input
                  id="hr_email"
                  name="hr_email"
                  type="email"
                  value={formData.hr_email || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider font-display">
          ข้อมูลทั่วไป
        </h4>
        <dl>
          <InfoRow label="ชื่อบริษัท" value={companyInfo?.name} />
          <InfoRow
            label="สาขา / เลขผู้เสียภาษี"
            value={`${companyInfo?.branch || "-"} / ${
              companyInfo?.tax_id || "-"
            }`}
          />
          <InfoRow
            label="จำนวนพนักงานสูงสุด"
            value={`${companyInfo?.employeeLimit || 0} คน`}
          />
          <InfoRow
            label="วันที่ตัดรอบรายงาน"
            value={`วันที่ ${companyInfo?.report_date || 1} ของทุกเดือน`}
          />
        </dl>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider font-display">
          ข้อมูลการติดต่อ
        </h4>
        <dl>
          <InfoRow label="ผู้ติดต่อหลัก" value={companyInfo?.contactPerson} />
          <InfoRow
            label="ช่องทางติดต่อ"
            value={`${companyInfo?.email || "-"} | ${
              companyInfo?.phoneNumber || "-"
            }`}
          />
          <InfoRow
            label="ที่อยู่"
            value={`${companyInfo?.address} ${companyInfo?.sub_district} ${companyInfo?.district} ${companyInfo?.province} ${companyInfo?.postal_code}`}
          />
        </dl>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider font-display">
          ข้อมูลฝ่ายบุคคล
        </h4>
        <dl>
          <InfoRow label="ชื่อ HR" value={companyInfo?.hr_name} />
          <InfoRow label="อีเมล HR" value={companyInfo?.hr_email} />
        </dl>
      </div>
    </div>
  );
}
// กำหนด prop types สำหรับ InfoSection
InfoSection.propTypes = {
  companyInfo: PropTypes.shape({
    name: PropTypes.string,
    branch: PropTypes.string,
    tax_id: PropTypes.string,
    employeeLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    report_date: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    contactPerson: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    address: PropTypes.string,
    sub_district: PropTypes.string,
    district: PropTypes.string,
    province: PropTypes.string,
    postal_code: PropTypes.string,
    hr_name: PropTypes.string,
    hr_email: PropTypes.string,
    hasDepartment: PropTypes.oneOf([0, 1]),
  }),
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  validationErrors: PropTypes.objectOf(PropTypes.string),
};

// ========================================================================
// ========================= ส่วนแสดงแผนกต่างๆ ===============================
// ========================================================================

// ฟังก์ชันแสดงแผนกต่างๆ
function DepartmentsSection({
  companyInfo, // ข้อมูลบริษัท
  departments, // รายการแผนก
  openDeptModal, // ฟังก์ชันเปิดโมดอลแผนก
  openDeleteModal, // ฟังก์ชันเปิดโมดอลยืนยันการลบ
  handleCompanyDepartmentToggle, // ฟังก์ชันจัดการการสลับสถานะการใช้ระบบแผนก
  isTogglingDepartment, // สถานะการสลับสถานะการใช้ระบบแผนก
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-text-main font-display">
            รายชื่อแผนก
          </h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-text-sub">
              {isTogglingDepartment ? "กำลังอัปเดต..." : "ใช้งานระบบแผนก"}
            </span>
            <Switch
              checked={companyInfo?.hasDepartment === 1}
              onChange={handleCompanyDepartmentToggle}
              disabled={isTogglingDepartment}
            />
          </div>
        </div>
        <Button
          onClick={() => openDeptModal("add")}
          disabled={companyInfo?.hasDepartment === 0}
        >
          เพิ่มแผนก
        </Button>
      </div>

      <div
        className={`overflow-x-auto ${
          companyInfo?.hasDepartment === 0
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-text-sub font-semibold">
              <th className="px-4 py-3 rounded-tl-lg">ชื่อแผนก</th>
              <th className="px-4 py-3">หัวหน้าแผนก</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">เบอร์โทรศัพท์</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments?.filter(Boolean).length > 0 ? (
              departments.filter(Boolean).map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {dept.departmentName}
                  </td>
                  <td className="px-4 py-3 text-text-sub">
                    {dept.headDep_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-text-sub">
                    {dept.headDep_email || "-"}
                  </td>
                  <td className="px-4 py-3 text-text-sub">
                    {dept.headDep_tel || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDeptModal("edit", dept)}
                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="แก้ไข"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal("department", dept)}
                        className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
                        title="ลบ"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-text-muted"
                >
                  ไม่พบข้อมูลแผนก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// กำหนด prop types สำหรับ DepartmentsSection
DepartmentsSection.propTypes = {
  companyInfo: PropTypes.shape({
    hasDepartment: PropTypes.oneOf([0, 1]),
  }),
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      departmentName: PropTypes.string,
      headDep_name: PropTypes.string,
      headDep_email: PropTypes.string,
      headDep_tel: PropTypes.string,
    })
  ),
  openDeptModal: PropTypes.func.isRequired,
  openDeleteModal: PropTypes.func.isRequired,
  handleCompanyDepartmentToggle: PropTypes.func.isRequired,
  isTogglingDepartment: PropTypes.bool.isRequired,
};

// ========================================================================
// ========================= ส่วนแสดงรายการอุปกรณ์ ============================
// ========================================================================

//  ฟังก์ชันแสดงรายการอุปกรณ์
function DevicesSection({
  devices, // รายการอุปกรณ์
  hasDeviceStatus, // ตัวบ่งชี้ว่าจะแสดงสถานะอุปกรณ์หรือไม่
  openDeviceModal, // ฟังก์ชันเปิดโมดอลอุปกรณ์
  openDeleteModal, // ฟังก์ชันเปิดโมดอลยืนยันการลบ
  handleSyncDevice, // ฟังก์ชันจัดการการซิงค์อุปกรณ์
  syncingDevices, // ชุดของอุปกรณ์ที่กำลังซิงค์
  openAccessModal, // ฟังก์ชันเปิดโมดอลจัดการสิทธิ์
}) {
  const devicesColCount = hasDeviceStatus ? 7 : 6;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-main font-display">
          รายการอุปกรณ์
        </h3>
        <Button onClick={() => openDeviceModal("add")}>
          <DevicesIcon className="w-4 h-4 mr-2" />
          ลงทะเบียนอุปกรณ์
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-text-sub font-semibold">
              <th className="px-4 py-3 rounded-tl-lg">ชื่ออุปกรณ์</th>
              <th className="px-4 py-3">HWID</th>
              <th className="px-4 py-3">Location URL</th>
              <th className="px-4 py-3">Passcode</th>
              {hasDeviceStatus && <th className="px-4 py-3">สถานะ</th>}
              <th className="px-4 py-3 text-center">สิทธิ์การเข้าถึง</th>
              <th className="px-4 py-3 rounded-tr-lg text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(devices) && devices.some(Boolean) ? (
              devices.filter(Boolean).map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {device.name}
                  </td>
                  <td className="px-4 py-3 text-text-sub font-mono text-xs">
                    {device.hwid}
                  </td>
                  <td className="px-4 py-3 text-text-sub text-sm truncate max-w-xs">
                    <a
                      href={device.locationURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {device.locationURL}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-text-sub font-mono text-xs">
                    {device.passcode}
                  </td>
                  {hasDeviceStatus && (
                    <td className="px-4 py-3">
                      {device.status ? (
                        <StatusBadge status={device.status} />
                      ) : (
                        <span className="text-text-sub">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAccessModal(device)}
                      className="text-xs px-3 py-1 h-auto"
                    >
                      <UsersIcon className="w-3 h-3 mr-1.5" />
                      จัดการสิทธิ์ ({device.employeeIds?.length || 0})
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip text="Sync ข้อมูล">
                        <button
                          onClick={() => handleSyncDevice(device.id)}
                          className="p-1 text-info hover:bg-info/10 rounded transition-colors"
                          disabled={syncingDevices?.has(device.id)}
                        >
                          <SyncIcon
                            className={`w-4 h-4 ${
                              syncingDevices?.has(device.id)
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </button>
                      </Tooltip>
                      <button
                        onClick={() => openDeviceModal("edit", device)}
                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="แก้ไข"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal("device", device)}
                        className="p-1 text-danger hover:bg-danger/10 rounded transition-colors"
                        title="ลบ"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={devicesColCount}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  ไม่พบข้อมูลอุปกรณ์
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// กำหนด prop types สำหรับ DevicesSection
DevicesSection.propTypes = {
  devices: PropTypes.arrayOf(PropTypes.object),
  hasDeviceStatus: PropTypes.bool,
  openDeviceModal: PropTypes.func.isRequired,
  openDeleteModal: PropTypes.func.isRequired,
  handleSyncDevice: PropTypes.func.isRequired,
  syncingDevices: PropTypes.instanceOf(Set),
  openAccessModal: PropTypes.func.isRequired,
};

// ========================================================================
// ========================= ส่วนหลักของหน้าจัดการองค์กร =========================
// ========================================================================

// ฟังก์ชันหลักของหน้าจัดการองค์กร
export function CompanyPage() {
  const logic = useCompanyLogic(); // ใช้ hook logic สำหรับจัดการสถานะและฟังก์ชันต่างๆ
  const {
    companyInfo,
    departments,
    devices,
    isLoading,
    activeTab,
    setActiveTab,
    isEditing,
    formData,
    handleEditClick,
    handleInputChange,
    handleSubmit,
    handleCancel,
    deptModal,
    deviceModal,
    deleteModal,
    accessModal,
    validationErrors,
    syncingDevices,
    isTogglingDepartment,
    openDeptModal,
    openDeviceModal,
    openDeleteModal,
    closeDeptModal,
    closeDeviceModal,
    closeDeleteModal,
    handleDeptSubmit,
    handleDeptInputChange,
    handleDeviceSubmit,
    handleDeviceInputChange,
    handleCompanyDepartmentToggle,
    handleSyncDevice,
    handleConfirmDelete,
    openAccessModal,
    closeAccessModal,
  } = logic; // ดึงสถานะและฟังก์ชันต่างๆ จาก hook logic

  if (isLoading && !companyInfo) {
    return <div className="p-8 text-center text-text-sub">Loading...</div>;
  }

  // ตรวจสอบว่ามีการระบุสถานะของอุปกรณ์หรือไม่
  const hasDeviceStatus =
    Array.isArray(devices) &&
    devices.some((d) => d.status != null && d.status !== "");
  // ฟังก์ชันปรับ URL ให้เป็นรูปแบบ HTTPS
  const normalizeToHttps = (url) => {
    if (!url) return url;
    const trimmed = String(url).trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("http://")) {
      return "https://" + trimmed.slice(7);
    }
    if (lower.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("//")) {
      return "https:" + trimmed;
    }
    return "https://" + trimmed;
  };
  // ปรับข้อมูลอุปกรณ์ให้ URL เป็น HTTPS
  const safeDevices = Array.isArray(devices)
    ? devices.map((d) => ({
        ...d,
        locationURL: normalizeToHttps(d.locationURL),
      }))
    : devices;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <CompanyIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-main font-display">
            จัดการข้อมูลองค์กร
          </h2>
          <p className="text-text-sub text-sm">
            ดูและแก้ไขข้อมูลบริษัทและโครงสร้างแผนก
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <TabButton
              active={activeTab === "info"}
              onClick={() => setActiveTab("info")}
            >
              ข้อมูลบริษัท
            </TabButton>
            <TabButton
              active={activeTab === "departments"}
              onClick={() => setActiveTab("departments")}
            >
              แผนก ({departments?.length || 0})
            </TabButton>
            <TabButton
              active={activeTab === "devices"}
              onClick={() => setActiveTab("devices")}
            >
              อุปกรณ์ ({devices?.length || 0})
            </TabButton>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-text-main font-display">
                  รายละเอียดบริษัท
                </h3>
                {!isEditing && (
                  <Button variant="outline" onClick={handleEditClick}>
                    แก้ไขข้อมูล
                  </Button>
                )}
              </div>

              <InfoSection
                companyInfo={companyInfo}
                isEditing={isEditing}
                formData={formData}
                handleEditClick={handleEditClick}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                isLoading={isLoading}
                validationErrors={validationErrors}
              />
            </div>
          )}

          {activeTab === "departments" && (
            <DepartmentsSection
              companyInfo={companyInfo}
              departments={departments}
              openDeptModal={openDeptModal}
              openDeleteModal={openDeleteModal}
              handleCompanyDepartmentToggle={handleCompanyDepartmentToggle}
              isTogglingDepartment={isTogglingDepartment}
            />
          )}

          {activeTab === "devices" && (
            <DevicesSection
              devices={safeDevices}
              hasDeviceStatus={hasDeviceStatus}
              openDeviceModal={openDeviceModal}
              openDeleteModal={openDeleteModal}
              handleSyncDevice={handleSyncDevice}
              syncingDevices={syncingDevices}
              openAccessModal={openAccessModal}
            />
          )}
        </div>
      </div>

      <DeviceAccessModal
        isOpen={accessModal.isOpen}
        onClose={closeAccessModal}
        device={accessModal.device}
      />

      <Modal
        isOpen={deptModal.isOpen}
        onClose={closeDeptModal}
        title={deptModal.mode === "add" ? "เพิ่มแผนกใหม่" : "แก้ไขข้อมูลแผนก"}
        footer={
          <>
            <Button variant="ghost" onClick={closeDeptModal}>
              ยกเลิก
            </Button>
            <Button onClick={handleDeptSubmit}>
              {deptModal.mode === "add" ? "เพิ่มแผนก" : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <Label htmlFor="departmentName">ชื่อแผนก</Label>
            <Input
              id="departmentName"
              name="departmentName"
              value={deptModal.data?.departmentName || ""}
              onChange={handleDeptInputChange}
              placeholder="เช่น ฝ่ายบุคคล, ฝ่ายขาย"
              error={validationErrors?.departmentName}
            />
          </div>
          <div>
            <Label htmlFor="headDep_name">ชื่อหัวหน้าแผนก</Label>
            <Input
              id="headDep_name"
              name="headDep_name"
              value={deptModal.data?.headDep_name || ""}
              onChange={handleDeptInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headDep_email">อีเมลหัวหน้าแผนก</Label>
              <Input
                id="headDep_email"
                name="headDep_email"
                type="email"
                value={deptModal.data?.headDep_email || ""}
                onChange={handleDeptInputChange}
              />
            </div>
            <div>
              <Label htmlFor="headDep_tel">เบอร์โทรศัพท์</Label>
              <Input
                id="headDep_tel"
                name="headDep_tel"
                value={deptModal.data?.headDep_tel || ""}
                onChange={handleDeptInputChange}
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deviceModal.isOpen}
        onClose={closeDeviceModal}
        title={
          deviceModal.mode === "add" ? "ลงทะเบียนอุปกรณ์ใหม่" : "แก้ไขอุปกรณ์"
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDeviceModal}>
              ยกเลิก
            </Button>
            <Button onClick={handleDeviceSubmit}>
              {deviceModal.mode === "add"
                ? "ลงทะเบียน"
                : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <Label htmlFor="deviceName">ชื่ออุปกรณ์</Label>
            <Input
              id="deviceName"
              name="name"
              value={deviceModal.data?.name || ""}
              onChange={handleDeviceInputChange}
              placeholder="เช่น เครื่องสแกนหน้าประตู 1"
              error={validationErrors?.name}
            />
          </div>
          <div>
            <Label htmlFor="hwid">Hardware ID (HWID)</Label>
            <Input
              id="hwid"
              name="hwid"
              value={deviceModal.data?.hwid || ""}
              onChange={handleDeviceInputChange}
              placeholder="ระบุรหัสเครื่อง"
              error={validationErrors?.hwid}
            />
          </div>
          <div>
            <Label htmlFor="locationURL">Location URL</Label>
            <Input
              id="locationURL"
              name="locationURL"
              value={deviceModal.data?.locationURL || ""}
              onChange={handleDeviceInputChange}
              placeholder="https://..."
              type="url"
              inputMode="url"
              pattern="https://.*"
              title="โปรดใช้ URL ที่เริ่มต้นด้วย https://"
              autoComplete="off"
              error={validationErrors?.locationURL}
            />
          </div>
          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              name="passcode"
              value={deviceModal.data?.passcode || ""}
              onChange={handleDeviceInputChange}
              placeholder="รหัสผ่านสำหรับเชื่อมต่อ"
              error={validationErrors?.passcode}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={`ยืนยันการลบ${
          deleteModal.type === "department" ? "แผนก" : "อุปกรณ์"
        }`}
        message={`คุณต้องการลบ "${deleteModal.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้`}
        confirmText="ลบข้อมูล"
        variant="danger"
      />
    </div>
  );
}
