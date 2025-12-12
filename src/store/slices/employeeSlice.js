import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/constants";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async Thunks

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.EMPLOYEES}`,
        getAuthHeader()
      );
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch employees"
      );
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  "employee/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.EMPLOYEES}/${id}`,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch employee details"
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.EMPLOYEES}/${id}`,
        data,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update employee"
      );
    }
  }
);

export const resignEmployee = createAsyncThunk(
  "employee/resignEmployee",
  async ({ id, resignDate }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.EMPLOYEES}/${id}/resign`,
        { resign_date: resignDate },
        getAuthHeader()
      );
      return { id, resignDate };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to resign employee"
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.EMPLOYEES}/${id}`,
        getAuthHeader()
      );
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete employee"
      );
    }
  }
);

const initialState = {
  employees: [],
  currentEmployee: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Employees
    builder.addCase(fetchEmployees.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.isLoading = false;
      state.employees = action.payload;
    });
    builder.addCase(fetchEmployees.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch Employee By ID
    builder.addCase(fetchEmployeeById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeeById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentEmployee = action.payload;
    });
    builder.addCase(fetchEmployeeById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Update Employee
    builder.addCase(updateEmployee.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateEmployee.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = "Employee updated successfully";
      // Update in list if exists
      const index = state.employees.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
      // Update current employee if matches
      if (state.currentEmployee?.id === action.payload.id) {
        state.currentEmployee = action.payload;
      }
    });
    builder.addCase(updateEmployee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Resign Employee
    builder.addCase(resignEmployee.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(resignEmployee.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = "Employee resigned successfully";
      // Update in list
      const index = state.employees.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.employees[index] = {
          ...state.employees[index],
          resign_date: action.payload.resignDate,
        };
      }
      // Update current employee
      if (state.currentEmployee?.id === action.payload.id) {
        state.currentEmployee = {
          ...state.currentEmployee,
          resign_date: action.payload.resignDate,
        };
      }
    });
    builder.addCase(resignEmployee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Delete Employee
    builder.addCase(deleteEmployee.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(deleteEmployee.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = "Employee deleted successfully";
      state.employees = state.employees.filter((e) => e.id !== action.payload);
      if (state.currentEmployee?.id === action.payload) {
        state.currentEmployee = null;
      }
    });
    builder.addCase(deleteEmployee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCurrentEmployee, clearMessages } = employeeSlice.actions;
export default employeeSlice.reducer;
