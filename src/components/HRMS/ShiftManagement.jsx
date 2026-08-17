import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import apiService from "../../services/api";

const ShiftManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [availableShiftOptions, setAvailableShiftOptions] = useState([]);
  const [selectedShiftOption, setSelectedShiftOption] = useState(0);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [shiftTypeFilter, setShiftTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    shiftName: "",
    shiftType: "Morning",
    startTime: "09:00",
    endTime: "18:00",
    breakDuration: 60, // minutes
    workingHours: 8,
    overtimeEnabled: true,
    overtimeRate: 1.5, // 1.5x of hourly rate
    weekendOvertimeRate: 2.0, // 2x of hourly rate
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    isActive: true,
  });

  const shiftTypes = [
    { value: "Morning", label: "Morning Shift", icon: "??" },
    { value: "Evening", label: "Evening Shift", icon: "??" },
    { value: "Night", label: "Night Shift", icon: "??" },
    { value: "Rotational", label: "Rotational", icon: "??" },
    { value: "Flexible", label: "Flexible", icon: "?" },
  ];

  // Department-wise default shift templates (with multiple shift options)
  const departmentShiftTemplates = {
    "NORTH KITCHEN": [
      {
        name: "Shift 1 (Morning)",
        startTime: "07:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "North Kitchen - Morning Shift",
      },
      {
        name: "Shift 2 (Afternoon)",
        startTime: "13:00",
        endTime: "22:30",
        breakDuration: 60,
        shiftType: "Evening",
        shiftName: "North Kitchen - Afternoon Shift",
      },
    ],
    "RESTAURANT": [
      {
        name: "Shift 1 (Day)",
        startTime: "07:00",
        endTime: "17:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "Restaurant - Day Shift",
      },
      {
        name: "Shift 2 (Evening)",
        startTime: "19:00",
        endTime: "22:30",
        breakDuration: 30,
        shiftType: "Evening",
        shiftName: "Restaurant - Evening Shift",
      },
    ],
    "SOUTH KITCHEN": [
      {
        name: "Shift 1 (Early Morning)",
        startTime: "04:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "South Kitchen - Early Morning Shift",
      },
    ],
    "SOUTH COUNTER": [
      {
        name: "Shift 1 (Morning)",
        startTime: "06:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "South Counter - Morning Shift",
      },
      {
        name: "Shift 2 (Afternoon)",
        startTime: "13:00",
        endTime: "22:30",
        breakDuration: 60,
        shiftType: "Evening",
        shiftName: "South Counter - Afternoon Shift",
      },
    ],
    "HOUSE KEEPING": [
      {
        name: "Shift 1 (Morning)",
        startTime: "07:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "House Keeping - Morning Shift",
      },
      {
        name: "Shift 2 (Afternoon)",
        startTime: "13:00",
        endTime: "22:30",
        breakDuration: 60,
        shiftType: "Evening",
        shiftName: "House Keeping - Afternoon Shift",
      },
      {
        name: "Shift 3 (Night)",
        startTime: "22:00",
        endTime: "06:00",
        breakDuration: 60,
        shiftType: "Night",
        shiftName: "House Keeping - Night Shift",
      },
    ],
    "TEMPLE MEALS": [
      {
        name: "Shift 1 (Morning)",
        startTime: "07:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "Temple Meals - Morning Shift",
      },
    ],
    "SECURITY": [
      {
        name: "24-Hour Shift",
        startTime: "08:00",
        endTime: "08:00",
        breakDuration: 120,
        shiftType: "Rotational",
        shiftName: "Security - 24 Hour Shift",
      },
    ],
    "SWEET MASTER": [
      {
        name: "Rotational (Manual Assignment)",
        startTime: "09:00",
        endTime: "18:00",
        breakDuration: 60,
        shiftType: "Rotational",
        shiftName: "Sweet Master - Rotational Shift",
      },
    ],
    "ELECTRIC": [
      {
        name: "Rotational (Manual Assignment)",
        startTime: "09:00",
        endTime: "18:00",
        breakDuration: 60,
        shiftType: "Rotational",
        shiftName: "Electrician - Rotational Shift",
      },
    ],
    "DRIVER": [
      {
        name: "Flexible Shift",
        startTime: "08:00",
        endTime: "18:00",
        breakDuration: 60,
        shiftType: "Flexible",
        shiftName: "Driver - Flexible Shift",
      },
    ],
    "WASHING": [
      {
        name: "Shift 1 (Morning)",
        startTime: "07:00",
        endTime: "16:00",
        breakDuration: 60,
        shiftType: "Morning",
        shiftName: "Washing - Morning Shift",
      },
      {
        name: "Shift 2 (Afternoon)",
        startTime: "13:00",
        endTime: "21:30",
        breakDuration: 60,
        shiftType: "Evening",
        shiftName: "Washing - Afternoon Shift",
      },
    ],
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchShifts();
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedBranch) {
      fetchEmployees();
    }
  }, [selectedBranch]);

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
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch) {
        params.branch = selectedBranch;
      }
      const response = await apiService.getShifts(params);
      if (response.success) {
        setShifts(response.shifts || []);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      showNotification(error.message || "Failed to fetch shifts", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter shifts based on selected filters
  const filteredShifts = shifts.filter(shift => {
    // Department filter
    if (departmentFilter) {
      // Check if employeeId is populated (object) or just an ID (string)
      const employeeDepartment = typeof shift.employeeId === 'object' && shift.employeeId?.department
        ? shift.employeeId.department
        : employees.find(emp => emp._id === shift.employeeId)?.department;
      
      if (!employeeDepartment || employeeDepartment !== departmentFilter) {
        return false;
      }
    }
    
    // Shift type filter
    if (shiftTypeFilter && shift.shiftType !== shiftTypeFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter === "active" && !shift.isActive) {
      return false;
    }
    if (statusFilter === "inactive" && shift.isActive) {
      return false;
    }
    
    return true;
  });

  const calculateWorkingHours = (start, end, breakMinutes) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
    
    totalMinutes -= breakMinutes;
    return (totalMinutes / 60).toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-populate shift timings when employee is selected
      if (name === "employeeId" && value) {
        const employee = employees.find(emp => emp._id === value);
        if (employee && employee.department) {
          const templates = departmentShiftTemplates[employee.department];
          if (templates && templates.length > 0) {
            setAvailableShiftOptions(templates);
            setSelectedShiftOption(0); // Default to first shift
            
            // Apply first shift template by default
            const template = templates[0];
            updated.shiftName = template.shiftName;
            updated.shiftType = template.shiftType;
            updated.startTime = template.startTime;
            updated.endTime = template.endTime;
            updated.breakDuration = template.breakDuration;
            updated.workingHours = calculateWorkingHours(
              template.startTime,
              template.endTime,
              template.breakDuration
            );
            
            // Show notification
            if (templates.length > 1) {
              showNotification(
                `${employee.department} has ${templates.length} shift options. Select the appropriate shift below.`,
                "success"
              );
            } else {
              showNotification(
                `Default ${employee.department} shift timings applied. You can modify if needed.`,
                "success"
              );
            }
          }
        }
      }
      
      // Auto-calculate working hours when times change
      if (name === "startTime" || name === "endTime" || name === "breakDuration") {
        updated.workingHours = calculateWorkingHours(
          name === "startTime" ? value : prev.startTime,
          name === "endTime" ? value : prev.endTime,
          name === "breakDuration" ? parseInt(value) : prev.breakDuration
        );
      }
      
      return updated;
    });
  };

  const openModal = () => {
    setEditingShift(null);
    setFormData({
      employeeId: "",
      shiftName: "",
      shiftType: "Morning",
      startTime: "09:00",
      endTime: "18:00",
      breakDuration: 60,
      workingHours: 8,
      overtimeEnabled: true,
      overtimeRate: 1.5,
      weekendOvertimeRate: 2.0,
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setFormData(shift);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShift(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      showNotification("Please select an employee", "error");
      return;
    }

    try {
      setLoading(true);
      
      let response;
      if (editingShift) {
        response = await apiService.updateShift(editingShift._id, formData);
      } else {
        response = await apiService.createShift(formData);
      }
      
      if (response.success) {
        showNotification(
          response.message || `Shift ${editingShift ? "updated" : "assigned"} successfully!`,
          "success"
        );
        closeModal();
        fetchShifts();
      }
    } catch (error) {
      showNotification(error.message || "Failed to save shift", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift assignment?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.deleteShift(shiftId);
      if (response.success) {
        showNotification(response.message || "Shift deleted successfully!", "success");
        fetchShifts();
      }
    } catch (error) {
      showNotification(error.message || "Failed to delete shift", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  const handleShiftOptionChange = (optionIndex) => {
    setSelectedShiftOption(optionIndex);
    const template = availableShiftOptions[optionIndex];
    if (template) {
      setFormData(prev => ({
        ...prev,
        shiftName: template.shiftName,
        shiftType: template.shiftType,
        startTime: template.startTime,
        endTime: template.endTime,
        breakDuration: template.breakDuration,
        workingHours: calculateWorkingHours(
          template.startTime,
          template.endTime,
          template.breakDuration
        ),
      }));
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.empId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmployee = employees.find(emp => emp._id === formData.employeeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] via-[#FCFCFC] to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10 text-blue-600" />
            Shift Management
          </h1>
          <p className="text-gray-600">
            Assign shifts, manage timings, and configure overtime rates
          </p>
        </div>

        {/* Notification */}
        {notification.message && (
          <div
            className={`mb-6 p-4 rounded-lg shadow-md flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-green-100 border border-green-300 text-green-800"
                : "bg-red-100 border border-red-300 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Branch Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch.branchName || branch.restaurantName}>
                    {branch.branchName || branch.restaurantName}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Shift Button */}
            <button
              onClick={openModal}
              disabled={!selectedBranch || loading}
              className="px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-lg font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Assign Shift
            </button>
          </div>

          {!selectedBranch && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Please select a branch to view and manage shifts
              </p>
            </div>
          )}
        </div>

        {/* Shifts List */}
        {selectedBranch && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Shift Assignments - {selectedBranch}
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  {/* Department Filter */}
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    <option value="NORTH KITCHEN">NORTH KITCHEN</option>
                    <option value="RESTAURANT">RESTAURANT</option>
                    <option value="SOUTH KITCHEN">SOUTH KITCHEN</option>
                    <option value="SOUTH COUNTER">SOUTH COUNTER</option>
                    <option value="HOUSE KEEPING">HOUSE KEEPING</option>
                    <option value="TEMPLE MEALS">TEMPLE MEALS</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="SWEET MASTER">SWEET MASTER</option>
                    <option value="ELECTRIC">ELECTRIC</option>
                    <option value="DRIVER">DRIVER</option>
                    <option value="WASHING">WASHING</option>
                  </select>

                  {/* Shift Type Filter */}
                  <select
                    value={shiftTypeFilter}
                    onChange={(e) => setShiftTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Shift Types</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="Rotational">Rotational</option>
                    <option value="Flexible">Flexible</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>

                  {/* Reset Filters */}
                  {(departmentFilter || shiftTypeFilter || statusFilter) && (
                    <button
                      onClick={() => {
                        setDepartmentFilter("");
                        setShiftTypeFilter("");
                        setStatusFilter("");
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading shifts...</p>
              </div>
            ) : filteredShifts.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {shifts.length === 0 ? "No shifts assigned yet" : "No shifts match your filters"}
                </p>
                <p className="text-gray-400 text-sm">
                  {shifts.length === 0 
                    ? "Click 'Assign Shift' to create your first shift assignment"
                    : "Try adjusting your filters to see more results"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredShifts.length}</span> of <span className="font-semibold">{shifts.length}</span> shifts
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timing
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Hours
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overtime
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShifts.map((shift) => (
                      <tr key={shift._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.employeeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {shift.empId}
                            </div>
                            {(typeof shift.employeeId === 'object' && shift.employeeId?.department) && (
                              <div className="text-xs text-blue-600 mt-1">
                                {shift.employeeId.department}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {shift.shiftName || shift.shiftType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            Break: {shift.breakDuration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {shift.workingHours} hrs
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shift.overtimeEnabled ? (
                            <div className="text-sm">
                              <div className="text-green-600 font-medium">
                                Enabled
                              </div>
                              <div className="text-xs text-gray-500">
                                {shift.overtimeRate}x rate
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Disabled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              shift.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {shift.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(shift)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(shift._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Shift Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#69231B] to-[#7a2920] p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {editingShift ? "Edit Shift Assignment" : "Assign New Shift"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Employee Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Employee Selection
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search & Select Employee <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Employee</option>
                      {filteredEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.empId}) - {emp.designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEmployee && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Department:</span>
                          <span className="ml-2 font-medium">{selectedEmployee.department}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Branch:</span>
                          <span className="ml-2 font-medium">{selectedEmployee.branch}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Basic Salary:</span>
                          <span className="ml-2 font-medium">?{selectedEmployee.basicSalary}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salary Type:</span>
                          <span className="ml-2 font-medium capitalize">{selectedEmployee.salaryType}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shift Options Selector (if multiple shifts available) */}
                  {availableShiftOptions.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Shift Option <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableShiftOptions.map((option, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleShiftOptionChange(index)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              selectedShiftOption === index
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <div className="font-semibold text-gray-800">{option.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {option.startTime} - {option.endTime}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Break: {option.breakDuration} min
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shift Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Shift Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift Name
                      </label>
                      <input
                        type="text"
                        name="shiftName"
                        value={formData.shiftName}
                        onChange={handleInputChange}
                        placeholder="e.g., Morning Shift A"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="shiftType"
                        value={formData.shiftType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        {shiftTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Break Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="breakDuration"
                        value={formData.breakDuration}
                        onChange={handleInputChange}
                        min="0"
                        step="15"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Working Hours (calculated)
                      </label>
                      <input
                        type="text"
                        value={`${formData.workingHours} hours`}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Overtime Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Overtime Configuration
                  </h3>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="overtimeEnabled"
                      checked={formData.overtimeEnabled}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Overtime for this shift
                    </label>
                  </div>

                  {formData.overtimeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regular Overtime Rate (multiplier)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="overtimeRate"
                            value={formData.overtimeRate}
                            onChange={handleInputChange}
                            min="1"
                            max="5"
                            step="0.1"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            x hourly rate
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Weekday overtime multiplier (e.g., 1.5 = 150% of hourly rate)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weekend Overtime Rate (multiplier)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="weekendOvertimeRate"
                            value={formData.weekendOvertimeRate}
                            onChange={handleInputChange}
                            min="1"
                            max="5"
                            step="0.1"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            x hourly rate
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Weekend overtime multiplier (e.g., 2.0 = 200% of hourly rate)
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEmployee && formData.overtimeEnabled && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Overtime Calculation Preview:
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Hourly Rate:</span>
                          <span className="ml-2 font-medium">
                            ?{(selectedEmployee.basicSalary / (formData.workingHours * 26)).toFixed(2)}/hr
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Regular OT Rate:</span>
                          <span className="ml-2 font-medium text-green-600">
                            ?{((selectedEmployee.basicSalary / (formData.workingHours * 26)) * formData.overtimeRate).toFixed(2)}/hr
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Weekend OT Rate:</span>
                          <span className="ml-2 font-medium text-green-600">
                            ?{((selectedEmployee.basicSalary / (formData.workingHours * 26)) * formData.weekendOvertimeRate).toFixed(2)}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Effective Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Effective Period
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effective From <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="effectiveFrom"
                        value={formData.effectiveFrom}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Effective To (Optional)
                      </label>
                      <input
                        type="date"
                        name="effectiveTo"
                        value={formData.effectiveTo}
                        onChange={handleInputChange}
                        min={formData.effectiveFrom}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for indefinite assignment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Activate this shift immediately
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-lg font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingShift ? "Update Shift" : "Assign Shift"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;
