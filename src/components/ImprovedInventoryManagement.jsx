import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Edit3,
  XCircle,
  CheckCircle,
  Trash2,
  Plus,
  X,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  BarChart3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ImprovedInventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [viewProduct, setViewProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Filters
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStoreType, setFilterStoreType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
  
  // Form data
  const [branches, setBranches] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  const [manualEntryData, setManualEntryData] = useState({
    productName: "",
    supplier: "",
    branch: "",
    storeType: "",
    quantity: "",
    basePrice: "",
    unitOfMeasurement: "kg",
  });

  // Fetch inventory data (simplified version - you'll need to integrate your full fetch logic)
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Your existing fetch logic here
      // For now, using placeholder
      setInventory([]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter and search logic
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !tableSearch ||
        item.productName?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.grnNumber?.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(tableSearch.toLowerCase());
      
      const matchesBranch = filterBranch === "all" || item.branch === filterBranch;
      const matchesStoreType = filterStoreType === "all" || item.storeType === filterStoreType;
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      
      return matchesSearch && matchesBranch && matchesStoreType && matchesCategory;
    });
  }, [inventory, tableSearch, filterBranch, filterStoreType, filterCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, filterBranch, filterStoreType, filterCategory]);

  // Summary statistics
  const stats = useMemo(() => {
    return {
      totalItems: filteredInventory.length,
      totalValue: filteredInventory.reduce((sum, item) => sum + (item.totalValue || 0), 0),
      totalQuantity: filteredInventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
      availableQuantity: filteredInventory.reduce((sum, item) => sum + (item.availableQuantity || 0), 0),
      lowStock: filteredInventory.filter(item => (item.availableQuantity || 0) < 10).length,
    };
  }, [filteredInventory]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your hotel inventory efficiently</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Entry</span>
              </button>
              <button
                onClick={fetchInventory}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Qty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableQuantity}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product, GRN, or supplier..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterBranch !== "all" || filterStoreType !== "all" || filterCategory !== "all") && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Active
                </span>
              )}
            </button>
            
            {/* Items per page */}
            <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
                <SelectItem value="200">200 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <Select value={filterBranch} onValueChange={setFilterBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {/* Add branch options */}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Type</label>
                <Select value={filterStoreType} onValueChange={setFilterStoreType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {/* Add store type options */}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Add category options */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Store</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Received</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Available</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Consumed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedInventory.length > 0 ? (
                  paginatedInventory.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.supplier}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.branch}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {item.storeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{item.quantity || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                          {item.availableQuantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                          {item.consumedQuantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{(item.totalValue || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewProduct(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No inventory items found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length} items
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedInventoryManagement;
