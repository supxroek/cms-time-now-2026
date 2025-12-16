import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import attendanceReducer from "./slices/attendanceSlice";
import companyReducer from "./slices/companySlice";
import employeeReducer from "./slices/employeeSlice";
import shiftReducer from "./slices/shiftSlice";
import overtimeReducer from "./slices/overtimeSlice";
import requestReducer from "./slices/requestSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  // รวม reducers จาก slices ต่าง ๆ
  reducer: {
    auth: authReducer, // ตัวจัดการการตรวจสอบสิทธิ์
    attendance: attendanceReducer, // ตัวจัดการการเข้างาน
    company: companyReducer, // ตัวจัดการข้อมูลบริษัท
    employee: employeeReducer, // ตัวจัดการข้อมูลพนักงาน
    shifts: shiftReducer, // ตัวจัดการกะการทำงาน
    overtime: overtimeReducer, // ตัวจัดการการทำงานล่วงเวลา
    requests: requestReducer, // ตัวจัดการคำขอ
    dashboard: dashboardReducer, // ตัวจัดการ Dashboard
  },
});

export default store;
