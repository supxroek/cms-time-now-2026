import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
} from "../../config/constants";

// ฟังก์ชันช่วยสำหรับการตั้งค่า header การตรวจสอบสิทธิ์
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ฟังก์ชันสำหรับการเช็คอิน
export const checkIn = createAsyncThunk(
  "attendance/checkIn",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE.CHECK_IN}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Check-in failed");
    }
  }
);

// ฟังก์ชันสำหรับการเช็คเอาท์
export const checkOut = createAsyncThunk(
  "attendance/checkOut",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE.CHECK_OUT}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Check-out failed");
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  "attendance/fetchHistory",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE.HISTORY}`,
        {
          ...getAuthHeader(),
          params,
          timeout: API_TIMEOUT,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch attendance history"
      );
    }
  }
);

// สถานะเริ่มต้นของ state
const initialState = {
  todayRecord: null,
  history: [],
  status: "idle", // 'idle' | 'working' | 'break'
  isLoading: false,
  error: null,
};

// สร้าง slice สำหรับการจัดการการเข้างาน
const attendanceSlice = createSlice({
  name: "attendance",
  initialState, // สถานะเริ่มต้น
  reducers: {
    // ฟังก์ชันสำหรับการตั้งค่าสถานะการเข้างาน (เช่น 'idle', 'working', 'break')
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },

  // จัดการกับสถานะต่าง ๆ ของการเช็คอินและเช็คเอาท์
  extraReducers: (builder) => {
    // สร้างกรณีต่าง ๆ สำหรับการเช็คอินและเช็คเอาท์
    builder
      // Check In
      // เมื่อกำลังเช็คอิน (Pending)
      .addCase(checkIn.pending, (state) => {
        state.isLoading = true; // กำลังโหลด
        state.error = null;
      })
      // เมื่อเช็คอินสำเร็จ (Fulfilled)
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.todayRecord = action.payload; // บันทึกการเข้างานของวันนี้
        state.status = "working"; // ตั้งค่าสถานะเป็น 'working'
      })
      // เมื่อเช็คอินล้มเหลว (Rejected)
      .addCase(checkIn.rejected, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.error = action.payload; // ข้อความแสดงข้อผิดพลาด
      })

      // Check Out
      // เมื่อกำลังเช็คเอาท์ (Pending)
      .addCase(checkOut.pending, (state) => {
        state.isLoading = true; // กำลังโหลด
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.todayRecord = action.payload; // อัปเดตบันทึกการเข้างานของวันนี้
        state.status = "idle"; // ตั้งค่าสถานะเป็น 'idle'
      })
      // เมื่อเช็คเอาท์ล้มเหลว (Rejected)
      .addCase(checkOut.rejected, (state, action) => {
        state.isLoading = false; // หยุดโหลด
        state.error = action.payload; // ข้อความแสดงข้อผิดพลาด
      })

      // Fetch History
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ส่งออก action และ reducer
export const { setStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
