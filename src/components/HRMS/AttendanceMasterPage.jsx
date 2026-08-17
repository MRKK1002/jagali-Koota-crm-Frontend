import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import FaceRecognition from "./FaceRecognition";
import apiService from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const AttendanceMasterPage = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [faceRecognitionStatus, setFaceRecognitionStatus] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [faceMatched, setFaceMatched] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  // Search states for dropdowns
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Dropdown visibility states
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Fetch employees and today's attendance
  useEffect(() => {
    fetchBranches();
    fetchTodayAttendance();

    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
              option.designation
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              option.employeeId
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {option.name || "Unknown Employee"}
                        </div>
                        {option.designation && (
                          <div className="text-sm text-gray-500">
                            {option.designation}
                          </div>
                        )}
                        {option.employeeId && (
                          <div className="text-sm text-gray-500">
                            ID: {option.employeeId}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {option.employeeId && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {option.employeeId}
                          </span>
                        )}
                        {/* Show punch status */}
                        {hasPunchedInToday(option._id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Ready for punch out
                          </span>
                        )}
                        {hasCompletedAttendanceToday(option._id) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No employees found
                </div>
              )}
            </div>
          )}

          {/* Show selected value below the input */}
          {value && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
        setEmployees(response.employees);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await apiService.getTodayAttendance();
      if (response.success) {
        setTodayAttendance(response.attendance);
      }
    } catch (error) {
      console.error("Failed to fetch today attendance:", error);
    }
  };

  // Refetch helper with small retry to surface just-written records
  const fetchTodayAttendanceWithRetry = async (retries = 2, delayMs = 600) => {
    await fetchTodayAttendance();
    for (let i = 0; i < retries; i++) {
      await new Promise((r) => setTimeout(r, delayMs));
      await fetchTodayAttendance();
    }
  };

  const handleEmployeeChange = (employeeId) => {
    console.log("=== handleEmployeeChange ===");
    console.log("Employee ID received:", employeeId);

    setSelectedEmployee(employeeId);

    // Check if employee has already punched in today
    const hasPunchedIn = hasPunchedInToday(employeeId);
    console.log("Has punched in:", hasPunchedIn);

    // Always require face recognition
    setFaceMatched(false);
    if (hasPunchedIn) {
      setFaceRecognitionStatus("Please complete face recognition to punch out");
    } else {
      setFaceRecognitionStatus("Please complete face recognition to punch in");
    }
  };

  const handleFaceMatched = (matched, score) => {
    setFaceMatched(matched);
    setMatchScore(score);

    if (matched) {
      setFaceRecognitionStatus(
        `Face verified! Match confidence: ${score.toFixed(1)}%`
      );
    } else {
      setFaceRecognitionStatus(
        `Face not recognized. Confidence: ${score.toFixed(1)}%`
      );
    }

    setShowFaceRecognition(false);
  };

  const handlePunchIn = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee first");
      return;
    }

    if (!faceMatched) {
      alert("Please complete face recognition first");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.punchIn(
        selectedEmployee,
        "Office",
        true
      );

      if (response.success) {
        alert("Punch in successful!");
        // Clear selected employee and search so they can select again from dropdown
        setSelectedEmployee("");
        setEmployeeSearch("");
        setFaceMatched(false);
        setFaceRecognitionStatus("");
        setShowEmployeeDropdown(false);
        await fetchTodayAttendanceWithRetry();
      }
    } catch (error) {
      alert(error.message || "Punch in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee first");
      return;
    }

    if (!faceMatched) {
      alert("Please complete face recognition first");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.punchOut(
        selectedEmployee,
        "Office",
        true
      );

      if (response.success) {
        alert("Punch out successful!");
        setSelectedEmployee("");
        setFaceMatched(false);
        setFaceRecognitionStatus("");
        setEmployeeSearch("");
        setShowEmployeeDropdown(false);
        await fetchTodayAttendanceWithRetry();
      }
    } catch (error) {
      alert(error.message || "Punch out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPunchedInToday = (employeeId) => {
    console.log("=== hasPunchedInToday Debug ===");
    console.log("Employee ID:", employeeId);
    console.log("Today Attendance:", todayAttendance);

    const record = todayAttendance.find((att) => {
      console.log("Checking record:", att);
      console.log("Employee match:", att.employee?._id === employeeId);
      console.log("Has punchIn:", !!att.punchIn);
      console.log("Has punchIn.time:", !!att.punchIn?.time);
      console.log("Has punchOut.time:", !!att.punchOut?.time);

      return (
        att.employee &&
        att.employee._id === employeeId &&
        att.punchIn &&
        att.punchIn.time
      );
    });

    const result = record && !record.punchOut?.time;
    console.log("Found record:", record);
    console.log("Final result (has punched in but not out):", result);
    console.log("=== End Debug ===");

    return result;
  };

  const hasCompletedAttendanceToday = (employeeId) => {
    const record = todayAttendance.find(
      (att) =>
        att.employee &&
        att.employee._id === employeeId &&
        att.punchIn &&
        att.punchOut &&
        att.punchOut.time // Make sure punch out has a time
    );
    const result = !!record;
    console.log(`hasCompletedAttendanceToday for ${employeeId}:`, result, record);
    return result;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedEmployeeData = employees.find(
    (emp) => emp._id === selectedEmployee
  );

  // Debug logging for selected employee
  console.log("=== Selected Employee Debug ===");
  console.log("selectedEmployee ID:", selectedEmployee);
  console.log("selectedEmployeeData:", selectedEmployeeData);
  console.log("faceMatched:", faceMatched);
  console.log("isLoading:", isLoading);

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Smart Attendance System
          </h1>
          <p className="text-gray-600">
            Facial recognition-based attendance tracking
          </p>
          <div className="mt-4 text-lg font-medium text-gray-700">
            {formatDate(currentDateTime)} | {formatTime(currentDateTime)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Record Attendance
            </h2>

            {/* Quick Punch Out Section - Removed as per requirement */}

            {/* Branch Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Select Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedEmployee(""); // Reset employee selection when branch changes
                  setEmployeeSearch("");
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch.branchName || branch.restaurantName}>
                    {branch.branchName || branch.restaurantName}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">
                Select Employee {selectedBranch && <span className="text-sm text-gray-500">({employees.length} employees in {selectedBranch})</span>}
              </label>
              <SearchableDropdown
                options={employees}
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                placeholder="Search employees..."
                searchValue={employeeSearch}
                onSearchChange={setEmployeeSearch}
                showDropdown={showEmployeeDropdown}
                setShowDropdown={setShowEmployeeDropdown}
                disabled={isLoading}
              />
              
            </div>

            {selectedEmployee && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-800">
                  {hasPunchedInToday(selectedEmployee)
                    ? "You have already punched in today. Ready to punch out?"
                    : hasCompletedAttendanceToday(selectedEmployee)
                    ? "You have completed your attendance for today."
                    : "Ready to punch in?"}
                </p>
              </div>
            )}

            {/* Face Recognition Status */}
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p
                  className={`font-medium ${
                    faceRecognitionStatus.includes("verified")
                      ? "text-green-600"
                      : faceRecognitionStatus.includes("not")
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {faceRecognitionStatus ||
                    "Face recognition required for attendance"}
                </p>
                {matchScore > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Confidence: {matchScore.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowFaceRecognition(true)}
                disabled={
                  !selectedEmployee ||
                  hasCompletedAttendanceToday(selectedEmployee) ||
                  faceMatched // Disable if face already matched
                }
                className="w-full bg-[#69231B] hover:bg-[#69231B] disabled:bg-purple-300 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
              >
                {faceMatched
                  ? "Face Recognition Complete"
                  : "Start Face Recognition"}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handlePunchIn}
                  disabled={
                    !selectedEmployee ||
                    hasPunchedInToday(selectedEmployee) ||
                    hasCompletedAttendanceToday(selectedEmployee) ||
                    !faceMatched ||
                    isLoading
                  }
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Punch In"
                  )}
                </button>

                <button
                  onClick={handlePunchOut}
                  disabled={
                    !selectedEmployee ||
                    !hasPunchedInToday(selectedEmployee) ||
                    !faceMatched ||
                    isLoading
                  }
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Punch Out"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Today's Attendance Records */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Today's Attendance
            </h2>

            {todayAttendance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No attendance records for today yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {todayAttendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {record.employee?.name || "Unknown Employee"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.employee?.designation ||
                                  "No designation"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.punchIn?.time || record.punchInTime ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {new Date(
                                record.punchIn?.time || record.punchInTime
                              ).toLocaleTimeString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              Not punched in
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {record.punchOut?.time || record.punchOutTime ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {new Date(
                                record.punchOut?.time || record.punchOutTime
                              ).toLocaleTimeString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              Not punched out
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === "Present"
                                ? "bg-blue-100 text-blue-800"
                                : record.status === "Late"
                                ? "bg-yellow-100 text-yellow-800"
                                : record.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : record.status === "Leave"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {(() => {
                            const punchInTime = record.punchIn?.time || record.punchInTime;
                            const punchOutTime = record.punchOut?.time || record.punchOutTime;
                            
                            if (!punchInTime || !punchOutTime) {
                              return "-";
                            }
                            
                            const punchIn = new Date(punchInTime);
                            const punchOut = new Date(punchOutTime);
                            const diffMs = punchOut - punchIn;
                            const totalMinutes = Math.floor(diffMs / (1000 * 60));
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            
                            return hours > 0 
                              ? `${hours} hr ${minutes} min`
                              : `${minutes} min`;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Face Recognition Modal */}
        {showFaceRecognition && selectedEmployeeData && (
          <FaceRecognition
            employee={selectedEmployeeData}
            onFaceMatched={handleFaceMatched}
            onClose={() => setShowFaceRecognition(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AttendanceMasterPage;
