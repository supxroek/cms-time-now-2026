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

export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.SHIFTS.BASE}`,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch shifts");
    }
  }
);

export const createShift = createAsyncThunk(
  "shifts/createShift",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SHIFTS.BASE}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create shift");
    }
  }
);

export const updateShift = createAsyncThunk(
  "shifts/updateShift",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.SHIFTS.BY_ID(id)}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update shift");
    }
  }
);

export const assignShift = createAsyncThunk(
  "shifts/assignShift",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SHIFTS.ASSIGN}`,
        data,
        { ...getAuthHeader(), timeout: API_TIMEOUT }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to assign shift");
    }
  }
);

export const deleteShift = createAsyncThunk(
  "shifts/deleteShift",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.SHIFTS.BY_ID(id)}`, {
        ...getAuthHeader(),
        timeout: API_TIMEOUT,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete shift");
    }
  }
);

const initialState = {
  shifts: [],
  isLoading: false,
  error: null,
};

const shiftSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shifts = action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.shifts.push(action.payload);
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.payload.id
        );
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter(
          (shift) => shift.id !== action.payload
        );
      });
  },
});

export default shiftSlice.reducer;
