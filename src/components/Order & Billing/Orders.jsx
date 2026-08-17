// import { useState, useEffect } from "react";

// import {
//   Search,
//   Download,
//   X,
//   Check,
//   AlertCircle,
//   Phone,
//   MapPin,
//   FileText,
//   CreditCard,
//   Truck,
//   IndianRupee,
//   Loader,
//   Filter,
//   Eye,
//   Edit,
//   Calendar,
//   User,
//   Building,
//   Package,
//   DollarSign,
// } from "lucide-react";
// import axios from "axios";

// // Create axios instance
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     customer: "",
//     branch: "",
//     status: "",
//     items: 0,
//     amount: "",
//     paymentMethod: "",
//     paymentStatus: "",
//     deliveryOption: "",
//     deliveryAddress: "",
//     specialInstructions: "",
//     phone: "",
//     email: "",
//   });
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [branchFilter, setBranchFilter] = useState("all");
//   const [paymentFilter, setPaymentFilter] = useState("all");
//   const [itemFilter, setItemFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalOrders, setTotalOrders] = useState(0);
//   const [allItems, setAllItems] = useState([]);
//   const ordersPerPage = 7;

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [currentPage, statusFilter, branchFilter, paymentFilter, searchTerm]);

//   const fetchBranches = async () => {
//     try {
//       const response = await api.get("/branch");
//       setBranches(response.data);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       setError("Failed to load branches. Some filter options may not be available.");
//     }
//   };

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = {
//         page: currentPage,
//         limit: ordersPerPage,
//       };

//       // Apply filters
//       if (statusFilter !== "all") params.status = statusFilter;
//       if (branchFilter !== "all") params.branchId = branchFilter;
//       if (paymentFilter !== "all") params.paymentMethod = paymentFilter;
//       if (searchTerm.trim()) params.search = searchTerm.trim();

//       console.log("Fetching orders with params:", params);

//       const response = await api.get("/order", { params });

//       // Handle case where response structure might be different
//       const ordersData = response.data.data || response.data.orders || response.data || [];
//       const paginationData = response.data.pagination || {
//         totalPages: 1,
//         total: ordersData.length
//       };

//       const formattedOrders = ordersData.map((order) => ({
//         id: order._id,
//         orderNumber: order.orderNumber || order.orderId || `ORD-${order._id.slice(-6)}`,
//         customer: order.name || order.customerName || "Unknown Customer",
//         date: new Date(order.createdAt || order.date).toLocaleString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         branch: order.branchId?.name || order.branch || "Unknown Branch",
//         branchId: order.branchId?._id || order.branchId,
//         items: order.items || [],
//         itemsCount: order.items?.length || 0,
//         amount: `?${order.total?.toFixed(2) || order.amount?.toFixed(2) || "0.00"}`,
//         status: order.status || "pending",
//         paymentMethod: order.paymentMethod || "cash",
//         paymentStatus: order.paymentStatus || "pending",
//         deliveryOption: order.deliveryOption || "delivery",
//         deliveryAddress: order.deliveryAddress || "",
//         specialInstructions: order.specialInstructions || "",
//         phone: order.phone || "",
//         email: order.email || "",
//         cancellationReason: order.cancellationReason || "",
//         subtotal: order.subtotal || 0,
//         tax: order.tax || 0,
//         deliveryFee: order.deliveryFee || 0,
//         discount: order.discount || 0,
//         originalOrder: order,
//       }));

//       setOrders(formattedOrders);
//       setTotalPages(paginationData.totalPages || 1);
//       setTotalOrders(paginationData.total || formattedOrders.length);

//     // Extract all unique items for filtering
//     const itemsList = [];
//     formattedOrders.forEach(order => {
//       if (order.items && order.items.length > 0) {
//         order.items.forEach(item => {
//           if (item.name && !itemsList.includes(item.name)) {
//             itemsList.push(item.name);
//           }
//         });
//       }
//     });
//     setAllItems(itemsList.sort());
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     setError("Failed to load orders. Please refresh the page and try again.");
//   } finally {
//     setLoading(false);
//   }
// };

//   // Filter orders by item name (frontend filter)
//   const filteredOrders = orders.filter(order => {
//     if (!itemFilter) return true;

//     if (order.items && order.items.length > 0) {
//       return order.items.some(item =>
//         item.name?.toLowerCase().includes(itemFilter.toLowerCase())
//       );
//     }
//     return false;
//   });

//   const handleViewOrder = (order) => {
//     setSelectedOrder(order);
//     setViewModalOpen(true);
//   };

//   const handleEditOrder = (order) => {
//     setSelectedOrder(order);
//     setEditFormData({
//       customer: order.customer,
//       branch: order.branchId || "",
//       status: order.status,
//       items: order.items,
//       amount: order.amount,
//       paymentMethod: order.paymentMethod || "cash",
//       paymentStatus: order.paymentStatus || "pending",
//       deliveryOption: order.deliveryOption || "delivery",
//       deliveryAddress: order.deliveryAddress || "",
//       specialInstructions: order.specialInstructions || "",
//       phone: order.phone || "",
//       email: order.email || "",
//     });
//     setEditModalOpen(true);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({ ...editFormData, [name]: value });
//   };

//   const handleSaveChanges = async () => {
//     setIsSubmitting(true);
//     try {
//       await api.put(`/order/${selectedOrder.id}/status`, {
//         status: editFormData.status,
//         cancellationReason: editFormData.status === "cancelled" ? "Updated by admin" : null,
//       });
//       await api.put(`/order/${selectedOrder.id}/payment-status`, {
//         paymentStatus: editFormData.paymentStatus,
//       });
//       await fetchOrders();
//       setEditModalOpen(false);
//       setSuccessMessage(`Order ${selectedOrder.orderNumber} updated successfully`);
//       setTimeout(() => setSuccessMessage(""), 3000);
//     } catch (error) {
//       console.error("Error updating order:", error);
//       alert("Failed to update order. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const closeViewModal = () => {
//     setViewModalOpen(false);
//     setSelectedOrder(null);
//   };

//   const closeEditModal = () => {
//     setEditModalOpen(false);
//     setSelectedOrder(null);
//   };

//   const handleFilterChange = (type, value) => {
//     if (type === "status") setStatusFilter(value);
//     else if (type === "branch") setBranchFilter(value);
//     else if (type === "payment") setPaymentFilter(value);
//     else if (type === "item") setItemFilter(value);
//     setCurrentPage(1);
//   };

//   const getPaymentMethodIcon = (method) => {
//     const methodLower = method?.toLowerCase();
//     switch (methodLower) {
//       case "card":
//       case "credit card":
//       case "debit card":
//         return <CreditCard size={16} />;
//       case "upi":
//       case "upi payment":
//         return <IndianRupee size={16} />;
//       case "cash":
//       default:
//         return <IndianRupee size={16} />;
//     }
//   };

//   const getPaymentMethodDisplay = (method) => {
//     if (!method) return "Cash";

//     const methodLower = method.toLowerCase();
//     if (methodLower === "card") return "Card";
//     if (methodLower === "upi") return "UPI";
//     if (methodLower === "cash") return "Cash";

//     return method.charAt(0).toUpperCase() + method.slice(1);
//   };

//   const exportOrders = () => {
//     let csv = "Order ID,Customer,Date,Branch,Items,Amount,Payment Method,Status,Payment Status\n";
//     orders.forEach((order) => {
//       const itemsList = order.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || '';
//       csv += `${order.orderNumber},${order.customer},"${order.date}","${order.branch}","${itemsList}",${order.amount},${order.paymentMethod},${order.status},${order.paymentStatus || "pending"}\n`;
//     });
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("hidden", "");
//     a.setAttribute("href", url);
//     a.setAttribute("download", `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const renderItemsPreview = (items) => {
//     if (!items || items.length === 0) return "No items";

//     if (items.length === 1) {
//       return `${items[0].name} (x${items[0].quantity})`;
//     }

//     return `${items[0].name} (x${items[0].quantity}) +${items.length - 1} more`;
//   };

//   const getStatusColor = (status) => {
//     const statusLower = status?.toLowerCase();
//     switch (statusLower) {
//       case "delivered":
//         return "bg-green-100 text-green-800";
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "confirmed":
//       case "preparing":
//       case "out for delivery":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPaymentStatusColor = (paymentStatus) => {
//     const statusLower = paymentStatus?.toLowerCase();
//     switch (statusLower) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       case "refunded":
//         return "bg-purple-100 text-purple-800";
//       case "pending":
//       default:
//         return "bg-yellow-100 text-yellow-800";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#FCFCFC]">
//       <div className="container mx-auto p-6">
//       {/* Success Message */}
//       {successMessage && (
//           <div className="flex items-center bg-green-100 text-green-800 p-4 rounded-xl mb-6 shadow-lg border border-green-200">
//             <Check size={20} className="mr-3" />
//             <span className="font-medium">{successMessage}</span>
//             <button className="ml-auto hover:bg-green-200 p-1 rounded-full transition" onClick={() => setSuccessMessage("")}>
//             <X size={16} />
//           </button>
//         </div>
//       )}

//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
//               <p className="text-gray-600">Manage and track all restaurant orders</p>
//             </div>
//         <div className="flex items-center gap-4">
//               <div className="bg-blue-50 px-4 py-2 rounded-xl">
//                 <span className="text-blue-700 font-semibold">Total: {totalOrders} orders</span>
//               </div>
//           <button
//                 className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//             onClick={exportOrders}
//           >
//                 <Download size={18} className="mr-2" />
//                 <span className="font-medium">Export CSV</span>
//           </button>
//             </div>
//         </div>
//       </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//           <div className="flex flex-col lg:flex-row gap-4">
//             {/* Search Bar */}
//         <div className="relative flex-1">
//               <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//                 placeholder="Search orders by ID, customer name, phone number..."
//                 className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//             {/* Filter Buttons */}
//             <div className="flex flex-wrap gap-3">
//           <select
//                 className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//             value={statusFilter}
//             onChange={(e) => handleFilterChange("status", e.target.value)}
//           >
//             <option value="all">All Status</option>
//             <option value="pending">Pending</option>
//             <option value="confirmed">Confirmed</option>
//             <option value="preparing">Preparing</option>
//             <option value="out for delivery">Out for Delivery</option>
//             <option value="delivered">Delivered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>

//           <select
//                 className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//             value={branchFilter}
//             onChange={(e) => handleFilterChange("branch", e.target.value)}
//           >
//             <option value="all">All Branches</option>
//             {branches.map((branch) => (
//               <option key={branch._id} value={branch._id}>
//                 {branch.name}
//               </option>
//             ))}
//           </select>

//           <select
//                 className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//             value={paymentFilter}
//             onChange={(e) => handleFilterChange("payment", e.target.value)}
//           >
//             <option value="all">All Payment Methods</option>
//             <option value="cash">Cash</option>
//             <option value="card">Card</option>
//             <option value="upi">UPI</option>
//           </select>

//           <select
//                 className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
//             value={itemFilter}
//             onChange={(e) => handleFilterChange("item", e.target.value)}
//           >
//             <option value="">All Items</option>
//             {allItems.map((item) => (
//               <option key={item} value={item}>
//                 {item}
//               </option>
//             ))}
//           </select>
//             </div>
//         </div>
//       </div>

//         {/* Error Message */}
//       {error && (
//           <div className="flex items-center bg-red-100 text-red-800 p-4 rounded-xl mb-6 shadow-lg border border-red-200">
//             <AlertCircle size={20} className="mr-3" />
//             <span className="font-medium">{error}</span>
//         </div>
//       )}

//         {/* Orders Table */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         {loading ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <Loader size={32} className="animate-spin text-blue-500 mb-4" />
//               <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//                   <tr>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <FileText size={16} />
//                         Order ID
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <User size={16} />
//                         Customer
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <Calendar size={16} />
//                         Date
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <Building size={16} />
//                         Branch
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <Package size={16} />
//                         Items
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <DollarSign size={16} />
//                         Amount
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
//                       <div className="flex items-center gap-2">
//                         <CreditCard size={16} />
//                         Payment
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Payment Status</th>
//                     <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//                 <tbody className="divide-y divide-gray-200">
//                 {filteredOrders.length > 0 ? (
//                     filteredOrders.map((order, index) => (
//                       <tr key={order.id} className={`hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                         <td className="px-6 py-4">
//                           <div className="font-semibold text-gray-900">{order.orderNumber}</div>
//                       </td>
//                         <td className="px-6 py-4">
//                           <div className="text-gray-900 font-medium">{order.customer}</div>
//                           {order.phone && (
//                             <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
//                               <Phone size={12} />
//                               {order.phone}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-sm text-gray-600">{order.date}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-gray-900">{order.branch}</div>
//                         </td>
//                         <td className="px-6 py-4" title={order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ')}>
//                           <div className="text-sm text-gray-600">{renderItemsPreview(order.items)}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="font-semibold text-gray-900">{order.amount}</div>
//                         </td>
//                         <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           {getPaymentMethodIcon(order.paymentMethod)}
//                             <span className="text-sm font-medium">{getPaymentMethodDisplay(order.paymentMethod)}</span>
//                         </div>
//                       </td>
//                         <td className="px-6 py-4">
//                         <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
//                         >
//                           {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown"}
//                         </span>
//                       </td>
//                         <td className="px-6 py-4">
//                         <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}
//                         >
//                           {order.paymentStatus
//                             ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
//                             : "Pending"}
//                         </span>
//                       </td>
//                         <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           <button
//                               className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
//                             onClick={() => handleViewOrder(order)}
//                           >
//                               <Eye size={14} />
//                             View
//                           </button>
//                           <button
//                               className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 text-sm font-medium"
//                             onClick={() => handleEditOrder(order)}
//                           >
//                               <Edit size={14} />
//                             Edit
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                       <td colSpan="10" className="text-center py-16">
//                         <div className="flex flex-col items-center gap-4">
//                           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//                             <Package size={24} className="text-gray-400" />
//                           </div>
//                           <div>
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
//                             <p className="text-gray-500">No orders match your current search and filter criteria.</p>
//                           </div>
//                         </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//         {/* Pagination */}
//       {totalPages > 1 && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="text-sm text-gray-600">
//                 Showing page {currentPage} of {totalPages} ({totalOrders} total orders)
//               </div>

//               <div className="flex items-center gap-2">
//           <button
//                   className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1 || loading}
//           >
//             Previous
//           </button>

//                 <div className="flex items-center gap-1">
//             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//               let pageNum;
//               if (totalPages <= 5) {
//                 pageNum = i + 1;
//               } else if (currentPage <= 3) {
//                 pageNum = i + 1;
//               } else if (currentPage >= totalPages - 2) {
//                 pageNum = totalPages - 4 + i;
//               } else {
//                 pageNum = currentPage - 2 + i;
//               }
//               return (
//                 <button
//                   key={pageNum}
//                         className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
//                           currentPage === pageNum
//                             ? "bg-blue-600 text-white shadow-lg"
//                             : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
//                     }`}
//                   onClick={() => setCurrentPage(pageNum)}
//                   disabled={loading}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//                     <span className="px-2 text-gray-500">...</span>
//             )}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <button
//                       className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
//                         currentPage === totalPages
//                           ? "bg-blue-600 text-white shadow-lg"
//                           : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
//                   }`}
//                 onClick={() => setCurrentPage(totalPages)}
//                 disabled={loading}
//               >
//                 {totalPages}
//               </button>
//             )}
//           </div>

//           <button
//                   className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages || loading}
//           >
//             Next
//           </button>
//               </div>
//             </div>
//         </div>
//       )}

//       {/* View Order Modal */}
//       {viewModalOpen && selectedOrder && (
//         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Order Details - #{selectedOrder.orderNumber}
//               </h3>
//               <button className="text-gray-600 hover:text-gray-800" onClick={closeViewModal}>
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <p className="font-medium text-gray-700">Customer</p>
//                   <p className="text-gray-600">{selectedOrder.customer}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Contact</p>
//                   <div className="flex items-center gap-2">
//                     <Phone size={16} className="text-gray-600" />
//                     <span>{selectedOrder.phone || "N/A"}</span>
//                   </div>
//                   <div className="flex items-center gap-2 mt-1">
//                     <FileText size={16} className="text-gray-600" />
//                     <span>{selectedOrder.email || "N/A"}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Date</p>
//                   <p className="text-gray-600">{selectedOrder.date}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Branch</p>
//                   <p className="text-gray-600">{selectedOrder.branch}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Total Items</p>
//                   <p className="text-gray-600">{selectedOrder.itemsCount}</p>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Status</p>
//                   <span
//                     className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
//                   >
//                     {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
//                   </span>
//                 </div>
//                 {selectedOrder.status === "cancelled" && selectedOrder.cancellationReason && (
//                   <div className="md:col-span-2">
//                     <p className="font-medium text-gray-700">Cancellation Reason</p>
//                     <p className="text-gray-600">{selectedOrder.cancellationReason}</p>
//                   </div>
//                 )}
//                 <div>
//                   <p className="font-medium text-gray-700">Payment Method</p>
//                   <div className="flex items-center gap-2">
//                     {getPaymentMethodIcon(selectedOrder.paymentMethod)}
//                     <span>{getPaymentMethodDisplay(selectedOrder.paymentMethod)}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Payment Status</p>
//                   <span
//                     className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
//                   >
//                     {selectedOrder.paymentStatus
//                       ? selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)
//                       : "Pending"}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-700">Delivery Option</p>
//                   <div className="flex items-center gap-2">
//                     <Truck size={16} className="text-gray-600" />
//                     <span>
//                       {selectedOrder.deliveryOption
//                         ? selectedOrder.deliveryOption.charAt(0).toUpperCase() + selectedOrder.deliveryOption.slice(1)
//                         : "Delivery"}
//                     </span>
//                   </div>
//                 </div>
//                 {selectedOrder.deliveryOption === "delivery" && selectedOrder.deliveryAddress && (
//                   <div className="md:col-span-2">
//                     <p className="font-medium text-gray-700">Delivery Address</p>
//                     <div className="flex items-start gap-2">
//                       <MapPin size={16} className="text-gray-600 mt-1" />
//                       <span>{selectedOrder.deliveryAddress}</span>
//                     </div>
//                   </div>
//                 )}
//                 {selectedOrder.specialInstructions && (
//                   <div className="md:col-span-2">
//                     <p className="font-medium text-gray-700">Special Instructions</p>
//                     <p className="text-gray-600">{selectedOrder.specialInstructions}</p>
//                   </div>
//                 )}
//               </div>

//               <div className="mb-6">
//                 <h4 className="text-lg font-semibold text-gray-800 mb-2">Price Details</h4>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <table className="w-full">
//                     <tbody>
//                       <tr className="border-b">
//                         <td className="py-2 text-gray-700">Subtotal</td>
//                         <td className="py-2 text-right">?{selectedOrder.subtotal?.toFixed(2) || "0.00"}</td>
//                       </tr>
//                       {selectedOrder.discount > 0 && (
//                         <tr className="border-b">
//                           <td className="py-2 text-gray-700">Discount</td>
//                           <td className="py-2 text-right text-green-600">
//                             -?{selectedOrder.discount?.toFixed(2) || "0.00"}
//                           </td>
//                         </tr>
//                       )}
//                       {selectedOrder.tax > 0 && (
//                         <tr className="border-b">
//                           <td className="py-2 text-gray-700">Tax</td>
//                           <td className="py-2 text-right">?{selectedOrder.tax?.toFixed(2) || "0.00"}</td>
//                         </tr>
//                       )}
//                       {selectedOrder.deliveryOption === "delivery" && selectedOrder.deliveryFee > 0 && (
//                         <tr className="border-b">
//                           <td className="py-2 text-gray-700">Delivery Fee</td>
//                           <td className="py-2 text-right">?{selectedOrder.deliveryFee?.toFixed(2) || "0.00"}</td>
//                         </tr>
//                       )}
//                       <tr className="font-semibold">
//                         <td className="py-2 text-gray-800">Total Amount</td>
//                         <td className="py-2 text-right">{selectedOrder.amount}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h4>
//                 <div className="bg-gray-50 rounded-lg overflow-hidden">
//                   <table className="w-full">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Item</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Price</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.items?.length > 0 ? (
//                         selectedOrder.items.map((item, index) => (
//                           <tr key={index} className="border-b">
//                             <td className="px-4 py-3">{item.name}</td>
//                             <td className="px-4 py-3">{item.quantity}</td>
//                             <td className="px-4 py-3">?{item.price?.toFixed(2) || "0.00"}</td>
//                             <td className="px-4 py-3">?{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" className="text-center py-6 text-gray-600">
//                             No items available
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end gap-4 p-4 border-t">
//               <button
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
//                 onClick={closeViewModal}
//               >
//                 Close
//               </button>
//               <button
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 onClick={() => {
//                   closeViewModal();
//                   handleEditOrder(selectedOrder);
//                 }}
//               >
//                 Edit Order
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Order Modal */}
//       {editModalOpen && selectedOrder && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="text-lg font-semibold text-gray-800">
//                 Edit Order - #{selectedOrder.orderNumber}
//               </h3>
//               <button className="text-gray-600 hover:text-gray-800" onClick={closeEditModal}>
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
//                   <input
//                     type="text"
//                     name="customer"
//                     value={editFormData.customer}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
//                     disabled
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input
//                     type="text"
//                     name="phone"
//                     value={editFormData.phone}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
//                     disabled
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={editFormData.email}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
//                     disabled
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
//                   <select
//                     name="branch"
//                     value={editFormData.branch}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
//                     disabled
//                   >
//                     <option value="">Select Branch</option>
//                     {branches.map((branch) => (
//                       <option key={branch._id} value={branch._id}>
//                         {branch.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                   <select
//                     name="status"
//                     value={editFormData.status}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="confirmed">Confirmed</option>
//                     <option value="preparing">Preparing</option>
//                     <option value="out for delivery">Out for Delivery</option>
//                     <option value="delivered">Delivered</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
//                   <select
//                     name="paymentStatus"
//                     value={editFormData.paymentStatus || "pending"}
//                     onChange={handleInputChange}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="completed">Completed</option>
//                     <option value="failed">Failed</option>
//                     <option value="refunded">Refunded</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="text-lg font-semibold text-gray-800">Order Items</h4>
//                   <div className="flex items-center gap-2 text-yellow-600">
//                     <AlertCircle size={16} />
//                     <span className="text-sm">Only order status and payment status can be updated</span>
//                   </div>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg overflow-hidden">
//                   <table className="w-full">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Item</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Price</th>
//                         <th className="px-4 py-3 text-left text-gray-600 font-semibold">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.items?.length > 0 ? (
//                         selectedOrder.items.map((item, index) => (
//                           <tr key={index} className="border-b">
//                             <td className="px-4 py-3">{item.name}</td>
//                             <td className="px-4 py-3">{item.quantity}</td>
//                             <td className="px-4 py-3">?{item.price?.toFixed(2) || "0.00"}</td>
//                             <td className="px-4 py-3">?{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" className="text-center py-6 text-gray-600">
//                             No items available
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end gap-4 p-4 border-t">
//               <button
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
//                 onClick={closeEditModal}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//                 onClick={handleSaveChanges}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader size={16} className="animate-spin mr-2" />
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       </div>
//     </div>
//   );
// };

// export default Orders;

//***  */ the new one
import { useState, useEffect } from "react";
import {
  Search,
  Download,
  X,
  Check,
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Truck,
  IndianRupee,
  Loader,
  Eye,
  Edit,
  Calendar,
  User,
  Building,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

// Create axios instance - using same endpoint as Branch Management
const api = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for restaurant menu API
const menuApi = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
});

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    orderStatus: "",
    paymentStatus: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [allItems, setAllItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 7;
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [tableContainer, setTableContainer] = useState(null);

  // Fetch orders and related data on component mount
  useEffect(() => {
    fetchBranches();
    fetchMenuItems();
    fetchOrders();
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    if (tableContainer) {
      const handleScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = tableContainer;
        setShowLeftScroll(scrollLeft > 0);
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
      };

      tableContainer.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => {
        tableContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [tableContainer, displayedOrders]);

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      const response = await api.get("/branch");
      const branchesData = Array.isArray(response.data) ? response.data : [];
      setBranches(branchesData);
      console.log("Fetched branches:", branchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError(
        "Failed to load branches. Some filter options may not be available."
      );
      setBranches([]);
    }
  };

  // Fetch restaurant menu items
  const fetchMenuItems = async () => {
    try {
      const response = await menuApi.get("/restaurant-menu");
      let items = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (
        response.data.menuItems &&
        Array.isArray(response.data.menuItems)
      ) {
        items = response.data.menuItems;
      } else {
        console.warn(
          "Unexpected restaurant menu API response structure:",
          response.data
        );
        setAllItems([]);
        return;
      }

      const menuItemNames = items
        .map((item) => item.itemName || item.name)
        .filter((name) => name && name !== "Unknown Item")
        .sort();
      setAllItems(menuItemNames);
      console.log("Menu item names extracted:", menuItemNames.length);
    } catch (error) {
      console.error("Error fetching restaurant menu items:", error);
      setAllItems([]);
      setError(
        "Failed to load menu items. Item filter may not work as expected."
      );
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        limit: ordersPerPage,
      };
      if (orderStatusFilter !== "all") params.status = orderStatusFilter;
      if (branchFilter !== "all") params.branchId = branchFilter;
      if (paymentMethodFilter !== "all")
        params.paymentMethod = paymentMethodFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      console.log("Fetching orders with params:", params);

      const response = await api.get("/order", { params });
      const ordersData = response.data.data || [];
      const paginationData = response.data.pagination || {
        totalPages: 1,
        total: ordersData.length,
      };

      const formattedOrders = ordersData.map((order, index) => {
        let branchName = "Unknown Branch";
        let branchId = null;
        if (
          order.branchId &&
          typeof order.branchId === "object" &&
          order.branchId._id
        ) {
          branchId = order.branchId._id;
          branchName = order.branchId.name || "Unknown Branch";
        } else if (typeof order.branchId === "string") {
          branchId = order.branchId;
          const foundBranch = branches.find((b) => b._id === branchId);
          branchName = foundBranch ? foundBranch.name : "Unknown Branch";
        }

        const items = order.items || [];
        const itemNames =
          items.map((item) => item.name).join(", ") || "No items";
        const firstItemName = items[0]?.name || "No items";

        return {
          id: order._id || `temp-id-${index}`,
          orderNumber:
            order.orderNumber ||
            order.orderId ||
            `ORD-${order._id?.slice(-6) || index}`,
          customerName: order.name || order.customerName || "Unknown Customer",
          phone: order.phone || "N/A",
          email: order.email || "N/A",
          date: new Date(order.createdAt || order.date).toLocaleString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          branch: branchName,
          branchId: branchId,
          items: items,
          itemNames: itemNames,
          firstItemName: firstItemName,
          itemsCount: items.length,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          deliveryFee: order.deliveryFee || 0,
          discount: order.discount || 0,
          grandTotal: order.total || order.amount || 0,
          amount: `?${(order.total || order.amount || 0).toFixed(2)}`,
          orderStatus: order.status || "pending",
          paymentMethod: order.paymentMethod || "cash",
          paymentStatus: order.paymentStatus || "pending",
          deliveryOption: order.deliveryOption || "delivery",
          deliveryAddress: order.deliveryAddress || "",
          specialInstructions: order.specialInstructions || "",
          cancellationReason: order.cancellationReason || "",
          originalOrder: order,
        };
      });

      setAllOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      setTotalPages(
        paginationData.totalPages ||
          Math.ceil(formattedOrders.length / ordersPerPage)
      );
      console.log("Fetched orders:", formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please refresh the page and try again.");
      setAllOrders([]);
      setFilteredOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filters or allOrders change
  useEffect(() => {
    let filtered = [...allOrders];

    if (orderStatusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.orderStatus === orderStatusFilter
      );
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((order) => order.branchId === branchFilter);
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentMethod === paymentMethodFilter
      );
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchLower) ||
          order.phone.toLowerCase().includes(searchLower) ||
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.itemNames.toLowerCase().includes(searchLower) ||
          order.branch.toLowerCase().includes(searchLower)
      );
    }

    if (itemFilter !== "all") {
      filtered = filtered.filter((order) =>
        order.itemNames.toLowerCase().includes(itemFilter.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / ordersPerPage));
    setCurrentPage(1);
  }, [
    allOrders,
    orderStatusFilter,
    branchFilter,
    paymentMethodFilter,
    searchTerm,
    itemFilter,
  ]);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    setDisplayedOrders(paginatedOrders);
  }, [filteredOrders, currentPage]);

  // Render items preview for table
  const renderItemsPreview = (items) => {
    if (!items || items.length === 0) return "No items";
    if (items.length === 1) return items[0].name;
    return `${items[0].name} +${items.length - 1} more`;
  };

  // Handle view order
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditFormData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    setEditModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSubmitting(true);

    try {
      if (editFormData.orderStatus !== selectedOrder.orderStatus) {
        await api.put(`/order/${selectedOrder.id}/status`, {
          status: editFormData.orderStatus,
          cancellationReason:
            editFormData.orderStatus === "cancelled"
              ? "Updated by admin"
              : null,
        });
      }

      if (editFormData.paymentStatus !== selectedOrder.paymentStatus) {
        await api.put(`/order/${selectedOrder.id}/payment-status`, {
          paymentStatus: editFormData.paymentStatus,
        });
      }

      await fetchOrders();
      setEditModalOpen(false);
      setSuccessMessage(
        `Order ${selectedOrder.orderNumber} updated successfully`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modals
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedOrder(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
  };

  // Reset pagination when filters change
  const handleFilterChange = (type, value) => {
    if (type === "orderStatus") {
      setOrderStatusFilter(value);
    } else if (type === "paymentMethod") {
      setPaymentMethodFilter(value);
    } else if (type === "branch") {
      setBranchFilter(value);
    } else if (type === "item") {
      setItemFilter(value);
    }
    setCurrentPage(1);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const methodLower = method?.toLowerCase();
    switch (methodLower) {
      case "card":
      case "credit card":
      case "debit card":
        return <CreditCard size={16} />;
      case "upi":
      case "upi payment":
        return <IndianRupee size={16} />;
      case "cash":
      default:
        return <IndianRupee size={16} />;
    }
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    if (!method) return "Cash";
    const methodLower = method.toLowerCase();
    if (methodLower === "card") return "Card";
    if (methodLower === "upi") return "UPI";
    if (methodLower === "cash") return "Cash";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (tableContainer) {
      tableContainer.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableContainer) {
      tableContainer.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Export orders as CSV
  const exportOrders = () => {
    let csv =
      "Order ID,Customer,Phone,Date,Branch,Items,Amount,Payment Method,Order Status,Payment Status\n";
    filteredOrders.forEach((order) => {
      const itemsList =
        order.items
          ?.map((item) => `${item.name} (x${item.quantity})`)
          .join("; ") || "";
      csv += `"${order.orderNumber}","${order.customerName}","${order.phone}","${order.date}","${order.branch}","${itemsList}",${order.amount},"${order.paymentMethod}","${order.orderStatus}","${order.paymentStatus}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `orders-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "preparing":
      case "out for delivery":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paymentStatus) => {
    const statusLower = paymentStatus?.toLowerCase();
    switch (statusLower) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Pagination range calculation
  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 4) {
        endPage = 5;
      }
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="container mx-auto p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center bg-green-100 text-green-800 p-4 rounded-xl mb-6 shadow-lg border border-green-200">
            <Check size={20} className="mr-3" />
            <span className="font-medium">{successMessage}</span>
            <button
              className="ml-auto hover:bg-green-200 p-1 rounded-full transition"
              onClick={() => setSuccessMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">
                Manage and track all restaurant orders
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl">
                <span className="text-blue-700 font-semibold">
                  Total: {filteredOrders.length} orders
                </span>
              </div>
              <button
                className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={exportOrders}
              >
                <Download size={18} className="mr-2" />
                <span className="font-medium">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, phone number..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={orderStatusFilter}
                onChange={(e) =>
                  handleFilterChange("orderStatus", e.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={branchFilter}
                onChange={(e) => handleFilterChange("branch", e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <select
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={paymentMethodFilter}
                onChange={(e) =>
                  handleFilterChange("paymentMethod", e.target.value)
                }
              >
                <option value="all">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
              <select
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={itemFilter}
                onChange={(e) => handleFilterChange("item", e.target.value)}
              >
                <option value="all">All Items</option>
                {allItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center bg-red-100 text-red-800 p-4 rounded-xl mb-6 shadow-lg border border-red-200">
            <AlertCircle size={20} className="mr-3" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader size={32} className="animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                Loading orders...
              </p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              {showLeftScroll && (
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
                  onClick={scrollLeft}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {showRightScroll && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
                  onClick={scrollRight}
                >
                  <ChevronRight size={20} />
                </button>
              )}
              <div className="overflow-x-auto" ref={setTableContainer}>
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Order ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Customer
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Building size={16} />
                          Branch
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          Items
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          Amount
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} />
                          Payment
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedOrders.length > 0 ? (
                      displayedOrders.map((order, index) => (
                        <tr
                          key={order.id}
                          className={`hover:bg-blue-50 transition-colors duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {order.customerName}
                            </div>
                            {order.phone && order.phone !== "N/A" && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Phone size={12} />
                                {order.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {order.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900">{order.branch}</div>
                          </td>
                          <td className="px-6 py-4" title={order.itemNames}>
                            <div className="text-sm text-gray-600">
                              {renderItemsPreview(order.items)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {order.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(order.paymentMethod)}
                              <span className="text-sm font-medium">
                                {getPaymentMethodDisplay(order.paymentMethod)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus.charAt(0).toUpperCase() +
                                order.orderStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() +
                                order.paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye size={14} />
                                View
                              </button>
                              <button
                                className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 text-sm font-medium"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No orders found
                              </h3>
                              <p className="text-gray-500">
                                No orders match your current search and filter
                                criteria.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} (
                {filteredOrders.length} total orders)
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {getPaginationRange().map((page, index) =>
                    page === "..." ? (
                      <span key={index} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        {viewModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order Details - #{selectedOrder.orderNumber}
                </h3>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={closeViewModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="font-medium text-gray-700">Customer</p>
                    <p className="text-gray-600">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Contact</p>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-600" />
                      <span>{selectedOrder.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText size={16} className="text-gray-600" />
                      <span>{selectedOrder.email || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Date</p>
                    <p className="text-gray-600">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Branch</p>
                    <p className="text-gray-600">{selectedOrder.branch}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Total Items</p>
                    <p className="text-gray-600">{selectedOrder.itemsCount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus.charAt(0).toUpperCase() +
                        selectedOrder.orderStatus.slice(1)}
                    </span>
                  </div>
                  {selectedOrder.orderStatus === "cancelled" &&
                    selectedOrder.cancellationReason && (
                      <div className="md:col-span-2">
                        <p className="font-medium text-gray-700">
                          Cancellation Reason
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.cancellationReason}
                        </p>
                      </div>
                    )}
                  <div>
                    <p className="font-medium text-gray-700">Payment Method</p>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                      <span>
                        {getPaymentMethodDisplay(selectedOrder.paymentMethod)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Payment Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                        selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Delivery Option</p>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-gray-600" />
                      <span>
                        {selectedOrder.deliveryOption.charAt(0).toUpperCase() +
                          selectedOrder.deliveryOption.slice(1)}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.deliveryOption === "delivery" &&
                    selectedOrder.deliveryAddress && (
                      <div className="md:col-span-2">
                        <p className="font-medium text-gray-700">
                          Delivery Address
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-600 mt-1" />
                          <span>{selectedOrder.deliveryAddress}</span>
                        </div>
                      </div>
                    )}
                  {selectedOrder.specialInstructions && (
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-700">
                        Special Instructions
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Price Details
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 text-gray-700">Subtotal</td>
                          <td className="py-2 text-right">
                            ?{selectedOrder.subtotal.toFixed(2)}
                          </td>
                        </tr>
                        {selectedOrder.discount > 0 && (
                          <tr className="border-b">
                            <td className="py-2 text-gray-700">Discount</td>
                            <td className="py-2 text-right text-green-600">
                              -?{selectedOrder.discount.toFixed(2)}
                            </td>
                          </tr>
                        )}
                        {selectedOrder.tax > 0 && (
                          <tr className="border-b">
                            <td className="py-2 text-gray-700">Tax</td>
                            <td className="py-2 text-right">
                              ?{selectedOrder.tax.toFixed(2)}
                            </td>
                          </tr>
                        )}
                        {selectedOrder.deliveryOption === "delivery" &&
                          selectedOrder.deliveryFee > 0 && (
                            <tr className="border-b">
                              <td className="py-2 text-gray-700">
                                Delivery Fee
                              </td>
                              <td className="py-2 text-right">
                                ?{selectedOrder.deliveryFee.toFixed(2)}
                              </td>
                            </tr>
                          )}
                        <tr className="font-semibold">
                          <td className="py-2 text-gray-800">Total Amount</td>
                          <td className="py-2 text-right">
                            {selectedOrder.amount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Order Items
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.length > 0 ? (
                          selectedOrder.items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">
                                ?{item.price?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3">
                                ?
                                {(
                                  (item.price || 0) * (item.quantity || 0)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-6 text-gray-600"
                            >
                              No items available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 p-4 border-t">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  onClick={closeViewModal}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => {
                    closeViewModal();
                    handleEditOrder(selectedOrder);
                  }}
                >
                  Edit Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {editModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit Order - #{selectedOrder.orderNumber}
                </h3>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={closeEditModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={selectedOrder.customerName}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={selectedOrder.phone}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedOrder.email}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={selectedOrder.branch}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="orderStatus"
                      value={editFormData.orderStatus}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out for delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      name="paymentStatus"
                      value={editFormData.paymentStatus}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-yellow-600 mb-4">
                  <AlertCircle size={16} />
                  <span className="text-sm">
                    Only order status and payment status can be updated
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Order Items
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.length > 0 ? (
                          selectedOrder.items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">
                                ?{item.price?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-4 py-3">
                                ?
                                {(
                                  (item.price || 0) * (item.quantity || 0)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-6 text-gray-600"
                            >
                              No items available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 p-4 border-t">
                <button
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
