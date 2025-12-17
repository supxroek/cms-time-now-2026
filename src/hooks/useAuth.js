import { useSelector, useDispatch } from "react-redux";
import { loginUser, logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./useNotification";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (credentials) => {
    const resultAction = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(resultAction)) {
      success(
        "เข้าสู่ระบบสำเร็จ",
        `ยินดีต้อนรับ ${resultAction.payload?.name || "คุณ"}`
      );
      navigate("/dashboard");
      return true;
    } else {
      const errorMessage = resultAction.payload || "เข้าสู่ระบบไม่สำเร็จ";
      showError("เข้าสู่ระบบล้มเหลว", errorMessage);
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    success("ออกจากระบบแล้ว", "ขอบคุณที่ใช้งาน");
    navigate("/login");
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
  };
};
