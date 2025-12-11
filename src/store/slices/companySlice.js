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

export const fetchCompanyInfo = createAsyncThunk(
  "company/fetchInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.PROFILE}`,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch company info"
      );
    }
  }
);

export const updateCompanyInfo = createAsyncThunk(
  "company/updateInfo",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.COMPANY.PROFILE}`,
        data,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update company info"
      );
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  "company/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DEPARTMENTS.BASE}`,
        getAuthHeader()
      );
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch departments"
      );
    }
  }
);

export const fetchDevices = createAsyncThunk(
  "company/fetchDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.DEVICES.BASE}`,
        getAuthHeader()
      );
      // API returns { devices: [], total: ... } or just array depending on implementation
      const data = response.data.data;
      return Array.isArray(data) ? data : data.devices || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch devices"
      );
    }
  }
);

export const syncDevice = createAsyncThunk(
  "company/syncDevice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.DEVICES.SYNC}`,
        { id },
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to sync device"
      );
    }
  }
);

export const addDepartment = createAsyncThunk(
  "company/addDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.DEPARTMENTS.BASE}`,
        data,
        getAuthHeader()
      );
      if (response.data.debug) {
        console.log("Add Department Debug:", response.data.debug);
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add department"
      );
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "company/updateDepartment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.DEPARTMENTS.BY_ID(data.id)}`,
        data,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update department"
      );
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "company/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DEPARTMENTS.BY_ID(id)}`,
        getAuthHeader()
      );
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete department"
      );
    }
  }
);

export const addDevice = createAsyncThunk(
  "company/addDevice",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.DEVICES.BASE}`,
        data,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to add device"
      );
    }
  }
);

export const updateDevice = createAsyncThunk(
  "company/updateDevice",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.DEVICES.BY_ID(data.id)}`,
        data,
        getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update device"
      );
    }
  }
);

export const deleteDevice = createAsyncThunk(
  "company/deleteDevice",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DEVICES.BY_ID(id)}`,
        getAuthHeader()
      );
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete device"
      );
    }
  }
);

const initialState = {
  companyInfo: null,
  departments: [],
  devices: [],
  isLoading: false,
  error: null,
  updateSuccess: false,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Company Info
    builder.addCase(fetchCompanyInfo.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCompanyInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.companyInfo = action.payload;
    });
    builder.addCase(fetchCompanyInfo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Update Company Info
    builder.addCase(updateCompanyInfo.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateCompanyInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.companyInfo = action.payload;
      state.updateSuccess = true;
    });
    builder.addCase(updateCompanyInfo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch Departments
    builder.addCase(fetchDepartments.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchDepartments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.departments = action.payload || [];
    });
    builder.addCase(fetchDepartments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add Department
    builder.addCase(addDepartment.fulfilled, (state, action) => {
      state.departments.push(action.payload);
    });

    // Update Department
    builder.addCase(updateDepartment.fulfilled, (state, action) => {
      const index = state.departments.findIndex(
        (d) => d.id === action.payload.id
      );
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    });

    // Delete Department
    builder.addCase(deleteDepartment.fulfilled, (state, action) => {
      state.departments = state.departments.filter(
        (d) => d.id !== action.payload
      );
    });

    // Fetch Devices
    builder.addCase(fetchDevices.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchDevices.fulfilled, (state, action) => {
      state.isLoading = false;
      state.devices = action.payload || [];
    });
    builder.addCase(fetchDevices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add Device
    builder.addCase(addDevice.fulfilled, (state, action) => {
      state.devices.push(action.payload);
    });

    // Update Device
    builder.addCase(updateDevice.fulfilled, (state, action) => {
      const index = state.devices.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = action.payload;
      }
    });

    // Sync Device
    builder.addCase(syncDevice.fulfilled, (state, action) => {
      const index = state.devices.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = {
          ...state.devices[index],
          ...action.payload,
        };
      }
    });

    // Delete Device
    builder.addCase(deleteDevice.fulfilled, (state, action) => {
      state.devices = state.devices.filter((d) => d.id !== action.payload);
    });
  },
});

export const { resetUpdateSuccess } = companySlice.actions;
export default companySlice.reducer;
