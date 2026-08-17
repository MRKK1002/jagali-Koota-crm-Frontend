import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, ClipboardList, CheckCircle, XCircle, Package, Trash2, Send, Clock, AlertTriangle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

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
      await Promise.all([fetchIndents(), fetchRawMaterials(), fetchBranches(), fetchDepartments()]);
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
      const res = await axios.get(`${API_URL}/raw-material`);
      setRawMaterials(res.data.data || []);
    } catch (err) { console.error("Error fetching materials:", err); }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/getAllRestaurants?all=true`);
      const data = res.data?.data || res.data || [];
      setBranches(Array.isArray(data) ? data.map(b => ({ _id: b._id, name: b.branchName || b.restaurantName || b.name })) : []);
    } catch (err) { console.error("Error fetching branches:", err); }
  };

  // Raise Indent
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

    try {
      await axios.post(`${API_URL}/indent`, indentForm);
      toast.success("Indent raised successfully!");
      setIndentForm({
        department: "", raisedBy: "", raisedByContact: "", branch: "",
        priority: "Normal", requiredDate: "", purpose: "",
        items: [{ rawMaterial: "", productName: "", requestedQuantity: "", requestedUnit: "", notes: "" }],
      });
      await fetchIndents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise indent");
    }
  };

  // HOD Approval
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

  // Store Issue
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
          <TabsList className="grid w-full max-w-2xl mb-6" style={{ gridTemplateColumns: `repeat(${[canRaise, isHOD, isStore, isAdmin].filter(Boolean).length}, 1fr)` }}>
            {canRaise && <TabsTrigger value="raise">Raise Indent</TabsTrigger>}
            {isHOD && <TabsTrigger value="hod">HOD Approval</TabsTrigger>}
            {isStore && <TabsTrigger value="store">Store Issue</TabsTrigger>}
            {isAdmin && <TabsTrigger value="all">All Indents</TabsTrigger>}
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
                          <div className="col-span-4">
                            <Select value={item.rawMaterial} onValueChange={(v) => updateItem(index, "rawMaterial", v)}>
                              <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                              <SelectContent>
                                {rawMaterials.map(m => (
                                  <SelectItem key={m._id} value={m._id}>{m.name} ({m.distributionUnit || m.unit})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input type="number" placeholder="Qty" value={item.requestedQuantity} onChange={(e) => updateItem(index, "requestedQuantity", e.target.value)} />
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
                                <tr key={i} className="border-t"><td className="p-2">{item.productName}</td><td className="p-2">{item.requestedQuantity}</td><td className="p-2">{item.requestedUnit}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setSelectedIndent({ ...indent }); setApprovalAction("hod"); setShowApprovalModal(true); }}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleHodAction("reject", "")}>
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
                            <td className="p-3">{indent.items?.length || 0} items</td>
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
      </div>
    </div>
  );
};

export default IndentManagement;
