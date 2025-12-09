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
      // เก็บโทเค็นใน localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// สถานะเริ่มต้นของ state
const initialState = {
  user: null,
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
        state.user = action.payload.user; // ข้อมูลผู้ใช้
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
