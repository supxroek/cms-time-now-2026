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

export const fetchOvertimes = createAsyncThunk(
  "overtime/fetchOvertimes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.OVERTIME.BASE}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch overtimes"
      );
    }
  }
);

export const createOvertime = createAsyncThunk(
  "overtime/createOvertime",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.OVERTIME.BASE}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create overtime"
      );
    }
  }
);

export const updateOvertime = createAsyncThunk(
  "overtime/updateOvertime",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.OVERTIME.BY_ID(id)}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update overtime"
      );
    }
  }
);

export const deleteOvertime = createAsyncThunk(
  "overtime/deleteOvertime",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.OVERTIME.BY_ID(id)}`, {
        ...getAuthHeader(),
        timeout: API_TIMEOUT,
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete overtime"
      );
    }
  }
);

const overtimeSlice = createSlice({
  name: "overtime",
  initialState: {
    overtimes: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOvertimes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOvertimes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overtimes = action.payload;
      })
      .addCase(fetchOvertimes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createOvertime.fulfilled, (state, action) => {
        state.overtimes.push(action.payload);
      })
      .addCase(updateOvertime.fulfilled, (state, action) => {
        const index = state.overtimes.findIndex(
          (ot) => ot.id === action.payload.id
        );
        if (index !== -1) {
          state.overtimes[index] = action.payload;
        }
      })
      .addCase(deleteOvertime.fulfilled, (state, action) => {
        state.overtimes = state.overtimes.filter(
          (ot) => ot.id !== action.payload
        );
      });
  },
});

export default overtimeSlice.reducer;
