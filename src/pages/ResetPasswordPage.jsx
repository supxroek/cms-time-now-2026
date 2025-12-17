import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "../components/atoms/Input";
import { Button } from "../components/atoms/Button";
import { resetPassword } from "../services/api";
import { useNotification } from "../hooks/useNotification";

export function ResetPasswordPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  // Try token from path first, then query param `token`
  const token = params.token || searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return error("ข้อมูลไม่ครบ", "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่าน");
    }
    if (password !== confirmPassword) {
      return error("รหัสผ่านไม่ตรงกัน", "กรุณาตรวจสอบรหัสผ่านอีกครั้ง");
    }

    try {
      setIsLoading(true);
      await resetPassword({ token, password });
      setIsLoading(false);
      success("สำเร็จ", "ตั้งค่ารหัสผ่านใหม่เรียบร้อย คุณสามารถเข้าสู่ระบบได้");
      // หลังจากเปลี่ยนรหัสผ่านสำเร็จ ให้กลับไปหน้า Login อัตโนมัติ
      navigate("/login", { replace: true });
    } catch (err) {
      setIsLoading(false);
      error("ผิดพลาด", err.message || "ไม่สามารถตั้งค่ารหัสผ่านได้");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-text-main mb-4">
          ตั้งค่ารหัสผ่านใหม่
        </h2>

        <p className="text-text-sub text-sm mb-4">
          สำหรับการพัฒนาหน้านี้จะยังไม่ตรวจสอบความถูกต้องของ token
          คุณสามารถเข้าดูหน้าได้เพื่อทดสอบ UI.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="รหัสผ่านใหม่"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "กำลังบันทึก..." : "ตั้งค่ารหัสผ่านใหม่"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
