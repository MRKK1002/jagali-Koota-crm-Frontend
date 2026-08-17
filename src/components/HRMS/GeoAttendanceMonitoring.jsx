import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Users,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Download,
  Eye,
  Camera,
  Loader,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import FaceRecognition from "./FaceRecognition";

const GeoAttendanceMonitoring = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceAction, setAttendanceAction] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedLocationRecord, setSelectedLocationRecord] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
  });

  // Predefined office locations
  const officeLocations = [
    { name: "Main Office", lat: 28.6139, lng: 77.209, radius: 100 },
    { name: "Branch Office", lat: 28.5355, lng: 77.391, radius: 150 },
    { name: "Remote Work", lat: null, lng: null, radius: null },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceRecords();
    fetchStats();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate, searchQuery, statusFilter, locationFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await apiService.getEmployees({ limit: 1000 });
      if (response.success) {
        setEmployees(response.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: selectedDate,
        endDate: selectedDate,
        includeAbsent: "true",
        limit: 100,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "All") params.status = statusFilter;

      const response = await apiService.getAttendance(params);
      if (response.success) {
        setAttendanceRecords(response.attendance || []);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError("Unable to get your location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const isWithinOfficeRadius = (userLat, userLng) => {
    for (const office of officeLocations) {
      if (office.lat && office.lng) {
        const distance = calculateDistance(
          userLat,
          userLng,
          office.lat,
          office.lng
        );
        if (distance <= office.radius) {
          return { isWithin: true, office, distance };
        }
      }
    }
    return { isWithin: false, office: null, distance: null };
  };

  const handleQuickPunchIn = async (employee) => {
    if (!userLocation) {
      alert("Location access is required for geo-attendance");
      getCurrentLocation();
      return;
    }

    const locationCheck = isWithinOfficeRadius(
      userLocation.lat,
      userLocation.lng
    );

    if (!locationCheck.isWithin) {
      const confirmRemote = window.confirm(
        "You are not within any office location. Do you want to mark attendance as remote work?"
      );
      if (!confirmRemote) return;
    }

    setSelectedEmployee(employee);
    setAttendanceAction("punch-in");
    setShowFaceRecognition(true);
  };

  const handleQuickPunchOut = async (employee) => {
    if (!userLocation) {
      alert("Location access is required for geo-attendance");
      getCurrentLocation();
      return;
    }

    setSelectedEmployee(employee);
    setAttendanceAction("punch-out");
    setShowFaceRecognition(true);
  };

  const handleViewLocation = (record) => {
    setSelectedLocationRecord(record);
    setShowLocationModal(true);
  };

  const handleFaceMatched = async (matched, confidence) => {
    setShowFaceRecognition(false);

    if (!matched) {
      alert(`Face verification failed. Confidence: ${confidence.toFixed(1)}%`);
      return;
    }

    try {
      setLoading(true);

      const locationCheck = isWithinOfficeRadius(
        userLocation.lat,
        userLocation.lng
      );
      const location = locationCheck.isWithin
        ? locationCheck.office.name
        : "Remote Work";

      const coordinates = {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      };

      let response;
      if (attendanceAction === "punch-in") {
        response = await apiService.punchIn(
          selectedEmployee._id,
          location,
          true,
          coordinates
        );
      } else {
        response = await apiService.punchOut(
          selectedEmployee._id,
          location,
          true,
          coordinates
        );
      }

      if (response.success) {
        alert(
          `${
            attendanceAction === "punch-in" ? "Punch In" : "Punch Out"
          } successful!`
        );
        fetchAttendanceRecords();
        fetchStats();
      }
    } catch (error) {
      console.error("Attendance error:", error);
      alert(error.message || "Failed to record attendance");
    } finally {
      setLoading(false);
      setSelectedEmployee(null);
      setAttendanceAction("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Late":
        return "bg-yellow-100 text-yellow-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Leave":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationIcon = (record) => {
    if (record.punchIn?.coordinates || record.punchOut?.coordinates) {
      return <MapPin className="h-4 w-4 text-green-600" />;
    }
    return <MapPin className="h-4 w-4 text-gray-400" />;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !record.employeeName?.toLowerCase().includes(searchLower) &&
        !record.empId?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (statusFilter !== "All" && record.status !== statusFilter) {
      return false;
    }

    if (locationFilter !== "All") {
      const recordLocation =
        record.punchIn?.location || record.punchOut?.location;
      if (recordLocation !== locationFilter) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Geo Attendance Monitoring
            </h1>
          </div>
          <p className="text-gray-600">
            Location-based attendance tracking with face recognition
          </p>
        </div>

        {/* Location Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Current Location
                </h3>
                {userLocation ? (
                  <div>
                    <p className="text-sm text-gray-600">
                      Lat: {userLocation.lat.toFixed(6)}, Lng:{" "}
                      {userLocation.lng.toFixed(6)}
                    </p>
                    {(() => {
                      const locationCheck = isWithinOfficeRadius(
                        userLocation.lat,
                        userLocation.lng
                      );
                      return locationCheck.isWithin ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Within {locationCheck.office.name} (
                          {Math.round(locationCheck.distance)}m)
                        </p>
                      ) : (
                        <p className="text-sm text-orange-600 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Outside office locations
                        </p>
                      );
                    })()}
                  </div>
                ) : locationError ? (
                  <p className="text-sm text-red-600">{locationError}</p>
                ) : (
                  <p className="text-sm text-gray-600">Getting location...</p>
                )}
              </div>
            </div>
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Location
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Employees
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Present Today
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.presentToday}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Today</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.lateToday}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Absent Today
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.absentToday}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.slice(0, 6).map((employee) => {
              const todayRecord = attendanceRecords.find(
                (record) => record.employee?._id === employee._id
              );
              const hasPunchedIn = todayRecord?.punchIn?.time;
              const hasPunchedOut = todayRecord?.punchOut?.time;

              return (
                <div
                  key={employee._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {employee.designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleQuickPunchIn(employee)}
                      disabled={loading || hasPunchedIn}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasPunchedIn ? "✓" : "In"}
                    </button>
                    <button
                      onClick={() => handleQuickPunchOut(employee)}
                      disabled={loading || !hasPunchedIn || hasPunchedOut}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasPunchedOut ? "✓" : "Out"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="All">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Attendance Records - {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">
                  Loading attendance records...
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
                      Punch In
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Punch Out
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Face Verified
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {record.employeeName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {record.employeeName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {record.empId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatTime(record.punchIn?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatTime(record.punchOut?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getLocationIcon(record)}
                          <div className="flex-1">
                            <span className="text-sm text-gray-900 font-medium">
                              {record.punchIn?.location ||
                                record.punchOut?.location ||
                                "Unknown Building"}
                            </span>
                            {(record.punchIn?.coordinates || record.punchOut?.coordinates) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {record.punchIn?.coordinates?.latitude?.toFixed(6) || record.punchOut?.coordinates?.latitude?.toFixed(6)}, {record.punchIn?.coordinates?.longitude?.toFixed(6) || record.punchOut?.coordinates?.longitude?.toFixed(6)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
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
                        {(record.punchIn?.coordinates || record.punchOut?.coordinates) && (
                          <button
                            onClick={() => handleViewLocation(record)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
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
        </div>

        {/* Face Recognition Modal */}
        {showFaceRecognition && selectedEmployee && (
          <FaceRecognition
            employee={selectedEmployee}
            onFaceMatched={handleFaceMatched}
            onClose={() => {
              setShowFaceRecognition(false);
              setSelectedEmployee(null);
              setAttendanceAction("");
            }}
          />
        )}

        {/* Location Details Modal */}
        {showLocationModal && selectedLocationRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Attendance Location Details
                  </h3>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Employee Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {selectedLocationRecord.employeeName?.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedLocationRecord.employeeName}</p>
                        <p className="text-sm text-gray-600">{selectedLocationRecord.empId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Check-in Location */}
                  {selectedLocationRecord.punchIn && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-green-800">Check-in Location</h5>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Time:</span> {formatTime(selectedLocationRecord.punchIn.time)}</p>
                        <p><span className="font-medium">Location:</span> {selectedLocationRecord.punchIn.location || 'Unknown Building'}</p>
                        
                        {selectedLocationRecord.punchIn.coordinates && (
                          <>
                            <p><span className="font-medium">Coordinates:</span> {selectedLocationRecord.punchIn.coordinates.latitude?.toFixed(6)}, {selectedLocationRecord.punchIn.coordinates.longitude?.toFixed(6)}</p>
                            
                            {/* Google Maps Embed */}
                            <div className="mt-4">
                              <iframe
                                width="100%"
                                height="200"
                                frameBorder="0"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAHFoepvVjrlMUctcC4wn_VRpOznZBzmhA&q=${selectedLocationRecord.punchIn.coordinates.latitude},${selectedLocationRecord.punchIn.coordinates.longitude}&zoom=16`}
                                allowFullScreen
                                className="rounded-lg"
                              ></iframe>
                            </div>
                            
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${selectedLocationRecord.punchIn.coordinates.latitude},${selectedLocationRecord.punchIn.coordinates.longitude}`, '_blank')}
                              className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <MapPin className="h-4 w-4" />
                              Open in Google Maps
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Check-out Location */}
                  {selectedLocationRecord.punchOut && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-red-800">Check-out Location</h5>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Time:</span> {formatTime(selectedLocationRecord.punchOut.time)}</p>
                        <p><span className="font-medium">Location:</span> {selectedLocationRecord.punchOut.location || 'Unknown Building'}</p>
                        
                        {selectedLocationRecord.punchOut.coordinates && (
                          <>
                            <p><span className="font-medium">Coordinates:</span> {selectedLocationRecord.punchOut.coordinates.latitude?.toFixed(6)}, {selectedLocationRecord.punchOut.coordinates.longitude?.toFixed(6)}</p>
                            
                            {/* Google Maps Embed */}
                            <div className="mt-4">
                              <iframe
                                width="100%"
                                height="200"
                                frameBorder="0"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAHFoepvVjrlMUctcC4wn_VRpOznZBzmhA&q=${selectedLocationRecord.punchOut.coordinates.latitude},${selectedLocationRecord.punchOut.coordinates.longitude}&zoom=16`}
                                allowFullScreen
                                className="rounded-lg"
                              ></iframe>
                            </div>
                            
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${selectedLocationRecord.punchOut.coordinates.latitude},${selectedLocationRecord.punchOut.coordinates.longitude}`, '_blank')}
                              className="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <MapPin className="h-4 w-4" />
                              Open in Google Maps
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Details */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Time Details</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Check In</p>
                      <p className="font-medium">{formatTime(selectedLocationRecord.punchIn?.time) || '--'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Check Out</p>
                      <p className="font-medium">{formatTime(selectedLocationRecord.punchOut?.time) || '--'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Hours</p>
                      <p className="font-medium">
                        {selectedLocationRecord.punchIn?.time && selectedLocationRecord.punchOut?.time ? 
                          (() => {
                            const checkIn = new Date(selectedLocationRecord.punchIn.time);
                            const checkOut = new Date(selectedLocationRecord.punchOut.time);
                            const diff = checkOut - checkIn;
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })() : '--'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoAttendanceMonitoring;
