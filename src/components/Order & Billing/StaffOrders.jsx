// import { useState, useEffect } from "react"
// import { Search, Download, X, Check, AlertCircle, CreditCard, IndianRupee, Loader, Users } from "lucide-react"
// import axios from "axios"

// // Create axios instance
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// const StaffOrders = () => {
//   const [allOrders, setAllOrders] = useState([])
//   const [displayedOrders, setDisplayedOrders] = useState([])
//   const [filteredOrders, setFilteredOrders] = useState([])
//   const [branches, setBranches] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   // State for modals
//   const [viewModalOpen, setViewModalOpen] = useState(false)
//   const [editModalOpen, setEditModalOpen] = useState(false)
//   const [selectedOrder, setSelectedOrder] = useState(null)
//   const [editFormData, setEditFormData] = useState({
//     status: "",
//     paymentStatus: "",
//     paymentMethod: "",
//   })
//   const [successMessage, setSuccessMessage] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // State for filters
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [branchFilter, setBranchFilter] = useState("all")
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
//   const [orderTypeFilter, setOrderTypeFilter] = useState("all")

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const ordersPerPage = 7

//   // Fetch orders and branches on component mount or when filters change
//   useEffect(() => {
//     fetchBranches()
//     fetchOrders()
//   }, [statusFilter, branchFilter, paymentStatusFilter, orderTypeFilter])

//   // Fetch all branches
//   const fetchBranches = async () => {
//     try {
//       const response = await api.get("/branch")
//       setBranches(response.data)
//     } catch (error) {
//       console.error("Error fetching branches:", error)
//       setError("Failed to load branches. Some filter options may not be available.")
//     }
//   }

//   // Fetch all orders (both staff and guest orders)
//   const fetchOrders = async () => {
//     setLoading(true)
//     setError("")
//     setAllOrders([])
//     setFilteredOrders([])
//     setDisplayedOrders([])

//     try {
//       // Build query parameters
//       const params = {}

//       // Add filters if they're not set to "all"
//       if (statusFilter !== "all") {
//         params.status = statusFilter
//       }

//       if (branchFilter !== "all") {
//         params.branchId = branchFilter
//       }

//       if (paymentStatusFilter !== "all") {
//         params.paymentStatus = paymentStatusFilter
//       }

//       if (orderTypeFilter !== "all") {
//         params.orderType = orderTypeFilter
//       }

//       // Add search term if present
//       if (searchTerm.trim()) {
//         params.search = searchTerm.trim()
//       }

//       /* console.log("Fetching orders with params:", params) */

//       // Use the updated staff order endpoint that handles both staff and guest orders
//       const response = await api.get("/staff-order", { params })
//      /*  console.log("API response:", response.data)
//  */
//       if (!response.data.orders || !Array.isArray(response.data.orders)) {
//         throw new Error("Invalid response format: orders array missing")
//       }

//       // Format orders for display
//       const formattedOrders = response.data.orders
//         .map((order, index) => {
//           return {
//             id: order._id || `temp-id-${index}`,
//             orderId: order.orderId || `UNKNOWN-${index}`,
//             customer: order.isGuestOrder ? order.customerName : order.userId?.name || "Unknown Staff",
//             customerType: order.isGuestOrder ? "Guest" : "Staff",
//             customerMobile: order.isGuestOrder ? order.customerMobile : order.userId?.mobile || "N/A",
//             date: new Date(order.orderTime || order.createdAt || Date.now()).toLocaleString("en-US", {
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             branch: order.branchName || "Unknown Branch",
//             branchId: order.branchId?._id || null,
//             tableNumber: order.tableNumber || "N/A",
//             peopleCount: order.peopleCount || 0,
//             items: order.items?.length || 0,
//             amount: `₹${order.grandTotal?.toFixed(2) || "0.00"}`,
//             status: order.status || "pending",
//             paymentMethod: order.paymentMethod || "cash",
//             paymentStatus: order.paymentStatus || "pending",
//             subtotal: order.subtotal || 0,
//             tax: order.tax || 0,
//             serviceCharge: order.serviceCharge || 0,
//             grandTotal: order.grandTotal || 0,
//             originalOrder: order,
//             isGuestOrder: order.isGuestOrder || false,
//           }
//         })
//         .filter((order) => order.id)

//       setAllOrders(formattedOrders)
//     } catch (error) {
//       console.error("Error fetching orders:", error)
//       setError("Failed to load orders. Please refresh the page and try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Handle search filtering and pagination
//   useEffect(() => {
//     const filtered = allOrders.filter((order) => {
//       if (!searchTerm.trim()) return true

//       const orderId = order.orderId || ""
//       const tableNumber = order.tableNumber || ""
//       const customer = order.customer || ""
//       const customerMobile = order.customerMobile || ""
//       const searchLower = searchTerm.trim().toLowerCase()

//       return (
//         orderId.toLowerCase().includes(searchLower) ||
//         tableNumber.toLowerCase().includes(searchLower) ||
//         customer.toLowerCase().includes(searchLower) ||
//         customerMobile.toLowerCase().includes(searchLower)
//       )
//     })
//     setFilteredOrders(filtered)
//     setTotalPages(Math.ceil(filtered.length / ordersPerPage))
//     setCurrentPage(1)
//   }, [allOrders, searchTerm])

//   // Handle pagination
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * ordersPerPage
//     const endIndex = startIndex + ordersPerPage
//     const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
//     setDisplayedOrders(paginatedOrders)
//   }, [filteredOrders, currentPage])

//   // Handle view order
//   const handleViewOrder = (order) => {
//     setSelectedOrder(order)
//     setViewModalOpen(true)
//   }

//   // Handle edit order
//   const handleEditOrder = (order) => {
//     setSelectedOrder(order)
//     setEditFormData({
//       status: order.status,
//       paymentStatus: order.paymentStatus,
//       paymentMethod: order.paymentMethod,
//     })
//     setEditModalOpen(true)
//   }

//   // Handle form input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setEditFormData({
//       ...editFormData,
//       [name]: value,
//     })
//   }

//   // Handle save changes
//   const handleSaveChanges = async () => {
//     setIsSubmitting(true)

//     try {
//       // Use the same endpoint for both staff and guest orders
//       await api.put(`/staff-order/${selectedOrder.id}/status`, {
//         status: editFormData.status,
//         paymentStatus: editFormData.paymentStatus,
//         paymentMethod: editFormData.paymentMethod,
//       })

//       // Refresh orders
//       await fetchOrders()

//       setEditModalOpen(false)
//       setSuccessMessage(`Order ${selectedOrder.orderId} updated successfully`)

//       // Auto-hide success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("")
//       }, 3000)
//     } catch (error) {
//       console.error("Error updating order:", error)
//       alert("Failed to update order. Please try again.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Close modals
//   const closeViewModal = () => {
//     setViewModalOpen(false)
//     setSelectedOrder(null)
//   }

//   const closeEditModal = () => {
//     setEditModalOpen(false)
//     setSelectedOrder(null)
//   }

//   // Reset pagination when filters change
//   const handleFilterChange = (type, value) => {
//     if (type === "status") {
//       setStatusFilter(value)
//     } else if (type === "branch") {
//       setBranchFilter(value)
//     } else if (type === "paymentStatus") {
//       setPaymentStatusFilter(value)
//     } else if (type === "orderType") {
//       setOrderTypeFilter(value)
//     }
//     setCurrentPage(1)
//   }

//   // Get payment method icon
//   const getPaymentMethodIcon = (method) => {
//     switch (method?.toLowerCase()) {
//       case "card":
//         return <CreditCard size={16} />
//       case "upi":
//         return <IndianRupee size={16} />
//       case "cash":
//       default:
//         return <IndianRupee size={16} />
//     }
//   }

//   // Get payment status class
//   const getPaymentStatusClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "completed"
//       case "pending":
//         return "pending"
//       case "failed":
//         return "cancelled"
//       case "refunded":
//         return "preparing"
//       default:
//         return "pending"
//     }
//   }

//   // Export orders as CSV
//   const exportOrders = () => {
//     let csv =
//       "Order ID,Customer,Customer Type,Mobile,Date,Branch,Table,People,Items,Amount,Payment Method,Payment Status,Order Status\n"

//     filteredOrders.forEach((order) => {
//       csv += `${order.orderId},"${order.customer}",${order.customerType},"${order.customerMobile}","${order.date}","${order.branch}",${order.tableNumber},${order.peopleCount},${order.items},${order.amount},${order.paymentMethod},${order.paymentStatus},${order.status}\n`
//     })

//     const blob = new Blob([csv], { type: "text/csv" })
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.setAttribute("hidden", "")
//     a.setAttribute("href", url)
//     a.setAttribute("download", `all-orders-export-${new Date().toISOString().slice(0, 10)}.csv`)
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//   }

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
//         <h1>All Orders (Staff & Guest)</h1>
//         <div className="header-actions">
//           <button className="btn btn-outline" onClick={exportOrders}>
//             <Download size={16} />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       <div className="filters-bar">
//         <div className="search-container">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search by order ID, table, customer name, or mobile..."
//             className="search-input"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <div className="filter-buttons">
//           <select
//             className="filter-select"
//             value={orderTypeFilter}
//             onChange={(e) => handleFilterChange("orderType", e.target.value)}
//           >
//             <option value="all">All Orders</option>
//             <option value="staff">Staff Orders</option>
//             <option value="guest">Guest Orders</option>
//           </select>
//           <select
//             className="filter-select"
//             value={statusFilter}
//             onChange={(e) => handleFilterChange("status", e.target.value)}
//           >
//             <option value="all">All Status</option>
//             <option value="pending">Pending</option>
//             <option value="preparing">Preparing</option>
//             <option value="served">Served</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//           <select
//             className="filter-select"
//             value={paymentStatusFilter}
//             onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
//           >
//             <option value="all">All Payment Status</option>
//             <option value="pending">Payment Pending</option>
//             <option value="completed">Payment Completed</option>
//             <option value="failed">Payment Failed</option>
//             <option value="refunded">Refunded</option>
//           </select>
//           <select
//             className="filter-select"
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
//         </div>
//       </div>

//       {/* Error message */}
//       {error && (
//         <div className="error-container">
//           <AlertCircle size={18} />
//           <span>{error}</span>
//         </div>
//       )}

//       <div className="data-card">
//         {loading ? (
//           <div className="loading-container">
//             <Loader size={24} className="animate-spin" />
//             <p>Loading orders...</p>
//           </div>
//         ) : (
//           <div className="table-container">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Order By</th>
//                   <th>Type</th>
//                   <th>Mobile</th>
//                   <th>Date</th>
//                   <th>Branch</th>
//                   <th>Table</th>
//                   <th>People</th>
//                   <th>Items</th>
//                   <th>Amount</th>
//                   <th>Order Status</th>
//                   <th>Payment Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {displayedOrders.length > 0 ? (
//                   displayedOrders.map((order) => (
//                     <tr key={order.id}>
//                       <td data-label="Order ID">{order.orderId}</td>
//                       <td data-label="Customer">{order.customer}</td>
//                       <td data-label="Type">
//                         <span className={`customer-type-badge ${order.isGuestOrder ? "guest" : "staff"}`}>
//                           {order.customerType}
//                         </span>
//                       </td>
//                       <td data-label="Mobile">{order.customerMobile}</td>
//                       <td data-label="Date">{order.date}</td>
//                       <td data-label="Branch">{order.branch}</td>
//                       <td data-label="Table">{order.tableNumber}</td>
//                       <td data-label="People">
//                         <div className="people-count">
//                           <Users size={14} />
//                           {order.peopleCount}
//                         </div>
//                       </td>
//                       <td data-label="Items">{order.items}</td>
//                       <td data-label="Amount">{order.amount}</td>
//                       <td data-label="Order Status">
//                         <span className={`status-badge ${order.status}`}>
//                           {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                         </span>
//                       </td>
//                       <td data-label="Payment Status">
//                         <span className={`status-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
//                           {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
//                         </span>
//                       </td>
//                       <td data-label="Actions">
//                         <div className="action-buttons">
//                           <button className="action-btn view" onClick={() => handleViewOrder(order)}>
//                             View
//                           </button>
//                           <button className="action-btn edit" onClick={() => handleEditOrder(order)}>
//                             Edit
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="13" className="no-orders">
//                       No orders found matching your criteria
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {totalPages > 0 && (
//         <div className="pagination">
//           <button
//             className="pagination-btn"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1 || loading}
//           >
//             Previous
//           </button>

//           <div className="pagination-pages">
//             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//               let pageNum
//               if (totalPages <= 5) {
//                 pageNum = i + 1
//               } else if (currentPage <= 3) {
//                 pageNum = i + 1
//               } else if (currentPage >= totalPages - 2) {
//                 pageNum = totalPages - 4 + i
//               } else {
//                 pageNum = currentPage - 2 + i
//               }

//               return (
//                 <button
//                   key={pageNum}
//                   className={`pagination-page ${currentPage === pageNum ? "active" : ""}`}
//                   onClick={() => setCurrentPage(pageNum)}
//                   disabled={loading}
//                 >
//                   {pageNum}
//                 </button>
//               )
//             })}

//             {totalPages > 5 && currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <button
//                 className={`pagination-page ${currentPage === totalPages ? "active" : ""}`}
//                 onClick={() => setCurrentPage(totalPages)}
//                 disabled={loading}
//               >
//                 {totalPages}
//               </button>
//             )}
//           </div>

//           <button
//             className="pagination-btn"
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages || loading}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* View Order Modal */}
//       {viewModalOpen && selectedOrder && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order Details {selectedOrder.orderId}
//               </h3>
//               <button className="modal-close" onClick={closeViewModal}>
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="order-details">
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Order By</div>
//                   <div className="order-detail-value">
//                     {selectedOrder.customer}
//                     <span
//                       className={`customer-type-badge ${selectedOrder.isGuestOrder ? "guest" : "staff"}`}
//                       style={{ marginLeft: "8px" }}
//                     >
//                       {selectedOrder.customerType}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Mobile Number</div>
//                   <div className="order-detail-value">{selectedOrder.customerMobile}</div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Date</div>
//                   <div className="order-detail-value">{selectedOrder.date}</div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Branch</div>
//                   <div className="order-detail-value">{selectedOrder.branch}</div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Table Number</div>
//                   <div className="order-detail-value">{selectedOrder.tableNumber}</div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Number of People</div>
//                   <div className="order-detail-value">
//                     <div className="people-count">
//                       <Users size={16} />
//                       {selectedOrder.peopleCount}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Order Status</div>
//                   <div className="order-detail-value">
//                     <span className={`status-badge ${selectedOrder.status}`}>
//                       {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Payment Method</div>
//                   <div className="order-detail-value">
//                     <div className="payment-method-display">
//                       {getPaymentMethodIcon(selectedOrder.paymentMethod)}
//                       <span>
//                         {selectedOrder.paymentMethod
//                           ? selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1)
//                           : "Cash"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Payment Status</div>
//                   <div className="order-detail-value">
//                     <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
//                       {selectedOrder.paymentStatus
//                         ? selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)
//                         : "Pending"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="order-items-section">
//                 <h4>Price Details</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <tbody>
//                       <tr>
//                         <td>Subtotal</td>
//                         <td style={{ textAlign: "right" }}>₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}</td>
//                       </tr>
//                       <tr>
//                         <td>Tax (5%)</td>
//                         <td style={{ textAlign: "right" }}>₹{selectedOrder.tax?.toFixed(2) || "0.00"}</td>
//                       </tr>
//                       <tr>
//                         <td>Service Charge (10%)</td>
//                         <td style={{ textAlign: "right" }}>₹{selectedOrder.serviceCharge?.toFixed(2) || "0.00"}</td>
//                       </tr>
//                       <tr style={{ fontWeight: "bold" }}>
//                         <td>Total Amount</td>
//                         <td style={{ textAlign: "right" }}>₹{selectedOrder.grandTotal?.toFixed(2) || "0.00"}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div className="order-items-section">
//                 <h4>Order Items</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
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
//                           <td colSpan="4" style={{ textAlign: "center" }}>
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
//               <button className="btn btn-outline" onClick={closeViewModal}>
//                 Close
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={() => {
//                   closeViewModal()
//                   handleEditOrder(selectedOrder)
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
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 Edit {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order {selectedOrder.orderId}
//               </h3>
//               <button className="modal-close" onClick={closeEditModal}>
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">Order By</label>
//                 <input type="text" value={selectedOrder.customer} className="form-input" disabled={true} />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Customer Type</label>
//                 <input type="text" value={selectedOrder.customerType} className="form-input" disabled={true} />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Mobile Number</label>
//                 <input type="text" value={selectedOrder.customerMobile} className="form-input" disabled={true} />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Branch</label>
//                 <input type="text" value={selectedOrder.branch} className="form-input" disabled={true} />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Table Number</label>
//                 <input type="text" value={selectedOrder.tableNumber} className="form-input" disabled={true} />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Order Status</label>
//                 <select name="status" value={editFormData.status} onChange={handleInputChange} className="form-select">
//                   <option value="pending">Pending</option>
//                   <option value="preparing">Preparing</option>
//                   <option value="served">Served</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Payment Status</label>
//                 <select
//                   name="paymentStatus"
//                   value={editFormData.paymentStatus}
//                   onChange={handleInputChange}
//                   className="form-select"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="completed">Completed</option>
//                   <option value="failed">Failed</option>
//                   <option value="refunded">Refunded</option>
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Payment Method</label>
//                 <select
//                   name="paymentMethod"
//                   value={editFormData.paymentMethod}
//                   onChange={handleInputChange}
//                   className="form-select"
//                 >
//                   <option value="cash">Cash</option>
//                   <option value="card">Card</option>
//                   <option value="upi">UPI</option>
//                   <option value="netbanking">Net Banking</option>
//                   <option value="wallet">Wallet</option>
//                 </select>
//               </div>

//               <div className="order-items-section">
//                 <div className="section-header">
//                   <h4>Order Items</h4>
//                   <div className="alert-message">
//                     <AlertCircle size={16} />
//                     <span>Order status and payment status can be updated</span>
//                   </div>
//                 </div>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
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
//                           <td colSpan="4" style={{ textAlign: "center" }}>
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
//               <button className="btn btn-outline" onClick={closeEditModal} disabled={isSubmitting}>
//                 Cancel
//               </button>
//               <button className="btn btn-primary" onClick={handleSaveChanges} disabled={isSubmitting}>
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
//         /* Base Styles */
//         .orders-page {
//           padding: 20px;
//           max-width: 100%;
//           margin: 0 auto;
//           background: #f8fafc;
//           min-height: 100vh;
//         }

//         /* Success Message */
//         .success-message {
//           position: fixed;
//           top: 20px;
//           right: 20px;
//           background: #10b981;
//           color: white;
//           padding: 12px 16px;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           z-index: 1000;
//           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//         }

//         .success-message button {
//           background: none;
//           border: none;
//           color: white;
//           cursor: pointer;
//           padding: 4px;
//           border-radius: 4px;
//         }

//         .success-message button:hover {
//           background: rgba(255, 255, 255, 0.2);
//         }

//         /* Page Header */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//           flex-wrap: wrap;
//           gap: 16px;
//         }

//         .page-header h1 {
//           font-size: 28px;
//           font-weight: 700;
//           color: #1f2937;
//           margin: 0;
//         }

//         .header-actions {
//           display: flex;
//           gap: 12px;
//         }

//         .btn {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 16px;
//           border-radius: 8px;
//           font-size: 14px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           border: none;
//         }

//         .btn-outline {
//           background: white;
//           color: #374151;
//           border: 1px solid #d1d5db;
//         }

//         .btn-outline:hover {
//           background: #f9fafb;
//           border-color: #9ca3af;
//         }

//         .btn-primary {
//           background: #d97706;
//           color: white;
//         }

//         .btn-primary:hover {
//           background: #d97706;
//         }

//         .btn-primary:disabled {
//           background: #9ca3af;
//           cursor: not-allowed;
//         }

//         /* Filters Bar */
//         .filters-bar {
//           background: white;
//           padding: 20px;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           margin-bottom: 24px;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .search-container {
//           position: relative;
//           flex: 1;
//           min-width: 300px;
//         }

//         .search-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//           pointer-events: none;
//         }

//         .search-input {
//           width: 100%;
//           padding: 12px 12px 12px 40px;
//           border: 1px solid #d1d5db;
//           border-radius: 8px;
//           font-size: 14px;
//           outline: none;
//           background: white;
//         }

//         .search-input:focus {
//           border-color: #d97706;
//           box-shadow: 0 0 0 3px rgba(221, 124, 2, 0.1);
//         }

//         .filter-buttons {
//           display: flex;
//           gap: 12px;
//           flex-wrap: wrap;
//         }

//         .filter-select {
//           padding: 10px 12px;
//           border: 1px solid #d1d5db;
//           border-radius: 8px;
//           font-size: 14px;
//           background: white;
//           min-width: 150px;
//           outline: none;
//           cursor: pointer;
//         }

//         .filter-select:focus {
//           border-color: #d97706;
//           box-shadow: 0 0 0 3px rgba(221, 124, 2, 0.1);
//         }

//         /* Error Container */
//         .error-container {
//           margin: 20px 0;
//           padding: 12px 16px;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           border: 1px solid #fecaca;
//         }

//         /* Data Card */
//         .data-card {
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           overflow: hidden;
//           margin-bottom: 24px;
//         }

//         /* Loading Container */
//         .loading-container {
//           text-align: center;
//           padding: 60px 20px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 16px;
//           color: #6b7280;
//         }

//         /* Table Container with Horizontal Scroll */
//         .table-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//         }

//         /* Data Table */
//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           min-width: 1200px; /* Ensures horizontal scroll on smaller screens */
//         }

//         .data-table th,
//         .data-table td {
//           padding: 12px 16px;
//           text-align: left;
//           border-bottom: 1px solid #e5e7eb;
//           white-space: nowrap;
//         }

//         .data-table th {
//           background: #f9fafb;
//           font-weight: 600;
//           color: #374151;
//           font-size: 14px;
//           position: sticky;
//           top: 0;
//           z-index: 10;
//         }

//         .data-table td {
//           font-size: 14px;
//           color: #6b7280;
//         }

//         .data-table tr:hover {
//           background: #f9fafb;
//         }

//         .no-orders {
//           text-align: center;
//           padding: 40px 20px;
//           color: #9ca3af;
//           font-style: italic;
//         }

//         /* Customer Type Badge */
//         .customer-type-badge {
//           display: inline-block;
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 500;
//           text-transform: uppercase;
//         }

//         .customer-type-badge.staff {
//           background: rgba(59, 130, 246, 0.1);
//           color: #3b82f6;
//         }

//         .customer-type-badge.guest {
//           background: rgba(16, 185, 129, 0.1);
//           color: #10b981;
//         }

//         /* People Count */
//         .people-count {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         /* Status Badges */
//         .status-badge {
//           display: inline-block;
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 500;
//           text-transform: capitalize;
//         }

//         .status-badge.pending {
//           background: rgba(251, 191, 36, 0.1);
//           color: #d97706;
//         }

//         .status-badge.preparing {
//           background: rgba(59, 130, 246, 0.1);
//           color: #2563eb;
//         }

//         .status-badge.served {
//           background: rgba(139, 92, 246, 0.1);
//           color: #7c3aed;
//         }

//         .status-badge.completed {
//           background: rgba(16, 185, 129, 0.1);
//           color: #059669;
//         }

//         .status-badge.cancelled {
//           background: rgba(239, 68, 68, 0.1);
//           color: #dc2626;
//         }

//         /* Action Buttons */
//         .action-buttons {
//           display: flex;
//           gap: 8px;
//         }

//         .action-btn {
//           padding: 6px 12px;
//           border-radius: 6px;
//           font-size: 12px;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s ease;
//         }

//         .action-btn.view {
//           background: rgba(59, 130, 246, 0.1);
//           color: #2563eb;
//         }

//         .action-btn.view:hover {
//           background: rgba(59, 130, 246, 0.2);
//         }

//         .action-btn.edit {
//           background: rgba(16, 185, 129, 0.1);
//           color: #059669;
//         }

//         .action-btn.edit:hover {
//           background: rgba(16, 185, 129, 0.2);
//         }

//         /* Pagination */
//         .pagination {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 8px;
//           margin-top: 24px;
//           flex-wrap: wrap;
//         }

//         .pagination-btn {
//           padding: 8px 16px;
//           border: 1px solid #d1d5db;
//           background: white;
//           color: #374151;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 14px;
//           transition: all 0.2s ease;
//         }

//         .pagination-btn:hover:not(:disabled) {
//           background: #f9fafb;
//           border-color: #9ca3af;
//         }

//         .pagination-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .pagination-pages {
//           display: flex;
//           gap: 4px;
//           align-items: center;
//         }

//         .pagination-page {
//           width: 36px;
//           height: 36px;
//           border: 1px solid #d1d5db;
//           background: white;
//           color: #374151;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 14px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s ease;
//         }

//         .pagination-page:hover:not(:disabled) {
//           background: #d97706;
//           border-color: #d97706;
//         }

//         .pagination-page.active {
//           background: #d97706;
//           color: white;
//           border-color: #d97706;
//         }

//         .pagination-page:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .pagination-ellipsis {
//           padding: 0 8px;
//           color: #9ca3af;
//         }

//         /* Modal Styles */
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
//           z-index: 1000;
//           padding: 20px;
//         }

//         .modal {
//           background: white;
//           border-radius: 12px;
//           max-width: 600px;
//           width: 100%;
//           max-height: 90vh;
//           display: flex;
//           flex-direction: column;
//           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
//         }

//         .modal-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 24px;
//           border-bottom: 1px solid #e5e7eb;
//         }

//         .modal-title {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1f2937;
//           margin: 0;
//         }

//         .modal-close {
//           background: none;
//           border: none;
//           font-size: 24px;
//           cursor: pointer;
//           color: #6b7280;
//           padding: 4px;
//           border-radius: 4px;
//           line-height: 1;
//         }

//         .modal-close:hover {
//           color: #374151;
//           background: #f3f4f6;
//         }

//         .modal-body {
//           flex: 1;
//           overflow-y: auto;
//           padding: 24px;
//         }

//         .modal-footer {
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
//           padding: 24px;
//           border-top: 1px solid #e5e7eb;
//         }

//         /* Order Details */
//         .order-details {
//           margin-bottom: 24px;
//         }

//         .order-detail-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 0;
//           border-bottom: 1px solid #f3f4f6;
//         }

//         .order-detail-row:last-child {
//           border-bottom: none;
//         }

//         .order-detail-label {
//           font-weight: 500;
//           color: #374151;
//           min-width: 140px;
//         }

//         .order-detail-value {
//           color: #6b7280;
//           text-align: right;
//           flex: 1;
//         }

//         .payment-method-display {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           justify-content: flex-end;
//         }

//         /* Order Items Section */
//         .order-items-section {
//           margin-bottom: 24px;
//         }

//         .order-items-section h4 {
//           font-size: 16px;
//           font-weight: 600;
//           color: #1f2937;
//           margin-bottom: 16px;
//         }

//         .order-items-table {
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           overflow: hidden;
//         }

//         .order-items-table .data-table {
//           min-width: auto;
//         }

//         .order-items-table .data-table th,
//         .order-items-table .data-table td {
//           padding: 8px 12px;
//         }

//         /* Form Styles */
//         .form-group {
//           margin-bottom: 16px;
//         }

//         .form-label {
//           display: block;
//           font-size: 14px;
//           font-weight: 500;
//           color: #374151;
//           margin-bottom: 6px;
//         }

//         .form-input,
//         .form-select {
//           width: 100%;
//           padding: 10px 12px;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 14px;
//           outline: none;
//           background: white;
//         }

//         .form-input:focus,
//         .form-select:focus {
//           border-color: #d97706;
//           box-shadow: 0 0 0 3px rgba(221, 124, 2, 0.1);
//         }

//         .form-input:disabled {
//           background: #f9fafb;
//           color: #6b7280;
//           cursor: not-allowed;
//         }

//         .section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//         }

//         .alert-message {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 12px;
//           color: #6b7280;
//         }

//         /* Animations */
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         /* Responsive Design */
//         @media (max-width: 1024px) {
//           .orders-page {
//             padding: 16px;
//           }

//           .page-header {
//             flex-direction: column;
//             align-items: flex-start;
//           }

//           .page-header h1 {
//             font-size: 24px;
//           }

//           .filters-bar {
//             padding: 16px;
//           }

//           .filter-buttons {
//             flex-direction: column;
//           }

//           .filter-select {
//             min-width: auto;
//             width: 100%;
//           }

//           .search-container {
//             min-width: auto;
//           }
//         }

//         @media (max-width: 768px) {
//           .orders-page {
//             padding: 12px;
//           }

//           .page-header h1 {
//             font-size: 20px;
//           }

//           .filters-bar {
//             padding: 12px;
//           }

//           /* Mobile Table Styles */
//           .table-container {
//             border-radius: 8px;
//             overflow: hidden;
//           }

//           .data-table {
//             min-width: 800px; /* Reduced for mobile but still scrollable */
//           }

//           .data-table th,
//           .data-table td {
//             padding: 8px 12px;
//             font-size: 13px;
//           }

//           .action-buttons {
//             flex-direction: column;
//             gap: 4px;
//           }

//           .action-btn {
//             padding: 4px 8px;
//             font-size: 11px;
//           }

//           /* Modal adjustments for mobile */
//           .modal {
//             margin: 10px;
//             max-height: calc(100vh - 20px);
//           }

//           .modal-header,
//           .modal-body,
//           .modal-footer {
//             padding: 16px;
//           }

//           .modal-title {
//             font-size: 16px;
//           }

//           .order-detail-row {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 4px;
//           }

//           .order-detail-value {
//             text-align: left;
//           }

//           .payment-method-display {
//             justify-content: flex-start;
//           }

//           /* Pagination adjustments */
//           .pagination {
//             gap: 4px;
//           }

//           .pagination-btn {
//             padding: 6px 12px;
//             font-size: 12px;
//           }

//           .pagination-page {
//             width: 32px;
//             height: 32px;
//             font-size: 12px;
//           }
//         }

//         @media (max-width: 480px) {
//           .orders-page {
//             padding: 8px;
//           }

//           .page-header {
//             gap: 12px;
//           }

//           .page-header h1 {
//             font-size: 18px;
//           }

//           .btn {
//             padding: 8px 12px;
//             font-size: 12px;
//           }

//           .filters-bar {
//             padding: 8px;
//             gap: 12px;
//           }

//           .search-input {
//             padding: 10px 10px 10px 36px;
//             font-size: 13px;
//           }

//           .filter-select {
//             padding: 8px 10px;
//             font-size: 13px;
//           }

//           .data-table {
//             min-width: 600px; /* Further reduced for very small screens */
//           }

//           .data-table th,
//           .data-table td {
//             padding: 6px 8px;
//             font-size: 12px;
//           }

//           .customer-type-badge,
//           .status-badge {
//             font-size: 10px;
//             padding: 2px 6px;
//           }

//           .success-message {
//             top: 10px;
//             right: 10px;
//             left: 10px;
//             padding: 10px 12px;
//             font-size: 13px;
//           }
//         }

//         /* Custom Scrollbar for Table */
//         .table-container::-webkit-scrollbar {
//           height: 8px;
//         }

//         .table-container::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 4px;
//         }

//         .table-container::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 4px;
//         }

//         .table-container::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }

//         /* Focus styles for accessibility */
//         .data-table:focus-within {
//           outline: 2px solid #d97706;
//           outline-offset: 2px;
//         }

//         .action-btn:focus {
//           outline: 2px solid #d97706;
//           outline-offset: 2px;
//         }

//         .pagination-btn:focus,
//         .pagination-page:focus {
//           outline: 2px solid #d97706;
//           outline-offset: 2px;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default StaffOrders

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
//   Users,
//   Filter,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import axios from "axios";

// // Create axios instance
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const StaffOrders = () => {
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
//     status: "",
//     paymentStatus: "",
//     paymentMethod: "",
//   });
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State for filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [branchFilter, setBranchFilter] = useState("all");
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
//   const [orderTypeFilter, setOrderTypeFilter] = useState("all");
//   const [itemFilter, setItemFilter] = useState("all");
//   const [availableItems, setAvailableItems] = useState([]);

//   // State for expanded order items
//   const [expandedOrders, setExpandedOrders] = useState({});

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const ordersPerPage = 7;

//   // Fetch orders and branches on component mount or when filters change
//   useEffect(() => {
//     fetchBranches();
//     fetchOrders();
//   }, [statusFilter, branchFilter, paymentStatusFilter, orderTypeFilter]);

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

//   // Fetch all orders (both staff and guest orders)
//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     setAllOrders([]);
//     setFilteredOrders([]);
//     setDisplayedOrders([]);

//     try {
//       // Build query parameters
//       const params = {};

//       // Add filters if they're not set to "all"
//       if (statusFilter !== "all") {
//         params.status = statusFilter;
//       }

//       if (branchFilter !== "all") {
//         params.branchId = branchFilter;
//       }

//       if (paymentStatusFilter !== "all") {
//         params.paymentStatus = paymentStatusFilter;
//       }

//       if (orderTypeFilter !== "all") {
//         params.orderType = orderTypeFilter;
//       }

//       // Use the updated staff order endpoint that handles both staff and guest orders
//       const response = await api.get("/staff-order", { params });

//       if (!response.data.orders || !Array.isArray(response.data.orders)) {
//         throw new Error("Invalid response format: orders array missing");
//       }

//       // Extract unique items from all orders
//       const allItems = new Set();
//       response.data.orders.forEach((order) => {
//         order.items?.forEach((item) => {
//           if (item.name) {
//             allItems.add(item.name.toLowerCase());
//           }
//         });
//       });

//       // Convert Set to Array and sort alphabetically
//       const sortedItems = Array.from(allItems).sort();
//       setAvailableItems(sortedItems);

//       // Format orders for display
//       const formattedOrders = response.data.orders
//         .map((order, index) => {
//           // Extract all item names for filtering and display
//           const itemNames =
//             order.items
//               ?.map((item) => item.name || "")
//               .filter((name) => name) || [];
//           const itemNamesLower = itemNames.map((name) => name.toLowerCase());

//           return {
//             id: order._id || `temp-id-${index}`,
//             orderId: order.orderId || `UNKNOWN-${index}`,
//             customer: order.isGuestOrder
//               ? order.customerName
//               : order.userId?.name || "Unknown Staff",
//             customerType: order.isGuestOrder ? "Guest" : "Staff",
//             customerMobile: order.isGuestOrder
//               ? order.customerMobile
//               : order.userId?.mobile || "N/A",
//             date: new Date(
//               order.orderTime || order.createdAt || Date.now()
//             ).toLocaleString("en-US", {
//               year: "numeric",
//               month: "short",
//               day: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//             }),
//             branch: order.branchName || "Unknown Branch",
//             branchId: order.branchId?._id || null,
//             tableNumber: order.tableNumber || "N/A",
//             peopleCount: order.peopleCount || 0,
//             items: order.items?.length || 0,
//             amount: `₹${order.grandTotal?.toFixed(2) || "0.00"}`,
//             status: order.status || "pending",
//             paymentMethod: order.paymentMethod || "cash",
//             paymentStatus: order.paymentStatus || "pending",
//             subtotal: order.subtotal || 0,
//             tax: order.tax || 0,
//             serviceCharge: order.serviceCharge || 0,
//             grandTotal: order.grandTotal || 0,
//             originalOrder: order,
//             isGuestOrder: order.isGuestOrder || false,
//             itemNames: itemNames, // Store item names for display
//             itemNamesLower: itemNamesLower, // Store lowercase for filtering
//             orderItems: order.items || [], // Store full items for display
//             // Create a string of item names for quick display
//             itemsDisplay:
//               itemNames.slice(0, 2).join(", ") +
//               (itemNames.length > 2 ? ` +${itemNames.length - 2} more` : ""),
//           };
//         })
//         .filter((order) => order.id);

//       setAllOrders(formattedOrders);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setError("Failed to load orders. Please refresh the page and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle search filtering and pagination
//   useEffect(() => {
//     const filtered = allOrders.filter((order) => {
//       // Search term filtering
//       if (searchTerm.trim()) {
//         const searchLower = searchTerm.trim().toLowerCase();
//         const orderId = order.orderId || "";
//         const tableNumber = order.tableNumber || "";
//         const customer = order.customer || "";
//         const customerMobile = order.customerMobile || "";

//         const matchesSearch =
//           orderId.toLowerCase().includes(searchLower) ||
//           tableNumber.toLowerCase().includes(searchLower) ||
//           customer.toLowerCase().includes(searchLower) ||
//           customerMobile.toLowerCase().includes(searchLower);

//         if (!matchesSearch) return false;
//       }

//       // Item name dropdown filtering
//       if (itemFilter !== "all") {
//         const itemLower = itemFilter.toLowerCase();
//         const matchesItem = order.itemNamesLower.some((itemName) =>
//           itemName.includes(itemLower)
//         );
//         if (!matchesItem) return false;
//       }

//       return true;
//     });
//     setFilteredOrders(filtered);
//     setTotalPages(Math.ceil(filtered.length / ordersPerPage));
//     setCurrentPage(1);
//   }, [allOrders, searchTerm, itemFilter]);

//   // Handle pagination
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * ordersPerPage;
//     const endIndex = startIndex + ordersPerPage;
//     const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
//     setDisplayedOrders(paginatedOrders);
//   }, [filteredOrders, currentPage]);

//   // Toggle order items expansion
//   const toggleOrderItems = (orderId) => {
//     setExpandedOrders((prev) => ({
//       ...prev,
//       [orderId]: !prev[orderId],
//     }));
//   };

//   // Handle view order
//   const handleViewOrder = (order) => {
//     setSelectedOrder(order);
//     setViewModalOpen(true);
//   };

//   // Handle edit order
//   const handleEditOrder = (order) => {
//     setSelectedOrder(order);
//     setEditFormData({
//       status: order.status,
//       paymentStatus: order.paymentStatus,
//       paymentMethod: order.paymentMethod,
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
//       // Use the same endpoint for both staff and guest orders
//       await api.put(`/staff-order/${selectedOrder.id}/status`, {
//         status: editFormData.status,
//         paymentStatus: editFormData.paymentStatus,
//         paymentMethod: editFormData.paymentMethod,
//       });

//       // Refresh orders
//       await fetchOrders();

//       setEditModalOpen(false);
//       setSuccessMessage(`Order ${selectedOrder.orderId} updated successfully`);

//       // Auto-hide success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);
//     } catch (error) {
//       console.error("Error updating order:", error);
//       alert("Failed to update order. Please try again.");
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
//     if (type === "status") {
//       setStatusFilter(value);
//     } else if (type === "branch") {
//       setBranchFilter(value);
//     } else if (type === "paymentStatus") {
//       setPaymentStatusFilter(value);
//     } else if (type === "orderType") {
//       setOrderTypeFilter(value);
//     } else if (type === "item") {
//       setItemFilter(value);
//     }
//     setCurrentPage(1);
//   };

//   // Clear all filters
//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setStatusFilter("all");
//     setBranchFilter("all");
//     setPaymentStatusFilter("all");
//     setOrderTypeFilter("all");
//     setItemFilter("all");
//     setCurrentPage(1);
//   };

//   // Get payment method icon
//   const getPaymentMethodIcon = (method) => {
//     switch (method?.toLowerCase()) {
//       case "card":
//         return <CreditCard size={16} />;
//       case "upi":
//         return <IndianRupee size={16} />;
//       case "cash":
//       default:
//         return <IndianRupee size={16} />;
//     }
//   };

//   // Get payment status class
//   const getPaymentStatusClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case "completed":
//         return "completed";
//       case "pending":
//         return "pending";
//       case "failed":
//         return "cancelled";
//       case "refunded":
//         return "preparing";
//       default:
//         return "pending";
//     }
//   };

//   // Export orders as CSV
//   const exportOrders = () => {
//     let csv =
//       "Order ID,Customer,Customer Type,Mobile,Date,Branch,Table,People,Items,Amount,Payment Method,Payment Status,Order Status,Order Items\n";

//     filteredOrders.forEach((order) => {
//       const itemsString = order.orderItems
//         .map((item) => `${item.name} (Qty: ${item.quantity})`)
//         .join("; ");

//       csv += `${order.orderId},"${order.customer}",${order.customerType},"${order.customerMobile}","${order.date}","${order.branch}",${order.tableNumber},${order.peopleCount},${order.items},${order.amount},${order.paymentMethod},${order.paymentStatus},${order.status},"${itemsString}"\n`;
//     });

//     const blob = new Blob([csv], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("hidden", "");
//     a.setAttribute("href", url);
//     a.setAttribute(
//       "download",
//       `all-orders-export-${new Date().toISOString().slice(0, 10)}.csv`
//     );
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
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
//         <h1>All Orders (Staff & Guest)</h1>
//         <div className="header-actions">
//           <button className="btn btn-outline" onClick={exportOrders}>
//             <Download size={16} />
//             <span>Export</span>
//           </button>
//         </div>
//       </div>

//       <div className="filters-bar">
//         <div className="search-filters-grid">
//           <div className="search-container">
//             <Search size={18} className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search by order ID, table, customer name, or mobile..."
//               className="search-input"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           <div className="filter-container">
//             <Filter size={18} className="filter-icon" />
//             <select
//               className="filter-select"
//               value={itemFilter}
//               onChange={(e) => handleFilterChange("item", e.target.value)}>
//               <option value="all">All Items</option>
//               {availableItems.map((item, index) => (
//                 <option key={index} value={item}>
//                   {item.charAt(0).toUpperCase() + item.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="filter-section">
//           <div className="filter-buttons">
//             <select
//               className="filter-select"
//               value={orderTypeFilter}
//               onChange={(e) => handleFilterChange("orderType", e.target.value)}>
//               <option value="all">All Orders</option>
//               <option value="staff">Staff Orders</option>
//               <option value="guest">Guest Orders</option>
//             </select>
//             <select
//               className="filter-select"
//               value={statusFilter}
//               onChange={(e) => handleFilterChange("status", e.target.value)}>
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="preparing">Preparing</option>
//               <option value="served">Served</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//             <select
//               className="filter-select"
//               value={paymentStatusFilter}
//               onChange={(e) =>
//                 handleFilterChange("paymentStatus", e.target.value)
//               }>
//               <option value="all">All Payment Status</option>
//               <option value="pending">Payment Pending</option>
//               <option value="completed">Payment Completed</option>
//               <option value="failed">Payment Failed</option>
//               <option value="refunded">Refunded</option>
//             </select>
//             <select
//               className="filter-select"
//               value={branchFilter}
//               onChange={(e) => handleFilterChange("branch", e.target.value)}>
//               <option value="all">All Branches</option>
//               {branches.map((branch) => (
//                 <option key={branch._id} value={branch._id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             className="btn btn-outline clear-filters"
//             onClick={clearAllFilters}>
//             <X size={16} />
//             <span>Clear Filters</span>
//           </button>
//         </div>
//       </div>

//       {/* Active filters display */}
//       {(searchTerm ||
//         itemFilter !== "all" ||
//         statusFilter !== "all" ||
//         branchFilter !== "all" ||
//         paymentStatusFilter !== "all" ||
//         orderTypeFilter !== "all") && (
//         <div className="active-filters">
//           <span className="active-filters-label">Active filters:</span>
//           {searchTerm && (
//             <span className="filter-tag">
//               Search: "{searchTerm}"
//               <button onClick={() => setSearchTerm("")}>×</button>
//             </span>
//           )}
//           {itemFilter !== "all" && (
//             <span className="filter-tag">
//               Item: "{itemFilter}"
//               <button onClick={() => setItemFilter("all")}>×</button>
//             </span>
//           )}
//           {statusFilter !== "all" && (
//             <span className="filter-tag">
//               Status: {statusFilter}
//               <button onClick={() => setStatusFilter("all")}>×</button>
//             </span>
//           )}
//           {branchFilter !== "all" && (
//             <span className="filter-tag">
//               Branch:{" "}
//               {branches.find((b) => b._id === branchFilter)?.name ||
//                 branchFilter}
//               <button onClick={() => setBranchFilter("all")}>×</button>
//             </span>
//           )}
//           {paymentStatusFilter !== "all" && (
//             <span className="filter-tag">
//               Payment: {paymentStatusFilter}
//               <button onClick={() => setPaymentStatusFilter("all")}>×</button>
//             </span>
//           )}
//           {orderTypeFilter !== "all" && (
//             <span className="filter-tag">
//               Type: {orderTypeFilter}
//               <button onClick={() => setOrderTypeFilter("all")}>×</button>
//             </span>
//           )}
//         </div>
//       )}

//       {/* Error message */}
//       {error && (
//         <div className="error-container">
//           <AlertCircle size={18} />
//           <span>{error}</span>
//         </div>
//       )}

//       <div className="data-card">
//         {loading ? (
//           <div className="loading-container">
//             <Loader size={24} className="animate-spin" />
//             <p>Loading orders...</p>
//           </div>
//         ) : (
//           <div className="table-container">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Order ID</th>
//                   <th>Order By</th>
//                   <th>Type</th>
//                   <th>Mobile</th>
//                   <th>Date</th>
//                   <th>Branch</th>
//                   <th>Table</th>
//                   <th>People</th>
//                   <th>Items</th>
//                   <th>Item Names</th>
//                   <th>Amount</th>
//                   <th>Order Status</th>
//                   <th>Payment Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {displayedOrders.length > 0 ? (
//                   displayedOrders.map((order) => (
//                     <>
//                       <tr key={order.id}>
//                         <td data-label="Order ID">{order.orderId}</td>
//                         <td data-label="Customer">{order.customer}</td>
//                         <td data-label="Type">
//                           <span
//                             className={`customer-type-badge ${
//                               order.isGuestOrder ? "guest" : "staff"
//                             }`}>
//                             {order.customerType}
//                           </span>
//                         </td>
//                         <td data-label="Mobile">{order.customerMobile}</td>
//                         <td data-label="Date">{order.date}</td>
//                         <td data-label="Branch">{order.branch}</td>
//                         <td data-label="Table">{order.tableNumber}</td>
//                         <td data-label="People">
//                           <div className="people-count">
//                             <Users size={14} />
//                             {order.peopleCount}
//                           </div>
//                         </td>
//                         <td data-label="Items" className="items-count">
//                           <span className="items-badge">{order.items}</span>
//                         </td>
//                         <td data-label="Item Names" className="items-names">
//                           <div className="items-display">
//                             {order.itemsDisplay}
//                             {order.itemNames.length > 0 && (
//                               <button
//                                 className="expand-items-btn"
//                                 onClick={() => toggleOrderItems(order.id)}
//                                 title={
//                                   expandedOrders[order.id]
//                                     ? "Hide items"
//                                     : "Show all items"
//                                 }>
//                                 {expandedOrders[order.id] ? (
//                                   <ChevronUp size={14} />
//                                 ) : (
//                                   <ChevronDown size={14} />
//                                 )}
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                         <td data-label="Amount" className="amount-cell">
//                           {order.amount}
//                         </td>
//                         <td data-label="Order Status">
//                           <span className={`status-badge ${order.status}`}>
//                             {order.status.charAt(0).toUpperCase() +
//                               order.status.slice(1)}
//                           </span>
//                         </td>
//                         <td data-label="Payment Status">
//                           <span
//                             className={`status-badge ${getPaymentStatusClass(
//                               order.paymentStatus
//                             )}`}>
//                             {order.paymentStatus.charAt(0).toUpperCase() +
//                               order.paymentStatus.slice(1)}
//                           </span>
//                         </td>
//                         <td data-label="Actions">
//                           <div className="action-buttons">
//                             <button
//                               className="action-btn view"
//                               onClick={() => handleViewOrder(order)}>
//                               View
//                             </button>
//                             <button
//                               className="action-btn edit"
//                               onClick={() => handleEditOrder(order)}>
//                               Edit
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                       {expandedOrders[order.id] && (
//                         <tr className="order-items-expanded">
//                           <td colSpan="14">
//                             <div className="order-items-details">
//                               <h4>Order Items ({order.orderItems.length})</h4>
//                               <div className="items-grid">
//                                 {order.orderItems.map((item, index) => (
//                                   <div key={index} className="order-item">
//                                     <span className="item-name">
//                                       {item.name}
//                                     </span>
//                                     <div className="item-details">
//                                       <span className="item-quantity">
//                                         Qty: {item.quantity}
//                                       </span>
//                                       <span className="item-price">
//                                         ₹{item.price?.toFixed(2)} each
//                                       </span>
//                                       <span className="item-total">
//                                         Total: ₹
//                                         {(item.price * item.quantity)?.toFixed(
//                                           2
//                                         )}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="14" className="no-orders">
//                       No orders found matching your criteria
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {totalPages > 0 && (
//         <div className="pagination">
//           <button
//             className="pagination-btn"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1 || loading}>
//             Previous
//           </button>

//           <div className="pagination-pages">
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
//                   className={`pagination-page ${
//                     currentPage === pageNum ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(pageNum)}
//                   disabled={loading}>
//                   {pageNum}
//                 </button>
//               );
//             })}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <span className="pagination-ellipsis">...</span>
//             )}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <button
//                 className={`pagination-page ${
//                   currentPage === totalPages ? "active" : ""
//                 }`}
//                 onClick={() => setCurrentPage(totalPages)}
//                 disabled={loading}>
//                 {totalPages}
//               </button>
//             )}
//           </div>

//           <button
//             className="pagination-btn"
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages || loading}>
//             Next
//           </button>
//         </div>
//       )}

//       {/* View Order Modal */}
//       {viewModalOpen && selectedOrder && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h3 className="modal-title">
//                 {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order Details{" "}
//                 {selectedOrder.orderId}
//               </h3>
//               <button className="modal-close" onClick={closeViewModal}>
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="order-details">
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Order By</div>
//                   <div className="order-detail-value">
//                     {selectedOrder.customer}
//                     <span
//                       className={`customer-type-badge ${
//                         selectedOrder.isGuestOrder ? "guest" : "staff"
//                       }`}
//                       style={{ marginLeft: "8px" }}>
//                       {selectedOrder.customerType}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Mobile Number</div>
//                   <div className="order-detail-value">
//                     {selectedOrder.customerMobile}
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Date</div>
//                   <div className="order-detail-value">{selectedOrder.date}</div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Branch</div>
//                   <div className="order-detail-value">
//                     {selectedOrder.branch}
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Table Number</div>
//                   <div className="order-detail-value">
//                     {selectedOrder.tableNumber}
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Number of People</div>
//                   <div className="order-detail-value">
//                     <div className="people-count">
//                       <Users size={16} />
//                       {selectedOrder.peopleCount}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Order Status</div>
//                   <div className="order-detail-value">
//                     <span className={`status-badge ${selectedOrder.status}`}>
//                       {selectedOrder.status.charAt(0).toUpperCase() +
//                         selectedOrder.status.slice(1)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Payment Method</div>
//                   <div className="order-detail-value">
//                     <div className="payment-method-display">
//                       {getPaymentMethodIcon(selectedOrder.paymentMethod)}
//                       <span>
//                         {selectedOrder.paymentMethod
//                           ? selectedOrder.paymentMethod
//                               .charAt(0)
//                               .toUpperCase() +
//                             selectedOrder.paymentMethod.slice(1)
//                           : "Cash"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="order-detail-row">
//                   <div className="order-detail-label">Payment Status</div>
//                   <div className="order-detail-value">
//                     <span
//                       className={`status-badge ${getPaymentStatusClass(
//                         selectedOrder.paymentStatus
//                       )}`}>
//                       {selectedOrder.paymentStatus
//                         ? selectedOrder.paymentStatus.charAt(0).toUpperCase() +
//                           selectedOrder.paymentStatus.slice(1)
//                         : "Pending"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="order-items-section">
//                 <h4>Price Details</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <tbody>
//                       <tr>
//                         <td>Subtotal</td>
//                         <td style={{ textAlign: "right" }}>
//                           ₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Tax (5%)</td>
//                         <td style={{ textAlign: "right" }}>
//                           ₹{selectedOrder.tax?.toFixed(2) || "0.00"}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Service Charge (10%)</td>
//                         <td style={{ textAlign: "right" }}>
//                           ₹{selectedOrder.serviceCharge?.toFixed(2) || "0.00"}
//                         </td>
//                       </tr>
//                       <tr style={{ fontWeight: "bold" }}>
//                         <td>Total Amount</td>
//                         <td style={{ textAlign: "right" }}>
//                           ₹{selectedOrder.grandTotal?.toFixed(2) || "0.00"}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div className="order-items-section">
//                 <h4>Order Items ({selectedOrder.orderItems?.length || 0})</h4>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
//                         <th>Quantity</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.orderItems?.length > 0 ? (
//                         selectedOrder.orderItems.map((item, index) => (
//                           <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price?.toFixed(2)}</td>
//                             <td>₹{(item.price * item.quantity)?.toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" style={{ textAlign: "center" }}>
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
//                 Edit {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order{" "}
//                 {selectedOrder.orderId}
//               </h3>
//               <button className="modal-close" onClick={closeEditModal}>
//                 ×
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="form-group">
//                 <label className="form-label">Order By</label>
//                 <input
//                   type="text"
//                   value={selectedOrder.customer}
//                   className="form-input"
//                   disabled={true}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Customer Type</label>
//                 <input
//                   type="text"
//                   value={selectedOrder.customerType}
//                   className="form-input"
//                   disabled={true}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Mobile Number</label>
//                 <input
//                   type="text"
//                   value={selectedOrder.customerMobile}
//                   className="form-input"
//                   disabled={true}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Branch</label>
//                 <input
//                   type="text"
//                   value={selectedOrder.branch}
//                   className="form-input"
//                   disabled={true}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Table Number</label>
//                 <input
//                   type="text"
//                   value={selectedOrder.tableNumber}
//                   className="form-input"
//                   disabled={true}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Order Status</label>
//                 <select
//                   name="status"
//                   value={editFormData.status}
//                   onChange={handleInputChange}
//                   className="form-select">
//                   <option value="pending">Pending</option>
//                   <option value="preparing">Preparing</option>
//                   <option value="served">Served</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Payment Status</label>
//                 <select
//                   name="paymentStatus"
//                   value={editFormData.paymentStatus}
//                   onChange={handleInputChange}
//                   className="form-select">
//                   <option value="pending">Pending</option>
//                   <option value="completed">Completed</option>
//                   <option value="failed">Failed</option>
//                   <option value="refunded">Refunded</option>
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Payment Method</label>
//                 <select
//                   name="paymentMethod"
//                   value={editFormData.paymentMethod}
//                   onChange={handleInputChange}
//                   className="form-select">
//                   <option value="cash">Cash</option>
//                   <option value="card">Card</option>
//                   <option value="upi">UPI</option>
//                   <option value="netbanking">Net Banking</option>
//                   <option value="wallet">Wallet</option>
//                 </select>
//               </div>

//               <div className="order-items-section">
//                 <div className="section-header">
//                   <h4>Order Items ({selectedOrder.orderItems?.length || 0})</h4>
//                   <div className="alert-message">
//                     <AlertCircle size={16} />
//                     <span>Order status and payment status can be updated</span>
//                   </div>
//                 </div>
//                 <div className="order-items-table">
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
//                         <th>Quantity</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.orderItems?.length > 0 ? (
//                         selectedOrder.orderItems.map((item, index) => (
//                           <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price?.toFixed(2)}</td>
//                             <td>₹{(item.price * item.quantity)?.toFixed(2)}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" style={{ textAlign: "center" }}>
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
//         /* Add these new styles to your existing CSS */

//         /* Search Filters Grid */
//         .search-filters-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 16px;
//           margin-bottom: 16px;
//         }

//         /* Filter Container */
//         .filter-container {
//           position: relative;
//           flex: 1;
//         }

//         .filter-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//           pointer-events: none;
//           z-index: 2;
//         }

//         .filter-container .filter-select {
//           padding-left: 40px;
//         }

//         /* Filter Section */
//         .filter-section {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 16px;
//           flex-wrap: wrap;
//         }

//         .clear-filters {
//           white-space: nowrap;
//         }

//         /* Active Filters */
//         .active-filters {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 16px;
//           flex-wrap: wrap;
//           padding: 12px 16px;
//           background: #f0f9ff;
//           border: 1px solid #bae6fd;
//           border-radius: 8px;
//         }

//         .active-filters-label {
//           font-weight: 500;
//           color: #0369a1;
//           font-size: 14px;
//         }

//         .filter-tag {
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           padding: 4px 8px;
//           background: white;
//           border: 1px solid #d1d5db;
//           border-radius: 16px;
//           font-size: 12px;
//           color: #374151;
//         }

//         .filter-tag button {
//           background: none;
//           border: none;
//           color: #6b7280;
//           cursor: pointer;
//           padding: 2px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 16px;
//           height: 16px;
//         }

//         .filter-tag button:hover {
//           background: #f3f4f6;
//           color: #374151;
//         }

//         /* Items Count Badge */
//         .items-count {
//           text-align: center;
//         }

//         .items-badge {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           width: 28px;
//           height: 28px;
//           background: #dbeafe;
//           color: #1e40af;
//           border-radius: 50%;
//           font-weight: 600;
//           font-size: 12px;
//         }

//         /* Items Names Column */
//         .items-names {
//           max-width: 200px;
//           min-width: 150px;
//         }

//         .items-display {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 13px;
//           color: #4b5563;
//           line-height: 1.3;
//         }

//         .expand-items-btn {
//           background: none;
//           border: none;
//           color: #6b7280;
//           cursor: pointer;
//           padding: 2px;
//           border-radius: 4px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .expand-items-btn:hover {
//           background: #f3f4f6;
//           color: #374151;
//         }

//         /* Amount Cell */
//         .amount-cell {
//           font-weight: 600;
//           color: #059669;
//         }

//         /* Expanded Order Items */
//         .order-items-expanded {
//           background: #f8fafc;
//         }

//         .order-items-expanded td {
//           padding: 0 !important;
//           border-bottom: 2px solid #e5e7eb;
//         }

//         .order-items-details {
//           padding: 16px;
//         }

//         .order-items-details h4 {
//           margin: 0 0 12px 0;
//           font-size: 14px;
//           font-weight: 600;
//           color: #374151;
//         }

//         .items-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
//           gap: 12px;
//         }

//         .order-item {
//           display: flex;
//           flex-direction: column;
//           padding: 12px;
//           background: white;
//           border: 1px solid #e5e7eb;
//           border-radius: 6px;
//           gap: 6px;
//         }

//         .item-name {
//           font-weight: 600;
//           color: #1f2937;
//           font-size: 14px;
//         }

//         .item-details {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           gap: 8px;
//           flex-wrap: wrap;
//         }

//         .item-quantity,
//         .item-price,
//         .item-total {
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .item-total {
//           font-weight: 600;
//           color: #059669;
//         }

//         /* Responsive adjustments */
//         @media (max-width: 1024px) {
//           .items-grid {
//             grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//           }
//         }

//         @media (max-width: 768px) {
//           .search-filters-grid {
//             grid-template-columns: 1fr;
//           }

//           .filter-section {
//             flex-direction: column;
//             align-items: stretch;
//           }

//           .filter-buttons {
//             flex-direction: column;
//           }

//           .items-grid {
//             grid-template-columns: 1fr;
//           }

//           .active-filters {
//             flex-direction: column;
//             align-items: flex-start;
//           }

//           .items-names {
//             max-width: 120px;
//             min-width: 100px;
//           }

//           .items-display {
//             font-size: 12px;
//           }
//         }

//         @media (max-width: 480px) {
//           .order-item {
//             padding: 8px;
//           }

//           .item-details {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 2px;
//           }

//           .items-names {
//             max-width: 100px;
//             min-width: 80px;
//           }
//         }
//       `}</style>

//       {/* Keep all your existing CSS styles from the previous code */}
//       <style jsx>{`
//         /* Your existing CSS styles remain here */
//         .orders-page {
//           padding: 20px;
//           max-width: 100%;
//           margin: 0 auto;
//           background: #f8fafc;
//           min-height: 100vh;
//         }

//         .success-message {
//           position: fixed;
//           top: 20px;
//           right: 20px;
//           background: #10b981;
//           color: white;
//           padding: 12px 16px;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           z-index: 1000;
//           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//         }

//         .success-message button {
//           background: none;
//           border: none;
//           color: white;
//           cursor: pointer;
//           padding: 4px;
//           border-radius: 4px;
//         }

//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//           flex-wrap: wrap;
//           gap: 16px;
//         }

//         .page-header h1 {
//           font-size: 28px;
//           font-weight: 700;
//           color: #1f2937;
//           margin: 0;
//         }

//         .header-actions {
//           display: flex;
//           gap: 12px;
//         }

//         .btn {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           padding: 10px 16px;
//           border-radius: 8px;
//           font-size: 14px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           border: none;
//         }

//         .btn-outline {
//           background: white;
//           color: #374151;
//           border: 1px solid #d1d5db;
//         }

//         .btn-outline:hover {
//           background: #f9fafb;
//           border-color: #9ca3af;
//         }

//         .btn-primary {
//           background: #d97706;
//           color: white;
//         }

//         .filters-bar {
//           background: white;
//           padding: 20px;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           margin-bottom: 24px;
//         }

//         .search-container {
//           position: relative;
//           flex: 1;
//         }

//         .search-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//           pointer-events: none;
//         }

//         .search-input {
//           width: 100%;
//           padding: 12px 12px 12px 40px;
//           border: 1px solid #d1d5db;
//           border-radius: 8px;
//           font-size: 14px;
//           outline: none;
//           background: white;
//         }

//         .filter-buttons {
//           display: flex;
//           gap: 12px;
//           flex-wrap: wrap;
//         }

//         .filter-select {
//           padding: 10px 12px;
//           border: 1px solid #d1d5db;
//           border-radius: 8px;
//           font-size: 14px;
//           background: white;
//           min-width: 150px;
//           outline: none;
//           cursor: pointer;
//         }

//         .error-container {
//           margin: 20px 0;
//           padding: 12px 16px;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           border: 1px solid #fecaca;
//         }

//         .data-card {
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           overflow: hidden;
//           margin-bottom: 24px;
//         }

//         .loading-container {
//           text-align: center;
//           padding: 60px 20px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 16px;
//           color: #6b7280;
//         }

//         .table-container {
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//         }

//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           min-width: 1400px;
//         }

//         .data-table th,
//         .data-table td {
//           padding: 12px 16px;
//           text-align: left;
//           border-bottom: 1px solid #e5e7eb;
//           white-space: nowrap;
//         }

//         .data-table th {
//           background: #f9fafb;
//           font-weight: 600;
//           color: #374151;
//           font-size: 14px;
//           position: sticky;
//           top: 0;
//           z-index: 10;
//         }

//         .no-orders {
//           text-align: center;
//           padding: 40px 20px;
//           color: #9ca3af;
//           font-style: italic;
//         }

//         .customer-type-badge {
//           display: inline-block;
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 500;
//           text-transform: uppercase;
//         }

//         .customer-type-badge.staff {
//           background: rgba(59, 130, 246, 0.1);
//           color: #3b82f6;
//         }

//         .customer-type-badge.guest {
//           background: rgba(16, 185, 129, 0.1);
//           color: #10b981;
//         }

//         .people-count {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//         }

//         .status-badge {
//           display: inline-block;
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 500;
//           text-transform: capitalize;
//         }

//         .status-badge.pending {
//           background: rgba(251, 191, 36, 0.1);
//           color: #d97706;
//         }

//         .status-badge.preparing {
//           background: rgba(59, 130, 246, 0.1);
//           color: #2563eb;
//         }

//         .status-badge.served {
//           background: rgba(139, 92, 246, 0.1);
//           color: #7c3aed;
//         }

//         .status-badge.completed {
//           background: rgba(16, 185, 129, 0.1);
//           color: #059669;
//         }

//         .status-badge.cancelled {
//           background: rgba(239, 68, 68, 0.1);
//           color: #dc2626;
//         }

//         .action-buttons {
//           display: flex;
//           gap: 8px;
//         }

//         .action-btn {
//           padding: 6px 12px;
//           border-radius: 6px;
//           font-size: 12px;
//           font-weight: 500;
//           cursor: pointer;
//           border: none;
//           transition: all 0.2s ease;
//         }

//         .action-btn.view {
//           background: rgba(59, 130, 246, 0.1);
//           color: #2563eb;
//         }

//         .action-btn.view:hover {
//           background: rgba(59, 130, 246, 0.2);
//         }

//         .action-btn.edit {
//           background: rgba(16, 185, 129, 0.1);
//           color: #059669;
//         }

//         .action-btn.edit:hover {
//           background: rgba(16, 185, 129, 0.2);
//         }

//         .pagination {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           gap: 8px;
//           margin-top: 24px;
//           flex-wrap: wrap;
//         }

//         .pagination-btn {
//           padding: 8px 16px;
//           border: 1px solid #d1d5db;
//           background: white;
//           color: #374151;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 14px;
//           transition: all 0.2s ease;
//         }

//         .pagination-pages {
//           display: flex;
//           gap: 4px;
//           align-items: center;
//         }

//         .pagination-page {
//           width: 36px;
//           height: 36px;
//           border: 1px solid #d1d5db;
//           background: white;
//           color: #374151;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 14px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s ease;
//         }

//         .pagination-page.active {
//           background: #d97706;
//           color: white;
//           border-color: #d97706;
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
//           z-index: 1000;
//           padding: 20px;
//         }

//         .modal {
//           background: white;
//           border-radius: 12px;
//           max-width: 600px;
//           width: 100%;
//           max-height: 90vh;
//           display: flex;
//           flex-direction: column;
//           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
//         }

//         .modal-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 24px;
//           border-bottom: 1px solid #e5e7eb;
//         }

//         .modal-title {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1f2937;
//           margin: 0;
//         }

//         .modal-close {
//           background: none;
//           border: none;
//           font-size: 24px;
//           cursor: pointer;
//           color: #6b7280;
//           padding: 4px;
//           border-radius: 4px;
//           line-height: 1;
//         }

//         .modal-body {
//           flex: 1;
//           overflow-y: auto;
//           padding: 24px;
//         }

//         .modal-footer {
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
//           padding: 24px;
//           border-top: 1px solid #e5e7eb;
//         }

//         .order-details {
//           margin-bottom: 24px;
//         }

//         .order-detail-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 0;
//           border-bottom: 1px solid #f3f4f6;
//         }

//         .order-detail-label {
//           font-weight: 500;
//           color: #374151;
//           min-width: 140px;
//         }

//         .order-detail-value {
//           color: #6b7280;
//           text-align: right;
//           flex: 1;
//         }

//         .payment-method-display {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           justify-content: flex-end;
//         }

//         .order-items-section {
//           margin-bottom: 24px;
//         }

//         .order-items-section h4 {
//           font-size: 16px;
//           font-weight: 600;
//           color: #1f2937;
//           margin-bottom: 16px;
//         }

//         .order-items-table {
//           border: 1px solid #e5e7eb;
//           border-radius: 8px;
//           overflow: hidden;
//         }

//         .form-group {
//           margin-bottom: 16px;
//         }

//         .form-label {
//           display: block;
//           font-size: 14px;
//           font-weight: 500;
//           color: #374151;
//           margin-bottom: 6px;
//         }

//         .form-input,
//         .form-select {
//           width: 100%;
//           padding: 10px 12px;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 14px;
//           outline: none;
//           background: white;
//         }

//         .section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//         }

//         .alert-message {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 12px;
//           color: #6b7280;
//         }

//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         /* Responsive Design */
//         @media (max-width: 768px) {
//           .orders-page {
//             padding: 12px;
//           }

//           .page-header h1 {
//             font-size: 20px;
//           }

//           .filters-bar {
//             padding: 12px;
//           }

//           .data-table {
//             min-width: 1000px;
//           }

//           .action-buttons {
//             flex-direction: column;
//             gap: 4px;
//           }

//           .action-btn {
//             padding: 4px 8px;
//             font-size: 11px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default StaffOrders;

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  X,
  Check,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Loader,
  Users,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";

// Create axios instance - using same endpoint as Branch Management
const api = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create separate axios instance for restaurant menu API
const menuApi = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel", // Use localhost for testing

  headers: {
    "Content-Type": "application/json",
  },
});

const StaffOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuError, setMenuError] = useState(""); // State for menu-specific errors

  // State for modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    paymentStatus: "",
    paymentMethod: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [availableItems, setAvailableItems] = useState([]);

  // State for expanded order items
  const [expandedOrders, setExpandedOrders] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 7;

  // Fetch orders, branches, and menu items on component mount or when filters change
  useEffect(() => {
    fetchBranches();
    fetchMenuItems();
    fetchOrders();
  }, [statusFilter, branchFilter, paymentStatusFilter, orderTypeFilter]);

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
      // Fetch from Jagali Koota backend
      const response = await fetch("http://192.168.1.40:9000/api/v1/hotel/menu");
      const data = await response.json();
      console.log("Menu API response:", data); // Debug the raw response

      // Handle different possible response structures
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (data.menuItems && Array.isArray(data.menuItems)) {
        items = data.menuItems;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items; // Additional case for common "items" field
      } else {
        console.error("Unexpected menu API response structure:", data);
        setMenuError("Invalid menu data format received from server.");
        return;
      }

      // Extract item names, handling multiple possible field names
      const menuItemNames = items
        .map(
          (item) => item.itemName || item.name || item.title || item.menuItem
        )
        .filter(
          (name) => name && typeof name === "string" && name !== "Unknown Item"
        )
        .map((name) => name.toLowerCase())
        .sort();

      console.log("Extracted menu item names:", menuItemNames); // Debug extracted names
      if (menuItemNames.length === 0) {
        setMenuError("No valid menu items found in the response.");
      } else {
        setAvailableItems(menuItemNames);
        setMenuError(""); // Clear error if items are successfully fetched
      }
    } catch (error) {
      console.error(
        "Error fetching restaurant menu items:",
        error.message,
        error.response
      );
      setMenuError(
        "Failed to load menu items. Please check the server and try again."
      );
    }
  };

  // Fetch all orders (both staff and guest orders)
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    setAllOrders([]);
    setFilteredOrders([]);
    setDisplayedOrders([]);

    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (branchFilter !== "all") params.branchId = branchFilter;
      if (paymentStatusFilter !== "all")
        params.paymentStatus = paymentStatusFilter;
      if (orderTypeFilter !== "all") params.orderType = orderTypeFilter;

      const response = await api.get("/staff-order", { params });

      if (!response.data.orders || !Array.isArray(response.data.orders)) {
        throw new Error("Invalid response format: orders array missing");
      }

      const formattedOrders = response.data.orders
        .map((order, index) => {
          const itemNames =
            order.items
              ?.map((item) => item.name || "")
              .filter((name) => name) || [];
          const itemNamesLower = itemNames.map((name) => name.toLowerCase());

          return {
            id: order._id || `temp-id-${index}`,
            orderId: order.orderId || `UNKNOWN-${index}`,
            customer: order.isGuestOrder
              ? order.customerName
              : order.userId?.name || "Unknown Staff",
            customerType: order.isGuestOrder ? "Guest" : "Staff",
            customerMobile: order.isGuestOrder
              ? order.customerMobile
              : order.userId?.mobile || "N/A",
            date: new Date(
              order.orderTime || order.createdAt || Date.now()
            ).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            branch: order.branchName || "Unknown Branch",
            branchId: order.branchId?._id || null,
            tableNumber: order.tableNumber || "N/A",
            peopleCount: order.peopleCount || 0,
            items: order.items?.length || 0,
            amount: `₹${order.grandTotal?.toFixed(2) || "0.00"}`,
            status: order.status || "pending",
            paymentMethod: order.paymentMethod || "cash",
            paymentStatus: order.paymentStatus || "pending",
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            serviceCharge: order.serviceCharge || 0,
            grandTotal: order.grandTotal || 0,
            originalOrder: order,
            isGuestOrder: order.isGuestOrder || false,
            itemNames,
            itemNamesLower,
            orderItems: order.items || [],
            itemsDisplay:
              itemNames.slice(0, 2).join(", ") +
              (itemNames.length > 2 ? ` +${itemNames.length - 2} more` : ""),
          };
        })
        .filter((order) => order.id);

      setAllOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search filtering and pagination
  useEffect(() => {
    const filtered = allOrders.filter((order) => {
      if (searchTerm.trim()) {
        const searchLower = searchTerm.trim().toLowerCase();
        const orderId = order.orderId || "";
        const tableNumber = order.tableNumber || "";
        const customer = order.customer || "";
        const customerMobile = order.customerMobile || "";
        const matchesSearch =
          orderId.toLowerCase().includes(searchLower) ||
          tableNumber.toLowerCase().includes(searchLower) ||
          customer.toLowerCase().includes(searchLower) ||
          customerMobile.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (itemFilter !== "all") {
        const itemLower = itemFilter.toLowerCase();
        const matchesItem = order.itemNamesLower.some((itemName) =>
          itemName.includes(itemLower)
        );
        if (!matchesItem) return false;
      }

      return true;
    });
    setFilteredOrders(filtered);
    setTotalPages(Math.ceil(filtered.length / ordersPerPage));
    setCurrentPage(1);
  }, [allOrders, searchTerm, itemFilter]);

  // Handle pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    setDisplayedOrders(paginatedOrders);
  }, [filteredOrders, currentPage]);

  // Toggle order items expansion
  const toggleOrderItems = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
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
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
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
      await api.put(`/staff-order/${selectedOrder.id}/status`, {
        status: editFormData.status,
        paymentStatus: editFormData.paymentStatus,
        paymentMethod: editFormData.paymentMethod,
      });

      await fetchOrders();

      setEditModalOpen(false);
      setSuccessMessage(`Order ${selectedOrder.orderId} updated successfully`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
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
    if (type === "status") {
      setStatusFilter(value);
    } else if (type === "branch") {
      setBranchFilter(value);
    } else if (type === "paymentStatus") {
      setPaymentStatusFilter(value);
    } else if (type === "orderType") {
      setOrderTypeFilter(value);
    } else if (type === "item") {
      setItemFilter(value);
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBranchFilter("all");
    setPaymentStatusFilter("all");
    setOrderTypeFilter("all");
    setItemFilter("all");
    setCurrentPage(1);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "card":
        return <CreditCard size={16} />;
      case "upi":
        return <IndianRupee size={16} />;
      case "cash":
      default:
        return <IndianRupee size={16} />;
    }
  };

  // Get payment status class
  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "completed";
      case "pending":
        return "pending";
      case "failed":
        return "cancelled";
      case "refunded":
        return "preparing";
      default:
        return "pending";
    }
  };

  // Export orders as CSV
  const exportOrders = () => {
    let csv =
      "Order ID,Customer,Customer Type,Mobile,Date,Branch,Table,People,Items,Amount,Payment Method,Payment Status,Order Status,Order Items\n";

    filteredOrders.forEach((order) => {
      const itemsString = order.orderItems
        .map((item) => `${item.name} (Qty: ${item.quantity})`)
        .join("; ");

      csv += `${order.orderId},"${order.customer}",${order.customerType},"${order.customerMobile}","${order.date}","${order.branch}",${order.tableNumber},${order.peopleCount},${order.items},${order.amount},${order.paymentMethod},${order.paymentStatus},${order.status},"${itemsString}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `all-orders-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <h1>All Orders (Staff & Guest)</h1>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={exportOrders}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-filters-grid">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, table, customer name, or mobile..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-container">
            <Filter size={18} className="filter-icon" />
            <select
              className="filter-select"
              value={itemFilter}
              onChange={(e) => handleFilterChange("item", e.target.value)}
            >
              <option value="all">All Items</option>
              {availableItems.length > 0 ? (
                availableItems.map((item, index) => (
                  <option key={index} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No menu items available
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-buttons">
            <select
              className="filter-select"
              value={orderTypeFilter}
              onChange={(e) => handleFilterChange("orderType", e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="staff">Staff Orders</option>
              <option value="guest">Guest Orders</option>
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="served">Served</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="filter-select"
              value={paymentStatusFilter}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Payment Pending</option>
              <option value="completed">Payment Completed</option>
              <option value="failed">Payment Failed</option>
              <option value="refunded">Refunded</option>
            </select>
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

          <button
            className="btn btn-outline clear-filters"
            onClick={clearAllFilters}
          >
            <X size={16} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Display menu-specific error */}
      {menuError && (
        <div className="error-container">
          <AlertCircle size={18} />
          <span>{menuError}</span>
        </div>
      )}

      {/* Active filters display */}
      {(searchTerm ||
        itemFilter !== "all" ||
        statusFilter !== "all" ||
        branchFilter !== "all" ||
        paymentStatusFilter !== "all" ||
        orderTypeFilter !== "all") && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {searchTerm && (
            <span className="filter-tag">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")}>×</button>
            </span>
          )}
          {itemFilter !== "all" && (
            <span className="filter-tag">
              Item: "{itemFilter}"
              <button onClick={() => setItemFilter("all")}>×</button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span className="filter-tag">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("all")}>×</button>
            </span>
          )}
          {branchFilter !== "all" && (
            <span className="filter-tag">
              Branch:{" "}
              {branches.find((b) => b._id === branchFilter)?.name ||
                branchFilter}
              <button onClick={() => setBranchFilter("all")}>×</button>
            </span>
          )}
          {paymentStatusFilter !== "all" && (
            <span className="filter-tag">
              Payment: {paymentStatusFilter}
              <button onClick={() => setPaymentStatusFilter("all")}>×</button>
            </span>
          )}
          {orderTypeFilter !== "all" && (
            <span className="filter-tag">
              Type: {orderTypeFilter}
              <button onClick={() => setOrderTypeFilter("all")}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Error message for orders */}
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
            <p>Loading orders...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order By</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th>Date</th>
                  <th>Branch</th>
                  <th>Table</th>
                  <th>People</th>
                  <th>Items</th>
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
                    <React.Fragment key={order.id}>
                      <tr>
                        <td data-label="Order ID">{order.orderId}</td>
                        <td data-label="Customer">{order.customer}</td>
                        <td data-label="Type">
                          <span
                            className={`customer-type-badge ${
                              order.isGuestOrder ? "guest" : "staff"
                            }`}
                          >
                            {order.customerType}
                          </span>
                        </td>
                        <td data-label="Mobile">{order.customerMobile}</td>
                        <td data-label="Date">{order.date}</td>
                        <td data-label="Branch">{order.branch}</td>
                        <td data-label="Table">{order.tableNumber}</td>
                        <td data-label="People">
                          <div className="people-count">
                            <Users size={14} />
                            {order.peopleCount}
                          </div>
                        </td>
                        <td data-label="Items" className="items-count">
                          <span className="items-badge">{order.items}</span>
                        </td>
                        <td data-label="Item Names" className="items-names">
                          <div className="items-display">
                            {order.itemsDisplay}
                            {order.itemNames.length > 0 && (
                              <button
                                className="expand-items-btn"
                                onClick={() => toggleOrderItems(order.id)}
                                title={
                                  expandedOrders[order.id]
                                    ? "Hide items"
                                    : "Show all items"
                                }
                              >
                                {expandedOrders[order.id] ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td data-label="Amount" className="amount-cell">
                          {order.amount}
                        </td>
                        <td data-label="Order Status">
                          <span className={`status-badge ${order.status}`}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td data-label="Payment Status">
                          <span
                            className={`status-badge ${getPaymentStatusClass(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            <button
                              className="action-btn view"
                              onClick={() => handleViewOrder(order)}
                            >
                              View
                            </button>
                            <button
                              className="action-btn edit"
                              onClick={() => handleEditOrder(order)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrders[order.id] && (
                        <tr className="order-items-expanded">
                          <td colSpan="14">
                            <div className="order-items-details">
                              <h4>Order Items ({order.orderItems.length})</h4>
                              <div className="items-grid">
                                {order.orderItems.map((item, index) => (
                                  <div key={index} className="order-item">
                                    <span className="item-name">
                                      {item.name}
                                    </span>
                                    <div className="item-details">
                                      <span className="item-quantity">
                                        Qty: {item.quantity}
                                      </span>
                                      <span className="item-price">
                                        ₹{item.price?.toFixed(2)} each
                                      </span>
                                      <span className="item-total">
                                        Total: ₹
                                        {(item.price * item.quantity)?.toFixed(
                                          2
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="no-orders">
                      No orders found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-page ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="pagination-ellipsis">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                className={`pagination-page ${
                  currentPage === totalPages ? "active" : ""
                }`}
                onClick={() => setCurrentPage(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {/* View Order Modal */}
      {viewModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order Details{" "}
                {selectedOrder.orderId}
              </h3>
              <button className="modal-close" onClick={closeViewModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="order-detail-row">
                  <div className="order-detail-label">Order By</div>
                  <div className="order-detail-value">
                    {selectedOrder.customer}
                    <span
                      className={`customer-type-badge ${
                        selectedOrder.isGuestOrder ? "guest" : "staff"
                      }`}
                      style={{ marginLeft: "8px" }}
                    >
                      {selectedOrder.customerType}
                    </span>
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Mobile Number</div>
                  <div className="order-detail-value">
                    {selectedOrder.customerMobile}
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Date</div>
                  <div className="order-detail-value">{selectedOrder.date}</div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Branch</div>
                  <div className="order-detail-value">
                    {selectedOrder.branch}
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Table Number</div>
                  <div className="order-detail-value">
                    {selectedOrder.tableNumber}
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Number of People</div>
                  <div className="order-detail-value">
                    <div className="people-count">
                      <Users size={16} />
                      {selectedOrder.peopleCount}
                    </div>
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Order Status</div>
                  <div className="order-detail-value">
                    <span className={`status-badge ${selectedOrder.status}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Payment Method</div>
                  <div className="order-detail-value">
                    <div className="payment-method-display">
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
                <div className="order-detail-row">
                  <div className="order-detail-label">Payment Status</div>
                  <div className="order-detail-value">
                    <span
                      className={`status-badge ${getPaymentStatusClass(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus
                        ? selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                          selectedOrder.paymentStatus.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h4>Price Details</h4>
                <div className="order-items-table">
                  <table className="data-table">
                    <tbody>
                      <tr>
                        <td>Subtotal</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td>Tax (5%)</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{selectedOrder.tax?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td>Service Charge (10%)</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{selectedOrder.serviceCharge?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr style={{ fontWeight: "bold" }}>
                        <td>Total Amount</td>
                        <td style={{ textAlign: "right" }}>
                          ₹{selectedOrder.grandTotal?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="order-items-section">
                <h4>Order Items ({selectedOrder.orderItems?.length || 0})</h4>
                <div className="order-items-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.length > 0 ? (
                        selectedOrder.orderItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price?.toFixed(2)}</td>
                            <td>₹{(item.price * item.quantity)?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
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
                Edit {selectedOrder.isGuestOrder ? "Guest" : "Staff"} Order{" "}
                {selectedOrder.orderId}
              </h3>
              <button className="modal-close" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Order By</label>
                <input
                  type="text"
                  value={selectedOrder.customer}
                  className="form-input"
                  disabled={true}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Type</label>
                <input
                  type="text"
                  value={selectedOrder.customerType}
                  className="form-input"
                  disabled={true}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="text"
                  value={selectedOrder.customerMobile}
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
                <label className="form-label">Table Number</label>
                <input
                  type="text"
                  value={selectedOrder.tableNumber}
                  className="form-input"
                  disabled={true}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="served">Served</option>
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

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={editFormData.paymentMethod}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              <div className="order-items-section">
                <div className="section-header">
                  <h4>Order Items ({selectedOrder.orderItems?.length || 0})</h4>
                  <div className="alert-message">
                    <AlertCircle size={16} />
                    <span>Order status and payment status can be updated</span>
                  </div>
                </div>
                <div className="order-items-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.length > 0 ? (
                        selectedOrder.orderItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price?.toFixed(2)}</td>
                            <td>₹{(item.price * item.quantity)?.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
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

      <style>{`
        /* CSS styles remain unchanged */
        .orders-page {
          padding: 20px;
          max-width: 100%;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .success-message {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .success-message button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-outline {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-outline:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-primary {
          background: #d97706;
          color: white;
        }

        .filters-bar {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .search-filters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .search-container {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .filter-container {
          position: relative;
          flex: 1;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          z-index: 2;
        }

        .filter-container .filter-select {
          padding-left: 40px;
        }

        .filter-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          min-width: 150px;
          outline: none;
          cursor: pointer;
        }

        .clear-filters {
          white-space: nowrap;
        }

        .error-container {
          margin: 20px 0;
          padding: 12px 16px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #fecaca;
        }

        .active-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
        }

        .active-filters-label {
          font-weight: 500;
          color: #0369a1;
          font-size: 14px;
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 16px;
          font-size: 12px;
          color: #374151;
        }

        .filter-tag button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .filter-tag button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .data-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 24px;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #6b7280;
        }

        .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1400px;
        }

        .data-table th,
        .data-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .data-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .no-orders {
          text-align: center;
          padding: 40px 20px;
          color: #9ca3af;
          font-style: italic;
        }

        .customer-type-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .customer-type-badge.staff {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .customer-type-badge.guest {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .people-count {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .items-count {
          text-align: center;
        }

        .items-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 50%;
          font-weight: 600;
          font-size: 12px;
        }

        .items-names {
          max-width: 200px;
          min-width: 150px;
        }

        .items-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.3;
        }

        .expand-items-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .expand-items-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .amount-cell {
          font-weight: 600;
          color: #059669;
        }

        .order-items-expanded {
          background: #f8fafc;
        }

        .order-items-expanded td {
          padding: 0 !important;
          border-bottom: 2px solid #e5e7eb;
        }

        .order-items-details {
          padding: 16px;
        }

        .order-items-details h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .order-item {
          display: flex;
          flex-direction: column;
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          gap: 6px;
        }

        .item-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .item-quantity,
        .item-price,
        .item-total {
          font-size: 12px;
          color: #6b7280;
        }

        .item-total {
          font-weight: 600;
          color: #059669;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .pagination-btn {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .pagination-pages {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .pagination-page {
          width: 36px;
          height: 36px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pagination-page.active {
          background: #d97706;
          color: white;
          border-color: #d97706;
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
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          line-height: 1;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .order-details {
          margin-bottom: 24px;
        }

        .order-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .order-detail-label {
          font-weight: 500;
          color: #374151;
          min-width: 140px;
        }

        .order-detail-value {
          color: #6b7280;
          text-align: right;
          flex: 1;
        }

        .payment-method-display {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-end;
        }

        .order-items-section {
          margin-bottom: 24px;
        }

        .order-items-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .order-items-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .alert-message {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .items-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .orders-page {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 20px;
          }

          .filters-bar {
            padding: 12px;
          }

          .search-filters-grid {
            grid-template-columns: 1fr;
          }

          .filter-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            flex-direction: column;
          }

          .active-filters {
            flex-direction: column;
            align-items: flex-start;
          }

          .items-names {
            max-width: 120px;
            min-width: 100px;
          }

          .items-display {
            font-size: 12px;
          }

          .data-table {
            min-width: 1000px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }

          .action-btn {
            padding: 4px 8px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .order-item {
            padding: 8px;
          }

          .item-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .items-names {
            max-width: 100px;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default StaffOrders;
