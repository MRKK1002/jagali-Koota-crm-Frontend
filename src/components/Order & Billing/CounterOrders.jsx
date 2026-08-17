// import { useState, useEffect } from "react";
// import {
//   Search,
//   Download,
//   X,
//   Check,
//   AlertCircle,
//   CreditCard,
//   IndianRupee,
//   Loader,
//   Filter,
//   Eye,
//   Edit,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import axios from "axios";

// // Create axios instance for main API
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Create separate axios instance for restaurant menu API
// const menuApi = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel/",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const CounterOrders = () => {
//   const [allOrders, setAllOrders] = useState([]);
//   const [displayedOrders, setDisplayedOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // State for modals
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     orderStatus: "",
//     paymentStatus: "",
//   });
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [orderStatusFilter, setOrderStatusFilter] = useState("all");
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
//   const [branchFilter, setBranchFilter] = useState("all");
//   const [itemFilter, setItemFilter] = useState("all");
//   const [allItems, setAllItems] = useState([]); // Store all unique items

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const ordersPerPage = 7;

//   // Scroll state
//   const [showLeftScroll, setShowLeftScroll] = useState(false);
//   const [showRightScroll, setShowRightScroll] = useState(false);
//   const [tableContainer, setTableContainer] = useState(null);

//   // Fetch orders and related data on component mount or when filters change
//   useEffect(() => {
//     fetchBranches();
//     fetchOrders();
//   }, [orderStatusFilter, paymentStatusFilter, branchFilter]);

//   // Set up scroll event listener
//   useEffect(() => {
//     if (tableContainer) {
//       const handleScroll = () => {
//         const { scrollLeft, scrollWidth, clientWidth } = tableContainer;
//         setShowLeftScroll(scrollLeft > 0);
//         setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
//       };

//       tableContainer.addEventListener("scroll", handleScroll);
//       // Initial check
//       handleScroll();

//       return () => {
//         tableContainer.removeEventListener("scroll", handleScroll);
//       };
//     }
//   }, [tableContainer, displayedOrders]);

//   // Fetch all branches
//   const fetchBranches = async () => {
//     try {
//       const response = await api.get("/branch");
//       setBranches(response.data);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       setError(
//         "Failed to load branches. Some filter options may not be available."
//       );
//     }
//   };

//   // Extract unique items from orders
//   const extractUniqueItems = (orders) => {
//     const itemsSet = new Set();
//     orders.forEach((order) => {
//       if (order.originalOrder?.items) {
//         order.originalOrder.items.forEach((item) => {
//           if (item.name) {
//             itemsSet.add(item.name);
//           }
//         });
//       }
//     });
//     return Array.from(itemsSet).sort();
//   };

//   // Fetch all counter orders
//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     setAllOrders([]);
//     setFilteredOrders([]);
//     setDisplayedOrders([]);

//     try {
//       const response = await api.get("/counter-order/orders");

//       if (!response.data.orders || !Array.isArray(response.data.orders)) {
//         throw new Error("Invalid response format: orders array missing");
//       }

//       const formattedOrders = response.data.orders
//         .map((order, index) => {
//           // Extract item names for display
//           const itemNames =
//             order.items?.map((item) => item.name).join(", ") || "No items";
//           const firstItemName = order.items?.[0]?.name || "No items";
//           const itemsCount = order.items?.length || 0;

//           return {
//             id: order.id || `temp-id-${index}`,
//             customerName: order.customerName || "Unknown Customer",
//             phoneNumber: order.phoneNumber || "N/A",
//             counterUser: order.userId?.name || "Unknown Counter User",
//             counterUserId: order.userId?.id || null,
//             date: new Date(order.createdAt || Date.now()).toLocaleString(
//               "en-US",
//               {
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }
//             ),
//             branch: order.branch?.name || "Unknown Branch",
//             branchId: order.branch?.id || null,
//             invoice: order.invoice?.invoiceNumber || "N/A",
//             items: order.items?.length || 0,
//             itemNames: itemNames,
//             firstItemName: firstItemName,
//             itemsCount: itemsCount,
//             subtotal: order.subtotal || order.totalAmount || 0,
//             tax: order.tax || 0,
//             serviceCharge: order.serviceCharge || 0,
//             grandTotal: order.grandTotal || order.totalAmount || 0,
//             amount: `₹${(order.grandTotal || order.totalAmount || 0).toFixed(
//               2
//             )}`,
//             totalAmount: order.totalAmount || 0,
//             orderStatus: order.orderStatus || "pending",
//             paymentMethod: order.paymentMethod || "cash",
//             paymentStatus: order.paymentStatus || "pending",
//             cancellationReason: order.cancellationReason || "",
//             cancelledAt: order.cancelledAt || null,
//             originalOrder: order,
//           };
//         })
//         .filter((order) => order.id);

//       // Extract unique items before filtering
//       const uniqueItems = extractUniqueItems(formattedOrders);
//       setAllItems(uniqueItems);

//       // Apply server-side filters
//       let filteredData = formattedOrders;

//       if (orderStatusFilter !== "all") {
//         filteredData = filteredData.filter(
//           (order) => order.orderStatus === orderStatusFilter
//         );
//       }

//       if (paymentStatusFilter !== "all") {
//         filteredData = filteredData.filter(
//           (order) => order.paymentStatus === paymentStatusFilter
//         );
//       }

//       if (branchFilter !== "all") {
//         filteredData = filteredData.filter(
//           (order) => order.branchId === branchFilter
//         );
//       }

//       setAllOrders(filteredData);
//     } catch (error) {
//       console.error("Error fetching counter orders:", error);
//       setError(
//         "Failed to load counter orders. Please refresh the page and try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle search filtering and pagination
//   useEffect(() => {
//     const filtered = allOrders.filter((order) => {
//       if (!searchTerm.trim()) return true;

//       const customerName = order.customerName || "";
//       const phoneNumber = order.phoneNumber || "";
//       const counterUser = order.counterUser || "";
//       const invoice = order.invoice || "";
//       const itemNames = order.itemNames || "";
//       const searchLower = searchTerm.trim().toLowerCase();

//       return (
//         customerName.toLowerCase().includes(searchLower) ||
//         phoneNumber.toLowerCase().includes(searchLower) ||
//         counterUser.toLowerCase().includes(searchLower) ||
//         invoice.toLowerCase().includes(searchLower) ||
//         itemNames.toLowerCase().includes(searchLower)
//       );
//     });

//     // Apply item filter
//     let itemFiltered = filtered;
//     if (itemFilter !== "all") {
//       itemFiltered = itemFiltered.filter((order) =>
//         order.itemNames.toLowerCase().includes(itemFilter.toLowerCase())
//       );
//     }

//     setFilteredOrders(itemFiltered);
//     setTotalPages(Math.ceil(itemFiltered.length / ordersPerPage));
//     setCurrentPage(1);
//   }, [allOrders, searchTerm, itemFilter]);

//   // Handle pagination
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * ordersPerPage;
//     const endIndex = startIndex + ordersPerPage;
//     const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
//     setDisplayedOrders(paginatedOrders);
//   }, [filteredOrders, currentPage]);

//   // Handle search input with debounce
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // Search is handled in the filteredOrders useEffect
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Handle view order
//   const handleViewOrder = (order) => {
//     setSelectedOrder(order);
//     setViewModalOpen(true);
//   };

//   // Handle edit order
//   const handleEditOrder = (order) => {
//     setSelectedOrder(order);
//     setEditFormData({
//       orderStatus: order.orderStatus,
//       paymentStatus: order.paymentStatus,
//     });
//     setEditModalOpen(true);
//   };

//   // Handle form input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value,
//     });
//   };

//   // Handle save changes
//   const handleSaveChanges = async () => {
//     setIsSubmitting(true);

//     try {
//       if (editFormData.orderStatus !== selectedOrder.orderStatus) {
//         await api.put(
//           `/counter-order/orders/${selectedOrder.id}/order-status`,
//           {
//             orderStatus: editFormData.orderStatus,
//           }
//         );
//       }

//       if (editFormData.paymentStatus !== selectedOrder.paymentStatus) {
//         await api.put(
//           `/counter-order/orders/${selectedOrder.id}/payment-status`,
//           {
//             paymentStatus: editFormData.paymentStatus,
//           }
//         );
//       }

//       await fetchOrders();

//       setEditModalOpen(false);
//       setSuccessMessage(
//         `Counter order ${selectedOrder.invoice} updated successfully`
//       );

//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);
//     } catch (error) {
//       console.error("Error updating counter order:", error);
//       alert("Failed to update counter order. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Close modals
//   const closeViewModal = () => {
//     setViewModalOpen(false);
//     setSelectedOrder(null);
//   };

//   const closeEditModal = () => {
//     setEditModalOpen(false);
//     setSelectedOrder(null);
//   };

//   // Reset pagination when filters change
//   const handleFilterChange = (type, value) => {
//     if (type === "orderStatus") {
//       setOrderStatusFilter(value);
//     } else if (type === "paymentStatus") {
//       setPaymentStatusFilter(value);
//     } else if (type === "branch") {
//       setBranchFilter(value);
//     } else if (type === "item") {
//       setItemFilter(value);
//     }
//     setCurrentPage(1);
//   };

//   // Get payment method icon
//   const getPaymentMethodIcon = (method) => {
//     switch (method?.toLowerCase()) {
//       case "card":
//         return <CreditCard size={16} />;
//       case "upi":
//         return <IndianRupee size={16} />;
//       case "qr":
//         return <IndianRupee size={16} />;
//       case "cash":
//       default:
//         return <IndianRupee size={16} />;
//     }
//   };

//   // Scroll functions
//   const scrollLeft = () => {
//     if (tableContainer) {
//       tableContainer.scrollBy({ left: -300, behavior: "smooth" });
//     }
//   };

//   const scrollRight = () => {
//     if (tableContainer) {
//       tableContainer.scrollBy({ left: 300, behavior: "smooth" });
//     }
//   };

//   // Export orders as CSV
//   const exportOrders = () => {
//     let csv =
//       "Customer Name,Phone,Counter User,Date,Branch,Invoice,Items,Item Names,Subtotal,Tax,Service Charge,Grand Total,Payment Method,Order Status,Payment Status\n";

//     filteredOrders.forEach((order) => {
//       csv += `"${order.customerName}","${order.phoneNumber}","${
//         order.counterUser
//       }","${order.date}","${order.branch}","${order.invoice}",${order.items},"${
//         order.itemNames
//       }","₹${order.subtotal.toFixed(2)}","₹${order.tax.toFixed(
//         2
//       )}","₹${order.serviceCharge.toFixed(2)}","${order.amount}","${
//         order.paymentMethod
//       }","${order.orderStatus}","${order.paymentStatus}"\n`;
//     });

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("hidden", "");
//     a.setAttribute("href", url);
//     a.setAttribute(
//       "download",
//       `counter-orders-export-${new Date().toISOString().slice(0, 10)}.csv`
//     );
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   // Pagination range calculation
//   const getPaginationRange = () => {
//     const maxPagesToShow = 5;
//     const pages = [];

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       pages.push(1);

//       let startPage = Math.max(2, currentPage - 2);
//       let endPage = Math.min(totalPages - 1, currentPage + 2);

//       if (currentPage <= 4) {
//         endPage = 5;
//       }
//       if (currentPage >= totalPages - 3) {
//         startPage = totalPages - 4;
//       }

//       if (startPage > 2) {
//         pages.push("...");
//       }

//       for (let i = startPage; i <= endPage; i++) {
//         pages.push(i);
//       }

//       if (endPage < totalPages - 1) {
//         pages.push("...");
//       }

//       if (totalPages > 1) {
//         pages.push(totalPages);
//       }
//     }

//     return pages;
//   };

//   return (
//     <div className="orders-page">
//       {/* Success message */}
//       {successMessage && (
//         <div className="success-message">
//           <Check size={16} />
//           <span>{successMessage}</span>
//           <button onClick={() => setSuccessMessage("")}>
//             <X size={16} />
//           </button>
//         </div>
//       )}

//       <div className="page-header">
//         <div>
//           <h1>Counter Orders</h1>
//           <p>Manage and review all counter order transactions</p>
//         </div>
//         <div className="header-actions">
//           <button className="btn btn-primary" onClick={exportOrders}>
//             <Download size={16} />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       <div className="dashboard-card">
//         <div className="filters-bar">
//           <div className="search-container">
//             <Search size={18} className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search by customer name, phone, counter user, invoice, or items..."
//               className="search-input"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="filter-buttons">
//             <div className="filter-group">
//               <Filter size={16} />
//               <select
//                 className="filter-select"
//                 value={orderStatusFilter}
//                 onChange={(e) =>
//                   handleFilterChange("orderStatus", e.target.value)
//                 }>
//                 <option value="all">All Order Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="processing">Processing</option>
//                 <option value="completed">Completed</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//             <div className="filter-group">
//               <Filter size={16} />
//               <select
//                 className="filter-select"
//                 value={paymentStatusFilter}
//                 onChange={(e) =>
//                   handleFilterChange("paymentStatus", e.target.value)
//                 }>
//                 <option value="all">All Payment Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="completed">Completed</option>
//                 <option value="failed">Failed</option>
//                 <option value="refunded">Refunded</option>
//               </select>
//             </div>
//             <div className="filter-group">
//               <Filter size={16} />
//               <select
//                 className="filter-select"
//                 value={branchFilter}
//                 onChange={(e) => handleFilterChange("branch", e.target.value)}>
//                 <option value="all">All Branches</option>
//                 {branches.map((branch) => (
//                   <option key={branch._id} value={branch._id}>
//                     {branch.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="filter-group">
//               <Filter size={16} />
//               <select
//                 className="filter-select"
//                 value={itemFilter}
//                 onChange={(e) => handleFilterChange("item", e.target.value)}>
//                 <option value="all">All Items</option>
//                 {allItems.map((item, index) => (
//                   <option key={index} value={item}>
//                     {item}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Error message */}
//         {error && (
//           <div className="error-container">
//             <AlertCircle size={18} />
//             <span>{error}</span>
//           </div>
//         )}

//         <div className="data-card">
//           {loading ? (
//             <div className="loading-container">
//               <Loader size={24} className="animate-spin" />
//               <p>Loading counter orders...</p>
//             </div>
//           ) : (
//             <div className="table-container-wrapper">
//               {/* Scroll indicators */}
//               {showLeftScroll && (
//                 <button
//                   className="scroll-button scroll-left"
//                   onClick={scrollLeft}>
//                   <ChevronLeft size={20} />
//                 </button>
//               )}
//               {showRightScroll && (
//                 <button
//                   className="scroll-button scroll-right"
//                   onClick={scrollRight}>
//                   <ChevronRight size={20} />
//                 </button>
//               )}

//               <div className="table-container" ref={setTableContainer}>
//                 <table className="data-table">
//                   <thead>
//                     <tr>
//                       <th>Customer</th>
//                       <th>Phone</th>
//                       <th>Counter User</th>
//                       <th>Date</th>
//                       <th>Branch</th>
//                       <th>Invoice</th>
//                       <th>Items (Count)</th>
//                       <th>Item Names</th>
//                       <th>Amount</th>
//                       <th>Order Status</th>
//                       <th>Payment Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {displayedOrders.length > 0 ? (
//                       displayedOrders.map((order) => (
//                         <tr key={order.id}>
//                           <td>{order.customerName}</td>
//                           <td>{order.phoneNumber}</td>
//                           <td>{order.counterUser}</td>
//                           <td>{order.date}</td>
//                           <td>{order.branch}</td>
//                           <td>{order.invoice}</td>
//                           <td>
//                             <span className="items-count-badge">
//                               {order.itemsCount}
//                             </span>
//                           </td>
//                           <td>
//                             <div
//                               className="items-names"
//                               title={order.itemNames}>
//                               {order.itemsCount === 0 ? (
//                                 "No items"
//                               ) : order.itemsCount === 1 ? (
//                                 order.firstItemName
//                               ) : (
//                                 <>
//                                   {order.firstItemName}
//                                   <span className="more-items">
//                                     {" "}
//                                     +{order.itemsCount - 1} more
//                                   </span>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                           <td>{order.amount}</td>
//                           <td>
//                             <span
//                               className={`status-badge ${order.orderStatus}`}>
//                               {order.orderStatus.charAt(0).toUpperCase() +
//                                 order.orderStatus.slice(1)}
//                             </span>
//                           </td>
//                           <td>
//                             <span
//                               className={`status-badge ${order.paymentStatus}`}>
//                               {order.paymentStatus.charAt(0).toUpperCase() +
//                                 order.paymentStatus.slice(1)}
//                             </span>
//                           </td>
//                           <td>
//                             <div className="action-buttons">
//                               <button
//                                 className="action-btn view"
//                                 onClick={() => handleViewOrder(order)}>
//                                 <Eye size={16} />
//                               </button>
//                               <button
//                                 className="action-btn edit"
//                                 onClick={() => handleEditOrder(order)}>
//                                 <Edit size={16} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="12" className="no-orders">
//                           No counter orders found matching your criteria
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//         {totalPages > 0 && (
//           <div className="pagination">
//             <button
//               className="pagination-btn"
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1 || loading}>
//               <ChevronLeft size={16} />
//               <span>Previous</span>
//             </button>

//             <div className="pagination-pages">
//               {getPaginationRange().map((page, index) =>
//                 page === "..." ? (
//                   <span key={index} className="pagination-ellipsis">
//                     ...
//                   </span>
//                 ) : (
//                   <button
//                     key={index}
//                     className={`pagination-page ${
//                       currentPage === page ? "active" : ""
//                     }`}
//                     onClick={() => setCurrentPage(page)}
//                     disabled={loading}>
//                     {page}
//                   </button>
//                 )
//               )}
//             </div>

//             <button
//               className="pagination-btn"
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages || loading}>
//               <span>Next</span>
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* View Order Modal */}
//       {viewModalOpen && selectedOrder && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 Counter Order Details - {selectedOrder.invoice}
//               </h3>
//               <button className="modal-close" onClick={closeViewModal}>
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="order-details-grid">
//                 <div className="order-detail-section">
//                   <h4>Customer Information</h4>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Customer Name</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.customerName}
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Phone Number</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.phoneNumber}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="order-detail-section">
//                   <h4>Order Information</h4>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Counter User</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.counterUser}
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Date</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.date}
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Branch</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.branch}
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Invoice Number</div>
//                     <div className="order-detail-value">
//                       {selectedOrder.invoice}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="order-detail-section">
//                   <h4>Status Information</h4>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Order Status</div>
//                     <div className="order-detail-value">
//                       <span
//                         className={`status-badge ${selectedOrder.orderStatus}`}>
//                         {selectedOrder.orderStatus.charAt(0).toUpperCase() +
//                           selectedOrder.orderStatus.slice(1)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Payment Status</div>
//                     <div className="order-detail-value">
//                       <span
//                         className={`status-badge ${selectedOrder.paymentStatus}`}>
//                         {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
//                           selectedOrder.paymentStatus.slice(1)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="order-detail-row">
//                     <div className="order-detail-label">Payment Method</div>
//                     <div className="order-detail-value">
//                       <div className="payment-method">
//                         {getPaymentMethodIcon(selectedOrder.paymentMethod)}
//                         <span>
//                           {selectedOrder.paymentMethod
//                             ? selectedOrder.paymentMethod
//                                 .charAt(0)
//                                 .toUpperCase() +
//                               selectedOrder.paymentMethod.slice(1)
//                             : "Cash"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                   {selectedOrder.cancellationReason && (
//                     <div className="order-detail-row">
//                       <div className="order-detail-label">
//                         Cancellation Reason
//                       </div>
//                       <div className="order-detail-value">
//                         {selectedOrder.cancellationReason}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="order-items-section">
//                 <h4>Order Items ({selectedOrder.itemsCount})</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item Name</th>
//                         <th>Quantity</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.originalOrder?.items?.length > 0 ? (
//                         selectedOrder.originalOrder.items.map((item, index) => (
//                           <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price.toFixed(2)}</td>
//                             <td>₹{(item.price * item.quantity).toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" className="no-items">
//                             No items available
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div className="order-summary-section">
//                 <h4>Order Summary</h4>
//                 <div className="order-summary">
//                   <div className="summary-row">
//                     <div className="summary-label">Subtotal</div>
//                     <div className="summary-value">
//                       ₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}
//                     </div>
//                   </div>
//                   {selectedOrder.tax > 0 && (
//                     <div className="summary-row">
//                       <div className="summary-label">Tax</div>
//                       <div className="summary-value">
//                         ₹{selectedOrder.tax?.toFixed(2) || "0.00"}
//                       </div>
//                     </div>
//                   )}
//                   {selectedOrder.serviceCharge > 0 && (
//                     <div className="summary-row">
//                       <div className="summary-label">Service Charge</div>
//                       <div className="summary-value">
//                         ₹{selectedOrder.serviceCharge?.toFixed(2) || "0.00"}
//                       </div>
//                     </div>
//                   )}
//                   <div className="summary-row total">
//                     <div className="summary-label">Grand Total</div>
//                     <div className="summary-value">
//                       ₹{selectedOrder.grandTotal?.toFixed(2) || "0.00"}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button className="btn btn-outline" onClick={closeViewModal}>
//                 Close
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={() => {
//                   closeViewModal();
//                   handleEditOrder(selectedOrder);
//                 }}>
//                 Edit Order
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Order Modal */}
//       {editModalOpen && selectedOrder && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 Edit Counter Order - {selectedOrder.invoice}
//               </h3>
//               <button className="modal-close" onClick={closeEditModal}>
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="form-grid">
//                 <div className="form-group">
//                   <label className="form-label">Customer Name</label>
//                   <input
//                     type="text"
//                     value={selectedOrder.customerName}
//                     className="form-input"
//                     disabled={true}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Phone Number</label>
//                   <input
//                     type="text"
//                     value={selectedOrder.phoneNumber}
//                     className="form-input"
//                     disabled={true}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Counter User</label>
//                   <input
//                     type="text"
//                     value={selectedOrder.counterUser}
//                     className="form-input"
//                     disabled={true}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Branch</label>
//                   <input
//                     type="text"
//                     value={selectedOrder.branch}
//                     className="form-input"
//                     disabled={true}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Order Status</label>
//                   <select
//                     name="orderStatus"
//                     value={editFormData.orderStatus}
//                     onChange={handleInputChange}
//                     className="form-select">
//                     <option value="pending">Pending</option>
//                     <option value="processing">Processing</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Payment Status</label>
//                   <select
//                     name="paymentStatus"
//                     value={editFormData.paymentStatus}
//                     onChange={handleInputChange}
//                     className="form-select">
//                     <option value="pending">Pending</option>
//                     <option value="completed">Completed</option>
//                     <option value="failed">Failed</option>
//                     <option value="refunded">Refunded</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="info-message">
//                 <AlertCircle size={16} />
//                 <span>Only order status and payment status can be updated</span>
//               </div>

//               <div className="order-items-section">
//                 <h4>Order Items ({selectedOrder.itemsCount})</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item Name</th>
//                         <th>Quantity</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.originalOrder?.items?.length > 0 ? (
//                         selectedOrder.originalOrder.items.map((item, index) => (
//                           <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price.toFixed(2)}</td>
//                             <td>₹{(item.price * item.quantity).toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" className="no-items">
//                             No items available
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="btn btn-outline"
//                 onClick={closeEditModal}
//                 disabled={isSubmitting}>
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleSaveChanges}
//                 disabled={isSubmitting}>
//                 {isSubmitting ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
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

//       <style jsx>{`
//         :root {
//           --primary: #4361ee;
//           --primary-light: #4895ef;
//           --secondary: #3f37c9;
//           --success: #4cc9f0;
//           --danger: #f72585;
//           --warning: #f8961e;
//           --info: #4895ef;
//           --dark: #212529;
//           --light: #f8f9fa;
//           --gray: #6c757d;
//           --gray-light: #ced4da;
//           --border: #dee2e6;
//           --bg-white: #ffffff;
//           --bg-light: #f8f9fa;
//           --text: #212529;
//           --text-light: #6c757d;
//           --radius-sm: 0.25rem;
//           --radius-md: 0.375rem;
//           --radius-lg: 0.5rem;
//           --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12),
//             0 1px 2px rgba(0, 0, 0, 0.24);
//           --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1),
//             0 1px 3px rgba(0, 0, 0, 0.08);
//           --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
//             0 4px 6px -2px rgba(0, 0, 0, 0.05);
//         }

//         .orders-page {
//           padding: 2rem;
//           background-color: #f5f7fb;
//           min-height: 100vh;
//           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
//             Oxygen, Ubuntu, sans-serif;
//         }

//         .success-message {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 1rem 1.5rem;
//           background: #f0fdf4;
//           color: #166534;
//           border: 1px solid #bbf7d0;
//           border-radius: var(--radius-md);
//           margin-bottom: 1.5rem;
//         }

//         .success-message button {
//           margin-left: auto;
//           background: none;
//           border: none;
//           cursor: pointer;
//           color: #166534;
//         }

//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//         }

//         .page-header h1 {
//           font-size: 2rem;
//           font-weight: 700;
//           color: var(--dark);
//           margin: 0 0 0.5rem 0;
//         }

//         .page-header p {
//           color: var(--gray);
//           margin: 0;
//           font-size: 1.1rem;
//         }

//         .header-actions {
//           display: flex;
//           gap: 0.75rem;
//         }

//         .btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.25rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid transparent;
//         }

//         .btn-outline {
//           background: transparent;
//           border-color: var(--border);
//           color: var(--text);
//         }

//         .btn-outline:hover {
//           background: var(--bg-light);
//         }

//         .btn-primary {
//           background: var(--primary);
//           color: white;
//         }

//         .btn-primary:hover {
//           background: var(--secondary);
//         }

//         .dashboard-card {
//           background: var(--bg-white);
//           border-radius: var(--radius-lg);
//           box-shadow: var(--shadow-md);
//         }

//         .filters-bar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1.5rem;
//           border-bottom: 1px solid var(--border);
//           flex-wrap: wrap;
//           gap: 1rem;
//         }

//         .search-container {
//           position: relative;
//           flex: 1;
//           min-width: 300px;
//         }

//         .search-icon {
//           position: absolute;
//           left: 1rem;
//           top: 50%;
//           transform: translateY(-50%);
//           color: var(--gray);
//           height: 1.25rem;
//           width: 1.25rem;
//         }

//         .search-input {
//           width: 100%;
//           padding: 0.75rem 1rem 0.75rem 3rem;
//           border: 1px solid var(--border);
//           border-radius: var(--radius-md);
//           font-size: 1rem;
//           transition: all 0.2s;
//         }

//         .search-input:focus {
//           outline: none;
//           border-color: var(--primary);
//           box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
//         }

//         .filter-buttons {
//           display: flex;
//           gap: 0.75rem;
//           flex-wrap: wrap;
//         }

//         .filter-group {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .filter-select {
//           padding: 0.75rem 1rem;
//           border: 1px solid var(--border);
//           border-radius: var(--radius-md);
//           background: var(--bg-white);
//           font-size: 0.875rem;
//           cursor: pointer;
//         }

//         .error-container {
//           margin: 1.5rem;
//           padding: 1rem 1.5rem;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: var(--radius-md);
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .data-card {
//           position: relative;
//         }

//         .table-container-wrapper {
//           position: relative;
//           width: 100%;
//         }

//         .scroll-button {
//           position: absolute;
//           top: 50%;
//           transform: translateY(-50%);
//           z-index: 10;
//           background: var(--bg-white);
//           border: 1px solid var(--border);
//           border-radius: 50%;
//           width: 40px;
//           height: 40px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           box-shadow: var(--shadow-md);
//           transition: all 0.2s;
//         }

//         .scroll-button:hover {
//           background: var(--primary);
//           color: white;
//         }

//         .scroll-left {
//           left: 10px;
//         }

//         .scroll-right {
//           right: 10px;
//         }

//         .table-container {
//           width: 100%;
//           overflow-x: auto;
//           overflow-y: visible;
//         }

//         .loading-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//           text-align: center;
//         }

//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           0% {
//             transform: rotate(0deg);
//           }
//           100% {
//             transform: rotate(360deg);
//           }
//         }

//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           min-width: 1200px;
//         }

//         .data-table th {
//           text-align: left;
//           padding: 1rem;
//           font-weight: 600;
//           color: var(--text-light);
//           border-bottom: 1px solid var(--border);
//           background: var(--bg-light);
//           white-space: nowrap;
//         }

//         .data-table td {
//           padding: 1rem;
//           border-bottom: 1px solid var(--border);
//           white-space: nowrap;
//         }

//         .data-table tr:last-child td {
//           border-bottom: none;
//         }

//         .data-table tr:hover {
//           background: #f8f9fa;
//         }

//         .items-count-badge {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0.25rem 0.5rem;
//           background: var(--primary);
//           color: white;
//           border-radius: 1rem;
//           font-size: 0.75rem;
//           font-weight: 600;
//           min-width: 1.5rem;
//         }

//         .items-names {
//           max-width: 200px;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }

//         .more-items {
//           color: var(--gray);
//           font-size: 0.875rem;
//         }

//         .status-badge {
//           padding: 0.25rem 0.75rem;
//           border-radius: 1rem;
//           font-size: 0.75rem;
//           font-weight: 500;
//           text-transform: capitalize;
//         }

//         .status-badge.pending {
//           background: #fef3c7;
//           color: #92400e;
//         }

//         .status-badge.processing {
//           background: #dbeafe;
//           color: #1e40af;
//         }

//         .status-badge.completed {
//           background: #d1fae5;
//           color: #065f46;
//         }

//         .status-badge.cancelled {
//           background: #fee2e2;
//           color: #b91c1c;
//         }

//         .status-badge.failed {
//           background: #fee2e2;
//           color: #b91c1c;
//         }

//         .status-badge.refunded {
//           background: #fef3c7;
//           color: #92400e;
//         }

//         .action-buttons {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .action-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0.5rem;
//           border-radius: var(--radius-md);
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid transparent;
//         }

//         .action-btn.view {
//           background: #dbeafe;
//           color: #1e40af;
//         }

//         .action-btn.view:hover {
//           background: #bfdbfe;
//         }

//         .action-btn.edit {
//           background: #fef3c7;
//           color: #92400e;
//         }

//         .action-btn.edit:hover {
//           background: #fde68a;
//         }

//         .no-orders {
//           text-align: center;
//           padding: 2rem;
//           color: var(--text-light);
//         }

//         .pagination {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1.5rem;
//           border-top: 1px solid var(--border);
//           flex-wrap: wrap;
//           gap: 1rem;
//         }

//         .pagination-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.25rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid var(--border);
//           background: var(--bg-white);
//         }

//         .pagination-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .pagination-btn:hover:not(:disabled) {
//           background: var(--bg-light);
//         }

//         .pagination-pages {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .pagination-page {
//           padding: 0.75rem 1rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid var(--border);
//           background: var(--bg-white);
//           min-width: 2.75rem;
//         }

//         .pagination-page.active {
//           background: var(--primary);
//           color: white;
//           border-color: var(--primary);
//         }

//         .pagination-page:hover:not(.active) {
//           background: var(--bg-light);
//         }

//         .pagination-ellipsis {
//           padding: 0.75rem 0.5rem;
//           color: var(--text-light);
//         }

//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 1rem;
//           z-index: 1000;
//         }

//         .modal {
//           background: white;
//           border-radius: var(--radius-lg);
//           box-shadow: var(--shadow-lg);
//           width: 100%;
//           max-width: 900px;
//           max-height: 90vh;
//           overflow-y: auto;
//           display: flex;
//           flex-direction: column;
//         }

//         .modal-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 1.5rem;
//           border-bottom: 1px solid var(--border);
//         }

//         .modal-title {
//           font-size: 1.5rem;
//           font-weight: 600;
//           margin: 0;
//         }

//         .modal-close {
//           background: transparent;
//           border: none;
//           cursor: pointer;
//           padding: 0.25rem;
//           border-radius: var(--radius-sm);
//           color: var(--text-light);
//         }

//         .modal-close:hover {
//           background: var(--bg-light);
//           color: var(--text);
//         }

//         .modal-body {
//           padding: 1.5rem;
//           flex: 1;
//           overflow-y: auto;
//         }

//         .modal-footer {
//           padding: 1.5rem;
//           border-top: 1px solid var(--border);
//           display: flex;
//           justify-content: flex-end;
//           gap: 0.75rem;
//         }

//         .order-details-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 1.5rem;
//           margin-bottom: 2rem;
//         }

//         .order-detail-section {
//           background: var(--bg-light);
//           border-radius: var(--radius-md);
//           padding: 1.5rem;
//         }

//         .order-detail-section h4 {
//           margin: 0 0 1rem 0;
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: var(--dark);
//         }

//         .order-detail-row {
//           display: flex;
//           margin-bottom: 0.75rem;
//         }

//         .order-detail-label {
//           width: 140px;
//           font-weight: 500;
//           color: var(--text-light);
//           flex-shrink: 0;
//         }

//         .order-detail-value {
//           flex: 1;
//           font-weight: 500;
//         }

//         .payment-method {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .order-items-section {
//           margin-bottom: 2rem;
//         }

//         .order-items-section h4 {
//           margin: 0 0 1rem 0;
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: var(--dark);
//         }

//         .no-items {
//           text-align: center;
//           padding: 1rem;
//           color: var(--text-light);
//         }

//         .order-summary-section {
//           margin-top: 2rem;
//         }

//         .order-summary-section h4 {
//           margin: 0 0 1rem 0;
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: var(--dark);
//         }

//         .order-summary {
//           background: var(--bg-light);
//           border-radius: var(--radius-md);
//           padding: 1.5rem;
//         }

//         .summary-row {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 0.75rem;
//         }

//         .summary-row.total {
//           margin-top: 0.75rem;
//           padding-top: 0.75rem;
//           border-top: 1px solid var(--border);
//           font-weight: 600;
//           font-size: 1.125rem;
//           color: var(--primary);
//         }

//         .summary-label {
//           font-weight: 500;
//         }

//         .summary-value {
//           font-weight: 600;
//         }

//         .form-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         .form-group {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//         }

//         .form-label {
//           font-weight: 500;
//           color: var(--text);
//         }

//         .form-input,
//         .form-select {
//           padding: 0.75rem;
//           border: 1px solid var(--border);
//           border-radius: var(--radius-md);
//           font-size: 1rem;
//         }

//         .form-input:disabled {
//           background: var(--bg-light);
//           color: var(--text-light);
//         }

//         .info-message {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 1rem;
//           background: #fef3c7;
//           color: #92400e;
//           border-radius: var(--radius-md);
//           margin-bottom: 1.5rem;
//         }

//         @media (max-width: 768px) {
//           .orders-page {
//             padding: 1rem;
//           }

//           .filters-bar {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .search-container {
//             min-width: auto;
//           }

//           .pagination {
//             flex-direction: column;
//           }

//           .pagination-pages {
//             order: 3;
//             width: 100%;
//             justify-content: center;
//             flex-wrap: wrap;
//           }

//           .modal {
//             margin: 0;
//             max-height: 100vh;
//             border-radius: 0;
//           }

//           .scroll-button {
//             width: 35px;
//             height: 35px;
//           }

//           .scroll-left {
//             left: 5px;
//           }

//           .scroll-right {
//             right: 5px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CounterOrders;

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  X,
  Check,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Loader,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

// Create axios instance for main API
const api = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create separate axios instance for restaurant menu API
const menuApi = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel/",
  headers: {
    "Content-Type": "application/json",
  },
});

const CounterOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuItems, setMenuItems] = useState([]); // Store restaurant menu items

  // State for modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    orderStatus: "",
    paymentStatus: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 7;

  // Scroll state
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [tableContainer, setTableContainer] = useState(null);

  // Fetch orders and related data on component mount or when filters change
  useEffect(() => {
    fetchBranches();
    fetchMenuItems();
    fetchOrders();
  }, [orderStatusFilter, paymentStatusFilter, branchFilter]);

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
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError(
        "Failed to load branches. Some filter options may not be available."
      );
    }
  };

  // Fetch restaurant menu items
  const fetchMenuItems = async () => {
    try {
      const response = await menuApi.get("/restaurant-menu");

      // Handle different possible response structures
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
        setError("Failed to load menu items for filtering.");
        return;
      }

      setMenuItems(items);
      console.log("Restaurant menu items fetched:", items.length);
    } catch (error) {
      console.error("Error fetching restaurant menu items:", error);
      setError("Failed to load menu items. Item filter may not work properly.");
    }
  };

  // Fetch all counter orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    setAllOrders([]);
    setFilteredOrders([]);
    setDisplayedOrders([]);

    try {
      const response = await api.get("/counter-order/orders");

      if (!response.data.orders || !Array.isArray(response.data.orders)) {
        throw new Error("Invalid response format: orders array missing");
      }

      const formattedOrders = response.data.orders
        .map((order, index) => {
          const itemNames =
            order.items?.map((item) => item.name).join(", ") || "No items";
          const firstItemName = order.items?.[0]?.name || "No items";
          const itemsCount = order.items?.length || 0;

          return {
            id: order.id || `temp-id-${index}`,
            customerName: order.customerName || "Unknown Customer",
            phoneNumber: order.phoneNumber || "N/A",
            counterUser: order.userId?.name || "Unknown Counter User",
            counterUserId: order.userId?.id || null,
            date: new Date(order.createdAt || Date.now()).toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            branch: order.branch?.name || "Unknown Branch",
            branchId: order.branch?.id || null,
            invoice: order.invoice?.invoiceNumber || "N/A",
            items: order.items?.length || 0,
            itemNames: itemNames,
            firstItemName: firstItemName,
            itemsCount: itemsCount,
            subtotal: order.subtotal || order.totalAmount || 0,
            tax: order.tax || 0,
            serviceCharge: order.serviceCharge || 0,
            grandTotal: order.grandTotal || order.totalAmount || 0,
            amount: `₹${(order.grandTotal || order.totalAmount || 0).toFixed(
              2
            )}`,
            totalAmount: order.totalAmount || 0,
            orderStatus: order.orderStatus || "pending",
            paymentMethod: order.paymentMethod || "cash",
            paymentStatus: order.paymentStatus || "pending",
            cancellationReason: order.cancellationReason || "",
            cancelledAt: order.cancelledAt || null,
            originalOrder: order,
          };
        })
        .filter((order) => order.id);

      // Apply server-side filters
      let filteredData = formattedOrders;

      if (orderStatusFilter !== "all") {
        filteredData = filteredData.filter(
          (order) => order.orderStatus === orderStatusFilter
        );
      }

      if (paymentStatusFilter !== "all") {
        filteredData = filteredData.filter(
          (order) => order.paymentStatus === paymentStatusFilter
        );
      }

      if (branchFilter !== "all") {
        filteredData = filteredData.filter(
          (order) => order.branchId === branchFilter
        );
      }

      setAllOrders(filteredData);
    } catch (error) {
      console.error("Error fetching counter orders:", error);
      setError(
        "Failed to load counter orders. Please refresh the page and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search filtering and pagination
  useEffect(() => {
    const filtered = allOrders.filter((order) => {
      if (!searchTerm.trim()) return true;

      const customerName = order.customerName || "";
      const phoneNumber = order.phoneNumber || "";
      const counterUser = order.counterUser || "";
      const invoice = order.invoice || "";
      const itemNames = order.itemNames || "";
      const searchLower = searchTerm.trim().toLowerCase();

      return (
        customerName.toLowerCase().includes(searchLower) ||
        phoneNumber.toLowerCase().includes(searchLower) ||
        counterUser.toLowerCase().includes(searchLower) ||
        invoice.toLowerCase().includes(searchLower) ||
        itemNames.toLowerCase().includes(searchLower)
      );
    });

    // Apply item filter
    let itemFiltered = filtered;
    if (itemFilter !== "all") {
      itemFiltered = itemFiltered.filter((order) =>
        order.itemNames.toLowerCase().includes(itemFilter.toLowerCase())
      );
    }

    setFilteredOrders(itemFiltered);
    setTotalPages(Math.ceil(itemFiltered.length / ordersPerPage));
    setCurrentPage(1);
  }, [allOrders, searchTerm, itemFilter]);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    setDisplayedOrders(paginatedOrders);
  }, [filteredOrders, currentPage]);

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled in the filteredOrders useEffect
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSubmitting(true);

    try {
      if (editFormData.orderStatus !== selectedOrder.orderStatus) {
        await api.put(
          `/counter-order/orders/${selectedOrder.id}/order-status`,
          {
            orderStatus: editFormData.orderStatus,
          }
        );
      }

      if (editFormData.paymentStatus !== selectedOrder.paymentStatus) {
        await api.put(
          `/counter-order/orders/${selectedOrder.id}/payment-status`,
          {
            paymentStatus: editFormData.paymentStatus,
          }
        );
      }

      await fetchOrders();

      setEditModalOpen(false);
      setSuccessMessage(
        `Counter order ${selectedOrder.invoice} updated successfully`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating counter order:", error);
      alert("Failed to update counter order. Please try again.");
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
    } else if (type === "paymentStatus") {
      setPaymentStatusFilter(value);
    } else if (type === "branch") {
      setBranchFilter(value);
    } else if (type === "item") {
      setItemFilter(value);
    }
    setCurrentPage(1);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard size={16} />;
      case "upi":
        return <IndianRupee size={16} />;
      case "qr":
        return <IndianRupee size={16} />;
      case "cash":
      default:
        return <IndianRupee size={16} />;
    }
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
      "Customer Name,Phone,Counter User,Date,Branch,Invoice,Items,Item Names,Subtotal,Tax,Service Charge,Grand Total,Payment Method,Order Status,Payment Status\n";

    filteredOrders.forEach((order) => {
      csv += `"${order.customerName}","${order.phoneNumber}","${
        order.counterUser
      }","${order.date}","${order.branch}","${order.invoice}",${order.items},"${
        order.itemNames
      }","₹${order.subtotal.toFixed(2)}","₹${order.tax.toFixed(
        2
      )}","₹${order.serviceCharge.toFixed(2)}","${order.amount}","${
        order.paymentMethod
      }","${order.orderStatus}","${order.paymentStatus}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `counter-orders-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    <div className="orders-page">
      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <Check size={16} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Counter Orders</h1>
          <p>Manage and review all counter order transactions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={exportOrders}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="filters-bar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer name, phone, counter user, invoice, or items..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <div className="filter-group">
              <Filter size={16} />
              <select
                className="filter-select"
                value={orderStatusFilter}
                onChange={(e) =>
                  handleFilterChange("orderStatus", e.target.value)
                }
              >
                <option value="all">All Order Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <Filter size={16} />
              <select
                className="filter-select"
                value={paymentStatusFilter}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="filter-group">
              <Filter size={16} />
              <select
                className="filter-select"
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
            </div>
            <div className="filter-group">
              <Filter size={16} />
              <select
                className="filter-select"
                value={itemFilter}
                onChange={(e) => handleFilterChange("item", e.target.value)}
              >
                <option value="all">All Items</option>
                {menuItems
                  .map((item) => item.itemName || item.name)
                  .filter((name) => name && name !== "Unknown Item")
                  .sort()
                  .map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-container">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="data-card">
          {loading ? (
            <div className="loading-container">
              <Loader size={24} className="animate-spin" />
              <p>Loading counter orders...</p>
            </div>
          ) : (
            <div className="table-container-wrapper">
              {/* Scroll indicators */}
              {showLeftScroll && (
                <button
                  className="scroll-button scroll-left"
                  onClick={scrollLeft}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {showRightScroll && (
                <button
                  className="scroll-button scroll-right"
                  onClick={scrollRight}
                >
                  <ChevronRight size={20} />
                </button>
              )}

              <div className="table-container" ref={setTableContainer}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Counter User</th>
                      <th>Date</th>
                      <th>Branch</th>
                      <th>Invoice</th>
                      <th>Items (Count)</th>
                      <th>Item Names</th>
                      <th>Amount</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedOrders.length > 0 ? (
                      displayedOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.customerName}</td>
                          <td>{order.phoneNumber}</td>
                          <td>{order.counterUser}</td>
                          <td>{order.date}</td>
                          <td>{order.branch}</td>
                          <td>{order.invoice}</td>
                          <td>
                            <span className="items-count-badge">
                              {order.itemsCount}
                            </span>
                          </td>
                          <td>
                            <div
                              className="items-names"
                              title={order.itemNames}
                            >
                              {order.itemsCount === 0 ? (
                                "No items"
                              ) : order.itemsCount === 1 ? (
                                order.firstItemName
                              ) : (
                                <>
                                  {order.firstItemName}
                                  <span className="more-items">
                                    {" "}
                                    +{order.itemsCount - 1} more
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>{order.amount}</td>
                          <td>
                            <span
                              className={`status-badge ${order.orderStatus}`}
                            >
                              {order.orderStatus.charAt(0).toUpperCase() +
                                order.orderStatus.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${order.paymentStatus}`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() +
                                order.paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn view"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="action-btn edit"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="no-orders">
                          No counter orders found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {totalPages > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="pagination-pages">
              {getPaginationRange().map((page, index) =>
                page === "..." ? (
                  <span key={index} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    className={`pagination-page ${
                      currentPage === page ? "active" : ""
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
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || loading}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Counter Order Details - {selectedOrder.invoice}
              </h3>
              <button className="modal-close" onClick={closeViewModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="order-detail-section">
                  <h4>Customer Information</h4>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Customer Name</div>
                    <div className="order-detail-value">
                      {selectedOrder.customerName}
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Phone Number</div>
                    <div className="order-detail-value">
                      {selectedOrder.phoneNumber}
                    </div>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h4>Order Information</h4>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Counter User</div>
                    <div className="order-detail-value">
                      {selectedOrder.counterUser}
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Date</div>
                    <div className="order-detail-value">
                      {selectedOrder.date}
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Branch</div>
                    <div className="order-detail-value">
                      {selectedOrder.branch}
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Invoice Number</div>
                    <div className="order-detail-value">
                      {selectedOrder.invoice}
                    </div>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h4>Status Information</h4>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Order Status</div>
                    <div className="order-detail-value">
                      <span
                        className={`status-badge ${selectedOrder.orderStatus}`}
                      >
                        {selectedOrder.orderStatus.charAt(0).toUpperCase() +
                          selectedOrder.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Payment Status</div>
                    <div className="order-detail-value">
                      <span
                        className={`status-badge ${selectedOrder.paymentStatus}`}
                      >
                        {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                          selectedOrder.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="order-detail-row">
                    <div className="order-detail-label">Payment Method</div>
                    <div className="order-detail-value">
                      <div className="payment-method">
                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                        <span>
                          {selectedOrder.paymentMethod
                            ? selectedOrder.paymentMethod
                                .charAt(0)
                                .toUpperCase() +
                              selectedOrder.paymentMethod.slice(1)
                            : "Cash"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedOrder.cancellationReason && (
                    <div className="order-detail-row">
                      <div className="order-detail-label">
                        Cancellation Reason
                      </div>
                      <div className="order-detail-value">
                        {selectedOrder.cancellationReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-items-section">
                <h4>Order Items ({selectedOrder.itemsCount})</h4>
                <div className="order-items-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.originalOrder?.items?.length > 0 ? (
                        selectedOrder.originalOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price.toFixed(2)}</td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-items">
                            No items available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="order-summary-section">
                <h4>Order Summary</h4>
                <div className="order-summary">
                  <div className="summary-row">
                    <div className="summary-label">Subtotal</div>
                    <div className="summary-value">
                      ₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="summary-row">
                      <div className="summary-label">Tax</div>
                      <div className="summary-value">
                        ₹{selectedOrder.tax?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  )}
                  {selectedOrder.serviceCharge > 0 && (
                    <div className="summary-row">
                      <div className="summary-label">Service Charge</div>
                      <div className="summary-value">
                        ₹{selectedOrder.serviceCharge?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  )}
                  <div className="summary-row total">
                    <div className="summary-label">Grand Total</div>
                    <div className="summary-value">
                      ₹{selectedOrder.grandTotal?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeViewModal}>
                Close
              </button>
              <button
                className="btn btn-primary"
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
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Edit Counter Order - {selectedOrder.invoice}
              </h3>
              <button className="modal-close" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    value={selectedOrder.customerName}
                    className="form-input"
                    disabled={true}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={selectedOrder.phoneNumber}
                    className="form-input"
                    disabled={true}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Counter User</label>
                  <input
                    type="text"
                    value={selectedOrder.counterUser}
                    className="form-input"
                    disabled={true}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    value={selectedOrder.branch}
                    className="form-input"
                    disabled={true}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Order Status</label>
                  <select
                    name="orderStatus"
                    value={editFormData.orderStatus}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={editFormData.paymentStatus}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="info-message">
                <AlertCircle size={16} />
                <span>Only order status and payment status can be updated</span>
              </div>

              <div className="order-items-section">
                <h4>Order Items ({selectedOrder.itemsCount})</h4>
                <div className="order-items-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.originalOrder?.items?.length > 0 ? (
                        selectedOrder.originalOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price.toFixed(2)}</td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-items">
                            No items available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={closeEditModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
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

      <style jsx>{`
        :root {
          --primary: #4361ee;
          --primary-light: #4895ef;
          --secondary: #3f37c9;
          --success: #4cc9f0;
          --danger: #f72585;
          --warning: #f8961e;
          --info: #4895ef;
          --dark: #212529;
          --light: #f8f9fa;
          --gray: #6c757d;
          --gray-light: #ced4da;
          --border: #dee2e6;
          --bg-white: #ffffff;
          --bg-light: #f8f9fa;
          --text: #212529;
          --text-light: #6c757d;
          --radius-sm: 0.25rem;
          --radius-md: 0.375rem;
          --radius-lg: 0.5rem;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24);
          --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .orders-page {
          padding: 2rem;
          background-color: #f5f7fb;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, sans-serif;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .success-message button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          color: #166534;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 0.5rem 0;
        }

        .page-header p {
          color: var(--gray);
          margin: 0;
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .btn-outline {
          background: transparent;
          border-color: var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--bg-light);
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--secondary);
        }

        .dashboard-card {
          background: var(--bg-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
          height: 1.25rem;
          width: 1.25rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }

        .filter-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-white);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .error-container {
          margin: 1.5rem;
          padding: 1rem 1.5rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .data-card {
          position: relative;
        }

        .table-container-wrapper {
          position: relative;
          width: 100%;
        }

        .scroll-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all 0.2s;
        }

        .scroll-button:hover {
          background: var(--primary);
          color: white;
        }

        .scroll-left {
          left: 10px;
        }

        .scroll-right {
          right: 10px;
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .data-table th {
          text-align: left;
          padding: 1rem;
          font-weight: 600;
          color: var(--text-light);
          border-bottom: 1px solid var(--border);
          background: var(--bg-light);
          white-space: nowrap;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .items-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem 0.5rem;
          background: var(--primary);
          color: white;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 1.5rem;
        }

        .items-names {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .more-items {
          color: var(--gray);
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status-badge.failed {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status-badge.refunded {
          background: #fef3c7;
          color: #92400e;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .action-btn.view {
          background: #dbeafe;
          color: #1e40af;
        }

        .action-btn.view:hover {
          background: #bfdbfe;
        }

        .action-btn.edit {
          background: #fef3c7;
          color: #92400e;
        }

        .action-btn.edit:hover {
          background: #fde68a;
        }

        .no-orders {
          text-align: center;
          padding: 2rem;
          color: var(--text-light);
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--border);
          background: var(--bg-white);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--bg-light);
        }

        .pagination-pages {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-page {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--border);
          background: var(--bg-white);
          min-width: 2.75rem;
        }

        .pagination-page.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .pagination-page:hover:not(.active) {
          background: var(--bg-light);
        }

        .pagination-ellipsis {
          padding: 0.75rem 0.5rem;
          color: var(--text-light);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          color: var(--text-light);
        }

        .modal-close:hover {
          background: var(--bg-light);
          color: var(--text);
        }

        .modal-body {
          padding: 1.5rem;
          flex: 1;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .order-detail-section {
          background: var(--bg-light);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }

        .order-detail-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--dark);
        }

        .order-detail-row {
          display: flex;
          margin-bottom: 0.75rem;
        }

        .order-detail-label {
          width: 140px;
          font-weight: 500;
          color: var(--text-light);
          flex-shrink: 0;
        }

        .order-detail-value {
          flex: 1;
          font-weight: 500;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .order-items-section {
          margin-bottom: 2rem;
        }

        .order-items-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--dark);
        }

        .no-items {
          text-align: center;
          padding: 1rem;
          color: var(--text-light);
        }

        .order-summary-section {
          margin-top: 2rem;
        }

        .order-summary-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--dark);
        }

        .order-summary {
          background: var(--bg-light);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .summary-row.total {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border);
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--primary);
        }

        .summary-label {
          font-weight: 500;
        }

        .summary-value {
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: var(--text);
        }

        .form-input,
        .form-select {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
        }

        .form-input:disabled {
          background: var(--bg-light);
          color: var(--text-light);
        }

        .info-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .orders-page {
            padding: 1rem;
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: auto;
          }

          .pagination {
            flex-direction: column;
          }

          .pagination-pages {
            order: 3;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .modal {
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
          }

          .scroll-button {
            width: 35px;
            height: 35px;
          }

          .scroll-left {
            left: 5px;
          }

          .scroll-right {
            right: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default CounterOrders;
