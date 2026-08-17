import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Eye,
  Edit,
  Loader,
  UserCheck,
  Camera,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import FaceRecognition from "./FaceRecognition";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const { user: currentUser } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });

  const [formData, setFormData] = useState({
    employee: "",
    date: new Date().toISOString().split("T")[0],
    timeIn: "09:00",
    timeOut: "18:00",
    location: "Office - Floor 1",
    status: "Present",
    leaveType: "",
    reason: "",
    actionType: "punch-in",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] =
    useState(null);
  const [faceVerified, setFaceVerified] = useState(false);
  const [attendanceAction, setAttendanceAction] = useState(""); // 'punch-in' or 'punch-out'

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("today"); // Default to today
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [employeeDetailsLoading, setEmployeeDetailsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load data on component mount
  useEffect(() => {
    fetchBranches();
    fetchAttendance();
    fetchStats();
  }, []);

  // Fetch employees when branch changes
  useEffect(() => {
    fetchEmployees();
  }, [selectedBranch]);

  // Fetch attendance when filters change
  useEffect(() => {
    fetchAttendance();
  }, [
    currentPage,
    itemsPerPage,
    employeeFilter,
    statusFilter,
    searchQuery,
    periodFilter,
    customStartDate,
    customEndDate,
    selectedBranch,
  ]);

  const fetchBranches = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
      const response = await fetch(`${API_BASE_URL}/hotel/getAllRestaurants`);
      const data = await response.json();
      const branchList = Array.isArray(data) ? data : (data.data || data.hotels || []);
      setBranches(branchList);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const params = { limit: 1000 };
      if (selectedBranch) {
        params.branch = selectedBranch;
      }
      const response = await apiService.getEmployees(params);
      if (response.success) {
        setEmployees(response.employees || []);
      } else {
        console.error("Failed to fetch employees:", response);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        includeAbsent: "true", // Always include absent employees
      };

      // Handle period-based filtering
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      switch (periodFilter) {
        case "today":
          params.startDate = todayStr;
          params.endDate = todayStr;
          break;
        case "week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          params.startDate = weekStart.toISOString().split("T")[0];
          params.endDate = todayStr;
          break;
        case "month":
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          params.startDate = monthStart.toISOString().split("T")[0];
          params.endDate = todayStr;
          break;
        case "year":
          const yearStart = new Date(today.getFullYear(), 0, 1);
          params.startDate = yearStart.toISOString().split("T")[0];
          params.endDate = todayStr;
          break;
        case "custom":
          if (customStartDate) {
            params.startDate = customStartDate;
          }
          if (customEndDate) {
            params.endDate = customEndDate;
          }
          // If only start date is provided, use it as both start and end
          if (customStartDate && !customEndDate) {
            params.endDate = customStartDate;
          }
          break;
      }

      // Add other filters
      if (employeeFilter !== "All") {
        params.employeeId = employeeFilter;
      }
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedBranch) {
        params.branch = selectedBranch;
      }

      let response;
      if (periodFilter === "today") {
        // Use dedicated today endpoint to avoid timezone/date-boundary issues
        response = await apiService.getTodayAttendance();
        if (response.success) {
          setAttendance(response.attendance || []);
          setTotalPages(1);
          setTotalRecords((response.attendance || []).length);
          
          // Update stats from response
          if (response.presentToday !== undefined) {
            setStats({
              totalEmployees: response.totalEmployees || stats.totalEmployees,
              presentToday: response.presentToday || 0,
              lateToday: response.lateToday || 0,
              absentToday: response.absentToday || 0,
            });
          }
        }
      } else {
        response = await apiService.getAttendance(params);
        if (response.success) {
          setAttendance(response.attendance || []);
          setTotalPages(response.totalPages || 1);
          setTotalRecords(response.total || 0);

          // Update stats with response data if available
          if (response.totalEmployees !== undefined || response.presentToday !== undefined) {
            setStats((prev) => ({
              totalEmployees: response.totalEmployees || prev.totalEmployees,
              presentToday: response.presentToday || prev.presentToday,
              lateToday: response.lateToday || prev.lateToday,
              absentToday: response.absentToday || prev.absentToday,
            }));
          }
        } else {
          console.error("Failed to fetch attendance:", response);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getAttendanceStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handlePunchIn = async (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (!employee) return;

    setSelectedEmployeeForAttendance(employee);
    setAttendanceAction("punch-in");
    setShowFaceRecognition(true);
  };

  const handlePunchOut = async (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (!employee) return;

    setSelectedEmployeeForAttendance(employee);
    setAttendanceAction("punch-out");
    setShowFaceRecognition(true);
  };

  const handleFaceMatched = async (matched, confidence) => {
    setShowFaceRecognition(false);

    if (matched) {
      setFaceVerified(true);

      try {
        setLoading(true);
        let response;

        if (attendanceAction === "punch-in") {
          response = await apiService.punchIn(
            selectedEmployeeForAttendance._id,
            "Office",
            true
          );
        } else {
          response = await apiService.punchOut(
            selectedEmployeeForAttendance._id,
            "Office",
            true
          );
        }

        if (response.success) {
          alert(
            `${
              attendanceAction === "punch-in" ? "Punch In" : "Punch Out"
            } successful!`
          );
          fetchAttendance();
          fetchStats();
        } else {
          alert(response.message || "Failed to record attendance");
        }
      } catch (error) {
        console.error("Attendance error:", error);
        alert(error.message || "Failed to record attendance");
      } finally {
        setLoading(false);
        setSelectedEmployeeForAttendance(null);
        setAttendanceAction("");
        setFaceVerified(false);
      }
    } else {
      // Face verification failed - offer manual option
      const proceedManually = window.confirm(
        `Face verification failed. Confidence: ${confidence.toFixed(1)}%.\n\nWould you like to proceed with manual attendance entry?`
      );
      
      if (proceedManually) {
        try {
          setLoading(true);
          let response;

          if (attendanceAction === "punch-in") {
            response = await apiService.punchIn(
              selectedEmployeeForAttendance._id,
              "Office",
              false // Manual entry, no face verification
            );
          } else {
            response = await apiService.punchOut(
              selectedEmployeeForAttendance._id,
              "Office",
              false // Manual entry, no face verification
            );
          }

          if (response.success) {
            alert(
              `Manual ${
                attendanceAction === "punch-in" ? "Punch In" : "Punch Out"
              } successful!`
            );
            fetchAttendance();
            fetchStats();
          } else {
            alert(response.message || "Failed to record attendance");
          }
        } catch (error) {
          console.error("Manual attendance error:", error);
          alert(error.message || "Failed to record attendance");
        } finally {
          setLoading(false);
          setSelectedEmployeeForAttendance(null);
          setAttendanceAction("");
          setFaceVerified(false);
        }
      } else {
        setSelectedEmployeeForAttendance(null);
        setAttendanceAction("");
      }
    }
  };

  // Fetch employee attendance details
  const fetchEmployeeDetails = async (employeeId, period = "month") => {
    try {
      setEmployeeDetailsLoading(true);
      const response = await apiService.getEmployeeAttendanceDetails(
        employeeId,
        period
      );
      console.log("Employee details response:", response);
      if (response.success) {
        setSelectedEmployeeDetails(response);
        setShowEmployeeDetails(true);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("Failed to fetch employee details");
    } finally {
      setEmployeeDetailsLoading(false);
    }
  };

  // Manual punch in
  const handleManualPunchIn = async (employeeId) => {
    if (!window.confirm("Are you sure you want to manually punch in this employee?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.punchIn(employeeId, "Office", false);

      if (response.success) {
        alert("Manual punch in successful!");
        // Refresh attendance and stats
        await fetchAttendance();
        await fetchStats();
      } else {
        alert(response.message || "Failed to punch in");
      }
    } catch (error) {
      console.error("Manual punch in error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to punch in";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Manual punch out
  const handleManualPunchOut = async (employeeId) => {
    if (!window.confirm("Are you sure you want to manually punch out this employee?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.punchOut(employeeId, "Office", false);

      if (response.success) {
        alert("Manual punch out successful!");
        // Refresh attendance and stats
        await fetchAttendance();
        await fetchStats();
      } else {
        alert(response.message || "Failed to punch out");
      }
    } catch (error) {
      console.error("Manual punch out error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to punch out";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) {
      alert("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      let response;

      // Handle both punch in and punch out
      if (formData.actionType === "punch-out") {
        response = await apiService.punchOut(
          formData.employee,
          formData.location,
          false // Manual entry, no face verification
        );
      } else {
        response = await apiService.punchIn(
          formData.employee,
          formData.location,
          false // Manual entry, no face verification
        );
      }

      if (response.success) {
        const actionText =
          formData.actionType === "punch-out" ? "Punch out" : "Punch in";
        alert(`${actionText} recorded successfully!`);
        setModalOpen(false);
        fetchAttendance();
        fetchStats();
        setFormData({
          employee: "",
          date: new Date().toISOString().split("T")[0],
          timeIn: "09:00",
          timeOut: "18:00",
          location: "Office - Floor 1",
          status: "Present",
          leaveType: "",
          reason: "",
          actionType: "punch-in",
        });
      } else {
        alert(
          response.message ||
            `Failed to ${
              formData.actionType === "punch-out" ? "punch out" : "punch in"
            }`
        );
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert(error.message || "Failed to record attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApplication = async (e) => {
    e.preventDefault();
    
    if (!formData.employee || !formData.date || !formData.leaveType || !formData.reason.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.date);
    const endDate = leaveEndDate ? new Date(leaveEndDate) : null;
    
    if (endDate && endDate < startDate) {
      alert("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.applyLeave({
        employeeId: formData.employee,
        startDate: formData.date,
        endDate: leaveEndDate || formData.date, // Use leave end date if provided, otherwise single day
        leaveType: formData.leaveType,
        reason: formData.reason,
      });

      if (response.success) {
        const leaveDays = response.count || (endDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 1);
        alert(`Leave application submitted successfully for ${leaveDays} day(s)!`);
        setLeaveModalOpen(false);
        
        // Reset form
        setFormData({
          employee: "",
          date: new Date().toISOString().split("T")[0],
          timeIn: "09:00",
          timeOut: "18:00",
          location: "Office - Floor 1",
          status: "Present",
          leaveType: "",
          reason: "",
          actionType: "punch-in",
        });
        setLeaveEndDate("");
        
        // Refresh attendance and stats
        await fetchAttendance();
        await fetchStats();
      } else {
        alert(response.message || "Failed to apply leave");
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      // Error is already a message string from the interceptor
      alert(error.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setEmployeeFilter("All");
    setStatusFilter("All");
    setSearchQuery("");
    setPeriodFilter("today");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedBranch("");
    setCurrentPage(1);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-[#69231B] text-green-800";
      case "Late":
        return "bg-[#69231B] text-yellow-800";
      case "Absent":
        return "bg-[#69231B] text-red-800";
      case "Leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get unique years and months from data
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#69231B] rounded-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Smart Attendance System
            </h1>
          </div>
          <p className="text-gray-600">
            Face recognition-based attendance tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-[#69231B] rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.presentToday}
                </p>
              </div>
              <div className="p-3 bg-[#69231B] rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Today</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.lateToday}
                </p>
              </div>
              <div className="p-3 bg-[#69231B] rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Absent Today
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.absentToday}
                </p>
              </div>
              <div className="p-3 bg-[#69231B] rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employees.slice(0, 6).map((employee) => (
              <div
                key={employee._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#69231B] to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">
                      {employee.designation}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePunchIn(employee._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-[#69231B] text-white text-sm rounded-lg hover:bg-[#69231B] transition-colors disabled:opacity-50"
                  >
                    In
                  </button>
                  <button
                    onClick={() => handlePunchOut(employee._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-[#69231B] text-white text-sm rounded-lg hover:bg-[#69231B] transition-colors disabled:opacity-50"
                  >
                    Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-xl font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-transform transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Manual Entry
            </button>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#69231B] to-pink-600 text-white rounded-xl font-semibold hover:from-[#5c1e15] hover:to-pink-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              <Calendar className="h-5 w-5" />
              Apply Leave
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Period
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Branch Filter */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setEmployeeFilter("All"); // Reset employee filter when branch changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch.branchName || branch.restaurantName}>
                      {branch.branchName || branch.restaurantName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Employee {selectedBranch && <span className="text-xs text-gray-500">({employees.length} in branch)</span>}
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              {periodFilter === "custom" && (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">
              Attendance Records
            </h3>
            <p className="text-gray-600 mt-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalRecords)} of{" "}
              {totalRecords} entries
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Employees: {employees.length} | Period: {periodFilter} | Loading:{" "}
              {loading ? "Yes" : "No"}
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Loading attendance records...
                </span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punch In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punch Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Face Verified
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendance.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#69231B] to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {record.employee?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "N/A"}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {record.employee?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {record.employee?.designation || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {record.punchIn?.time
                          ? (typeof record.punchIn.time === 'string' 
                              ? formatTime(record.punchIn.time) 
                              : new Date(record.punchIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                          : record.isAbsent || record.status === "Absent"
                          ? "-"
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {record.punchOut?.time
                          ? (typeof record.punchOut.time === 'string' 
                              ? formatTime(record.punchOut.time) 
                              : new Date(record.punchOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                          : record.isAbsent || record.status === "Absent"
                          ? "-"
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            record.status || (record.isAbsent ? "Absent" : "Present")
                          )}`}
                        >
                          <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                          {record.status || (record.isAbsent ? "Absent" : "Present")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.punchIn?.faceVerified ||
                        record.punchOut?.faceVerified ? (
                          <span className="inline-flex items-center text-green-600">
                            <Camera className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-gray-400">Manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              fetchEmployeeDetails(record.employee?._id)
                            }
                            disabled={
                              employeeDetailsLoading || !record.employee?._id
                            }
                            className="inline-flex items-center px-3 py-1 bg-[#69231B] text-white text-xs rounded-lg hover:bg-[#69231B] transition-colors disabled:opacity-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </button>
                          {record.employee?._id && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() =>
                                  handleManualPunchIn(record.employee._id)
                                }
                                disabled={
                                  loading || 
                                  (record.punchIn?.time && !record.isAbsent) ||
                                  record.status === "Leave"
                                }
                                className="inline-flex items-center px-2 py-1 bg-[#69231B] text-white text-xs rounded hover:bg-[#69231B] transition-colors disabled:opacity-50"
                                title={
                                  record.punchIn?.time 
                                    ? "Already punched in" 
                                    : record.status === "Leave"
                                    ? "Cannot punch in during leave"
                                    : "Manual Punch In"
                                }
                              >
                                In
                              </button>
                              <button
                                onClick={() =>
                                  handleManualPunchOut(record.employee._id)
                                }
                                disabled={
                                  loading || 
                                  !record.punchIn?.time || 
                                  record.punchOut?.time ||
                                  record.status === "Leave" ||
                                  record.isAbsent
                                }
                                className="inline-flex items-center px-2 py-1 bg-[#69231B] text-white text-xs rounded hover:bg-[#69231B] transition-colors disabled:opacity-50"
                                title={
                                  !record.punchIn?.time
                                    ? "Must punch in first"
                                    : record.punchOut?.time
                                    ? "Already punched out"
                                    : record.status === "Leave"
                                    ? "Cannot punch out during leave"
                                    : "Manual Punch Out"
                                }
                              >
                                Out
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-8 text-gray-500"
                      >
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="itemsPerPage"
                  className="text-sm font-medium text-gray-700"
                >
                  Items per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1"
                >
                  {[5, 10, 20, 50].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#69231B] text-white hover:bg-[#69231B]"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#69231B] text-white hover:bg-[#69231B]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Attendance Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Manual Attendance Entry
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                required
                value={formData.employee}
                onChange={(e) =>
                  setFormData({ ...formData, employee: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select employee
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                required
                value={formData.actionType}
                onChange={(e) =>
                  setFormData({ ...formData, actionType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="punch-in">Punch In</option>
                <option value="punch-out">Punch Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Office - Floor 1">Office - Floor 1</option>
                <option value="Office - Floor 2">Office - Floor 2</option>
                <option value="Office - Floor 3">Office - Floor 3</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white py-3 px-4 rounded-xl font-medium hover:from-[#7a2920] hover:to-[#5c1e15] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : formData.actionType === "punch-out"
                  ? "Punch Out"
                  : "Punch In"}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>

        {/* Leave Application Modal */}
        <Modal isOpen={leaveModalOpen} onClose={() => {
          setLeaveModalOpen(false);
          setLeaveEndDate("");
        }}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Apply for Leave
          </h3>
          <form onSubmit={handleLeaveApplication} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee
              </label>
              <select
                required
                value={formData.employee}
                onChange={(e) =>
                  setFormData({ ...formData, employee: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select employee
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional - Leave blank for single day)
              </label>
              <input
                type="date"
                min={formData.date}
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                required
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select leave type
                </option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Emergency Leave">Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter reason for leave..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#69231B] to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-[#5c1e15] hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Leave Application"}
            </button>
          </form>
        </Modal>

        {/* Employee Details Modal */}
        {showEmployeeDetails && selectedEmployeeDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Employee Attendance Details
                </h3>
                <button
                  onClick={() => setShowEmployeeDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Employee Info */}
              <div className="bg-[#69231B] rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#69231B] to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedEmployeeDetails.employee?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      {selectedEmployeeDetails.employee?.name}
                    </h4>
                    <p className="text-gray-600">
                      {selectedEmployeeDetails.employee?.designation}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {selectedEmployeeDetails.employee?.empId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Period Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Period
                </label>
                <select
                  value={selectedEmployeeDetails.period}
                  onChange={(e) =>
                    fetchEmployeeDetails(
                      selectedEmployeeDetails.employee?._id,
                      e.target.value
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-[#69231B] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEmployeeDetails.statistics?.presentDays || 0}
                  </div>
                  <div className="text-sm text-green-700">Present Days</div>
                </div>
                <div className="bg-[#69231B] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedEmployeeDetails.statistics?.absentDays || 0}
                  </div>
                  <div className="text-sm text-red-700">Absent Days</div>
                </div>
                <div className="bg-[#69231B] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedEmployeeDetails.statistics?.lateDays || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Late Days</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedEmployeeDetails.statistics?.leaveDays || 0}
                  </div>
                  <div className="text-sm text-purple-700">Leave Days</div>
                </div>
                <div className="bg-[#69231B] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedEmployeeDetails.statistics?.attendancePercentage ||
                      0}
                    %
                  </div>
                  <div className="text-sm text-blue-700">Attendance %</div>
                </div>
              </div>

              {/* Leave Breakdown */}
              {selectedEmployeeDetails.statistics?.leaveBreakdown && (
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <h5 className="text-lg font-semibold text-purple-800 mb-3">
                    Leave Breakdown
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {selectedEmployeeDetails.statistics.leaveBreakdown.sickLeave || 0}
                      </div>
                      <div className="text-xs text-purple-700">Sick Leave</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {selectedEmployeeDetails.statistics.leaveBreakdown.casualLeave || 0}
                      </div>
                      <div className="text-xs text-purple-700">Casual Leave</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {selectedEmployeeDetails.statistics.leaveBreakdown.annualLeave || 0}
                      </div>
                      <div className="text-xs text-purple-700">Annual Leave</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {selectedEmployeeDetails.statistics.leaveBreakdown.emergencyLeave || 0}
                      </div>
                      <div className="text-xs text-purple-700">Emergency Leave</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance Records */}
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-3">
                  Recent Attendance Records
                  {selectedEmployeeDetails.attendanceRecords?.length > 0 && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      ({selectedEmployeeDetails.attendanceRecords.length} records)
                    </span>
                  )}
                </h5>
                {selectedEmployeeDetails.attendanceRecords?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Punch In
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Punch Out
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEmployeeDetails.attendanceRecords
                          .slice(0, 10)
                          .map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {record.punchIn?.time || record.checkIn || record.punchInTime
                                  ? new Date(
                                      record.punchIn?.time || record.checkIn || record.punchInTime
                                    ).toLocaleTimeString()
                                  : "-"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {record.punchOut?.time || record.checkOut || record.punchOutTime
                                  ? new Date(
                                      record.punchOut?.time || record.checkOut || record.punchOutTime
                                    ).toLocaleTimeString()
                                  : "-"}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    record.status
                                  )}`}
                                >
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center rounded-lg">
                    <p className="text-gray-500">No attendance records found for this period</p>
                  </div>
                )}
              </div>

              {/* Leave Records */}
              {selectedEmployeeDetails.leaveRecords?.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">
                    Leave Records
                  </h5>
                  <div className="space-y-2">
                    {selectedEmployeeDetails.leaveRecords.map(
                      (leave, index) => (
                        <div
                          key={index}
                          className="bg-purple-50 p-3 rounded-lg border border-purple-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-purple-800">
                                {leave.leaveType}
                              </p>
                              <p className="text-sm text-purple-600">
                                {leave.reason}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-purple-700">
                                {new Date(leave.startDate).toLocaleDateString()}{" "}
                                - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  leave.status === "Approved"
                                    ? "bg-[#69231B] text-green-800"
                                    : leave.status === "Rejected"
                                    ? "bg-[#69231B] text-red-800"
                                    : "bg-[#69231B] text-yellow-800"
                                }`}
                              >
                                {leave.status || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Face Recognition Modal */}
        {showFaceRecognition && selectedEmployeeForAttendance && (
          <FaceRecognition
            employee={selectedEmployeeForAttendance}
            onFaceMatched={handleFaceMatched}
            onClose={() => {
              setShowFaceRecognition(false);
              setSelectedEmployeeForAttendance(null);
              setAttendanceAction("");
            }}
          />
        )}
      </div>
    </div>
  );
}
