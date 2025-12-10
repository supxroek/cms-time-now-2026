import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
} from "../../config/constants";

// ฟังก์ชันสำหรับการเข้าสู่ระบบ
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        credentials,
        { timeout: API_TIMEOUT }
      );

      const data = response.data;

      // ตรวจสอบโครงสร้างข้อมูลจาก Backend: { success: true, data: { token: "...", ...user } }
      if (data.success && data.data?.token) {
        const userData = data.data;
        const token = userData.token;

        // เก็บโทเค็นและข้อมูลผู้ใช้ใน localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        return userData; // ส่งกลับเฉพาะส่วน data ที่มี user info และ token
      } else {
        return rejectWithValue("Invalid response format from server");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

// Helper to safely parse JSON
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    // บันทึกข้อผิดพลาดเพื่อการดีบัก ในขณะที่ยังคงส่งกลับค่า null เมื่อเกิดความล้มเหลว
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

// สถานะเริ่มต้นของ state
const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

// สร้าง slice สำหรับการตรวจสอบสิทธิ์
const authSlice = createSlice({
  name: "auth",
  initialState, // สถานะเริ่มต้น
  reducers: {
    // ฟังก์ชันสำหรับการออกจากระบบ (logout)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // จัดการกับสถานะต่าง ๆ ของการเข้าสู่ระบบ
  extraReducers: (builder) => {
    // สร้างกรณีต่าง ๆ สำหรับการเข้าสู่ระบบ
    builder
      // เมื่อกำลังเข้าสู่ระบบ (Pending)
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true; // กำลังโหลด
        state.error = null;
      })
      // เมื่อเข้าสู่ระบบสำเร็จ (Fulfilled)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.isAuthenticated = true; // ตั้งค่าสถานะว่าเข้าสู่ระบบแล้ว
        state.user = action.payload; // ข้อมูลผู้ใช้ (รวม token)
        state.token = action.payload.token; // โทเค็นการตรวจสอบสิทธิ์
      })
      // เมื่อเข้าสู่ระบบล้มเหลว (Rejected)
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.error = action.payload; // ข้อความแสดงข้อผิดพลาด
      });
  },
});

// ส่งออก action และ reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
