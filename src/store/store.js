import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import attendanceReducer from "./slices/attendanceSlice";

export const store = configureStore({
  // รวม reducers จาก slices ต่าง ๆ
  reducer: {
    auth: authReducer, // ตัวจัดการการตรวจสอบสิทธิ์
    attendance: attendanceReducer, // ตัวจัดการการเข้างาน
  },
});

export default store;
