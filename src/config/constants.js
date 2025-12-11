export const API_BASE_URL = "http://localhost:3000/api";
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
  },
  SHIFTS: {
    BASE: "/shifts",
    ASSIGN: "/shifts/assign",
    BY_ID: (id) => `/shifts/${id}`,
  },
};
