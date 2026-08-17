import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    throw new Error(errorMessage);
  }
);

const apiService = {
  // Add axios instance for direct access
  axios: api,

  // ===== EMPLOYEE REGISTRATION METHODS =====

  // Get all employees with pagination and search
  getEmployees: async (params = {}) => {
    return await api.get("/hrms/employees", { params });
  },

  // Get single employee by ID
  getEmployee: async (id) => {
    return await api.get(`/hrms/employee/${id}`);
  },

  // Create employee with image
  createEmployeeWithImage: async (formData) => {
    return await api.post("/hrms/register-employee", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update employee with image
  updateEmployeeWithImage: async (id, formData) => {
    return await api.put(`/hrms/employee/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete employee
  deleteEmployee: async (id) => {
    return await api.delete(`/hrms/employee/${id}`);
  },

  // ===== ATTENDANCE METHODS =====

  // Get attendance records with filtering
  getAttendance: async (params = {}) => {
    return await api.get("/hrms/attendance", { params });
  },

  // Get today's attendance
  getTodayAttendance: async () => {
    const response = await api.get("/hrms/attendance/today");
    // Ensure response has success property and proper structure
    if (response && !response.success && response.attendance) {
      return { success: true, ...response };
    }
    return response;
  },

  // Get attendance statistics
  getAttendanceStats: async () => {
    return await api.get("/hrms/attendance/stats");
  },

  // Get employee attendance details
  getEmployeeAttendanceDetails: async (employeeId, period = "month") => {
    return await api.get(`/hrms/attendance/employee/${employeeId}`, {
      params: { period },
    });
  },

  // Punch in
  punchIn: async (
    employeeId,
    location,
    faceVerified = false,
    coordinates = null
  ) => {
    return await api.post("/hrms/attendance/punch-in", {
      employeeId,
      location,
      faceVerified,
      coordinates,
    });
  },

  // Punch out
  punchOut: async (
    employeeId,
    location,
    faceVerified = false,
    coordinates = null
  ) => {
    return await api.post("/hrms/attendance/punch-out", {
      employeeId,
      location,
      faceVerified,
      coordinates,
    });
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    return await api.post("/hrms/attendance/apply-leave", leaveData);
  },

  // Get pending leaves
  getPendingLeaves: async () => {
    return await api.get("/hrms/leave/pending");
  },

  // Approve leave
  approveLeave: async (leaveId) => {
    return await api.put(`/hrms/leave/${leaveId}/approve`);
  },

  // Reject leave
  rejectLeave: async (leaveId, reason) => {
    return await api.put(`/hrms/leave/${leaveId}/reject`, { reason });
  },

  // Get leave balance
  getLeaveBalance: async (employeeId) => {
    return await api.get(`/hrms/leave/employee/${employeeId}/balance`);
  },

  // ===== SALARY SLIP METHODS =====

  // Generate salary slip for single employee
  generateSalarySlip: async (employeeId, month, year) => {
    return await api.post("/hrms/salary/generate", {
      employeeId,
      month,
      year,
    });
  },

  // Generate salary slips for all employees
  generateAllSalarySlips: async (month, year) => {
    return await api.post("/hrms/salary/generate-all", {
      month,
      year,
    });
  },

  // Generate monthly salary slips
  generateMonthlySalarySlips: async (month, year) => {
    return await api.post("/hrms/salary/generate-monthly", {
      month,
      year,
    });
  },

  // Get salary slips with filtering
  getSalarySlips: async (params = {}) => {
    return await api.get("/hrms/salary/slips", { params });
  },

  // Get salary slip by ID
  getSalarySlip: async (id) => {
    return await api.get(`/hrms/salary/slip/${id}`);
  },

  // Download salary slip PDF
  downloadSalarySlip: async (id) => {
    return await api.get(`/hrms/salary/slip/${id}/download`, {
      responseType: "blob",
    });
  },

  // View salary slip HTML
  viewSalarySlip: async (id) => {
    return await api.get(`/hrms/salary/slip/${id}/view`);
  },

  // Get salary statistics
  getSalaryStats: async () => {
    return await api.get("/hrms/salary/stats");
  },

  // Get queue status
  getQueueStatus: async () => {
    return await api.get("/hrms/salary/queue-status");
  },

  // Clear all salary slips
  clearAllSalarySlips: async () => {
    return await api.delete("/hrms/salary/clear-all");
  },

  // Edit salary slip
  editSalarySlip: async (id, updates) => {
    return await api.put(`/hrms/salary/slip/${id}/edit`, updates);
  },

  // ===== SHIFT MANAGEMENT METHODS =====

  // Get all shifts
  getShifts: async (params = {}) => {
    return await api.get("/hrms/shifts", { params });
  },

  // Get shift by ID
  getShift: async (id) => {
    return await api.get(`/hrms/shifts/${id}`);
  },

  // Get employee's active shift
  getEmployeeShift: async (employeeId) => {
    return await api.get(`/hrms/shifts/employee/${employeeId}`);
  },

  // Create shift
  createShift: async (shiftData) => {
    return await api.post("/hrms/shifts", shiftData);
  },

  // Update shift
  updateShift: async (id, shiftData) => {
    return await api.put(`/hrms/shifts/${id}`, shiftData);
  },

  // Delete shift
  deleteShift: async (id) => {
    return await api.delete(`/hrms/shifts/${id}`);
  },

  // ===== UTILITY METHODS =====

  // Generic GET request
  get: async (url, params = {}) => {
    return await api.get(url, { params });
  },

  // Generic POST request
  post: async (url, data = {}) => {
    return await api.post(url, data);
  },

  // Generic PUT request
  put: async (url, data = {}) => {
    return await api.put(url, data);
  },

  // Generic DELETE request
  delete: async (url) => {
    return await api.delete(url);
  },

  // Upload file
  uploadFile: async (url, file, onProgress = null) => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
  },
};

export default apiService;
