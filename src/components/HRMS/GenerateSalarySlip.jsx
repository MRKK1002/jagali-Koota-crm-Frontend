          import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  Plus,
  Eye,
  FileText,
  Users,
  Calendar,
  X,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  PlayCircle,
  RefreshCw,
  Edit,
  Save,
} from "lucide-react";
import apiService from "../../services/api";
import { logDownload } from "../../utils/downloadLogger.js";

const GenerateSalarySlip = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateType, setGenerateType] = useState("single"); // single, bulk, monthly
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [stats, setStats] = useState({
    currentMonth: 0,
    totalGenerated: 0,
    byStatus: {},
    totalAmount: 0,
  });

  // Search states for dropdowns
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  // Dropdown visibility states
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Edit salary slip states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalarySlip, setEditingSalarySlip] = useState(null);
  const [editFormData, setEditFormData] = useState({
    basicSalary: "",
    hra: "",
    conveyance: "",
    medicalAllowance: "",
    specialAllowance: "",
    pf: "",
    professionalTax: "",
    tds: "",
    otherDeductions: "",
    daysWorked: "",
    daysAbsent: "",
  });

  useEffect(() => {
    fetchBranches();
    fetchSalarySlips();
    fetchStats();
    fetchQueueStatus();

    // Poll queue status every 10 seconds
    const interval = setInterval(fetchQueueStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch employees when branch changes
  useEffect(() => {
    fetchEmployees();
  }, [selectedBranch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".searchable-dropdown")) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchSalarySlips();
  }, [selectedMonth, selectedYear]);

  // SearchableDropdown Component
  const SearchableDropdown = useCallback(
    ({
      options,
      value,
      onChange,
      placeholder,
      searchValue,
      onSearchChange,
      disabled = false,
      required = false,
      showDropdown,
      setShowDropdown,
    }) => {
      const filteredOptions = useMemo(
        () =>
          options.filter(
            (option) =>
              option.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
              option.empId?.toLowerCase().includes(searchValue.toLowerCase()) ||
              option.designation
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())
          ),
        [options, searchValue]
      );

      const handleInputChange = useCallback(
        (e) => {
          onSearchChange(e.target.value);
          setShowDropdown(true);
        },
        [onSearchChange, setShowDropdown]
      );

      const handleFocus = useCallback(() => {
        setShowDropdown(true);
      }, [setShowDropdown]);

      const handleOptionClick = useCallback(
        (option) => {
          onChange(option._id);
          onSearchChange(option.name);
          setShowDropdown(false);
        },
        [onChange, onSearchChange, setShowDropdown]
      );

      const handleClear = useCallback(() => {
        onChange("");
        onSearchChange("");
      }, [onChange, onSearchChange]);

      return (
        <div className="relative searchable-dropdown">
          <div className="relative">
            <input
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Show dropdown when focused or when there are options */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {option.name}
                        </div>
                        {option.empId && (
                          <div className="text-sm text-gray-500">
                            ID: {option.empId}
                          </div>
                        )}
                        {option.designation && (
                          <div className="text-sm text-gray-500">
                            {option.designation}
                          </div>
                        )}
                      </div>
                      {option.empId && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#69231B] text-blue-800">
                          {option.empId}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  No employees found
                </div>
              )}
            </div>
          )}

          {/* Show selected value below the input */}
          {value && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#69231B] text-blue-800">
                {options.find((opt) => opt._id === value)?.name}
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>
      );
    },
    []
  );

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

  const fetchSalarySlips = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSalarySlips({
        month: selectedMonth,
        year: selectedYear,
        limit: 100,
      });
      if (response.success) {
        setSalarySlips(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching salary slips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getSalaryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await apiService.getQueueStatus();
      if (response.success) {
        setQueueStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching queue status:", error);
    }
  };

  const handleDownload = async (salarySlipId) => {
    try {
      // Find the salary slip data for logging
      const salarySlip = salarySlips.find((slip) => slip._id === salarySlipId);

      // Download PDF using authenticated request
      const response = await apiService.downloadSalarySlip(salarySlipId);

      // Create blob and download
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `salary-slip-${salarySlip?.employeeName || "employee"}-${
        salarySlip?.month || ""
      }-${salarySlip?.year || ""}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log the download
      await logDownload(
        "Generate Salary Slip",
        `Salary Slip - ${salarySlip?.employeeName || "Unknown Employee"}`,
        "PDF",
        blob.size,
        {
          filters: {
            salarySlipId: salarySlipId,
            employeeName: salarySlip?.employeeName,
            employeeId: salarySlip?.employeeId,
            month: salarySlip?.month,
            year: salarySlip?.year,
            netSalary: salarySlip?.netSalary,
            status: salarySlip?.status,
          },
        }
      );
    } catch (error) {
      console.error("Error downloading salary slip:", error);
      alert(
        "Failed to download salary slip: " + (error.message || "Unknown error")
      );
    }
  };

  const handleViewPDF = async (salarySlipId) => {
    try {
      // Get the HTML content using authenticated request
      const response = await apiService.viewSalarySlip(salarySlipId);

      // Create a new window and write the HTML content
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        // The response should contain the HTML content directly
        newWindow.document.write(response);
        newWindow.document.close();
      } else {
        alert("Please allow popups to view the salary slip");
      }
    } catch (error) {
      console.error("Error viewing salary slip:", error);
      alert("Failed to view salary slip: " + (error.message || "Unknown error"));
    }
  };

  const handleClearAllSalarySlips = async () => {
    if (
      !window.confirm(
        "?? Are you sure you want to delete ALL salary slips? This action cannot be undone!"
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        "?? FINAL WARNING: This will permanently delete all salary slip data. Continue?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.clearAllSalarySlips();

      if (response.success) {
        alert(
          `? Successfully deleted ${response.deletedCount} salary slips`
        );
        fetchSalarySlips(); // Refresh the list
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error clearing salary slips:", error);
      alert(
        "? Failed to clear salary slips: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (salarySlip) => {
    try {
      const response = await apiService.getSalarySlip(salarySlip._id);
      if (response.success) {
        // Show detailed view in modal or navigate to details page
        const data = response.data;
        alert(`Salary Details for ${salarySlip.employee?.name}:
        
Basic Salary: ?${data.basicSalary?.toFixed(2) || "0.00"}
HRA: ?${data.hra?.toFixed(2) || "0.00"}
Conveyance: ?${data.conveyance?.toFixed(2) || "0.00"}
Medical: ?${data.medicalAllowance?.toFixed(2) || "0.00"}
Special: ?${data.specialAllowance?.toFixed(2) || "0.00"}

Gross Salary: ?${data.grossSalary?.toFixed(2) || "0.00"}
Total Deductions: ?${data.totalDeductions?.toFixed(2) || "0.00"}
Net Salary: ?${data.netSalary?.toFixed(2) || "0.00"}

Working Days: ${data.workingDays}
Days Worked: ${data.daysWorked}
Hours Worked: ${data.hoursWorked?.toFixed(2) || "0.00"}
Salary Type: ${data.salaryType}
Sick Leave Days: ${data.sickLeaveDays || 0}
Casual Leave Days: ${data.casualLeaveDays || 0}
Other Leave Days: ${data.otherLeaveDays || 0}`);
      }
    } catch (error) {
      console.error("Error fetching salary details:", error);
      alert("Failed to fetch salary details");
    }
  };

  const handleGenerateSingle = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.generateSalarySlip(
        selectedEmployee,
        selectedMonth,
        selectedYear
      );

      if (response.success) {
        alert("Salary slip generation job queued successfully!");
        setShowGenerateModal(false);
        setSelectedEmployee("");
        setEmployeeSearch("");
        setShowEmployeeDropdown(false);
        fetchQueueStatus();
        setTimeout(fetchSalarySlips, 2000); // Refresh after 2 seconds
      }
    } catch (error) {
      console.error("Error generating salary slip:", error);
      alert(error.message || "Failed to generate salary slip");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    try {
      setLoading(true);
      const response = await apiService.generateAllSalarySlips(
        selectedMonth,
        selectedYear
      );

      if (response.success) {
        alert(
          `${response.jobsCount} salary slip generation jobs queued successfully!`
        );
        setShowGenerateModal(false);
        fetchQueueStatus();
        setTimeout(fetchSalarySlips, 5000); // Refresh after 5 seconds
      }
    } catch (error) {
      console.error("Error generating all salary slips:", error);
      alert(error.message || "Failed to generate salary slips");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthly = async () => {
    try {
      setLoading(true);
      const response = await apiService.generateMonthlySalarySlips(
        selectedMonth,
        selectedYear
      );

      if (response.success) {
        alert(
          `Monthly salary generation initiated: ${response.jobsCount} jobs queued!`
        );
        setShowGenerateModal(false);
        fetchQueueStatus();
        setTimeout(fetchSalarySlips, 5000);
      }
    } catch (error) {
      console.error("Error generating monthly salary slips:", error);
      alert(error.message || "Failed to generate monthly salary slips");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalarySlips = salarySlips.filter(
    (slip) =>
      slip.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employee?.empId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "generated":
        return `${baseClasses} bg-[#69231B] text-blue-800`;
      case "paid":
        return `${baseClasses} bg-[#69231B] text-green-800`;
      case "pending":
        return `${baseClasses} bg-[#69231B] text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Handle edit salary slip
  const handleEditSalarySlip = (salarySlip) => {
    setEditingSalarySlip(salarySlip);
    setEditFormData({
      basicSalary: salarySlip.basicSalary || "",
      hra: salarySlip.hra || "",
      conveyance: salarySlip.conveyance || "",
      medicalAllowance: salarySlip.medicalAllowance || "",
      specialAllowance: salarySlip.specialAllowance || "",
      pf: salarySlip.pf || "",
      professionalTax: salarySlip.professionalTax || "",
      tds: salarySlip.tds || "",
      otherDeductions: salarySlip.otherDeductions || "",
      daysWorked: salarySlip.daysWorked || "",
      daysAbsent: salarySlip.daysAbsent || "",
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updates = {};
      Object.keys(editFormData).forEach((key) => {
        const value = parseFloat(editFormData[key]);
        if (!isNaN(value)) {
          updates[key] = value;
        }
      });

      const response = await apiService.editSalarySlip(editingSalarySlip._id, updates);

      if (response.success) {
        console.log('Updated salary slip:', response.data);
        alert(`? ${response.message || 'Salary slip updated successfully!'}`);
        setShowEditModal(false);
        setEditingSalarySlip(null);
        
        // Force refresh with a small delay to ensure backend has processed
        setTimeout(() => {
          fetchSalarySlips();
          fetchStats();
        }, 100);
      }
    } catch (error) {
      console.error("Error updating salary slip:", error);
      alert("? Failed to update salary slip: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-[#69231B]" />
              <h2 className="text-3xl font-bold text-gray-800">
                Salary Slip Management
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-[#69231B] font-semibold text-lg">
              <Calendar className="h-5 w-5" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Generate and manage employee salary slips with BullMQ queue
            processing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.currentMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#69231B] rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Generated
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.totalGenerated}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#69231B] rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.byStatus.paid || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#69231B] rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  ?{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Queue Status */}
        {queueStatus && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Queue Status
              </h3>
              <button
                onClick={fetchQueueStatus}
                className="flex items-center gap-2 px-3 py-1 bg-[#69231B] text-blue-700 rounded-lg hover:bg-[#69231B] transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {queueStatus.waiting}
                </div>
                <div className="text-sm text-gray-600">Waiting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {queueStatus.active}
                </div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {queueStatus.completed}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {queueStatus.failed}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-xl font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-all transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Generate Salary Slips
              </button>
              <button
                onClick={handleClearAllSalarySlips}
                className="flex items-center gap-2 px-4 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#69231B] transition-colors"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees or salary slips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Salary Slips Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Salary Slips -{" "}
              {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Loading salary slips...
                </span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Gross Salary
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Net Salary
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Generated
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSalarySlips.map((slip) => (
                    <tr key={slip._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-800">
                            {slip.employee?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {slip.employee?.empId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {slip.employee?.department}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        ?{slip.grossSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ?{slip.netSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(slip.status)}>
                          {slip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(slip.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSalarySlip(slip)}
                            className="flex items-center gap-1 px-3 py-1 bg-[#69231B] text-orange-700 rounded-lg hover:bg-[#69231B] transition-colors"
                            title="Edit Salary Slip"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleViewPDF(slip._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-[#69231B] text-blue-700 rounded-lg hover:bg-[#69231B] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(slip._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-[#69231B] text-green-700 rounded-lg hover:bg-[#69231B] transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSalarySlips.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-8 text-gray-500"
                      >
                        No salary slips found for{" "}
                        {months.find((m) => m.value === selectedMonth)?.label}{" "}
                        {selectedYear}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Generate Salary Slips
                </h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Branch Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      setSelectedEmployee(""); // Reset employee selection
                      setEmployeeSearch("");
                    }}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation Type
                  </label>
                  <select
                    value={generateType}
                    onChange={(e) => setGenerateType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single Employee</option>
                    <option value="bulk">All Employees {selectedBranch && `in ${selectedBranch}`}</option>
                    <option value="monthly">Monthly Generation {selectedBranch && `for ${selectedBranch}`}</option>
                  </select>
                </div>

                {generateType === "single" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employee {selectedBranch && <span className="text-xs text-gray-500">({employees.length} in {selectedBranch})</span>}
                    </label>
                    <SearchableDropdown
                      options={employees}
                      value={selectedEmployee}
                      onChange={setSelectedEmployee}
                      placeholder="Search employees..."
                      searchValue={employeeSearch}
                      onSearchChange={setEmployeeSearch}
                      showDropdown={showEmployeeDropdown}
                      setShowDropdown={setShowEmployeeDropdown}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedEmployee("");
                      setEmployeeSearch("");
                      setShowEmployeeDropdown(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (generateType === "single") handleGenerateSingle();
                      else if (generateType === "bulk") handleGenerateAll();
                      else if (generateType === "monthly")
                        handleGenerateMonthly();
                    }}
                    disabled={
                      loading ||
                      (generateType === "single" && !selectedEmployee)
                    }
                    className="flex-1 px-4 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#69231B] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Salary Slip Modal */}
        {showEditModal && editingSalarySlip && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Edit Salary Slip
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingSalarySlip.employee?.name} - {months.find(m => m.value === editingSalarySlip.month)?.label} {editingSalarySlip.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Attendance Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Attendance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Days Worked
                      </label>
                      <input
                        type="number"
                        value={editFormData.daysWorked}
                        onChange={(e) => handleEditFormChange("daysWorked", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Days Absent
                      </label>
                      <input
                        type="number"
                        value={editFormData.daysAbsent}
                        onChange={(e) => handleEditFormChange("daysAbsent", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Earnings Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Earnings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.basicSalary}
                        onChange={(e) => handleEditFormChange("basicSalary", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HRA (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.hra}
                        onChange={(e) => handleEditFormChange("hra", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conveyance (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.conveyance}
                        onChange={(e) => handleEditFormChange("conveyance", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Allowance (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.medicalAllowance}
                        onChange={(e) => handleEditFormChange("medicalAllowance", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Allowance (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.specialAllowance}
                        onChange={(e) => handleEditFormChange("specialAllowance", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Deductions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PF (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.pf}
                        onChange={(e) => handleEditFormChange("pf", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Tax (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.professionalTax}
                        onChange={(e) => handleEditFormChange("professionalTax", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TDS (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.tds}
                        onChange={(e) => handleEditFormChange("tds", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Deductions (?)
                      </label>
                      <input
                        type="number"
                        value={editFormData.otherDeductions}
                        onChange={(e) => handleEditFormChange("otherDeductions", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Calculation */}
                <div className="bg-[#69231B] p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Salary:</span>
                      <span className="font-semibold">
                        ?{(
                          parseFloat(editFormData.basicSalary || 0) +
                          parseFloat(editFormData.hra || 0) +
                          parseFloat(editFormData.conveyance || 0) +
                          parseFloat(editFormData.medicalAllowance || 0) +
                          parseFloat(editFormData.specialAllowance || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-semibold">
                        ?{(
                          parseFloat(editFormData.pf || 0) +
                          parseFloat(editFormData.professionalTax || 0) +
                          parseFloat(editFormData.tds || 0) +
                          parseFloat(editFormData.otherDeductions || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="font-bold">Net Salary:</span>
                      <span className="font-bold text-blue-700">
                        ?{(
                          parseFloat(editFormData.basicSalary || 0) +
                          parseFloat(editFormData.hra || 0) +
                          parseFloat(editFormData.conveyance || 0) +
                          parseFloat(editFormData.medicalAllowance || 0) +
                          parseFloat(editFormData.specialAllowance || 0) -
                          parseFloat(editFormData.pf || 0) -
                          parseFloat(editFormData.professionalTax || 0) -
                          parseFloat(editFormData.tds || 0) -
                          parseFloat(editFormData.otherDeductions || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#69231B] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateSalarySlip;
