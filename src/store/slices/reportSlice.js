/**
 * Report Slice
 * จัดการ state สำหรับหน้า Report
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/constants";

// Helper function สำหรับสร้าง headers พร้อม token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Thunk: ดึงข้อมูล Report ทั้งหมด
export const fetchReportData = createAsyncThunk(
  "report/fetchReportData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate, year } = params;
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (year) queryParams.append("year", year);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.BASE}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch report data"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Overview Stats
export const fetchOverviewStats = createAsyncThunk(
  "report/fetchOverviewStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.OVERVIEW}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch overview stats"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Hour Summary
export const fetchHourSummary = createAsyncThunk(
  "report/fetchHourSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.HOURS}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch hour summary"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Attendance Trend
export const fetchAttendanceTrend = createAsyncThunk(
  "report/fetchAttendanceTrend",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.TREND}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attendance trend"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Department Distribution
export const fetchDepartmentDistribution = createAsyncThunk(
  "report/fetchDepartmentDistribution",
  async (_, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.DEPARTMENTS}`;
      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch department distribution"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Monthly Summary
export const fetchMonthlySummary = createAsyncThunk(
  "report/fetchMonthlySummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { year } = params;
      const queryParams = new URLSearchParams();

      if (year) queryParams.append("year", year);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.MONTHLY}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch monthly summary"
      );
    }
  }
);

// Thunk: ดึงข้อมูล Individual Summary
export const fetchIndividualSummary = createAsyncThunk(
  "report/fetchIndividualSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate, limit } = params;
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (limit) queryParams.append("limit", limit);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS.INDIVIDUAL}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, getAuthHeader());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch individual summary"
      );
    }
  }
);

// Initial state
const initialState = {
  // Data
  overviewStats: null,
  hourSummary: null,
  attendanceTrend: [],
  departmentDistribution: [],
  monthlySummary: [],
  individualSummary: [],
  dateRange: null,

  // UI State
  loading: false,
  error: null,

  // Individual loading states
  loadingOverview: false,
  loadingHours: false,
  loadingTrend: false,
  loadingDepartments: false,
  loadingMonthly: false,
  loadingIndividual: false,
};

// Slice
const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
    clearReportData: (state) => {
      state.overviewStats = null;
      state.hourSummary = null;
      state.attendanceTrend = [];
      state.departmentDistribution = [];
      state.monthlySummary = [];
      state.individualSummary = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReportData
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.overviewStats = action.payload.overviewStats;
        state.hourSummary = action.payload.hourSummary;
        state.attendanceTrend = action.payload.attendanceTrend;
        state.departmentDistribution = action.payload.departmentDistribution;
        state.monthlySummary = action.payload.monthlySummary;
        state.individualSummary = action.payload.individualSummary;
        state.dateRange = action.payload.dateRange;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchOverviewStats
      .addCase(fetchOverviewStats.pending, (state) => {
        state.loadingOverview = true;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.loadingOverview = false;
        state.overviewStats = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.loadingOverview = false;
        state.error = action.payload;
      })

      // fetchHourSummary
      .addCase(fetchHourSummary.pending, (state) => {
        state.loadingHours = true;
      })
      .addCase(fetchHourSummary.fulfilled, (state, action) => {
        state.loadingHours = false;
        state.hourSummary = action.payload;
      })
      .addCase(fetchHourSummary.rejected, (state, action) => {
        state.loadingHours = false;
        state.error = action.payload;
      })

      // fetchAttendanceTrend
      .addCase(fetchAttendanceTrend.pending, (state) => {
        state.loadingTrend = true;
      })
      .addCase(fetchAttendanceTrend.fulfilled, (state, action) => {
        state.loadingTrend = false;
        state.attendanceTrend = action.payload;
      })
      .addCase(fetchAttendanceTrend.rejected, (state, action) => {
        state.loadingTrend = false;
        state.error = action.payload;
      })

      // fetchDepartmentDistribution
      .addCase(fetchDepartmentDistribution.pending, (state) => {
        state.loadingDepartments = true;
      })
      .addCase(fetchDepartmentDistribution.fulfilled, (state, action) => {
        state.loadingDepartments = false;
        state.departmentDistribution = action.payload;
      })
      .addCase(fetchDepartmentDistribution.rejected, (state, action) => {
        state.loadingDepartments = false;
        state.error = action.payload;
      })

      // fetchMonthlySummary
      .addCase(fetchMonthlySummary.pending, (state) => {
        state.loadingMonthly = true;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.loadingMonthly = false;
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, (state, action) => {
        state.loadingMonthly = false;
        state.error = action.payload;
      })

      // fetchIndividualSummary
      .addCase(fetchIndividualSummary.pending, (state) => {
        state.loadingIndividual = true;
      })
      .addCase(fetchIndividualSummary.fulfilled, (state, action) => {
        state.loadingIndividual = false;
        state.individualSummary = action.payload;
      })
      .addCase(fetchIndividualSummary.rejected, (state, action) => {
        state.loadingIndividual = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportError, clearReportData } = reportSlice.actions;
export default reportSlice.reducer;
