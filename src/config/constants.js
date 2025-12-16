export const API_BASE_URL = "http://localhost:3000/api"; // Development URL
// export const API_BASE_URL = "https://api-time-now-2026.onrender.com/api"; // Production URL
export const API_TIMEOUT = 5000; // 5 วินาที

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH_TOKEN: "/auth/refresh-token",
  },
  COMPANY: {
    PROFILE: "/company/profile",
    EMPLOYEES: "/company/employees",
  },
  DEPARTMENTS: {
    BASE: "/company/departments",
    BY_ID: (id) => `/company/departments/${id}`,
  },
  DEVICES: {
    BASE: "/devices",
    SYNC: "/devices/sync-trigger",
    BY_ID: (id) => `/devices/${id}`,
  },
  ATTENDANCE: {
    CHECK_IN: "/attendance/check-in",
    CHECK_OUT: "/attendance/check-out",
    TODAY: "/attendance/today",
    SUMMARY: "/attendance/summary",
    HISTORY: "/attendance/history",
  },
  REQUESTS: {
    PENDING: "/requests/pending",
    HISTORY: "/requests/history",
    STATS: "/requests/stats",
    APPROVE: (id) => `/requests/${id}/approve`,
    REJECT: (id) => `/requests/${id}/reject`,
  },
  SHIFTS: {
    BASE: "/shifts",
    ASSIGN: "/shifts/assign",
    BY_ID: (id) => `/shifts/${id}`,
  },
  OVERTIME: {
    BASE: "/overtimes",
    BY_ID: (id) => `/overtimes/${id}`,
  },
  DASHBOARD: {
    BASE: "/dashboard",
    STATS: "/dashboard/stats",
    ATTENDANCE: "/dashboard/attendance",
    ACTIVITIES: "/dashboard/activities",
    EMPLOYEE_HISTORY: (id) => `/dashboard/employee/${id}/history`,
  },
};
