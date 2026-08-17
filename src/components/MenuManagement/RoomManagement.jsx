import React, { useState, useEffect, useMemo } from "react";
import { Search, Bed, Users, DollarSign, MapPin, CheckCircle, XCircle, TrendingUp, Lock, User, Phone, Calendar, Clock, Download } from "lucide-react";
import { fetchDualBackend } from "../../utils/apiHelpers";
import * as XLSX from 'xlsx';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [bookings, setBookings] = useState({});
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBookings, setAllBookings] = useState([]);

  // API Base URL
  let API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "");
  const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
    ? `${API_BASE_URL}/hotel`
    : `${API_BASE_URL}/api/v1/hotel`;

  // Image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // Always use production server for images
    const baseUrl = "https://crm.jagalikoota.com";
    let cleanPath = imagePath.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }
    // Encode only the filename to handle spaces
    const pathParts = cleanPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const encodedFilename = encodeURIComponent(filename);
    const pathWithoutFilename = pathParts.slice(0, -1).join('/');
    return pathWithoutFilename ? `${baseUrl}/${pathWithoutFilename}/${encodedFilename}` : `${baseUrl}/${encodedFilename}`;
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch branches from Restaurant Profile (same as MenuManagements)
        const restaurantUrl = `${HOTEL_API_BASE}/getAllRestaurants?all=true`;
        console.log("RoomManagement: Fetching branches from:", restaurantUrl);
        
        try {
          const restaurantResponse = await fetch(restaurantUrl);
          let restaurantsData = [];
          
          if (restaurantResponse.ok) {
            const data = await restaurantResponse.json();
            console.log("RoomManagement: Restaurant API response:", data);
            
            // Use the exact same parsing logic as MenuManagements
            if (data.success && data.data) {
              restaurantsData = Array.isArray(data.data) ? data.data : [];
            } else if (Array.isArray(data)) {
              restaurantsData = data;
            } else {
              console.warn("RoomManagement: Unexpected response structure:", data);
            }
          } else {
            console.error("RoomManagement: Failed to fetch restaurants:", restaurantResponse.status);
          }

          console.log("RoomManagement: Restaurants data:", restaurantsData.length, restaurantsData);

          // Convert restaurants to branch format (same as MenuManagements)
          const restaurantProfileBranches = restaurantsData.map((restaurant) => {
            const branchName = restaurant.branchName || restaurant.restaurantName || "Unnamed Branch";
            console.log("RoomManagement: Mapping restaurant:", {
              _id: restaurant._id,
              branchName: restaurant.branchName,
              restaurantName: restaurant.restaurantName,
              finalName: branchName,
            });
            
            return {
              _id: restaurant._id,
              name: branchName,
            };
          });

          console.log("RoomManagement: Setting branches:", restaurantProfileBranches.length, restaurantProfileBranches);
          setBranches(restaurantProfileBranches);
        } catch (error) {
          console.error("RoomManagement: Error fetching branches:", error);
        }

        // Fetch rooms
        console.log("RoomManagement: Fetching rooms from /hotel/room");
        const fetchedRooms = await fetchDualBackend("/hotel/room", {}, true);
        console.log("RoomManagement: Fetched rooms:", fetchedRooms);
        setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : []);

        // Fetch bookings for all rooms
        console.log("RoomManagement: Fetching bookings from /hotel/room-booking");
        try {
          const fetchedBookings = await fetchDualBackend("/hotel/room-booking", {}, true);
          console.log("RoomManagement: Fetched bookings:", fetchedBookings);
          
          // Store all bookings for export
          setAllBookings(Array.isArray(fetchedBookings) ? fetchedBookings : []);
          
          // Create a map of roomId -> active booking (for display)
          const bookingsMap = {};
          if (Array.isArray(fetchedBookings)) {
            fetchedBookings.forEach(booking => {
              // Only show active bookings (not cancelled or checked-out)
              if (booking.status !== 'cancelled' && booking.status !== 'checked-out') {
                const roomId = booking.roomId?._id || booking.roomId;
                bookingsMap[roomId] = booking;
              }
            });
          }
          setBookings(bookingsMap);
        } catch (error) {
          console.error("RoomManagement: Error fetching bookings:", error);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data: " + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.isAvailable !== false).length;
    const occupied = total - available;
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;
    
    // Group by type
    const byType = rooms.reduce((acc, room) => {
      const type = room.roomType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return { total, available, occupied, occupancyRate, byType };
  }, [rooms]);

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesBranch = !selectedBranch || 
      (room.branchId?._id === selectedBranch || room.branchId === selectedBranch);
    const matchesSearch = !searchTerm || 
      room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Export to Excel function - shows only ACTIVE bookings (confirmed and checked-in)
  const exportToExcel = () => {
    // Filter bookings - only active ones (not cancelled or checked-out)
    const activeBookings = allBookings.filter(booking => {
      return booking.status !== 'cancelled' && booking.status !== 'checked-out';
    });

    // Filter by month if selected
    const filteredBookings = activeBookings.filter(booking => {
      if (filterMonth === "all") return true;
      
      const checkInDate = new Date(booking.checkInDate);
      const bookingMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}`;
      return bookingMonth === filterMonth;
    });

    // Create export data - one row per booking
    const exportData = [];
    
    filteredBookings.forEach(booking => {
      const roomId = booking.roomId?._id || booking.roomId;
      const room = rooms.find(r => r._id === roomId);
      
      if (room) {
        exportData.push({
          'Room Number': room.roomNumber || 'N/A',
          'Room Type': room.roomType || 'N/A',
          'Floor': room.floor || 'N/A',
          'Room Price': `?${room.price}/night`,
          'Branch': room.branchId?.name || 'N/A',
          'Guest Name': booking.userName || 'N/A',
          'Guest Phone': booking.userPhone || 'N/A',
          'Guest Email': booking.userEmail || 'N/A',
          'Check-in Date': new Date(booking.checkInDate).toLocaleDateString('en-IN'),
          'Check-in Time': booking.checkInTime || '12:00',
          'Check-out Date': new Date(booking.checkOutDate).toLocaleDateString('en-IN'),
          'Check-out Time': booking.checkOutTime || '11:00',
          'Nights': booking.nights || 1,
          'Total Amount': `?${booking.totalPrice?.toFixed(2) || '0.00'}`,
          'Booking Status': booking.status?.toUpperCase() || 'N/A',
          'Payment Status': booking.paymentStatus?.toUpperCase() || 'N/A',
          'Booked On': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : 'N/A',
        });
      }
    });

    // Sort by check-in date
    exportData.sort((a, b) => {
      const dateA = a['Check-in Date'].split('/').reverse().join('-');
      const dateB = b['Check-in Date'].split('/').reverse().join('-');
      return dateA.localeCompare(dateB);
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // Room Number
      { wch: 15 }, // Room Type
      { wch: 12 }, // Floor
      { wch: 12 }, // Room Price
      { wch: 30 }, // Branch
      { wch: 20 }, // Guest Name
      { wch: 15 }, // Guest Phone
      { wch: 25 }, // Guest Email
      { wch: 15 }, // Check-in Date
      { wch: 12 }, // Check-in Time
      { wch: 15 }, // Check-out Date
      { wch: 12 }, // Check-out Time
      { wch: 8 },  // Nights
      { wch: 15 }, // Total Amount
      { wch: 15 }, // Booking Status
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Booked On
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Active Bookings');

    // Add summary sheet
    const totalBookings = filteredBookings.length;
    const checkedInCount = filteredBookings.filter(b => b.status === 'checked-in').length;
    const confirmedCount = filteredBookings.filter(b => b.status === 'confirmed').length;
    const checkedOutCount = filteredBookings.filter(b => b.status === 'checked-out').length;
    const cancelledCount = filteredBookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = filteredBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const summaryData = [
      { 'Metric': 'Report Period', 'Value': filterMonth === 'all' ? 'All Time' : filterMonth },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Total Bookings', 'Value': totalBookings },
      { 'Metric': 'Checked-In', 'Value': checkedInCount },
      { 'Metric': 'Confirmed', 'Value': confirmedCount },
      { 'Metric': 'Checked-Out', 'Value': checkedOutCount },
      { 'Metric': 'Cancelled', 'Value': cancelledCount },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Total Revenue', 'Value': `?${totalRevenue.toFixed(2)}` },
      { 'Metric': 'Average Booking Value', 'Value': totalBookings > 0 ? `?${(totalRevenue / totalBookings).toFixed(2)}` : '?0.00' },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Generate filename with date and month filter
    const monthSuffix = filterMonth !== 'all' ? `_${filterMonth}` : '';
    const fileName = `Room_Bookings_Report${monthSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#69231B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bed className="w-8 h-8 text-[#69231B]" />
              Room Management
            </h1>
            <p className="text-gray-600 mt-2">View all rooms across branches (Read-only)</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Monthly Filter for Export */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Export Month
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#69231B]"
              >
                <option value="all">All Time</option>
                <option value="2024-10">October 2024</option>
                <option value="2024-11">November 2024</option>
                <option value="2024-12">December 2024</option>
                <option value="2025-01">January 2025</option>
                <option value="2025-02">February 2025</option>
                <option value="2025-03">March 2025</option>
                <option value="2025-04">April 2025</option>
                <option value="2025-05">May 2025</option>
                <option value="2025-06">June 2025</option>
                <option value="2025-07">July 2025</option>
                <option value="2025-08">August 2025</option>
                <option value="2025-09">September 2025</option>
                <option value="2025-10">October 2025</option>
                <option value="2025-11">November 2025</option>
                <option value="2025-12">December 2025</option>
              </select>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm mt-5"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Bed}
              title="Total Rooms"
              value={stats.total}
              subtitle="Across all branches"
              color="bg-[#69231B]"
            />
            <StatCard
              icon={CheckCircle}
              title="Available Rooms"
              value={stats.available}
              subtitle={`${stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% available`}
              color="bg-green-600"
            />
            <StatCard
              icon={XCircle}
              title="Occupied Rooms"
              value={stats.occupied}
              subtitle={`${stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(0) : 0}% occupied`}
              color="bg-red-600"
            />
            <StatCard
              icon={TrendingUp}
              title="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              subtitle="Current occupancy"
              color="bg-[#69231B]"
            />
          </div>
        </div>

        {/* Rooms by Type */}
        {Object.keys(stats.byType).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rooms by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-600 mb-1">{type}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">
                    {stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#69231B]"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Rooms
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by room number, type, or floor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69231B]"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredRooms.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{rooms.length}</span> rooms
            </p>
          </div>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedBranch
                ? "Try adjusting your filters"
                : "Rooms will appear here once added from JagaliKoota Admin Panel"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const booking = bookings[room._id];
              const isBooked = !room.isAvailable && booking;
              
              return (
                <div
                  key={room._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Room Image */}
                  <div className="relative h-48 bg-gray-200">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={getImageUrl(room.images[0])}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gray-100"
                      style={{ display: room.images && room.images.length > 0 ? "none" : "flex" }}
                    >
                      <Bed className="w-16 h-16 text-gray-300" />
                    </div>
                    
                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          room.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {!room.isAvailable && <Lock className="w-3 h-3" />}
                        {room.isAvailable ? "Available" : "BOOKED"}
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Room {room.roomNumber}
                        </h3>
                        <p className="text-sm text-gray-600">{room.roomType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#69231B]">
                          ?{room.price}
                        </p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{room.floor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                          {room.capacity?.adults || 2} Adults, {room.capacity?.children || 0} Children
                        </span>
                      </div>
                      {room.branchId?.name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bed className="w-4 h-4" />
                          <span>{room.branchId.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Booking Details - Show when room is booked */}
                    {isBooked && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-red-600" />
                          <p className="text-sm font-semibold text-red-900">Booking Details</p>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-3 h-3" />
                            <span className="font-medium">Guest:</span>
                            <span>{booking.userName}</span>
                          </div>
                          {booking.userPhone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-3 h-3" />
                              <span className="font-medium">Phone:</span>
                              <span>{booking.userPhone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Check-in:</span>
                            <span>
                              {new Date(booking.checkInDate).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })} at {booking.checkInTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">Check-out:</span>
                            <span>
                              {new Date(booking.checkOutDate).toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })} at {booking.checkOutTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">Total:</span>
                            <span>?{booking.totalPrice?.toFixed(2)} ({booking.nights} night{booking.nights > 1 ? 's' : ''})</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <CheckCircle className="w-3 h-3" />
                            <span className="font-medium">Status:</span>
                            <span className="capitalize font-semibold text-red-700">{booking.status}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {room.amenities && Object.keys(room.amenities).length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(room.amenities)
                            .filter(([_, value]) => value)
                            .slice(0, 4)
                            .map(([key]) => (
                              <span
                                key={key}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            ))}
                          {Object.entries(room.amenities).filter(([_, value]) => value).length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{Object.entries(room.amenities).filter(([_, value]) => value).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {room.description && !isBooked && (
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <p className="text-xs text-gray-600 line-clamp-2">{room.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
