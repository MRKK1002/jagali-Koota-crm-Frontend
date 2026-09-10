import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Package, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";

const DepartmentStock = () => {
  const [stocks, setStocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [consumptionLogs, setConsumptionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  // "department|branch|rawMaterialId" -> [{ date, quantity, unit, indentNumber }]
  const [receiptHistory, setReceiptHistory] = useState({});
  // which row is expanded to show its full arrival history
  const [expandedKey, setExpandedKey] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchBranches();
    fetchAllStock();
    fetchReceiptHistory();
  }, []);

  useEffect(() => {
    fetchAllStock();
    fetchReceiptHistory();
  }, [selectedDept, selectedBranch]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments`);
      setDepartments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/getAllRestaurants?all=true`);
      const data = res.data?.data || res.data || [];
      setBranches(Array.isArray(data) ? data.map(b => ({ _id: b._id, name: b.branchName || b.restaurantName || b.name })) : []);
    } catch (err) { console.error(err); }
  };

  const fetchAllStock = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/department-stock`;
      const params = new URLSearchParams();
      if (selectedDept) params.append("department", selectedDept);
      if (selectedBranch) params.append("branch", selectedBranch);
      if (selectedDept || selectedBranch) {
        url = `${API_BASE}/department-stock/department?${params.toString()}`;
      }
      const res = await axios.get(url);
      setStocks(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch department stock");
    } finally {
      setLoading(false);
    }
  };

  // Arrival history is derived server-side from the indents that credited the stock.
  const fetchReceiptHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append("department", selectedDept);
      if (selectedBranch) params.append("branch", selectedBranch);
      const res = await axios.get(
        `${API_BASE}/department-stock/receipt-history?${params.toString()}`
      );
      setReceiptHistory(res.data?.data || {});
    } catch (err) {
      console.error("Failed to fetch stock receipt history:", err);
    }
  };

  // Look up a stock row's arrival history. rawMaterial may be an id string or a populated object.
  const historyFor = (stock) => {
    const rmId =
      typeof stock.rawMaterial === "object" && stock.rawMaterial !== null
        ? stock.rawMaterial._id
        : stock.rawMaterial;
    return receiptHistory[`${stock.department}|${stock.branch}|${rmId}`] || [];
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const fetchConsumptionLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append("department", selectedDept);
      if (selectedBranch) params.append("branch", selectedBranch);
      const res = await axios.get(`${API_BASE}/department-stock/consumption-logs?${params.toString()}`);
      setConsumptionLogs(res.data.data || []);
      setShowLogs(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch consumption logs");
    }
  };

  // Group stocks by department
  const groupedByDept = stocks.reduce((acc, stock) => {
    const dept = stock.department || "Unknown";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(stock);
    return acc;
  }, {});

  const filteredStocks = stocks.filter(s =>
    s.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = stocks.filter(s => s.quantity <= 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#69231B]/10 rounded-lg">
            <Package className="w-6 h-6 text-[#69231B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#69231B]">Department Stock</h1>
            <p className="text-sm text-gray-500">View stock levels per department</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchConsumptionLogs}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
          >
            Consumption Log
          </button>
          <button
            onClick={fetchAllStock}
            className="px-4 py-2 bg-[#69231B] hover:bg-[#7a2920] text-white rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedDept} onValueChange={(v) => setSelectedDept(v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedBranch} onValueChange={(v) => setSelectedBranch(v === "all" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map(b => <SelectItem key={b._id} value={b.name}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search material..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Low/Out of Stock ({lowStockItems.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                {s.productName} ({s.department})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stock Cards by Department */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : Object.keys(groupedByDept).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No department stock found</p>
            <p className="text-sm mt-1">Stock will appear here after indents are issued to departments.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByDept).map(([dept, items]) => (
          <Card key={dept}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="text-[#69231B]">{dept}</span>
                <span className="text-sm font-normal text-gray-500">{items.length} items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-3 text-left font-semibold">Material</th>
                      <th className="p-3 text-left font-semibold">Quantity</th>
                      <th className="p-3 text-left font-semibold">Unit</th>
                      <th className="p-3 text-left font-semibold">Branch</th>
                      <th className="p-3 text-left font-semibold">First Received</th>
                      <th className="p-3 text-left font-semibold">Latest Received</th>
                      <th className="p-3 text-left font-semibold">Times</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter(s => s.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((stock, idx) => {
                        const hist = historyFor(stock);
                        const first = hist[0];
                        const latest = hist[hist.length - 1];
                        const rowKey = `${dept}|${stock.productName}|${idx}`;
                        const isOpen = expandedKey === rowKey;
                        return (
                      <Fragment key={rowKey}>
                      <tr
                        className={`border-b hover:bg-gray-50 ${hist.length > 0 ? "cursor-pointer" : ""}`}
                        onClick={() => hist.length > 0 && setExpandedKey(isOpen ? null : rowKey)}
                        title={hist.length > 0 ? "Click to see all arrival dates" : ""}
                      >
                        <td className="p-3 font-medium">
                          {hist.length > 1 && (
                            <span className="mr-1 text-gray-400 text-xs">{isOpen ? "▾" : "▸"}</span>
                          )}
                          {stock.productName}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            stock.quantity <= 0 ? "bg-red-100 text-red-700" :
                            stock.quantity < 5 ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {stock.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{stock.unit}</td>
                        <td className="p-3 text-gray-600">{stock.branch}</td>
                        <td className="p-3 text-gray-500 text-xs">
                          {first ? (
                            <>
                              {fmtDate(first.date)}
                              <span className="text-green-700 font-medium"> (+{first.quantity})</span>
                            </>
                          ) : "-"}
                        </td>
                        <td className="p-3 text-gray-500 text-xs">
                          {latest && hist.length > 1 ? (
                            <>
                              {fmtDate(latest.date)}
                              <span className="text-green-700 font-medium"> (+{latest.quantity})</span>
                            </>
                          ) : hist.length === 1 ? (
                            <span className="text-gray-400">same</span>
                          ) : "-"}
                        </td>
                        <td className="p-3 text-gray-600 text-xs">
                          {hist.length > 0 ? `${hist.length}x` : "-"}
                        </td>
                      </tr>
                      {isOpen && hist.length > 0 && (
                        <tr className="bg-gray-50 border-b">
                          <td colSpan={7} className="p-3">
                            <div className="text-xs font-semibold text-gray-700 mb-2">
                              Stock arrivals for {stock.productName} — {dept}
                            </div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-gray-500 border-b">
                                  <th className="text-left py-1 pr-4">Date</th>
                                  <th className="text-left py-1 pr-4">Quantity</th>
                                  <th className="text-left py-1 pr-4">Indent</th>
                                  <th className="text-left py-1">Running Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {hist.map((h, hi) => {
                                  const running = hist
                                    .slice(0, hi + 1)
                                    .reduce((s, x) => s + Number(x.quantity || 0), 0);
                                  return (
                                    <tr key={hi} className="border-b last:border-0">
                                      <td className="py-1 pr-4">{fmtDate(h.date)}</td>
                                      <td className="py-1 pr-4 text-green-700 font-medium">
                                        +{h.quantity} {h.unit}
                                      </td>
                                      <td className="py-1 pr-4 text-gray-600">{h.indentNumber}</td>
                                      <td className="py-1 font-medium">{running}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Consumption Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#69231B]">Consumption Log</h2>
              <button onClick={() => setShowLogs(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            {consumptionLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No consumption logs found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Branch</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-left">Items Used</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionLogs.map((log, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 text-gray-600">{new Date(log.deductedAt).toLocaleString("en-IN")}</td>
                      <td className="p-3">{log.department}</td>
                      <td className="p-3">{log.branch}</td>
                      <td className="p-3">{log.orderNumber || "-"}</td>
                      <td className="p-3">
                        {log.items?.map((item, j) => (
                          <span key={j} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {item.productName}: {item.quantity} {item.unit} ({item.menuItem})
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentStock;
