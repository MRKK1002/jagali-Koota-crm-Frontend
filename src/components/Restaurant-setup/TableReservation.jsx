// import React, { useContext, useState, useEffect } from "react";
// import { TableContext } from "../../contexts/TableContext";
// import {
//   Filter,
//   MapPin,
//   Clock,
//   User,
//   Phone,
//   X,
//   Calendar,
//   Users,
//   Building,
// } from "lucide-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";

// const TableReservation = () => {
//   const { tables, fetchTables } = useContext(TableContext);
//   const [selectedBranch, setSelectedBranch] = useState("all");
//   const [showFilters, setShowFilters] = useState(false);
//   const [filterDate, setFilterDate] = useState(new Date());
//   const [filterTimeSlot, setFilterTimeSlot] = useState("");
//   const [reservationData, setReservationData] = useState({
//     customerName: "",
//     customerPhone: "",
//     guestCount: 1,
//     reservationDate: new Date(),
//     timeSlot: "",
//     tableId: null,
//     tableNumber: "",
//     branchId: "",
//   });
//   const [showReservationForm, setShowReservationForm] = useState(false);
//   const [reservations, setReservations] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [branches, setBranches] = useState([]);

//   // Time slot options (same as backend)
//   const timeSlots = [
//     "06:00 AM - 07:00 AM",
//     "07:00 AM - 08:00 AM",
//     "08:00 AM - 09:00 AM",
//     "09:00 AM - 10:00 AM",
//     "10:00 AM - 11:00 AM",
//     "11:00 AM - 12:00 PM",
//     "12:00 PM - 01:00 PM",
//     "01:00 PM - 02:00 PM",
//     "02:00 PM - 03:00 PM",
//     "03:00 PM - 04:00 PM",
//     "04:00 PM - 05:00 PM",
//     "05:00 PM - 06:00 PM",
//     "06:00 PM - 07:00 PM",
//     "07:00 PM - 08:00 PM",
//     "08:00 PM - 09:00 PM",
//     "09:00 PM - 10:00 PM",
//     "10:00 PM - 11:00 PM",
//   ];

//   // Fetch branches from backend
//   const fetchBranches = async () => {
//     try {
//       const response = await axios.get("https://crm.jagalikoota.com/api/v1/hotel/branch");
//       setBranches(response.data);
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//     }
//   };

//   // Fetch reservations from backend
//   const fetchReservations = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         "https://crm.jagalikoota.com/api/v1/hotel/reservation"
//       );
//       setReservations(response.data);
//     } catch (err) {
//       console.error("Error fetching reservations:", {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//       });
//       setError("Failed to load reservations. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReservations();
//     fetchBranches();
//   }, []);

//   // Get branch name by ID
//   const getBranchNameById = (branchId) => {
//     if (!branchId) return "Unknown";
//     const branch = branches.find(b => b._id === branchId);
//     return branch ? branch.name : "Unknown";
//   };

//   // Get branch name for a table
//   const getTableBranchName = (table) => {
//     if (table.branchId?.name) return table.branchId.name;
//     if (table.branchId) return getBranchNameById(table.branchId);
//     return "Unknown";
//   };

//   // Get branch name for a reservation
//   const getReservationBranchName = (reservation) => {
//     if (reservation.tableId?.branchId?.name) return reservation.tableId.branchId.name;
//     if (reservation.tableId?.branchId) return getBranchNameById(reservation.tableId.branchId);
//     return "Unknown";
//   };

//   // Get unique branches from tables
//   const branchOptions = [
//     { id: "all", name: "All Branches" },
//     ...Array.from(
//       new Map(
//         tables
//           .filter(table => table.branchId)
//           .map(table => [
//             table.branchId._id || table.branchId,
//             {
//               id: table.branchId._id || table.branchId,
//               name: getTableBranchName(table)
//             }
//           ])
//       ).values()
//     )
//   ];

//   // Check if a time slot is available for a table
//   const isTimeSlotAvailable = (tableId, date, timeSlot) => {
//     const dateString = date.toISOString().split("T")[0];
//     return !reservations.some(
//       (res) =>
//         res.tableId?._id === tableId &&
//         new Date(res.reservationDate).toISOString().split("T")[0] === dateString &&
//         res.timeSlot === timeSlot &&
//         res.status !== "cancelled"
//     );
//   };

//   // Filter available tables
//   const availableTables = tables.filter((table) => {
//     const isAvailable = table.status === "available";
//     const tableBranchId = table.branchId?._id || table.branchId;
//     const matchesBranch =
//       selectedBranch === "all" || tableBranchId === selectedBranch;

//     if (!filterDate || !filterTimeSlot) {
//       return isAvailable && matchesBranch;
//     }

//     return (
//       isAvailable &&
//       matchesBranch &&
//       isTimeSlotAvailable(table._id, filterDate, filterTimeSlot)
//     );
//   });

//   // Filter reservations based on branch selection
//   const filteredReservations = reservations.filter((reservation) => {
//     if (reservation.status === "cancelled") return false;

//     if (selectedBranch === "all") return true;

//     const reservationBranchId = reservation.tableId?.branchId?._id || reservation.tableId?.branchId;
//     return reservationBranchId === selectedBranch;
//   });

//   // Get available time slots for a table
//   const getAvailableTimeSlots = (tableId) => {
//     const dateString = reservationData.reservationDate
//       .toISOString()
//       .split("T")[0];
//     const tableReservations = reservations.filter(
//       (res) =>
//         res.tableId?._id === tableId &&
//         new Date(res.reservationDate).toISOString().split("T")[0] === dateString &&
//         res.status !== "cancelled"
//     );

//     return timeSlots.filter(
//       (slot) => !tableReservations.some((res) => res.timeSlot === slot)
//     );
//   };

//   // Handle reservation form input changes
//   const handleReservationInputChange = (e) => {
//     const { name, value } = e.target;
//     setReservationData((prev) => ({
//       ...prev,
//       [name]: name === "guestCount" ? parseInt(value) || 1 : value,
//     }));
//   };

//   // Handle date change
//   const handleDateChange = (date) => {
//     setReservationData((prev) => ({
//       ...prev,
//       reservationDate: date,
//       timeSlot: "",
//     }));
//   };

//   // Handle filter date change
//   const handleFilterDateChange = (date) => {
//     setFilterDate(date);
//     setFilterTimeSlot("");
//   };

//   // Handle branch filter change
//   const handleBranchChange = (branchId) => {
//     setSelectedBranch(branchId);
//     setFilterTimeSlot("");
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setSelectedBranch("all");
//     setFilterDate(new Date());
//     setFilterTimeSlot("");
//   };

//   // Get current branch name for display
//   const getCurrentBranchName = () => {
//     if (selectedBranch === "all") return "All Branches";
//     const branch = branchOptions.find(b => b.id === selectedBranch);
//     return branch ? branch.name : "All Branches";
//   };

//   // Open reservation form
//   const openReservationForm = (table) => {
//     console.log("Table selected for reservation:", table);
//     if (!table?._id) {
//       setError("Invalid table selected");
//       console.error("Invalid table:", table);
//       return;
//     }
//     const availableSlots = getAvailableTimeSlots(table._id);
//     setReservationData({
//       customerName: "",
//       customerPhone: "",
//       guestCount: 1,
//       reservationDate: filterDate || new Date(),
//       timeSlot: availableSlots[0] || "",
//       tableId: table._id,
//       tableNumber: table.number || "",
//       branchId: table.branchId?._id || table.branchId || "",
//     });
//     setShowReservationForm(true);
//     setError(null);
//   };

//   // Handle reservation submission
//   const handleReserve = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     // Validate phone number
//     const phoneRegex = /^\+?\d{10,15}$/;
//     if (!phoneRegex.test(reservationData.customerPhone)) {
//       setError("Please enter a valid phone number (10-15 digits)");
//       setLoading(false);
//       return;
//     }

//     // Validate tableId
//     if (!reservationData.tableId) {
//       setError("No table selected for reservation");
//       setLoading(false);
//       return;
//     }

//     // Validate guest count against table capacity (if capacity exists)
//     const table = tables.find((t) => t._id === reservationData.tableId);
//     if (!table) {
//       setError("Selected table not found");
//       setLoading(false);
//       return;
//     }
//     if (table.capacity && reservationData.guestCount > table.capacity) {
//       setError(`Guest count exceeds table capacity (${table.capacity})`);
//       setLoading(false);
//       return;
//     }

//     // Validate required fields
//     if (
//       !reservationData.customerName ||
//       !reservationData.customerPhone ||
//       !reservationData.guestCount ||
//       !reservationData.timeSlot ||
//       !reservationData.reservationDate
//     ) {
//       setError("Please fill all required fields");
//       setLoading(false);
//       return;
//     }

//     const payload = {
//       tableId: reservationData.tableId,
//       customerName: reservationData.customerName,
//       customerPhone: reservationData.customerPhone,
//       customerEmail: "", // Add if needed
//       guestCount: reservationData.guestCount,
//       reservationDate: reservationData.reservationDate
//         .toISOString()
//         .split("T")[0],
//       timeSlot: reservationData.timeSlot,
//       status: "confirmed",
//     };

//     try {
//       console.log("Sending reservation payload:", payload);
//       const response = await axios.post(
//         "https://crm.jagalikoota.com/api/v1/hotel/reservation",
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       setReservations((prev) => [...prev, response.data]);
//       alert(
//         `Reservation confirmed for ${reservationData.customerName} for ${reservationData.timeSlot
//         } on ${reservationData.reservationDate.toLocaleDateString()}`
//       );

//       setReservationData({
//         customerName: "",
//         customerPhone: "",
//         guestCount: 1,
//         reservationDate: new Date(),
//         timeSlot: "",
//         tableId: null,
//         tableNumber: "",
//         branchId: "",
//       });
//       setShowReservationForm(false);
//       await fetchReservations();
//       if (fetchTables) await fetchTables();
//     } catch (error) {
//       console.error("Error creating reservation:", {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//         payload,
//       });
//       setError(
//         error.response?.status === 404
//           ? "Reservation endpoint not found. Please check if the backend server is running."
//           : error.response?.data?.error || "Error creating reservation"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel a reservation
//   const cancelReservation = async (reservationId) => {
//     if (!window.confirm("Are you sure you want to cancel this reservation?")) {
//       return;
//     }

//     setError(null);
//     setLoading(true);

//     try {
//       const reservation = reservations.find((res) => res._id === reservationId);
//       console.log("Reservation to cancel:", reservation);
//       if (!reservation) {
//         throw new Error("Reservation not found");
//       }

//       const response = await axios.put(
//         `https://crm.jagalikoota.com/api/v1/hotel/reservation/${reservationId}/cancel`,
//         {},
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.status === 200) {
//         setReservations((prev) =>
//           prev.map((res) =>
//             res._id === reservationId ? { ...res, status: "cancelled" } : res
//           )
//         );
//         alert("Reservation cancelled successfully");
//         await fetchReservations();
//         if (fetchTables) await fetchTables(); // Sync table status
//       } else {
//         throw new Error("Unexpected response from server");
//       }
//     } catch (error) {
//       console.error("Error cancelling reservation:", {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//         config: error.config,
//       });
//       setError(
//         error.response?.data?.error ||
//         error.message ||
//         "Error cancelling reservation"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Table Reservation System
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Currently viewing: <span className="font-semibold">{getCurrentBranchName()}</span>
//           </p>
//         </div>
//         <div className="flex items-center space-x-3">
//           {/* Branch Quick Filter */}
//           <div className="relative">
//             <select
//               value={selectedBranch}
//               onChange={(e) => handleBranchChange(e.target.value)}
//               className="appearance-none bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
//             >
//               {branchOptions.map((branch) => (
//                 <option key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//             <Building className="w-4 h-4 absolute right-2 top-3 pointer-events-none" />
//           </div>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center"
//           >
//             <Filter className="w-5 h-5 mr-2" />
//             Advanced Filters
//           </button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md border border-red-300">
//           {error}
//           <button
//             onClick={() => setError(null)}
//             className="ml-2 text-red-600 hover:text-red-800"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Filter Summary */}
//       {(selectedBranch !== "all" || filterTimeSlot) && (
//         <div className="bg-blue-50 p-3 rounded-lg mb-6 flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <span className="text-sm font-medium text-blue-800">Active Filters:</span>
//             {selectedBranch !== "all" && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
//                 <MapPin className="w-3 h-3 mr-1" />
//                 Branch: {getCurrentBranchName()}
//                 <button
//                   onClick={() => setSelectedBranch("all")}
//                   className="ml-2 text-blue-600 hover:text-blue-800"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//             {filterTimeSlot && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
//                 <Clock className="w-3 h-3 mr-1" />
//                 Time: {filterTimeSlot}
//                 <button
//                   onClick={() => setFilterTimeSlot("")}
//                   className="ml-2 text-blue-600 hover:text-blue-800"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//           </div>
//           <button
//             onClick={clearFilters}
//             className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//           >
//             Clear All
//           </button>
//         </div>
//       )}

//       {/* Advanced Filter Section */}
//       {showFilters && (
//         <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-medium text-gray-700">Advanced Filters</h3>
//             <button
//               onClick={() => setShowFilters(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <MapPin className="w-4 h-4 inline mr-1" />
//                 Branch
//               </label>
//               <select
//                 value={selectedBranch}
//                 onChange={(e) => handleBranchChange(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {branchOptions.map((branch) => (
//                   <option key={branch.id} value={branch.id}>
//                     {branch.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Date
//               </label>
//               <DatePicker
//                 selected={filterDate}
//                 onChange={handleFilterDateChange}
//                 dateFormat="MMMM d, yyyy"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholderText="Select date"
//                 minDate={new Date()}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Time Slot
//               </label>
//               <select
//                 value={filterTimeSlot}
//                 onChange={(e) => setFilterTimeSlot(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Time Slot</option>
//                 {timeSlots.map((slot) => (
//                   <option key={`filter-${slot}`} value={slot}>
//                     {slot}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Available Tables Section */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Available Tables {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
//           </h2>
//           <span className="text-sm text-gray-600">
//             {availableTables.length} table(s) found
//           </span>
//         </div>
//         {loading ? (
//           <div className="text-center py-8">Loading tables...</div>
//         ) : availableTables.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <svg
//               className="w-16 h-16 mx-auto text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6h16M4 10h16M4 14h16M4 18h16"
//               ></path>
//             </svg>
//             <h3 className="mt-4 text-lg font-medium text-gray-900">
//               No available tables
//             </h3>
//             <p className="mt-1 text-gray-500">
//               {selectedBranch === "all" && !filterTimeSlot
//                 ? "There are currently no tables available for reservation."
//                 : `No available tables found for ${getCurrentBranchName()} on ${filterDate?.toLocaleDateString() || ""} at ${filterTimeSlot || ""}.`}
//             </p>
//             <button
//               onClick={clearFilters}
//               className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Sl No
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Table Number
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Branch
//                   </th>

//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {availableTables.map((table, index) => (
//                   <tr key={table._id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{index + 1}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         #{table.number}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {getTableBranchName(table)}
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {table.image ? (
//                         <img
//                           src={`https://crm.jagalikoota.com/${table.image}`}
//                           alt={`Table ${table.number}`}
//                           className="h-20 w-20 rounded object-cover"
//                         />
//                       ) : (
//                         <span className="text-sm text-gray-500">No image</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => openReservationForm(table)}
//                         className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition duration-200"
//                         disabled={loading}
//                       >
//                         Reserve
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Reservations Table Section */}
//       <div>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Current Reservations {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
//           </h2>
//           <span className="text-sm text-gray-600">
//             {filteredReservations.length} reservation(s) found
//           </span>
//         </div>
//         {loading ? (
//           <div className="text-center py-8">Loading reservations...</div>
//         ) : filteredReservations.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <svg
//               className="w-16 h-16 mx-auto text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//               ></path>
//             </svg>
//             <h3 className="mt-4 text-lg font-medium text-gray-900">
//               No active reservations
//             </h3>
//             <p className="mt-1 text-gray-500">
//               {selectedBranch === "all"
//                 ? "Active reservations will appear here once they are created."
//                 : `No active reservations found for ${getCurrentBranchName()}.`}
//             </p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Sl No
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Table
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Branch
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Time Slot
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Guests
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredReservations.map((reservation, index) => (
//                   <tr key={reservation._id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{index + 1}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {reservation.customerName}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {reservation.customerPhone}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         #{reservation.tableId?.number || "Unknown"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {getReservationBranchName(reservation)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {formatDate(reservation.reservationDate)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {reservation.timeSlot}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {reservation.guestCount}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs rounded-full ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
//                         reservation.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
//                           'bg-gray-100 text-gray-800'
//                         }`}>
//                         {reservation.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => cancelReservation(reservation._id)}
//                         className={`px-3 py-1 rounded-lg font-medium transition
//     ${reservation.status === 'cancelled'
//                             ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
//                             : 'bg-red-500 hover:bg-red-600 text-white'
//                           }`}
//                         disabled={loading || reservation.status === 'cancelled'}
//                       >
//                         {reservation.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
//                       </button>

//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Reservation Form Modal */}
//       {showReservationForm && reservationData.tableId && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
//           <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
//             <div className="flex justify-between items-center pb-4 border-b">
//               <h3 className="text-xl font-semibold text-gray-900">
//                 Make Reservation for Table #{reservationData.tableNumber}
//               </h3>
//               <button
//                 onClick={() => setShowReservationForm(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   ></path>
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleReserve} className="space-y-4 mt-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <User className="w-4 h-4 inline mr-1" />
//                   Customer Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   value={reservationData.customerName}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter customer name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Phone className="w-4 h-4 inline mr-1" />
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="customerPhone"
//                   value={reservationData.customerPhone}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter phone number (e.g., +1234567890)"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Guest Count <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   name="guestCount"
//                   value={reservationData.guestCount}
//                   onChange={handleReservationInputChange}
//                   required
//                   min="1"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter number of guests"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Calendar className="w-4 h-4 inline mr-1" />
//                   Reservation Date <span className="text-red-500">*</span>
//                 </label>
//                 <DatePicker
//                   selected={reservationData.reservationDate}
//                   onChange={handleDateChange}
//                   dateFormat="MMMM d, yyyy"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholderText="Select date"
//                   minDate={new Date()}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Time Slot <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="timeSlot"
//                   value={reservationData.timeSlot}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Time Slot</option>
//                   {reservationData.tableId &&
//                     getAvailableTimeSlots(reservationData.tableId).map(
//                       (slot) => (
//                         <option key={`slot-${slot}`} value={slot}>
//                           {slot}
//                         </option>
//                       )
//                     )}
//                 </select>
//               </div>
//               <div className="flex justify-end pt-4 border-t mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowReservationForm(false)}
//                   className="mr-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 disabled:opacity-50"
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white disabled:opacity-50"
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "Confirm Reservation"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TableReservation;

// import React, { useContext, useState, useEffect } from "react";
// import { TableContext } from "../../contexts/TableContext";
// import {
//   Filter,
//   MapPin,
//   Clock,
//   User,
//   Phone,
//   X,
//   Calendar,
//   Users,
//   Building,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";

// const TableReservation = () => {
//   const { tables, fetchTables } = useContext(TableContext);
//   const [selectedBranch, setSelectedBranch] = useState("all");
//   const [showFilters, setShowFilters] = useState(false);
//   const [filterDate, setFilterDate] = useState(new Date());
//   const [filterTimeSlot, setFilterTimeSlot] = useState("");
//   const [reservationData, setReservationData] = useState({
//     customerName: "",
//     customerPhone: "",
//     guestCount: 1,
//     reservationDate: new Date(),
//     timeSlot: "",
//     tableId: null,
//     tableNumber: "",
//     branchId: "",
//   });
//   const [showReservationForm, setShowReservationForm] = useState(false);
//   const [reservations, setReservations] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [branches, setBranches] = useState([]);

//   // Scroll states for both tables
//   const [availableTablesScroll, setAvailableTablesScroll] = useState(0);
//   const [reservationsScroll, setReservationsScroll] = useState(0);
//   const [localBranches, setLocalBranches] = useState([]);
// const [jagaliKootaBranches, setJagaliKootaBranches] = useState([]);
// const allBranches = [...localBranches, ...jagaliKootaBranches];

//   // Time slot options (same as backend)
//   const timeSlots = [
//     "06:00 AM - 07:00 AM",
//     "07:00 AM - 08:00 AM",
//     "08:00 AM - 09:00 AM",
//     "09:00 AM - 10:00 AM",
//     "10:00 AM - 11:00 AM",
//     "11:00 AM - 12:00 PM",
//     "12:00 PM - 01:00 PM",
//     "01:00 PM - 02:00 PM",
//     "02:00 PM - 03:00 PM",
//     "03:00 PM - 04:00 PM",
//     "04:00 PM - 05:00 PM",
//     "05:00 PM - 06:00 PM",
//     "06:00 PM - 07:00 PM",
//     "07:00 PM - 08:00 PM",
//     "08:00 PM - 09:00 PM",
//     "09:00 PM - 10:00 PM",
//     "10:00 PM - 11:00 PM",
//   ];

//   // Fetch branches from backend
//   const fetchBranches = async () => {
//     try {
//       const response = await axios.get("https://crm.jagalikoota.com/api/v1/hotel/branch");
//       setBranches(response.data);
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//     }
//   };

//   // Fetch reservations from backend
//   const fetchReservations = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         "https://crm.jagalikoota.com/api/v1/hotel/reservation"
//       );
//       setReservations(response.data);
//     } catch (err) {
//       console.error("Error fetching reservations:", {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data,
//       });
//       setError("Failed to load reservations. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReservations();
//     fetchBranches();
//   }, []);

//   // Get branch name by ID
//  const getBranchNameById = (branchId) => {
//   if (!branchId) return "Unknown";
//   const branch = allBranches.find(b => b._id === branchId);
//   return branch ? branch.name : "Unknown";
// };

//   // Get branch name for a table
//   const getTableBranchName = (table) => {
//     if (table.branchId?.name) return table.branchId.name;
//     if (table.branchId) return getBranchNameById(table.branchId);
//     return "Unknown";
//   };

//   // Get branch name for a reservation
//   const getReservationBranchName = (reservation) => {
//     if (reservation.tableId?.branchId?.name) return reservation.tableId.branchId.name;
//     if (reservation.tableId?.branchId) return getBranchNameById(reservation.tableId.branchId);
//     return "Unknown";
//   };

//   // Get unique branches from tables
//   const branchOptions = [
//     { id: "all", name: "All Branches" },
//     ...Array.from(
//       new Map(
//         tables
//           .filter(table => table.branchId)
//           .map(table => [
//             table.branchId._id || table.branchId,
//             {
//               id: table.branchId._id || table.branchId,
//               name: getTableBranchName(table)
//             }
//           ])
//       ).values()
//     )
//   ];

//   // Check if a time slot is available for a table
//   const isTimeSlotAvailable = (tableId, date, timeSlot) => {
//     const dateString = date.toISOString().split("T")[0];
//     return !reservations.some(
//       (res) =>
//         res.tableId?._id === tableId &&
//         new Date(res.reservationDate).toISOString().split("T")[0] === dateString &&
//         res.timeSlot === timeSlot &&
//         res.status !== "cancelled"
//     );
//   };

//   // Filter available tables
//  const availableTables = allTables.filter((table) => {
//   const isAvailable = table.status === "available";
//   const tableBranchId = table.branchId?._id || table.branchId;
//   const matchesBranch = selectedBranch === "all" || tableBranchId === selectedBranch;

//     if (!filterDate || !filterTimeSlot) {
//       return isAvailable && matchesBranch;
//     }

//     return (
//       isAvailable &&
//       matchesBranch &&
//       isTimeSlotAvailable(table._id, filterDate, filterTimeSlot)
//     );
//   });

//   // Filter reservations based on branch selection
//   const filteredReservations = reservations.filter((reservation) => {
//     if (reservation.status === "cancelled") return false;

//     if (selectedBranch === "all") return true;

//     const reservationBranchId = reservation.tableId?.branchId?._id || reservation.tableId?.branchId;
//     return reservationBranchId === selectedBranch;
//   });

//   // Get available time slots for a table
//   const getAvailableTimeSlots = (tableId) => {
//     const dateString = reservationData.reservationDate
//       .toISOString()
//       .split("T")[0];
//     const tableReservations = reservations.filter(
//       (res) =>
//         res.tableId?._id === tableId &&
//         new Date(res.reservationDate).toISOString().split("T")[0] === dateString &&
//         res.status !== "cancelled"
//     );

//     return timeSlots.filter(
//       (slot) => !tableReservations.some((res) => res.timeSlot === slot)
//     );
//   };

//   // Handle reservation form input changes
//   const handleReservationInputChange = (e) => {
//     const { name, value } = e.target;
//     setReservationData((prev) => ({
//       ...prev,
//       [name]: name === "guestCount" ? parseInt(value) || 1 : value,
//     }));
//   };

//   // Handle date change
//   const handleDateChange = (date) => {
//     setReservationData((prev) => ({
//       ...prev,
//       reservationDate: date,
//       timeSlot: "",
//     }));
//   };

//   // Handle filter date change
//   const handleFilterDateChange = (date) => {
//     setFilterDate(date);
//     setFilterTimeSlot("");
//   };

//   // Handle branch filter change
//   const handleBranchChange = (branchId) => {
//     setSelectedBranch(branchId);
//     setFilterTimeSlot("");
//     // Reset scroll when branch changes
//     setAvailableTablesScroll(0);
//     setReservationsScroll(0);
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setSelectedBranch("all");
//     setFilterDate(new Date());
//     setFilterTimeSlot("");
//     // Reset scroll when filters are cleared
//     setAvailableTablesScroll(0);
//     setReservationsScroll(0);
//   };

//   // Get current branch name for display
//   const getCurrentBranchName = () => {
//     if (selectedBranch === "all") return "All Branches";
//     const branch = branchOptions.find(b => b.id === selectedBranch);
//     return branch ? branch.name : "All Branches";
//   };

//   // Open reservation form
//   const openReservationForm = (table) => {
//     console.log("Table selected for reservation:", table);
//     if (!table?._id) {
//       setError("Invalid table selected");
//       console.error("Invalid table:", table);
//       return;
//     }
//     const availableSlots = getAvailableTimeSlots(table._id);
//     setReservationData({
//       customerName: "",
//       customerPhone: "",
//       guestCount: 1,
//       reservationDate: filterDate || new Date(),
//       timeSlot: availableSlots[0] || "",
//       tableId: table._id,
//       tableNumber: table.number || "",
//       branchId: table.branchId?._id || table.branchId || "",
//     });
//     setShowReservationForm(true);
//     setError(null);
//   };

//   // Handle reservation submission
//   const handleReserve = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     // Validate phone number
//     const phoneRegex = /^\+?\d{10,15}$/;
//     if (!phoneRegex.test(reservationData.customerPhone)) {
//       setError("Please enter a valid phone number (10-15 digits)");
//       setLoading(false);
//       return;
//     }

//     // Validate tableId
//     if (!reservationData.tableId) {
//       setError("No table selected for reservation");
//       setLoading(false);
//       return;
//     }

//     // Validate guest count against table capacity (if capacity exists)
//     const table = tables.find((t) => t._id === reservationData.tableId);
//     if (!table) {
//       setError("Selected table not found");
//       setLoading(false);
//       return;
//     }
//     if (table.capacity && reservationData.guestCount > table.capacity) {
//       setError(`Guest count exceeds table capacity (${table.capacity})`);
//       setLoading(false);
//       return;
//     }

//     // Validate required fields
//     if (
//       !reservationData.customerName ||
//       !reservationData.customerPhone ||
//       !reservationData.guestCount ||
//       !reservationData.timeSlot ||
//       !reservationData.reservationDate
//     ) {
//       setError("Please fill all required fields");
//       setLoading(false);
//       return;
//     }

//     const payload = {
//       tableId: reservationData.tableId,
//       customerName: reservationData.customerName,
//       customerPhone: reservationData.customerPhone,
//       customerEmail: "", // Add if needed
//       guestCount: reservationData.guestCount,
//       reservationDate: reservationData.reservationDate
//         .toISOString()
//         .split("T")[0],
//       timeSlot: reservationData.timeSlot,
//       status: "confirmed",
//     };

//     try {
//       console.log("Sending reservation payload:", payload);
//       const response = await axios.post(
//         "https://crm.jagalikoota.com/api/v1/hotel/reservation",
//         payload,
//         { headers: { "Content-Type": "application/json" } }
//       );

//       setReservations((prev) => [...prev, response.data]);
//       alert(
//         `Reservation confirmed for ${reservationData.customerName} for ${reservationData.timeSlot
//         } on ${reservationData.reservationDate.toLocaleDateString()}`
//       );

//       setReservationData({
//         customerName: "",
//         customerPhone: "",
//         guestCount: 1,
//         reservationDate: new Date(),
//         timeSlot: "",
//         tableId: null,
//         tableNumber: "",
//         branchId: "",
//       });
//       setShowReservationForm(false);
//       await fetchReservations();
//       if (fetchTables) await fetchTables();
//     } catch (error) {
//       console.error("Error creating reservation:", {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//         payload,
//       });
//       setError(
//         error.response?.status === 404
//           ? "Reservation endpoint not found. Please check if the backend server is running."
//           : error.response?.data?.error || "Error creating reservation"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel a reservation
//   const cancelReservation = async (reservationId) => {
//     if (!window.confirm("Are you sure you want to cancel this reservation?")) {
//       return;
//     }

//     setError(null);
//     setLoading(true);

//     try {
//       const reservation = reservations.find((res) => res._id === reservationId);
//       console.log("Reservation to cancel:", reservation);
//       if (!reservation) {
//         throw new Error("Reservation not found");
//       }

//       const response = await axios.put(
//         `https://crm.jagalikoota.com/api/v1/hotel/reservation/${reservationId}/cancel`,
//         {},
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (response.status === 200) {
//         setReservations((prev) =>
//           prev.map((res) =>
//             res._id === reservationId ? { ...res, status: "cancelled" } : res
//           )
//         );
//         alert("Reservation cancelled successfully");
//         await fetchReservations();
//         if (fetchTables) await fetchTables(); // Sync table status
//       } else {
//         throw new Error("Unexpected response from server");
//       }
//     } catch (error) {
//       console.error("Error cancelling reservation:", {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data,
//         config: error.config,
//       });
//       setError(
//         error.response?.data?.error ||
//         error.message ||
//         "Error cancelling reservation"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // Scroll functions for available tables
//   const scrollAvailableTables = (direction) => {
//     const scrollAmount = 300;
//     const newScroll = direction === 'right'
//       ? availableTablesScroll + scrollAmount
//       : Math.max(0, availableTablesScroll - scrollAmount);
//     setAvailableTablesScroll(newScroll);
//   };

//   // Scroll functions for reservations table
//   const scrollReservations = (direction) => {
//     const scrollAmount = 300;
//     const newScroll = direction === 'right'
//       ? reservationsScroll + scrollAmount
//       : Math.max(0, reservationsScroll - scrollAmount);
//     setReservationsScroll(newScroll);
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Table Reservation System
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Currently viewing: <span className="font-semibold">{getCurrentBranchName()}</span>
//           </p>
//         </div>
//         <div className="flex items-center space-x-3">
//           {/* Branch Quick Filter */}
//           <div className="relative">
//           // In the branch filter dropdown
// <select
//   value={selectedBranch}
//   onChange={(e) => handleBranchChange(e.target.value)}
//   className="appearance-none bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
// >
//   <option value="all">All Branches</option>
//   {allBranches.map((branch) => (
//     <option key={branch._id} value={branch._id}>
//       {branch.name}
//     </option>
//   ))}
// </select>
//             <Building className="w-4 h-4 absolute right-2 top-3 pointer-events-none" />
//           </div>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center"
//           >
//             <Filter className="w-5 h-5 mr-2" />
//             Advanced Filters
//           </button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md border border-red-300">
//           {error}
//           <button
//             onClick={() => setError(null)}
//             className="ml-2 text-red-600 hover:text-red-800"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Filter Summary */}
//       {(selectedBranch !== "all" || filterTimeSlot) && (
//         <div className="bg-blue-50 p-3 rounded-lg mb-6 flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <span className="text-sm font-medium text-blue-800">Active Filters:</span>
//             {selectedBranch !== "all" && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
//                 <MapPin className="w-3 h-3 mr-1" />
//                 Branch: {getCurrentBranchName()}
//                 <button
//                   onClick={() => setSelectedBranch("all")}
//                   className="ml-2 text-blue-600 hover:text-blue-800"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//             {filterTimeSlot && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
//                 <Clock className="w-3 h-3 mr-1" />
//                 Time: {filterTimeSlot}
//                 <button
//                   onClick={() => setFilterTimeSlot("")}
//                   className="ml-2 text-blue-600 hover:text-blue-800"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}
//           </div>
//           <button
//             onClick={clearFilters}
//             className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//           >
//             Clear All
//           </button>
//         </div>
//       )}

//       {/* Advanced Filter Section */}
//       {showFilters && (
//         <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//           <div className="flex justify-between items-center mb-3">
//             <h3 className="font-medium text-gray-700">Advanced Filters</h3>
//             <button
//               onClick={() => setShowFilters(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <MapPin className="w-4 h-4 inline mr-1" />
//                 Branch
//               </label>
//               <select
//                 value={selectedBranch}
//                 onChange={(e) => handleBranchChange(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {branchOptions.map((branch) => (
//                   <option key={branch.id} value={branch.id}>
//                     {branch.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Calendar className="w-4 h-4 inline mr-1" />
//                 Date
//               </label>
//               <DatePicker
//                 selected={filterDate}
//                 onChange={handleFilterDateChange}
//                 dateFormat="MMMM d, yyyy"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholderText="Select date"
//                 minDate={new Date()}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 <Clock className="w-4 h-4 inline mr-1" />
//                 Time Slot
//               </label>
//               <select
//                 value={filterTimeSlot}
//                 onChange={(e) => setFilterTimeSlot(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Time Slot</option>
//                 {timeSlots.map((slot) => (
//                   <option key={`filter-${slot}`} value={slot}>
//                     {slot}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Available Tables Section */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Available Tables {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
//           </h2>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">
//               {availableTables.length} table(s) found
//             </span>
//             {/* Scroll Controls for Available Tables */}
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => scrollAvailableTables('left')}
//                 disabled={availableTablesScroll === 0}
//                 className={`p-1 rounded ${availableTablesScroll === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => scrollAvailableTables('right')}
//                 className="p-1 rounded text-gray-600 hover:bg-gray-200"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//         {loading ? (
//           <div className="text-center py-8">Loading tables...</div>
//         ) : availableTables.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <svg
//               className="w-16 h-16 mx-auto text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6h16M4 10h16M4 14h16M4 18h16"
//               ></path>
//             </svg>
//             <h3 className="mt-4 text-lg font-medium text-gray-900">
//               No available tables
//             </h3>
//             <p className="mt-1 text-gray-500">
//               {selectedBranch === "all" && !filterTimeSlot
//                 ? "There are currently no tables available for reservation."
//                 : `No available tables found for ${getCurrentBranchName()} on ${filterDate?.toLocaleDateString() || ""} at ${filterTimeSlot || ""}.`}
//             </p>
//             <button
//               onClick={clearFilters}
//               className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
//             >
//               Clear Filters
//             </button>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div
//               className="overflow-x-auto transition-all duration-300"
//               style={{ scrollBehavior: 'smooth' }}
//             >
//               <table
//                 className="min-w-full divide-y divide-gray-200"
//                 style={{ transform: `translateX(-${availableTablesScroll}px)` }}
//               >
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
//                       Sl No
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                       Table Number
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
//                       Branch
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                       Capacity
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
//                       Image
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {availableTables.map((table, index) => (
//                     <tr key={table._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{index + 1}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           #{table.number}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {getTableBranchName(table)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {table.capacity || "N/A"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {table.image ? (
//                           <img
//                             src={`https://crm.jagalikoota.com/${table.image}`}
//                             alt={`Table ${table.number}`}
//                             className="h-20 w-20 rounded object-cover"
//                           />
//                         ) : (
//                           <span className="text-sm text-gray-500">No image</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => openReservationForm(table)}
//                           className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition duration-200"
//                           disabled={loading}
//                         >
//                           Reserve
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Reservations Table Section */}
//       <div>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Current Reservations {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
//           </h2>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">
//               {filteredReservations.length} reservation(s) found
//             </span>
//             {/* Scroll Controls for Reservations */}
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => scrollReservations('left')}
//                 disabled={reservationsScroll === 0}
//                 className={`p-1 rounded ${reservationsScroll === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-200'}`}
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => scrollReservations('right')}
//                 className="p-1 rounded text-gray-600 hover:bg-gray-200"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//         {loading ? (
//           <div className="text-center py-8">Loading reservations...</div>
//         ) : filteredReservations.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-8 text-center">
//             <svg
//               className="w-16 h-16 mx-auto text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//               ></path>
//             </svg>
//             <h3 className="mt-4 text-lg font-medium text-gray-900">
//               No active reservations
//             </h3>
//             <p className="mt-1 text-gray-500">
//               {selectedBranch === "all"
//                 ? "Active reservations will appear here once they are created."
//                 : `No active reservations found for ${getCurrentBranchName()}.`}
//             </p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div
//               className="overflow-x-auto transition-all duration-300"
//               style={{ scrollBehavior: 'smooth' }}
//             >
//               <table
//                 className="min-w-full divide-y divide-gray-200"
//                 style={{ transform: `translateX(-${reservationsScroll}px)` }}
//               >
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
//                       Sl No
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
//                       Customer
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
//                       Phone
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
//                       Table
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
//                       Branch
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
//                       Time Slot
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
//                       Guests
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredReservations.map((reservation, index) => (
//                     <tr key={reservation._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{index + 1}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           {reservation.customerName}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {reservation.customerPhone}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           #{reservation.tableId?.number || "Unknown"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {getReservationBranchName(reservation)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {formatDate(reservation.reservationDate)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {reservation.timeSlot}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {reservation.guestCount}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 text-xs rounded-full ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
//                           reservation.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
//                             'bg-gray-100 text-gray-800'
//                           }`}>
//                           {reservation.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => cancelReservation(reservation._id)}
//                           className={`px-3 py-1 rounded-lg font-medium transition
//     ${reservation.status === 'cancelled'
//                               ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
//                               : 'bg-red-500 hover:bg-red-600 text-white'
//                             }`}
//                           disabled={loading || reservation.status === 'cancelled'}
//                         >
//                           {reservation.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Reservation Form Modal */}
//       {showReservationForm && reservationData.tableId && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
//           <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
//             <div className="flex justify-between items-center pb-4 border-b">
//               <h3 className="text-xl font-semibold text-gray-900">
//                 Make Reservation for Table #{reservationData.tableNumber}
//               </h3>
//               <button
//                 onClick={() => setShowReservationForm(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   ></path>
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleReserve} className="space-y-4 mt-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <User className="w-4 h-4 inline mr-1" />
//                   Customer Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="customerName"
//                   value={reservationData.customerName}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter customer name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Phone className="w-4 h-4 inline mr-1" />
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="tel"
//                   name="customerPhone"
//                   value={reservationData.customerPhone}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter phone number (e.g., +1234567890)"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Users className="w-4 h-4 inline mr-1" />
//                   Guest Count <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   name="guestCount"
//                   value={reservationData.guestCount}
//                   onChange={handleReservationInputChange}
//                   required
//                   min="1"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter number of guests"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Calendar className="w-4 h-4 inline mr-1" />
//                   Reservation Date <span className="text-red-500">*</span>
//                 </label>
//                 <DatePicker
//                   selected={reservationData.reservationDate}
//                   onChange={handleDateChange}
//                   dateFormat="MMMM d, yyyy"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholderText="Select date"
//                   minDate={new Date()}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   <Clock className="w-4 h-4 inline mr-1" />
//                   Time Slot <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="timeSlot"
//                   value={reservationData.timeSlot}
//                   onChange={handleReservationInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Select Time Slot</option>
//                   {reservationData.tableId &&
//                     getAvailableTimeSlots(reservationData.tableId).map(
//                       (slot) => (
//                         <option key={`slot-${slot}`} value={slot}>
//                           {slot}
//                         </option>
//                       )
//                     )}
//                 </select>
//               </div>
//               <div className="flex justify-end pt-4 border-t mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowReservationForm(false)}
//                   className="mr-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 disabled:opacity-50"
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white disabled:opacity-50"
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "Confirm Reservation"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TableReservation;

import React, { useState, useEffect } from "react";
import {
  Filter,
  MapPin,
  Clock,
  User,
  Phone,
  X,
  Calendar,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

// Hotel API instance - using same endpoint as Branch Management
const jagaliKootaApi = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
});

const TableReservation = () => {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [filterTimeSlot, setFilterTimeSlot] = useState("");
  const [reservationData, setReservationData] = useState({
    customerName: "",
    customerPhone: "",
    guestCount: 1,
    reservationDate: new Date(),
    timeSlot: "",
    tableId: null,
    tableNumber: "",
    branchId: "",
  });
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]); // Jagali Koota tables
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]); // Jagali Koota branches

  // Scroll states for both tables
  const [availableTablesScroll, setAvailableTablesScroll] = useState(0);
  const [reservationsScroll, setReservationsScroll] = useState(0);

  // Time slot options (same as backend)
  const timeSlots = [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
    "07:00 PM - 08:00 PM",
    "08:00 PM - 09:00 PM",
    "09:00 PM - 10:00 PM",
    "10:00 PM - 11:00 PM",
  ];

  // Fetch branches from Jagali Koota
  const fetchBranches = async () => {
    try {
      const response = await jagaliKootaApi.get("/branch");
      setBranches(response.data);
    } catch (err) {
      console.error("Error fetching Jagali Koota branches:", err);
    }
  };

  // Fetch tables from Jagali Koota
  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await jagaliKootaApi.get("/table");
      setTables(response.data);
    } catch (err) {
      console.error("Error fetching Jagali Koota tables:", err);
      setError("Failed to load tables from Jagali Koota. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reservations from Jagali Koota
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await jagaliKootaApi.get("/reservation");
      setReservations(response.data);
    } catch (err) {
      console.error("Error fetching reservations:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        "Failed to load reservations from Jagali Koota. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchBranches();
    fetchTables();
  }, []);

  // Get branch name by ID
  const getBranchNameById = (branchId) => {
    if (!branchId) return "Unknown";
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.name : "Unknown";
  };

  // Get branch name for a table
  const getTableBranchName = (table) => {
    if (table.branchId?.name) return table.branchId.name;
    if (table.branchId) return getBranchNameById(table.branchId);
    return "Unknown";
  };

  // Get branch name for a reservation
  const getReservationBranchName = (reservation) => {
    if (reservation.tableId?.branchId?.name)
      return reservation.tableId.branchId.name;
    if (reservation.tableId?.branchId)
      return getBranchNameById(reservation.tableId.branchId);
    return "Unknown";
  };

  // Branch options: show ALL branches from Branch Management
  const branchOptions = [
    { id: "all", name: "All Branches" },
    ...branches.map((b) => ({ id: b._id, name: b.name })),
  ];

  // Check if a time slot is available for a table
  const isTimeSlotAvailable = (tableId, date, timeSlot) => {
    const dateString = date.toISOString().split("T")[0];
    return !reservations.some(
      (res) =>
        res.tableId?._id === tableId &&
        new Date(res.reservationDate).toISOString().split("T")[0] ===
          dateString &&
        res.timeSlot === timeSlot &&
        res.status !== "cancelled"
    );
  };

  // Filter available tables (using Jagali Koota tables directly)
  const availableTables = tables.filter((table) => {
    const isAvailable = table.status === "available";
    const tableBranchId = table.branchId?._id || table.branchId;
    const matchesBranch =
      selectedBranch === "all" || tableBranchId === selectedBranch;

    if (!filterDate || !filterTimeSlot) {
      return isAvailable && matchesBranch;
    }

    return (
      isAvailable &&
      matchesBranch &&
      isTimeSlotAvailable(table._id, filterDate, filterTimeSlot)
    );
  });

  // Filter reservations based on branch selection
  const filteredReservations = reservations.filter((reservation) => {
    if (reservation.status === "cancelled") return false;

    if (selectedBranch === "all") return true;

    const reservationBranchId =
      reservation.tableId?.branchId?._id || reservation.tableId?.branchId;
    return reservationBranchId === selectedBranch;
  });

  // Get available time slots for a table
  const getAvailableTimeSlots = (tableId) => {
    const dateString = reservationData.reservationDate
      .toISOString()
      .split("T")[0];
    const tableReservations = reservations.filter(
      (res) =>
        res.tableId?._id === tableId &&
        new Date(res.reservationDate).toISOString().split("T")[0] ===
          dateString &&
        res.status !== "cancelled"
    );

    return timeSlots.filter(
      (slot) => !tableReservations.some((res) => res.timeSlot === slot)
    );
  };

  const validateAlphabets = (value) => {
    return value.replace(/[^A-Za-z\s]/g, "");
  };

  // Handle reservation form input changes
  const handleReservationInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Apply alphabet-only validation for customerName field
    if (name === "customerName") {
      newValue = validateAlphabets(value);
    }

    setReservationData((prev) => ({
      ...prev,
      [name]: name === "guestCount" ? parseInt(value) || 1 : newValue,
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setReservationData((prev) => ({
      ...prev,
      reservationDate: date,
      timeSlot: "",
    }));
  };

  // Handle filter date change
  const handleFilterDateChange = (date) => {
    setFilterDate(date);
    setFilterTimeSlot("");
  };

  // Handle branch filter change
  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    setFilterTimeSlot("");
    // Reset scroll when branch changes
    setAvailableTablesScroll(0);
    setReservationsScroll(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedBranch("all");
    setFilterDate(new Date());
    setFilterTimeSlot("");
    // Reset scroll when filters are cleared
    setAvailableTablesScroll(0);
    setReservationsScroll(0);
  };

  // Get current branch name for display
  const getCurrentBranchName = () => {
    if (selectedBranch === "all") return "All Jagali Koota Branches";
    const branch = branchOptions.find((b) => b.id === selectedBranch);
    return branch ? branch.name : "All Jagali Koota Branches";
  };

  // Open reservation form
  const openReservationForm = (table) => {
    console.log("Table selected for reservation:", table);
    if (!table?._id) {
      setError("Invalid table selected");
      console.error("Invalid table:", table);
      return;
    }
    const availableSlots = getAvailableTimeSlots(table._id);
    setReservationData({
      customerName: "",
      customerPhone: "",
      guestCount: 1,
      reservationDate: filterDate || new Date(),
      timeSlot: availableSlots[0] || "",
      tableId: table._id,
      tableNumber: table.number || "",
      branchId: table.branchId?._id || table.branchId || "",
    });
    setShowReservationForm(true);
    setError(null);
  };

  // Handle reservation submission
  const handleReserve = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate phone number
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(reservationData.customerPhone)) {
      setError("Please enter a valid phone number (10-15 digits)");
      setLoading(false);
      return;
    }

    // Validate tableId
    if (!reservationData.tableId) {
      setError("No table selected for reservation");
      setLoading(false);
      return;
    }

    // Validate guest count against table capacity (if capacity exists)
    const table = tables.find((t) => t._id === reservationData.tableId);
    if (!table) {
      setError("Selected table not found");
      setLoading(false);
      return;
    }
    if (table.capacity && reservationData.guestCount > table.capacity) {
      setError(`Guest count exceeds table capacity (${table.capacity})`);
      setLoading(false);
      return;
    }

    // Validate required fields
    if (
      !reservationData.customerName ||
      !reservationData.customerPhone ||
      !reservationData.guestCount ||
      !reservationData.timeSlot ||
      !reservationData.reservationDate
    ) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    const payload = {
      tableId: reservationData.tableId,
      customerName: reservationData.customerName,
      customerPhone: reservationData.customerPhone,
      customerEmail: "", // Add if needed
      guestCount: reservationData.guestCount,
      reservationDate: reservationData.reservationDate
        .toISOString()
        .split("T")[0],
      timeSlot: reservationData.timeSlot,
      status: "confirmed",
    };

    try {
      console.log("Sending reservation payload:", payload);
      const response = await jagaliKootaApi.post("/reservation", payload);

      setReservations((prev) => [...prev, response.data]);
      alert(
        `Reservation confirmed for ${reservationData.customerName} for ${
          reservationData.timeSlot
        } on ${reservationData.reservationDate.toLocaleDateString()}`
      );

      setReservationData({
        customerName: "",
        customerPhone: "",
        guestCount: 1,
        reservationDate: new Date(),
        timeSlot: "",
        tableId: null,
        tableNumber: "",
        branchId: "",
      });
      setShowReservationForm(false);
      await fetchReservations();
      await fetchTables(); // Refresh tables to update status
    } catch (error) {
      console.error("Error creating reservation:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        payload,
      });
      setError(
        error.response?.status === 404
          ? "Reservation endpoint not found. Please check if the Jagali Koota server is running."
          : error.response?.data?.error || "Error creating reservation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel a reservation
  const cancelReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const reservation = reservations.find((res) => res._id === reservationId);
      console.log("Reservation to cancel:", reservation);
      if (!reservation) {
        throw new Error("Reservation not found");
      }

      const response = await jagaliKootaApi.put(
        `/reservation/${reservationId}/cancel`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        setReservations((prev) =>
          prev.map((res) =>
            res._id === reservationId ? { ...res, status: "cancelled" } : res
          )
        );
        alert("Reservation cancelled successfully");
        await fetchReservations();
        await fetchTables(); // Sync table status
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error cancelling reservation:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      setError(
        error.response?.data?.error ||
          error.message ||
          "Error cancelling reservation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Scroll functions for available tables
  const scrollAvailableTables = (direction) => {
    const scrollAmount = 300;
    const newScroll =
      direction === "right"
        ? availableTablesScroll + scrollAmount
        : Math.max(0, availableTablesScroll - scrollAmount);
    setAvailableTablesScroll(newScroll);
  };

  // Scroll functions for reservations table
  const scrollReservations = (direction) => {
    const scrollAmount = 300;
    const newScroll =
      direction === "right"
        ? reservationsScroll + scrollAmount
        : Math.max(0, reservationsScroll - scrollAmount);
    setReservationsScroll(newScroll);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Jagali Koota Table Reservation System
          </h1>
          <p className="text-gray-600 mt-1">
            Currently viewing:{" "}
            <span className="font-semibold">{getCurrentBranchName()}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Branch Quick Filter */}
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="appearance-none bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              disabled={loading}
            >
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <Building className="w-4 h-4 absolute right-2 top-3 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center"
            disabled={loading}
          >
            <Filter className="w-5 h-5 mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md border border-red-300">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-md">
          Loading data from Jagali Koota...
        </div>
      )}

      {/* Filter Summary */}
      {(selectedBranch !== "all" || filterTimeSlot) && (
        <div className="bg-blue-50 p-3 rounded-lg mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-800">
              Active Filters:
            </span>
            {selectedBranch !== "all" && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Branch: {getCurrentBranchName()}
                <button
                  onClick={() => setSelectedBranch("all")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterTimeSlot && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Time: {filterTimeSlot}
                <button
                  onClick={() => setFilterTimeSlot("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Advanced Filter Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <DatePicker
                selected={filterDate}
                onChange={handleFilterDateChange}
                dateFormat="MMMM d, yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select date"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Time Slot
              </label>
              <select
                value={filterTimeSlot}
                onChange={(e) => setFilterTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map((slot) => (
                  <option key={`filter-${slot}`} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Available Tables Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Available Tables{" "}
            {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {availableTables.length} table(s) found
            </span>
            {/* Scroll Controls for Available Tables */}
            <div className="flex space-x-2">
              <button
                onClick={() => scrollAvailableTables("left")}
                disabled={availableTablesScroll === 0 || loading}
                className={`p-1 rounded ${
                  availableTablesScroll === 0
                    ? "text-gray-400"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollAvailableTables("right")}
                className="p-1 rounded text-gray-600 hover:bg-gray-200"
                disabled={loading}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">
            Loading tables from Jagali Koota...
          </div>
        ) : availableTables.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              ></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No available tables
            </h3>
            <p className="mt-1 text-gray-500">
              {selectedBranch === "all" && !filterTimeSlot
                ? "There are currently no tables available for reservation in Jagali Koota."
                : `No available tables found for ${getCurrentBranchName()} on ${
                    filterDate?.toLocaleDateString() || ""
                  } at ${filterTimeSlot || ""}.`}
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="overflow-x-auto transition-all duration-300"
              style={{ scrollBehavior: "smooth" }}
            >
              <table
                className="min-w-full divide-y divide-gray-200"
                style={{
                  transform: `translateX(-${availableTablesScroll}px)`,
                }}
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Sl No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Table Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableTables.map((table, index) => (
                    <tr key={table._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{table.number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getTableBranchName(table)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {table.capacity || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {table.image ? (
                          <img
                            src={table.image}
                            alt={`Table ${table.number}`}
                            className="h-20 w-20 rounded object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openReservationForm(table)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition duration-200"
                          disabled={loading}
                        >
                          Reserve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reservations Table Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Current Reservations{" "}
            {selectedBranch !== "all" && `at ${getCurrentBranchName()}`}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredReservations.length} reservation(s) found
            </span>
            {/* Scroll Controls for Reservations */}
            <div className="flex space-x-2">
              <button
                onClick={() => scrollReservations("left")}
                disabled={reservationsScroll === 0 || loading}
                className={`p-1 rounded ${
                  reservationsScroll === 0
                    ? "text-gray-400"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollReservations("right")}
                className="p-1 rounded text-gray-600 hover:bg-gray-200"
                disabled={loading}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">
            Loading reservations from Jagali Koota...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No active reservations
            </h3>
            <p className="mt-1 text-gray-500">
              {selectedBranch === "all"
                ? "Active reservations will appear here once they are created in Jagali Koota."
                : `No active reservations found for ${getCurrentBranchName()}.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="overflow-x-auto transition-all duration-300"
              style={{ scrollBehavior: "smooth" }}
            >
              <table
                className="min-w-full divide-y divide-gray-200"
                style={{ transform: `translateX(-${reservationsScroll}px)` }}
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Sl No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Time Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation, index) => (
                    <tr key={reservation._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{index + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          #{reservation.tableId?.number || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getReservationBranchName(reservation)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(reservation.reservationDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.guestCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "reserved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => cancelReservation(reservation._id)}
                          className={`px-3 py-1 rounded-lg font-medium transition 
    ${
      reservation.status === "cancelled"
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-red-500 hover:bg-red-600 text-white"
    }`}
                          disabled={
                            loading || reservation.status === "cancelled"
                          }
                        >
                          {reservation.status === "cancelled"
                            ? "Cancelled"
                            : "Cancel"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && reservationData.tableId && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm sm:backdrop-blur-md flex items-center justify-center z-50">
          {/* Modal box */}
          <div className="relative bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200/60">
              <h3 className="text-xl font-semibold text-gray-900">
                Make Reservation for Table #{reservationData.tableNumber}
              </h3>
              <button
                onClick={() => setShowReservationForm(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleReserve} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-1" />
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={reservationData.customerName}
                  onChange={handleReservationInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={reservationData.customerPhone}
                  onChange={handleReservationInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number (e.g., +1234567890)"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Guest Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={reservationData.guestCount}
                  onChange={handleReservationInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of guests"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Reservation Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={reservationData.reservationDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Select date"
                  minDate={new Date()}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  name="timeSlot"
                  value={reservationData.timeSlot}
                  onChange={handleReservationInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Time Slot</option>
                  {reservationData.tableId &&
                    getAvailableTimeSlots(reservationData.tableId).map(
                      (slot) => (
                        <option key={`slot-${slot}`} value={slot}>
                          {slot}
                        </option>
                      )
                    )}
                </select>
              </div>
              <div className="flex justify-end pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setShowReservationForm(false)}
                  className="mr-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservation;
