// "use client";

// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import autoTable from "jspdf-autotable";
// import {
//   Download,
//   Filter,
//   TrendingUp,
//   BarChart3,
//   MapPin,
//   ShoppingCart,
//   Clock,
//   DollarSign,
//   FileText,
//   Search,
//   RefreshCw,
//   Eye,
//   Package,
//   X,
//   Check,
//   ChevronsUpDown,
//   CheckCircle,
//   Sparkles,
//   Calendar,
//   Users,
//   User,
//   IndianRupee,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// // API endpoints
// const API_ENDPOINTS = {
//   STAFF_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/staff-order",
//   ONLINE_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/order",
//   COUNTER_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/counter-order/orders",
//   BRANCHES: "https://crm.jagalikoota.com/api/v1/hotel/branch",
// };

// const Toast = ({ message, type = "success", onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div
//       className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-slide-in backdrop-blur-sm ${
//         type === "success"
//           ? "bg-primary/90 text-primary-foreground border border-primary/20"
//           : "bg-destructive/90 text-destructive-foreground border border-destructive/20"
//       }`}>
//       <CheckCircle className="h-5 w-5 flex-shrink-0" />
//       <span className="font-medium text-sm">{message}</span>
//       <button
//         onClick={onClose}
//         className="ml-2 text-current hover:text-current/80 transition-colors">
//         <X className="h-4 w-4" />
//       </button>
//     </div>
//   );
// };

// const Button = ({
//   children,
//   onClick,
//   disabled,
//   className,
//   variant = "default",
//   ...props
// }) => {
//   const baseClass =
//     "px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
//   const variants = {
//     default:
//       "bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary shadow-lg hover:shadow-xl",
//     outline:
//       "border-2 border-border text-foreground hover:bg-muted bg-card focus:ring-primary shadow-md hover:shadow-lg",
//     secondary:
//       "bg-secondary hover:bg-secondary/90 text-secondary-foreground focus:ring-secondary shadow-lg hover:shadow-xl",
//   };

//   return (
//     <button
//       className={`${baseClass} ${variants[variant]} ${className}`}
//       onClick={onClick}
//       disabled={disabled}
//       {...props}>
//       {children}
//     </button>
//   );
// };

// const Card = ({ children, className = "" }) => (
//   <div
//     className={`rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
//     {children}
//   </div>
// );

// const CardHeader = ({ children, className = "" }) => (
//   <div className={`p-8 pb-6 ${className}`}>{children}</div>
// );

// const CardContent = ({ children, className = "" }) => (
//   <div className={`p-8 pt-0 ${className}`}>{children}</div>
// );

// const CardTitle = ({ children, className = "" }) => (
//   <h3 className={`text-xl font-bold text-slate-800 ${className}`}>
//     {children}
//   </h3>
// );

// const CardDescription = ({ children, className = "" }) => (
//   <p className={`text-sm text-slate-600 mt-2 leading-relaxed ${className}`}>
//     {children}
//   </p>
// );

// const Input = ({ className = "", ...props }) => (
//   <input
//     className={`w-full px-4 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${className}`}
//     {...props}
//   />
// );

// const Badge = ({ children, className = "", variant = "default" }) => {
//   const variants = {
//     default: "bg-slate-100 text-slate-700",
//     secondary: "bg-blue-100 text-blue-700 border border-blue-200",
//     accent: "bg-purple-100 text-purple-700 border border-purple-200",
//   };

//   return (
//     <span
//       className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
//       {children}
//     </span>
//   );
// };

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   const pages = [];
//   const maxVisiblePages = 5;

//   let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
//   let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

//   if (endPage - startPage + 1 < maxVisiblePages) {
//     startPage = Math.max(1, endPage - maxVisiblePages + 1);
//   }

//   for (let i = startPage; i <= endPage; i++) {
//     pages.push(i);
//   }

//   return (
//     <div className="flex items-center justify-between px-8 py-4 border-t border-slate-200">
//       <div className="text-sm text-slate-600">
//         Page {currentPage} of {totalPages}
//       </div>
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
//           <ChevronLeft className="h-4 w-4" />
//         </button>

//         {pages.map((page) => (
//           <button
//             key={page}
//             onClick={() => onPageChange(page)}
//             className={`px-3 py-1 rounded-lg border ${
//               currentPage === page
//                 ? "bg-blue-600 text-white border-blue-600"
//                 : "border-slate-300 hover:bg-slate-50"
//             }`}>
//             {page}
//           </button>
//         ))}

//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50">
//           <ChevronRight className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// const ItemSalesReport = () => {
//   const [selectedBranch, setSelectedBranch] = useState("all");
//   const [selectedOrderType, setSelectedOrderType] = useState("all");
//   const [selectedItem, setSelectedItem] = useState("all");
//   const [selectedPeriod, setSelectedPeriod] = useState("daily");
//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [displayData, setDisplayData] = useState([]);
//   const [toast, setToast] = useState(null);
//   const [isItemSelectOpen, setIsItemSelectOpen] = useState(false);
//   const [branches, setBranches] = useState([]);
//   const [allOrders, setAllOrders] = useState([]);
//   const [debugInfo, setDebugInfo] = useState("");

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     fetchBranches();
//     fetchAllOrders();
//   }, []);

//   // Fetch branches from API
//   const fetchBranches = async () => {
//     try {
//       const response = await fetch(API_ENDPOINTS.BRANCHES);
//       const data = await response.json();
//       setBranches(data);
//       console.log("Branches fetched:", data.length);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       showToast("Error fetching branches", "error");
//     }
//   };

//   // Fetch all orders from different APIs
//   const fetchAllOrders = async () => {
//     setIsLoading(true);
//     try {
//       const [staffOrdersResponse, onlineOrdersResponse, counterOrdersResponse] =
//         await Promise.all([
//           fetch(API_ENDPOINTS.STAFF_ORDERS),
//           fetch(API_ENDPOINTS.ONLINE_ORDERS),
//           fetch(API_ENDPOINTS.COUNTER_ORDERS),
//         ]);

//       const staffData = await staffOrdersResponse.json();
//       const onlineData = await onlineOrdersResponse.json();
//       const counterData = await counterOrdersResponse.json();

//       console.log("Staff orders:", staffData.orders?.length || 0);
//       console.log("Online orders:", onlineData.data?.length || 0);
//       console.log("Counter orders:", counterData.orders?.length || 0);

//       // Transform and combine all orders
//       const staffOrders = (staffData.orders || []).flatMap((order) =>
//         transformStaffOrder(order)
//       );

//       const onlineOrders = (onlineData.data || []).flatMap((order) =>
//         transformOnlineOrder(order)
//       );

//       const counterOrders = (counterData.orders || []).flatMap((order) =>
//         transformCounterOrder(order)
//       );

//       const allOrdersData = [...staffOrders, ...onlineOrders, ...counterOrders];

//       console.log("Total items processed:", allOrdersData.length);
//       console.log("Sample items:", allOrdersData.slice(0, 3));

//       setAllOrders(allOrdersData);
//       setDebugInfo(
//         `Orders: ${staffData.orders?.length || 0} staff, ${
//           onlineData.data?.length || 0
//         } online, ${counterData.orders?.length || 0} counter → ${
//           allOrdersData.length
//         } items`
//       );

//       // Auto-generate report after fetching data
//       handleGenerateReport(allOrdersData);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       showToast("Error fetching orders data", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Transform staff order data
//   const transformStaffOrder = (order) => {
//     if (
//       !order.items ||
//       !Array.isArray(order.items) ||
//       order.items.length === 0
//     ) {
//       console.log("Staff order with no items:", order._id);
//       return [];
//     }

//     const orderDate = new Date(order.orderTime || order.createdAt);
//     return order.items
//       .map((item) => ({
//         id: `${order._id}-${item._id || item.menuItemId || Math.random()}`,
//         itemName: item.name || "Unknown Item",
//         category: item.category || "Main Course",
//         quantitySold: Number(item.quantity) || 1,
//         unitPrice: Number(item.price) || 0,
//         totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
//         topSellingTime: formatTime(orderDate),
//         branch: order.branchId?.name || order.branchName || "Unknown Branch",
//         branchId: order.branchId?._id || "unknown",
//         orderType: "restaurant",
//         orderDate: orderDate,
//       }))
//       .filter((item) => item.itemName !== "Unknown Item");
//   };

//   // Transform online order data
//   const transformOnlineOrder = (order) => {
//     if (
//       !order.items ||
//       !Array.isArray(order.items) ||
//       order.items.length === 0
//     ) {
//       console.log("Online order with no items:", order._id);
//       return [];
//     }

//     const orderDate = new Date(order.createdAt);
//     return order.items
//       .map((item) => ({
//         id: `${order._id}-${item._id || item.menuItemId || Math.random()}`,
//         itemName: item.name || "Unknown Item",
//         category: item.category || "Main Course",
//         quantitySold: Number(item.quantity) || 1,
//         unitPrice: Number(item.price) || 0,
//         totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
//         topSellingTime: formatTime(orderDate),
//         branch: order.branchId?.name || "Unknown Branch",
//         branchId: order.branchId?._id || "unknown",
//         orderType: "online",
//         orderDate: orderDate,
//       }))
//       .filter((item) => item.itemName !== "Unknown Item");
//   };

//   // Transform counter order data
//   const transformCounterOrder = (order) => {
//     if (
//       !order.items ||
//       !Array.isArray(order.items) ||
//       order.items.length === 0
//     ) {
//       console.log("Counter order with no items:", order.id);
//       return [];
//     }

//     const orderDate = new Date(order.createdAt);
//     return order.items
//       .map((item) => ({
//         id: `${order.id}-${item._id || item.menuItemId?._id || Math.random()}`,
//         itemName: item.name || "Unknown Item",
//         category: item.category || "Main Course",
//         quantitySold: Number(item.quantity) || 1,
//         unitPrice: Number(item.price) || 0,
//         totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
//         topSellingTime: formatTime(orderDate),
//         branch: order.branch?.name || "Unknown Branch",
//         branchId: order.branch?.id || "unknown",
//         orderType: "darshani",
//         orderDate: orderDate,
//       }))
//       .filter((item) => item.itemName !== "Unknown Item");
//   };

//   // Format time for display
//   const formatTime = (date) => {
//     const hours = date.getHours();
//     if (hours >= 7 && hours < 12) return "7:00 AM - 12:00 PM";
//     if (hours >= 12 && hours < 17) return "12:00 PM - 5:00 PM";
//     if (hours >= 17 && hours < 22) return "5:00 PM - 10:00 PM";
//     return "10:00 PM - 7:00 AM";
//   };

//   // Filter data by period
//   const filterDataByPeriod = (data, period) => {
//     const now = new Date();
//     let filteredData = data;

//     // First apply period filter
//     switch (period) {
//       case "daily":
//         filteredData = data.filter((item) => {
//           const itemDate = item.orderDate;
//           return itemDate.toDateString() === now.toDateString();
//         });
//         break;
//       case "weekly":
//         const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//         filteredData = data.filter((item) => item.orderDate >= weekAgo);
//         break;
//       case "monthly":
//         const monthAgo = new Date(
//           now.getFullYear(),
//           now.getMonth() - 1,
//           now.getDate()
//         );
//         filteredData = data.filter((item) => item.orderDate >= monthAgo);
//         break;
//       case "custom":
//         if (dateFrom && dateTo) {
//           const fromDate = new Date(dateFrom);
//           const toDate = new Date(dateTo);
//           toDate.setHours(23, 59, 59, 999);
//           filteredData = data.filter(
//             (item) => item.orderDate >= fromDate && item.orderDate <= toDate
//           );
//         }
//         break;
//       default:
//         filteredData = data;
//     }

//     console.log(
//       `After period filter (${period}):`,
//       filteredData.length,
//       "items"
//     );

//     // Then apply branch filter
//     if (selectedBranch !== "all") {
//       filteredData = filteredData.filter(
//         (item) =>
//           item.branchId === selectedBranch || item.branch === selectedBranch
//       );
//       console.log("After branch filter:", filteredData.length, "items");
//     }

//     // Then apply order type filter
//     if (selectedOrderType !== "all") {
//       filteredData = filteredData.filter(
//         (item) => item.orderType === selectedOrderType
//       );
//       console.log("After order type filter:", filteredData.length, "items");
//     }

//     // Aggregate data by item name and branch for the report
//     const aggregatedData = filteredData.reduce((acc, item) => {
//       const existingItem = acc.find(
//         (i) => i.itemName === item.itemName && i.branch === item.branch
//       );
//       if (existingItem) {
//         existingItem.quantitySold += item.quantitySold;
//         existingItem.totalRevenue += item.totalRevenue;
//       } else {
//         acc.push({ ...item });
//       }
//       return acc;
//     }, []);

//     console.log("After aggregation:", aggregatedData.length, "unique items");
//     return aggregatedData;
//   };

//   const showToast = (message, type = "success") => {
//     setToast({ message, type });
//   };

//   const activeBranches = [
//     { id: "all", name: "All Branches" },
//     ...branches.map((branch) => ({
//       id: branch._id,
//       name: branch.name,
//     })),
//   ];

//   const activeOrderTypes = [
//     { id: "all", name: "All Order Types" },
//     { id: "restaurant", name: "Restaurant Order", icon: ShoppingCart },
//     { id: "online", name: "Online Order", icon: Eye },
//     { id: "darshani", name: "Darshani Order", icon: Package },
//   ];

//   const activeItems = useMemo(() => {
//     const items = ["all", ...new Set(allOrders.map((item) => item.itemName))]
//       .filter((item) => item && item !== "Unknown Item")
//       .sort();
//     return items;
//   }, [allOrders]);

//   const handleGenerateReport = (ordersData = allOrders) => {
//     setIsLoading(true);
//     console.log("Generating report with:", ordersData.length, "items");

//     setTimeout(() => {
//       const filteredData = filterDataByPeriod(ordersData, selectedPeriod);
//       setDisplayData(filteredData);
//       setIsLoading(false);
//       setCurrentPage(1);

//       if (filteredData.length === 0) {
//         showToast("No data found for the selected filters", "error");
//       } else {
//         showToast(
//           `Report generated with ${filteredData.length} items!`,
//           "success"
//         );
//       }
//     }, 500);
//   };

//   // Auto-generate report when filters change
//   useEffect(() => {
//     if (allOrders.length > 0) {
//       console.log("Filters changed, regenerating report");
//       handleGenerateReport();
//     }
//   }, [selectedPeriod, selectedBranch, selectedOrderType, dateFrom, dateTo]);

//   const handleDownloadPDF = () => {
//     if (filteredData.length === 0) {
//       showToast("No data available to export", "error");
//       return;
//     }

//     const doc = new jsPDF();
//     const currentDate = new Date().toLocaleDateString();

//     // Get filter labels
//     const branchLabel =
//       selectedBranch === "all"
//         ? "All Branches"
//         : activeBranches.find((b) => b.id === selectedBranch)?.name ||
//           selectedBranch;

//     const orderTypeLabel =
//       selectedOrderType === "all"
//         ? "All Order Types"
//         : activeOrderTypes.find((t) => t.id === selectedOrderType)?.name ||
//           selectedOrderType;

//     const itemLabel = selectedItem === "all" ? "All Items" : selectedItem;

//     // Calculate totals
//     const totalRevenue = filteredData.reduce(
//       (sum, item) => sum + item.totalRevenue,
//       0
//     );
//     const totalQuantity = filteredData.reduce(
//       (sum, item) => sum + item.quantitySold,
//       0
//     );

//     // Title and date
//     doc.setFontSize(18);
//     doc.text("Item Sales Report", 105, 20, { align: "center" });
//     doc.setFontSize(12);
//     doc.text(`Generated on ${currentDate}`, 105, 30, { align: "center" });

//     // Applied Filters
//     doc.setFontSize(14);
//     doc.text("Applied Filters:", 20, 50);
//     doc.setFontSize(10);
//     doc.text(
//       `Period: ${
//         selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
//       }`,
//       20,
//       60
//     );
//     doc.text(`Branch: ${branchLabel}`, 20, 67);
//     doc.text(`Order Type: ${orderTypeLabel}`, 20, 74);
//     doc.text(`Item: ${itemLabel}`, 20, 81);

//     // Summary
//     doc.setFontSize(14);
//     doc.text("Summary", 20, 95);
//     doc.setFontSize(10);
//     doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 20, 105);
//     doc.text(`Items Sold: ${totalQuantity.toLocaleString()}`, 20, 112);
//     doc.text(`Unique Items: ${filteredData.length}`, 20, 119);

//     // Table data preparation
//     const tableColumns = [
//       "Item Name",
//       "Category",
//       "Branch",
//       "Order Type",
//       "Qty Sold",
//       "Unit Price",
//       "Total Revenue",
//       "Peak Time",
//     ];

//     const tableRows = filteredData.map((item) => [
//       item.itemName.length > 20
//         ? item.itemName.substring(0, 20) + "..."
//         : item.itemName,
//       item.category.length > 15
//         ? item.category.substring(0, 15) + "..."
//         : item.category,
//       item.branch.length > 15
//         ? item.branch.substring(0, 15) + "..."
//         : item.branch,
//       item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1),
//       item.quantitySold.toLocaleString(),
//       `₹${item.unitPrice.toLocaleString()}`,
//       `₹${item.totalRevenue.toLocaleString()}`,
//       item.topSellingTime,
//     ]);

//     // Use autoTable function
//     autoTable(doc, {
//       startY: 130,
//       head: [tableColumns],
//       body: tableRows,
//       theme: "grid",
//       styles: {
//         fontSize: 8,
//         cellPadding: 3,
//         overflow: "linebreak",
//       },
//       headStyles: {
//         fillColor: [59, 130, 246],
//         textColor: 255,
//         fontStyle: "bold",
//       },
//       alternateRowStyles: {
//         fillColor: [240, 240, 240],
//       },
//       margin: { top: 10 },
//     });

//     // Save the PDF
//     const fileName = `item-sales-report-${currentDate.replace(/\//g, "-")}.pdf`;
//     doc.save(fileName);
//     showToast("PDF report downloaded successfully!", "success");
//   };

//   const handleResetFilters = () => {
//     setSelectedBranch("all");
//     setSelectedOrderType("all");
//     setSelectedItem("all");
//     setSelectedPeriod("daily");
//     setDateFrom("");
//     setDateTo("");
//     setSearchTerm("");
//     setCurrentPage(1);
//     showToast("Filters reset successfully!", "success");
//   };

//   // Filter data for display
//   const filteredData = useMemo(() => {
//     let data = displayData;

//     // Apply search filter
//     if (searchTerm) {
//       data = data.filter(
//         (item) =>
//           item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           item.branch.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Apply item filter
//     if (selectedItem !== "all") {
//       data = data.filter((item) => item.itemName === selectedItem);
//     }

//     console.log("Final filtered data for display:", data.length);
//     return data;
//   }, [displayData, searchTerm, selectedItem]);

//   // Pagination logic
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const currentItems = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredData.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredData, currentPage, itemsPerPage]);

//   const totalRevenue = filteredData.reduce(
//     (sum, item) => sum + item.totalRevenue,
//     0
//   );
//   const totalQuantity = filteredData.reduce(
//     (sum, item) => sum + item.quantitySold,
//     0
//   );
//   const avgOrderValue =
//     totalQuantity > 0 ? Math.round(totalRevenue / totalQuantity) : 0;

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] p-6">
//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}

//       {/* Debug info - remove in production */}
//       {debugInfo && (
//         <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-xs z-40">
//           {debugInfo}
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header section */}
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] border border-[#D1C9BC]">
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
//           <div className="relative p-8 lg:p-12">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-blue-500/20 rounded-2xl">
//                     <BarChart3 className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <div>
//                     <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
//                       Item Sales Report
//                       <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
//                     </h1>
//                     <p className="text-slate-600 mt-2 text-lg leading-relaxed">
//                       Comprehensive analysis of item-wise sales performance
//                       across all order types.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 <Button
//                   onClick={() => handleGenerateReport()}
//                   disabled={isLoading}
//                   className="min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white">
//                   {isLoading ? (
//                     <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
//                   ) : (
//                     <TrendingUp className="h-5 w-5 mr-3" />
//                   )}
//                   {isLoading ? "Generating..." : "Generate Report"}
//                 </Button>
//                 <Button
//                   onClick={handleDownloadPDF}
//                   variant="outline"
//                   className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent w-45"
//                   disabled={filteredData.length === 0}>
//                   <Download className="h-5 w-5 mr-3" />
//                   Export Report
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters section */}
//         <Card className="shadow-xl border-2 border-[#D1C9BC] bg-white">
//           <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent">
//             <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
//               <div className="p-2 bg-blue-500/20 rounded-xl">
//                 <Filter className="h-6 w-6 text-blue-600" />
//               </div>
//               Filters & Settings
//             </CardTitle>
//             <CardDescription className="text-base text-slate-600">
//               Configure your report parameters to get precise insights and
//               actionable data.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <MapPin className="h-4 w-4 text-blue-600" />
//                   Select Branch
//                 </label>
//                 <select
//                   value={selectedBranch}
//                   onChange={(e) => setSelectedBranch(e.target.value)}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
//                   {activeBranches.map((branch) => (
//                     <option key={branch.id} value={branch.id}>
//                       {branch.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <ShoppingCart className="h-4 w-4 text-blue-600" />
//                   Order Type
//                 </label>
//                 <select
//                   value={selectedOrderType}
//                   onChange={(e) => setSelectedOrderType(e.target.value)}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
//                   {activeOrderTypes.map((type) => (
//                     <option key={type.id} value={type.id}>
//                       {type.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <Package className="h-4 w-4 text-blue-600" />
//                   Select Item
//                 </label>
//                 <div className="relative">
//                   <button
//                     onClick={() => setIsItemSelectOpen(!isItemSelectOpen)}
//                     className="w-full px-4 py-3 text-left bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex justify-between items-center">
//                     <span>
//                       {selectedItem === "all" ? "All Items" : selectedItem}
//                     </span>
//                     <ChevronsUpDown className="h-4 w-4 opacity-50" />
//                   </button>
//                   {isItemSelectOpen && (
//                     <div className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
//                       {activeItems.map((item) => (
//                         <div
//                           key={item}
//                           className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors flex items-center"
//                           onClick={() => {
//                             setSelectedItem(item);
//                             setIsItemSelectOpen(false);
//                           }}>
//                           <Check
//                             className={`mr-3 h-4 w-4 text-blue-600 ${
//                               item === selectedItem
//                                 ? "opacity-100"
//                                 : "opacity-0"
//                             }`}
//                           />
//                           {item === "all" ? "All Items" : item}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <RefreshCw className="h-4 w-4 text-red-600" />
//                   Reset Filters
//                 </label>
//                 <Button
//                   onClick={handleResetFilters}
//                   variant="outline"
//                   className="w-full border-red-300 text-red-700 hover:bg-red-200 bg-transparent">
//                   Reset All
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                 <Clock className="h-4 w-4 text-blue-600" />
//                 Time Period
//               </label>
//               <div className="grid grid-cols-4 gap-2 p-2 bg-slate-100 rounded-2xl">
//                 {["daily", "weekly", "monthly", "custom"].map((period) => (
//                   <button
//                     key={period}
//                     onClick={() => setSelectedPeriod(period)}
//                     className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
//                       selectedPeriod === period
//                         ? "bg-blue-600 text-white shadow-lg"
//                         : "text-slate-600 hover:text-slate-800 hover:bg-white"
//                     }`}>
//                     {period.charAt(0).toUpperCase() + period.slice(1)}
//                   </button>
//                 ))}
//               </div>

//               {selectedPeriod === "custom" && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-slate-50 rounded-2xl">
//                   <div className="space-y-3">
//                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-blue-600" />
//                       From Date
//                     </label>
//                     <Input
//                       type="date"
//                       value={dateFrom}
//                       onChange={(e) => setDateFrom(e.target.value)}
//                       className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div className="space-y-3">
//                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-blue-600" />
//                       To Date
//                     </label>
//                     <Input
//                       type="date"
//                       value={dateTo}
//                       onChange={(e) => setDateTo(e.target.value)}
//                       className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Summary cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card className="bg-gradient-to-br from-emerald-400/10 to-emerald-500/20 border-emerald-300/50 hover:from-emerald-400/20 hover:to-emerald-500/30">
//             <CardContent className="p-8 flex items-center justify-between">
//               <div className="space-y-2 mt-5">
//                 <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
//                   Total Revenue
//                 </p>
//                 <p className="text-2xl font-bold text-slate-900">
//                   ₹{totalRevenue.toLocaleString()}
//                 </p>
//                 <p className="text-xs text-emerald-600 font-medium">
//                   {filteredData.length} items
//                 </p>
//               </div>
//               <div className="p-4 bg-emerald-500/20 rounded-2xl">
//                 <IndianRupee className="h-5 w-5 text-emerald-600 " />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-blue-400/10 to-blue-500/20 border-blue-300/50 hover:from-blue-400/20 hover:to-blue-500/30">
//             <CardContent className="p-8 flex items-center justify-between">
//               <div className="space-y-2 mt-5">
//                 <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
//                   Items Sold
//                 </p>
//                 <p className="text-3xl font-bold text-slate-800">
//                   {totalQuantity.toLocaleString()}
//                 </p>
//                 <p className="text-xs text-blue-600 font-medium">
//                   Across all orders
//                 </p>
//               </div>
//               <div className="p-4 bg-blue-500/20 rounded-2xl">
//                 <Package className="h-8 w-8 text-blue-600" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-purple-400/10 to-purple-500/20 border-purple-300/50 hover:from-purple-400/20 hover:to-purple-500/30">
//             <CardContent className="p-8 flex items-center justify-between">
//               <div className="space-y-2 mt-5">
//                 <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
//                   Avg. Item Value
//                 </p>
//                 <p className="text-3xl font-bold text-slate-800">
//                   ₹{avgOrderValue.toLocaleString()}
//                 </p>
//                 <p className="text-xs text-purple-600 font-medium">
//                   Per item sold
//                 </p>
//               </div>
//               <div className="p-4 bg-[#69231B]/20 rounded-2xl">
//                 <TrendingUp className="h-8 w-8 text-purple-600" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-gradient-to-br from-amber-400/10 to-amber-500/20 border-amber-300/50 hover:from-amber-400/20 hover:to-amber-500/30">
//             <CardContent className="p-8 flex items-center justify-between">
//               <div className="space-y-2 mt-5">
//                 <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
//                   Unique Items
//                 </p>
//                 <p className="text-3xl font-bold text-slate-800">
//                   {filteredData.length}
//                 </p>
//                 <p className="text-xs text-amber-600 font-medium">
//                   Active in catalog
//                 </p>
//               </div>
//               <div className="p-4 bg-amber-500/20 rounded-2xl">
//                 <FileText className="h-8 w-8 text-amber-600" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Data table with pagination */}
//         <Card className="shadow-2xl border-2 border-slate-200/50 bg-white">
//           <CardHeader className="bg-gradient-to-r from-slate-50/50 to-transparent">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
//               <div className="space-y-2">
//                 <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
//                   <div className="p-2 bg-blue-500/20 rounded-xl">
//                     <Users className="h-6 w-6 text-blue-600" />
//                   </div>
//                   Item-wise Sales Data
//                 </CardTitle>
//                 <CardDescription className="text-base text-slate-600">
//                   Detailed breakdown of individual item performance with
//                   comprehensive metrics.
//                   {filteredData.length > 0 &&
//                     ` Showing ${filteredData.length} items`}
//                 </CardDescription>
//               </div>
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
//                 <Input
//                   placeholder="Search items or categories..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-12 w-full sm:w-80 bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b-2 border-slate-200 bg-slate-50">
//                     <th className="text-left py-6 px-8 font-bold text-slate-800">
//                       Item Name
//                     </th>
//                     <th className="text-left py-6 px-8 font-bold text-slate-800">
//                       Category
//                     </th>
//                     <th className="text-left py-6 px-8 font-bold text-slate-800">
//                       Branch
//                     </th>
//                     <th className="text-left py-6 px-8 font-bold text-slate-800">
//                       Order Type
//                     </th>
//                     <th className="text-center py-6 px-8 font-bold text-slate-800">
//                       Qty Sold
//                     </th>
//                     <th className="text-right py-6 px-8 font-bold text-slate-800">
//                       Unit Price
//                     </th>
//                     <th className="text-right py-6 px-8 font-bold text-slate-800">
//                       Total Revenue
//                     </th>
//                     <th className="text-center py-6 px-8 font-bold text-slate-800">
//                       Peak Time/Day
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.map((item, index) => (
//                     <tr
//                       key={item.id}
//                       className={`border-b border-slate-200 hover:bg-blue-50/50 transition-all duration-200 ${
//                         index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
//                       }`}>
//                       <td className="py-6 px-8">
//                         <div className="font-semibold text-slate-800 text-base">
//                           {item.itemName}
//                         </div>
//                       </td>
//                       <td className="py-6 px-8">
//                         <Badge
//                           variant="secondary"
//                           className="font-semibold bg-blue-100 text-blue-700 border-blue-200">
//                           {item.category}
//                         </Badge>
//                       </td>
//                       <td className="py-6 px-8">
//                         <Badge
//                           variant="accent"
//                           className="font-semibold bg-purple-100 text-purple-700 border-purple-200">
//                           {item.branch}
//                         </Badge>
//                       </td>
//                       <td className="py-6 px-8">
//                         <Badge variant="default" className="font-semibold">
//                           {item.orderType.charAt(0).toUpperCase() +
//                             item.orderType.slice(1)}
//                         </Badge>
//                       </td>
//                       <td className="py-6 px-8 text-center font-bold text-slate-800 text-base">
//                         {item.quantitySold.toLocaleString()}
//                       </td>
//                       <td className="py-6 px-8 text-right text-slate-600 font-semibold">
//                         ₹{item.unitPrice.toLocaleString()}
//                       </td>
//                       <td className="py-6 px-8 text-right font-bold text-emerald-600 text-base">
//                         ₹{item.totalRevenue.toLocaleString()}
//                       </td>
//                       <td className="py-6 px-8 text-center text-sm text-slate-600 font-medium">
//                         {item.topSellingTime}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {filteredData.length === 0 && !isLoading && (
//               <div className="text-center py-16">
//                 <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-6">
//                   <Package className="h-16 w-16 text-slate-400 mx-auto" />
//                 </div>
//                 <p className="text-slate-600 text-lg font-medium">
//                   No items found matching your search criteria.
//                 </p>
//                 <p className="text-slate-500 text-sm mt-2">
//                   Try adjusting your filters or search terms.
//                 </p>
//                 <div className="mt-4 text-xs text-slate-400">
//                   Debug: {allOrders.length} total items processed
//                 </div>
//               </div>
//             )}

//             {isLoading && (
//               <div className="text-center py-16">
//                 <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
//                 <p className="text-slate-600">Generating report...</p>
//               </div>
//             )}

//             {filteredData.length > 0 && (
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ItemSalesReport;

"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {
  Download,
  Filter,
  TrendingUp,
  BarChart3,
  MapPin,
  ShoppingCart,
  Clock,
  DollarSign,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Package,
  X,
  Check,
  ChevronsUpDown,
  CheckCircle,
  Sparkles,
  Calendar,
  Users,
  User,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// API endpoints
const API_ENDPOINTS = {
  STAFF_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/staff-order",
  ONLINE_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/order",
  COUNTER_ORDERS: "https://crm.jagalikoota.com/api/v1/hotel/counter-order/orders",
  BRANCHES: "https://crm.jagalikoota.com/api/v1/hotel/branch",
  RESTAURANT_MENU: "https://crm.jagalikoota.com/api/v1/hotel/restaurant-menu", // New API endpoint for menu items
};

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-slide-in backdrop-blur-sm ${
        type === "success"
          ? "bg-primary/90 text-primary-foreground border border-primary/20"
          : "bg-destructive/90 text-destructive-foreground border border-destructive/20"
      }`}
    >
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-current hover:text-current/80 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const Button = ({
  children,
  onClick,
  disabled,
  className,
  variant = "default",
  ...props
}) => {
  const baseClass =
    "px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    default:
      "bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-border text-foreground hover:bg-muted bg-card focus:ring-primary shadow-md hover:shadow-lg",
    secondary:
      "bg-secondary hover:bg-secondary/90 text-secondary-foreground focus:ring-secondary shadow-lg hover:shadow-xl",
  };

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-8 pb-6 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-bold text-slate-800 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-600 mt-2 leading-relaxed ${className}`}>
    {children}
  </p>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-border rounded-xl bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${className}`}
    {...props}
  />
);

const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    secondary: "bg-blue-100 text-blue-700 border border-blue-200",
    accent: "bg-purple-100 text-purple-700 border border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-8 py-4 border-t border-slate-200">
      <div className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg border ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ItemSalesReport = () => {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedOrderType, setSelectedOrderType] = useState("all");
  const [selectedItem, setSelectedItem] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [toast, setToast] = useState(null);
  const [isItemSelectOpen, setIsItemSelectOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]); // New state for menu items
  const [debugInfo, setDebugInfo] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBranches();
    fetchAllOrders();
    fetchMenuItems(); // Fetch menu items on component mount
  }, []);

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BRANCHES);
      const data = await response.json();
      setBranches(data);
      console.log("Branches fetched:", data.length);
    } catch (error) {
      console.error("Error fetching branches:", error);
      showToast("Error fetching branches", "error");
    }
  };

  // Fetch restaurant menu items from API
  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.RESTAURANT_MENU);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different possible response structures
      let items = [];
      if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data.menuItems && Array.isArray(data.menuItems)) {
        items = data.menuItems;
      } else {
        console.warn("Unexpected API response structure:", data);
      }

      setMenuItems(items);
      console.log("Menu items fetched:", items.length);
      console.log("Sample menu items:", items.slice(0, 3));

      if (items.length === 0) {
        showToast("No menu items found", "error");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showToast(
        "Error fetching menu items. Using order data instead.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all orders from different APIs
  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const [staffOrdersResponse, onlineOrdersResponse, counterOrdersResponse] =
        await Promise.all([
          fetch(API_ENDPOINTS.STAFF_ORDERS),
          fetch(API_ENDPOINTS.ONLINE_ORDERS),
          fetch(API_ENDPOINTS.COUNTER_ORDERS),
        ]);

      const staffData = await staffOrdersResponse.json();
      const onlineData = await onlineOrdersResponse.json();
      const counterData = await counterOrdersResponse.json();

      console.log("Staff orders:", staffData.orders?.length || 0);
      console.log("Online orders:", onlineData.data?.length || 0);
      console.log("Counter orders:", counterData.orders?.length || 0);

      // Transform and combine all orders
      const staffOrders = (staffData.orders || []).flatMap((order) =>
        transformStaffOrder(order)
      );

      const onlineOrders = (onlineData.data || []).flatMap((order) =>
        transformOnlineOrder(order)
      );

      const counterOrders = (counterData.orders || []).flatMap((order) =>
        transformCounterOrder(order)
      );

      const allOrdersData = [...staffOrders, ...onlineOrders, ...counterOrders];

      console.log("Total items processed:", allOrdersData.length);
      console.log("Sample items:", allOrdersData.slice(0, 3));

      setAllOrders(allOrdersData);
      setDebugInfo(
        `Orders: ${staffData.orders?.length || 0} staff, ${
          onlineData.data?.length || 0
        } online, ${counterData.orders?.length || 0} counter → ${
          allOrdersData.length
        } items | Menu: ${menuItems.length} items`
      );

      // Auto-generate report after fetching data
      handleGenerateReport(allOrdersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Error fetching orders data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Transform staff order data
  const transformStaffOrder = (order) => {
    if (
      !order.items ||
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {
      console.log("Staff order with no items:", order._id);
      return [];
    }

    const orderDate = new Date(order.orderTime || order.createdAt);
    return order.items
      .map((item) => ({
        id: `${order._id}-${item._id || item.menuItemId || Math.random()}`,
        itemName: item.name || "Unknown Item",
        category: item.category || "Main Course",
        quantitySold: Number(item.quantity) || 1,
        unitPrice: Number(item.price) || 0,
        totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
        topSellingTime: formatTime(orderDate),
        branch: order.branchId?.name || order.branchName || "Unknown Branch",
        branchId: order.branchId?._id || "unknown",
        orderType: "restaurant",
        orderDate: orderDate,
      }))
      .filter((item) => item.itemName !== "Unknown Item");
  };

  // Transform online order data
  const transformOnlineOrder = (order) => {
    if (
      !order.items ||
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {
      console.log("Online order with no items:", order._id);
      return [];
    }

    const orderDate = new Date(order.createdAt);
    return order.items
      .map((item) => ({
        id: `${order._id}-${item._id || item.menuItemId || Math.random()}`,
        itemName: item.name || "Unknown Item",
        category: item.category || "Main Course",
        quantitySold: Number(item.quantity) || 1,
        unitPrice: Number(item.price) || 0,
        totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
        topSellingTime: formatTime(orderDate),
        branch: order.branchId?.name || "Unknown Branch",
        branchId: order.branchId?._id || "unknown",
        orderType: "online",
        orderDate: orderDate,
      }))
      .filter((item) => item.itemName !== "Unknown Item");
  };

  // Transform counter order data
  const transformCounterOrder = (order) => {
    if (
      !order.items ||
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {
      console.log("Counter order with no items:", order.id);
      return [];
    }

    const orderDate = new Date(order.createdAt);
    return order.items
      .map((item) => ({
        id: `${order.id}-${item._id || item.menuItemId?._id || Math.random()}`,
        itemName: item.name || "Unknown Item",
        category: item.category || "Main Course",
        quantitySold: Number(item.quantity) || 1,
        unitPrice: Number(item.price) || 0,
        totalRevenue: (Number(item.quantity) || 1) * (Number(item.price) || 0),
        topSellingTime: formatTime(orderDate),
        branch: order.branch?.name || "Unknown Branch",
        branchId: order.branch?.id || "unknown",
        orderType: "darshani",
        orderDate: orderDate,
      }))
      .filter((item) => item.itemName !== "Unknown Item");
  };

  // Format time for display
  const formatTime = (date) => {
    const hours = date.getHours();
    if (hours >= 7 && hours < 12) return "7:00 AM - 12:00 PM";
    if (hours >= 12 && hours < 17) return "12:00 PM - 5:00 PM";
    if (hours >= 17 && hours < 22) return "5:00 PM - 10:00 PM";
    return "10:00 PM - 7:00 AM";
  };

  // Get item name from menu items using menuItemId
  const getItemNameFromMenu = (menuItemId) => {
    if (!menuItemId || menuItems.length === 0) return null;

    const menuItem = menuItems.find((item) => item._id === menuItemId);
    return menuItem ? menuItem.itemName : null;
  };

  // Filter data by period
  const filterDataByPeriod = (data, period) => {
    let filteredData = [...data];

    console.log(`Starting with ${filteredData.length} items`);

    // First apply period filter
    switch (period) {
      case "daily":
        const today = new Date();
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.orderDate);
          return itemDate.toDateString() === today.toDateString();
        });
        break;
      case "weekly":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.orderDate);
          return itemDate >= weekAgo;
        });
        break;
      case "monthly":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.orderDate);
          return itemDate >= monthAgo;
        });
        break;
      case "custom":
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          filteredData = filteredData.filter((item) => {
            const itemDate = new Date(item.orderDate);
            return itemDate >= fromDate && itemDate <= toDate;
          });
        }
        break;
      case "all":
      default:
        // No date filtering for "all"
        break;
    }

    console.log(
      `After period filter (${period}):`,
      filteredData.length,
      "items"
    );

    // Then apply branch filter
    if (selectedBranch !== "all") {
      filteredData = filteredData.filter((item) => {
        const branchMatch =
          item.branchId === selectedBranch || item.branch === selectedBranch;
        return branchMatch;
      });
      console.log("After branch filter:", filteredData.length, "items");
    }

    // Then apply order type filter
    if (selectedOrderType !== "all") {
      filteredData = filteredData.filter(
        (item) => item.orderType === selectedOrderType
      );
      console.log("After order type filter:", filteredData.length, "items");
    }

    // Aggregate data by item name and branch for the report
    const aggregatedData = filteredData.reduce((acc, item) => {
      const key = `${item.itemName}-${item.branch}`;
      const existingItem = acc.find(
        (i) => i.itemName === item.itemName && i.branch === item.branch
      );

      if (existingItem) {
        existingItem.quantitySold += item.quantitySold;
        existingItem.totalRevenue += item.totalRevenue;
      } else {
        acc.push({
          ...item,
          quantitySold: item.quantitySold,
          totalRevenue: item.totalRevenue,
        });
      }
      return acc;
    }, []);

    console.log("After aggregation:", aggregatedData.length, "unique items");
    return aggregatedData;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const activeBranches = [
    { id: "all", name: "All Branches" },
    ...branches.map((branch) => ({
      id: branch._id,
      name: branch.name,
    })),
  ];

  const activeOrderTypes = [
    { id: "all", name: "All Order Types" },
    { id: "restaurant", name: "Restaurant Order", icon: ShoppingCart },
    { id: "online", name: "Online Order", icon: Eye },
    { id: "darshani", name: "Darshani Order", icon: Package },
  ];

  // Updated activeItems to use menuItems first, then fallback to orders
  const activeItems = useMemo(() => {
    // Get unique item names from menu items
    const menuItemNames = [
      ...new Set(
        menuItems
          .map((item) => item.itemName)
          .filter((name) => name && name !== "Unknown Item")
      ),
    ];

    // If we have menu items, use them
    if (menuItemNames.length > 0) {
      const items = ["all", ...menuItemNames].sort();
      console.log("Using menu items for dropdown:", items.length);
      return items;
    }

    // Fallback to order items if no menu items available
    const orderItemNames = [
      ...new Set(allOrders.map((item) => item.itemName)),
    ].filter((item) => item && item !== "Unknown Item");
    const items = ["all", ...orderItemNames].sort();
    console.log("Using order items for dropdown (fallback):", items.length);
    return items;
  }, [menuItems, allOrders]);

  const handleGenerateReport = (ordersData = allOrders) => {
    if (ordersData.length === 0) {
      showToast("No orders data available", "error");
      return;
    }

    setIsLoading(true);
    console.log("Generating report with:", ordersData.length, "items");

    setTimeout(() => {
      try {
        const filteredData = filterDataByPeriod(ordersData, selectedPeriod);
        setDisplayData(filteredData);

        if (filteredData.length === 0) {
          showToast("No data found for the selected filters", "error");
        } else {
          showToast(
            `Report generated with ${filteredData.length} items!`,
            "success"
          );
        }
      } catch (error) {
        console.error("Error generating report:", error);
        showToast("Error generating report", "error");
      } finally {
        setIsLoading(false);
        setCurrentPage(1);
      }
    }, 500);
  };

  // Auto-generate report when filters change
  useEffect(() => {
    if (allOrders.length > 0) {
      console.log("Filters changed, regenerating report");
      handleGenerateReport();
    }
  }, [selectedPeriod, selectedBranch, selectedOrderType, dateFrom, dateTo]);

  const handleDownloadPDF = () => {
    if (filteredData.length === 0) {
      showToast("No data available to export", "error");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Get filter labels
    const branchLabel =
      selectedBranch === "all"
        ? "All Branches"
        : activeBranches.find((b) => b.id === selectedBranch)?.name ||
          selectedBranch;

    const orderTypeLabel =
      selectedOrderType === "all"
        ? "All Order Types"
        : activeOrderTypes.find((t) => t.id === selectedOrderType)?.name ||
          selectedOrderType;

    const itemLabel = selectedItem === "all" ? "All Items" : selectedItem;

    // Calculate totals
    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );
    const totalQuantity = filteredData.reduce(
      (sum, item) => sum + item.quantitySold,
      0
    );

    // Title and date
    doc.setFontSize(18);
    doc.text("Item Sales Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Generated on ${currentDate}`, 105, 30, { align: "center" });

    // Applied Filters
    doc.setFontSize(14);
    doc.text("Applied Filters:", 20, 50);
    doc.setFontSize(10);
    doc.text(
      `Period: ${
        selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
      }`,
      20,
      60
    );
    doc.text(`Branch: ${branchLabel}`, 20, 67);
    doc.text(`Order Type: ${orderTypeLabel}`, 20, 74);
    doc.text(`Item: ${itemLabel}`, 20, 81);

    // Summary
    doc.setFontSize(14);
    doc.text("Summary", 20, 95);
    doc.setFontSize(10);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`, 20, 105);
    doc.text(`Items Sold: ${totalQuantity.toLocaleString()}`, 20, 112);
    doc.text(`Unique Items: ${filteredData.length}`, 20, 119);

    // Table data preparation
    const tableColumns = [
      "Item Name",
      "Category",
      "Branch",
      "Order Type",
      "Qty Sold",
      "Unit Price",
      "Total Revenue",
      "Peak Time",
    ];

    const tableRows = filteredData.map((item) => [
      item.itemName.length > 20
        ? item.itemName.substring(0, 20) + "..."
        : item.itemName,
      item.category.length > 15
        ? item.category.substring(0, 15) + "..."
        : item.category,
      item.branch.length > 15
        ? item.branch.substring(0, 15) + "..."
        : item.branch,
      item.orderType.charAt(0).toUpperCase() + item.orderType.slice(1),
      item.quantitySold.toLocaleString(),
      `₹${item.unitPrice.toLocaleString()}`,
      `₹${item.totalRevenue.toLocaleString()}`,
      item.topSellingTime,
    ]);

    // Use autoTable function
    autoTable(doc, {
      startY: 130,
      head: [tableColumns],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { top: 10 },
    });

    // Save the PDF
    const fileName = `item-sales-report-${currentDate.replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
    showToast("PDF report downloaded successfully!", "success");
  };

  const handleResetFilters = () => {
    setSelectedBranch("all");
    setSelectedOrderType("all");
    setSelectedItem("all");
    setSelectedPeriod("all");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
    setCurrentPage(1);

    // Force regenerate report after reset
    if (allOrders.length > 0) {
      handleGenerateReport();
    }

    showToast("Filters reset successfully!", "success");
  };

  // Filter data for display
  const filteredData = useMemo(() => {
    let data = [...displayData];

    // Apply search filter
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.category &&
            item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.branch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply item filter
    if (selectedItem !== "all") {
      data = data.filter((item) => item.itemName === selectedItem);
    }

    console.log("Final filtered data for display:", data.length);
    return data;
  }, [displayData, searchTerm, selectedItem]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalQuantity = filteredData.reduce(
    (sum, item) => sum + (item.quantitySold || 0),
    0
  );
  const avgOrderValue =
    totalQuantity > 0 ? Math.round(totalRevenue / totalQuantity) : 0;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Debug info - remove in production */}
      {debugInfo && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-xs z-40">
          {debugInfo}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FCFCFC] to-[#F5F0EF] border border-[#D1C9BC]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
                      Item Sales Report
                      <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                    </h1>
                    <p className="text-slate-600 mt-2 text-lg leading-relaxed">
                      Comprehensive analysis of item-wise sales performance
                      across all order types.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleGenerateReport()}
                  disabled={isLoading}
                  className="min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  ) : (
                    <TrendingUp className="h-5 w-5 mr-3" />
                  )}
                  {isLoading ? "Generating..." : "Generate Report"}
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent w-45"
                  disabled={filteredData.length === 0}
                >
                  <Download className="h-5 w-5 mr-3" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters section */}
        <Card className="shadow-xl border-2 border-[#D1C9BC] bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Filter className="h-6 w-6 text-blue-600" />
              </div>
              Filters & Settings
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Configure your report parameters to get precise insights and
              actionable data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Select Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {activeBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  Order Type
                </label>
                <select
                  value={selectedOrderType}
                  onChange={(e) => setSelectedOrderType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {activeOrderTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Select Item
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsItemSelectOpen(!isItemSelectOpen)}
                    className="w-full px-4 py-3 text-left bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 flex justify-between items-center"
                  >
                    <span>
                      {selectedItem === "all" ? "All Items" : selectedItem}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                  {isItemSelectOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {activeItems.map((item) => (
                        <div
                          key={item}
                          className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors flex items-center"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsItemSelectOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-3 h-4 w-4 text-blue-600 ${
                              item === selectedItem
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {item === "all" ? "All Items" : item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-red-600" />
                  Reset Filters
                </label>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-200 bg-transparent"
                >
                  Reset All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Time Period
              </label>
              <div className="grid grid-cols-5 gap-2 p-2 bg-slate-100 rounded-2xl">
                {["all", "daily", "weekly", "monthly", "custom"].map(
                  (period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        selectedPeriod === period
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-slate-600 hover:text-slate-800 hover:bg-white"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  )
                )}
              </div>

              {selectedPeriod === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6 bg-slate-50 rounded-2xl">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-400/10 to-emerald-500/20 border-emerald-300/50 hover:from-emerald-400/20 hover:to-emerald-500/30">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2 mt-5">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 font-medium">
                  {filteredData.length} items
                </p>
              </div>
              <div className="p-4 bg-emerald-500/20 rounded-2xl">
                <IndianRupee className="h-5 w-5 text-emerald-600 " />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400/10 to-blue-500/20 border-blue-300/50 hover:from-blue-400/20 hover:to-blue-500/30">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2 mt-5">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Items Sold
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {totalQuantity.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Across all orders
                </p>
              </div>
              <div className="p-4 bg-blue-500/20 rounded-2xl">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400/10 to-purple-500/20 border-purple-300/50 hover:from-purple-400/20 hover:to-purple-500/30">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2 mt-5">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Avg. Item Value
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  ₹{avgOrderValue.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  Per item sold
                </p>
              </div>
              <div className="p-4 bg-[#69231B]/20 rounded-2xl">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-400/10 to-amber-500/20 border-amber-300/50 hover:from-amber-400/20 hover:to-amber-500/30">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2 mt-5">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">
                  Unique Items
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {filteredData.length}
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  Active in catalog
                </p>
              </div>
              <div className="p-4 bg-amber-500/20 rounded-2xl">
                <FileText className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data table with pagination */}
        <Card className="shadow-2xl border-2 border-slate-200/50 bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  Item-wise Sales Data
                </CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Detailed breakdown of individual item performance with
                  comprehensive metrics.
                  {filteredData.length > 0 &&
                    ` Showing ${filteredData.length} items`}
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search items or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full sm:w-80 bg-white border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left py-6 px-8 font-bold text-slate-800">
                      Item Name
                    </th>
                    <th className="text-left py-6 px-8 font-bold text-slate-800">
                      Category
                    </th>
                    <th className="text-left py-6 px-8 font-bold text-slate-800">
                      Branch
                    </th>
                    <th className="text-left py-6 px-8 font-bold text-slate-800">
                      Order Type
                    </th>
                    <th className="text-center py-6 px-8 font-bold text-slate-800">
                      Qty Sold
                    </th>
                    <th className="text-right py-6 px-8 font-bold text-slate-800">
                      Unit Price
                    </th>
                    <th className="text-right py-6 px-8 font-bold text-slate-800">
                      Total Revenue
                    </th>
                    <th className="text-center py-6 px-8 font-bold text-slate-800">
                      Peak Time/Day
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-200 hover:bg-blue-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-6 px-8">
                        <div className="font-semibold text-slate-800 text-base">
                          {item.itemName}
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <Badge
                          variant="secondary"
                          className="font-semibold bg-blue-100 text-blue-700 border-blue-200"
                        >
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-6 px-8">
                        <Badge
                          variant="accent"
                          className="font-semibold bg-purple-100 text-purple-700 border-purple-200"
                        >
                          {item.branch}
                        </Badge>
                      </td>
                      <td className="py-6 px-8">
                        <Badge variant="default" className="font-semibold">
                          {item.orderType.charAt(0).toUpperCase() +
                            item.orderType.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-6 px-8 text-center font-bold text-slate-800 text-base">
                        {item.quantitySold.toLocaleString()}
                      </td>
                      <td className="py-6 px-8 text-right text-slate-600 font-semibold">
                        ₹{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-6 px-8 text-right font-bold text-emerald-600 text-base">
                        ₹{item.totalRevenue.toLocaleString()}
                      </td>
                      <td className="py-6 px-8 text-center text-sm text-slate-600 font-medium">
                        {item.topSellingTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-6">
                  <Package className="h-16 w-16 text-slate-400 mx-auto" />
                </div>
                <p className="text-slate-600 text-lg font-medium">
                  No items found matching your search criteria.
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Try adjusting your filters or search terms.
                </p>
                <div className="mt-4 text-xs text-slate-400">
                  Debug: {allOrders.length} total items processed |{" "}
                  {menuItems.length} menu items
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-16">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Generating report...</p>
              </div>
            )}

            {filteredData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemSalesReport;
