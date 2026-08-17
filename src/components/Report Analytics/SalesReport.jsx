// "use client";

// import { useState, useMemo, useEffect } from "react";
// import {
//   TrendingUp,
//   Download,
//   Building2,
//   ShoppingCart,
//   Filter,
//   FileText,
//   PieChart,
//   IndianRupee,
//   Calendar,
//   Target,
//   Award,
//   MapPin,
//   Utensils,
//   Coffee,
//   Smartphone,
//   RefreshCw,
//   ChevronDown,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// const SalesReport = () => {
//   // State management
//   const [selectedBranch, setSelectedBranch] = useState("all");
//   const [selectedOrderType, setSelectedOrderType] = useState("all");
//   const [dateFilter, setDateFilter] = useState("daily");
//   const [customDateFrom, setCustomDateFrom] = useState("");
//   const [customDateTo, setCustomDateTo] = useState("");
//   const [salesData, setSalesData] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [expandedRows, setExpandedRows] = useState({});
//   const [loading, setLoading] = useState(true);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   const orderTypes = [
//     { id: "all", name: "All Order Types", icon: ShoppingCart },
//     { id: "online", name: "Online Order", icon: Smartphone },
//     { id: "darshani", name: "Darshani Order", icon: Coffee },
//     { id: "restaurant", name: "Restaurant Order", icon: Utensils },
//   ];

//   // Fetch data from APIs
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Fetch branches
//         const branchResponse = await fetch(
//           "https://crm.jagalikoota.com/api/v1/hotel/branch"
//         );
//         const branchData = await branchResponse.json();

//         const branchList = Array.isArray(branchData) ? branchData : [];
//         setBranches([
//           { id: "all", name: "All Branches", icon: Building2 },
//           ...branchList.map((branch) => ({
//             id: branch._id,
//             name: branch.name,
//             icon: MapPin,
//           })),
//         ]);

//         // Fetch online orders
//         const onlineResponse = await fetch(
//           "https://crm.jagalikoota.com/api/v1/hotel/order"
//         );
//         const onlineData = await onlineResponse.json();
//         const onlineOrders = (onlineData.data || []).map((order) => ({
//           id: order._id,
//           date: order.createdAt,
//           branch: order.branchId?._id || order.branchId,
//           orderType: "online",
//           customerName: order.name || order.userId?.name || "Unknown",
//           total: order.total || 0,
//           paymentStatus: order.paymentStatus || "unknown",
//           items: (order.items || []).map((item) => ({
//             name: item.name,
//             quantity: item.quantity || 0,
//             price: item.price || 0,
//             amount: (item.price || 0) * (item.quantity || 0),
//           })),
//         }));

//         // Fetch restaurant orders
//         const restaurantResponse = await fetch(
//           "https://crm.jagalikoota.com/api/v1/hotel/staff-order"
//         );
//         const restaurantData = await restaurantResponse.json();
//         const restaurantOrders = (restaurantData.orders || []).map((order) => ({
//           id: order._id,
//           date: order.orderTime || order.createdAt,
//           branch: order.branchId?._id || order.branchId,
//           orderType: "restaurant",
//           customerName: order.userId?.name || "Unknown",
//           total: order.grandTotal || order.totalAmount || 0,
//           paymentStatus: order.paymentStatus || "unknown",
//           items: (order.items || []).map((item) => ({
//             name: item.name,
//             quantity: item.quantity || 0,
//             price: item.price || 0,
//             amount: (item.price || 0) * (item.quantity || 0),
//           })),
//         }));

//         // Fetch darshani orders
//         const darshaniResponse = await fetch(
//           "https://crm.jagalikoota.com/api/v1/hotel/counter-order/orders"
//         );
//         const darshaniData = await darshaniResponse.json();
//         const darshaniOrders = (darshaniData.orders || []).map((order) => ({
//           id: order.id || order._id,
//           date: order.createdAt,
//           branch: order.branch?.id || order.branchId,
//           orderType: "darshani",
//           customerName: order.customerName || "Unknown",
//           total: order.grandTotal || order.totalAmount || 0,
//           paymentStatus: order.paymentStatus || "unknown",
//           items: (order.items || []).map((item) => ({
//             name: item.name,
//             quantity: item.quantity || 0,
//             price: item.price || 0,
//             amount: (item.price || 0) * (item.quantity || 0),
//           })),
//         }));

//         // Combine all orders
//         setSalesData([...onlineOrders, ...restaurantOrders, ...darshaniOrders]);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleReset = () => {
//     setSelectedBranch("all");
//     setSelectedOrderType("all");
//     setDateFilter("daily");
//     setCustomDateFrom("");
//     setCustomDateTo("");
//     setExpandedRows({});
//     setCurrentPage(1); // Reset to first page when filters are reset
//   };

//   // Toggle row expansion
//   const toggleRow = (id) => {
//     setExpandedRows((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   // Filter data based on selections
//   const filteredData = useMemo(() => {
//     let filtered = salesData;

//     // Filter by branch
//     if (selectedBranch !== "all") {
//       filtered = filtered.filter((item) => item.branch === selectedBranch);
//     }

//     // Filter by order type
//     if (selectedOrderType !== "all") {
//       filtered = filtered.filter(
//         (item) => item.orderType === selectedOrderType
//       );
//     }

//     // Filter by date
//     const today = new Date();
//     filtered = filtered.filter((item) => {
//       const itemDate = new Date(item.date);

//       switch (dateFilter) {
//         case "daily":
//           return itemDate.toDateString() === today.toDateString();
//         case "weekly":
//           const weekAgo = new Date(today);
//           weekAgo.setDate(today.getDate() - 7);
//           return itemDate >= weekAgo && itemDate <= today;
//         case "monthly":
//           const monthAgo = new Date(today);
//           monthAgo.setMonth(today.getMonth() - 1);
//           return itemDate >= monthAgo && itemDate <= today;
//         case "custom":
//           if (customDateFrom && customDateTo) {
//             const fromDate = new Date(customDateFrom);
//             const toDate = new Date(customDateTo);
//             toDate.setHours(23, 59, 59, 999); // Include entire end date
//             return itemDate >= fromDate && itemDate <= toDate;
//           }
//           return true;
//         default:
//           return true;
//       }
//     });

//     // Reset to first page when filters change
//     setCurrentPage(1);

//     return filtered;
//   }, [
//     salesData,
//     selectedBranch,
//     selectedOrderType,
//     dateFilter,
//     customDateFrom,
//     customDateTo,
//   ]);

//   // Calculate analytics
//   const analytics = useMemo(() => {
//     const totalSales = filteredData.reduce(
//       (sum, item) => sum + (item.total || 0),
//       0
//     );
//     const totalOrders = filteredData.length;
//     const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

//     return {
//       totalSales,
//       totalOrders,
//       averageOrderValue,
//     };
//   }, [filteredData]);

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   // Change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxPagesToShow = 5;

//     if (totalPages <= maxPagesToShow) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = totalPages - 3; i <= totalPages; i++) {
//           pageNumbers.push(i);
//         }
//       } else {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       }
//     }

//     return pageNumbers;
//   };

//   const generatePDFReport = () => {
//     const reportContent = `
//       <html>
//         <head>
//           <title>Sales Report</title>
//           <style>
//             body {
//               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//               margin: 20px;
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//               color: #333;
//             }
//             .container {
//               background: white;
//               padding: 30px;
//               border-radius: 15px;
//               box-shadow: 0 20px 40px rgba(0,0,0,0.1);
//             }
//             .header {
//               text-align: center;
//               margin-bottom: 40px;
//               border-bottom: 3px solid #667eea;
//               padding-bottom: 20px;
//             }
//             .header h1 {
//               color: #667eea;
//               font-size: 2.5em;
//               margin: 0;
//               text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
//             }
//             .filters {
//               background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
//               padding: 20px;
//               margin-bottom: 30px;
//               border-radius: 10px;
//               border-left: 5px solid #667eea;
//             }
//             .summary {
//               display: grid;
//               grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//               gap: 20px;
//               margin-bottom: 40px;
//             }
//             .summary-card {
//               text-align: center;
//               padding: 25px;
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//               color: white;
//               border-radius: 15px;
//               box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
//               transform: translateY(0);
//               transition: transform 0.3s ease;
//             }
//             .summary-card:hover {
//               transform: translateY(-5px);
//             }
//             .summary-card h3 {
//               margin: 0 0 10px 0;
//               font-size: 1.1em;
//               opacity: 0.9;
//             }
//             .summary-card p {
//               margin: 0;
//               font-size: 2em;
//               font-weight: bold;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin-top: 20px;
//               border-radius: 10px;
//               overflow: hidden;
//               box-shadow: 0 10px 20px rgba(0,0,0,0.1);
//             }
//             th, td {
//               border: none;
//               padding: 15px 12px;
//               text-align: left;
//             }
//             th {
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//               color: white;
//               font-weight: 600;
//               text-transform: uppercase;
//               font-size: 0.9em;
//               letter-spacing: 0.5px;
//             }
//             tr:nth-child(even) {
//               background-color: #f8f9ff;
//             }
//             tr:hover {
//               background-color: #e8ecff;
//             }
//             .total-row {
//               font-weight: bold;
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
//               color: white;
//             }
//             .rupee-symbol {
//               font-weight: bold;
//               color: #667eea;
//             }
//             .sub-table {
//               width: 80%;
//               margin: 10px auto;
//               border-collapse: collapse;
//               background: #f1f5f9;
//             }
//             .sub-table th, .sub-table td {
//               padding: 10px;
//               border: 1px solid #e2e8f0;
//             }
//             .sub-table th {
//               background: #e2e8f0;
//               color: #333;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>🍽️ Restaurant Sales Report</h1>
//               <p style="font-size: 1.2em; color: #666; margin: 10px 0 0 0;">Generated on: ${new Date().toLocaleDateString(
//                 "en-IN"
//               )}</p>
//             </div>

//             <div class="filters">
//               <h3 style="color: #667eea; margin-top: 0;">📊 Report Filters:</h3>
//               <p><strong>🏢 Branch:</strong> ${
//                 branches.find((b) => b.id === selectedBranch)?.name ||
//                 "All Branches"
//               }</p>
//               <p><strong>🛒 Order Type:</strong> ${
//                 orderTypes.find((o) => o.id === selectedOrderType)?.name ||
//                 "All Order Types"
//               }</p>
//               <p><strong>📅 Date Range:</strong> ${
//                 dateFilter === "custom"
//                   ? `${customDateFrom} to ${customDateTo}`
//                   : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)
//               }</p>
//             </div>

//             <div class="summary">
//               <div class="summary-card">
//                 <h3>💰 Total Sales</h3>
//                 <p><span class="rupee-symbol">₹</span>${analytics.totalSales.toLocaleString(
//                   "en-IN",
//                   { minimumFractionDigits: 2 }
//                 )}</p>
//               </div>
//               <div class="summary-card">
//                 <h3>📦 Total Orders</h3>
//                 <p>${analytics.totalOrders}</p>
//               </div>
//               <div class="summary-card">
//                 <h3>📊 Avg Order Value</h3>
//                 <p><span class="rupee-symbol">₹</span>${analytics.averageOrderValue.toLocaleString(
//                   "en-IN",
//                   { minimumFractionDigits: 2 }
//                 )}</p>
//               </div>
//             </div>

//             <table>
//               <thead>
//                 <tr>
//                   <th>📅 Date</th>
//                   <th>🏢 Branch</th>
//                   <th>🛒 Order Type</th>
//                   <th>👤 Customer</th>
//                   <th>💰 Total</th>
//                   <th>💳 Payment Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${filteredData
//                   .map(
//                     (item) => `
//                   <tr>
//                     <td>${new Date(item.date).toLocaleDateString("en-IN")}</td>
//                     <td>${
//                       branches.find((b) => b.id === item.branch)?.name ||
//                       item.branch
//                     }</td>
//                     <td>${
//                       orderTypes.find((o) => o.id === item.orderType)?.name ||
//                       item.orderType
//                     }</td>
//                     <td>${item.customerName}</td>
//                     <td><span class="rupee-symbol">₹</span>${item.total.toLocaleString(
//                       "en-IN",
//                       { minimumFractionDigits: 2 }
//                     )}</td>
//                     <td>${
//                       item.paymentStatus.charAt(0).toUpperCase() +
//                       item.paymentStatus.slice(1)
//                     }</td>
//                   </tr>
//                   <tr>
//                     <td colspan="6">
//                       <table class="sub-table">
//                         <thead>
//                           <tr>
//                             <th>Item Name</th>
//                             <th>Qty</th>
//                             <th>Rate</th>
//                             <th>Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           ${item.items
//                             .map(
//                               (subItem) => `
//                             <tr>
//                               <td>${subItem.name}</td>
//                               <td>${subItem.quantity}</td>
//                               <td><span class="rupee-symbol">₹</span>${subItem.price.toLocaleString(
//                                 "en-IN",
//                                 { minimumFractionDigits: 2 }
//                               )}</td>
//                               <td><span class="rupee-symbol">₹</span>${subItem.amount.toLocaleString(
//                                 "en-IN",
//                                 { minimumFractionDigits: 2 }
//                               )}</td>
//                             </tr>
//                           `
//                             )
//                             .join("")}
//                           <tr>
//                             <td colspan="3"><strong>Subtotal</strong></td>
//                             <td><strong><span class="rupee-symbol">₹</span>${item.items
//                               .reduce((sum, subItem) => sum + subItem.amount, 0)
//                               .toLocaleString("en-IN", {
//                                 minimumFractionDigits: 2,
//                               })}</strong></td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </td>
//                   </tr>
//                 `
//                   )
//                   .join("")}
//                 <tr class="total-row">
//                   <td colspan="4"><strong>🎯 TOTALS</strong></td>
//                   <td><strong><span class="rupee-symbol">₹</span>${analytics.totalSales.toLocaleString(
//                     "en-IN",
//                     { minimumFractionDigits: 2 }
//                   )}</strong></td>
//                   <td></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </body>
//       </html>
//     `;

//     const printWindow = window.open("", "_blank");
//     printWindow.document.write(reportContent);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const StatCard = ({
//     title,
//     value,
//     icon: Icon,
//     subtitle,
//     color = "primary",
//     gradient = false,
//   }) => (
//     <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden relative">
//       <div
//         className={`absolute inset-0 ${
//           gradient ? "bg-gradient-to-br from-primary/10 to-secondary/10" : ""
//         }`}
//       />
//       <CardContent className="p-6 relative">
//         <div className="flex items-center justify-between">
//           <div className="flex-1">
//             <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
//               <Icon className="h-4 w-4" />
//               {title}
//             </p>
//             <p
//               className={`text-3xl font-bold mb-1 ${
//                 color === "success"
//                   ? "text-emerald-600"
//                   : color === "warning"
//                   ? "text-amber-600"
//                   : color === "danger"
//                   ? "text-red-600"
//                   : "text-primary"
//               }`}>
//               {value}
//             </p>
//             {subtitle && (
//               <p className="text-xs text-muted-foreground">{subtitle}</p>
//             )}
//           </div>
//           <div
//             className={`p-3 rounded-full ${
//               color === "success"
//                 ? "bg-emerald-100 text-emerald-600"
//                 : color === "warning"
//                 ? "bg-amber-100 text-amber-600"
//                 : color === "danger"
//                 ? "bg-red-100 text-red-600"
//                 : "bg-primary/10 text-primary"
//             }`}>
//             <Icon className="h-8 w-8" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 p-4 md:p-6 flex items-center justify-center">
//         <div className="text-center">
//           <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
//           <p className="text-xl font-semibold">Loading sales data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8 text-center">
//           <div className="inline-flex items-center gap-3 mb-4">
//             <div className="p-3 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl shadow-lg">
//               <FileText className="h-10 w-10 text-purple" />
//             </div>
//             <div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text">
//                 Restaurant Sales Report
//               </h1>
//               <p className="text-muted-foreground text-lg mt-1">
//                 Comprehensive sales analytics for your restaurant business
//               </p>
//             </div>
//           </div>
//         </div>

//         <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-3 text-xl">
//               <div className="p-2 bg-primary/10 rounded-lg">
//                 <Filter className="h-6 w-6 text-primary" />
//               </div>
//               Report Filters
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             <div className="max-h-64 ">
//               <div className="grid  md:grid-cols-2 lg:grid-cols-5 gap-6">
//                 {/* Branch Selection */}
//                 <div className="space-y-3">
//                   <Label
//                     htmlFor="branch-select"
//                     className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <Building2 className="h-4 w-4 text-primary" />
//                     Branch Location
//                   </Label>
//                   <Select
//                     value={selectedBranch}
//                     onValueChange={setSelectedBranch}>
//                     <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
//                       <SelectValue placeholder="Select branch" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white rounded-lg shadow">
//                       {branches.map((branch) => {
//                         const IconComponent = branch.icon;
//                         return (
//                           <SelectItem
//                             key={branch.id}
//                             value={branch.id}
//                             className="flex items-center gap-2">
//                             <IconComponent className="h-4 w-4" />
//                             {branch.name}
//                           </SelectItem>
//                         );
//                       })}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Order Type Selection */}
//                 <div className="space-y-3">
//                   <Label
//                     htmlFor="order-type-select"
//                     className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <ShoppingCart className="h-4 w-4 text-secondary" />
//                     Order Type
//                   </Label>
//                   <Select
//                     value={selectedOrderType}
//                     onValueChange={setSelectedOrderType}>
//                     <SelectTrigger className="border-2 hover:border-secondary/50 transition-colors">
//                       <SelectValue placeholder="Select order type" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white rounded-lg shadow">
//                       {orderTypes.map((type) => {
//                         const IconComponent = type.icon;
//                         return (
//                           <SelectItem
//                             key={type.id}
//                             value={type.id}
//                             className="flex items-center gap-2">
//                             <IconComponent className="h-4 w-4" />
//                             {type.name}
//                           </SelectItem>
//                         );
//                       })}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Date Filter */}
//                 <div className="space-y-3">
//                   <Label
//                     htmlFor="date-filter"
//                     className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <Calendar className="h-4 w-4 text-accent" />
//                     Time Period
//                   </Label>
//                   <Select value={dateFilter} onValueChange={setDateFilter}>
//                     <SelectTrigger className="border-2 hover:border-accent/50 transition-colors">
//                       <SelectValue placeholder="Select time period" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-white rounded-lg shadow">
//                       <SelectItem value="daily">📅 Daily</SelectItem>
//                       <SelectItem value="weekly">📊 Weekly</SelectItem>
//                       <SelectItem value="monthly">📈 Monthly</SelectItem>
//                       <SelectItem value="custom">🎯 Custom Range</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Reset Button */}
//                 <div className="space-y-3">
//                   <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <RefreshCw className="h-4 w-4 text-black-600" />
//                     Reset Filters
//                   </Label>
//                   <Button
//                     onClick={handleReset}
//                     className="w-30 bg-black-600 hover:bg-black-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
//                     <RefreshCw className="h-4 w-4 mr-2" />
//                     Reset
//                   </Button>
//                 </div>

//                 {/* PDF Export Button */}
//                 <div className="space-y-3">
//                   <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <Download className="h-4 w-4 text-emerald-600" />
//                     Export Report
//                   </Label>
//                   <Button
//                     onClick={generatePDFReport}
//                     className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
//                     <Download className="h-4 w-4 mr-2" />
//                     Download PDF
//                   </Button>
//                 </div>
//               </div>

//               {/* Custom Date Range */}
//               {dateFilter === "custom" && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
//                   <div className="space-y-3">
//                     <Label
//                       htmlFor="date-from"
//                       className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                       <Calendar className="h-4 w-4 text-primary" />
//                       From Date
//                     </Label>
//                     <Input
//                       id="date-from"
//                       type="date"
//                       value={customDateFrom}
//                       onChange={(e) => setCustomDateFrom(e.target.value)}
//                       className="border-2 hover:border-primary/50 transition-colors"
//                     />
//                   </div>
//                   <div className="space-y-3">
//                     <Label
//                       htmlFor="date-to"
//                       className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                       <Calendar className="h-4 w-4 text-secondary" />
//                       To Date
//                     </Label>
//                     <Input
//                       id="date-to"
//                       type="date"
//                       value={customDateTo}
//                       onChange={(e) => setCustomDateTo(e.target.value)}
//                       className="border-2 hover:border-secondary/50 transition-colors"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
//           <StatCard
//             title="Total Revenue"
//             value={`₹${analytics.totalSales.toLocaleString("en-IN", {
//               minimumFractionDigits: 2,
//             })}`}
//             icon={IndianRupee}
//             subtitle={`${analytics.totalOrders} orders processed`}
//             color="success"
//             gradient={true}
//           />
//           <StatCard
//             title="Total Orders"
//             value={analytics.totalOrders.toLocaleString("en-IN")}
//             icon={Target}
//             subtitle="Filtered results"
//             color="primary"
//             gradient={true}
//           />
//           <StatCard
//             title="Avg Order Value"
//             value={`₹${analytics.averageOrderValue.toLocaleString("en-IN", {
//               minimumFractionDigits: 2,
//             })}`}
//             icon={Award}
//             subtitle="Per order average"
//             color="warning"
//             gradient={true}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Sales by Branch */}
//           <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-primary/10 rounded-lg">
//                   <MapPin className="h-6 w-6 text-primary" />
//                 </div>
//                 Sales by Branch
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 {Object.entries(
//                   filteredData.reduce((acc, item) => {
//                     const branchName =
//                       branches.find((b) => b.id === item.branch)?.name ||
//                       item.branch;
//                     acc[branchName] = (acc[branchName] || 0) + item.total;
//                     return acc;
//                   }, {})
//                 ).map(([branch, total], index) => (
//                   <div
//                     key={branch}
//                     className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-3 h-3 rounded-full ${
//                           index % 4 === 0
//                             ? "bg-primary"
//                             : index % 4 === 1
//                             ? "bg-secondary"
//                             : index % 4 === 2
//                             ? "bg-accent"
//                             : "bg-emerald-500"
//                         }`}
//                       />
//                       <span className="font-semibold text-gray-700">
//                         {branch}
//                       </span>
//                     </div>
//                     <span className="text-primary font-bold text-lg">
//                       ₹
//                       {total.toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                       })}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Sales by Order Type */}
//           <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
//             <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10">
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-secondary/10 rounded-lg">
//                   <PieChart className="h-6 w-6 text-secondary" />
//                 </div>
//                 Sales by Order Type
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 {Object.entries(
//                   filteredData.reduce((acc, item) => {
//                     const typeName =
//                       orderTypes.find((o) => o.id === item.orderType)?.name ||
//                       item.orderType;
//                     acc[typeName] = (acc[typeName] || 0) + item.total;
//                     return acc;
//                   }, {})
//                 ).map(([type, total], index) => (
//                   <div
//                     key={type}
//                     className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`p-2 rounded-lg ${
//                           index % 3 === 0
//                             ? "bg-blue-100 text-blue-600"
//                             : index % 3 === 1
//                             ? "bg-green-100 text-green-600"
//                             : "bg-orange-100 text-orange-600"
//                         }`}>
//                         {index % 3 === 0 ? (
//                           <Smartphone className="h-4 w-4" />
//                         ) : index % 3 === 1 ? (
//                           <Coffee className="h-4 w-4" />
//                         ) : (
//                           <Utensils className="h-4 w-4" />
//                         )}
//                       </div>
//                       <span className="font-semibold text-gray-700">
//                         {type}
//                       </span>
//                     </div>
//                     <span className="text-secondary font-bold text-lg">
//                       ₹
//                       {total.toLocaleString("en-IN", {
//                         minimumFractionDigits: 2,
//                       })}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
//           <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
//             <CardTitle className="flex items-center gap-3 text-xl">
//               <div className="p-2 bg-primary/10 rounded-lg">
//                 <FileText className="h-6 w-6 text-primary" />
//               </div>
//               Detailed Sales Report
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="text-black">
//                     <th className="text-left p-4 font-semibold"></th>
//                     <th className="text-left p-4 font-semibold">📅 Date</th>
//                     <th className="text-left p-4 font-semibold">🏢 Branch</th>
//                     <th className="text-left p-4 font-semibold">
//                       🛒 Order Type
//                     </th>
//                     <th className="text-left p-4 font-semibold">👤 Customer</th>
//                     <th className="text-left p-4 font-semibold">💰 Total</th>
//                     <th className="text-left p-4 font-semibold">
//                       💳 Payment Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentItems.map((item, index) => (
//                     <>
//                       <tr
//                         key={item.id}
//                         className={`border-b hover:bg-blue-50/50 transition-colors ${
//                           index % 2 === 0 ? "bg-slate-50/30" : "bg-white"
//                         } cursor-pointer`}
//                         onClick={() => toggleRow(item.id)}>
//                         <td className="p-4">
//                           {expandedRows[item.id] ? (
//                             <ChevronUp className="h-4 w-4 text-primary" />
//                           ) : (
//                             <ChevronDown className="h-4 w-4 text-primary" />
//                           )}
//                         </td>
//                         <td className="p-4 font-medium">
//                           {new Date(item.date).toLocaleDateString("en-IN")}
//                         </td>
//                         <td className="p-4">
//                           {branches.find((b) => b.id === item.branch)?.name ||
//                             item.branch}
//                         </td>
//                         <td className="p-4">
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                               item.orderType === "online"
//                                 ? "bg-blue-100 text-blue-800"
//                                 : item.orderType === "darshani"
//                                 ? "bg-green-100 text-green-800"
//                                 : "bg-orange-100 text-orange-800"
//                             }`}>
//                             {orderTypes.find((o) => o.id === item.orderType)
//                               ?.name || item.orderType}
//                           </span>
//                         </td>
//                         <td className="p-4 text-gray-600">
//                           {item.customerName}
//                         </td>
//                         <td className="p-4 font-bold text-primary">
//                           ₹
//                           {item.total.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                         <td className="p-4 font-medium">
//                           {item.paymentStatus.charAt(0).toUpperCase() +
//                             item.paymentStatus.slice(1)}
//                         </td>
//                       </tr>
//                       {expandedRows[item.id] && (
//                         <tr>
//                           <td colSpan="7" className="p-4 bg-gray-50">
//                             <table className="w-full border-collapse">
//                               <thead>
//                                 <tr className="bg-gray-100">
//                                   <th className="p-2 text-left font-semibold">
//                                     Item Name
//                                   </th>
//                                   <th className="p-2 text-left font-semibold">
//                                     Qty
//                                   </th>
//                                   <th className="p-2 text-left font-semibold">
//                                     Rate
//                                   </th>
//                                   <th className="p-2 text-left font-semibold">
//                                     Amount
//                                   </th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {item.items.map((subItem, subIndex) => (
//                                   <tr key={subIndex} className="border-b">
//                                     <td className="p-2">{subItem.name}</td>
//                                     <td className="p-2">{subItem.quantity}</td>
//                                     <td className="p-2">
//                                       ₹
//                                       {subItem.price.toLocaleString("en-IN", {
//                                         minimumFractionDigits: 2,
//                                       })}
//                                     </td>
//                                     <td className="p-2">
//                                       ₹
//                                       {subItem.amount.toLocaleString("en-IN", {
//                                         minimumFractionDigits: 2,
//                                       })}
//                                     </td>
//                                   </tr>
//                                 ))}
//                                 <tr className="font-bold">
//                                   <td className="p-2" colSpan="3">
//                                     Subtotal
//                                   </td>
//                                   <td className="p-2">
//                                     ₹
//                                     {item.items
//                                       .reduce(
//                                         (sum, subItem) => sum + subItem.amount,
//                                         0
//                                       )
//                                       .toLocaleString("en-IN", {
//                                         minimumFractionDigits: 2,
//                                       })}
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </td>
//                         </tr>
//                       )}
//                     </>
//                   ))}
//                   {filteredData.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan="7"
//                         className="p-12 text-center text-muted-foreground">
//                         <div className="flex flex-col items-center gap-4">
//                           <FileText className="h-12 w-12 text-gray-300" />
//                           <p className="text-lg">
//                             No data found for the selected filters
//                           </p>
//                           <p className="text-sm">
//                             Try adjusting your filter criteria
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//                 {filteredData.length > 0 && (
//                   <tfoot>
//                     <tr className="text-black font-bold">
//                       <td colSpan="5" className="p-4 text-lg">
//                         🎯 TOTALS
//                       </td>
//                       <td className="p-4 text-lg">
//                         ₹
//                         {analytics.totalSales.toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td></td>
//                     </tr>
//                   </tfoot>
//                 )}
//               </table>
//             </div>

//             {/* Pagination Controls */}
//             {filteredData.length > itemsPerPage && (
//               <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-slate-50/50">
//                 <div className="text-sm text-muted-foreground">
//                   Showing {indexOfFirstItem + 1} to{" "}
//                   {Math.min(indexOfLastItem, filteredData.length)} of{" "}
//                   {filteredData.length} entries
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => paginate(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="flex items-center gap-1">
//                     <ChevronLeft className="h-4 w-4" />
//                     Previous
//                   </Button>

//                   <div className="flex space-x-1">
//                     {getPageNumbers().map((pageNumber, index) => (
//                       <button
//                         key={index}
//                         onClick={() =>
//                           typeof pageNumber === "number" && paginate(pageNumber)
//                         }
//                         className={`px-3 py-1 text-sm rounded-md ${
//                           pageNumber === currentPage
//                             ? "bg-primary text-white"
//                             : pageNumber === "..."
//                             ? "text-gray-500 cursor-default"
//                             : "text-gray-700 hover:bg-gray-100"
//                         }`}
//                         disabled={pageNumber === "..."}>
//                         {pageNumber}
//                       </button>
//                     ))}
//                   </div>

//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => paginate(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className="flex items-center gap-1">
//                     Next
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default SalesReport;

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Download,
  Building2,
  ShoppingCart,
  Filter,
  FileText,
  PieChart,
  IndianRupee,
  Calendar,
  Target,
  Award,
  MapPin,
  Utensils,
  Coffee,
  Smartphone,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SalesReport = () => {
  // State management
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("monthly");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const orderTypes = [
    { id: "all", name: "All Order Types", icon: ShoppingCart },
    { id: "online", name: "Online Order", icon: Smartphone },
    { id: "darshani", name: "Darshani Order", icon: Coffee },
    { id: "restaurant", name: "Restaurant Order", icon: Utensils },
  ];

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch branches
        const branchResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/branch"
        );
        const branchData = await branchResponse.json();

        const branchList = Array.isArray(branchData) ? branchData : [];
        setBranches([
          { id: "all", name: "All Branches", icon: Building2 },
          ...branchList.map((branch) => ({
            id: branch._id,
            name: branch.name,
            icon: MapPin,
          })),
        ]);

        // Fetch categories
        const categoryResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/category"
        );
        const categoryData = await categoryResponse.json();

        const categoryList = Array.isArray(categoryData) ? categoryData : [];
        setCategories([
          { id: "all", name: "All Categories", icon: ShoppingCart },
          ...categoryList.map((category) => ({
            id: category._id,
            name: category.name,
            icon: category.name.toLowerCase().includes("temple") ? Coffee :
                  category.name.toLowerCase().includes("self") ? Smartphone : Utensils,
          })),
        ]);

        // Fetch online orders
        const onlineResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/order"
        );
        const onlineData = await onlineResponse.json();
        const onlineOrders = (onlineData.data || []).map((order) => ({
          id: order._id,
          date: order.createdAt,
          branch: order.branchId?._id || order.branchId,
          orderType: "online",
          categoryName: "Online Order",
          customerName: order.name || order.userId?.name || "Unknown",
          total: order.total || 0,
          paymentStatus: order.paymentStatus || "unknown",
          items: (order.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity || 0,
            price: item.price || 0,
            amount: (item.price || 0) * (item.quantity || 0),
          })),
        }));

        // Fetch restaurant orders
        const restaurantResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/staff-order"
        );
        const restaurantData = await restaurantResponse.json();
        const restaurantOrders = (restaurantData.orders || []).map((order) => ({
          id: order._id,
          date: order.orderTime || order.createdAt,
          branch: order.branchId?._id || order.branchId,
          orderType: "restaurant",
          categoryId: order.categoryId,
          categoryName: order.categoryName || "Uncategorized",
          customerName: order.customerName || order.userId?.name || "Unknown",
          total: order.grandTotal || order.totalAmount || 0,
          paymentStatus: order.paymentStatus || "unknown",
          items: (order.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity || 0,
            price: item.price || 0,
            amount: (item.price || 0) * (item.quantity || 0),
          })),
        }));

        // Fetch darshani orders
        const darshaniResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/counter-order/orders"
        );
        const darshaniData = await darshaniResponse.json();
        const darshaniOrders = (darshaniData.orders || []).map((order) => ({
          id: order.id || order._id,
          date: order.createdAt,
          branch: order.branch?.id || order.branchId,
          orderType: "darshani",
          categoryName: "Darshani Order",
          customerName: order.customerName || "Unknown",
          total: order.grandTotal || order.totalAmount || 0,
          paymentStatus: order.paymentStatus || "unknown",
          items: (order.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity || 0,
            price: item.price || 0,
            amount: (item.price || 0) * (item.quantity || 0),
          })),
        }));

        // Combine all orders
        const allOrders = [...onlineOrders, ...restaurantOrders, ...darshaniOrders];
        console.log("Total orders fetched:", allOrders.length);
        console.log("Restaurant orders:", restaurantOrders.length);
        console.log("Sample restaurant order:", restaurantOrders[0]);
        setSalesData(allOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReset = () => {
    setSelectedBranch("all");
    setSelectedCategory("all");
    setDateFilter("monthly");
    setCustomDateFrom("");
    setCustomDateTo("");
    setExpandedRows({});
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Toggle row expansion
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = salesData;
    console.log("Starting filter with", salesData.length, "orders");

    // Filter by branch
    if (selectedBranch !== "all") {
      filtered = filtered.filter((item) => item.branch === selectedBranch);
      console.log("After branch filter:", filtered.length);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;
      console.log("Filtering by category:", selectedCategoryName);
      filtered = filtered.filter((item) => {
        // Check if item has categoryName and it matches the selected category
        return item.categoryName === selectedCategoryName;
      });
      console.log("After category filter:", filtered.length);
    }

    // Filter by date
    const today = new Date();
    console.log("Date filter:", dateFilter, "Today:", today.toDateString());
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date);

      switch (dateFilter) {
        case "daily":
          const isToday = itemDate.toDateString() === today.toDateString();
          if (!isToday && filtered.length < 5) {
            console.log("Order date:", itemDate.toDateString(), "vs Today:", today.toDateString());
          }
          return isToday;
        case "weekly":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return itemDate >= weekAgo && itemDate <= today;
        case "monthly":
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return itemDate >= monthAgo && itemDate <= today;
        case "custom":
          if (customDateFrom && customDateTo) {
            const fromDate = new Date(customDateFrom);
            const toDate = new Date(customDateTo);
            toDate.setHours(23, 59, 59, 999); // Include entire end date
            return itemDate >= fromDate && itemDate <= toDate;
          }
          return true;
        default:
          return true;
      }
    });

    console.log("After date filter:", filtered.length);

    // Reset to first page when filters change
    setCurrentPage(1);

    return filtered;
  }, [
    salesData,
    selectedBranch,
    selectedCategory,
    categories,
    dateFilter,
    customDateFrom,
    customDateTo,
  ]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalSales = filteredData.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const totalOrders = filteredData.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
    };
  }, [filteredData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const generatePDFReport = () => {
    const reportContent = `
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              background: #69231B;
              color: #333;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #667eea;
              font-size: 2.5em;
              margin: 0;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .filters { 
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
              padding: 20px; 
              margin-bottom: 30px; 
              border-radius: 10px;
              border-left: 5px solid #667eea;
            }
            .summary { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-bottom: 40px; 
            }
            .summary-card { 
              text-align: center; 
              padding: 25px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white;
              border-radius: 15px; 
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
              transform: translateY(0);
              transition: transform 0.3s ease;
            }
            .summary-card:hover {
              transform: translateY(-5px);
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 1.1em;
              opacity: 0.9;
            }
            .summary-card p {
              margin: 0;
              font-size: 2em;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            th, td { 
              border: none; 
              padding: 15px 12px; 
              text-align: left; 
            }
            th { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              font-weight: 600;
              text-transform: uppercase;
              font-size: 0.9em;
              letter-spacing: 0.5px;
            }
            tr:nth-child(even) {
              background-color: #f8f9ff;
            }
            tr:hover {
              background-color: #e8ecff;
            }
            .total-row { 
              font-weight: bold; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; 
              color: white;
            }
            .rupee-symbol {
              font-weight: bold;
              color: #667eea;
            }
            .sub-table {
              width: 80%;
              margin: 10px auto;
              border-collapse: collapse;
              background: #f1f5f9;
            }
            .sub-table th, .sub-table td {
              padding: 10px;
              border: 1px solid #e2e8f0;
            }
            .sub-table th {
              background: #e2e8f0;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Restaurant Sales Report</h1>
              <p style="font-size: 1.2em; color: #666; margin: 10px 0 0 0;">Generated on: ${new Date().toLocaleDateString(
                "en-IN"
              )}</p>
            </div>
            
            <div class="filters">
              <h3 style="color: #667eea; margin-top: 0;">📊 Report Filters:</h3>
              <p><strong>🏢 Branch:</strong> ${
                branches.find((b) => b.id === selectedBranch)?.name ||
                "All Branches"
              }</p>
              <p><strong>🏷️ Category:</strong> ${
                categories.find((c) => c.id === selectedCategory)?.name ||
                "All Categories"
              }</p>
              <p><strong>📅 Date Range:</strong> ${
                dateFilter === "custom"
                  ? `${customDateFrom} to ${customDateTo}`
                  : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)
              }</p>
            </div>

            <div class="summary">
              <div class="summary-card">
                <h3>💰 Total Sales</h3>
                <p><span class="rupee-symbol">₹</span>${analytics.totalSales.toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                )}</p>
              </div>
              <div class="summary-card">
                <h3>📦 Total Orders</h3>
                <p>${analytics.totalOrders}</p>
              </div>
              <div class="summary-card">
                <h3>📊 Avg Order Value</h3>
                <p><span class="rupee-symbol">₹</span>${analytics.averageOrderValue.toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                )}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>📅 Date</th>
                  <th>🏢 Branch</th>
                  <th>🏷️ Category</th>
                  <th>👤 Customer</th>
                  <th>💰 Total</th>
                  <th>💳 Payment Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData
                  .map(
                    (item) => `
                  <tr>
                    <td>${new Date(item.date).toLocaleDateString("en-IN")}</td>
                    <td>${
                      branches.find((b) => b.id === item.branch)?.name ||
                      item.branch
                    }</td>
                    <td>${item.categoryName || "Uncategorized"}</td>
                    <td>${item.customerName}</td>
                    <td><span class="rupee-symbol">₹</span>${item.total.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 }
                    )}</td>
                    <td>${
                      item.paymentStatus.charAt(0).toUpperCase() +
                      item.paymentStatus.slice(1)
                    }</td>
                  </tr>
                  <tr>
                    <td colspan="6">
                      <table class="sub-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${item.items
                            .map(
                              (subItem) => `
                            <tr>
                              <td>${subItem.name}</td>
                              <td>${subItem.quantity}</td>
                              <td><span class="rupee-symbol">₹</span>${subItem.price.toLocaleString(
                                "en-IN",
                                { minimumFractionDigits: 2 }
                              )}</td>
                              <td><span class="rupee-symbol">₹</span>${subItem.amount.toLocaleString(
                                "en-IN",
                                { minimumFractionDigits: 2 }
                              )}</td>
                            </tr>
                          `
                            )
                            .join("")}
                          <tr>
                            <td colspan="3"><strong>Subtotal</strong></td>
                            <td><strong><span class="rupee-symbol">₹</span>${item.items
                              .reduce((sum, subItem) => sum + subItem.amount, 0)
                              .toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}</strong></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="4"><strong>🎯 TOTALS</strong></td>
                  <td><strong><span class="rupee-symbol">₹</span>${analytics.totalSales.toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2 }
                  )}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    color = "primary",
    gradient = false,
  }) => (
    <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden relative">
      <div
        className={`absolute inset-0 ${
          gradient ? "bg-gradient-to-br from-primary/10 to-secondary/10" : ""
        }`}
      />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </p>
            <p
              className={`text-3xl font-bold mb-1 ${
                color === "success"
                  ? "text-emerald-600"
                  : color === "warning"
                  ? "text-amber-600"
                  : color === "danger"
                  ? "text-red-600"
                  : "text-primary"
              }`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`p-3 rounded-full ${
              color === "success"
                ? "bg-emerald-100 text-emerald-600"
                : color === "warning"
                ? "bg-amber-100 text-amber-600"
                : color === "danger"
                ? "bg-red-100 text-red-600"
                : "bg-primary/10 text-primary"
            }`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#69231B" }} />
          <p className="text-xl font-semibold" style={{ color: "#69231B" }}>Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl shadow-lg" style={{ backgroundColor: "#69231B" }}>
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: "#69231B" }}>
                Restaurant Sales Report
              </h1>
              <p className="text-lg mt-1" style={{ color: "#69231B", opacity: 0.75 }}>
                Comprehensive sales analytics for your restaurant business
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-64 overflow-y-auto">
              {/* Main Filters Grid - Improved layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Branch Selection */}
                <div className="space-y-3">
                  <Label
                    htmlFor="branch-select"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building2 className="h-4 w-4 text-primary" />
                    Branch Location
                  </Label>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg shadow-lg max-h-60">
                      {branches.map((branch) => {
                        const IconComponent = branch.icon;
                        return (
                          <SelectItem
                            key={branch.id}
                            value={branch.id}
                            className="flex items-center gap-2 py-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="truncate">{branch.name}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label
                    htmlFor="category-select"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ShoppingCart className="h-4 w-4 text-secondary" />
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full border-2 hover:border-secondary/50 transition-colors">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg shadow-lg">
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="flex items-center gap-2 py-2">
                            <IconComponent className="h-4 w-4" />
                            {category.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-3">
                  <Label
                    htmlFor="date-filter"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="h-4 w-4 text-accent" />
                    Time Period
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full border-2 hover:border-accent/50 transition-colors">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg shadow-lg">
                      <SelectItem value="daily">📅 Daily</SelectItem>
                      <SelectItem value="weekly">📊 Weekly</SelectItem>
                      <SelectItem value="monthly">📈 Monthly</SelectItem>
                      <SelectItem value="custom">🎯 Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                    Actions
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReset}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={generatePDFReport}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateFilter === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <Label
                      htmlFor="date-from"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-primary" />
                      From Date
                    </Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-full border-2 hover:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="date-to"
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-secondary" />
                      To Date
                    </Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-full border-2 hover:border-secondary/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${analytics.totalSales.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`}
            icon={IndianRupee}
            subtitle={`${analytics.totalOrders} orders processed`}
            color="success"
            gradient={true}
          />
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders.toLocaleString("en-IN")}
            icon={Target}
            subtitle="Filtered results"
            color="primary"
            gradient={true}
          />
          <StatCard
            title="Avg Order Value"
            value={`₹${analytics.averageOrderValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`}
            icon={Award}
            subtitle="Per order average"
            color="warning"
            gradient={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Branch */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                Sales by Branch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(
                  filteredData.reduce((acc, item) => {
                    const branchName =
                      branches.find((b) => b.id === item.branch)?.name ||
                      item.branch;
                    acc[branchName] = (acc[branchName] || 0) + item.total;
                    return acc;
                  }, {})
                ).map(([branch, total], index) => (
                  <div
                    key={branch}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index % 4 === 0
                            ? "bg-primary"
                            : index % 4 === 1
                            ? "bg-secondary"
                            : index % 4 === 2
                            ? "bg-accent"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-semibold text-gray-700">
                        {branch}
                      </span>
                    </div>
                    <span className="text-primary font-bold text-lg">
                      ₹
                      {total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-secondary/10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <PieChart className="h-6 w-6 text-secondary" />
                </div>
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(
                  filteredData.reduce((acc, item) => {
                    const categoryName = item.categoryName || "Uncategorized";
                    acc[categoryName] = (acc[categoryName] || 0) + item.total;
                    return acc;
                  }, {})
                ).map(([category, total], index) => (
                  <div
                    key={category}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          index % 3 === 0
                            ? "bg-blue-100 text-blue-600"
                            : index % 3 === 1
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}>
                        {category.toLowerCase().includes("temple") ? (
                          <Coffee className="h-4 w-4" />
                        ) : category.toLowerCase().includes("self") ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Utensils className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-700">
                        {category}
                      </span>
                    </div>
                    <span className="text-secondary font-bold text-lg">
                      ₹
                      {total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              Detailed Sales Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-black">
                    <th className="text-left p-4 font-semibold"></th>
                    <th className="text-left p-4 font-semibold">📅 Date</th>
                    <th className="text-left p-4 font-semibold">🏢 Branch</th>
                    <th className="text-left p-4 font-semibold">
                      🏷️ Category
                    </th>
                    <th className="text-left p-4 font-semibold">👤 Customer</th>
                    <th className="text-left p-4 font-semibold">💰 Total</th>
                    <th className="text-left p-4 font-semibold">
                      💳 Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <>
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-blue-50/50 transition-colors ${
                          index % 2 === 0 ? "bg-slate-50/30" : "bg-white"
                        } cursor-pointer`}
                        onClick={() => toggleRow(item.id)}>
                        <td className="p-4">
                          {expandedRows[item.id] ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )}
                        </td>
                        <td className="p-4 font-medium">
                          {new Date(item.date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4">
                          {branches.find((b) => b.id === item.branch)?.name ||
                            item.branch}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.categoryName?.toLowerCase().includes("temple")
                                ? "bg-purple-100 text-purple-800"
                                : item.categoryName?.toLowerCase().includes("self")
                                ? "bg-blue-100 text-blue-800"
                                : item.categoryName?.toLowerCase().includes("restaurant")
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                            {item.categoryName || "Uncategorized"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.customerName}
                        </td>
                        <td className="p-4 font-bold text-primary">
                          ₹
                          {item.total.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-4 font-medium">
                          {item.paymentStatus.charAt(0).toUpperCase() +
                            item.paymentStatus.slice(1)}
                        </td>
                      </tr>
                      {expandedRows[item.id] && (
                        <tr>
                          <td colSpan="7" className="p-4 bg-gray-50">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="p-2 text-left font-semibold">
                                    Item Name
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    Qty
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    Rate
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.items.map((subItem, subIndex) => (
                                  <tr key={subIndex} className="border-b">
                                    <td className="p-2">{subItem.name}</td>
                                    <td className="p-2">{subItem.quantity}</td>
                                    <td className="p-2">
                                      ₹
                                      {subItem.price.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="p-2">
                                      ₹
                                      {subItem.amount.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="font-bold">
                                  <td className="p-2" colSpan="3">
                                    Subtotal
                                  </td>
                                  <td className="p-2">
                                    ₹
                                    {item.items
                                      .reduce(
                                        (sum, subItem) => sum + subItem.amount,
                                        0
                                      )
                                      .toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                      })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-4">
                          <FileText className="h-12 w-12 text-gray-300" />
                          <p className="text-lg">
                            No data found for the selected filters
                          </p>
                          <p className="text-sm">
                            Try adjusting your filter criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                {filteredData.length > 0 && (
                  <tfoot>
                    <tr className="text-black font-bold">
                      <td colSpan="5" className="p-4 text-lg">
                        🎯 TOTALS
                      </td>
                      <td className="p-4 text-lg">
                        ₹
                        {analytics.totalSales.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredData.length > itemsPerPage && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-slate-50/50">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          typeof pageNumber === "number" && paginate(pageNumber)
                        }
                        className={`px-3 py-1 text-sm rounded-md ${
                          pageNumber === currentPage
                            ? "bg-primary text-white"
                            : pageNumber === "..."
                            ? "text-gray-500 cursor-default"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        disabled={pageNumber === "..."}>
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesReport;
