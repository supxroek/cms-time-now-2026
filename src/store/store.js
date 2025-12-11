import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import attendanceReducer from "./slices/attendanceSlice";
import companyReducer from "./slices/companySlice";
import employeeReducer from "./slices/employeeSlice";

export const store = configureStore({
  // รวม reducers จาก slices ต่าง ๆ
  reducer: {
    auth: authReducer, // ตัวจัดการการตรวจสอบสิทธิ์
    attendance: attendanceReducer, // ตัวจัดการการเข้างาน
    company: companyReducer, // ตัวจัดการข้อมูลบริษัท
    employee: employeeReducer, // ตัวจัดการข้อมูลพนักงาน
  },
});

export default store;
