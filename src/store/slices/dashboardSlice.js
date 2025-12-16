import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
} from "../../config/constants";

// Helper function สำหรับ auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ==================== Async Thunks ====================

// ดึงข้อมูล Dashboard ทั้งหมด
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.BASE}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

// ดึงสถิติการเข้างานของวันนี้
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.STATS}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

// ดึงรายการ attendance ของวันนี้
export const fetchTodayAttendance = createAsyncThunk(
  "dashboard/fetchTodayAttendance",
  async (params, { rejectWithValue }) => {
    params = params || {};
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.ATTENDANCE}`,
        {
          ...getAuthHeader(),
          params,
          timeout: API_TIMEOUT,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attendance records"
      );
    }
  }
);

// ดึงกิจกรรมล่าสุด
export const fetchRecentActivities = createAsyncThunk(
  "dashboard/fetchRecentActivities",
  async (limit, { rejectWithValue }) => {
    limit = limit ?? 20;
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.ACTIVITIES}`,
        {
          ...getAuthHeader(),
          params: { limit },
          timeout: API_TIMEOUT,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent activities"
      );
    }
  }
);

// ดึงประวัติการเข้างานของพนักงาน
export const fetchEmployeeHistory = createAsyncThunk(
  "dashboard/fetchEmployeeHistory",
  async (payload, { rejectWithValue }) => {
    payload = payload || {};
    const { employeeId, days = 5 } = payload;
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.EMPLOYEE_HISTORY(
          employeeId
        )}`,
        {
          ...getAuthHeader(),
          params: { days },
          timeout: API_TIMEOUT,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee history"
      );
    }
  }
);

// ==================== Initial State ====================
const initialState = {
  // Dashboard statistics
  stats: {
    totalEmployees: 0,
    checkedInCount: 0,
    onTimeCount: 0,
    lateCount: 0,
    absentCount: 0,
    otCount: 0,
    avgCheckInTime: null,
    avgLateMinutes: 0,
    avgBreakMinutes: 0,
  },

  // Recent activities list
  recentActivities: [],

  // Today's attendance records
  attendanceRecords: [],
  attendancePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Departments list for filter
  departments: ["All"],

  // Selected employee for modal
  selectedEmployee: null,
  employeeHistory: [],

  // Loading states
  isLoading: false,
  isLoadingActivities: false,
  isLoadingAttendance: false,
  isLoadingHistory: false,

  // Error state
  error: null,
};

// ==================== Slice ====================
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Set selected employee for modal
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    // Clear selected employee
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.employeeHistory = [];
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ==================== Fetch Dashboard Data ====================
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities;
        state.departments = action.payload.departments;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Fetch Dashboard Stats ====================
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==================== Fetch Today Attendance ====================
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.isLoadingAttendance = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.isLoadingAttendance = false;
        state.attendanceRecords = action.payload.records;
        state.attendancePagination = action.payload.pagination;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.isLoadingAttendance = false;
        state.error = action.payload;
      })

      // ==================== Fetch Recent Activities ====================
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoadingActivities = true;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoadingActivities = false;
        state.recentActivities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoadingActivities = false;
        state.error = action.payload;
      })

      // ==================== Fetch Employee History ====================
      .addCase(fetchEmployeeHistory.pending, (state) => {
        state.isLoadingHistory = true;
      })
      .addCase(fetchEmployeeHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.employeeHistory = action.payload;
      })
      .addCase(fetchEmployeeHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.error = action.payload;
      });
  },
});

// Export actions และ reducer
export const { setSelectedEmployee, clearSelectedEmployee, clearError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
