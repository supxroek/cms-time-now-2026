import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
} from "../../config/constants";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchPendingRequests = createAsyncThunk(
  "requests/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.REQUESTS.PENDING}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch requests"
      );
    }
  }
);

export const fetchRequestHistory = createAsyncThunk(
  "requests/fetchHistory",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.REQUESTS.HISTORY}`,
        {
          ...getAuthHeader(),
          params: filters,
          timeout: API_TIMEOUT,
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch request history"
      );
    }
  }
);

export const fetchRequestStats = createAsyncThunk(
  "requests/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.REQUESTS.STATS}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch request stats"
      );
    }
  }
);

export const approveRequest = createAsyncThunk(
  "requests/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.REQUESTS.APPROVE(id)}`,
        {},
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to approve request"
      );
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "requests/reject",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.REQUESTS.REJECT(id)}`,
        {},
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to reject request"
      );
    }
  }
);

const requestSlice = createSlice({
  name: "requests",
  initialState: {
    items: [],
    history: {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    stats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total_history: 0,
    },
    loading: false,
    historyLoading: false,
    error: null,
    actionLoading: null, // ID of the request currently being processed
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Pending
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchRequestHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchRequestHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchRequestStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Approve
      .addCase(approveRequest.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.items = state.items.filter(
          (item) => item.request_id !== action.payload.id
        );
        // Update stats optimistically
        state.stats.pending = Math.max(0, state.stats.pending - 1);
        state.stats.approved += 1;
      })
      .addCase(approveRequest.rejected, (state) => {
        state.actionLoading = null;
      })
      // Reject
      .addCase(rejectRequest.pending, (state, action) => {
        state.actionLoading = action.meta.arg;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.items = state.items.filter(
          (item) => item.request_id !== action.payload.id
        );
        // Update stats optimistically
        state.stats.pending = Math.max(0, state.stats.pending - 1);
        state.stats.rejected += 1;
      })
      .addCase(rejectRequest.rejected, (state) => {
        state.actionLoading = null;
      });
  },
});

export default requestSlice.reducer;
