import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle, XCircle, Package, Trash2, Send, Clock, AlertTriangle, Search, FileText, Download, Share2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
  downloadIndentPdf,
  downloadIndentExcel,
  shareIndentPdf,
} from "@/utils/indentExport";
import {
  filterIssuedIndents,
  aggregateByMaterial,
  aggregateByDepartment,
  downloadIssueReportPdf,
  downloadIssueReportExcel,
} from "@/utils/issueReport";

const API_URL = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";


const IndentManagement = () => {
  const { user } = useAuth();
  const userRole = user?.role || "";

  // Role-based tab visibility — primarily driven by allowedModules
  const isAdmin = ["Admin", "admin", "superadmin", "Main Admin"].includes(userRole);
  const isHOD = isAdmin || (user?.allowedModules || []).includes("indent-hod");
  const isStore = isAdmin || (user?.allowedModules || []).includes("indent-store");
  const canRaise = isAdmin || (user?.allowedModules || []).includes("indent-management") || 
    !((user?.allowedModules || []).includes("indent-hod") || (user?.allowedModules || []).includes("indent-store"));

  // Auto-select the right tab based on access
  const getDefaultTab = () => {
    if ((user?.allowedModules || []).includes("indent-hod") && !isAdmin && !canRaise) return "hod";
    if ((user?.allowedModules || []).includes("indent-store") && !isAdmin) return "store";
    if ((user?.allowedModules || []).includes("indent-management")) return "raise";
    return "raise";
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [indents, setIndents] = useState([]);
  const [hodPending, setHodPending] = useState([]);
  const [storePending, setStorePending] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [approvalAction, setApprovalAction] = useState(""); // "hod" or "store"
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [itemSearchTerms, setItemSearchTerms] = useState({});
  const [itemDropdownOpen, setItemDropdownOpen] = useState({});
  const [availableStock, setAvailableStock] = useState({});
  // Item-details / change-department modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsIndent, setDetailsIndent] = useState(null);
  const [changeDeptValue, setChangeDeptValue] = useState("");
  const [changingDept, setChangingDept] = useState(false);
  // Which export is in flight: "" | "pdf" | "excel" | "share"
  const [exporting, setExporting] = useState("");

  // Issue Report tab — defaults to the current month
  const monthStart = new Date();
  monthStart.setDate(1);
  const toYmd = (d) => {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().slice(0, 10);
  };
  const [reportFrom, setReportFrom] = useState(toYmd(monthStart));
  const [reportTo, setReportTo] = useState(toYmd(new Date()));
  const [reportBranch, setReportBranch] = useState("all");
  const [reportGroupBy, setReportGroupBy] = useState("material");
  const [reportExporting, setReportExporting] = useState("");

  // Derived report data (recomputed on filter change)
  const reportIndents = filterIssuedIndents(indents, {
    from: reportFrom,
    to: reportTo,
    branch: reportBranch,
  });
  const reportMaterialRows = aggregateByMaterial(reportIndents);
  const reportDeptGroups = aggregateByDepartment(reportIndents);

  const handleExportReport = async (format) => {
    setReportExporting(format);
    try {
      const opts = {
        from: reportFrom,
        to: reportTo,
        branch: reportBranch,
        groupBy: reportGroupBy,
      };
      if (format === "excel") {
        downloadIssueReportExcel(reportIndents, opts);
        toast.success("Issue report exported to Excel");
      } else {
        await downloadIssueReportPdf(reportIndents, opts);
        toast.success("Issue report PDF downloaded");
      }
    } catch (err) {
      console.error("Issue report export error:", err);
      toast.error("Could not export the report");
    } finally {
      setReportExporting("");
    }
  };

  // Raise indent form
  const [indentForm, setIndentForm] = useState({
    department: "",
    raisedBy: "",
    raisedByContact: "",
    branch: "",
    priority: "Normal",
    requiredDate: "",
    purpose: "",
    items: [{ rawMaterial: "", productName: "", requestedQuantity: "", requestedUnit: "", notes: "" }],
  });

  const unusedDepartments = ["Kitchen", "Bar", "Bakery", "Pantry", "Housekeeping", "Garden", "Other"];

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchIndents(), fetchRawMaterials(), fetchBranches(), fetchDepartments(), fetchAvailableStock()]);
      if (activeTab === "hod") await fetchHodPending();
      if (activeTab === "store") await fetchStorePending();
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`);
      setDepartments(res.data.data || []);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      await axios.post(`${API_URL}/departments`, { name: newDeptName.trim() });
      setNewDeptName("");
      toast.success("Department added!");
      await fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Remove this department?")) return;
    try {
      await axios.delete(`${API_URL}/departments/${id}`);
      toast.success("Department removed");
      await fetchDepartments();
    } catch (err) {
      toast.error("Failed to remove department");
    }
  };

  const fetchIndents = async () => {
    try {
      const res = await axios.get(`${API_URL}/indent`);
      setIndents(res.data.data || []);
    } catch (err) { console.error("Error fetching indents:", err); }
  };

  // Open the item-details / change-department modal for an indent
  const openDetails = (indent) => {
    setDetailsIndent(indent);
    setChangeDeptValue(indent.department || "");
    setShowDetailsModal(true);
  };

  // Change the department of the currently open indent
  // Indent-wise export — PDF slip, Excel sheet, or the native share sheet.
  const handleExportIndent = async (format) => {
    if (!detailsIndent) return;
    setExporting(format);
    try {
      if (format === "excel") {
        downloadIndentExcel(detailsIndent);
        toast.success("Indent exported to Excel");
      } else if (format === "share") {
        const how = await shareIndentPdf(detailsIndent);
        if (how === "downloaded") {
          toast.info("Sharing isn't supported on this device — the PDF was downloaded instead");
        }
      } else {
        await downloadIndentPdf(detailsIndent);
        toast.success("Indent PDF downloaded");
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // user dismissed the share sheet
      console.error("Indent export error:", err);
      toast.error("Could not export this indent");
    } finally {
      setExporting("");
    }
  };
  const handleChangeDepartment = async () => {
    if (!detailsIndent) return;
    // Block re-entry: a second in-flight request would move stock twice.
    if (changingDept) return;
    if (!changeDeptValue || changeDeptValue === detailsIndent.department) {
      toast.error("Pick a different department");
      return;
    }
    setChangingDept(true);
    try {
      const res = await axios.put(`${API_URL}/indent/${detailsIndent._id}/change-department`, {
        department: changeDeptValue,
        changedBy: user?.name || "Admin",
      });
      const skipped = res.data?.skipped || [];
      if (skipped.length > 0) {
        // Partial move: some materials had no stock in the source department.
        toast.warning(res.data?.message || "Department changed with warnings");
      } else {
        toast.success(res.data?.message || "Department changed");
      }
      setDetailsIndent({ ...detailsIndent, department: changeDeptValue });
      await fetchIndents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change department");
    } finally {
      setChangingDept(false);
    }
  };
  const fetchHodPending = async () => {
    try {
      const res = await axios.get(`${API_URL}/indent/pending/hod`);
      setHodPending(res.data.data || []);
    } catch (err) { console.error("Error fetching HOD pending:", err); }
  };
  const fetchStorePending = async () => {
    try {
      const res = await axios.get(`${API_URL}/indent/pending/store`);
      setStorePending(res.data.data || []);
    } catch (err) { console.error("Error fetching store pending:", err); }
  };
  const fetchRawMaterials = async () => {
    try {
      const res = await axios.get(`${API_URL}/raw-material?limit=1000`);
      setRawMaterials(res.data.data || []);
    } catch (err) { console.error("Error fetching materials:", err); }
  };
  const fetchAvailableStock = async () => {
    try {
      const res = await axios.get(`${API_URL}/indent/available-stock`);
      setAvailableStock(res.data.data || {});
    } catch (err) { console.error("Error fetching available stock:", err); }
  };
  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/getAllRestaurants?all=true`);
      const data = res.data?.data || res.data || [];
      setBranches(Array.isArray(data) ? data.map(b => ({ _id: b._id, name: b.branchName || b.restaurantName || b.name })) : []);
    } catch (err) { console.error("Error fetching branches:", err); }
  };
  const handleRaiseIndent = async (e) => {
    e.preventDefault();
    if (!indentForm.department || !indentForm.raisedBy || !indentForm.branch) {
      toast.error("Please fill department, raised by, and branch");
      return;
    }
    if (indentForm.items.length === 0 || !indentForm.items[0].productName) {
      toast.error("Please add at least one item");
      return;
    }

    // Check qty doesn't exceed available stock
    for (const item of indentForm.items) {
      if (!item.productName) continue;
      const maxStock = availableStock[item.productName];
      if (maxStock !== undefined && parseFloat(item.requestedQuantity) > maxStock) {
        toast.error(`${item.productName}: qty (${item.requestedQuantity}) exceeds available stock (${maxStock})`);
        return;
      }
    }

    try {
      await axios.post(`${API_URL}/indent`, indentForm);
      toast.success("Indent raised successfully!");
      setIndentForm({
        department: "", raisedBy: "", raisedByContact: "", branch: "",
        priority: "Normal", requiredDate: "", purpose: "",
        items: [{ rawMaterial: "", productName: "", requestedQuantity: "", requestedUnit: "", notes: "" }],
      });
      setItemSearchTerms({});
      setItemDropdownOpen({});
      await fetchIndents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise indent");
    }
  };
  const handleHodAction = async (action, remarks) => {
    if (!selectedIndent) return;
    try {
      const payload = {
        action,
        approvedBy: "Head Chef",
        remarks,
        items: selectedIndent.items.map((item, i) => ({
          index: i,
          productName: item.productName,
          approvedQuantity: item._approvedQty !== undefined ? item._approvedQty : item.requestedQuantity,
        })),
      };
      await axios.put(`${API_URL}/indent/${selectedIndent._id}/hod-approve`, payload);
      toast.success(`Indent ${action === "approve" ? "approved" : action === "partial" ? "partially approved" : "rejected"}`);
      setShowApprovalModal(false);
      setSelectedIndent(null);
      await fetchHodPending();
      await fetchIndents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process approval");
    }
  };
  const handleStoreIssue = async (remarks) => {
    if (!selectedIndent) return;
    try {
      const payload = {
        approvedBy: "Store Manager",
        remarks,
        items: selectedIndent.items.map((item, i) => ({
          index: i,
          productName: item.productName,
          issuedQuantity: item._issuedQty !== undefined ? item._issuedQty : item.approvedQuantity,
          rate: item.rate || 0,
        })),
      };
      await axios.put(`${API_URL}/indent/${selectedIndent._id}/store-issue`, payload);
      toast.success("Material issued successfully! Inventory updated.");
      setShowApprovalModal(false);
      setSelectedIndent(null);
      await fetchStorePending();
      await fetchIndents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue material");
    }
  };
  const addItem = () => {
    setIndentForm({
      ...indentForm,
      items: [...indentForm.items, { rawMaterial: "", productName: "", requestedQuantity: "", requestedUnit: "", notes: "" }],
    });
    setItemSearchTerms({ ...itemSearchTerms, [indentForm.items.length]: "" });
  };
  const removeItem = (index) => {
    const updated = indentForm.items.filter((_, i) => i !== index);
    setIndentForm({ ...indentForm, items: updated.length > 0 ? updated : [{ rawMaterial: "", productName: "", requestedQuantity: "", requestedUnit: "", notes: "" }] });
  };
  const updateItem = (index, field, value) => {
    const updated = [...indentForm.items];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-fill unit and name when material selected
    if (field === "rawMaterial") {
      const mat = rawMaterials.find(m => m._id === value);
      if (mat) {
        updated[index].productName = mat.name;
        updated[index].requestedUnit = mat.distributionUnit && mat.conversionFactor ? mat.distributionUnit : mat.unit;
      }
    }
    setIndentForm({ ...indentForm, items: updated });
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "HOD Approved": return "bg-blue-100 text-blue-800";
      case "HOD Partially Approved": return "bg-orange-100 text-orange-800";
      case "HOD Rejected": return "bg-red-100 text-red-800";
      case "Store Issued": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Normal": return "bg-blue-100 text-blue-800";
      case "Low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#FCFCFC" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Indent / Requisition Management</h1>
          <p className="text-gray-600 mt-1">Raise material requests, get approvals, and issue stock</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl mb-6" style={{ gridTemplateColumns: `repeat(${[canRaise, isHOD, isStore, isAdmin, isAdmin || isStore].filter(Boolean).length}, 1fr)` }}>
            {canRaise && <TabsTrigger value="raise">Raise Indent</TabsTrigger>}
            {isHOD && <TabsTrigger value="hod">HOD Approval</TabsTrigger>}
            {isStore && <TabsTrigger value="store">Store Issue</TabsTrigger>}
            {isAdmin && <TabsTrigger value="all">All Indents</TabsTrigger>}
            {(isAdmin || isStore) && <TabsTrigger value="report">Issue Report</TabsTrigger>}
          </TabsList>

          {/* RAISE INDENT TAB */}
          <TabsContent value="raise">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#69231B]" />
                  Raise New Indent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRaiseIndent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Department <span className="text-red-500">*</span></Label>
                      <Select value={indentForm.department} onValueChange={(v) => setIndentForm({ ...indentForm, department: v })}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
                          {departments.length === 0 && <div className="px-2 py-1 text-sm text-gray-500">No departments. Admin can add from settings.</div>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Raised By <span className="text-red-500">*</span></Label>
                      <Input placeholder="Name of person" value={indentForm.raisedBy} onChange={(e) => setIndentForm({ ...indentForm, raisedBy: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch <span className="text-red-500">*</span></Label>
                      <Select value={indentForm.branch} onValueChange={(v) => setIndentForm({ ...indentForm, branch: v })}>
                        <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          {branches.map(b => <SelectItem key={b._id} value={b.name}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={indentForm.priority} onValueChange={(v) => setIndentForm({ ...indentForm, priority: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Low", "Normal", "High", "Urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Required Date</Label>
                      <Input type="date" value={indentForm.requiredDate} onChange={(e) => setIndentForm({ ...indentForm, requiredDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Input placeholder="Purpose of indent" value={indentForm.purpose} onChange={(e) => setIndentForm({ ...indentForm, purpose: e.target.value })} />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t pt-4 mt-4">
                    <Label className="text-base font-semibold">Items <span className="text-red-500">*</span></Label>
                    <div className="space-y-3 mt-3">
                      {indentForm.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-4 relative">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Search material..."
                                className="pl-8"
                                value={itemSearchTerms[index] !== undefined ? itemSearchTerms[index] : (rawMaterials.find(m => m._id === item.rawMaterial)?.name || "")}
                                onChange={(e) => {
                                  setItemSearchTerms({ ...itemSearchTerms, [index]: e.target.value });
                                  setItemDropdownOpen({ ...itemDropdownOpen, [index]: true });
                                }}
                                onFocus={() => setItemDropdownOpen({ ...itemDropdownOpen, [index]: true })}
                                onBlur={() => setTimeout(() => setItemDropdownOpen({ ...itemDropdownOpen, [index]: false }), 200)}
                              />
                            </div>
                            {itemDropdownOpen[index] && (
                              <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {rawMaterials
                                  .filter(m => {
                                    const term = (itemSearchTerms[index] || "").toLowerCase();
                                    return !term || m.name.toLowerCase().includes(term);
                                  })
                                  .map(m => (
                                    <div
                                      key={m._id}
                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between"
                                      onMouseDown={() => {
                                        updateItem(index, "rawMaterial", m._id);
                                        setItemSearchTerms({ ...itemSearchTerms, [index]: m.name });
                                        setItemDropdownOpen({ ...itemDropdownOpen, [index]: false });
                                      }}
                                    >
                                      <span>{m.name} <span className="text-gray-400">({m.distributionUnit || m.unit})</span></span>
                                      {availableStock[m.name] !== undefined && (
                                        <span className="text-xs text-green-600 font-medium">Stock: {availableStock[m.name]} {m.unit}</span>
                                      )}
                                    </div>
                                  ))}
                                {rawMaterials.filter(m => {
                                  const term = (itemSearchTerms[index] || "").toLowerCase();
                                  return !term || m.name.toLowerCase().includes(term);
                                }).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500">No materials found</div>
                                )}
                              </div>
                            )}
                            {item.rawMaterial && (() => {
                              const mat = rawMaterials.find(m => m._id === item.rawMaterial);
                              const stock = mat ? availableStock[mat.name] : undefined;
                              return stock !== undefined ? (
                                <span className="text-xs text-green-600 font-medium mt-0.5 block">Avail: {stock} {mat?.unit || ""}</span>
                              ) : null;
                            })()}
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Qty"
                              min="0"
                              step="any"
                              max={(() => {
                                const mat = rawMaterials.find(m => m._id === item.rawMaterial);
                                return mat && availableStock[mat.name] !== undefined ? availableStock[mat.name] : undefined;
                              })()}
                              value={item.requestedQuantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "" && parseFloat(val) < 0) return;
                                const mat = rawMaterials.find(m => m._id === item.rawMaterial);
                                const maxStock = mat ? availableStock[mat.name] : undefined;
                                if (maxStock !== undefined && val !== "" && parseFloat(val) > maxStock) {
                                  toast.error(`Cannot exceed available stock (${maxStock} ${mat?.unit || ""})`);
                                  return;
                                }
                                updateItem(index, "requestedQuantity", val);
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Select value={item.requestedUnit} onValueChange={(v) => updateItem(index, "requestedUnit", v)}>
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  const mat = rawMaterials.find(m => m._id === item.rawMaterial);
                                  if (!mat) return <SelectItem value="unit">unit</SelectItem>;
                                  const units = [];
                                  // Always show base unit
                                  units.push(mat.unit);
                                  // Show distribution unit if different
                                  if (mat.distributionUnit && mat.distributionUnit !== mat.unit) {
                                    units.push(mat.distributionUnit);
                                  }
                                  return units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>);
                                })()}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <Input placeholder="Notes (optional)" value={item.notes} onChange={(e) => updateItem(index, "notes", e.target.value)} />
                          </div>
                          <div className="col-span-1">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-[#69231B] hover:bg-[#7a2920] text-white px-8">
                      <Send className="w-4 h-4 mr-2" /> Raise Indent
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HOD APPROVAL TAB */}
          <TabsContent value="hod">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Pending HOD Approval ({hodPending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hodPending.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending indents for approval</p>
                ) : (
                  <div className="space-y-4">
                    {hodPending.map(indent => (
                      <div key={indent._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{indent.indentNumber}</h3>
                            <p className="text-sm text-gray-600">{indent.department} • {indent.branch} • Raised by: {indent.raisedBy}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(indent.priority)}`}>{indent.priority}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <table className="w-full text-sm">
                            <thead><tr className="bg-gray-50"><th className="p-2 text-left">Material</th><th className="p-2 text-left">Qty</th><th className="p-2 text-left">Unit</th></tr></thead>
                            <tbody>
                              {indent.items.map((item, i) => (
                                <tr key={i} className="border-t">
                                  <td className="p-2">{item.productName}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="any"
                                      className="w-20 h-8 text-sm"
                                      defaultValue={item.requestedQuantity}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        const updated = hodPending.map(ind => {
                                          if (ind._id !== indent._id) return ind;
                                          const items = [...ind.items];
                                          items[i] = { ...items[i], _approvedQty: val };
                                          return { ...ind, items };
                                        });
                                        setHodPending(updated);
                                      }}
                                    />
                                  </td>
                                  <td className="p-2">{item.requestedUnit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                            const indentCopy = { ...indent, items: indent.items.map(item => ({ ...item, _approvedQty: item._approvedQty !== undefined ? item._approvedQty : item.requestedQuantity })) };
                            setSelectedIndent(indentCopy); setApprovalAction("hod"); setShowApprovalModal(true);
                          }}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedIndent(indent); handleHodAction("reject", ""); }}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORE ISSUE TAB */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Pending Store Issue ({storePending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {storePending.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No indents pending for store issue</p>
                ) : (
                  <div className="space-y-4">
                    {storePending.map(indent => (
                      <div key={indent._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{indent.indentNumber}</h3>
                            <p className="text-sm text-gray-600">{indent.department} • {indent.branch} • HOD: {indent.hodApproval?.approvedBy}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(indent.status)}`}>{indent.status}</span>
                        </div>
                        <div className="mb-3">
                          <table className="w-full text-sm">
                            <thead><tr className="bg-gray-50"><th className="p-2 text-left">Material</th><th className="p-2 text-left">Requested</th><th className="p-2 text-left">Approved</th><th className="p-2 text-left">Unit</th></tr></thead>
                            <tbody>
                              {indent.items.map((item, i) => (
                                <tr key={i} className="border-t">
                                  <td className="p-2">{item.productName}</td>
                                  <td className="p-2">{item.requestedQuantity}</td>
                                  <td className="p-2 font-semibold text-green-700">{item.approvedQuantity ?? item.requestedQuantity}</td>
                                  <td className="p-2">{item.requestedUnit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" className="bg-[#69231B] hover:bg-[#7a2920] text-white" onClick={() => { setSelectedIndent({ ...indent }); setApprovalAction("store"); setShowApprovalModal(true); }}>
                            <Package className="w-4 h-4 mr-1" /> Issue Material
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALL INDENTS TAB */}
          <TabsContent value="all">
            {/* Department Management - Admin Only */}
            {isAdmin && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Manage Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="New department name (e.g., Kitchen, Bar)"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="max-w-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleAddDepartment()}
                    />
                    <Button onClick={handleAddDepartment} size="sm" className="bg-[#69231B] hover:bg-[#7a2920] text-white">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {departments.map(d => (
                      <span key={d._id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#69231B]/10 text-[#69231B]">
                        {d.name}
                        <button onClick={() => handleDeleteDepartment(d._id)} className="ml-1 text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                    {departments.length === 0 && <p className="text-sm text-gray-500">No departments added yet.</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Indents ({indents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {indents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No indents found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#69231B] to-[#D1C9BC] text-white">
                          <th className="p-3 text-left">Indent #</th>
                          <th className="p-3 text-left">Department</th>
                          <th className="p-3 text-left">Branch</th>
                          <th className="p-3 text-left">Raised By</th>
                          <th className="p-3 text-left">Items</th>
                          <th className="p-3 text-left">Priority</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indents.map(indent => (
                          <tr key={indent._id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-mono font-medium">{indent.indentNumber}</td>
                            <td className="p-3">{indent.department}</td>
                            <td className="p-3">{indent.branch}</td>
                            <td className="p-3">{indent.raisedBy}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => openDetails(indent)}
                                className="text-[#69231B] font-medium underline underline-offset-2 hover:text-[#7a2920]"
                                title="View item details"
                              >
                                {indent.items?.length || 0} items
                              </button>
                            </td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(indent.priority)}`}>{indent.priority}</span></td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(indent.status)}`}>{indent.status}</span></td>
                            <td className="p-3 text-gray-500">{new Date(indent.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ISSUE REPORT TAB — date-wise consolidated store issues */}
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Store Issue Report</CardTitle>
                <p className="text-sm text-gray-500">
                  Everything the store issued in a date range, consolidated. Counts each
                  indent on the day it was issued.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <Label className="text-xs text-gray-500">From</Label>
                    <Input
                      type="date"
                      value={reportFrom}
                      max={reportTo || undefined}
                      onChange={(e) => setReportFrom(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">To</Label>
                    <Input
                      type="date"
                      value={reportTo}
                      min={reportFrom || undefined}
                      onChange={(e) => setReportTo(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Branch</Label>
                    <Select value={reportBranch} onValueChange={setReportBranch}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All branches</SelectItem>
                        {branches.map((b) => (
                          <SelectItem key={b._id || b.name} value={b.name}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Group by</Label>
                    <Select value={reportGroupBy} onValueChange={setReportGroupBy}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material">Material-wise</SelectItem>
                        <SelectItem value="department">Department-wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Summary strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><span className="text-gray-500">Indents issued:</span> <strong>{reportIndents.length}</strong></div>
                  <div><span className="text-gray-500">Materials:</span> <strong>{reportMaterialRows.length}</strong></div>
                  <div><span className="text-gray-500">Line items:</span> <strong>{reportIndents.reduce((s, i) => s + (i.items || []).length, 0)}</strong></div>
                  <div className="flex gap-2 justify-start md:justify-end">
                    <Button
                      variant="outline" size="sm" disabled={reportExporting || reportIndents.length === 0}
                      onClick={() => handleExportReport("pdf")}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {reportExporting === "pdf" ? "..." : "PDF"}
                    </Button>
                    <Button
                      variant="outline" size="sm" disabled={reportExporting || reportIndents.length === 0}
                      onClick={() => handleExportReport("excel")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {reportExporting === "excel" ? "..." : "Excel"}
                    </Button>
                  </div>
                </div>

                {/* On-screen preview */}
                {reportIndents.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No store issues in this period. Adjust the dates or branch.
                  </p>
                ) : reportGroupBy === "department" ? (
                  <div className="space-y-4">
                    {reportDeptGroups.map((g) => (
                      <div key={g.dept} className="border rounded-lg overflow-hidden">
                        <div className="bg-[#69231B] text-white px-3 py-2 text-sm font-semibold flex justify-between">
                          <span>{g.dept}</span>
                          <span className="opacity-80">{g.indentCount} indent{g.indentCount === 1 ? "" : "s"}</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 text-left">
                              <th className="p-2">Material</th>
                              <th className="p-2 w-24">Unit</th>
                              <th className="p-2 w-32 text-right">Issued Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.materials.map((m, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2 font-medium">{m.name}</td>
                                <td className="p-2 text-gray-500">{m.unit}</td>
                                <td className="p-2 text-right font-semibold text-[#69231B]">{m.qty.toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2 w-10">#</th>
                        <th className="p-2">Material</th>
                        <th className="p-2 w-20">Unit</th>
                        <th className="p-2 w-28 text-right">Total Issued</th>
                        <th className="p-2">Departments</th>
                        <th className="p-2 w-20 text-center">Indents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportMaterialRows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 text-gray-400">{i + 1}</td>
                          <td className="p-2 font-medium">{r.name}</td>
                          <td className="p-2 text-gray-500">{r.unit}</td>
                          <td className="p-2 text-right font-semibold text-[#69231B]">{r.qty.toLocaleString("en-IN")}</td>
                          <td className="p-2 text-gray-600 text-xs">{r.depts.join(", ")}</td>
                          <td className="p-2 text-center">{r.indentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approval/Issue Modal */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {approvalAction === "hod" ? "HOD Approval" : "Issue Material"} — {selectedIndent?.indentNumber}
              </DialogTitle>
              <DialogDescription>
                {approvalAction === "hod" ? "Review and approve/modify quantities" : "Confirm quantities to issue from inventory"}
              </DialogDescription>
            </DialogHeader>
            {selectedIndent && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><span className="text-gray-500">Department:</span> <strong>{selectedIndent.department}</strong></div>
                  <div><span className="text-gray-500">Branch:</span> <strong>{selectedIndent.branch}</strong></div>
                  <div><span className="text-gray-500">Raised By:</span> <strong>{selectedIndent.raisedBy}</strong></div>
                </div>

                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Material</th>
                      <th className="p-3 text-left">Requested</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-left">{approvalAction === "hod" ? "Approve Qty" : "Issue Qty"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedIndent.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 font-medium">{item.productName}</td>
                        <td className="p-3">{item.requestedQuantity}</td>
                        <td className="p-3">{item.requestedUnit}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="w-24"
                            defaultValue={approvalAction === "hod" ? item.requestedQuantity : (item.approvedQuantity ?? item.requestedQuantity)}
                            onChange={(e) => {
                              const updated = { ...selectedIndent };
                              if (approvalAction === "hod") {
                                updated.items[i]._approvedQty = parseFloat(e.target.value) || 0;
                              } else {
                                updated.items[i]._issuedQty = parseFloat(e.target.value) || 0;
                              }
                              setSelectedIndent(updated);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea id="approval-remarks" placeholder="Add remarks (optional)" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                  {approvalAction === "hod" ? (
                    <>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleHodAction("partial", document.getElementById("approval-remarks")?.value || "")}>
                        Partial Approve
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleHodAction("approve", document.getElementById("approval-remarks")?.value || "")}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Full Approve
                      </Button>
                    </>
                  ) : (
                    <Button className="bg-[#69231B] hover:bg-[#7a2920] text-white" onClick={() => handleStoreIssue(document.getElementById("approval-remarks")?.value || "")}>
                      <Package className="w-4 h-4 mr-1" /> Issue & Deduct Stock
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Item Details + Change Department Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Indent Details — {detailsIndent?.indentNumber}</DialogTitle>
              <DialogDescription>Item quantities and department for this indent</DialogDescription>
            </DialogHeader>
            {detailsIndent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><span className="text-gray-500">Department:</span> <strong>{detailsIndent.department}</strong></div>
                  <div><span className="text-gray-500">Branch:</span> <strong>{detailsIndent.branch}</strong></div>
                  <div><span className="text-gray-500">Raised By:</span> <strong>{detailsIndent.raisedBy}</strong></div>
                  <div>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(detailsIndent.status)}`}>{detailsIndent.status}</span>
                  </div>
                </div>

                {/* Change department control */}
                <div className="border rounded-lg p-3 bg-white">
                  <Label className="text-sm font-semibold">Shift to another department</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Select value={changeDeptValue} onValueChange={setChangeDeptValue}>
                      <SelectTrigger className="sm:max-w-xs"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button
                      className="bg-[#69231B] hover:bg-[#7a2920] text-white"
                      disabled={changingDept || !changeDeptValue || changeDeptValue === detailsIndent.department}
                      onClick={handleChangeDepartment}
                    >
                      {changingDept ? "Saving..." : "Change Department"}
                    </Button>
                  </div>
                  {detailsIndent.status === "Store Issued" && (
                    <p className="text-xs text-gray-500 mt-2">
                      This indent is already issued — department-wise stock will move to the new department.
                    </p>
                  )}
                </div>

                {/* Export this indent */}
                <div className="border rounded-lg p-3 bg-white">
                  <Label className="text-sm font-semibold">Export this indent</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Downloads only {detailsIndent.indentNumber} — department, quantities and notes.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="outline"
                      disabled={exporting}
                      onClick={() => handleExportIndent("pdf")}
                      aria-label={`Export indent ${detailsIndent.indentNumber} as PDF`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {exporting === "pdf" ? "Preparing..." : "Export PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={exporting}
                      onClick={() => handleExportIndent("excel")}
                      aria-label={`Export indent ${detailsIndent.indentNumber} as Excel`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exporting === "excel" ? "Preparing..." : "Export Excel"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={exporting}
                      onClick={() => handleExportIndent("share")}
                      aria-label={`Share indent ${detailsIndent.indentNumber}`}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {exporting === "share" ? "Preparing..." : "Share"}
                    </Button>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Material</th>
                      <th className="p-3 text-left">Requested</th>
                      <th className="p-3 text-left">Approved</th>
                      <th className="p-3 text-left">Issued</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsIndent.items?.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 font-medium">{item.productName}</td>
                        <td className="p-3">{item.requestedQuantity}</td>
                        <td className="p-3">{item.approvedQuantity ?? "-"}</td>
                        <td className="p-3">{item.issuedQuantity ?? "-"}</td>
                        <td className="p-3">{item.requestedUnit}</td>
                        <td className="p-3 text-gray-500">{item.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-2 border-t">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default IndentManagement;
