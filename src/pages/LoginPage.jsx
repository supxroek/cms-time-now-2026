import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { FormField } from "../components/molecules/FormField";
import { Button } from "../components/atoms/Button";
import { validate, loginSchema } from "../utils/validators";

export function LoginPage() {
  const { login, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const { isValid, errors: validationErrors } = validate(
      loginSchema,
      formData
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Attempt login
    await login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-card shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-primary mb-2">
            Time Now
          </h1>
          <p className="text-text-muted">ลงชื่อเข้าใช้เพื่อจัดการเวลาเข้างาน</p>
        </div>

        {authError && (
          <div className="mb-6 p-3 bg-status-error/10 border border-status-error/20 rounded-md text-status-error text-sm text-center">
            {typeof authError === "string"
              ? authError
              : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="อีเมล"
            type="email"
            name="email"
            id="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <FormField
            label="รหัสผ่าน"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full justify-center"
            disabled={isLoading}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
