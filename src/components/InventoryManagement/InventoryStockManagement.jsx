import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  Store,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API Base URL
let API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");
const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
  ? `${API_BASE_URL}/hotel`
  : `${API_BASE_URL}/api/v1/hotel`;

const InventoryStockManagement = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [stockData, setStockData] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [summary, setSummary] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchStores();
    fetchRawMaterials();
  }, []);

  useEffect(() => {
    if (selectedStore === "all") {
      fetchAllStoresStock();
    } else {
      fetchStoreStock();
    }
  }, [selectedStore, lowStockOnly]);

  const fetchStores = async () => {
    try {
      const response = await fetch(`${HOTEL_API_BASE}/store-location`);
      const data = await response.json();
      if (data.success) {
        setStores(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch(`${HOTEL_API_BASE}/raw-material`);
      const data = await response.json();
      if (data.success) {
        setRawMaterials(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const fetchStoreStock = async () => {
    try {
      setLoading(true);
      const url = `${HOTEL_API_BASE}/store-inventory/store/${selectedStore}${
        lowStockOnly ? "?lowStock=true" : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setStockData(data.data || []);
        calculateSummary(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching store stock:", error);
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStoresStock = async () => {
    try {
      setLoading(true);
      const url = `${HOTEL_API_BASE}/store-inventory/stores/all${
        lowStockOnly ? "?lowStock=true" : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        // Flatten the data for display
        const flattened = [];
        data.data.forEach((store) => {
          store.materials.forEach((material) => {
            flattened.push({
              ...material,
              storeName: store.store.name,
              storeAddress: store.store.address,
            });
          });
        });
        setStockData(flattened);
        calculateSummary(flattened);
      }
    } catch (error) {
      console.error("Error fetching all stores stock:", error);
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalItems = data.length;
    const lowStockItems = data.filter((item) => {
      const material = item.rawMaterialId;
      return material && item.quantity <= material.minLevel;
    }).length;
    const totalValue = data.reduce((sum, item) => {
      return sum + (item.quantity * item.costPrice || 0);
    }, 0);

    setSummary({ totalItems, lowStockItems, totalValue });
  };

  const filteredStock = stockData.filter((item) => {
    const material = item.rawMaterialId;
    if (!material) return false;

    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStockStatus = (quantity, minLevel) => {
    if (quantity === 0)
      return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (quantity <= minLevel)
      return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Stock Management
          </h1>
          <p className="text-gray-600">
            View and manage stock across all store locations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalItems}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {summary.totalValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Location
              </label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Low Stock Only</span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  if (selectedStore === "all") {
                    fetchAllStoresStock();
                  } else {
                    fetchStoreStock();
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedStore === "all" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={selectedStore === "all" ? 9 : 8}
                      className="px-6 py-4 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStock.length === 0 ? (
                  <tr>
                    <td
                      colSpan={selectedStore === "all" ? 9 : 8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No stock data found
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => {
                    const material = item.rawMaterialId;
                    if (!material) return null;

                    const status = getStockStatus(
                      item.quantity,
                      material.minLevel
                    );
                    const totalValue = item.quantity * item.costPrice;

                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        {selectedStore === "all" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.storeName || "N/A"}
                              </div>
                              {item.storeAddress && (
                                <div className="text-sm text-gray-500">
                                  {item.storeAddress}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {material.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {material.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {material.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{item.costPrice?.toFixed(2) || "0.00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{totalValue.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {material.minLevel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStockManagement;
