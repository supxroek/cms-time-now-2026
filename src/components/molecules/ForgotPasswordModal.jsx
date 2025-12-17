import { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "./Modal";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { requestPasswordReset } from "../../services/api";
import { useNotification } from "../../hooks/useNotification";

export function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return error("ข้อมูลไม่ครบ", "กรุณากรอกอีเมลของคุณ");

    try {
      setIsLoading(true);
      await requestPasswordReset({ email });
      setIsLoading(false);
      success(
        "ส่งอีเมลเรียบร้อย",
        "ระบบได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลแล้ว"
      );
      setEmail("");
      onClose();
    } catch (err) {
      setIsLoading(false);
      error("ไม่สามารถส่งอีเมลได้", err.message || "กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ลืมรหัสผ่าน"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          >
            ส่งลิงก์รีเซ็ต
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-text-sub text-sm">
          กรอกอีเมลที่คุณใช้ลงทะเบียนไว้กับระบบ
          เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
        </p>

        <Input
          type="email"
          name="email"
          id="forgot-email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </form>
    </Modal>
  );
}

ForgotPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordModal;
