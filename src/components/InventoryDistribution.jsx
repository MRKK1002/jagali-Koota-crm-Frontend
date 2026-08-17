import React, { useState, useEffect } from "react";
import { Package, Search, Eye, Download, Filter, TrendingUp } from "lucide-react";

const InventoryDistribution = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [viewingDistribution, setViewingDistribution] = useState(null);

  // Fetch all distributions
  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";
      const response = await fetch(`${apiBase}/inventory-distribution`);
      if (response.ok) {
        const data = await response.json();
        setDistributions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching distributions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []);

  // Calculate summary stats
  const stats = {
    totalDistributions: distributions.length,
    totalValue: distributions.reduce((sum, d) => sum + (d.totalValue || 0), 0),
    totalQuantity: distributions.reduce((sum, d) => sum + d.quantityDistributed, 0),
    avgValue: distributions.length > 0 
      ? distributions.reduce((sum, d) => sum + (d.totalValue || 0), 0) / distributions.length 
      : 0,
  };

  // Helper function to check if date is within range
  const isDateInRange = (date, filter) => {
    const distDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case "today":
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return distDate >= today && distDate <= todayEnd;
      
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return distDate >= weekAgo;
      
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return distDate >= monthAgo;
      
      case "all":
      default:
        return true;
    }
  };

  // Filter distributions
  const filteredDistributions = distributions.filter((dist) => {
    const matchesSearch = 
      dist.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All Status" || dist.status === statusFilter;
    const matchesDate = isDateInRange(dist.distributionDate, dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to Excel
  const exportToExcel = () => {
    const headers = ["Distribution ID", "Date", "Recipient", "Product", "Quantity", "Branch", "Store Location", "Purpose", "Status"];
    const rows = filteredDistributions.map(d => [
      `DIST-${d._id?.slice(-13)}`,
      new Date(d.distributionDate).toLocaleDateString(),
      d.recipientName,
      d.productName,
      d.quantityDistributed,
      d.branch,
      d.storeLocation,
      d.purpose,
      d.status,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-distributions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Package className="w-10 h-10 mr-3 text-blue-600" />
                Inventory Distribution
              </h1>
              <p className="text-gray-600 mt-2">Track and manage all inventory distributions</p>
            </div>
            <button
              onClick={fetchDistributions}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Distributions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDistributions}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Value (with Tax)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Quantity</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQuantity}</p>
              </div>
              <Package className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.avgValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search distributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>

            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Distributions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading distributions...</p>
            </div>
          ) : filteredDistributions.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No distributions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Distribution ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Recipient</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDistributions.map((dist, index) => (
                    <tr key={dist._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          DIST-{dist._id?.slice(-13)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dist.recipientName}</div>
                        <div className="text-xs text-gray-500">Staff</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">1 items</div>
                        <div className="text-xs text-gray-500">{dist.quantityDistributed} total qty</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{(dist.totalValue || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{dist.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {dist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(dist.distributionDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dist.distributionDate).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewingDistribution(dist)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Distribution Modal */}
        {viewingDistribution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Distribution Details</h3>
                <button
                  onClick={() => setViewingDistribution(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Distribution ID</p>
                    <p className="text-lg font-semibold">DIST-{viewingDistribution._id?.slice(-13)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                      {viewingDistribution.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product Name</p>
                    <p className="text-lg font-semibold">{viewingDistribution.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity Distributed</p>
                    <p className="text-lg font-semibold">{viewingDistribution.quantityDistributed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Per Unit</p>
                    <p className="text-lg font-semibold">₹{(viewingDistribution.pricePerUnit || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tax Rate</p>
                    <p className="text-lg font-semibold">{viewingDistribution.taxRate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value (with Tax)</p>
                    <p className="text-lg font-semibold text-green-600">₹{(viewingDistribution.totalValue || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recipient Name</p>
                    <p className="text-lg font-semibold">{viewingDistribution.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-lg font-semibold">{viewingDistribution.contact || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="text-lg font-semibold">{viewingDistribution.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Store Location</p>
                    <p className="text-lg font-semibold">{viewingDistribution.storeLocation}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Purpose</p>
                    <p className="text-lg font-semibold">{viewingDistribution.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distributed By</p>
                    <p className="text-lg font-semibold">{viewingDistribution.distributedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Distribution Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(viewingDistribution.distributionDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingDistribution(null)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
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

export default InventoryDistribution;
