import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Edit3,
  Printer,
  Check,
  Clock,
  ChefHat,
  X,
  CreditCard,
  Smartphone,
  DollarSign,
  Trash2,
  Save,
  Building,
  Search,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import axios from "axios";

const RestaurantPOS = () => {
  // API URLs - Same as Menu Management
  const HOTEL_VIRAT_URL = "https://crm.jagalikoota.com/api/v1/hotel";
  const LOCAL_API_URL = "https://crm.jagalikoota.com/api/v1/hotel";

  // State Management
  const [currentView, setCurrentView] = useState("orders");
  const [orderType, setOrderType] = useState("restaurant");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [branches, setBranches] = useState([]);
  const [tables, setTables] = useState([]); // Tables for selected branch
  const [menuCategories, setMenuCategories] = useState(["All Items"]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextItemId, setNextItemId] = useState(11);
  const [currentOrder, setCurrentOrder] = useState({
    table: "",
    tableId: "", // Store table ID
    items: {},
    total: 0,
    branch: "",
    branchId: "", // Store branch ID for filtering tables
  });
  const [allOrders, setAllOrders] = useState([
    {
      id: 1,
      table: 5,
      items: { 3: 1, 5: 2, 7: 1 },
      status: "Pending",
      total: 500,
      timestamp: new Date(),
      type: "restaurant",
      paymentStatus: "unpaid",
      paymentMethod: null,
      branch: "Main Branch",
    },
    {
      id: 2,
      table: 2,
      items: { 2: 1, 4: 1 },
      status: "Preparing",
      total: 360,
      timestamp: new Date(),
      type: "restaurant",
      paymentStatus: "unpaid",
      paymentMethod: null,
      branch: "Downtown Branch",
    },
    {
      id: 3,
      table: "Online- mohan",
      items: { 1: 2, 7: 2 },
      status: "Ready",
      total: 340,
      timestamp: new Date(),
      type: "online",
      paymentStatus: "paid",
      paymentMethod: "upi",
      branch: "Main Branch",
    },
    {
      id: 4,
      table: "ramesh",
      items: { 4: 1, 9: 1 },
      status: "Pending",
      total: 400,
      timestamp: new Date(),
      type: "darshini",
      paymentStatus: "unpaid",
      paymentMethod: null,
      branch: "Uptown Branch",
    },
    {
      id: 5,
      table: "Online-ramesh",
      items: { 3: 1, 6: 2 },
      status: "Preparing",
      total: 550,
      timestamp: new Date(),
      type: "online",
      paymentStatus: "paid",
      paymentMethod: "card",
      branch: "Westside Branch",
    },
  ]);
  const [nextOrderId, setNextOrderId] = useState(6);
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showKOTModal, setShowKOTModal] = useState(false);
  const [currentKOTOrder, setCurrentKOTOrder] = useState(null);

  // Dashboard Statistics
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const paidOrders = allOrders.filter(
    (order) => order.paymentStatus === "paid"
  ).length;
  const unpaidOrders = allOrders.filter(
    (order) => order.paymentStatus === "unpaid"
  ).length;
  const cardPayments = allOrders.filter(
    (order) => order.paymentMethod === "card"
  ).length;
  const upiPayments = allOrders.filter(
    (order) => order.paymentMethod === "upi"
  ).length;
  const cashPayments = allOrders.filter(
    (order) => order.paymentMethod === "cash"
  ).length;

  // Fetch data from APIs - Same as Menu Management
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch restaurant branches and categories
        let branchResponse, categoryResponse;
        try {
          // Determine API base URL based on environment
          const isDevelopment =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          const API_BASE_URL = isDevelopment
            ? "https://crm.jagalikoota.com/api/v1/hotel"
            : "https://crm.jagalikoota.com/api/v1/hotel";

          [branchResponse, categoryResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/getAllRestaurants?all=true`),
            axios.get(`${HOTEL_VIRAT_URL}/category`),
          ]);

          // Extract restaurant branches from response
          const restaurantBranches =
            branchResponse.data?.data || branchResponse.data || [];
          setBranches(restaurantBranches);
          setMenuCategories([
            "All Items",
            ...categoryResponse.data.map((cat) => cat.name),
          ]);
        } catch (externalError) {
          console.error("Error fetching external data:", externalError);
          // Use fallback data for branches and categories
          setBranches([]);
          setMenuCategories(["All Items", "Starter", "Main Course", "Dessert"]);
        }

        // Fetch online menu items from Jagali Koota
        let onlineMenuItems = [];
        try {
          console.log(
            "Fetching online menu items from:",
            `${HOTEL_VIRAT_URL}/menu`
          );
          const onlineMenuResponse = await axios.get(`${HOTEL_VIRAT_URL}/menu`);
          console.log("Online menu response:", onlineMenuResponse.data);
          onlineMenuItems = onlineMenuResponse.data.map((item) => ({
            id: item._id,
            name: item.name || item.itemName,
            category: item.categoryId?.name || "Uncategorized",
            price: item.price || 0,
            source: "online",
            menuTypes: ["Online"],
          }));
          console.log("Mapped online menu items:", onlineMenuItems);
        } catch (onlineError) {
          console.error("Error fetching online menu items:", onlineError);
          // Continue without online items
          onlineMenuItems = [];
        }

        // Fetch restaurant/darshani items from local database
        let localMenuItems = [];
        try {
          console.log(
            "Fetching local menu items from:",
            `${LOCAL_API_URL}/restaurant-menu`
          );
          const localMenuResponse = await axios.get(
            `${LOCAL_API_URL}/restaurant-menu`
          );
          console.log("Local menu response:", localMenuResponse.data);
          localMenuItems = localMenuResponse.data.map((item) => ({
            id: item._id,
            name: item.itemName,
            category: item.categoryName || "Uncategorized",
            price: item.prices ? Object.values(item.prices)[0] : 0, // Use first price
            source: "local",
            sourceType: item.sourceType,
            menuTypes: item.menuTypes || [],
          }));
          console.log("Mapped local menu items:", localMenuItems);
        } catch (localError) {
          console.error("Error fetching local menu items:", localError);
          // Continue without local items
          localMenuItems = [];
        }

        // Ensure we have at least some menu items
        const allMenuItems = [...onlineMenuItems, ...localMenuItems];
        if (allMenuItems.length === 0) {
          console.log("No menu items found, using fallback data");
          setMenuItems([
            {
              id: "fallback-1",
              name: "Sample Item 1",
              category: "Starter",
              price: 100,
              source: "fallback",
            },
            {
              id: "fallback-2",
              name: "Sample Item 2",
              category: "Main Course",
              price: 200,
              source: "fallback",
            },
            {
              id: "fallback-3",
              name: "Sample Item 3",
              category: "Dessert",
              price: 150,
              source: "fallback",
            },
          ]);
        } else {
          setMenuItems(allMenuItems);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data: " + err.message);

        // Fallback: Use some sample data if APIs fail
        console.log("Using fallback data due to API failure");
        setMenuItems([
          {
            id: "fallback-1",
            name: "Sample Item 1",
            category: "Starter",
            price: 100,
            source: "fallback",
          },
          {
            id: "fallback-2",
            name: "Sample Item 2",
            category: "Main Course",
            price: 200,
            source: "fallback",
          },
          {
            id: "fallback-3",
            name: "Sample Item 3",
            category: "Dessert",
            price: 150,
            source: "fallback",
          },
        ]);
        setBranches([{ _id: "fallback-branch", name: "Main Branch" }]);
        setMenuCategories(["All Items", "Starter", "Main Course", "Dessert"]);

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !currentOrder.branch) {
      setCurrentOrder((prev) => ({ ...prev, branch: branches[0].name }));
    }
  }, [branches, currentOrder.branch]);

  // Utility Functions
  const getOrderCategories = (order) => {
    const categories = new Set();
    Object.keys(order.items).forEach((itemId) => {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      if (item) categories.add(item.category);
    });
    return Array.from(categories).join(", ");
  };

  const filteredOrders = allOrders.filter((order) => {
    const matchesOrderType =
      orderTypeFilter === "all" || order.type === orderTypeFilter;
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === "all" ||
      order.paymentStatus === paymentStatusFilter;
    const matchesBranch =
      branchFilter === "all" || order.branch === branchFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.id.toString().includes(searchQuery) ||
      order.table.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      Object.keys(order.items).some((itemId) => {
        const item = menuItems.find((m) => m.id === parseInt(itemId));
        return item && item.category === categoryFilter;
      });
    return (
      matchesOrderType &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesBranch &&
      matchesSearch &&
      matchesCategory
    );
  });

  const filteredItems =
    selectedCategory === "All Items"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addToOrder = (itemId) => {
    setCurrentOrder((prev) => {
      const newItems = { ...prev.items };
      newItems[itemId] = (newItems[itemId] || 0) + 1;
      const total = calculateTotal(newItems);
      return { ...prev, items: newItems, total };
    });
  };

  const removeFromOrder = (itemId) => {
    setCurrentOrder((prev) => {
      const newItems = { ...prev.items };
      if (newItems[itemId] > 1) {
        newItems[itemId]--;
      } else {
        delete newItems[itemId];
      }
      const total = calculateTotal(newItems);
      return { ...prev, items: newItems, total };
    });
  };

  const removeItemCompletely = (itemId) => {
    setCurrentOrder((prev) => {
      const newItems = { ...prev.items };
      delete newItems[itemId];
      const total = calculateTotal(newItems);
      return { ...prev, items: newItems, total };
    });
  };

  const calculateTotal = (items) => {
    return Object.entries(items).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const createOrder = () => {
    if (Object.keys(currentOrder.items).length === 0) {
      alert("Please add items to the order");
      return;
    }
    if (orderType === "restaurant" && !currentOrder.branchId) {
      alert("Please select a branch");
      return;
    }
    if (orderType === "restaurant" && !currentOrder.tableId) {
      alert("Please select a table");
      return;
    }
    const tableNumber =
      orderType === "restaurant"
        ? currentOrder.table
        : orderType === "darshini"
        ? `Darshini-${Math.floor(Math.random() * 10) + 1}`
        : `Online-${Math.floor(Math.random() * 100) + 1}`;
    const newOrder = {
      id: nextOrderId,
      table: tableNumber,
      tableId: currentOrder.tableId,
      items: { ...currentOrder.items },
      status: "Pending",
      total: currentOrder.total,
      timestamp: new Date(),
      type: orderType,
      paymentStatus: "unpaid",
      paymentMethod: null,
      branch: currentOrder.branch,
      branchId: currentOrder.branchId,
    };
    setAllOrders((prev) => [...prev, newOrder]);
    setNextOrderId((prev) => prev + 1);
    setCurrentOrder({
      table: "",
      tableId: "",
      items: {},
      total: 0,
      branch: "",
      branchId: "",
    });
    setTables([]);
    setShowNewOrderModal(false);
    setSelectedCategory("All Items");
    alert(`Order created successfully! Order ID: #${newOrder.id}`);
  };

  const updateOrder = () => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === editingOrder.id
          ? {
              ...order,
              items: { ...currentOrder.items },
              total: currentOrder.total,
              branch: currentOrder.branch,
            }
          : order
      )
    );
    setEditingOrder(null);
    setCurrentOrder({
      table: 1,
      items: {},
      total: 0,
      branch: branches[0]?.name || "",
    });
    setShowNewOrderModal(false);
    setSelectedCategory("All Items");
    alert(`Order #${editingOrder.id} updated successfully!`);
  };

  const deleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setAllOrders((prev) => prev.filter((order) => order.id !== orderId));
      alert(`Order #${orderId} deleted successfully!`);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const startEditOrder = (order) => {
    if (order.type !== "restaurant" && order.type !== "darshini") {
      alert("Only restaurant and darshini orders can be edited");
      return;
    }
    setEditingOrder(order);
    setOrderType(order.type);
    setCurrentOrder({
      table: order.table,
      items: { ...order.items },
      total: order.total,
      branch: order.branch,
    });
    setShowNewOrderModal(true);
  };

  const processPayment = (order) => {
    setCompletedOrder(order);
    setCurrentView("payment");
  };

  const completePayment = () => {
    setAllOrders((prev) =>
      prev.map((order) =>
        order.id === completedOrder.id
          ? { ...order, paymentStatus: "paid", paymentMethod: paymentMethod }
          : order
      )
    );
    setShowReceipt(true);
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Tasty Bites Restaurant", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("123 Food Street, Main City", 20, 35);
    doc.text(`Date: ${order.timestamp.toLocaleDateString()}`, 20, 42);
    doc.text(`Order ID: #${order.id}`, 20, 49);
    doc.text(`Table/Order #: ${order.table}`, 20, 56);
    doc.text(`Branch: ${order.branch}`, 20, 63);

    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    doc.setFontSize(14);
    doc.text("Order Details", 20, 80);
    doc.setFontSize(10);
    let y = 90;
    Object.entries(order.items).forEach(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      doc.text(`${item?.name || "Unknown Item"} x ${quantity}`, 20, y);
      doc.text(`?${(item?.price || 0) * quantity}`, 170, y, { align: "right" });
      y += 10;
    });

    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Total: ?${order.total}`, 170, y, { align: "right" });
    y += 10;
    doc.text(`Payment Method: ${order.paymentMethod || paymentMethod}`, 20, y);

    doc.save(`receipt_order_${order.id}.pdf`);
  };

  const generateKOTPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Kitchen Order Ticket (KOT)", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Tasty Bites Restaurant", 20, 35);
    doc.text("123 Food Street, Main City", 20, 42);
    doc.text(`Date: ${order.timestamp.toLocaleDateString()}`, 20, 49);
    doc.text(`Order ID: #${order.id}`, 20, 56);
    doc.text(`Table/Order #: ${order.table}`, 20, 63);
    doc.text(`Branch: ${order.branch}`, 20, 70);

    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    doc.setFontSize(14);
    doc.text("KOT Details", 20, 85);
    doc.setFontSize(10);
    let y = 95;
    Object.entries(order.items).forEach(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      doc.text(`${item?.name || "Unknown Item"} x ${quantity}`, 20, y);
      y += 10;
    });

    doc.save(`kot_order_${order.id}.pdf`);
  };

  const showKOT = (order) => {
    setCurrentKOTOrder(order);
    setShowKOTModal(true);
  };

  const resetNewOrderModal = () => {
    setShowNewOrderModal(false);
    setEditingOrder(null);
    setCurrentOrder({ table: 1, items: {}, total: 0, branch: "Main Branch" });
    setSelectedCategory("All Items");
    setOrderType("restaurant");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAllOrders((prev) =>
        prev.map((order) => {
          if (order.status === "Pending" && Math.random() > 0.8) {
            return { ...order, status: "Preparing" };
          }
          if (order.status === "Preparing" && Math.random() > 0.9) {
            return { ...order, status: "Ready" };
          }
          return order;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Preparing":
        return <ChefHat className="w-4 h-4" />;
      case "Ready":
        return <Check className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "restaurant":
        return "bg-purple-100 text-purple-800";
      case "online":
        return "bg-blue-100 text-blue-800";
      case "darshini":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBranchColor = (branch) => {
    const branchColors = {
      "Main Branch": "bg-blue-100 text-blue-800",
      "Downtown Branch": "bg-green-100 text-green-800",
      "Uptown Branch": "bg-purple-100 text-purple-800",
      "Westside Branch": "bg-orange-100 text-orange-800",
    };
    return branchColors[branch] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading menu items...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-6 mt-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Order & Billing
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowNewOrderModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Order</span>
              </button>
              <button
                onClick={() => setCurrentView("orders")}
                className={`px-6 py-2 rounded-lg transition duration-200 flex items-center space-x-2 ${
                  currentView === "orders"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Orders ({allOrders.length})</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Orders View */}
        {currentView === "orders" && (
          <div>
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ?{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Paid Orders</p>
                    <p className="text-2xl font-bold text-green-600">
                      {paidOrders}
                    </p>
                    <p className="text-xs text-gray-500">
                      Unpaid: {unpaidOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Methods</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>UPI:</span>
                        <span className="font-semibold">{upiPayments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card:</span>
                        <span className="font-semibold">{cardPayments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash:</span>
                        <span className="font-semibold">{cashPayments}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                All Orders
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type
                  </label>
                  <select
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="online">Online</option>
                    <option value="darshini">Darshini</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {initialMenuCategories
                      .filter((cat) => cat !== "All Items")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md border">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
                <p className="text-gray-400 mb-6">
                  Try changing your filters or create a new order
                </p>
                <button
                  onClick={() => setShowNewOrderModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Create New Order
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 border-b sticky top-0">
                      <tr>
                        {[
                          "Order ID",
                          "Branch",
                          "Order Type",
                          "Table/Order#",
                          "Items",
                          "Categories",
                          "Payment Status",
                          "Order Status",
                          "Total Amount",
                          "Date",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((order, index) => (
                        <tr
                          key={order.id}
                          className={`hover:bg-gray-50 transition duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getBranchColor(
                                order.branch
                              )}`}
                            >
                              {order.branch}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getOrderTypeColor(
                                order.type
                              )}`}
                            >
                              {order.type.charAt(0).toUpperCase() +
                                order.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.type === "restaurant"
                              ? `Table ${order.table}`
                              : order.table}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {Object.entries(order.items).map(
                                ([itemId, quantity]) => {
                                  const item = menuItems.find(
                                    (m) => m.id === parseInt(itemId)
                                  );
                                  return (
                                    <div key={itemId} className="mb-1">
                                      {item?.name || "Unknown Item"} x{" "}
                                      {quantity}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {getOrderCategories(order)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </span>
                            {order.paymentMethod && (
                              <div className="text-xs text-gray-500 mt-1 capitalize">
                                via {order.paymentMethod}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ?{order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{order.timestamp.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {order.timestamp.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => showKOT(order)}
                                className="px-2 py-1 bg-[#69231B] text-white text-xs rounded hover:bg-[#5c1e15] transition duration-150"
                                title="View KOT"
                              >
                                <Printer className="w-3 h-3" />
                              </button>
                              {(order.type === "restaurant" ||
                                order.type === "darshini") && (
                                <button
                                  onClick={() => startEditOrder(order)}
                                  className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition duration-150"
                                  title="Edit Order"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition duration-150"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              {order.status === "Pending" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "Preparing")
                                  }
                                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition duration-150"
                                  title="Start Preparing"
                                >
                                  <ChefHat className="w-3 h-3" />
                                </button>
                              )}
                              {order.status === "Preparing" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "Ready")
                                  }
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition duration-150"
                                  title="Mark Ready"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              {order.status === "Ready" &&
                                order.paymentStatus === "unpaid" && (
                                  <button
                                    onClick={() => processPayment(order)}
                                    className="px-2 py-1 bg-[#69231B] text-white text-xs rounded hover:bg-[#7a2920] transition duration-150"
                                    title="Process Payment"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment View */}
        {currentView === "payment" && completedOrder && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Process Payment
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">
                  {completedOrder.type === "restaurant"
                    ? `Table ${completedOrder.table}`
                    : completedOrder.table}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Order ID: #{completedOrder.id}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Branch: {completedOrder.branch}
                </p>
                <div className="space-y-1 mb-3">
                  {Object.entries(completedOrder.items).map(
                    ([itemId, quantity]) => {
                      const item = menuItems.find(
                        (m) => m.id === parseInt(itemId)
                      );
                      return (
                        <div
                          key={itemId}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item?.name || "Unknown Item"} x {quantity}
                          </span>
                          <span>?{(item?.price || 0) * quantity}</span>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">
                      ?{completedOrder.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
              <div className="space-y-3">
                {["cash", "card", "upi"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`w-full p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition duration-200 ${
                      paymentMethod === method
                        ? `border-${
                            method === "cash"
                              ? "green"
                              : method === "card"
                              ? "blue"
                              : "purple"
                          }-500 bg-${
                            method === "cash"
                              ? "green"
                              : method === "card"
                              ? "blue"
                              : "purple"
                          }-50`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {method === "cash" && <DollarSign className="w-5 h-5" />}
                    {method === "card" && <CreditCard className="w-5 h-5" />}
                    {method === "upi" && <Smartphone className="w-5 h-5" />}
                    <span>
                      {method === "upi"
                        ? "UPI (GPay/PhonePe)"
                        : method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={completePayment}
                disabled={!paymentMethod}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
              >
                Complete Payment
              </button>
              <button
                onClick={() => setCurrentView("orders")}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* New Order Modal */}
        {showNewOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingOrder
                    ? `Edit Order #${editingOrder.id}`
                    : "New Order"}
                </h2>
                <button
                  onClick={resetNewOrderModal}
                  className="text-gray-500 hover:text-gray-700 transition duration-150"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 py-3 border-b bg-white">
                <div className="flex flex-wrap gap-2">
                  {["restaurant", "online", "darshini"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                        orderType === type
                          ? `bg-${
                              type === "restaurant"
                                ? "purple"
                                : type === "online"
                                ? "blue"
                                : "orange"
                            }-600 text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex max-h-[70vh]">
                <div className="w-64 bg-gray-50 border-r overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {menuCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg font-medium transition duration-200 ${
                            selectedCategory === category
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      Branch <span className="text-red-500 ml-1">*</span>
                    </h4>
                    <select
                      value={currentOrder.branchId}
                      onChange={async (e) => {
                        const branchId = e.target.value;
                        const selectedBranch = branches.find(
                          (b) => b._id === branchId
                        );

                        // Fetch tables for selected branch
                        if (branchId && orderType === "restaurant") {
                          try {
                            const isDevelopment =
                              window.location.hostname === "localhost" ||
                              window.location.hostname === "127.0.0.1";
                            const API_BASE_URL = isDevelopment
                              ? "https://crm.jagalikoota.com/api/v1/hotel"
                              : "https://crm.jagalikoota.com/api/v1/hotel";

                            const tablesResponse = await axios.get(
                              `${API_BASE_URL}/table`,
                              {
                                params: { branchId },
                              }
                            );
                            const branchTables = Array.isArray(
                              tablesResponse.data
                            )
                              ? tablesResponse.data
                              : [];
                            setTables(branchTables);
                          } catch (error) {
                            console.error("Error fetching tables:", error);
                            setTables([]);
                          }
                        } else {
                          setTables([]);
                        }

                        setCurrentOrder((prev) => ({
                          ...prev,
                          branchId: branchId,
                          branch:
                            selectedBranch?.branchName ||
                            selectedBranch?.restaurantName ||
                            "",
                          table: "",
                          tableId: "",
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={orderType === "restaurant"}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branchName ||
                            branch.restaurantName ||
                            "Unknown"}
                        </option>
                      ))}
                    </select>
                  </div>
                  {orderType === "restaurant" && (
                    <div className="p-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Table Number <span className="text-red-500">*</span>
                      </h4>
                      {currentOrder.branchId ? (
                        <select
                          value={currentOrder.tableId}
                          onChange={(e) => {
                            const tableId = e.target.value;
                            const selectedTable = tables.find(
                              (t) => t._id === tableId
                            );
                            setCurrentOrder((prev) => ({
                              ...prev,
                              tableId: tableId,
                              table: selectedTable?.number || "",
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Table</option>
                          {tables.map((table) => (
                            <option key={table._id} value={table._id}>
                              Table #{table.number} -{" "}
                              {table.status || "available"}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Please select a branch first
                        </p>
                      )}
                    </div>
                  )}
                  {orderType !== "restaurant" && (
                    <div className="p-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {orderType === "darshini"
                          ? "Darshini Number"
                          : "Online Order ID"}
                      </h4>
                      <input
                        type="text"
                        value={
                          typeof currentOrder.table === "string"
                            ? currentOrder.table.replace(/[^\d]/g, "")
                            : currentOrder.table
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          const prefix =
                            orderType === "darshini" ? "Darshini-" : "Online-";
                          setCurrentOrder((prev) => ({
                            ...prev,
                            table: value ? `${prefix}${value}` : prefix,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={orderType === "darshini" ? "123" : "123"}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedCategory} ({filteredItems.length} items)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md border p-4 hover:shadow-lg transition duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.category}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            ?{item.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => removeFromOrder(item.id)}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                              disabled={!currentOrder.items[item.id]}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-semibold text-lg">
                              {currentOrder.items[item.id] || 0}
                            </span>
                            <button
                              onClick={() => addToOrder(item.id)}
                              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition duration-150"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {currentOrder.items[item.id] > 0 && (
                            <span className="text-sm font-medium text-gray-600">
                              ?{item.price * currentOrder.items[item.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-80 bg-white border-l overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Order Summary
                    </h3>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">
                        Branch: {currentOrder.branch}
                      </p>
                      <p className="text-sm">
                        {orderType === "restaurant"
                          ? `Table: ${currentOrder.table}`
                          : orderType === "darshini"
                          ? `Darshini: ${currentOrder.table}`
                          : `Online Order: ${currentOrder.table}`}
                      </p>
                    </div>
                    {Object.keys(currentOrder.items).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No items selected
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(currentOrder.items).map(
                          ([itemId, quantity]) => {
                            const item = menuItems.find(
                              (m) => m.id === parseInt(itemId)
                            );
                            return (
                              <div
                                key={itemId}
                                className="flex justify-between items-center py-2 border-b"
                              >
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium">
                                      {item?.name || "Unknown Item"}
                                    </p>
                                    <button
                                      onClick={() =>
                                        removeItemCompletely(itemId)
                                      }
                                      className="text-red-500 hover:text-red-700 transition duration-150"
                                      title="Remove item completely"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => removeFromOrder(itemId)}
                                        className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-sm">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() => addToOrder(itemId)}
                                        className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition duration-150"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      ?{item?.price || 0} x {quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-semibold ml-4">
                                  ?{(item?.price || 0) * quantity}
                                </p>
                              </div>
                            );
                          }
                        )}
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total</span>
                            <span className="text-green-600">
                              ?{currentOrder.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t bg-gray-50">
                    {Object.keys(currentOrder.items).length > 0 && (
                      <div className="space-y-3">
                        {editingOrder ? (
                          <button
                            onClick={updateOrder}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2"
                          >
                            <Save className="w-5 h-5" />
                            <span>Update Order</span>
                          </button>
                        ) : (
                          <button
                            onClick={createOrder}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Create Order</span>
                          </button>
                        )}
                        <button
                          onClick={resetNewOrderModal}
                          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Payment Completed!
                </h2>
                <p className="text-gray-600">Receipt has been generated</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Receipt Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span>#{completedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>
                      {completedOrder.type.charAt(0).toUpperCase() +
                        completedOrder.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span>{completedOrder.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Table/Order #:</span>
                    <span>{completedOrder.table}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Amount Paid:</span>
                    <span>?{completedOrder.total}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generatePDF(completedOrder)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    setCompletedOrder(null);
                    setPaymentMethod("");
                    setCurrentView("orders");
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  New Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KOT Modal */}
        {showKOTModal && currentKOTOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-2">
                  Kitchen Order Ticket
                </h2>
                <p className="text-gray-600">Order #{currentKOTOrder.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">KOT Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span>#{currentKOTOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>
                      {currentKOTOrder.type.charAt(0).toUpperCase() +
                        currentKOTOrder.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span>{currentKOTOrder.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Table/Order #:</span>
                    <span>
                      {currentKOTOrder.type === "restaurant"
                        ? `Table ${currentKOTOrder.table}`
                        : currentKOTOrder.table}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-semibold">Items:</h4>
                    {Object.entries(currentKOTOrder.items).map(
                      ([itemId, quantity]) => {
                        const item = menuItems.find(
                          (m) => m.id === parseInt(itemId)
                        );
                        return (
                          <div
                            key={itemId}
                            className="flex justify-between text-sm mt-1"
                          >
                            <span>
                              {item?.name || "Unknown Item"} x {quantity}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateKOTPDF(currentKOTOrder)}
                  className="flex-1 bg-[#69231B] text-white py-2 rounded-lg hover:bg-[#5c1e15] transition duration-200 flex items-center justify-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download KOT PDF</span>
                </button>
                <button
                  onClick={() => {
                    setShowKOTModal(false);
                    setCurrentKOTOrder(null);
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPOS;
