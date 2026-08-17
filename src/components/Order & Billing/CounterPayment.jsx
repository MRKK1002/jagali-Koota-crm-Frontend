// // import { useState, useEffect } from "react"
// // import { Search, Download, CreditCard, Wallet, ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react"
// // import axios from "axios"

// // const api = axios.create({
// //   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // })

// // const CounterPayment = () => {
// //   const [payments, setPayments] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState("")
// //   const [currentPage, setCurrentPage] = useState(1)
// //   const [totalPages, setTotalPages] = useState(1)
// //   const [searchQuery, setSearchQuery] = useState("")
// //   const [sortBy, setSortBy] = useState("date")
// //   const [sortOrder, setSortOrder] = useState("desc")
// //   const [selectedPayment, setSelectedPayment] = useState(null)
// //   const [showPaymentDetails, setShowPaymentDetails] = useState(false)
// //   const paymentsPerPage = 7

// //   useEffect(() => {
// //     const fetchCounterPayments = async () => {
// //       setLoading(true)
// //       setError("")
// //       try {
// //         const params = {
// //           page: currentPage,
// //           limit: paymentsPerPage,
// //         }
// //         if (searchQuery.trim()) {
// //           params.search = searchQuery.trim()
// //         }

// //         const response = await api.get("/counter-order/orders", { params })
// //         const formattedPayments = response.data.orders.map((order) => {
// //           return {
// //             id: order.id,
// //             orderId: order.invoice?.invoiceNumber || order.id,
// //             customer: order.customerName || "Unknown Customer",
// //             customerMobile: order.phoneNumber || "N/A",
// //             counterUser: order.userId?.name || "Unknown Counter User",
// //             counterMobile: order.userId?.mobile || "N/A",
// //             date: new Date(order.createdAt).toLocaleDateString("en-US", {
// //               year: "numeric",
// //               month: "long",
// //               day: "numeric",
// //             }),
// //             // Use backend values for tax and service charge
// //             subtotal: order.subtotal || 0,
// //             tax: order.tax || 0,
// //             serviceCharge: order.serviceCharge || 0,
// //             amount: order.grandTotal || order.totalAmount || 0,
// //             method: order.paymentMethod || "unknown",
// //             items: order.items || [],
// //             branchName: order.branch?.name || "Unknown Branch",
// //             branchLocation: order.branch?.location || "Unknown Location",
// //             invoiceNumber: order.invoice?.invoiceNumber || "N/A",
// //             orderTime: order.createdAt,
// //           }
// //         })
// //         setPayments(formattedPayments)

// //         // Calculate total pages based on response
// //         const totalOrders = response.data.count || formattedPayments.length
// //         setTotalPages(Math.ceil(totalOrders / paymentsPerPage))
// //       } catch (error) {
// //         console.error("Error fetching counter payments:", error)
// //         setError("Failed to load counter payments. Please try again.")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }
// //     fetchCounterPayments()
// //   }, [currentPage, searchQuery])

// //   const filteredPayments = payments.filter((payment) => {
// //     const searchLower = searchQuery.toLowerCase()
// //     return (
// //       (payment.orderId || "").toLowerCase().includes(searchLower) ||
// //       (payment.customer || "").toLowerCase().includes(searchLower) ||
// //       (payment.counterUser || "").toLowerCase().includes(searchLower) ||
// //       (payment.branchName || "").toLowerCase().includes(searchLower) ||
// //       (payment.customerMobile || "").toLowerCase().includes(searchLower)
// //     )
// //   })

// //   const sortedPayments = [...filteredPayments].sort((a, b) => {
// //     if (sortBy === "date") {
// //       return sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
// //     } else if (sortBy === "amount") {
// //       return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
// //     }
// //     return 0
// //   })

// //   const paginatedPayments = sortedPayments.slice(0, paymentsPerPage)

// //   const getPaymentMethodIcon = (method) => {
// //     switch (method) {
// //       case "card":
// //         return <CreditCard className="h-5 w-5" />
// //       case "upi":
// //         return <Wallet className="h-5 w-5" />
// //       case "cash":
// //         return <span className="rupees-icon">₹</span>
// //       case "qr":
// //         return <Wallet className="h-5 w-5" />
// //       default:
// //         return <CreditCard className="h-5 w-5" />
// //     }
// //   }

// //   const handleViewPayment = (payment) => {
// //     setSelectedPayment(payment)
// //     setShowPaymentDetails(true)
// //   }

// //   const handleClosePaymentDetails = () => {
// //     setShowPaymentDetails(false)
// //     setSelectedPayment(null)
// //   }

// //   const handleSortChange = (field) => {
// //     if (sortBy === field) {
// //       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
// //     } else {
// //       setSortBy(field)
// //       setSortOrder("desc")
// //     }
// //   }

// //   const escapeCsvField = (field) => {
// //     if (field === null || field === undefined) return ""
// //     const str = field.toString()
// //     if (str.includes(",") || str.includes('"') || str.includes("\n")) {
// //       return `"${str.replace(/"/g, '""')}"`
// //     }
// //     return str
// //   }

// //   const exportPayments = () => {
// //     const headers = [
// //       "Order ID",
// //       "Customer Name",
// //       "Customer Mobile",
// //       "Counter User",
// //       "Branch",
// //       "Date",
// //       "Subtotal",
// //       "Tax",
// //       "Service Charge",
// //       "Total Amount",
// //       "Payment Method",
// //     ]
// //     let csv = headers.map(escapeCsvField).join(",") + "\n"

// //     payments.forEach((payment) => {
// //       const row = [
// //         payment.orderId,
// //         payment.customer,
// //         payment.customerMobile,
// //         payment.counterUser,
// //         payment.branchName,
// //         payment.date,
// //         `₹${payment.subtotal.toFixed(2)}`,
// //         `₹${payment.tax.toFixed(2)}`,
// //         `₹${payment.serviceCharge.toFixed(2)}`,
// //         `₹${payment.amount.toFixed(2)}`,
// //         payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
// //       ]
// //       csv += row.map(escapeCsvField).join(",") + "\n"
// //     })

// //     const bom = "\uFEFF"
// //     const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
// //     const url = window.URL.createObjectURL(blob)
// //     const a = document.createElement("a")
// //     a.setAttribute("hidden", "")
// //     a.setAttribute("href", url)
// //     a.setAttribute("download", `counter-payments-export-${new Date().toISOString().slice(0, 10)}.csv`)
// //     document.body.appendChild(a)
// //     a.click()
// //     document.body.removeChild(a)
// //   }

// //   // Pagination logic to show limited pages
// //   const getPaginationRange = () => {
// //     const maxPagesToShow = 5
// //     const pages = []

// //     if (totalPages <= 7) {
// //       for (let i = 1; i <= totalPages; i++) {
// //         pages.push(i)
// //       }
// //     } else {
// //       pages.push(1)

// //       let startPage = Math.max(2, currentPage - 2)
// //       let endPage = Math.min(totalPages - 1, currentPage + 2)

// //       if (currentPage <= 4) {
// //         endPage = 5
// //       }
// //       if (currentPage >= totalPages - 3) {
// //         startPage = totalPages - 4
// //       }

// //       if (startPage > 2) {
// //         pages.push("...")
// //       }

// //       for (let i = startPage; i <= endPage; i++) {
// //         pages.push(i)
// //       }

// //       if (endPage < totalPages - 1) {
// //         pages.push("...")
// //       }

// //       if (totalPages > 1) {
// //         pages.push(totalPages)
// //       }
// //     }

// //     return pages
// //   }

// //   return (
// //     <div className="payment-ui">
// //       <div className="page-header">
// //         <h1>Counter Payments</h1>
// //       </div>

// //       {error && (
// //         <div
// //           className="error-container"
// //           style={{
// //             margin: "20px 0",
// //             padding: "10px 15px",
// //             backgroundColor: "#fee2e2",
// //             color: "#dc2626",
// //             borderRadius: "4px",
// //             display: "flex",
// //             alignItems: "center",
// //             gap: "8px",
// //           }}
// //         >
// //           <span>{error}</span>
// //         </div>
// //       )}

// //       <div className="filters-bar">
// //         <div className="search-container">
// //           <Search className="search-icon" />
// //           <input
// //             type="text"
// //             className="search-input"
// //             placeholder="Search by order ID, customer name, counter user, or branch"
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //           />
// //         </div>
// //         <div className="filter-buttons">
// //           <button className="filter-btn" onClick={exportPayments}>
// //             <Download className="h-4 w-4" />
// //             <span>Export</span>
// //           </button>
// //         </div>
// //       </div>

// //       <div className="data-card">
// //         <div className="card-body">
// //           {loading ? (
// //             <div className="loading-container">
// //               <div className="loading-spinner"></div>
// //               <p>Loading counter payments...</p>
// //             </div>
// //           ) : paginatedPayments.length === 0 ? (
// //             <div className="empty-state">
// //               <p>No counter payments found matching your search.</p>
// //             </div>
// //           ) : (
// //             <table className="data-table">
// //               <thead>
// //                 <tr>
// //                   <th>Order ID</th>
// //                   <th>Customer</th>
// //                   <th>Counter User</th>
// //                   <th>Branch</th>
// //                   <th className="sortable-header" onClick={() => handleSortChange("date")}>
// //                     <div className="sort-header">
// //                       <span>Date</span>
// //                       {sortBy === "date" &&
// //                         (sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
// //                     </div>
// //                   </th>
// //                   <th className="sortable-header" onClick={() => handleSortChange("amount")}>
// //                     <div className="sort-header">
// //                       <span>Amount</span>
// //                       {sortBy === "amount" &&
// //                         (sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
// //                     </div>
// //                   </th>
// //                   <th>Payment Method</th>
// //                   <th>Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {paginatedPayments.map((payment) => (
// //                   <tr key={payment.id}>
// //                     <td>{payment.orderId}</td>
// //                     <td>
// //                       <div>
// //                         <div>{payment.customer}</div>
// //                         <div style={{ fontSize: "12px", color: "#666" }}>{payment.customerMobile}</div>
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div>
// //                         <div>{payment.counterUser}</div>
// //                         <div style={{ fontSize: "12px", color: "#666" }}>{payment.counterMobile}</div>
// //                       </div>
// //                     </td>
// //                     <td>{payment.branchName}</td>
// //                     <td>{payment.date}</td>
// //                     <td>₹{payment.amount.toFixed(2)}</td>
// //                     <td>
// //                       <div className="payment-method">
// //                         {getPaymentMethodIcon(payment.method)}
// //                         <span className="payment-method-text">
// //                           {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
// //                         </span>
// //                       </div>
// //                     </td>
// //                     <td>
// //                       <div className="action-buttons">
// //                         <button className="action-btn view" onClick={() => handleViewPayment(payment)}>
// //                           View
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           )}
// //         </div>
// //       </div>

// //       <div className="pagination">
// //         <button
// //           className="pagination-btn flex items-center justify-center gap-1"
// //           disabled={currentPage === 1}
// //           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
// //         >
// //           <ChevronLeft className="h-4 w-4" />
// //           <span>Previous</span>
// //         </button>
// //         <div className="pagination-pages">
// //           {getPaginationRange().map((page, index) =>
// //             page === "..." ? (
// //               <span key={index} className="pagination-ellipsis">
// //                 ...
// //               </span>
// //             ) : (
// //               <button
// //                 key={index}
// //                 className={`pagination-page ${currentPage === page ? "active" : ""}`}
// //                 onClick={() => setCurrentPage(page)}
// //               >
// //                 {page}
// //               </button>
// //             ),
// //           )}
// //         </div>
// //         <button
// //           className="pagination-btn flex items-center justify-center gap-1"
// //           disabled={currentPage === totalPages}
// //           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
// //         >
// //           <span>Next</span>
// //           <ChevronRight className="h-4 w-4" />
// //         </button>
// //       </div>

// //       {showPaymentDetails && selectedPayment && (
// //         <div className="modal-overlay">
// //           <div className="modal">
// //             <div className="modal-header">
// //               <h2 className="modal-title">Counter Payment Details</h2>
// //               <button className="modal-close" onClick={handleClosePaymentDetails}>
// //                 ×
// //               </button>
// //             </div>
// //             <div className="modal-body">
// //               <div className="payment-details">
// //                 <div className="payment-info-grid">
// //                   <div className="payment-info-section">
// //                     <h3 className="payment-info-title">Payment Information</h3>
// //                     <div className="payment-info-content">
// //                       <div className="info-row">
// //                         <span className="info-label">Order ID:</span>
// //                         <span className="info-value">{selectedPayment.orderId}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Invoice Number:</span>
// //                         <span className="info-value">{selectedPayment.invoiceNumber}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Date:</span>
// //                         <span className="info-value">{selectedPayment.date}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Branch:</span>
// //                         <span className="info-value">{selectedPayment.branchName}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Subtotal:</span>
// //                         <span className="info-value">₹{selectedPayment.subtotal.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Tax:</span>
// //                         <span className="info-value">₹{selectedPayment.tax.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Service Charge:</span>
// //                         <span className="info-value">₹{selectedPayment.serviceCharge.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Total Amount:</span>
// //                         <span className="info-value">₹{selectedPayment.amount.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Payment Method:</span>
// //                         <span className="info-value">
// //                           <div className="payment-method">
// //                             {getPaymentMethodIcon(selectedPayment.method)}
// //                             <span className="payment-method-text">
// //                               {selectedPayment.method.charAt(0).toUpperCase() + selectedPayment.method.slice(1)}
// //                             </span>
// //                           </div>
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="payment-info-section">
// //                     <h3 className="payment-info-title">Customer & Counter Information</h3>
// //                     <div className="payment-info-content">
// //                       <div className="info-row">
// //                         <span className="info-label">Customer Name:</span>
// //                         <span className="info-value">{selectedPayment.customer}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Customer Mobile:</span>
// //                         <span className="info-value">{selectedPayment.customerMobile}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Counter User:</span>
// //                         <span className="info-value">{selectedPayment.counterUser}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Counter Mobile:</span>
// //                         <span className="info-value">{selectedPayment.counterMobile}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Branch Location:</span>
// //                         <span className="info-value">{selectedPayment.branchLocation}</span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="order-items-section">
// //                   <h3 className="payment-info-title">Order Items</h3>
// //                   <table className="order-items-table">
// //                     <thead>
// //                       <tr>
// //                         <th>Item</th>
// //                         <th>Quantity</th>
// //                         <th>Price</th>
// //                         <th>Total</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {selectedPayment.items.map((item, index) => (
// //                         <tr key={index}>
// //                           <td>{item.name}</td>
// //                           <td>{item.quantity}</td>
// //                           <td>₹{item.price.toFixed(2)}</td>
// //                           <td>₹{(item.quantity * item.price).toFixed(2)}</td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                     <tfoot>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Subtotal
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.subtotal.toFixed(2)}</td>
// //                       </tr>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Tax
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.tax.toFixed(2)}</td>
// //                       </tr>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Service Charge
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.serviceCharge.toFixed(2)}</td>
// //                       </tr>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Total
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.amount.toFixed(2)}</td>
// //                       </tr>
// //                     </tfoot>
// //                   </table>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="modal-footer">
// //               <button className="btn btn-outline" onClick={handleClosePaymentDetails}>
// //                 Close
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <style>{`
// //         .loading-container {
// //           display: flex;
// //           flex-direction: column;
// //           align-items: center;
// //           justify-content: center;
// //           padding: 40px;
// //         }

// //         .loading-spinner {
// //           border: 4px solid rgba(0, 0, 0, 0.1);
// //           border-left-color: var(--primary-color);
// //           border-radius: 50%;
// //           width: 30px;
// //           height: 30px;
// //           animation: spin 1s linear infinite;
// //           margin-bottom: 10px;
// //         }

// //         @keyframes spin {
// //           0% {
// //             transform: rotate(0deg);
// //           }
// //           100% {
// //             transform: rotate(360deg);
// //           }
// //         }

// //         .sortable-header {
// //           cursor: pointer;
// //         }

// //         .sort-header {
// //           display: flex;
// //           align-items: center;
// //           gap: 4px;
// //         }

// //         .payment-method {
// //           display: flex;
// //           align-items: center;
// //           gap: 8px;
// //         }

// //         .payment-method-text {
// //           font-size: 14px;
// //         }

// //         .rupees-icon {
// //           display: flex;
// //           align-items: center;
// //           font-size: 18px;
// //           line-height: 1;
// //         }

// //         .payment-details {
// //           padding: 10px 0;
// //         }

// //         .payment-info-grid {
// //           display: grid;
// //           grid-template-columns: 1fr 1fr;
// //           gap: 20px;
// //           margin-bottom: 20px;
// //         }

// //         @media (max-width: 768px) {
// //           .payment-info-grid {
// //             grid-template-columns: 1fr;
// //           }
// //         }

// //         .payment-info-section {
// //           background-color: var(--bg-light);
// //           border-radius: var(--radius-md);
// //           overflow: hidden;
// //         }

// //         .payment-info-title {
// //           font-size: 16px;
// //           font-weight: 600;
// //           padding: 12px 16px;
// //           background-color: var(--bg-white);
// //           border-bottom: 1px solid var(--border-color);
// //         }

// //         .payment-info-content {
// //           padding: 16px;
// //         }

// //         .info-row {
// //           display: flex;
// //           margin-bottom: 10px;
// //         }

// //         .info-label {
// //           width: 140px;
// //           font-weight: 500;
// //           color: var(--text-light);
// //         }

// //         .info-value {
// //           flex: 1;
// //           font-weight: 500;
// //         }

// //         .order-items-section {
// //           margin-top: 20px;
// //         }

// //         .order-items-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 10px;
// //         }

// //         .order-items-table th {
// //           text-align: left;
// //           padding: 12px;
// //           background-color: var(--bg-light);
// //           font-weight: 500;
// //           color: var(--text-light);
// //         }

// //         .order-items-table td {
// //           padding: 12px;
// //           border-bottom: 1px solid var(--border-color);
// //         }

// //         .order-items-table tfoot td {
// //           padding: 12px;
// //           font-weight: 600;
// //         }

// //         .total-label {
// //           text-align: right;
// //           font-weight: 600;
// //         }

// //         .total-value {
// //           font-weight: 700;
// //           color: var(--primary-color);
// //         }

// //         .pagination-btn {
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           gap: 4px;
// //           padding: 8px 16px;
// //           border: 1px solid var(--border-color);
// //           border-radius: var(--radius-md);
// //           background-color: var(--bg-white);
// //           cursor: pointer;
// //         }

// //         .pagination-btn:disabled {
// //           opacity: 0.5;
// //           cursor: not-allowed;
// //         }

// //         .pagination-page {
// //           padding: 8px 12px;
// //           border: 1px solid var(--border-color);
// //           border-radius: var(--radius-md);
// //           background-color: var(--bg-white);
// //           cursor: pointer;
// //         }

// //         .pagination-page.active {
// //           background-color: var(--primary-color);
// //           color: white;
// //           border-color: var(--primary-color);
// //         }

// //         .pagination-ellipsis {
// //           padding: 8px 12px;
// //           color: var(--text-light);
// //           display: inline-flex;
// //           align-items: center;
// //           justify-content: center;
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // export default CounterPayment
// // import { useState, useEffect } from "react"
// // import {
// //   Search,
// //   Download,
// //   CreditCard,
// //   Wallet,
// //   ChevronLeft,
// //   ChevronRight,
// //   ArrowDown,
// //   ArrowUp,
// //   X,
// //   FileText,
// //   User,
// //   Calendar,
// //   DollarSign,
// //   Filter,
// //   Building,
// //   Phone
// // } from "lucide-react"
// // import axios from "axios"

// // const api = axios.create({
// //   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // })

// // const CounterPayment = () => {
// //   const [payments, setPayments] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState("")
// //   const [currentPage, setCurrentPage] = useState(1)
// //   const [totalPages, setTotalPages] = useState(1)
// //   const [searchQuery, setSearchQuery] = useState("")
// //   const [sortBy, setSortBy] = useState("date")
// //   const [sortOrder, setSortOrder] = useState("desc")
// //   const [selectedPayment, setSelectedPayment] = useState(null)
// //   const [showPaymentDetails, setShowPaymentDetails] = useState(false)
// //   const paymentsPerPage = 7

// //   useEffect(() => {
// //     const fetchCounterPayments = async () => {
// //       setLoading(true)
// //       setError("")
// //       try {
// //         const params = {
// //           page: currentPage,
// //           limit: paymentsPerPage,
// //         }
// //         if (searchQuery.trim()) {
// //           params.search = searchQuery.trim()
// //         }

// //         const response = await api.get("/counter-order/orders", { params })
// //         const formattedPayments = response.data.orders.map((order) => {
// //           return {
// //             id: order.id,
// //             orderId: order.invoice?.invoiceNumber || order.id,
// //             customer: order.customerName || "Unknown Customer",
// //             customerMobile: order.phoneNumber || "N/A",
// //             counterUser: order.userId?.name || "Unknown Counter User",
// //             counterMobile: order.userId?.mobile || "N/A",
// //             date: new Date(order.createdAt).toLocaleDateString("en-US", {
// //               year: "numeric",
// //               month: "long",
// //               day: "numeric",
// //             }),
// //             // Use backend values for tax and service charge
// //             subtotal: order.subtotal || 0,
// //             tax: order.tax || 0,
// //             serviceCharge: order.serviceCharge || 0,
// //             amount: order.grandTotal || order.totalAmount || 0,
// //             method: order.paymentMethod || "unknown",
// //             items: order.items || [],
// //             branchName: order.branch?.name || "Unknown Branch",
// //             branchLocation: order.branch?.location || "Unknown Location",
// //             invoiceNumber: order.invoice?.invoiceNumber || "N/A",
// //             orderTime: order.createdAt,
// //           }
// //         })
// //         setPayments(formattedPayments)

// //         // Calculate total pages based on response
// //         const totalOrders = response.data.count || formattedPayments.length
// //         setTotalPages(Math.ceil(totalOrders / paymentsPerPage))
// //       } catch (error) {
// //         console.error("Error fetching counter payments:", error)
// //         setError("Failed to load counter payments. Please try again.")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }
// //     fetchCounterPayments()
// //   }, [currentPage, searchQuery])

// //   const filteredPayments = payments.filter((payment) => {
// //     const searchLower = searchQuery.toLowerCase()
// //     return (
// //       (payment.orderId || "").toLowerCase().includes(searchLower) ||
// //       (payment.customer || "").toLowerCase().includes(searchLower) ||
// //       (payment.counterUser || "").toLowerCase().includes(searchLower) ||
// //       (payment.branchName || "").toLowerCase().includes(searchLower) ||
// //       (payment.customerMobile || "").toLowerCase().includes(searchLower)
// //     )
// //   })

// //   const sortedPayments = [...filteredPayments].sort((a, b) => {
// //     if (sortBy === "date") {
// //       return sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
// //     } else if (sortBy === "amount") {
// //       return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
// //     }
// //     return 0
// //   })

// //   const paginatedPayments = sortedPayments.slice(0, paymentsPerPage)

// //   const getPaymentMethodIcon = (method) => {
// //     switch (method) {
// //       case "card":
// //         return <CreditCard className="h-5 w-5" />
// //       case "upi":
// //         return <Wallet className="h-5 w-5" />
// //       case "cash":
// //         return <span className="rupees-icon">₹</span>
// //       case "qr":
// //         return <Wallet className="h-5 w-5" />
// //       default:
// //         return <CreditCard className="h-5 w-5" />
// //     }
// //   }

// //   const handleViewPayment = (payment) => {
// //     setSelectedPayment(payment)
// //     setShowPaymentDetails(true)
// //   }

// //   const handleClosePaymentDetails = () => {
// //     setShowPaymentDetails(false)
// //     setSelectedPayment(null)
// //   }

// //   const handleSortChange = (field) => {
// //     if (sortBy === field) {
// //       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
// //     } else {
// //       setSortBy(field)
// //       setSortOrder("desc")
// //     }
// //   }

// //   const escapeCsvField = (field) => {
// //     if (field === null || field === undefined) return ""
// //     const str = field.toString()
// //     if (str.includes(",") || str.includes('"') || str.includes("\n")) {
// //       return `"${str.replace(/"/g, '""')}"`
// //     }
// //     return str
// //   }

// //   const exportPayments = () => {
// //     const headers = [
// //       "Order ID",
// //       "Customer Name",
// //       "Customer Mobile",
// //       "Counter User",
// //       "Branch",
// //       "Date",
// //       "Subtotal",
// //       "Tax",
// //       "Service Charge",
// //       "Total Amount",
// //       "Payment Method",
// //     ]
// //     let csv = headers.map(escapeCsvField).join(",") + "\n"

// //     payments.forEach((payment) => {
// //       const row = [
// //         payment.orderId,
// //         payment.customer,
// //         payment.customerMobile,
// //         payment.counterUser,
// //         payment.branchName,
// //         payment.date,
// //         `₹${payment.subtotal.toFixed(2)}`,
// //         `₹${payment.tax.toFixed(2)}`,
// //         `₹${payment.serviceCharge.toFixed(2)}`,
// //         `₹${payment.amount.toFixed(2)}`,
// //         payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
// //       ]
// //       csv += row.map(escapeCsvField).join(",") + "\n"
// //     })

// //     const bom = "\uFEFF"
// //     const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
// //     const url = window.URL.createObjectURL(blob)
// //     const a = document.createElement("a")
// //     a.setAttribute("hidden", "")
// //     a.setAttribute("href", url)
// //     a.setAttribute("download", `counter-payments-export-${new Date().toISOString().slice(0, 10)}.csv`)
// //     document.body.appendChild(a)
// //     a.click()
// //     document.body.removeChild(a)
// //   }

// //   // Pagination logic to show limited pages
// //   const getPaginationRange = () => {
// //     const maxPagesToShow = 5
// //     const pages = []

// //     if (totalPages <= 7) {
// //       for (let i = 1; i <= totalPages; i++) {
// //         pages.push(i)
// //       }
// //     } else {
// //       pages.push(1)

// //       let startPage = Math.max(2, currentPage - 2)
// //       let endPage = Math.min(totalPages - 1, currentPage + 2)

// //       if (currentPage <= 4) {
// //         endPage = 5
// //       }
// //       if (currentPage >= totalPages - 3) {
// //         startPage = totalPages - 4
// //       }

// //       if (startPage > 2) {
// //         pages.push("...")
// //       }

// //       for (let i = startPage; i <= endPage; i++) {
// //         pages.push(i)
// //       }

// //       if (endPage < totalPages - 1) {
// //         pages.push("...")
// //       }

// //       if (totalPages > 1) {
// //         pages.push(totalPages)
// //       }
// //     }

// //     return pages
// //   }

// //   return (
// //     <div className="payment-ui">
// //       <div className="page-header">
// //         <h1>Counter Payments</h1>
// //         <p>Manage and review all counter payment transactions</p>
// //       </div>

// //       {error && (
// //         <div className="error-container">
// //           <span>{error}</span>
// //         </div>
// //       )}

// //       <div className="dashboard-card">
// //         <div className="filters-bar">
// //           <div className="search-container">
// //             <Search className="search-icon" />
// //             <input
// //               type="text"
// //               className="search-input"
// //               placeholder="Search by order ID, customer name, counter user, or branch"
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //             />
// //           </div>
// //           <div className="filter-buttons">
// //             <button className="filter-btn outline">
// //               <Filter className="h-4 w-4" />
// //               <span>Filter</span>
// //             </button>
// //             <button className="filter-btn primary" onClick={exportPayments}>
// //               <Download className="h-4 w-4" />
// //               <span>Export</span>
// //             </button>
// //           </div>
// //         </div>

// //         <div className="data-card">
// //           <div className="card-body">
// //             {loading ? (
// //               <div className="loading-container">
// //                 <div className="loading-spinner"></div>
// //                 <p>Loading counter payments...</p>
// //               </div>
// //             ) : paginatedPayments.length === 0 ? (
// //               <div className="empty-state">
// //                 <FileText className="empty-icon" />
// //                 <p>No counter payments found matching your search.</p>
// //               </div>
// //             ) : (
// //               <table className="data-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Order ID</th>
// //                     <th>Customer</th>
// //                     <th>Counter User</th>
// //                     <th>Branch</th>
// //                     <th className="sortable-header" onClick={() => handleSortChange("date")}>
// //                       <div className="sort-header">
// //                         <span>Date</span>
// //                         {sortBy === "date" &&
// //                           (sortOrder === "asc" ? (
// //                             <ArrowUp className="h-4 w-4" />
// //                           ) : (
// //                             <ArrowDown className="h-4 w-4" />
// //                           ))}
// //                       </div>
// //                     </th>
// //                     <th className="sortable-header" onClick={() => handleSortChange("amount")}>
// //                       <div className="sort-header">
// //                         <span>Amount</span>
// //                         {sortBy === "amount" &&
// //                           (sortOrder === "asc" ? (
// //                             <ArrowUp className="h-4 w-4" />
// //                           ) : (
// //                             <ArrowDown className="h-4 w-4" />
// //                           ))}
// //                       </div>
// //                     </th>
// //                     <th>Payment Method</th>
// //                     <th>Actions</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {paginatedPayments.map((payment) => (
// //                     <tr key={payment.id}>
// //                       <td className="order-id">{payment.orderId}</td>
// //                       <td>
// //                         <div className="customer-cell">
// //                           <User className="customer-icon" />
// //                           <div>
// //                             <div>{payment.customer}</div>
// //                             <div className="secondary-text">{payment.customerMobile}</div>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td>
// //                         <div className="customer-cell">
// //                           <User className="customer-icon" />
// //                           <div>
// //                             <div>{payment.counterUser}</div>
// //                             <div className="secondary-text">{payment.counterMobile}</div>
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td>
// //                         <div className="branch-cell">
// //                           <Building className="branch-icon" />
// //                           <span>{payment.branchName}</span>
// //                         </div>
// //                       </td>
// //                       <td>
// //                         <div className="date-cell">
// //                           <Calendar className="date-icon" />
// //                           <span>{payment.date}</span>
// //                         </div>
// //                       </td>
// //                       <td className="amount">
// //                         <div className="amount-cell">

// //                           <span>₹{payment.amount.toFixed(2)}</span>
// //                         </div>
// //                       </td>
// //                       <td>
// //                         <div className={`payment-method ${payment.method}`}>
// //                           {getPaymentMethodIcon(payment.method)}
// //                           <span className="payment-method-text">
// //                             {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
// //                           </span>
// //                         </div>
// //                       </td>
// //                       <td>
// //                         <div className="action-buttons">
// //                           <button
// //                             className="action-btn view"
// //                             onClick={() => handleViewPayment(payment)}
// //                           >
// //                             View Details
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             )}
// //           </div>
// //         </div>

// //         <div className="pagination">
// //           <button
// //             className="pagination-btn"
// //             disabled={currentPage === 1}
// //             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
// //           >
// //             <ChevronLeft className="h-4 w-4" />
// //             <span>Previous</span>
// //           </button>
// //           <div className="pagination-pages">
// //             {getPaginationRange().map((page, index) =>
// //               page === "..." ? (
// //                 <span key={index} className="pagination-ellipsis">
// //                   ...
// //                 </span>
// //               ) : (
// //                 <button
// //                   key={index}
// //                   className={`pagination-page ${currentPage === page ? "active" : ""}`}
// //                   onClick={() => setCurrentPage(page)}
// //                 >
// //                   {page}
// //                 </button>
// //               ),
// //             )}
// //           </div>
// //           <button
// //             className="pagination-btn"
// //             disabled={currentPage === totalPages}
// //             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
// //           >
// //             <span>Next</span>
// //             <ChevronRight className="h-4 w-4" />
// //           </button>
// //         </div>
// //       </div>

// //       {showPaymentDetails && selectedPayment && (
// //         <div className="modal-overlay">
// //           <div className="modal">
// //             <div className="modal-header">
// //               <h2 className="modal-title">Counter Payment Details</h2>
// //               <button className="modal-close" onClick={handleClosePaymentDetails}>
// //                 <X className="h-5 w-5" />
// //               </button>
// //             </div>
// //             <div className="modal-body">
// //               <div className="payment-details">
// //                 <div className="payment-info-grid">
// //                   <div className="payment-info-section">
// //                     <h3 className="payment-info-title">
// //                       <FileText className="section-icon" />
// //                       Payment Information
// //                     </h3>
// //                     <div className="payment-info-content">
// //                       <div className="info-row">
// //                         <span className="info-label">Order ID:</span>
// //                         <span className="info-value">{selectedPayment.orderId}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Invoice Number:</span>
// //                         <span className="info-value">{selectedPayment.invoiceNumber}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Date:</span>
// //                         <span className="info-value">{selectedPayment.date}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Branch:</span>
// //                         <span className="info-value">{selectedPayment.branchName}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Subtotal:</span>
// //                         <span className="info-value">₹{selectedPayment.subtotal.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Tax:</span>
// //                         <span className="info-value">₹{selectedPayment.tax.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Service Charge:</span>
// //                         <span className="info-value">₹{selectedPayment.serviceCharge.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row total">
// //                         <span className="info-label">Total Amount:</span>
// //                         <span className="info-value">₹{selectedPayment.amount.toFixed(2)}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Payment Method:</span>
// //                         <span className="info-value">
// //                           <div className={`payment-method ${selectedPayment.method}`}>
// //                             {getPaymentMethodIcon(selectedPayment.method)}
// //                             <span className="payment-method-text">
// //                               {selectedPayment.method.charAt(0).toUpperCase() + selectedPayment.method.slice(1)}
// //                             </span>
// //                           </div>
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="payment-info-section">
// //                     <h3 className="payment-info-title">
// //                       <User className="section-icon" />
// //                       Customer & Counter Information
// //                     </h3>
// //                     <div className="payment-info-content">
// //                       <div className="info-row">
// //                         <span className="info-label">Customer Name:</span>
// //                         <span className="info-value">{selectedPayment.customer}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Customer Mobile:</span>
// //                         <span className="info-value">
// //                           <div className="contact-cell">
// //                             <Phone className="contact-icon" />
// //                             {selectedPayment.customerMobile}
// //                           </div>
// //                         </span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Counter User:</span>
// //                         <span className="info-value">{selectedPayment.counterUser}</span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Counter Mobile:</span>
// //                         <span className="info-value">
// //                           <div className="contact-cell">
// //                             <Phone className="contact-icon" />
// //                             {selectedPayment.counterMobile}
// //                           </div>
// //                         </span>
// //                       </div>
// //                       <div className="info-row">
// //                         <span className="info-label">Branch Location:</span>
// //                         <span className="info-value">{selectedPayment.branchLocation}</span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="order-items-section">
// //                   <h3 className="payment-info-title">
// //                     <FileText className="section-icon" />
// //                     Order Items
// //                   </h3>
// //                   <table className="order-items-table">
// //                     <thead>
// //                       <tr>
// //                         <th>Item</th>
// //                         <th>Quantity</th>
// //                         <th>Price</th>
// //                         <th>Total</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {selectedPayment.items.map((item, index) => (
// //                         <tr key={index}>
// //                           <td>{item.name}</td>
// //                           <td>{item.quantity}</td>
// //                           <td>₹{item.price.toFixed(2)}</td>
// //                           <td>₹{(item.quantity * item.price).toFixed(2)}</td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                     <tfoot>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Subtotal
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.subtotal.toFixed(2)}</td>
// //                       </tr>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Tax
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.tax.toFixed(2)}</td>
// //                       </tr>
// //                       <tr>
// //                         <td colSpan="3" className="total-label">
// //                           Service Charge
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.serviceCharge.toFixed(2)}</td>
// //                       </tr>
// //                       <tr className="grand-total">
// //                         <td colSpan="3" className="total-label">
// //                           Total
// //                         </td>
// //                         <td className="total-value">₹{selectedPayment.amount.toFixed(2)}</td>
// //                       </tr>
// //                     </tfoot>
// //                   </table>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="modal-footer">
// //               <button className="btn btn-outline" onClick={handleClosePaymentDetails}>
// //                 Close
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <style jsx>{`
// //         :root {
// //           --primary: #4361ee;
// //           --primary-light: #4895ef;
// //           --secondary: #3f37c9;
// //           --success: #4cc9f0;
// //           --danger: #f72585;
// //           --warning: #f8961e;
// //           --info: #4895ef;
// //           --dark: #212529;
// //           --light: #f8f9fa;
// //           --gray: #6c757d;
// //           --gray-light: #ced4da;
// //           --border: #dee2e6;
// //           --bg-white: #ffffff;
// //           --bg-light: #f8f9fa;
// //           --text: #212529;
// //           --text-light: #6c757d;
// //           --radius-sm: 0.25rem;
// //           --radius-md: 0.375rem;
// //           --radius-lg: 0.5rem;
// //           --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
// //           --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
// //           --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
// //         }

// //         .payment-ui {
// //           padding: 2rem;
// //           background-color: #f5f7fb;
// //           min-height: 100vh;
// //           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
// //         }

// //         .page-header {
// //           margin-bottom: 2rem;
// //         }

// //         .page-header h1 {
// //           font-size: 2rem;
// //           font-weight: 700;
// //           color: var(--dark);
// //           margin: 0 0 0.5rem 0;
// //         }

// //         .page-header p {
// //           color: var(--gray);
// //           margin: 0;
// //           font-size: 1.1rem;
// //         }

// //         .dashboard-card {
// //           background: var(--bg-white);
// //           border-radius: var(--radius-lg);
// //           box-shadow: var(--shadow-md);
// //           overflow: hidden;
// //         }

// //         .filters-bar {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           padding: 1.5rem;
// //           border-bottom: 1px solid var(--border);
// //           flex-wrap: wrap;
// //           gap: 1rem;
// //         }

// //         .search-container {
// //           position: relative;
// //           flex: 1;
// //           min-width: 300px;
// //         }

// //         .search-icon {
// //           position: absolute;
// //           left: 1rem;
// //           top: 50%;
// //           transform: translateY(-50%);
// //           color: var(--gray);
// //           height: 1.25rem;
// //           width: 1.25rem;
// //         }

// //         .search-input {
// //           width: 100%;
// //           padding: 0.75rem 1rem 0.75rem 3rem;
// //           border: 1px solid var(--border);
// //           border-radius: var(--radius-md);
// //           font-size: 1rem;
// //           transition: all 0.2s;
// //         }

// //         .search-input:focus {
// //           outline: none;
// //           border-color: var(--primary);
// //           box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
// //         }

// //         .filter-buttons {
// //           display: flex;
// //           gap: 0.75rem;
// //         }

// //         .filter-btn {
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //           padding: 0.75rem 1.25rem;
// //           border-radius: var(--radius-md);
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //           border: 1px solid transparent;
// //         }

// //         .filter-btn.outline {
// //           background: transparent;
// //           border-color: var(--border);
// //           color: var(--text);
// //         }

// //         .filter-btn.outline:hover {
// //           background: var(--bg-light);
// //         }

// //         .filter-btn.primary {
// //           background: var(--primary);
// //           color: white;
// //         }

// //         .filter-btn.primary:hover {
// //           background: var(--secondary);
// //         }

// //         .data-card {
// //           overflow: hidden;
// //         }

// //         .card-body {
// //           overflow-x: auto;
// //         }

// //         .data-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //         }

// //         .data-table th {
// //           text-align: left;
// //           padding: 1rem;
// //           font-weight: 600;
// //           color: var(--text-light);
// //           border-bottom: 1px solid var(--border);
// //           background: var(--bg-light);
// //         }

// //         .data-table td {
// //           padding: 1rem;
// //           border-bottom: 1px solid var(--border);
// //         }

// //         .data-table tr:last-child td {
// //           border-bottom: none;
// //         }

// //         .data-table tr:hover {
// //           background: #f8f9fa;
// //         }

// //         .sortable-header {
// //           cursor: pointer;
// //         }

// //         .sort-header {
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //         }

// //         .order-id {
// //           font-weight: 600;
// //           color: var(--primary);
// //         }

// //         .customer-cell, .date-cell, .amount-cell, .branch-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //         }

// //         .customer-icon, .date-icon, .dollar-icon, .branch-icon {
// //           color: var(--gray);
// //           height: 1rem;
// //           width: 1rem;
// //           flex-shrink: 0;
// //         }

// //         .secondary-text {
// //           font-size: 0.875rem;
// //           color: var(--text-light);
// //         }

// //         .amount {
// //           font-weight: 600;
// //         }

// //         .payment-method {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //           padding: 0.5rem 0.75rem;
// //           border-radius: var(--radius-md);
// //           font-size: 0.875rem;
// //           font-weight: 500;
// //         }

// //         .payment-method.card {
// //           background: #e6f7ff;
// //           color: #1890ff;
// //         }

// //         .payment-method.upi, .payment-method.qr {
// //           background: #f6ffed;
// //           color: #52c41a;
// //         }

// //         .payment-method.cash {
// //           background: #fff7e6;
// //           color: #fa8c16;
// //         }

// //         .payment-method.unknown {
// //           background: #f9f9f9;
// //           color: var(--text-light);
// //         }

// //         .action-buttons {
// //           display: flex;
// //           gap: 0.5rem;
// //         }

// //         .action-btn {
// //           padding: 0.5rem 1rem;
// //           border-radius: var(--radius-md);
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //           border: 1px solid transparent;
// //           font-size: 0.875rem;
// //         }

// //         .action-btn.view {
// //           background: var(--primary);
// //           color: white;
// //         }

// //         .action-btn.view:hover {
// //           background: var(--secondary);
// //         }

// //         .pagination {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           padding: 1.5rem;
// //           border-top: 1px solid var(--border);
// //           flex-wrap: wrap;
// //           gap: 1rem;
// //         }

// //         .pagination-btn {
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //           padding: 0.75rem 1.25rem;
// //           border-radius: var(--radius-md);
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //           border: 1px solid var(--border);
// //           background: var(--bg-white);
// //         }

// //         .pagination-btn:disabled {
// //           opacity: 0.5;
// //           cursor: not-allowed;
// //         }

// //         .pagination-btn:hover:not(:disabled) {
// //           background: var(--bg-light);
// //         }

// //         .pagination-pages {
// //           display: flex;
// //           gap: 0.5rem;
// //         }

// //         .pagination-page {
// //           padding: 0.75rem 1rem;
// //           border-radius: var(--radius-md);
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //           border: 1px solid var(--border);
// //           background: var(--bg-white);
// //           min-width: 2.75rem;
// //         }

// //         .pagination-page.active {
// //           background: var(--primary);
// //           color: white;
// //           border-color: var(--primary);
// //         }

// //         .pagination-page:hover:not(.active) {
// //           background: var(--bg-light);
// //         }

// //         .pagination-ellipsis {
// //           padding: 0.75rem 0.5rem;
// //           color: var(--text-light);
// //         }

// //         .loading-container {
// //           display: flex;
// //           flex-direction: column;
// //           align-items: center;
// //           justify-content: center;
// //           padding: 3rem;
// //         }

// //         .loading-spinner {
// //           border: 3px solid rgba(0, 0, 0, 0.1);
// //           border-left-color: var(--primary);
// //           border-radius: 50%;
// //           width: 2.5rem;
// //           height: 2.5rem;
// //           animation: spin 1s linear infinite;
// //           margin-bottom: 1rem;
// //         }

// //         @keyframes spin {
// //           0% { transform: rotate(0deg); }
// //           100% { transform: rotate(360deg); }
// //         }

// //         .empty-state {
// //           display: flex;
// //           flex-direction: column;
// //           align-items: center;
// //           justify-content: center;
// //           padding: 3rem;
// //           text-align: center;
// //           color: var(--text-light);
// //         }

// //         .empty-icon {
// //           height: 3rem;
// //           width: 3rem;
// //           margin-bottom: 1rem;
// //           color: var(--gray-light);
// //         }

// //         .error-container {
// //           margin: 1.5rem 0;
// //           padding: 1rem 1.5rem;
// //           background: #fee2e2;
// //           color: #dc2626;
// //           border-radius: var(--radius-md);
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //         }

// //         .modal-overlay {
// //           position: fixed;
// //           top: 0;
// //           left: 0;
// //           right: 0;
// //           bottom: 0;
// //           background: rgba(0, 0, 0, 0.5);
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           padding: 1rem;
// //           z-index: 1000;
// //         }

// //         .modal {
// //           background: white;
// //           border-radius: var(--radius-lg);
// //           box-shadow: var(--shadow-lg);
// //           width: 100%;
// //           max-width: 900px;
// //           max-height: 90vh;
// //           overflow-y: auto;
// //           display: flex;
// //           flex-direction: column;
// //         }

// //         .modal-header {
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //           padding: 1.5rem;
// //           border-bottom: 1px solid var(--border);
// //         }

// //         .modal-title {
// //           font-size: 1.5rem;
// //           font-weight: 600;
// //           margin: 0;
// //         }

// //         .modal-close {
// //           background: transparent;
// //           border: none;
// //           cursor: pointer;
// //           padding: 0.25rem;
// //           border-radius: var(--radius-sm);
// //           color: var(--text-light);
// //         }

// //         .modal-close:hover {
// //           background: var(--bg-light);
// //           color: var(--text);
// //         }

// //         .modal-body {
// //           padding: 1.5rem;
// //           flex: 1;
// //           overflow-y: auto;
// //         }

// //         .modal-footer {
// //           padding: 1.5rem;
// //           border-top: 1px solid var(--border);
// //           display: flex;
// //           justify-content: flex-end;
// //         }

// //         .btn {
// //           padding: 0.75rem 1.5rem;
// //           border-radius: var(--radius-md);
// //           font-weight: 500;
// //           cursor: pointer;
// //           transition: all 0.2s;
// //         }

// //         .btn-outline {
// //           background: transparent;
// //           border: 1px solid var(--border);
// //           color: var(--text);
// //         }

// //         .btn-outline:hover {
// //           background: var(--bg-light);
// //         }

// //         .payment-details {
// //           padding: 0.5rem 0;
// //         }

// //         .payment-info-grid {
// //           display: grid;
// //           grid-template-columns: 1fr 1fr;
// //           gap: 1.5rem;
// //           margin-bottom: 2rem;
// //         }

// //         @media (max-width: 768px) {
// //           .payment-info-grid {
// //             grid-template-columns: 1fr;
// //           }
// //         }

// //         .payment-info-section {
// //           background: var(--bg-light);
// //           border-radius: var(--radius-md);
// //           overflow: hidden;
// //         }

// //         .payment-info-title {
// //           font-size: 1.125rem;
// //           font-weight: 600;
// //           padding: 1rem 1.5rem;
// //           background: var(--bg-white);
// //           border-bottom: 1px solid var(--border);
// //           margin: 0;
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //         }

// //         .section-icon {
// //           height: 1.25rem;
// //           width: 1.25rem;
// //           color: var(--primary);
// //         }

// //         .payment-info-content {
// //           padding: 1.5rem;
// //         }

// //         .info-row {
// //           display: flex;
// //           margin-bottom: 1rem;
// //         }

// //         .info-row.total {
// //           margin-top: 1rem;
// //           padding-top: 1rem;
// //           border-top: 1px solid var(--border);
// //         }

// //         .info-label {
// //           width: 140px;
// //           font-weight: 500;
// //           color: var(--text-light);
// //           flex-shrink: 0;
// //         }

// //         .info-value {
// //           flex: 1;
// //           font-weight: 500;
// //         }

// //         .contact-cell {
// //           display: flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //         }

// //         .contact-icon {
// //           height: 1rem;
// //           width: 1rem;
// //           color: var(--text-light);
// //         }

// //         .order-items-section {
// //           margin-top: 2rem;
// //         }

// //         .order-items-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 1rem;
// //         }

// //         .order-items-table th {
// //           text-align: left;
// //           padding: 0.75rem 1rem;
// //           background: var(--bg-light);
// //           font-weight: 600;
// //           color: var(--text-light);
// //           border-bottom: 1px solid var(--border);
// //         }

// //         .order-items-table td {
// //           padding: 0.75rem 1rem;
// //           border-bottom: 1px solid var(--border);
// //         }

// //         .order-items-table tfoot td {
// //           padding: 0.75rem 1rem;
// //           font-weight: 600;
// //         }

// //         .total-label {
// //           text-align: right;
// //           font-weight: 600;
// //         }

// //         .total-value {
// //           font-weight: 700;
// //           color: var(--primary);
// //         }

// //         .order-items-table tfoot tr.grand-total {
// //           border-top: 2px solid var(--border);
// //         }

// //         .order-items-table tfoot tr.grand-total td {
// //           padding-top: 1rem;
// //         }

// //         @media (max-width: 1024px) {
// //           .data-table {
// //             min-width: 1000px;
// //           }
// //         }

// //         @media (max-width: 768px) {
// //           .payment-ui {
// //             padding: 1rem;
// //           }

// //           .filters-bar {
// //             flex-direction: column;
// //             align-items: stretch;
// //           }

// //           .search-container {
// //             min-width: auto;
// //           }

// //           .pagination {
// //             flex-direction: column;
// //           }

// //           .pagination-pages {
// //             order: 3;
// //             width: 100%;
// //             justify-content: center;
// //             flex-wrap: wrap;
// //           }

// //           .modal {
// //             margin: 0;
// //             max-height: 100vh;
// //             border-radius: 0;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   )
// // }

// // export default CounterPayment

// import { useState, useEffect } from "react";
// import {
//   Search,
//   Download,
//   CreditCard,
//   Wallet,
//   ChevronLeft,
//   ChevronRight,
//   ArrowDown,
//   ArrowUp,
//   X,
//   FileText,
//   User,
//   Calendar,
//   DollarSign,
//   Filter,
//   Building,
//   Phone,
// } from "lucide-react";
// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const CounterPayment = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("date");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [filterMethod, setFilterMethod] = useState("all");
//   const [showFilterOptions, setShowFilterOptions] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [showPaymentDetails, setShowPaymentDetails] = useState(false);
//   const paymentsPerPage = 7;

//   useEffect(() => {
//     const fetchCounterPayments = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const params = {
//           page: currentPage,
//           limit: paymentsPerPage,
//         };
//         if (searchQuery.trim()) {
//           params.search = searchQuery.trim();
//         }
//         if (filterMethod !== "all") {
//           params.paymentMethod = filterMethod;
//         }

//         const response = await api.get("/counter-order/orders", { params });
//         const formattedPayments = response.data.orders.map((order) => {
//           return {
//             id: order.id,
//             orderId: order.invoice?.invoiceNumber || order.id,
//             customer: order.customerName || "Unknown Customer",
//             customerMobile: order.phoneNumber || "N/A",
//             counterUser: order.userId?.name || "Unknown Counter User",
//             counterMobile: order.userId?.mobile || "N/A",
//             date: new Date(order.createdAt).toLocaleDateString("en-US", {
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             }),
//             subtotal: order.subtotal || 0,
//             tax: order.tax || 0,
//             serviceCharge: order.serviceCharge || 0,
//             amount: order.grandTotal || order.totalAmount || 0,
//             method: order.paymentMethod || "unknown",
//             items: order.items || [],
//             branchName: order.branch?.name || "Unknown Branch",
//             branchLocation: order.branch?.location || "Unknown Location",
//             invoiceNumber: order.invoice?.invoiceNumber || "N/A",
//             orderTime: order.createdAt,
//           };
//         });
//         setPayments(formattedPayments);
//         const totalOrders = response.data.count || formattedPayments.length;
//         setTotalPages(Math.ceil(totalOrders / paymentsPerPage));
//       } catch (error) {
//         console.error("Error fetching counter payments:", error);
//         setError("Failed to load counter payments. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCounterPayments();
//   }, [currentPage, searchQuery, filterMethod]);

//   const filteredPayments = payments.filter((payment) => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       (payment.orderId || "").toLowerCase().includes(searchLower) ||
//       (payment.customer || "").toLowerCase().includes(searchLower) ||
//       (payment.counterUser || "").toLowerCase().includes(searchLower) ||
//       (payment.branchName || "").toLowerCase().includes(searchLower) ||
//       (payment.customerMobile || "").toLowerCase().includes(searchLower) ||
//       filterMethod === "all" ||
//       payment.method === filterMethod
//     );
//   });

//   const sortedPayments = [...filteredPayments].sort((a, b) => {
//     if (sortBy === "date") {
//       return sortOrder === "asc"
//         ? new Date(a.date) - new Date(b.date)
//         : new Date(b.date) - new Date(a.date);
//     } else if (sortBy === "amount") {
//       return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
//     }
//     return 0;
//   });

//   const paginatedPayments = sortedPayments.slice(0, paymentsPerPage);

//   const getPaymentMethodIcon = (method) => {
//     switch (method) {
//       case "card":
//         return <CreditCard className="h-5 w-5" />;
//       case "upi":
//         return <Wallet className="h-5 w-5" />;
//       case "cash":
//         return <span className="rupees-icon">₹</span>;
//       case "qr":
//         return <Wallet className="h-5 w-5" />;
//       default:
//         return <CreditCard className="h-5 w-5" />;
//     }
//   };

//   const handleViewPayment = (payment) => {
//     setSelectedPayment(payment);
//     setShowPaymentDetails(true);
//   };

//   const handleClosePaymentDetails = () => {
//     setShowPaymentDetails(false);
//     setSelectedPayment(null);
//   };

//   const handleSortChange = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(field);
//       setSortOrder("desc");
//     }
//   };

//   const escapeCsvField = (field) => {
//     if (field === null || field === undefined) return "";
//     const str = field.toString();
//     if (str.includes(",") || str.includes('"') || str.includes("\n")) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   };

//   const exportPayments = async () => {
//     try {
//       const params = {
//         page: 1,
//         limit: 999,
//       };
//       if (searchQuery.trim()) {
//         params.search = searchQuery.trim();
//       }
//       if (filterMethod !== "all") {
//         params.paymentMethod = filterMethod;
//       }

//       const response = await api.get("/counter-order/orders", { params });
//       const allFormattedPayments = response.data.orders.map((order) => ({
//         id: order.id,
//         orderId: order.invoice?.invoiceNumber || order.id,
//         customer: order.customerName || "Unknown Customer",
//         customerMobile: order.phoneNumber || "N/A",
//         counterUser: order.userId?.name || "Unknown Counter User",
//         counterMobile: order.userId?.mobile || "N/A",
//         date: new Date(order.createdAt).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         subtotal: order.subtotal || 0,
//         tax: order.tax || 0,
//         serviceCharge: order.serviceCharge || 0,
//         amount: order.grandTotal || order.totalAmount || 0,
//         method: order.paymentMethod || "unknown",
//         items: order.items || [],
//         branchName: order.branch?.name || "Unknown Branch",
//         branchLocation: order.branch?.location || "Unknown Location",
//         invoiceNumber: order.invoice?.invoiceNumber || "N/A",
//         orderTime: order.createdAt,
//       }));

//       const headers = [
//         "Order ID",
//         "Customer Name",
//         "Customer Mobile",
//         "Counter User",
//         "Branch",
//         "Date",
//         "Subtotal",
//         "Tax",
//         "Service Charge",
//         "Total Amount",
//         "Payment Method",
//       ];
//       let csv = headers.map(escapeCsvField).join(",") + "\n";

//       allFormattedPayments.forEach((payment) => {
//         const row = [
//           payment.orderId,
//           payment.customer,
//           payment.customerMobile,
//           payment.counterUser,
//           payment.branchName,
//           payment.date,
//           `₹${payment.subtotal.toFixed(2)}`,
//           `₹${payment.tax.toFixed(2)}`,
//           `₹${payment.serviceCharge.toFixed(2)}`,
//           `₹${payment.amount.toFixed(2)}`,
//           payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
//         ];
//         csv += row.map(escapeCsvField).join(",") + "\n";
//       });

//       const bom = "\uFEFF";
//       const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.setAttribute("hidden", "");
//       a.setAttribute("href", url);
//       a.setAttribute(
//         "download",
//         `counter-payments-export-${new Date().toISOString().slice(0, 10)}.csv`
//       );
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error exporting payments:", error);
//       setError("Failed to export payments. Please try again.");
//     }
//   };

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
//     <div className="payment-ui">
//       <div className="page-header">
//         <h1>Counter Payments</h1>
//         <p>Manage and review all counter payment transactions</p>
//       </div>

//       {error && (
//         <div className="error-container">
//           <span>{error}</span>
//         </div>
//       )}

//       <div className="dashboard-card">
//         <div className="filters-bar">
//           <div className="search-container">
//             <Search className="search-icon" />
//             <input
//               type="text"
//               className="search-input"
//               placeholder="Search by order ID, customer name, counter user, or branch"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <div className="filter-buttons">
//             <div className="filter-wrapper">
//               <button
//                 className="filter-btn outline"
//                 onClick={() => setShowFilterOptions(!showFilterOptions)}>
//                 <Filter className="h-4 w-4" />
//                 <span>
//                   {filterMethod === "all"
//                     ? "Filter"
//                     : filterMethod.charAt(0).toUpperCase() +
//                       filterMethod.slice(1)}
//                 </span>
//                 <ArrowDown
//                   className="h-4 w-4 transition-transform duration-200"
//                   style={{
//                     transform: showFilterOptions
//                       ? "rotate(180deg)"
//                       : "rotate(0deg)",
//                   }}
//                 />
//               </button>
//               {showFilterOptions && (
//                 <div className="filter-dropdown">
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("all");
//                       setShowFilterOptions(false);
//                     }}>
//                     All Methods
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("card");
//                       setShowFilterOptions(false);
//                     }}>
//                     Card
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("upi");
//                       setShowFilterOptions(false);
//                     }}>
//                     UPI
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("cash");
//                       setShowFilterOptions(false);
//                     }}>
//                     Cash
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("qr");
//                       setShowFilterOptions(false);
//                     }}>
//                     QR
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button className="filter-btn primary" onClick={exportPayments}>
//               <Download className="h-4 w-4" />
//               <span>Export</span>
//             </button>
//           </div>
//         </div>

//         <div className="data-card">
//           <div className="card-body">
//             {loading ? (
//               <div className="loading-container">
//                 <div className="loading-spinner"></div>
//                 <p>Loading counter payments...</p>
//               </div>
//             ) : paginatedPayments.length === 0 ? (
//               <div className="empty-state">
//                 <FileText className="empty-icon" />
//                 <p>No counter payments found matching your search.</p>
//               </div>
//             ) : (
//               <table className="data-table">
//                 <thead>
//                   <tr>
//                     <th>Order ID</th>
//                     <th>Customer</th>
//                     <th>Counter User</th>
//                     <th>Branch</th>
//                     <th
//                       className="sortable-header"
//                       onClick={() => handleSortChange("date")}>
//                       <div className="sort-header">
//                         <span>Date</span>
//                         {sortBy === "date" &&
//                           (sortOrder === "asc" ? (
//                             <ArrowUp className="h-4 w-4" />
//                           ) : (
//                             <ArrowDown className="h-4 w-4" />
//                           ))}
//                       </div>
//                     </th>
//                     <th
//                       className="sortable-header"
//                       onClick={() => handleSortChange("amount")}>
//                       <div className="sort-header">
//                         <span>Amount</span>
//                         {sortBy === "amount" &&
//                           (sortOrder === "asc" ? (
//                             <ArrowUp className="h-4 w-4" />
//                           ) : (
//                             <ArrowDown className="h-4 w-4" />
//                           ))}
//                       </div>
//                     </th>
//                     <th>Payment Method</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedPayments.map((payment) => (
//                     <tr key={payment.id}>
//                       <td className="order-id">{payment.orderId}</td>
//                       <td>
//                         <div className="customer-cell">
//                           <User className="customer-icon" />
//                           <div>
//                             <div>{payment.customer}</div>
//                             <div className="secondary-text">
//                               {payment.customerMobile}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="customer-cell">
//                           <User className="customer-icon" />
//                           <div>
//                             <div>{payment.counterUser}</div>
//                             <div className="secondary-text">
//                               {payment.counterMobile}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="branch-cell">
//                           <Building className="branch-icon" />
//                           <span>{payment.branchName}</span>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="date-cell">
//                           <Calendar className="date-icon" />
//                           <span>{payment.date}</span>
//                         </div>
//                       </td>
//                       <td className="amount">
//                         <div className="amount-cell">
//                           <span>₹{payment.amount.toFixed(2)}</span>
//                         </div>
//                       </td>
//                       <td>
//                         <div className={`payment-method ${payment.method}`}>
//                           {getPaymentMethodIcon(payment.method)}
//                           <span className="payment-method-text">
//                             {payment.method.charAt(0).toUpperCase() +
//                               payment.method.slice(1)}
//                           </span>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="action-buttons">
//                           <button
//                             className="action-btn view"
//                             onClick={() => handleViewPayment(payment)}>
//                             View Details
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         <div className="pagination">
//           <button
//             className="pagination-btn"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
//             <ChevronLeft className="h-4 w-4" />
//             <span>Previous</span>
//           </button>
//           <div className="pagination-pages">
//             {getPaginationRange().map((page, index) =>
//               page === "..." ? (
//                 <span key={index} className="pagination-ellipsis">
//                   ...
//                 </span>
//               ) : (
//                 <button
//                   key={index}
//                   className={`pagination-page ${
//                     currentPage === page ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(page)}>
//                   {page}
//                 </button>
//               )
//             )}
//           </div>
//           <button
//             className="pagination-btn"
//             disabled={currentPage === totalPages}
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }>
//             <span>Next</span>
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       {showPaymentDetails && selectedPayment && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h2 className="modal-title">Counter Payment Details</h2>
//               <button
//                 className="modal-close"
//                 onClick={handleClosePaymentDetails}>
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="payment-details">
//                 <div className="payment-info-grid">
//                   <div className="payment-info-section">
//                     <h3 className="payment-info-title">
//                       <FileText className="section-icon" />
//                       Payment Information
//                     </h3>
//                     <div className="payment-info-content">
//                       <div className="info-row">
//                         <span className="info-label">Order ID:</span>
//                         <span className="info-value">
//                           {selectedPayment.orderId}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Invoice Number:</span>
//                         <span className="info-value">
//                           {selectedPayment.invoiceNumber}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Date:</span>
//                         <span className="info-value">
//                           {selectedPayment.date}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Branch:</span>
//                         <span className="info-value">
//                           {selectedPayment.branchName}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Subtotal:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.subtotal.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Tax:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.tax.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Service Charge:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.serviceCharge.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row total">
//                         <span className="info-label">Total Amount:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.amount.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Payment Method:</span>
//                         <span className="info-value">
//                           <div
//                             className={`payment-method ${selectedPayment.method}`}>
//                             {getPaymentMethodIcon(selectedPayment.method)}
//                             <span className="payment-method-text">
//                               {selectedPayment.method.charAt(0).toUpperCase() +
//                                 selectedPayment.method.slice(1)}
//                             </span>
//                           </div>
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="payment-info-section">
//                     <h3 className="payment-info-title">
//                       <User className="section-icon" />
//                       Customer & Counter Information
//                     </h3>
//                     <div className="payment-info-content">
//                       <div className="info-row">
//                         <span className="info-label">Customer Name:</span>
//                         <span className="info-value">
//                           {selectedPayment.customer}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Customer Mobile:</span>
//                         <span className="info-value">
//                           <div className="contact-cell">
//                             <Phone className="contact-icon" />
//                             {selectedPayment.customerMobile}
//                           </div>
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Counter User:</span>
//                         <span className="info-value">
//                           {selectedPayment.counterUser}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Counter Mobile:</span>
//                         <span className="info-value">
//                           <div className="contact-cell">
//                             <Phone className="contact-icon" />
//                             {selectedPayment.counterMobile}
//                           </div>
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Branch Location:</span>
//                         <span className="info-value">
//                           {selectedPayment.branchLocation}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="order-items-section">
//                   <h3 className="payment-info-title">
//                     <FileText className="section-icon" />
//                     Order Items
//                   </h3>
//                   <table className="order-items-table">
//                     <thead>
//                       <tr>
//                         <th>Item</th>
//                         <th>Quantity</th>
//                         <th>Price</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedPayment.items.map((item, index) => (
//                         <tr key={index}>
//                           <td>{item.name}</td>
//                           <td>{item.quantity}</td>
//                           <td>₹{item.price.toFixed(2)}</td>
//                           <td>₹{(item.quantity * item.price).toFixed(2)}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr>
//                         <td colSpan="3" className="total-label">
//                           Subtotal
//                         </td>
//                         <td className="total-value">
//                           ₹{selectedPayment.subtotal.toFixed(2)}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td colSpan="3" className="total-label">
//                           Tax
//                         </td>
//                         <td className="total-value">
//                           ₹{selectedPayment.tax.toFixed(2)}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td colSpan="3" className="total-label">
//                           Service Charge
//                         </td>
//                         <td className="total-value">
//                           ₹{selectedPayment.serviceCharge.toFixed(2)}
//                         </td>
//                       </tr>
//                       <tr className="grand-total">
//                         <td colSpan="3" className="total-label">
//                           Total
//                         </td>
//                         <td className="total-value">
//                           ₹{selectedPayment.amount.toFixed(2)}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="btn btn-outline"
//                 onClick={handleClosePaymentDetails}>
//                 Close
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

//         .payment-ui {
//           padding: 2rem;
//           background-color: #f5f7fb;
//           min-height: 100vh;
//           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
//             Oxygen, Ubuntu, sans-serif;
//         }

//         .page-header {
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

//         .dashboard-card {
//           background: var(--bg-white);
//           border-radius: var(--radius-lg);
//           box-shadow: var(--shadow-md);
//           overflow: hidden;
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
//         }

//         .filter-wrapper {
//           position: relative;
//           display: inline-block;
//         }

//         .filter-btn {
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

//         .filter-btn.outline {
//           background: transparent;
//           border-color: var(--border);
//           color: var(--text);
//         }

//         .filter-btn.outline:hover {
//           background: var(--bg-light);
//         }

//         .filter-btn.primary {
//           background: var(--primary);
//           color: white;
//         }

//         .filter-btn.primary:hover {
//           background: var(--secondary);
//         }

//         .filter-dropdown {
//           position: absolute;
//           top: 100%;
//           right: 0;
//           background: var(--bg-white);
//           border: 1px solid var(--border);
//           border-radius: var(--radius-md);
//           box-shadow: var(--shadow-md);
//           min-width: 120px;
//           z-index: 10;
//           margin-top: 0.25rem;
//         }

//         .dropdown-item {
//           display: block;
//           width: 100%;
//           text-align: left;
//           background: none;
//           border: none;
//           padding: 0.75rem 1rem;
//           cursor: pointer;
//           font-size: 0.875rem;
//           color: var(--text);
//           border-bottom: 1px solid var(--border);
//           white-space: nowrap;
//         }

//         .dropdown-item:hover {
//           background: var(--bg-light);
//         }

//         .dropdown-item:last-of-type {
//           border-bottom: none;
//         }

//         .data-card {
//           overflow: hidden;
//         }

//         .card-body {
//           overflow-x: auto;
//         }

//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .data-table th {
//           text-align: left;
//           padding: 1rem;
//           font-weight: 600;
//           color: var(--text-light);
//           border-bottom: 1px solid var(--border);
//           background: var(--bg-light);
//         }

//         .data-table td {
//           padding: 1rem;
//           border-bottom: 1px solid var(--border);
//         }

//         .data-table tr:last-child td {
//           border-bottom: none;
//         }

//         .data-table tr:hover {
//           background: #f8f9fa;
//         }

//         .sortable-header {
//           cursor: pointer;
//         }

//         .sort-header {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .order-id {
//           font-weight: 600;
//           color: var(--primary);
//         }

//         .customer-cell,
//         .date-cell,
//         .amount-cell,
//         .branch-cell {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .customer-icon,
//         .date-icon,
//         .dollar-icon,
//         .branch-icon {
//           color: var(--gray);
//           height: 1rem;
//           width: 1rem;
//           flex-shrink: 0;
//         }

//         .secondary-text {
//           font-size: 0.875rem;
//           color: var(--text-light);
//         }

//         .amount {
//           font-weight: 600;
//         }

//         .payment-method {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 0.75rem;
//           border-radius: var(--radius-md);
//           font-size: 0.875rem;
//           font-weight: 500;
//         }

//         .payment-method.card {
//           background: #e6f7ff;
//           color: #1890ff;
//         }

//         .payment-method.upi,
//         .payment-method.qr {
//           background: #f6ffed;
//           color: #52c41a;
//         }

//         .payment-method.cash {
//           background: #fff7e6;
//           color: #fa8c16;
//         }

//         .payment-method.unknown {
//           background: #f9f9f9;
//           color: var(--text-light);
//         }

//         .action-buttons {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .action-btn {
//           padding: 0.5rem 1rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid transparent;
//           font-size: 0.875rem;
//         }

//         .action-btn.view {
//           background: var(--primary);
//           color: white;
//         }

//         .action-btn.view:hover {
//           background: var(--secondary);
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

//         .loading-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//         }

//         .loading-spinner {
//           border: 3px solid rgba(0, 0, 0, 0.1);
//           border-left-color: var(--primary);
//           border-radius: 50%;
//           width: 2.5rem;
//           height: 2.5rem;
//           animation: spin 1s linear infinite;
//           margin-bottom: 1rem;
//         }

//         @keyframes spin {
//           0% {
//             transform: rotate(0deg);
//           }
//           100% {
//             transform: rotate(360deg);
//           }
//         }

//         .empty-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//           text-align: center;
//           color: var(--text-light);
//         }

//         .empty-icon {
//           height: 3rem;
//           width: 3rem;
//           margin-bottom: 1rem;
//           color: var(--gray-light);
//         }

//         .error-container {
//           margin: 1.5rem 0;
//           padding: 1rem 1.5rem;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: var(--radius-md);
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
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
//         }

//         .btn {
//           padding: 0.75rem 1.5rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .btn-outline {
//           background: transparent;
//           border: 1px solid var(--border);
//           color: var(--text);
//         }

//         .btn-outline:hover {
//           background: var(--bg-light);
//         }

//         .payment-details {
//           padding: 0.5rem 0;
//         }

//         .payment-info-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1.5rem;
//           margin-bottom: 2rem;
//         }

//         @media (max-width: 768px) {
//           .payment-info-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .payment-info-section {
//           background: var(--bg-light);
//           border-radius: var(--radius-md);
//           overflow: hidden;
//         }

//         .payment-info-title {
//           font-size: 1.125rem;
//           font-weight: 600;
//           padding: 1rem 1.5rem;
//           background: var(--bg-white);
//           border-bottom: 1px solid var(--border);
//           margin: 0;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .section-icon {
//           height: 1.25rem;
//           width: 1.25rem;
//           color: var(--primary);
//         }

//         .payment-info-content {
//           padding: 1.5rem;
//         }

//         .info-row {
//           display: flex;
//           margin-bottom: 1rem;
//         }

//         .info-row.total {
//           margin-top: 1rem;
//           padding-top: 1rem;
//           border-top: 1px solid var(--border);
//         }

//         .info-label {
//           width: 140px;
//           font-weight: 500;
//           color: var(--text-light);
//           flex-shrink: 0;
//         }

//         .info-value {
//           flex: 1;
//           font-weight: 500;
//         }

//         .contact-cell {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .contact-icon {
//           height: 1rem;
//           width: 1rem;
//           color: var(--text-light);
//         }

//         .order-items-section {
//           margin-top: 2rem;
//         }

//         .order-items-table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-top: 1rem;
//         }

//         .order-items-table th {
//           text-align: left;
//           padding: 0.75rem 1rem;
//           background: var(--bg-light);
//           font-weight: 600;
//           color: var(--text-light);
//           border-bottom: 1px solid var(--border);
//         }

//         .order-items-table td {
//           padding: 0.75rem 1rem;
//           border-bottom: 1px solid var(--border);
//         }

//         .order-items-table tfoot td {
//           padding: 0.75rem 1rem;
//           font-weight: 600;
//         }

//         .total-label {
//           text-align: right;
//           font-weight: 600;
//         }

//         .total-value {
//           font-weight: 700;
//           color: var(--primary);
//         }

//         .order-items-table tfoot tr.grand-total {
//           border-top: 2px solid var(--border);
//         }

//         .order-items-table tfoot tr.grand-total td {
//           padding-top: 1rem;
//         }

//         @media (max-width: 1024px) {
//           .data-table {
//             min-width: 1000px;
//           }
//         }

//         @media (max-width: 768px) {
//           .payment-ui {
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

//           .filter-dropdown {
//             right: auto;
//             left: 0;
//             min-width: 100%;
//           }

//           .modal {
//             margin: 0;
//             max-height: 100vh;
//             border-radius: 0;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CounterPayment;

// import { useState, useEffect } from "react";
// import {
//   Search,
//   Download,
//   CreditCard,
//   Wallet,
//   ChevronLeft,
//   ChevronRight,
//   ArrowDown,
//   ArrowUp,
//   X,
//   FileText,
//   User,
//   Calendar,
//   DollarSign,
//   Filter,
//   Building,
//   Phone,
// } from "lucide-react";
// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const CounterPayment = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState("date");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [filterMethod, setFilterMethod] = useState("all");
//   const [showFilterOptions, setShowFilterOptions] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [showPaymentDetails, setShowPaymentDetails] = useState(false);
//   const paymentsPerPage = 7;

//   useEffect(() => {
//     const fetchCounterPayments = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const params = {
//           page: currentPage,
//           limit: paymentsPerPage,
//         };
//         if (searchQuery.trim()) {
//           params.search = searchQuery.trim();
//         }
//         if (filterMethod !== "all") {
//           params.paymentMethod = filterMethod;
//         }

//         const response = await api.get("/counter-order/orders", { params });
//         const formattedPayments = response.data.orders.map((order) => {
//           return {
//             id: order.id,
//             orderId: order.invoice?.invoiceNumber || order.id,
//             customer: order.customerName || "Unknown Customer",
//             customerMobile: order.phoneNumber || "N/A",
//             counterUser: order.userId?.name || "Unknown Counter User",
//             counterMobile: order.userId?.mobile || "N/A",
//             date: new Date(order.createdAt).toLocaleDateString("en-US", {
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             }),
//             subtotal: order.subtotal || 0,
//             tax: order.tax || 0,
//             serviceCharge: order.serviceCharge || 0,
//             amount: order.grandTotal || order.totalAmount || 0,
//             method: order.paymentMethod || "unknown",
//             items: order.items || [],
//             branchName: order.branch?.name || "Unknown Branch",
//             branchLocation: order.branch?.location || "Unknown Location",
//             invoiceNumber: order.invoice?.invoiceNumber || "N/A",
//             orderTime: order.createdAt,
//           };
//         });
//         setPayments(formattedPayments);
//         const totalOrders = response.data.count || formattedPayments.length;
//         setTotalPages(Math.ceil(totalOrders / paymentsPerPage));
//       } catch (error) {
//         console.error("Error fetching counter payments:", error);
//         setError("Failed to load counter payments. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCounterPayments();
//   }, [currentPage, searchQuery, filterMethod]);

//   const filteredPayments = payments.filter((payment) => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       (payment.orderId || "").toLowerCase().includes(searchLower) ||
//       (payment.customer || "").toLowerCase().includes(searchLower) ||
//       (payment.counterUser || "").toLowerCase().includes(searchLower) ||
//       (payment.branchName || "").toLowerCase().includes(searchLower) ||
//       (payment.customerMobile || "").toLowerCase().includes(searchLower) ||
//       filterMethod === "all" ||
//       payment.method === filterMethod
//     );
//   });

//   const sortedPayments = [...filteredPayments].sort((a, b) => {
//     if (sortBy === "date") {
//       return sortOrder === "asc"
//         ? new Date(a.date) - new Date(b.date)
//         : new Date(b.date) - new Date(a.date);
//     } else if (sortBy === "amount") {
//       return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
//     }
//     return 0;
//   });

//   const paginatedPayments = sortedPayments.slice(0, paymentsPerPage);

//   const getPaymentMethodIcon = (method) => {
//     switch (method) {
//       case "card":
//         return <CreditCard className="h-5 w-5" />;
//       case "upi":
//         return <Wallet className="h-5 w-5" />;
//       case "cash":
//         return <span className="rupees-icon">₹</span>;
//       case "qr":
//         return <Wallet className="h-5 w-5" />;
//       default:
//         return <CreditCard className="h-5 w-5" />;
//     }
//   };

//   const handleViewPayment = (payment) => {
//     setSelectedPayment(payment);
//     setShowPaymentDetails(true);
//   };

//   const handleClosePaymentDetails = () => {
//     setShowPaymentDetails(false);
//     setSelectedPayment(null);
//   };

//   const handleSortChange = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(field);
//       setSortOrder("desc");
//     }
//   };

//   const escapeCsvField = (field) => {
//     if (field === null || field === undefined) return "";
//     const str = field.toString();
//     if (str.includes(",") || str.includes('"') || str.includes("\n")) {
//       return `"${str.replace(/"/g, '""')}"`;
//     }
//     return str;
//   };

//   const exportPayments = async () => {
//     try {
//       const params = {
//         page: 1,
//         limit: 999,
//       };
//       if (searchQuery.trim()) {
//         params.search = searchQuery.trim();
//       }
//       if (filterMethod !== "all") {
//         params.paymentMethod = filterMethod;
//       }

//       const response = await api.get("/counter-order/orders", { params });
//       const allFormattedPayments = response.data.orders.map((order) => ({
//         id: order.id,
//         orderId: order.invoice?.invoiceNumber || order.id,
//         customer: order.customerName || "Unknown Customer",
//         customerMobile: order.phoneNumber || "N/A",
//         counterUser: order.userId?.name || "Unknown Counter User",
//         counterMobile: order.userId?.mobile || "N/A",
//         date: new Date(order.createdAt).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         subtotal: order.subtotal || 0,
//         tax: order.tax || 0,
//         serviceCharge: order.serviceCharge || 0,
//         amount: order.grandTotal || order.totalAmount || 0,
//         method: order.paymentMethod || "unknown",
//         items: order.items || [],
//         branchName: order.branch?.name || "Unknown Branch",
//         branchLocation: order.branch?.location || "Unknown Location",
//         invoiceNumber: order.invoice?.invoiceNumber || "N/A",
//         orderTime: order.createdAt,
//       }));

//       const headers = [
//         "Order ID",
//         "Customer Name",
//         "Customer Mobile",
//         "Counter User",
//         "Branch",
//         "Date",
//         "Subtotal",
//         "Tax",
//         "Service Charge",
//         "Total Amount",
//         "Payment Method",
//       ];
//       let csv = headers.map(escapeCsvField).join(",") + "\n";

//       allFormattedPayments.forEach((payment) => {
//         const row = [
//           payment.orderId,
//           payment.customer,
//           payment.customerMobile,
//           payment.counterUser,
//           payment.branchName,
//           payment.date,
//           `₹${payment.subtotal.toFixed(2)}`,
//           `₹${payment.tax.toFixed(2)}`,
//           `₹${payment.serviceCharge.toFixed(2)}`,
//           `₹${payment.amount.toFixed(2)}`,
//           payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
//         ];
//         csv += row.map(escapeCsvField).join(",") + "\n";
//       });

//       const bom = "\uFEFF";
//       const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.setAttribute("hidden", "");
//       a.setAttribute("href", url);
//       a.setAttribute(
//         "download",
//         `counter-payments-export-${new Date().toISOString().slice(0, 10)}.csv`
//       );
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error exporting payments:", error);
//       setError("Failed to export payments. Please try again.");
//     }
//   };

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
//     <div className="payment-ui">
//       <div className="page-header">
//         <h1>Counter Payments</h1>
//         <p>Manage and review all counter payment transactions</p>
//       </div>

//       {error && (
//         <div className="error-container">
//           <span>{error}</span>
//         </div>
//       )}

//       <div className="dashboard-card">
//         <div className="filters-bar">
//           <div className="search-container">
//             <Search className="search-icon" />
//             <input
//               type="text"
//               className="search-input"
//               placeholder="Search by order ID, customer name, counter user, or branch"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <div className="filter-buttons">
//             <div className="filter-wrapper">
//               <button
//                 className="filter-btn outline"
//                 onClick={() => setShowFilterOptions(!showFilterOptions)}>
//                 <Filter className="h-4 w-4" />
//                 <span>
//                   {filterMethod === "all"
//                     ? "Filter"
//                     : filterMethod.charAt(0).toUpperCase() +
//                       filterMethod.slice(1)}
//                 </span>
//                 <ArrowDown
//                   className="h-4 w-4 transition-transform duration-200"
//                   style={{
//                     transform: showFilterOptions
//                       ? "rotate(180deg)"
//                       : "rotate(0deg)",
//                   }}
//                 />
//               </button>
//               {showFilterOptions && (
//                 <div className="filter-dropdown">
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("all");
//                       setShowFilterOptions(false);
//                     }}>
//                     All Methods
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("card");
//                       setShowFilterOptions(false);
//                     }}>
//                     Card
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("upi");
//                       setShowFilterOptions(false);
//                     }}>
//                     UPI
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("cash");
//                       setShowFilterOptions(false);
//                     }}>
//                     Cash
//                   </button>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       setFilterMethod("qr");
//                       setShowFilterOptions(false);
//                     }}>
//                     QR
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button className="filter-btn primary" onClick={exportPayments}>
//               <Download className="h-4 w-4" />
//               <span>Export</span>
//             </button>
//           </div>
//         </div>

//         <div className="data-card">
//           <div className="card-body">
//             {loading ? (
//               <div className="loading-container">
//                 <div className="loading-spinner"></div>
//                 <p>Loading counter payments...</p>
//               </div>
//             ) : paginatedPayments.length === 0 ? (
//               <div className="empty-state">
//                 <FileText className="empty-icon" />
//                 <p>No counter payments found matching your search.</p>
//               </div>
//             ) : (
//               <div className="table-container">
//                 <table className="data-table">
//                   <thead>
//                     <tr>
//                       <th className="order-id-col">Order ID</th>
//                       <th className="customer-col">Customer</th>
//                       <th className="counter-user-col">Counter User</th>
//                       <th className="branch-col">Branch</th>
//                       <th
//                         className="date-col sortable-header"
//                         onClick={() => handleSortChange("date")}>
//                         <div className="sort-header">
//                           <span>Date</span>
//                           {sortBy === "date" &&
//                             (sortOrder === "asc" ? (
//                               <ArrowUp className="h-4 w-4" />
//                             ) : (
//                               <ArrowDown className="h-4 w-4" />
//                             ))}
//                         </div>
//                       </th>
//                       <th
//                         className="amount-col sortable-header"
//                         onClick={() => handleSortChange("amount")}>
//                         <div className="sort-header">
//                           <span>Amount</span>
//                           {sortBy === "amount" &&
//                             (sortOrder === "asc" ? (
//                               <ArrowUp className="h-4 w-4" />
//                             ) : (
//                               <ArrowDown className="h-4 w-4" />
//                             ))}
//                         </div>
//                       </th>
//                       <th className="method-col">Payment Method</th>
//                       <th className="actions-col">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paginatedPayments.map((payment) => (
//                       <tr key={payment.id}>
//                         <td className="order-id-col">
//                           <div className="order-id">{payment.orderId}</div>
//                         </td>
//                         <td className="customer-col">
//                           <div className="customer-cell">
//                             <User className="customer-icon" />
//                             <div className="customer-info">
//                               <div className="customer-name">
//                                 {payment.customer}
//                               </div>
//                               <div className="secondary-text">
//                                 {payment.customerMobile}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="counter-user-col">
//                           <div className="customer-cell">
//                             <User className="customer-icon" />
//                             <div className="customer-info">
//                               <div className="customer-name">
//                                 {payment.counterUser}
//                               </div>
//                               <div className="secondary-text">
//                                 {payment.counterMobile}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="branch-col">
//                           <div className="branch-cell">
//                             <Building className="branch-icon" />
//                             <span className="branch-name">
//                               {payment.branchName}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="date-col">
//                           <div className="date-cell">
//                             <Calendar className="date-icon" />
//                             <span>{payment.date}</span>
//                           </div>
//                         </td>
//                         <td className="amount-col">
//                           <div className="amount-cell">
//                             <span className="amount-value">
//                               ₹{payment.amount.toFixed(2)}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="method-col">
//                           <div className={`payment-method ${payment.method}`}>
//                             {getPaymentMethodIcon(payment.method)}
//                             <span className="payment-method-text">
//                               {payment.method.charAt(0).toUpperCase() +
//                                 payment.method.slice(1)}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="actions-col">
//                           <div className="action-buttons">
//                             <button
//                               className="action-btn view"
//                               onClick={() => handleViewPayment(payment)}>
//                               View Details
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="pagination">
//           <button
//             className="pagination-btn"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
//             <ChevronLeft className="h-4 w-4" />
//             <span>Previous</span>
//           </button>
//           <div className="pagination-pages">
//             {getPaginationRange().map((page, index) =>
//               page === "..." ? (
//                 <span key={index} className="pagination-ellipsis">
//                   ...
//                 </span>
//               ) : (
//                 <button
//                   key={index}
//                   className={`pagination-page ${
//                     currentPage === page ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(page)}>
//                   {page}
//                 </button>
//               )
//             )}
//           </div>
//           <button
//             className="pagination-btn"
//             disabled={currentPage === totalPages}
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }>
//             <span>Next</span>
//             <ChevronRight className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       {showPaymentDetails && selectedPayment && (
//         <div className="modal-overlay">
//           <div className="modal">
//             <div className="modal-header">
//               <h2 className="modal-title">Counter Payment Details</h2>
//               <button
//                 className="modal-close"
//                 onClick={handleClosePaymentDetails}>
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="payment-details">
//                 <div className="payment-info-grid">
//                   <div className="payment-info-section">
//                     <h3 className="payment-info-title">
//                       <FileText className="section-icon" />
//                       Payment Information
//                     </h3>
//                     <div className="payment-info-content">
//                       <div className="info-row">
//                         <span className="info-label">Order ID:</span>
//                         <span className="info-value">
//                           {selectedPayment.orderId}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Invoice Number:</span>
//                         <span className="info-value">
//                           {selectedPayment.invoiceNumber}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Date:</span>
//                         <span className="info-value">
//                           {selectedPayment.date}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Branch:</span>
//                         <span className="info-value">
//                           {selectedPayment.branchName}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Subtotal:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.subtotal.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Tax:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.tax.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Service Charge:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.serviceCharge.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row total">
//                         <span className="info-label">Total Amount:</span>
//                         <span className="info-value">
//                           ₹{selectedPayment.amount.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Payment Method:</span>
//                         <span className="info-value">
//                           <div
//                             className={`payment-method ${selectedPayment.method}`}>
//                             {getPaymentMethodIcon(selectedPayment.method)}
//                             <span className="payment-method-text">
//                               {selectedPayment.method.charAt(0).toUpperCase() +
//                                 selectedPayment.method.slice(1)}
//                             </span>
//                           </div>
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="payment-info-section">
//                     <h3 className="payment-info-title">
//                       <User className="section-icon" />
//                       Customer & Counter Information
//                     </h3>
//                     <div className="payment-info-content">
//                       <div className="info-row">
//                         <span className="info-label">Customer Name:</span>
//                         <span className="info-value">
//                           {selectedPayment.customer}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Customer Mobile:</span>
//                         <span className="info-value">
//                           <div className="contact-cell">
//                             <Phone className="contact-icon" />
//                             {selectedPayment.customerMobile}
//                           </div>
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Counter User:</span>
//                         <span className="info-value">
//                           {selectedPayment.counterUser}
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Counter Mobile:</span>
//                         <span className="info-value">
//                           <div className="contact-cell">
//                             <Phone className="contact-icon" />
//                             {selectedPayment.counterMobile}
//                           </div>
//                         </span>
//                       </div>
//                       <div className="info-row">
//                         <span className="info-label">Branch Location:</span>
//                         <span className="info-value">
//                           {selectedPayment.branchLocation}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="order-items-section">
//                   <h3 className="payment-info-title">
//                     <FileText className="section-icon" />
//                     Order Items
//                   </h3>
//                   <div className="table-container">
//                     <table className="order-items-table">
//                       <thead>
//                         <tr>
//                           <th>Item</th>
//                           <th>Quantity</th>
//                           <th>Price</th>
//                           <th>Total</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {selectedPayment.items.map((item, index) => (
//                           <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price.toFixed(2)}</td>
//                             <td>₹{(item.quantity * item.price).toFixed(2)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       <tfoot>
//                         <tr>
//                           <td colSpan="3" className="total-label">
//                             Subtotal
//                           </td>
//                           <td className="total-value">
//                             ₹{selectedPayment.subtotal.toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td colSpan="3" className="total-label">
//                             Tax
//                           </td>
//                           <td className="total-value">
//                             ₹{selectedPayment.tax.toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td colSpan="3" className="total-label">
//                             Service Charge
//                           </td>
//                           <td className="total-value">
//                             ₹{selectedPayment.serviceCharge.toFixed(2)}
//                           </td>
//                         </tr>
//                         <tr className="grand-total">
//                           <td colSpan="3" className="total-label">
//                             Total
//                           </td>
//                           <td className="total-value">
//                             ₹{selectedPayment.amount.toFixed(2)}
//                           </td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="modal-footer">
//               <button
//                 className="btn btn-outline"
//                 onClick={handleClosePaymentDetails}>
//                 Close
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

//         .payment-ui {
//           padding: 2rem;
//           background-color: #f5f7fb;
//           min-height: 100vh;
//           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
//             Oxygen, Ubuntu, sans-serif;
//         }

//         .page-header {
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

//         .dashboard-card {
//           background: var(--bg-white);
//           border-radius: var(--radius-lg);
//           box-shadow: var(--shadow-md);
//           overflow: hidden;
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
//         }

//         .filter-wrapper {
//           position: relative;
//           display: inline-block;
//         }

//         .filter-btn {
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

//         .filter-btn.outline {
//           background: transparent;
//           border-color: var(--border);
//           color: var(--text);
//         }

//         .filter-btn.outline:hover {
//           background: var(--bg-light);
//         }

//         .filter-btn.primary {
//           background: var(--primary);
//           color: white;
//         }

//         .filter-btn.primary:hover {
//           background: var(--secondary);
//         }

//         .filter-dropdown {
//           position: absolute;
//           top: 100%;
//           right: 0;
//           background: var(--bg-white);
//           border: 1px solid var(--border);
//           border-radius: var(--radius-md);
//           box-shadow: var(--shadow-md);
//           min-width: 120px;
//           z-index: 10;
//           margin-top: 0.25rem;
//         }

//         .dropdown-item {
//           display: block;
//           width: 100%;
//           text-align: left;
//           background: none;
//           border: none;
//           padding: 0.75rem 1rem;
//           cursor: pointer;
//           font-size: 0.875rem;
//           color: var(--text);
//           border-bottom: 1px solid var(--border);
//           white-space: nowrap;
//         }

//         .dropdown-item:hover {
//           background: var(--bg-light);
//         }

//         .dropdown-item:last-of-type {
//           border-bottom: none;
//         }

//         .data-card {
//           overflow: hidden;
//         }

//         .card-body {
//           overflow-x: auto;
//         }

//         .table-container {
//           overflow-x: auto;
//           width: 100%;
//         }

//         .data-table {
//           width: 100%;
//           border-collapse: collapse;
//           table-layout: fixed;
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
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         .data-table td {
//           padding: 1rem;
//           border-bottom: 1px solid var(--border);
//           vertical-align: middle;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         .data-table tr:last-child td {
//           border-bottom: none;
//         }

//         .data-table tr:hover {
//           background: #f8f9fa;
//         }

//         /* Column Widths */
//         .order-id-col {
//           width: 120px;
//         }
//         .customer-col {
//           width: 200px;
//         }
//         .counter-user-col {
//           width: 200px;
//         }
//         .branch-col {
//           width: 150px;
//         }
//         .date-col {
//           width: 150px;
//         }
//         .amount-col {
//           width: 120px;
//         }
//         .method-col {
//           width: 150px;
//         }
//         .actions-col {
//           width: 120px;
//         }

//         .sortable-header {
//           cursor: pointer;
//         }

//         .sort-header {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .order-id {
//           font-weight: 600;
//           color: var(--primary);
//         }

//         .customer-cell {
//           display: flex;
//           align-items: flex-start;
//           gap: 0.5rem;
//           min-width: 0;
//         }

//         .customer-info {
//           min-width: 0;
//           flex: 1;
//         }

//         .customer-name {
//           font-weight: 500;
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         .customer-icon,
//         .date-icon,
//         .dollar-icon,
//         .branch-icon {
//           color: var(--gray);
//           height: 1rem;
//           width: 1rem;
//           flex-shrink: 0;
//           margin-top: 0.125rem;
//         }

//         .secondary-text {
//           font-size: 0.875rem;
//           color: var(--text-light);
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         .branch-cell {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .branch-name {
//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         .date-cell {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .amount-cell {
//           display: flex;
//           align-items: center;
//         }

//         .amount-value {
//           font-weight: 600;
//           white-space: nowrap;
//         }

//         .payment-method {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 0.75rem;
//           border-radius: var(--radius-md);
//           font-size: 0.875rem;
//           font-weight: 500;
//           white-space: nowrap;
//         }

//         .payment-method.card {
//           background: #e6f7ff;
//           color: #1890ff;
//         }

//         .payment-method.upi,
//         .payment-method.qr {
//           background: #f6ffed;
//           color: #52c41a;
//         }

//         .payment-method.cash {
//           background: #fff7e6;
//           color: #fa8c16;
//         }

//         .payment-method.unknown {
//           background: #f9f9f9;
//           color: var(--text-light);
//         }

//         .action-buttons {
//           display: flex;
//           gap: 0.5rem;
//         }

//         .action-btn {
//           padding: 0.5rem 1rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           border: 1px solid transparent;
//           font-size: 0.875rem;
//           white-space: nowrap;
//         }

//         .action-btn.view {
//           background: var(--primary);
//           color: white;
//         }

//         .action-btn.view:hover {
//           background: var(--secondary);
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

//         .loading-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//         }

//         .loading-spinner {
//           border: 3px solid rgba(0, 0, 0, 0.1);
//           border-left-color: var(--primary);
//           border-radius: 50%;
//           width: 2.5rem;
//           height: 2.5rem;
//           animation: spin 1s linear infinite;
//           margin-bottom: 1rem;
//         }

//         @keyframes spin {
//           0% {
//             transform: rotate(0deg);
//           }
//           100% {
//             transform: rotate(360deg);
//           }
//         }

//         .empty-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//           text-align: center;
//           color: var(--text-light);
//         }

//         .empty-icon {
//           height: 3rem;
//           width: 3rem;
//           margin-bottom: 1rem;
//           color: var(--gray-light);
//         }

//         .error-container {
//           margin: 1.5rem 0;
//           padding: 1rem 1.5rem;
//           background: #fee2e2;
//           color: #dc2626;
//           border-radius: var(--radius-md);
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
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
//         }

//         .btn {
//           padding: 0.75rem 1.5rem;
//           border-radius: var(--radius-md);
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .btn-outline {
//           background: transparent;
//           border: 1px solid var(--border);
//           color: var(--text);
//         }

//         .btn-outline:hover {
//           background: var(--bg-light);
//         }

//         .payment-details {
//           padding: 0.5rem 0;
//         }

//         .payment-info-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1.5rem;
//           margin-bottom: 2rem;
//         }

//         @media (max-width: 768px) {
//           .payment-info-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         .payment-info-section {
//           background: var(--bg-light);
//           border-radius: var(--radius-md);
//           overflow: hidden;
//         }

//         .payment-info-title {
//           font-size: 1.125rem;
//           font-weight: 600;
//           padding: 1rem 1.5rem;
//           background: var(--bg-white);
//           border-bottom: 1px solid var(--border);
//           margin: 0;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .section-icon {
//           height: 1.25rem;
//           width: 1.25rem;
//           color: var(--primary);
//         }

//         .payment-info-content {
//           padding: 1.5rem;
//         }

//         .info-row {
//           display: flex;
//           margin-bottom: 1rem;
//         }

//         .info-row.total {
//           margin-top: 1rem;
//           padding-top: 1rem;
//           border-top: 1px solid var(--border);
//         }

//         .info-label {
//           width: 140px;
//           font-weight: 500;
//           color: var(--text-light);
//           flex-shrink: 0;
//         }

//         .info-value {
//           flex: 1;
//           font-weight: 500;
//         }

//         .contact-cell {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .contact-icon {
//           height: 1rem;
//           width: 1rem;
//           color: var(--text-light);
//         }

//         .order-items-section {
//           margin-top: 2rem;
//         }

//         .order-items-table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-top: 1rem;
//         }

//         .order-items-table th {
//           text-align: left;
//           padding: 0.75rem 1rem;
//           background: var(--bg-light);
//           font-weight: 600;
//           color: var(--text-light);
//           border-bottom: 1px solid var(--border);
//         }

//         .order-items-table td {
//           padding: 0.75rem 1rem;
//           border-bottom: 1px solid var(--border);
//         }

//         .order-items-table tfoot td {
//           padding: 0.75rem 1rem;
//           font-weight: 600;
//         }

//         .total-label {
//           text-align: right;
//           font-weight: 600;
//         }

//         .total-value {
//           font-weight: 700;
//           color: var(--primary);
//         }

//         .order-items-table tfoot tr.grand-total {
//           border-top: 2px solid var(--border);
//         }

//         .order-items-table tfoot tr.grand-total td {
//           padding-top: 1rem;
//         }

//         @media (max-width: 1024px) {
//           .data-table {
//             min-width: 1200px;
//           }
//         }

//         @media (max-width: 768px) {
//           .payment-ui {
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

//           .filter-dropdown {
//             right: auto;
//             left: 0;
//             min-width: 100%;
//           }

//           .modal {
//             margin: 0;
//             max-height: 100vh;
//             border-radius: 0;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CounterPayment;

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  X,
  FileText,
  User,
  Calendar,
  DollarSign,
  Filter,
  Building,
  Phone,
} from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
});

const CounterPayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterMethod, setFilterMethod] = useState("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [availableFilterMethods, setAvailableFilterMethods] = useState([]);
  const paymentsPerPage = 7;

  useEffect(() => {
    const fetchAvailableMethods = async () => {
      const methods = ["card", "upi", "cash", "qr"];
      const available = [];
      for (const method of methods) {
        try {
          const response = await api.get("/counter-bill", {
            params: {
              paymentMethod: method,
              paymentStatus: "completed",
              limit: 1,
            },
          });
          if (response.data.count > 0) {
            available.push(method);
          }
        } catch (err) {
          console.error(`Error checking ${method}:`, err);
        }
      }
      setAvailableFilterMethods(available);
    };
    fetchAvailableMethods();
  }, []);

  useEffect(() => {
    const fetchCounterPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page: currentPage,
          limit: paymentsPerPage,
          paymentStatus: "completed", // Only show completed payments
        };
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (filterMethod !== "all") {
          params.paymentMethod = filterMethod;
        }

        console.log("Fetching with params:", params);
        const response = await api.get("/counter-bill", { params });

        console.log("Counter Payment API Response:", response.data);

        // API returns { message, count, bills: [...] }
        const bills = response.data.bills || [];

        console.log("Bills array:", bills);
        console.log("Bills count:", bills.length);

        const formattedPayments = bills.map((bill) => {
          // Get payment method from order if available, otherwise try to extract from bill
          // Payment method is in bill.order.paymentMethod, default to "cash" if not found
          const paymentMethod = bill.order?.paymentMethod || "cash";

          console.log(
            "Processing bill:",
            bill.id,
            "Payment method:",
            paymentMethod
          );

          return {
            id: bill.id,
            customer: bill.customerName || "Unknown Customer",
            customerMobile: bill.phoneNumber || "N/A",
            counterUser: bill.userId?.name || "Unknown Counter User",
            counterMobile: bill.userId?.mobile || "N/A",
            date:
              bill.date ||
              (bill.createdAt
                ? new Date(bill.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"),
            time:
              bill.time ||
              (bill.createdAt
                ? new Date(bill.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"),
            subtotal: bill.subtotal || 0,
            tax: bill.tax || 0,
            serviceCharge: bill.serviceCharge || 0,
            amount: bill.grandTotal || bill.totalAmount || 0,
            method: paymentMethod,
            items: bill.items || [],
            branchName: bill.branch?.name || "Unknown Branch",
            branchLocation: bill.branch?.location || "Unknown Location",
            branchId: bill.branch?.id || null,
            invoiceNumber: bill.invoice?.invoiceNumber || "N/A",
            orderTime: bill.createdAt || new Date().toISOString(),
            orderId: bill.order?.id || null,
          };
        });

        console.log("Formatted payments:", formattedPayments);
        setPayments(formattedPayments);
        const totalBills = response.data.count || bills.length;
        console.log(
          "Total bills:",
          totalBills,
          "Total pages:",
          Math.ceil(totalBills / paymentsPerPage)
        );
        setTotalPages(Math.ceil(totalBills / paymentsPerPage));
      } catch (error) {
        console.error("Error fetching counter payments:", error);
        setError("Failed to load counter payments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCounterPayments();
  }, [currentPage, searchQuery, filterMethod]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMethod]);

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (payment.orderId || "").toLowerCase().includes(searchLower) ||
      (payment.customer || "").toLowerCase().includes(searchLower) ||
      (payment.counterUser || "").toLowerCase().includes(searchLower) ||
      (payment.branchName || "").toLowerCase().includes(searchLower) ||
      (payment.customerMobile || "").toLowerCase().includes(searchLower);

    const matchesFilter =
      filterMethod === "all" || payment.method === filterMethod;

    return matchesSearch && matchesFilter;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.orderTime) - new Date(b.orderTime)
        : new Date(b.orderTime) - new Date(a.orderTime);
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  // Apply client-side pagination to sorted results
  // Calculate start and end indices for current page
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const endIndex = startIndex + paymentsPerPage;
  const paginatedPayments = sortedPayments.slice(startIndex, endIndex);

  console.log("Total payments:", payments.length);
  console.log("Filtered payments:", filteredPayments.length);
  console.log("Sorted payments:", sortedPayments.length);
  console.log("Paginated payments:", paginatedPayments.length);
  console.log("Current page:", currentPage, "Total pages:", totalPages);

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "upi":
        return <Wallet className="h-5 w-5" />;
      case "cash":
        return <span className="rupees-icon">₹</span>;
      case "qr":
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleClosePaymentDetails = () => {
    setShowPaymentDetails(false);
    setSelectedPayment(null);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const escapeCsvField = (field) => {
    if (field === null || field === undefined) return "";
    const str = field.toString();
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportPayments = async () => {
    try {
      const params = {
        page: 1,
        limit: 999,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterMethod !== "all") {
        params.paymentMethod = filterMethod;
      }

      const response = await api.get("/counter-bill", { params });
      const bills = response.data.bills || [];
      const allFormattedPayments = bills.map((bill) => {
        const paymentMethod = bill.order?.paymentMethod || "cash";
        return {
          id: bill.id,
          orderId: bill.invoice?.invoiceNumber || bill.id,
          customer: bill.customerName || "Unknown Customer",
          customerMobile: bill.phoneNumber || "N/A",
          counterUser: bill.userId?.name || "Unknown Counter User",
          counterMobile: bill.userId?.mobile || "N/A",
          date:
            bill.date ||
            (bill.createdAt
              ? new Date(bill.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"),
          subtotal: bill.subtotal || 0,
          tax: bill.tax || 0,
          serviceCharge: bill.serviceCharge || 0,
          amount: bill.grandTotal || bill.totalAmount || 0,
          method: paymentMethod,
          items: bill.items || [],
          branchName: bill.branch?.name || "Unknown Branch",
          branchLocation: bill.branch?.location || "Unknown Location",
          invoiceNumber: bill.invoice?.invoiceNumber || "N/A",
          orderTime: bill.createdAt || new Date().toISOString(),
        };
      });

      const headers = [
        "Order ID",
        "Customer Name",
        "Customer Mobile",
        "Counter User",
        "Branch",
        "Date",
        "Subtotal",
        "Tax",
        "Service Charge",
        "Total Amount",
        "Payment Method",
      ];
      let csv = headers.map(escapeCsvField).join(",") + "\n";

      allFormattedPayments.forEach((payment) => {
        const row = [
          payment.orderId,
          payment.customer,
          payment.customerMobile,
          payment.counterUser,
          payment.branchName,
          payment.date,
          `₹${payment.subtotal.toFixed(2)}`,
          `₹${payment.tax.toFixed(2)}`,
          `₹${payment.serviceCharge.toFixed(2)}`,
          `₹${payment.amount.toFixed(2)}`,
          payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
        ];
        csv += row.map(escapeCsvField).join(",") + "\n";
      });

      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute(
        "download",
        `counter-payments-export-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting payments:", error);
      setError("Failed to export payments. Please try again.");
    }
  };

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
    <div className="payment-ui">
      <div className="page-header">
        <h1>Counter Payments</h1>
        <p>Manage and review all counter payment transactions</p>
      </div>

      {error && (
        <div className="error-container">
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-card">
        <div className="filters-bar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by order ID, customer name, counter user, or branch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <div className="filter-wrapper">
              <button
                className="filter-btn outline"
                onClick={() => setShowFilterOptions(!showFilterOptions)}>
                <Filter className="h-4 w-4" />
                <span>
                  {filterMethod === "all"
                    ? "Filter"
                    : filterMethod.charAt(0).toUpperCase() +
                      filterMethod.slice(1)}
                </span>
                <ArrowDown
                  className="h-4 w-4 transition-transform duration-200"
                  style={{
                    transform: showFilterOptions
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>
              {showFilterOptions && (
                <div className="filter-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setFilterMethod("all");
                      setShowFilterOptions(false);
                    }}>
                    All Methods
                  </button>
                  {availableFilterMethods.length > 0 ? (
                    availableFilterMethods.map((method) => (
                      <button
                        key={method}
                        className="dropdown-item"
                        onClick={() => {
                          setFilterMethod(method);
                          setShowFilterOptions(false);
                        }}>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item disabled">
                      No payment methods available
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="filter-btn primary" onClick={exportPayments}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="data-card">
          <div className="card-body">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading counter payments...</p>
              </div>
            ) : paginatedPayments.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <p>No counter payments found matching your criteria.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="order-id-col">Order ID</th>
                      <th className="customer-col">Customer</th>
                      <th className="counter-user-col">Counter User</th>
                      <th className="branch-col">Branch</th>
                      <th
                        className="date-col sortable-header"
                        onClick={() => handleSortChange("date")}>
                        <div className="sort-header">
                          <span>Date</span>
                          {sortBy === "date" &&
                            (sortOrder === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="amount-col sortable-header"
                        onClick={() => handleSortChange("amount")}>
                        <div className="sort-header">
                          <span>Amount</span>
                          {sortBy === "amount" &&
                            (sortOrder === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="method-col">Payment Method</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="order-id-col">
                          <div className="order-id">{payment.orderId}</div>
                        </td>
                        <td className="customer-col">
                          <div className="customer-cell">
                            <User className="customer-icon" />
                            <div className="customer-info">
                              <div className="customer-name">
                                {payment.customer}
                              </div>
                              <div className="secondary-text">
                                {payment.customerMobile}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="counter-user-col">
                          <div className="customer-cell">
                            <User className="customer-icon" />
                            <div className="customer-info">
                              <div className="customer-name">
                                {payment.counterUser}
                              </div>
                              <div className="secondary-text">
                                {payment.counterMobile}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="branch-col">
                          <div className="branch-cell">
                            <Building className="branch-icon" />
                            <span className="branch-name">
                              {payment.branchName}
                            </span>
                          </div>
                        </td>
                        <td className="date-col">
                          <div className="date-cell">
                            <Calendar className="date-icon" />
                            <span>{payment.date}</span>
                          </div>
                        </td>
                        <td className="amount-col">
                          <div className="amount-cell">
                            <span className="amount-value">
                              ₹{payment.amount.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="method-col">
                          <div className={`payment-method ${payment.method}`}>
                            {getPaymentMethodIcon(payment.method)}
                            <span className="payment-method-text">
                              {payment.method.charAt(0).toUpperCase() +
                                payment.method.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button
                              className="action-btn view"
                              onClick={() => handleViewPayment(payment)}>
                              View Details
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
        </div>

        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
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
                  onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              )
            )}
          </div>
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showPaymentDetails && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Counter Payment Details</h2>
              <button
                className="modal-close"
                onClick={handleClosePaymentDetails}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <div className="payment-info-grid">
                  <div className="payment-info-section">
                    <h3 className="payment-info-title">
                      <FileText className="section-icon" />
                      Payment Information
                    </h3>
                    <div className="payment-info-content">
                      <div className="info-row">
                        <span className="info-label">Order ID:</span>
                        <span className="info-value">
                          {selectedPayment.orderId}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Invoice Number:</span>
                        <span className="info-value">
                          {selectedPayment.invoiceNumber}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">
                          {selectedPayment.date}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Branch:</span>
                        <span className="info-value">
                          {selectedPayment.branchName}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Subtotal:</span>
                        <span className="info-value">
                          ₹{selectedPayment.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tax:</span>
                        <span className="info-value">
                          ₹{selectedPayment.tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Service Charge:</span>
                        <span className="info-value">
                          ₹{selectedPayment.serviceCharge.toFixed(2)}
                        </span>
                      </div>
                      <div className="info-row total">
                        <span className="info-label">Total Amount:</span>
                        <span className="info-value">
                          ₹{selectedPayment.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Payment Method:</span>
                        <span className="info-value">
                          <div
                            className={`payment-method ${selectedPayment.method}`}>
                            {getPaymentMethodIcon(selectedPayment.method)}
                            <span className="payment-method-text">
                              {selectedPayment.method.charAt(0).toUpperCase() +
                                selectedPayment.method.slice(1)}
                            </span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-info-section">
                    <h3 className="payment-info-title">
                      <User className="section-icon" />
                      Customer & Counter Information
                    </h3>
                    <div className="payment-info-content">
                      <div className="info-row">
                        <span className="info-label">Customer Name:</span>
                        <span className="info-value">
                          {selectedPayment.customer}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Customer Mobile:</span>
                        <span className="info-value">
                          <div className="contact-cell">
                            <Phone className="contact-icon" />
                            {selectedPayment.customerMobile}
                          </div>
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Counter User:</span>
                        <span className="info-value">
                          {selectedPayment.counterUser}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Counter Mobile:</span>
                        <span className="info-value">
                          <div className="contact-cell">
                            <Phone className="contact-icon" />
                            {selectedPayment.counterMobile}
                          </div>
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Branch Location:</span>
                        <span className="info-value">
                          {selectedPayment.branchLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-items-section">
                  <h3 className="payment-info-title">
                    <FileText className="section-icon" />
                    Order Items
                  </h3>
                  <div className="table-container">
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPayment.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price.toFixed(2)}</td>
                            <td>₹{(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="total-label">
                            Subtotal
                          </td>
                          <td className="total-value">
                            ₹{selectedPayment.subtotal.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="total-label">
                            Tax
                          </td>
                          <td className="total-value">
                            ₹{selectedPayment.tax.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="total-label">
                            Service Charge
                          </td>
                          <td className="total-value">
                            ₹{selectedPayment.serviceCharge.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="grand-total">
                          <td colSpan="3" className="total-label">
                            Total
                          </td>
                          <td className="total-value">
                            ₹{selectedPayment.amount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={handleClosePaymentDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

        .payment-ui {
          padding: 2rem;
          background-color: #f5f7fb;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, sans-serif;
        }

        .page-header {
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

        .dashboard-card {
          background: var(--bg-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
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
        }

        .filter-wrapper {
          position: relative;
          display: inline-block;
        }

        .filter-btn {
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

        .filter-btn.outline {
          background: transparent;
          border-color: var(--border);
          color: var(--text);
        }

        .filter-btn.outline:hover {
          background: var(--bg-light);
        }

        .filter-btn.primary {
          background: var(--primary);
          color: white;
        }

        .filter-btn.primary:hover {
          background: var(--secondary);
        }

        .filter-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          min-width: 120px;
          z-index: 10;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        .dropdown-item.disabled {
          cursor: not-allowed;
          color: var(--text-light);
          background: var(--bg-light);
        }

        .dropdown-item:hover:not(.disabled) {
          background: var(--bg-light);
        }

        .dropdown-item:last-of-type {
          border-bottom: none;
        }

        .data-card {
          overflow: hidden;
        }

        .card-body {
          overflow-x: auto;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
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
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        /* Column Widths */
        .order-id-col {
          width: 120px;
        }
        .customer-col {
          width: 200px;
        }
        .counter-user-col {
          width: 200px;
        }
        .branch-col {
          width: 150px;
        }
        .date-col {
          width: 150px;
        }
        .amount-col {
          width: 120px;
        }
        .method-col {
          width: 150px;
        }
        .actions-col {
          width: 120px;
        }

        .sortable-header {
          cursor: pointer;
        }

        .sort-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .order-id {
          font-weight: 600;
          color: var(--primary);
        }

        .customer-cell {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          min-width: 0;
        }

        .customer-info {
          min-width: 0;
          flex: 1;
        }

        .customer-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .customer-icon,
        .date-icon,
        .dollar-icon,
        .branch-icon {
          color: var(--gray);
          height: 1rem;
          width: 1rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .secondary-text {
          font-size: 0.875rem;
          color: var(--text-light);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .branch-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .branch-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .amount-cell {
          display: flex;
          align-items: center;
        }

        .amount-value {
          font-weight: 600;
          white-space: nowrap;
        }

        .payment-method {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .payment-method.card {
          background: #e6f7ff;
          color: #1890ff;
        }

        .payment-method.upi,
        .payment-method.qr {
          background: #f6ffed;
          color: #52c41a;
        }

        .payment-method.cash {
          background: #fff7e6;
          color: #fa8c16;
        }

        .payment-method.unknown {
          background: #f9f9f9;
          color: var(--text-light);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .action-btn.view {
          background: var(--primary);
          color: white;
        }

        .action-btn.view:hover {
          background: var(--secondary);
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
          text-align: center;
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

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .loading-spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--primary);
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: var(--text-light);
        }

        .empty-icon {
          height: 3rem;
          width: 3rem;
          margin-bottom: 1rem;
          color: var(--gray-light);
        }

        .error-container {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--bg-light);
        }

        .payment-details {
          padding: 0.5rem 0;
        }

        .payment-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .payment-info-grid {
            grid-template-columns: 1fr;
          }
        }

        .payment-info-section {
          background: var(--bg-light);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .payment-info-title {
          font-size: 1.125rem;
          font-weight: 600;
          padding: 1rem 1.5rem;
          background: var(--bg-white);
          border-bottom: 1px solid var(--border);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          height: 1.25rem;
          width: 1.25rem;
          color: var(--primary);
        }

        .payment-info-content {
          padding: 1.5rem;
        }

        .info-row {
          display: flex;
          margin-bottom: 1rem;
        }

        .info-row.total {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .info-label {
          width: 140px;
          font-weight: 500;
          color: var(--text-light);
          flex-shrink: 0;
        }

        .info-value {
          flex: 1;
          font-weight: 500;
        }

        .contact-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-icon {
          height: 1rem;
          width: 1rem;
          color: var(--text-light);
        }

        .order-items-section {
          margin-top: 2rem;
        }

        .order-items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .order-items-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          background: var(--bg-light);
          font-weight: 600;
          color: var(--text-light);
          border-bottom: 1px solid var(--border);
        }

        .order-items-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
        }

        .order-items-table tfoot td {
          padding: 0.75rem 1rem;
          font-weight: 600;
        }

        .total-label {
          text-align: right;
          font-weight: 600;
        }

        .total-value {
          font-weight: 700;
          color: var(--primary);
        }

        .order-items-table tfoot tr.grand-total {
          border-top: 2px solid var(--border);
        }

        .order-items-table tfoot tr.grand-total td {
          padding-top: 1rem;
        }

        @media (max-width: 1024px) {
          .data-table {
            min-width: 1200px;
          }
        }

        @media (max-width: 768px) {
          .payment-ui {
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

          .filter-dropdown {
            right: auto;
            left: 0;
            min-width: 100%;
          }

          .modal {
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CounterPayment;
