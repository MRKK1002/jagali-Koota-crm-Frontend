import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const DistributionManagement = () => {
  const [distributions, setDistributions] = useState([]);
  const [stores, setStores] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fromStoreId: "",
    toStoreId: "",
    rawMaterialId: "",
    quantity: "",
    distributionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [availableStock, setAvailableStock] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState("all");

  useEffect(() => {
    fetchStores();
    fetchRawMaterials();
    fetchDistributions();
  }, []);

  useEffect(() => {
    if (formData.fromStoreId && formData.rawMaterialId) {
      fetchAvailableStock();
    }
  }, [formData.fromStoreId, formData.rawMaterialId]);

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

  const fetchAvailableStock = async () => {
    try {
      const response = await fetch(
        `${HOTEL_API_BASE}/store-inventory/store/${formData.fromStoreId}`
      );
      const data = await response.json();
      if (data.success) {
        const materialStock = data.data.find(
          (item) => item.rawMaterialId._id === formData.rawMaterialId
        );
        setAvailableStock(materialStock ? materialStock.quantity : 0);
      }
    } catch (error) {
      console.error("Error fetching available stock:", error);
      setAvailableStock(0);
    }
  };

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const url = `${HOTEL_API_BASE}/distribution${
        filterStore !== "all" ? `?fromStoreId=${filterStore}` : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setDistributions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching distributions:", error);
      toast.error("Failed to load distributions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fromStoreId ||
      !formData.toStoreId ||
      !formData.rawMaterialId ||
      !formData.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.fromStoreId === formData.toStoreId) {
      toast.error("Source and destination stores cannot be the same");
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Insufficient stock. Available: ${availableStock}`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${HOTEL_API_BASE}/distribution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Distribution created successfully");
        setShowModal(false);
        setFormData({
          fromStoreId: "",
          toStoreId: "",
          rawMaterialId: "",
          quantity: "",
          distributionDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setAvailableStock(0);
        fetchDistributions();
      } else {
        toast.error(data.message || "Failed to create distribution");
      }
    } catch (error) {
      console.error("Error creating distribution:", error);
      toast.error("Failed to create distribution");
    } finally {
      setLoading(false);
    }
  };

  const filteredDistributions = distributions.filter((dist) => {
    const material = dist.rawMaterialId;
    const fromStore = dist.fromStoreId;
    const toStore = dist.toStoreId;

    const matchesSearch =
      (material?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.distributionNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (fromStore?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (toStore?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Distribution Management
            </h1>
            <p className="text-gray-600">
              Transfer stock between store locations
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Distribution</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Store
              </label>
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger>
                  <SelectValue placeholder="All stores" />
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
                  placeholder="Search distributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchDistributions}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Distributions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDistributions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No distributions found
                    </td>
                  </tr>
                ) : (
                  filteredDistributions.map((dist) => {
                    const material = dist.rawMaterialId;
                    const fromStore = dist.fromStoreId;
                    const toStore = dist.toStoreId;

                    return (
                      <tr key={dist._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {dist.distributionNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {fromStore?.name || "N/A"}
                          </div>
                          {fromStore?.address && (
                            <div className="text-sm text-gray-500">
                              {fromStore.address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {toStore?.name || "N/A"}
                          </div>
                          {toStore?.address && (
                            <div className="text-sm text-gray-500">
                              {toStore.address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {material?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {material?.category || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {dist.quantity} {material?.unit || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(
                              dist.distributionDate
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              dist.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : dist.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {dist.status}
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

        {/* Distribution Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Create Distribution
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Store *
                        </label>
                        <Select
                          value={formData.fromStoreId}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              fromStoreId: value,
                              rawMaterialId: "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source store" />
                          </SelectTrigger>
                          <SelectContent>
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
                          To Store *
                        </label>
                        <Select
                          value={formData.toStoreId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, toStoreId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination store" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores
                              .filter(
                                (store) => store._id !== formData.fromStoreId
                              )
                              .map((store) => (
                                <SelectItem key={store._id} value={store._id}>
                                  {store.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raw Material *
                      </label>
                      <Select
                        value={formData.rawMaterialId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, rawMaterialId: value })
                        }
                        disabled={!formData.fromStoreId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.map((material) => (
                            <SelectItem key={material._id} value={material._id}>
                              {material.name} ({material.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.fromStoreId && formData.rawMaterialId && (
                        <p className="mt-2 text-sm text-gray-600">
                          Available Stock:{" "}
                          <span className="font-medium">{availableStock}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={availableStock}
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Distribution Date *
                        </label>
                        <input
                          type="date"
                          value={formData.distributionDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              distributionDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional notes..."
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            <span>Create Distribution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default DistributionManagement;
