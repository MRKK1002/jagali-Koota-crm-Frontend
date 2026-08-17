"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Download,
  MapPin,
  FileText,
  BarChart3,
  ShoppingCart,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChartIcon,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper functions defined at the top level
const getRandomColor = () => {
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff88",
    "#ff0088",
    "#8800ff",
    "#ff8800",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function PurchasesvsSalesvsExpenses() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch branches
        const branchesResponse = await fetch(
          "http://192.168.1.40:9000/api/v1/hotel/branch"
        );
        const branchesData = await branchesResponse.json();
        // Ensure we only store branch names as strings
        const branchNames = branchesData.map((branch) =>
          typeof branch === "string"
            ? branch
            : branch.name || branch.branchName || "Unknown Branch"
        );
        setBranches(branchNames);

        // Fetch orders from multiple endpoints
        const [staffOrdersRes, onlineOrdersRes, counterOrdersRes] =
          await Promise.all([
            fetch("http://192.168.1.40:9000/api/v1/hotel/staff-order"),
            fetch("http://192.168.1.40:9000/api/v1/hotel/order"),
            fetch("http://192.168.1.40:9000/api/v1/hotel/counter-order/orders"),
          ]);

        const staffOrders = await staffOrdersRes.json();
        const onlineOrders = await onlineOrdersRes.json();
        const counterOrders = await counterOrdersRes.json();

        // Process staff orders with category information
        const processedStaffOrders = (staffOrders.orders || []).map(order => ({
          ...order,
          categoryName: order.categoryName || "Uncategorized",
          orderType: "staff",
          total: order.grandTotal || order.totalAmount || 0,
          date: order.orderTime || order.createdAt,
        }));

        // Process online orders
        const processedOnlineOrders = (onlineOrders.data || []).map(order => ({
          ...order,
          categoryName: "Online Order",
          orderType: "online",
          total: order.total || 0,
          date: order.createdAt,
        }));

        // Process counter orders
        const processedCounterOrders = (counterOrders.orders || []).map(order => ({
          ...order,
          categoryName: "Counter Order",
          orderType: "counter",
          total: order.grandTotal || order.totalAmount || 0,
          date: order.createdAt,
        }));

        // Combine all orders
        const allOrders = [
          ...processedStaffOrders,
          ...processedOnlineOrders,
          ...processedCounterOrders,
        ];
        setOrders(allOrders);

        // Fetch purchase orders from Jagali Koota backend
        try {
          const purchaseResponse = await fetch(
            "http://192.168.1.40:9000/api/v1/hotel/purchase-orders"
          );
          if (purchaseResponse.ok) {
            const purchaseData = await purchaseResponse.json();
            setPurchaseOrders(purchaseData.data || purchaseData.purchaseOrders || purchaseData || []);
          } else {
            console.log("Purchase orders endpoint not available, using empty array");
            setPurchaseOrders([]);
          }
        } catch (err) {
          console.log("Error fetching purchase orders:", err.message);
          setPurchaseOrders([]);
        }

        // Fetch expenses - try multiple endpoints
        try {
          const expensesResponse = await fetch(
            "https://crm.jagalikoota.com/api/expenses"
          );
          if (expensesResponse.ok) {
            const expensesData = await expensesResponse.json();
            setExpenses(expensesData.data || expensesData.expenses || expensesData || []);
          } else {
            console.log("Expenses endpoint not available, using empty array");
            setExpenses([]);
          }
        } catch (err) {
          console.log("Error fetching expenses:", err.message);
          setExpenses([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const periods = [
    { id: "daily", name: "Daily", description: " " },
    { id: "weekly", name: "Weekly", description: " " },
    { id: "monthly", name: "Monthly", description: "" },
    { id: "quarterly", name: "Quarterly", description: " " },
    { id: "yearly", name: "Yearly", description: " " },
  ];

  // Helper functions defined inside the component but before useMemo
  const generateMonthlyData = (orders, purchases, expenses) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month) => {
      const monthSales = orders.reduce((sum, order) => {
        const orderDate = new Date(order.orderTime || order.createdAt);
        if (orderDate.toLocaleString("default", { month: "short" }) === month) {
          return sum + (order.grandTotal || order.total || 0);
        }
        return sum;
      }, 0);

      const monthPurchases = purchases.reduce((sum, po) => {
        const poDate = new Date(po.orderDate);
        if (poDate.toLocaleString("default", { month: "short" }) === month) {
          return sum + (po.total || 0);
        }
        return sum;
      }, 0);

      const monthExpenses = expenses.reduce((sum, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.toLocaleString("default", { month: "short" }) === month) {
          return sum + (exp.amount || 0);
        }
        return sum;
      }, 0);

      const profit = monthSales - monthPurchases - monthExpenses;

      return {
        month,
        sales: monthSales,
        purchases: monthPurchases,
        expenses: monthExpenses,
        profit,
        customers: Math.floor(Math.random() * 1000) + 500,
        orders: Math.floor(Math.random() * 200) + 100,
      };
    });
  };

  const generateBranchPerformance = (orders, branches) => {
    return branches.map((branch) => {
      const branchOrders = orders.filter((order) => {
        const orderBranch =
          order.branchName || order.branch?.name || order.branch;
        return (
          orderBranch &&
          orderBranch
            .toString()
            .toLowerCase()
            .includes(branch.toString().toLowerCase())
        );
      });

      const branchSales = branchOrders.reduce(
        (sum, order) => sum + (order.grandTotal || order.total || 0),
        0
      );

      return {
        name: branch,
        value: branchSales,
        color: getRandomColor(),
        employees: Math.floor(Math.random() * 20) + 10,
        rating: (Math.random() * 1 + 4).toFixed(1),
        speciality: "Various",
      };
    });
  };

  const generateDailyTrends = (orders, purchases, expenses) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => {
      const daySales = orders.reduce((sum, order) => {
        const orderDate = new Date(order.orderTime || order.createdAt);
        if (orderDate.toLocaleString("default", { weekday: "short" }) === day) {
          return sum + (order.grandTotal || order.total || 0);
        }
        return sum;
      }, 0);

      const dayPurchases = purchases.reduce((sum, po) => {
        const poDate = new Date(po.orderDate);
        if (poDate.toLocaleString("default", { weekday: "short" }) === day) {
          return sum + (po.total || 0);
        }
        return sum;
      }, 0);

      const dayExpenses = expenses.reduce((sum, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.toLocaleString("default", { weekday: "short" }) === day) {
          return sum + (exp.amount || 0);
        }
        return sum;
      }, 0);

      return {
        day,
        sales: daySales,
        purchases: dayPurchases,
        expenses: dayExpenses,
        customers: Math.floor(Math.random() * 100) + 50,
        orders: Math.floor(Math.random() * 50) + 20,
      };
    });
  };

  const generateReportData = (orders, purchases, expenses) => {
    const reportData = [];

    // Process orders
    orders.forEach((order) => {
      const date = new Date(order.orderTime || order.createdAt);
      const branchName =
        order.branchName || order.branch?.name || order.branch || "Unknown";
      const sales = order.grandTotal || order.total || 0;
      const orderPurchases = order.items
        ? order.items.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            return sum + price * quantity;
          }, 0)
        : 0;

      reportData.push({
        date: date.toISOString().split("T")[0],
        branch: branchName,
        totalPurchase: orderPurchases,
        totalSales: sales,
        totalExpenses: 0,
        profit: sales - orderPurchases,
        customers: order.peopleCount || Math.floor(Math.random() * 10) + 1,
        orders: 1,
        avgOrder: sales,
        topItem:
          order.items && order.items.length > 0
            ? order.items[0].name
            : "Various",
      });
    });

    // Process purchase orders
    purchases.forEach((po) => {
      const date = new Date(po.orderDate);
      const branchName = po.branchName || po.branch || "Unknown";
      const purchasesAmount = po.total || 0;

      reportData.push({
        date: date.toISOString().split("T")[0],
        branch: branchName,
        totalPurchase: purchasesAmount,
        totalSales: 0,
        totalExpenses: 0,
        profit: -purchasesAmount,
        customers: 0,
        orders: 1,
        avgOrder: 0,
        topItem:
          po.items && po.items.length > 0 ? po.items[0].name?.name : "Various",
      });
    });

    // Process expenses
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const branchName = exp.branch?.name || exp.branch || "Unknown";
      const expensesAmount = exp.amount || 0;

      reportData.push({
        date: date.toISOString().split("T")[0],
        branch: branchName,
        totalPurchase: 0,
        totalSales: 0,
        totalExpenses: expensesAmount,
        profit: -expensesAmount,
        customers: 0,
        orders: 1,
        avgOrder: 0,
        topItem: exp.type || "Expense",
      });
    });

    return reportData;
  };

  // Process and calculate data based on filters
  const processedData = useMemo(() => {
    if (loading)
      return {
        summaryData: {},
        monthlyData: [],
        branchPerformance: [],
        dailyTrends: [],
        reportData: [],
      };

    // Filter data based on selected branch - FIXED VERSION
    const filterByBranch = (data, branchField = "branchName") => {
      if (selectedBranch === "all") return data;
      return data.filter((item) => {
        const branchName =
          item[branchField] || item.branch?.name || item.branch;
        // Ensure branchName is treated as string
        const branchNameStr = branchName
          ? branchName.toString().toLowerCase()
          : "";
        const selectedBranchStr = selectedBranch.toString().toLowerCase();
        return branchNameStr.includes(selectedBranchStr);
      });
    };

    // Filter by date range
    const filterByDate = (data, dateField = "createdAt") => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return data.filter((item) => {
        const itemDate = new Date(
          item[dateField] || item.orderTime || item.date
        );
        return itemDate >= start && itemDate <= end;
      });
    };

    // Process orders data
    const filteredOrders = filterByDate(filterByBranch(orders, "branchName"));
    const filteredPurchases = filterByDate(
      filterByBranch(purchaseOrders, "branchName"),
      "orderDate"
    );
    const filteredExpenses = filterByDate(
      filterByBranch(expenses, "branch"),
      "date"
    );

    // Calculate summary data
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + (order.grandTotal || order.total || 0),
      0
    );
    const totalPurchases = filteredPurchases.reduce(
      (sum, po) => sum + (po.total || 0),
      0
    );
    const totalExpenses = filteredExpenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );
    const netProfit = totalSales - totalPurchases - totalExpenses;

    // Calculate growth percentages
    const salesGrowth = totalSales > 0 ? 12.5 : 0;
    const purchaseGrowth = totalPurchases > 0 ? -3.2 : 0;
    const expenseGrowth = totalExpenses > 0 ? 8.7 : 0;
    const profitGrowth = netProfit > 0 ? 18.9 : 0;

    const customerCount = filteredOrders.length;
    const avgOrderValue = customerCount > 0 ? totalSales / customerCount : 0;

    const summaryData = {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit,
      salesGrowth,
      purchaseGrowth,
      expenseGrowth,
      profitGrowth,
      customerCount,
      avgOrderValue,
      topSellingItem: "Grilled Salmon",
      bestPerformingBranch: branches.length > 0 ? branches[0] : "N/A",
    };

    // Generate chart data
    const monthlyData = generateMonthlyData(
      filteredOrders,
      filteredPurchases,
      filteredExpenses
    );
    const branchPerformance = generateBranchPerformance(
      filteredOrders,
      branches
    );
    const dailyTrends = generateDailyTrends(
      filteredOrders,
      filteredPurchases,
      filteredExpenses
    );
    const reportData = generateReportData(
      filteredOrders,
      filteredPurchases,
      filteredExpenses
    );

    return {
      summaryData,
      monthlyData,
      branchPerformance,
      dailyTrends,
      reportData,
    };
  }, [
    selectedBranch,
    startDate,
    endDate,
    orders,
    purchaseOrders,
    expenses,
    branches,
    loading,
  ]);

  // Filter data for table with pagination
  const filteredData = useMemo(() => {
    let data = processedData.reportData || [];

    if (selectedBranch !== "all") {
      data = data.filter((row) => {
        const rowBranch = row.branch ? row.branch.toString().toLowerCase() : "";
        const selectedBranchStr = selectedBranch.toString().toLowerCase();
        return rowBranch.includes(selectedBranchStr);
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      data = data.filter(
        (row) => new Date(row.date) >= start && new Date(row.date) <= end
      );
    }

    return data;
  }, [selectedBranch, startDate, endDate, processedData.reportData]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch, startDate, endDate]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add title and filter information
    doc.setFontSize(18);
    doc.text("Restaurant CRM Financial Report", 14, 20);
    doc.setFontSize(12);
    doc.text(
      `Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`,
      14,
      30
    );
    doc.text(
      `Period: ${periods.find((p) => p.id === selectedPeriod)?.name}`,
      14,
      36
    );
    doc.text(
      `Date Range: ${formatDate(startDate)} to ${formatDate(endDate)}`,
      14,
      42
    );

    // Prepare table data
    const tableData = filteredData.map((row) => [
      formatDate(row.date),
      row.branch,
      formatCurrency(row.totalPurchase),
      formatCurrency(row.totalSales),
      formatCurrency(row.totalExpenses),
      formatCurrency(row.profit),
      row.customers.toString(),
      row.orders.toString(),
      formatCurrency(row.avgOrder),
      row.topItem,
      row.profit < 0
        ? "Loss"
        : `${((row.profit / (row.totalSales || 1)) * 100).toFixed(1)}% margin`,
    ]);

    // Generate table in PDF
    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Date",
          "Branch",
          "Purchase",
          "Sales",
          "Expenses",
          "Profit",
          "Customers",
          "Orders",
          "Avg Order",
          "Top Item",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Save the PDF
    doc.save(
      `Restaurant_Report_${selectedBranch}_${selectedPeriod}_${startDate}_to_${endDate}.pdf`
    );
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
          {totalItems} records
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
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
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="itemsPerPage" className="text-sm">
            Items per page:
          </Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const summaryCards = [
    {
      title: "Total Sales",
      value: processedData.summaryData.totalSales || 0,
      icon: IndianRupee,
      growth: processedData.summaryData.salesGrowth || 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Revenue from all branches",
    },
    {
      title: "Total Purchases",
      value: processedData.summaryData.totalPurchases || 0,
      icon: ShoppingCart,
      growth: processedData.summaryData.purchaseGrowth || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Cost of goods sold",
    },
    {
      title: "Total Expenses",
      value: processedData.summaryData.totalExpenses || 0,
      icon: CreditCard,
      growth: processedData.summaryData.expenseGrowth || 0,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Operating expenses",
    },
    {
      title: "Net Profit",
      value: processedData.summaryData.netProfit || 0,
      icon: PiggyBank,
      growth: processedData.summaryData.profitGrowth || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total profit margin",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading financial data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Restaurant CRM Reports Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive financial reporting and analytics for all restaurant
              locations
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>📊 {branches.length} Active Branches</span>
              <span>
                👥{" "}
                {(
                  processedData.summaryData.customerCount || 0
                ).toLocaleString()}{" "}
                Total Customers
              </span>
              <span>
                🍽️{" "}
                {formatCurrency(processedData.summaryData.avgOrderValue || 0)}{" "}
                Avg Order Value
              </span>
              <span>
                ⭐ Best:{" "}
                {processedData.summaryData.bestPerformingBranch || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Live Dashboard</span>
            <Badge variant="green" className="bg-green-100 text-green-800">
              Online
            </Badge>
          </div>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Advanced Report Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 relative">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Branch Location
                </Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white" position="popper">
                    <SelectItem value="all">
                      🏢 All Branches ({branches.length})
                    </SelectItem>
                    {branches.map((branch, index) => (
                      <SelectItem key={index} value={branch}>
                        📍 {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="period" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Report Period
                </Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-white" position="popper">
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        📅 {period.name} - {period.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">📅 Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">📅 End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="w-full bg-transparent mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  📄 Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            const isPositiveGrowth = card.growth > 0;
            const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown;

            return (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(card.value)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        isPositiveGrowth ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <GrowthIcon className="h-3 w-3" />
                      {Math.abs(card.growth)}%
                    </div>
                    <span className="text-xs text-muted-foreground">
                      vs last period
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                📊 Monthly Financial Trends & Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="💰 Sales" />
                  <Bar dataKey="purchases" fill="#3b82f6" name="🛒 Purchases" />
                  <Bar dataKey="expenses" fill="#f59e0b" name="💸 Expenses" />
                  <Bar dataKey="profit" fill="#8b5cf6" name="📈 Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Branch Performance Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                🏢 Branch Performance Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.branchPerformance || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(processedData.branchPerformance || []).map(
                      (entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Trends Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                📈 Weekly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData.dailyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="💰 Sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="🛒 Purchases"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="💸 Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Report Table Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              📋 Detailed Financial Report Data & Analytics
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} Records Found
              </Badge>
              <Badge variant="outline" className="ml-2">
                {selectedBranch === "all" ? "All Branches" : selectedBranch}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>📅 Date</TableHead>
                    <TableHead>🏢 Branch</TableHead>
                    <TableHead className="text-right">🛒 Purchase</TableHead>
                    <TableHead className="text-right">💰 Sales</TableHead>
                    <TableHead className="text-right">💸 Expenses</TableHead>
                    <TableHead className="text-right">📈 Profit</TableHead>
                    <TableHead className="text-right">👥 Customers</TableHead>
                    <TableHead className="text-right">📦 Orders</TableHead>
                    <TableHead className="text-right">💵 Avg Order</TableHead>
                    <TableHead>🍽️ Top Item</TableHead>
                    <TableHead className="text-center">📊 Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, index) => {
                    const isNegativeProfit = row.profit < 0;
                    const profitMargin = (
                      (row.profit / (row.totalSales || 1)) *
                      100
                    ).toFixed(1);

                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {row.branch}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(row.totalPurchase)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {formatCurrency(row.totalSales)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-orange-600">
                          {formatCurrency(row.totalExpenses)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold ${
                            isNegativeProfit ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatCurrency(row.profit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-600">
                          {row.customers}
                        </TableCell>
                        <TableCell className="text-right font-mono text-purple-600">
                          {row.orders}
                        </TableCell>
                        <TableCell className="text-right font-mono text-[#69231B]">
                          {formatCurrency(row.avgOrder)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {row.topItem}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isNegativeProfit ? (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <Badge variant="red" className="text-xs">
                                  📉 Loss
                                </Badge>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <Badge
                                  variant="green"
                                  className="text-xs bg-green-100 text-green-800"
                                >
                                  📈 {profitMargin}% margin
                                </Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {currentData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                📭 No data available for the selected filters
              </div>
            ) : (
              <PaginationControls />
            )}
          </CardContent>
        </Card>

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🏆 Top Performing Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(processedData.branchPerformance || [])
                  .slice(0, 5)
                  .map((branch, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{branch.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(branch.value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ⭐ {branch.rating} rating
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Key Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    👥 Total Customers:
                  </span>
                  <span className="font-bold">
                    {(
                      processedData.summaryData.customerCount || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    💵 Avg Order Value:
                  </span>
                  <span className="font-bold">
                    {formatCurrency(
                      processedData.summaryData.avgOrderValue || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    🍽️ Top Selling Item:
                  </span>
                  <span className="font-bold">
                    {processedData.summaryData.topSellingItem || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🏆 Best Branch:</span>
                  <span className="font-bold">
                    {processedData.summaryData.bestPerformingBranch || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    📈 Profit Growth:
                  </span>
                  <span className="font-bold text-green-600">
                    +{processedData.summaryData.profitGrowth || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// "use client"

// import { useState, useMemo, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   CalendarDays,
//   Download,
//   MapPin,
//   FileText,
//   BarChart3,
//   ShoppingCart,
//   CreditCard,
//   PiggyBank,
//   TrendingUp,
//   TrendingDown,
//   Calendar,
//   PieChartIcon,
//   IndianRupee,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts"
// import jsPDF from "jspdf"
// import autoTable from 'jspdf-autotable'

// // Helper functions defined at the top level
// const getRandomColor = () => {
//   const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088', '#8800ff', '#ff8800']
//   return colors[Math.floor(Math.random() * colors.length)]
// }

// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 2,
//   }).format(amount)
// }

// const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString("en-IN", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   })
// }

// // Helper function to get week number
// const getWeekNumber = (date) => {
//   const d = new Date(date)
//   const yearStart = new Date(d.getFullYear(), 0, 1)
//   return Math.ceil(((d - yearStart) / 86400000 + yearStart.getDay() + 1) / 7)
// }

// // Helper function to get quarter
// const getQuarter = (date) => {
//   const month = new Date(date).getMonth()
//   return Math.ceil((month + 1) / 3)
// }

// export default function PurchasesvsSalesvsExpenses() {
//   const [selectedBranch, setSelectedBranch] = useState("all")
//   const [selectedPeriod, setSelectedPeriod] = useState("monthly")
//   const [startDate, setStartDate] = useState("2025-01-01")
//   const [endDate, setEndDate] = useState("2025-12-31")
//   const [branches, setBranches] = useState([])
//   const [orders, setOrders] = useState([])
//   const [purchaseOrders, setPurchaseOrders] = useState([])
//   const [expenses, setExpenses] = useState([])
//   const [loading, setLoading] = useState(true)

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(10)

//   // Fetch data from APIs
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)

//         // Fetch branches
//         const branchesResponse = await fetch('https://crm.jagalikoota.com/api/v1/hotel/branch')
//         const branchesData = await branchesResponse.json()
//         // Ensure we only store branch names as strings
//         const branchNames = branchesData.map(branch =>
//           typeof branch === 'string' ? branch : branch.name || branch.branchName || 'Unknown Branch'
//         )
//         setBranches(branchNames)

//         // Fetch orders from multiple endpoints
//         const [staffOrdersRes, onlineOrdersRes, counterOrdersRes] = await Promise.all([
//           fetch('https://crm.jagalikoota.com/api/v1/hotel/staff-order'),
//           fetch('https://crm.jagalikoota.com/api/v1/hotel/order'),
//           fetch('https://crm.jagalikoota.com/api/v1/hotel/counter-order/orders')
//         ])

//         const staffOrders = await staffOrdersRes.json()
//         const onlineOrders = await onlineOrdersRes.json()
//         const counterOrders = await counterOrdersRes.json()

//         // Combine all orders
//         const allOrders = [
//           ...(staffOrders.orders || []),
//           ...(onlineOrders.data || []),
//           ...(counterOrders.orders || [])
//         ]
//         setOrders(allOrders)

//         // Fetch purchase orders
//         const purchaseResponse = await fetch('https://crm.jagalikoota.com/api/v1/hotel/purchaseOrders')
//         const purchaseData = await purchaseResponse.json()
//         setPurchaseOrders(purchaseData.data || [])

//         // Fetch expenses
//         const expensesResponse = await fetch('https://crm.jagalikoota.com/api/expenses')
//         const expensesData = await expensesResponse.json()
//         setExpenses(expensesData)

//       } catch (error) {
//         console.error('Error fetching data:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   const periods = [
//     { id: "daily", name: "Daily", description: "Day by day analysis" },
//     { id: "weekly", name: "Weekly", description: "Week by week trends" },
//     { id: "monthly", name: "Monthly", description: "Monthly overview" },
//     { id: "quarterly", name: "Quarterly", description: "Quarterly performance" },
//     { id: "yearly", name: "Yearly", description: "Annual comparison" },
//   ]

//   // Helper functions for different period data generation
//   const generateDailyData = (orders, purchases, expenses, startDate, endDate) => {
//     const start = new Date(startDate)
//     const end = new Date(endDate)
//     const dailyData = []

//     const currentDate = new Date(start)
//     while (currentDate <= end) {
//       const dateStr = currentDate.toISOString().split('T')[0]

//       const daySales = orders.reduce((sum, order) => {
//         const orderDate = new Date(order.orderTime || order.createdAt).toISOString().split('T')[0]
//         if (orderDate === dateStr) {
//           return sum + (order.grandTotal || order.total || 0)
//         }
//         return sum
//       }, 0)

//       const dayPurchases = purchases.reduce((sum, po) => {
//         const poDate = new Date(po.orderDate).toISOString().split('T')[0]
//         if (poDate === dateStr) {
//           return sum + (po.total || 0)
//         }
//         return sum
//       }, 0)

//       const dayExpenses = expenses.reduce((sum, exp) => {
//         const expDate = new Date(exp.date).toISOString().split('T')[0]
//         if (expDate === dateStr) {
//           return sum + (exp.amount || 0)
//         }
//         return sum
//       }, 0)

//       const profit = daySales - dayPurchases - dayExpenses

//       dailyData.push({
//         period: formatDate(dateStr),
//         sales: daySales,
//         purchases: dayPurchases,
//         expenses: dayExpenses,
//         profit,
//         customers: Math.floor(Math.random() * 50) + 10,
//         orders: Math.floor(Math.random() * 20) + 5
//       })

//       currentDate.setDate(currentDate.getDate() + 1)
//     }

//     return dailyData
//   }

//   const generateWeeklyData = (orders, purchases, expenses, startDate, endDate) => {
//     const weeklyData = new Map()

//     const processWeeklyData = (data, dateField, valueField, type) => {
//       data.forEach(item => {
//         const itemDate = new Date(item[dateField] || item.orderTime || item.date)
//         if (itemDate >= new Date(startDate) && itemDate <= new Date(endDate)) {
//           const year = itemDate.getFullYear()
//           const week = getWeekNumber(itemDate)
//           const weekKey = `${year}-W${week.toString().padStart(2, '0')}`

//           if (!weeklyData.has(weekKey)) {
//             weeklyData.set(weekKey, {
//               period: weekKey,
//               sales: 0,
//               purchases: 0,
//               expenses: 0,
//               profit: 0,
//               customers: 0,
//               orders: 0
//             })
//           }

//           const weekData = weeklyData.get(weekKey)
//           weekData[type] += (item[valueField] || item.total || item.amount || 0)
//         }
//       })
//     }

//     processWeeklyData(orders, 'orderTime', 'grandTotal', 'sales')
//     processWeeklyData(purchases, 'orderDate', 'total', 'purchases')
//     processWeeklyData(expenses, 'date', 'amount', 'expenses')

//     // Calculate profit and add random data
//     Array.from(weeklyData.values()).forEach(week => {
//       week.profit = week.sales - week.purchases - week.expenses
//       week.customers = Math.floor(Math.random() * 300) + 100
//       week.orders = Math.floor(Math.random() * 150) + 50
//     })

//     return Array.from(weeklyData.values()).sort((a, b) => a.period.localeCompare(b.period))
//   }

//   const generateMonthlyData = (orders, purchases, expenses) => {
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     return months.map(month => {
//       const monthSales = orders.reduce((sum, order) => {
//         const orderDate = new Date(order.orderTime || order.createdAt)
//         if (orderDate.toLocaleString('default', { month: 'short' }) === month) {
//           return sum + (order.grandTotal || order.total || 0)
//         }
//         return sum
//       }, 0)

//       const monthPurchases = purchases.reduce((sum, po) => {
//         const poDate = new Date(po.orderDate)
//         if (poDate.toLocaleString('default', { month: 'short' }) === month) {
//           return sum + (po.total || 0)
//         }
//         return sum
//       }, 0)

//       const monthExpenses = expenses.reduce((sum, exp) => {
//         const expDate = new Date(exp.date)
//         if (expDate.toLocaleString('default', { month: 'short' }) === month) {
//           return sum + (exp.amount || 0)
//         }
//         return sum
//       }, 0)

//       const profit = monthSales - monthPurchases - monthExpenses

//       return {
//         period: month,
//         sales: monthSales,
//         purchases: monthPurchases,
//         expenses: monthExpenses,
//         profit,
//         customers: Math.floor(Math.random() * 1000) + 500,
//         orders: Math.floor(Math.random() * 200) + 100
//       }
//     })
//   }

//   const generateQuarterlyData = (orders, purchases, expenses) => {
//     const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
//     return quarters.map(quarter => {
//       const quarterNum = parseInt(quarter.substring(1))

//       const quarterSales = orders.reduce((sum, order) => {
//         const orderDate = new Date(order.orderTime || order.createdAt)
//         if (getQuarter(orderDate) === quarterNum) {
//           return sum + (order.grandTotal || order.total || 0)
//         }
//         return sum
//       }, 0)

//       const quarterPurchases = purchases.reduce((sum, po) => {
//         const poDate = new Date(po.orderDate)
//         if (getQuarter(poDate) === quarterNum) {
//           return sum + (po.total || 0)
//         }
//         return sum
//       }, 0)

//       const quarterExpenses = expenses.reduce((sum, exp) => {
//         const expDate = new Date(exp.date)
//         if (getQuarter(expDate) === quarterNum) {
//           return sum + (exp.amount || 0)
//         }
//         return sum
//       }, 0)

//       const profit = quarterSales - quarterPurchases - quarterExpenses

//       return {
//         period: quarter,
//         sales: quarterSales,
//         purchases: quarterPurchases,
//         expenses: quarterExpenses,
//         profit,
//         customers: Math.floor(Math.random() * 3000) + 1500,
//         orders: Math.floor(Math.random() * 600) + 300
//       }
//     })
//   }

//   const generateYearlyData = (orders, purchases, expenses) => {
//     const years = [...new Set([
//       ...orders.map(o => new Date(o.orderTime || o.createdAt).getFullYear()),
//       ...purchases.map(p => new Date(p.orderDate).getFullYear()),
//       ...expenses.map(e => new Date(e.date).getFullYear())
//     ])].sort()

//     return years.map(year => {
//       const yearSales = orders.reduce((sum, order) => {
//         const orderDate = new Date(order.orderTime || order.createdAt)
//         if (orderDate.getFullYear() === year) {
//           return sum + (order.grandTotal || order.total || 0)
//         }
//         return sum
//       }, 0)

//       const yearPurchases = purchases.reduce((sum, po) => {
//         const poDate = new Date(po.orderDate)
//         if (poDate.getFullYear() === year) {
//           return sum + (po.total || 0)
//         }
//         return sum
//       }, 0)

//       const yearExpenses = expenses.reduce((sum, exp) => {
//         const expDate = new Date(exp.date)
//         if (expDate.getFullYear() === year) {
//           return sum + (exp.amount || 0)
//         }
//         return sum
//       }, 0)

//       const profit = yearSales - yearPurchases - yearExpenses

//       return {
//         period: year.toString(),
//         sales: yearSales,
//         purchases: yearPurchases,
//         expenses: yearExpenses,
//         profit,
//         customers: Math.floor(Math.random() * 12000) + 6000,
//         orders: Math.floor(Math.random() * 2400) + 1200
//       }
//     })
//   }

//   const generateBranchPerformance = (orders, branches) => {
//     return branches.map(branch => {
//       const branchOrders = orders.filter(order => {
//         const orderBranch = order.branchName || order.branch?.name || order.branch
//         return orderBranch && orderBranch.toString().toLowerCase().includes(branch.toString().toLowerCase())
//       })

//       const branchSales = branchOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0)

//       return {
//         name: branch,
//         value: branchSales,
//         color: getRandomColor(),
//         employees: Math.floor(Math.random() * 20) + 10,
//         rating: (Math.random() * 1 + 4).toFixed(1),
//         speciality: "Various"
//       }
//     })
//   }

//   const generateDailyTrends = (orders, purchases, expenses) => {
//     const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//     return days.map(day => {
//       const daySales = orders.reduce((sum, order) => {
//         const orderDate = new Date(order.orderTime || order.createdAt)
//         if (orderDate.toLocaleString('default', { weekday: 'short' }) === day) {
//           return sum + (order.grandTotal || order.total || 0)
//         }
//         return sum
//       }, 0)

//       const dayPurchases = purchases.reduce((sum, po) => {
//         const poDate = new Date(po.orderDate)
//         if (poDate.toLocaleString('default', { weekday: 'short' }) === day) {
//           return sum + (po.total || 0)
//         }
//         return sum
//       }, 0)

//       const dayExpenses = expenses.reduce((sum, exp) => {
//         const expDate = new Date(exp.date)
//         if (expDate.toLocaleString('default', { weekday: 'short' }) === day) {
//           return sum + (exp.amount || 0)
//         }
//         return sum
//       }, 0)

//       return {
//         day,
//         sales: daySales,
//         purchases: dayPurchases,
//         expenses: dayExpenses,
//         customers: Math.floor(Math.random() * 100) + 50,
//         orders: Math.floor(Math.random() * 50) + 20
//       }
//     })
//   }

//   const generateReportData = (orders, purchases, expenses) => {
//     const reportData = []

//     // Process orders
//     orders.forEach(order => {
//       const date = new Date(order.orderTime || order.createdAt)
//       const branchName = order.branchName || order.branch?.name || order.branch || 'Unknown'
//       const sales = order.grandTotal || order.total || 0
//       const orderPurchases = order.items ? order.items.reduce((sum, item) => {
//         const quantity = item.quantity || 1
//         const price = item.price || 0
//         return sum + (price * quantity)
//       }, 0) : 0

//       reportData.push({
//         date: date.toISOString().split('T')[0],
//         branch: branchName,
//         totalPurchase: orderPurchases,
//         totalSales: sales,
//         totalExpenses: 0,
//         profit: sales - orderPurchases,
//         customers: order.peopleCount || Math.floor(Math.random() * 10) + 1,
//         orders: 1,
//         avgOrder: sales,
//         topItem: order.items && order.items.length > 0 ? order.items[0].name : "Various"
//       })
//     })

//     // Process purchase orders
//     purchases.forEach(po => {
//       const date = new Date(po.orderDate)
//       const branchName = po.branchName || po.branch || 'Unknown'
//       const purchasesAmount = po.total || 0

//       reportData.push({
//         date: date.toISOString().split('T')[0],
//         branch: branchName,
//         totalPurchase: purchasesAmount,
//         totalSales: 0,
//         totalExpenses: 0,
//         profit: -purchasesAmount,
//         customers: 0,
//         orders: 1,
//         avgOrder: 0,
//         topItem: po.items && po.items.length > 0 ? po.items[0].name?.name : "Various"
//       })
//     })

//     // Process expenses
//     expenses.forEach(exp => {
//       const date = new Date(exp.date)
//       const branchName = exp.branch?.name || exp.branch || 'Unknown'
//       const expensesAmount = exp.amount || 0

//       reportData.push({
//         date: date.toISOString().split('T')[0],
//         branch: branchName,
//         totalPurchase: 0,
//         totalSales: 0,
//         totalExpenses: expensesAmount,
//         profit: -expensesAmount,
//         customers: 0,
//         orders: 1,
//         avgOrder: 0,
//         topItem: exp.type || "Expense"
//       })
//     })

//     return reportData
//   }

//   // Process and calculate data based on filters
//   const processedData = useMemo(() => {
//     if (loading) return { summaryData: {}, chartData: [], branchPerformance: [], dailyTrends: [], reportData: [] }

//     // Filter data based on selected branch - FIXED VERSION
//     const filterByBranch = (data, branchField = 'branchName') => {
//       if (selectedBranch === "all") return data
//       return data.filter(item => {
//         const branchName = item[branchField] || item.branch?.name || item.branch
//         // Ensure branchName is treated as string
//         const branchNameStr = branchName ? branchName.toString().toLowerCase() : ''
//         const selectedBranchStr = selectedBranch.toString().toLowerCase()
//         return branchNameStr.includes(selectedBranchStr)
//       })
//     }

//     // Filter by date range
//     const filterByDate = (data, dateField = 'createdAt') => {
//       const start = new Date(startDate)
//       const end = new Date(endDate)
//       return data.filter(item => {
//         const itemDate = new Date(item[dateField] || item.orderTime || item.date)
//         return itemDate >= start && itemDate <= end
//       })
//     }

//     // Process orders data
//     const filteredOrders = filterByDate(filterByBranch(orders, 'branchName'))
//     const filteredPurchases = filterByDate(filterByBranch(purchaseOrders, 'branchName'), 'orderDate')
//     const filteredExpenses = filterByDate(filterByBranch(expenses, 'branch'), 'date')

//     // Calculate summary data
//     const totalSales = filteredOrders.reduce((sum, order) => sum + (order.grandTotal || order.total || 0), 0)
//     const totalPurchases = filteredPurchases.reduce((sum, po) => sum + (po.total || 0), 0)
//     const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
//     const netProfit = totalSales - totalPurchases - totalExpenses

//     // Calculate growth percentages
//     const salesGrowth = totalSales > 0 ? 12.5 : 0
//     const purchaseGrowth = totalPurchases > 0 ? -3.2 : 0
//     const expenseGrowth = totalExpenses > 0 ? 8.7 : 0
//     const profitGrowth = netProfit > 0 ? 18.9 : 0

//     const customerCount = filteredOrders.length
//     const avgOrderValue = customerCount > 0 ? totalSales / customerCount : 0

//     const summaryData = {
//       totalSales,
//       totalPurchases,
//       totalExpenses,
//       netProfit,
//       salesGrowth,
//       purchaseGrowth,
//       expenseGrowth,
//       profitGrowth,
//       customerCount,
//       avgOrderValue,
//       topSellingItem: "Grilled Salmon",
//       bestPerformingBranch: branches.length > 0 ? branches[0] : "N/A",
//     }

//     // Generate chart data based on selected period
//     let chartData = []
//     switch (selectedPeriod) {
//       case 'daily':
//         chartData = generateDailyData(filteredOrders, filteredPurchases, filteredExpenses, startDate, endDate)
//         break
//       case 'weekly':
//         chartData = generateWeeklyData(filteredOrders, filteredPurchases, filteredExpenses, startDate, endDate)
//         break
//       case 'monthly':
//         chartData = generateMonthlyData(filteredOrders, filteredPurchases, filteredExpenses)
//         break
//       case 'quarterly':
//         chartData = generateQuarterlyData(filteredOrders, filteredPurchases, filteredExpenses)
//         break
//       case 'yearly':
//         chartData = generateYearlyData(filteredOrders, filteredPurchases, filteredExpenses)
//         break
//       default:
//         chartData = generateMonthlyData(filteredOrders, filteredPurchases, filteredExpenses)
//     }

//     const branchPerformance = generateBranchPerformance(filteredOrders, branches)
//     const dailyTrends = generateDailyTrends(filteredOrders, filteredPurchases, filteredExpenses)
//     const reportData = generateReportData(filteredOrders, filteredPurchases, filteredExpenses)

//     return {
//       summaryData,
//       chartData,
//       branchPerformance,
//       dailyTrends,
//       reportData
//     }
//   }, [selectedBranch, selectedPeriod, startDate, endDate, orders, purchaseOrders, expenses, branches, loading])

//   // Filter data for table with pagination
//   const filteredData = useMemo(() => {
//     let data = processedData.reportData || []

//     if (selectedBranch !== "all") {
//       data = data.filter((row) => {
//         const rowBranch = row.branch ? row.branch.toString().toLowerCase() : ''
//         const selectedBranchStr = selectedBranch.toString().toLowerCase()
//         return rowBranch.includes(selectedBranchStr)
//       })
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate)
//       const end = new Date(endDate)
//       data = data.filter(
//         (row) => new Date(row.date) >= start && new Date(row.date) <= end
//       )
//     }

//     return data
//   }, [selectedBranch, startDate, endDate, processedData.reportData])

//   // Pagination calculations
//   const totalItems = filteredData.length
//   const totalPages = Math.ceil(totalItems / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentData = filteredData.slice(startIndex, endIndex)

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [selectedBranch, selectedPeriod, startDate, endDate])

//   const handleDownloadPDF = () => {
//     const doc = new jsPDF()

//     // Add title and filter information
//     doc.setFontSize(18)
//     doc.text("Restaurant CRM Financial Report", 14, 20)
//     doc.setFontSize(12)
//     doc.text(`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`, 14, 30)
//     doc.text(`Period: ${periods.find((p) => p.id === selectedPeriod)?.name}`, 14, 36)
//     doc.text(`Date Range: ${formatDate(startDate)} to ${formatDate(endDate)}`, 14, 42)

//     // Prepare table data
//     const tableData = filteredData.map((row) => [
//       formatDate(row.date),
//       row.branch,
//       formatCurrency(row.totalPurchase),
//       formatCurrency(row.totalSales),
//       formatCurrency(row.totalExpenses),
//       formatCurrency(row.profit),
//       row.customers.toString(),
//       row.orders.toString(),
//       formatCurrency(row.avgOrder),
//       row.topItem,
//       row.profit < 0 ? "Loss" : `${((row.profit / (row.totalSales || 1)) * 100).toFixed(1)}% margin`,
//     ])

//     // Generate table in PDF
//     autoTable(doc, {
//       startY: 50,
//       head: [["Date", "Branch", "Purchase", "Sales", "Expenses", "Profit", "Customers", "Orders", "Avg Order", "Top Item", "Status"]],
//       body: tableData,
//       theme: "grid",
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [22, 160, 133] },
//     })

//     // Save the PDF
//     doc.save(`Restaurant_Report_${selectedBranch}_${selectedPeriod}_${startDate}_to_${endDate}.pdf`)
//   }

//   // Pagination component
//   const PaginationControls = () => {
//     if (totalPages <= 1) return null

//     return (
//       <div className="flex items-center justify-between mt-4">
//         <div className="text-sm text-muted-foreground">
//           Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//             Previous
//           </Button>

//           <div className="flex items-center gap-1">
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
//                 <Button
//                   key={pageNum}
//                   variant={currentPage === pageNum ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setCurrentPage(pageNum)}
//                   className="h-8 w-8 p-0"
//                 >
//                   {pageNum}
//                 </Button>
//               )
//             })}
//           </div>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//           >
//             Next
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="flex items-center gap-2">
//           <Label htmlFor="itemsPerPage" className="text-sm">Items per page:</Label>
//           <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
//             <SelectTrigger className="w-20">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="5">5</SelectItem>
//               <SelectItem value="10">10</SelectItem>
//               <SelectItem value="25">25</SelectItem>
//               <SelectItem value="50">50</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     )
//   }

//   const summaryCards = [
//     {
//       title: "Total Sales",
//       value: processedData.summaryData.totalSales || 0,
//       icon: IndianRupee,
//       growth: processedData.summaryData.salesGrowth || 0,
//       color: "text-green-600",
//       bgColor: "bg-green-50",
//       description: "Revenue from all branches",
//     },
//     {
//       title: "Total Purchases",
//       value: processedData.summaryData.totalPurchases || 0,
//       icon: ShoppingCart,
//       growth: processedData.summaryData.purchaseGrowth || 0,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//       description: "Cost of goods sold",
//     },
//     {
//       title: "Total Expenses",
//       value: processedData.summaryData.totalExpenses || 0,
//       icon: CreditCard,
//       growth: processedData.summaryData.expenseGrowth || 0,
//       color: "text-orange-600",
//       bgColor: "bg-orange-50",
//       description: "Operating expenses",
//     },
//     {
//       title: "Net Profit",
//       value: processedData.summaryData.netProfit || 0,
//       icon: PiggyBank,
//       growth: processedData.summaryData.profitGrowth || 0,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//       description: "Total profit margin",
//     },
//   ]

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-muted-foreground">Loading financial data...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Restaurant CRM Reports Dashboard</h1>
//             <p className="text-muted-foreground mt-1">
//               Comprehensive financial reporting and analytics for all restaurant locations
//             </p>
//             <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
//               <span>📊 {branches.length} Active Branches</span>
//               <span>👥 {(processedData.summaryData.customerCount || 0).toLocaleString()} Total Customers</span>
//               <span>🍽️ {formatCurrency(processedData.summaryData.avgOrderValue || 0)} Avg Order Value</span>
//               <span>⭐ Best: {processedData.summaryData.bestPerformingBranch || "N/A"}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <BarChart3 className="h-5 w-5 text-primary" />
//             <span className="text-sm font-medium">Live Dashboard</span>
//             <Badge variant="green" className="bg-green-100 text-green-800">
//               Online
//             </Badge>
//           </div>
//         </div>

//         {/* Filters Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               Advanced Report Filters & Controls
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="space-y-2 relative">
//                 <Label htmlFor="branch" className="flex items-center gap-2">
//                   <MapPin className="h-4 w-4" />
//                   Branch Location
//                 </Label>
//                 <Select value={selectedBranch} onValueChange={setSelectedBranch}>
//                   <SelectTrigger className="bg-white">
//                     <SelectValue placeholder="Select branch" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white" position="popper">
//                     <SelectItem value="all">🏢 All Branches ({branches.length})</SelectItem>
//                     {branches.map((branch, index) => (
//                       <SelectItem key={index} value={branch}>
//                         📍 {branch}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2 relative">
//                 <Label htmlFor="period" className="flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4" />
//                   Report Period
//                 </Label>
//                 <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//                   <SelectTrigger className="bg-white">
//                     <SelectValue placeholder="Select period" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white" position="popper">
//                     {periods.map((period) => (
//                       <SelectItem key={period.id} value={period.id}>
//                         📅 {period.name} - {period.description}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="startDate">📅 Start Date</Label>
//                 <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="endDate">📅 End Date</Label>
//                 <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//                 <Button variant="outline" onClick={handleDownloadPDF} className="w-full bg-transparent mt-2">
//                   <Download className="h-4 w-4 mr-2" />📄 Download PDF
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Summary Cards Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {summaryCards.map((card, index) => {
//             const Icon = card.icon
//             const isPositiveGrowth = card.growth > 0
//             const GrowthIcon = isPositiveGrowth ? TrendingUp : TrendingDown

//             return (
//               <Card key={index} className="relative overflow-hidden">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
//                   <div className={`p-2 rounded-lg ${card.bgColor}`}>
//                     <Icon className={`h-4 w-4 ${card.color}`} />
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold text-foreground">{formatCurrency(card.value)}</div>
//                   <div className="flex items-center gap-2 mt-2">
//                     <div
//                       className={`flex items-center gap-1 text-sm ${isPositiveGrowth ? "text-green-600" : "text-red-600"}`}
//                     >
//                       <GrowthIcon className="h-3 w-3" />
//                       {Math.abs(card.growth)}%
//                     </div>
//                     <span className="text-xs text-muted-foreground">vs last period</span>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
//                 </CardContent>
//               </Card>
//             )
//           })}
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Period-based Trends Chart */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <BarChart3 className="h-5 w-5" />📊 {periods.find(p => p.id === selectedPeriod)?.name || 'Monthly'} Financial Trends & Performance Analytics
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={processedData.chartData || []}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="period" />
//                   <YAxis tickFormatter={formatCurrency} />
//                   <Tooltip formatter={(value) => formatCurrency(Number(value))} />
//                   <Legend />
//                   <Bar dataKey="sales" fill="#10b981" name="💰 Sales" />
//                   <Bar dataKey="purchases" fill="#3b82f6" name="🛒 Purchases" />
//                   <Bar dataKey="expenses" fill="#f59e0b" name="💸 Expenses" />
//                   <Bar dataKey="profit" fill="#8b5cf6" name="📈 Profit" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Branch Performance Pie Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <PieChartIcon className="h-5 w-5" />🏢 Branch Performance Distribution
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={processedData.branchPerformance || []}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {(processedData.branchPerformance || []).map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => formatCurrency(Number(value))} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Daily Trends Line Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5" />📈 Weekly Performance Trends
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={processedData.dailyTrends || []}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="day" />
//                   <YAxis tickFormatter={formatCurrency} />
//                   <Tooltip formatter={(value) => formatCurrency(Number(value))} />
//                   <Legend />
//                   <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} name="💰 Sales" />
//                   <Line type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} name="🛒 Purchases" />
//                   <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="💸 Expenses" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Report Table Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5" />📋 Detailed Financial Report Data & Analytics
//               <Badge variant="secondary" className="ml-2">
//                 {filteredData.length} Records Found
//               </Badge>
//               <Badge variant="outline" className="ml-2">
//                 {selectedBranch === "all" ? "All Branches" : selectedBranch}
//               </Badge>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>📅 Date</TableHead>
//                     <TableHead>🏢 Branch</TableHead>
//                     <TableHead className="text-right">🛒 Purchase</TableHead>
//                     <TableHead className="text-right">💰 Sales</TableHead>
//                     <TableHead className="text-right">💸 Expenses</TableHead>
//                     <TableHead className="text-right">📈 Profit</TableHead>
//                     <TableHead className="text-right">👥 Customers</TableHead>
//                     <TableHead className="text-right">📦 Orders</TableHead>
//                     <TableHead className="text-right">💵 Avg Order</TableHead>
//                     <TableHead>🍽️ Top Item</TableHead>
//                     <TableHead className="text-center">📊 Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {currentData.map((row, index) => {
//                     const isNegativeProfit = row.profit < 0
//                     const profitMargin = ((row.profit / (row.totalSales || 1)) * 100).toFixed(1)

//                     return (
//                       <TableRow key={index} className="hover:bg-muted/50">
//                         <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
//                         <TableCell>
//                           <Badge variant="outline" className="font-medium">
//                             {row.branch}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right font-mono">{formatCurrency(row.totalPurchase)}</TableCell>
//                         <TableCell className="text-right font-mono text-green-600">
//                           {formatCurrency(row.totalSales)}
//                         </TableCell>
//                         <TableCell className="text-right font-mono text-orange-600">
//                           {formatCurrency(row.totalExpenses)}
//                         </TableCell>
//                         <TableCell
//                           className={`text-right font-mono font-bold ${isNegativeProfit ? "text-red-600" : "text-green-600"}`}
//                         >
//                           {formatCurrency(row.profit)}
//                         </TableCell>
//                         <TableCell className="text-right font-mono text-blue-600">{row.customers}</TableCell>
//                         <TableCell className="text-right font-mono text-purple-600">{row.orders}</TableCell>
//                         <TableCell className="text-right font-mono text-[#69231B]">
//                           {formatCurrency(row.avgOrder)}
//                         </TableCell>
//                         <TableCell className="text-sm font-medium">{row.topItem}</TableCell>
//                         <TableCell className="text-center">
//                           <div className="flex items-center justify-center gap-1">
//                             {isNegativeProfit ? (
//                               <>
//                                 <TrendingDown className="h-4 w-4 text-red-500" />
//                                 <Badge variant="red" className="text-xs">
//                                   📉 Loss
//                                 </Badge>
//                               </>
//                             ) : (
//                               <>
//                                 <TrendingUp className="h-4 w-4 text-green-500" />
//                                 <Badge variant="green" className="text-xs bg-green-100 text-green-800">
//                                   📈 {profitMargin}% margin
//                                 </Badge>
//                               </>
//                             )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     )
//                   })}
//                 </TableBody>
//               </Table>
//             </div>

//             {currentData.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 🔭 No data available for the selected filters
//               </div>
//             ) : (
//               <PaginationControls />
//             )}
//           </CardContent>
//         </Card>

//         {/* Additional Analytics Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">🏆 Top Performing Branches</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {(processedData.branchPerformance || []).slice(0, 5).map((branch, index) => (
//                   <div key={index} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Badge
//                         variant="outline"
//                         className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
//                       >
//                         {index + 1}
//                       </Badge>
//                       <span className="font-medium">{branch.name}</span>
//                     </div>
//                     <div className="text-right">
//                       <div className="font-bold text-green-600">{formatCurrency(branch.value)}</div>
//                       <div className="text-xs text-muted-foreground">⭐ {branch.rating} rating</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">📊 Key Metrics Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">👥 Total Customers:</span>
//                   <span className="font-bold">{(processedData.summaryData.customerCount || 0).toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">💵 Avg Order Value:</span>
//                   <span className="font-bold">{formatCurrency(processedData.summaryData.avgOrderValue || 0)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">🍽️ Top Selling Item:</span>
//                   <span className="font-bold">{processedData.summaryData.topSellingItem || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">🏆 Best Branch:</span>
//                   <span className="font-bold">{processedData.summaryData.bestPerformingBranch || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">📈 Profit Growth:</span>
//                   <span className="font-bold text-green-600">+{processedData.summaryData.profitGrowth || 0}%</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
