"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { io } from "socket.io-client";
import {
  ChefHat,
  Clock,
  Search,
  Bell,
  CheckCircle,
  AlertCircle,
  Coffee,
  Utensils,
  Timer,
  Menu,
  Filter,
  RotateCcw,
  CheckSquare,
  Clock3,
  Send,
  Laptop,
  Users,
  Store,
  Truck,
  Loader2,
} from "lucide-react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient();

function KitchenManagementWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <KitchenManagement />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{
          fontSize: "16px",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      />
    </QueryClientProvider>
  );
}

function KitchenManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("pending");
  const [countdown, setCountdown] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [branches, setBranches] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  const queryClientInstance = useQueryClient();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/branch`);
      if (response.ok) {
        const branchesData = await response.json();
        setBranches(branchesData);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Initialize Socket.io connection
  useEffect(() => {
    // Only initialize if not already connected
    if (socketRef.current?.connected) {
      console.log("🔌 Socket.io already connected");
      return;
    }

    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "https://crm.jagalikoota.com";

    console.log("🔌 Connecting to Socket.io server:", SOCKET_URL);

    // Disconnect existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection events
    socketRef.current.on("connect", () => {
      console.log("✅ Socket.io connected:", socketRef.current.id);
      setSocketConnected(true);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Socket.io disconnected:", reason);
      setSocketConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Socket.io connection error:", error);
      setSocketConnected(false);
    });

    // Listen for order updates
    socketRef.current.on("order-updated", (data) => {
      console.log("📨 Received order update:", data);

      // Play sound for ready items
      if (data.status === "ready") {
        playSound("ready");
      }

      toast.info(`Order ${data.orderId} status updated to ${data.status}`, {
        toastId: "order-update",
      });
      queryClientInstance.invalidateQueries({ queryKey: ["orders"] });
      queryClientInstance.invalidateQueries({ queryKey: ["stats"] });
    });

    // Listen for new orders
    socketRef.current.on("order-created", (data) => {
      console.log("📨 Received new order:", data);

      // Play sound for new orders
      playSound("new-order");

      toast.success(`🆕 New order: ${data.order.orderNumber}`, {
        toastId: "new-order",
        autoClose: 3000,
      });
      queryClientInstance.invalidateQueries({ queryKey: ["orders"] });
      queryClientInstance.invalidateQueries({ queryKey: ["stats"] });
    });

    // Listen for stats updates
    socketRef.current.on("stats-updated", (data) => {
      console.log("📨 Received stats update:", data);
      queryClientInstance.invalidateQueries({ queryKey: ["stats"] });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        console.log("🔌 Disconnecting Socket.io");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []); // Remove queryClientInstance from deps to prevent re-renders

  // Join branch room when branch selection changes
  useEffect(() => {
    if (socketRef.current?.connected && selectedBranch !== "all") {
      console.log("🏢 Joining branch room:", selectedBranch);
      socketRef.current.emit("join-branch", selectedBranch);
    }
  }, [selectedBranch]);

  // Play sound alerts
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      if (type === "new-order") {
        // Ding sound for new orders (high pitch)
        createDingSound(audioContext, 800, 0.2);
      } else if (type === "ready") {
        // Beep sound for ready items (lower pitch)
        createDingSound(audioContext, 600, 0.3);
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const createDingSound = (audioContext, frequency, duration) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const fetchOrders = async () => {
    try {
      const [staffResponse, counterResponse, onlineResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/staff-order`),
          fetch(`${API_BASE_URL}/counter-order/orders`),
          fetch(`${API_BASE_URL}/order`),
        ]);

      const staffData = staffResponse.ok
        ? await staffResponse.json()
        : { orders: [] };
      const counterData = counterResponse.ok
        ? await counterResponse.json()
        : { orders: [] };
      const onlineData = onlineResponse.ok
        ? await onlineResponse.json()
        : { data: [] };

      // Map order status to kitchen management status
      const mapOrderStatus = (status) => {
        const lowerStatus = (status || "").toLowerCase();
        if (["completed", "delivered", "served"].includes(lowerStatus))
          return "Completed";
        if (
          ["preparing", "in-progress", "out for delivery"].includes(lowerStatus)
        )
          return "In Progress";
        if (["pending", "confirmed"].includes(lowerStatus)) return "Pending";
        if (lowerStatus === "cancelled") return "Cancelled";
        return "Pending"; // Default fallback
      };

      // Map item status for kitchen workflow
      const mapItemStatus = (orderStatus) => {
        const lowerStatus = (orderStatus || "").toLowerCase();
        if (["completed", "delivered", "served"].includes(lowerStatus))
          return "Ready";
        if (["preparing", "in-progress"].includes(lowerStatus))
          return "In Progress";
        return "Pending"; // Default for new orders
      };

      // Process Staff Orders (Restaurant Orders)
      const staffOrders = (staffData.orders || []).map((order) => ({
        _id: order._id,
        orderNumber: order.orderId || `STAFF-${order._id}`,
        orderType: "Restaurant Order",
        tableNumber: order.tableNumber || order.tableId?.number || "N/A",
        waiterName: order.waiterName || "Staff",
        customerName: order.customerName || "Guest Order",
        orderTime: order.orderTime || order.createdAt,
        status: order.status, // Keep original status
        kitchenStatus: mapOrderStatus(order.status),
        paymentStatus: order.paymentStatus || "pending",
        subtotal: order.subtotal || 0,
        grandTotal: order.grandTotal || order.totalAmount || 0,
        branchId: order.branchId?._id || order.branchId,
        branchName:
          order.branchName || order.branchId?.name || "Unknown Branch",
        originalOrderData: order, // Keep original for API updates
        items: (order.items || []).map((item) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          status: mapItemStatus(order.status),
          image: item.image,
          description: item.description || "",
          notes: order.notes || "",
        })),
      }));

      // Process Counter Orders (Darshini Orders)
      const counterOrders = (counterData.orders || []).map((order) => ({
        _id: order.id,
        orderNumber: order.invoice?.invoiceNumber || `COUNTER-${order.id}`,
        orderType: "Darshini Order",
        tableNumber: "Counter",
        waiterName: "Counter Staff",
        customerName: order.customerName || "Walk-in Customer",
        orderTime: order.createdAt,
        status: order.orderStatus, // Keep original status
        kitchenStatus: mapOrderStatus(order.orderStatus),
        paymentStatus: order.paymentStatus || "pending",
        subtotal: order.subtotal || 0,
        grandTotal: order.grandTotal || order.totalAmount || 0,
        branchId: order.branch?.id,
        branchName: order.branch?.name || "Unknown Branch",
        phoneNumber: order.phoneNumber,
        originalOrderData: order, // Keep original for API updates
        items: (order.items || []).map((item) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          status: mapItemStatus(order.orderStatus),
          notes: "",
        })),
      }));

      // Process Online Orders
      const onlineOrders = (onlineData.data || []).map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber || `ONLINE-${order._id}`,
        orderType: "Online Order",
        tableNumber: "Online",
        waiterName: "Online Platform",
        customerName: order.name || order.userId?.name || "Online Customer",
        orderTime: order.createdAt,
        status: order.status, // Keep original status
        kitchenStatus: mapOrderStatus(order.status),
        paymentStatus: order.paymentStatus || "pending",
        subtotal: order.subtotal || 0,
        grandTotal: order.total || order.grandTotal || 0,
        branchId: order.branchId?._id,
        branchName: order.branchId?.name || "Unknown Branch",
        deliveryAddress: order.deliveryAddress,
        deliveryOption: order.deliveryOption,
        phone: order.phone,
        originalOrderData: order, // Keep original for API updates
        items: (order.items || []).map((item) => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          status: mapItemStatus(order.status),
          image: item.image,
          notes: order.specialInstructions || "",
        })),
      }));

      // Combine all orders
      let allOrders = [...staffOrders, ...counterOrders, ...onlineOrders];

      // Filter to only today's orders (local timezone)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      allOrders = allOrders.filter((o) => {
        const t = new Date(o.orderTime);
        return t >= startOfToday && t <= endOfToday;
      });

      // Filter by branch if a specific branch is selected
      if (selectedBranch !== "all") {
        allOrders = allOrders.filter((order) => {
          // Handle different branch ID structures from different APIs
          const orderBranchId = order.branchId;

          // String comparison - handles both string IDs and ObjectId strings
          if (typeof orderBranchId === "string") {
            return orderBranchId === selectedBranch;
          }

          // Object with _id property
          if (orderBranchId?._id) {
            return orderBranchId._id === selectedBranch;
          }

          // Object with id property (counter orders)
          if (orderBranchId?.id) {
            return orderBranchId.id === selectedBranch;
          }

          // Fallback: compare by branch name
          if (order.branchName && branches.length > 0) {
            const selectedBranchObj = branches.find(
              (b) => b._id === selectedBranch
            );
            return (
              selectedBranchObj && order.branchName === selectedBranchObj.name
            );
          }

          return false;
        });
      }

      return allOrders.sort(
        (a, b) => new Date(b.orderTime) - new Date(a.orderTime)
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const orders = await fetchOrders();

      const stats = {
        pending: 0,
        inProgress: 0,
        ready: 0,
        completed: 0,
      };

      orders.forEach((order) => {
        if (order.status === "Completed") {
          stats.completed++;
        } else if (order.status === "In Progress") {
          stats.inProgress++;
        } else if (order.status === "Ready") {
          stats.ready++;
        } else {
          stats.pending++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error calculating stats:", error);
      return { pending: 0, inProgress: 0, ready: 0, completed: 0 };
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "https://crm.jagalikoota.com/api/kitchen/notifications?limit=50"
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Notifications endpoint returned non-JSON content");
          return [];
        }
        const data = await response.json();
        return data.notifications || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  const {
    data: orders = [],
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 10000,
    onError: (error) => {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders", { toastId: "orders-error" });
    },
  });

  const {
    data: stats = { pending: 0, inProgress: 0, ready: 0, completed: 0 },
    isLoading: loadingStats,
    isFetching: fetchingStats,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 10000,
    onError: (error) => {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch stats", { toastId: "stats-error" });
    },
  });

  const {
    data: notifications = [],
    isLoading: loadingNotifications,
    isFetching: fetchingNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 10000,
  });

  const loading = loadingOrders || loadingStats || loadingNotifications;

  const handleRefresh = () => {
    toast.success("Data refresh initiated!", { toastId: "refresh-action" });
    setRefreshKey((prev) => prev + 1);
    queryClientInstance.invalidateQueries({ queryKey: ["orders"] });
    queryClientInstance.invalidateQueries({ queryKey: ["stats"] });
    queryClientInstance.invalidateQueries({ queryKey: ["notifications"] });
    setCountdown(10);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 10) {
      setRefreshKey(0);
    }
  }, [countdown]);

  // Update order status (preparing → ready → delivered)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) {
        toast.error("Order not found", { toastId: "order-not-found" });
        return;
      }

      let endpoint = "";
      let body = {};
      let apiStatus = "";

      // Map UI status to API status
      switch (newStatus) {
        case "Pending":
          apiStatus = "pending";
          break;
        case "In Progress":
          apiStatus = "preparing";
          break;
        case "Ready":
          apiStatus = "served"; // For staff orders, "ready" maps to "served"
          break;
        case "Completed":
          apiStatus = "completed";
          break;
        default:
          apiStatus = newStatus.toLowerCase().replace(" ", "-");
      }

      // Determine endpoint based on order type
      if (order.orderType === "Restaurant Order") {
        // Staff orders API - expects: pending, preparing, served, completed, cancelled
        endpoint = `${API_BASE_URL}/staff-order/${order._id}/status`;
        body = { status: apiStatus };
      } else if (order.orderType === "Darshini Order") {
        // Counter orders API - expects: pending, processing, completed, cancelled
        endpoint = `${API_BASE_URL}/counter-order/orders/${order._id}/order-status`;
        // Map counter order status
        let counterStatus = apiStatus;
        if (apiStatus === "preparing") counterStatus = "processing";
        if (apiStatus === "served") counterStatus = "completed";
        body = { orderStatus: counterStatus };
      } else if (order.orderType === "Online Order") {
        // Online orders API - expects: pending, confirmed, preparing, out for delivery, delivered, cancelled
        endpoint = `${API_BASE_URL}/order/${order._id}/status`;
        // Map online order status
        let onlineStatus = apiStatus;
        if (apiStatus === "preparing") onlineStatus = "preparing";
        if (apiStatus === "served") onlineStatus = "delivered";
        body = { status: onlineStatus };
      }

      if (!endpoint) {
        toast.error("Invalid order type", { toastId: "invalid-order-type" });
        return;
      }

      console.log("Updating order:", {
        orderId,
        newStatus,
        apiStatus,
        endpoint,
        body,
      });

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        queryClientInstance.invalidateQueries({ queryKey: ["orders"] });
        queryClientInstance.invalidateQueries({ queryKey: ["stats"] });
        toast.success(`Order status updated to ${newStatus}!`, {
          toastId: "order-status-updated",
        });
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(`Failed to update order status: ${error.message}`, {
        toastId: "order-status-error",
      });
    }
  };

  const updateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) return;

      // Map kitchen status to API status for order updates
      let apiStatus;
      switch (newStatus) {
        case "In Progress":
          apiStatus = "preparing";
          break;
        case "Ready":
          apiStatus = "preparing"; // Keep as preparing until all items are ready
          break;
        case "Completed":
          apiStatus = "delivered";
          break;
        default:
          apiStatus = "preparing";
      }

      // Update the order status via API when items change status
      await updateOrderStatus(orderId, apiStatus);

      // Create notification when item is marked as ready
      if (newStatus === "Ready") {
        const item = order.items.find((i) => i._id === itemId);
        try {
          await fetch("https://crm.jagalikoota.com/api/kitchen/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "item_ready",
              message: `${item?.name || "Item"} is ready for serving!`,
              orderNumber: order.orderNumber,
              priority: "medium",
            }),
          });

          // Refresh notifications to show the new one
          queryClientInstance.invalidateQueries({
            queryKey: ["notifications"],
          });
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      }

      // Show success message with notification for ready items
      if (newStatus === "Ready") {
        const item = order.items.find((i) => i._id === itemId);
        toast.success(`🍽️ ${item?.name || "Item"} is ready for serving!`, {
          toastId: "item-ready",
          autoClose: 5000,
        });

        // Add visual notification for waiter
        toast.info(
          `📢 Notify waiter: ${order.waiterName || "Staff"} - Order ${
            order.orderNumber
          }`,
          {
            toastId: "waiter-notification",
            autoClose: 8000,
          }
        );
      } else if (newStatus === "In Progress") {
        const item = order.items.find((i) => i._id === itemId);
        toast.success(`👨‍🍳 Started cooking ${item?.name || "item"}`, {
          toastId: "item-started",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating item status:", error);
      toast.error(`Failed to update item status: ${error.message}`, {
        toastId: "item-status-error",
      });
    }
  };

  const completeOrder = async (orderId) => {
    await updateOrderStatus(orderId, "delivered");
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `https://crm.jagalikoota.com/api/kitchen/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        queryClientInstance.invalidateQueries({ queryKey: ["notifications"] });
        toast.success("Notification marked as read", {
          toastId: "notification-read",
        });
      } else {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read", {
        toastId: "notification-read-error",
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch(
        "https://crm.jagalikoota.com/api/kitchen/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        queryClientInstance.invalidateQueries({ queryKey: ["notifications"] });
        toast.success("All notifications marked as read", {
          toastId: "notifications-read-all",
        });
      } else {
        throw new Error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read", {
        toastId: "notifications-read-all-error",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-500 bg-yellow-100";
      case "In Progress":
        return "text-blue-500 bg-blue-100";
      case "Ready":
        return "text-green-500 bg-green-100";
      case "Completed":
        return "text-gray-500 bg-gray-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "Online Order":
        return <Laptop className="w-5 h-5 text-blue-500" />;
      case "Restaurant Order":
        return <Users className="w-5 h-5 text-green-500" />;
      case "Darshini Order":
        return <Store className="w-5 h-5 text-purple-500" />;
      default:
        return <Utensils className="w-5 h-5" />;
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "Online Order":
        return "bg-blue-100 text-blue-800";
      case "Restaurant Order":
        return "bg-green-100 text-green-800";
      case "Darshini Order":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeElapsed = (orderTime) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins === 1) {
      return "1 minute ago";
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
  };

  // Check if order/item is delayed
  const isDelayed = (orderTime, status) => {
    const orderDate = new Date(orderTime);
    const now = new Date();
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);

    // Warning thresholds (in minutes)
    const thresholds = {
      pending: 5, // 5 mins for pending
      preparing: 20, // 20 mins for preparing
      ready: 5, // 5 mins for ready items
    };

    return diffMins > (thresholds[status] || 15);
  };

  const getDelayColor = (orderTime, status) => {
    if (isDelayed(orderTime, status)) {
      return "text-red-600 font-bold bg-red-100 px-2 py-1 rounded";
    }
    return "text-gray-600";
  };

  const areAllItemsReady = (order) => {
    return order.items.every((item) => item.status === "Ready");
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by active tab
    if (activeTab === "pending" && order.status === "Completed") return false;
    if (activeTab === "completed" && order.status !== "Completed") return false;
    if (activeTab === "ready") {
      // Show orders that have at least one ready item but are not completed
      const hasReadyItems = order.items.some((item) => item.status === "Ready");
      if (!hasReadyItems || order.status === "Completed") return false;
    }

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "All" ||
      order.items.some((item) => item.category === categoryFilter);

    const matchesStatus =
      statusFilter === "All" ||
      order.items.some((item) => item.status === statusFilter);

    const matchesOrderType =
      orderTypeFilter === "All" || order.orderType === orderTypeFilter;

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesOrderType
    );
  });

  const pendingOrders = stats.pending + stats.inProgress;
  const readyOrders = stats.ready;
  const completedOrders = stats.completed;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] via-[#FCFCFC] to-[#FCFCFC] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Kitchen Display System
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      socketConnected
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {socketConnected ? "Live" : "Disconnected"} • Orders from{" "}
                  {selectedBranch === "all"
                    ? "All Branches"
                    : branches.find((b) => b._id === selectedBranch)?.name ||
                      "Selected Branch"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-gray-800">
                {countdown}s
              </span>
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 text-blue-500 rounded-full border-4 border-blue-300 hover:border-blue-500 hover:bg-blue-50 shadow-lg transition-all duration-300"
                title="Refresh"
                onClick={handleRefresh}
                disabled={
                  fetchingOrders || fetchingStats || fetchingNotifications
                }
              >
                {fetchingOrders || fetchingStats || fetchingNotifications ? (
                  <Loader2 className="w-10 h-10 animate-spin-slow" />
                ) : (
                  <RotateCcw
                    className="w-10 h-10 transition-transform duration-1000"
                    style={{ transform: `rotate(${refreshKey * 360}deg)` }}
                  />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="relative w-16 h-16 rounded-full border-4 border-gray-300 hover:border-blue-500 hover:bg-blue-50 shadow-lg transition-all duration-300"
                title="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-10 h-10 text-gray-700" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 text-lg flex items-center justify-center shadow-md">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-2 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-yellow-500 p-4 shadow-lg">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Pending
                    </p>
                    <p className="text-4xl font-bold text-yellow-600">
                      {pendingOrders}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500 p-4 shadow-lg">
                    <Timer className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      In Progress
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {stats.inProgress}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-500 p-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Ready
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      {readyOrders + completedOrders}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <Card className="mb-6 border-blue-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Kitchen Notifications
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={markAllNotificationsAsRead}
                    disabled={notifications.filter((n) => !n.read).length === 0}
                  >
                    Mark All Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNotifications(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {notifications.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.read
                          ? "bg-gray-50 border-gray-300"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : notification.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {notification.priority}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                notification.type === "item_ready"
                                  ? "bg-green-100 text-green-800"
                                  : notification.type === "new_order"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {notification.type.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 font-medium">
                            {notification.message}
                          </p>
                          {notification.orderNumber && (
                            <p className="text-xs text-gray-600 mt-1">
                              Order: {notification.orderNumber}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              markNotificationAsRead(notification._id)
                            }
                            className="ml-2"
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    You're all caught up! No new notifications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Orders
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "ready"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("ready")}
          >
            Ready Items ({stats.ready})
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "completed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Orders
          </button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order ID, table, customer, or item..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Branch Filter */}
                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">📍 All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                >
                  <option value="All">All Order Types</option>
                  <option value="Online Order">Online Orders</option>
                  <option value="Restaurant Order">Restaurant Orders</option>
                  <option value="Darshini Order">Darshini Orders</option>
                </select>

                <select
                  className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready">Ready</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <Card
                key={order._id}
                className="overflow-hidden border-2 shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div
                  className={`p-6 border-b-4 flex flex-col gap-4 ${
                    order.status === "ready"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                      : order.status === "preparing"
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300"
                      : "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-4 rounded-xl shadow-lg ${
                          order.status === "ready"
                            ? "bg-green-500"
                            : order.status === "preparing"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {getOrderTypeIcon(order.orderType)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          {order.orderNumber}
                          {isDelayed(order.orderTime, order.status) && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded animate-pulse">
                              ⚠️ DELAYED
                            </span>
                          )}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${getDelayColor(
                            order.orderTime,
                            order.status
                          )}`}
                        >
                          {getTimeElapsed(order.orderTime)} • {order.branchName}
                          {isDelayed(order.orderTime, order.status) && (
                            <span className="ml-2">
                              🚨 Taking longer than expected!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${getOrderTypeColor(
                          order.orderType
                        )}`}
                      >
                        {order.orderType}
                      </span>

                      {order.orderType === "Restaurant Order" ? (
                        <span className="bg-white text-gray-800 text-sm px-4 py-2 rounded-full shadow-md font-medium">
                          🪑 Table {order.tableNumber} • 👤 {order.waiterName}
                        </span>
                      ) : (
                        <span className="bg-white text-gray-800 text-sm px-4 py-2 rounded-full shadow-md font-medium">
                          👤 {order.customerName}
                        </span>
                      )}

                      <span
                        className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${getStatusColor(
                          order.kitchenStatus || order.status
                        )}`}
                      >
                        {order.status === "preparing"
                          ? "🔥 PREPARING"
                          : order.status === "ready"
                          ? "✅ READY"
                          : order.status === "delivered"
                          ? "✓ DELIVERED"
                          : "⏳ PENDING"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Status Update Buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {order.status !== "delivered" &&
                      order.status !== "completed" && (
                        <>
                          {order.status === "preparing" && (
                            <Button
                              size="lg"
                              onClick={() =>
                                updateOrderStatus(order._id, "ready")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                              ✓ MARK AS READY
                            </Button>
                          )}
                          {order.status === "ready" && (
                            <Button
                              size="lg"
                              onClick={() =>
                                updateOrderStatus(order._id, "delivered")
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                              ✓ MARK AS DELIVERED
                            </Button>
                          )}
                          {(order.status === "pending" ||
                            order.status !== "preparing") &&
                            order.status !== "ready" &&
                            order.status !== "delivered" && (
                              <Button
                                size="lg"
                                onClick={() =>
                                  updateOrderStatus(order._id, "preparing")
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                              >
                                🔥 START COOKING
                              </Button>
                            )}
                        </>
                      )}
                    {order.status === "delivered" && (
                      <div className="bg-green-100 text-green-700 font-bold text-lg px-6 py-3 rounded-lg shadow-md">
                        ✓ ORDER COMPLETED
                      </div>
                    )}
                    <div className="ml-auto text-sm font-medium text-gray-700">
                      💰 Payment: {order.paymentStatus}
                    </div>
                  </div>
                </div>

                <CardContent className="p-0 bg-white">
                  <div className="p-4 bg-gray-50 border-b-2 border-gray-200">
                    <h4 className="text-lg font-bold text-gray-700">
                      📦 ORDER ITEMS
                    </h4>
                  </div>
                  <div>
                    {order.items.map((item, index) => (
                      <div
                        key={item._id}
                        className={`p-6 flex justify-between items-center border-b-2 last:border-b-0 ${
                          item.status === "Ready" && activeTab === "ready"
                            ? "bg-green-50 border-l-8 border-l-green-500"
                            : item.status === "In Progress"
                            ? "bg-blue-50 border-l-8 border-l-blue-500"
                            : "bg-white border-l-8 border-l-gray-300"
                        } ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ${
                              item.status === "Ready"
                                ? "bg-green-500 text-white"
                                : item.status === "In Progress"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                              {item.name}
                              {item.status === "Ready" &&
                                activeTab === "ready" && (
                                  <span className="text-green-600 text-2xl animate-bounce">
                                    🔔
                                  </span>
                                )}
                            </div>
                            <div className="text-base text-gray-600 mt-1">
                              {item.price * item.quantity} ₹ each •{" "}
                              {item.quantity} qty = ₹
                              {item.price * item.quantity}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-orange-600 font-medium mt-1">
                                📝 {item.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`text-base font-bold px-6 py-3 rounded-full shadow-lg ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          {activeTab === "pending" &&
                            order.status !== "Completed" && (
                              <div className="flex gap-2">
                                {item.status === "Pending" && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      updateItemStatus(
                                        order._id,
                                        item._id,
                                        "In Progress"
                                      )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Start Cooking
                                  </Button>
                                )}

                                {item.status === "In Progress" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateItemStatus(
                                        order._id,
                                        item._id,
                                        "Ready"
                                      )
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                  >
                                    Mark Ready
                                  </Button>
                                )}

                                {item.status === "Ready" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="bg-green-100 text-green-800 border-green-300"
                                  >
                                    ✓ Ready
                                  </Button>
                                )}
                              </div>
                            )}

                          {activeTab === "ready" && item.status === "Ready" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-100 text-green-800 border-green-300"
                                disabled
                              >
                                ✓ Ready for Serving
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeTab === "pending" &&
                    areAllItemsReady(order) &&
                    order.status !== "Completed" && (
                      <div className="p-4 bg-green-50 flex justify-between items-center">
                        <div className="font-medium text-green-800">
                          All items are ready!
                        </div>
                        <Button
                          onClick={() => completeOrder(order._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Order
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600">
                  {searchQuery ||
                  categoryFilter !== "All" ||
                  statusFilter !== "All" ||
                  orderTypeFilter !== "All"
                    ? "Try adjusting your filters"
                    : activeTab === "pending"
                    ? "All orders have been completed"
                    : activeTab === "ready"
                    ? "No items are ready for serving yet"
                    : "No orders have been completed yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default KitchenManagementWrapper;
