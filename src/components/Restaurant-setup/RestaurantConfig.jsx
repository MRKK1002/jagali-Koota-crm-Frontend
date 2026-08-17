import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Settings,
  Receipt,
  Ruler,
  Printer,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RestaurantConfig = () => {
  const [activeTab, setActiveTab] = useState("taxSlabs");
  const [loading, setLoading] = useState(false);

  // Tax Slabs State
  const [taxSlabs, setTaxSlabs] = useState([]);
  const [isTaxSlabModalOpen, setIsTaxSlabModalOpen] = useState(false);
  const [editingTaxSlab, setEditingTaxSlab] = useState(null);
  const [taxSlabFormData, setTaxSlabFormData] = useState({
    name: "",
    description: "",
    gstRate: "",
    cgstRate: "",
    sgstRate: "",
    igstRate: "",
    serviceRate: "",
    isActive: true,
    applicableFor: "All",
    priority: 0,
  });

  // UOM State
  const [uoms, setUoms] = useState([]);
  const [isUOMModalOpen, setIsUOMModalOpen] = useState(false);
  const [editingUOM, setEditingUOM] = useState(null);
  const [uomFormData, setUomFormData] = useState({
    label: "",
    unit: "",
  });

  // Kitchen Printers State
  const [kitchenPrinters, setKitchenPrinters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [printerFormData, setPrinterFormData] = useState({
    name: "",
    ipAddress: "",
    port: 9100,
    branchId: "",
    branchName: "",
    printerType: "thermal",
    categories: [],
    categoryNames: [],
    paperSize: "80mm",
    copies: 1,
    description: "",
    isActive: true,
  });

  const isDevelopment = import.meta.env.DEV;
  const API_BASE_URL = isDevelopment
    ? "https://crm.jagalikoota.com/api/v1/hotel"
    : "https://crm.jagalikoota.com/api/v1/hotel";

  // Fetch Tax Slabs
  const fetchTaxSlabs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://crm.jagalikoota.com/taxSlab");
      setTaxSlabs(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching tax slabs:", error);
      toast.error("Failed to load tax slabs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch UOMs
  const fetchUOMs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://crm.jagalikoota.com/UOM");
      setUoms(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching UOMs:", error);
      toast.error("Failed to load units of measurement");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kitchen Printers
  const fetchKitchenPrinters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/kitchen-printer`);
      setKitchenPrinters(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching kitchen printers:", error);
      toast.error("Failed to load kitchen printers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Branches
  const fetchBranches = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/getAllRestaurants?all=true`
      );
      let restaurants = [];
      if (response.data?.success && response.data?.data) {
        restaurants = response.data.data;
      } else if (Array.isArray(response.data)) {
        restaurants = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurants = response.data.data;
      }
      setBranches(Array.isArray(restaurants) ? restaurants : []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category`);
      const categoriesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchTaxSlabs();
    fetchUOMs();
    fetchKitchenPrinters();
    fetchBranches();
    fetchCategories();
  }, []);

  // Tax Slab Handlers
  const openTaxSlabModal = (taxSlab = null) => {
    if (taxSlab) {
      setEditingTaxSlab(taxSlab);
      setTaxSlabFormData({
        name: taxSlab.name || "",
        description: taxSlab.description || "",
        gstRate: taxSlab.gstRate || "",
        cgstRate: taxSlab.cgstRate || "",
        sgstRate: taxSlab.sgstRate || "",
        igstRate: taxSlab.igstRate || "",
        serviceRate: taxSlab.serviceRate || "",
        isActive: taxSlab.isActive !== undefined ? taxSlab.isActive : true,
        applicableFor: taxSlab.applicableFor || "All",
        priority: taxSlab.priority || 0,
      });
    } else {
      setEditingTaxSlab(null);
      setTaxSlabFormData({
        name: "",
        description: "",
        gstRate: "",
        cgstRate: "",
        sgstRate: "",
        igstRate: "",
        serviceRate: "",
        isActive: true,
        applicableFor: "All",
        priority: 0,
      });
    }
    setIsTaxSlabModalOpen(true);
  };

  const handleTaxSlabSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taxSlabFormData,
        gstRate: taxSlabFormData.gstRate
          ? parseFloat(taxSlabFormData.gstRate)
          : 0,
        cgstRate: taxSlabFormData.cgstRate
          ? parseFloat(taxSlabFormData.cgstRate)
          : 0,
        sgstRate: taxSlabFormData.sgstRate
          ? parseFloat(taxSlabFormData.sgstRate)
          : 0,
        igstRate: taxSlabFormData.igstRate
          ? parseFloat(taxSlabFormData.igstRate)
          : 0,
        serviceRate: parseFloat(taxSlabFormData.serviceRate),
        priority: parseInt(taxSlabFormData.priority) || 0,
      };

      if (editingTaxSlab) {
        await axios.put(
          `https://crm.jagalikoota.com/taxSlab/${editingTaxSlab._id}`,
          payload
        );
        toast.success("Tax slab updated successfully");
      } else {
        await axios.post("https://crm.jagalikoota.com/taxSlab", payload);
        toast.success("Tax slab created successfully");
      }
      setIsTaxSlabModalOpen(false);
      fetchTaxSlabs();
    } catch (error) {
      console.error("Error saving tax slab:", error);
      toast.error(error.response?.data?.message || "Failed to save tax slab");
    }
  };

  const handleDeleteTaxSlab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tax slab?"))
      return;
    try {
      await axios.delete(`https://crm.jagalikoota.com/taxSlab/${id}`);
      toast.success("Tax slab deleted successfully");
      fetchTaxSlabs();
    } catch (error) {
      console.error("Error deleting tax slab:", error);
      toast.error("Failed to delete tax slab");
    }
  };

  // UOM Handlers
  const openUOMModal = (uom = null) => {
    if (uom) {
      setEditingUOM(uom);
      setUomFormData({
        label: uom.label || "",
        unit: uom.unit || "",
      });
    } else {
      setEditingUOM(null);
      setUomFormData({
        label: "",
        unit: "",
      });
    }
    setIsUOMModalOpen(true);
  };

  const handleUOMSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUOM) {
        await axios.put(
          `https://crm.jagalikoota.com/UOM/${editingUOM._id}`,
          uomFormData
        );
        toast.success("UOM updated successfully");
      } else {
        await axios.post("https://crm.jagalikoota.com/UOM", uomFormData);
        toast.success("UOM created successfully");
      }
      setIsUOMModalOpen(false);
      fetchUOMs();
    } catch (error) {
      console.error("Error saving UOM:", error);
      toast.error(error.response?.data?.message || "Failed to save UOM");
    }
  };

  const handleDeleteUOM = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UOM?")) return;
    try {
      await axios.delete(`https://crm.jagalikoota.com/UOM/${id}`);
      toast.success("UOM deleted successfully");
      fetchUOMs();
    } catch (error) {
      console.error("Error deleting UOM:", error);
      toast.error("Failed to delete UOM");
    }
  };

  // Kitchen Printer Handlers
  const openPrinterModal = (printer = null) => {
    if (printer) {
      setEditingPrinter(printer);
      setPrinterFormData({
        name: printer.name || "",
        ipAddress: printer.ipAddress || "",
        port: printer.port || 9100,
        branchId: printer.branchId?._id || printer.branchId || "",
        branchName: printer.branchName || "",
        printerType: printer.printerType || "thermal",
        categories: printer.categories || [],
        categoryNames: printer.categoryNames || [],
        paperSize: printer.paperSize || "80mm",
        copies: printer.copies || 1,
        description: printer.description || "",
        isActive: printer.isActive !== undefined ? printer.isActive : true,
      });
    } else {
      setEditingPrinter(null);
      setPrinterFormData({
        name: "",
        ipAddress: "",
        port: 9100,
        branchId: "",
        branchName: "",
        printerType: "thermal",
        categories: [],
        categoryNames: [],
        paperSize: "80mm",
        copies: 1,
        description: "",
        isActive: true,
      });
    }
    setIsPrinterModalOpen(true);
  };

  const handleBranchChange = (branchId) => {
    const selectedBranch = branches.find((b) => b._id === branchId);
    setPrinterFormData({
      ...printerFormData,
      branchId: branchId,
      branchName:
        selectedBranch?.branchName || selectedBranch?.restaurantName || "",
    });
  };

  const handleCategoryToggle = (categoryId, categoryName) => {
    const currentCategories = printerFormData.categories || [];
    const currentCategoryNames = printerFormData.categoryNames || [];
    const isSelected = currentCategories.includes(categoryId);

    if (isSelected) {
      setPrinterFormData({
        ...printerFormData,
        categories: currentCategories.filter((id) => id !== categoryId),
        categoryNames: currentCategoryNames.filter(
          (name) => name !== categoryName
        ),
      });
    } else {
      setPrinterFormData({
        ...printerFormData,
        categories: [...currentCategories, categoryId],
        categoryNames: [...currentCategoryNames, categoryName],
      });
    }
  };

  const handlePrinterSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...printerFormData,
        port: parseInt(printerFormData.port),
        copies: parseInt(printerFormData.copies),
      };

      if (editingPrinter) {
        await axios.put(
          `${API_BASE_URL}/kitchen-printer/${editingPrinter._id}`,
          payload
        );
        toast.success("Kitchen printer updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/kitchen-printer`, payload);
        toast.success("Kitchen printer created successfully");
      }
      setIsPrinterModalOpen(false);
      fetchKitchenPrinters();
    } catch (error) {
      console.error("Error saving kitchen printer:", error);
      toast.error(
        error.response?.data?.message || "Failed to save kitchen printer"
      );
    }
  };

  const handleDeletePrinter = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this kitchen printer?")
    )
      return;
    try {
      await axios.delete(`${API_BASE_URL}/kitchen-printer/${id}`);
      toast.success("Kitchen printer deleted successfully");
      fetchKitchenPrinters();
    } catch (error) {
      console.error("Error deleting kitchen printer:", error);
      toast.error("Failed to delete kitchen printer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 -ml-6 pt-4 md:pt-6 pb-4 md:pb-6 w-[calc(100%+1.5rem)] overflow-x-hidden">
      <div className="mx-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration
          </h1>
          <p className="text-gray-600">
            Manage tax slabs, units of measurement, and kitchen printers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("taxSlabs")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "taxSlabs"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Receipt className="inline-block mr-2 w-4 h-4" />
              Tax Slabs
            </button>
            <button
              onClick={() => setActiveTab("uom")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "uom"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Ruler className="inline-block mr-2 w-4 h-4" />
              Units of Measurement
            </button>
            <button
              onClick={() => setActiveTab("printers")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "printers"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Printer className="inline-block mr-2 w-4 h-4" />
              Kitchen Printers
            </button>
          </div>
        </div>

        {/* Tax Slabs Tab */}
        {activeTab === "taxSlabs" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tax Slabs</CardTitle>
              <Button onClick={() => openTaxSlabModal()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Tax Slab
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : taxSlabs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tax slabs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">GST Rate</th>
                        <th className="text-left p-3">Service Rate</th>
                        <th className="text-left p-3">Applicable For</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxSlabs.map((slab) => (
                        <tr
                          key={slab._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">{slab.name}</td>
                          <td className="p-3">{slab.gstRate}%</td>
                          <td className="p-3">{slab.serviceRate}%</td>
                          <td className="p-3">{slab.applicableFor}</td>
                          <td className="p-3">
                            {slab.isActive ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Active
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTaxSlabModal(slab)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTaxSlab(slab._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* UOM Tab */}
        {activeTab === "uom" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Units of Measurement</CardTitle>
              <Button onClick={() => openUOMModal()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add UOM
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : uoms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No UOMs found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Label</th>
                        <th className="text-left p-3">Unit</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uoms.map((uom) => (
                        <tr key={uom._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{uom.label}</td>
                          <td className="p-3">{uom.unit}</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUOMModal(uom)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUOM(uom._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Kitchen Printers Tab */}
        {activeTab === "printers" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kitchen Printers</CardTitle>
              <Button onClick={() => openPrinterModal()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Printer
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : kitchenPrinters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No kitchen printers found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">IP Address</th>
                        <th className="text-left p-3">Branch</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kitchenPrinters.map((printer) => (
                        <tr
                          key={printer._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-3">{printer.name}</td>
                          <td className="p-3">
                            {printer.ipAddress}:{printer.port}
                          </td>
                          <td className="p-3">{printer.branchName}</td>
                          <td className="p-3 capitalize">
                            {printer.printerType}
                          </td>
                          <td className="p-3">
                            {printer.isActive ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Active
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPrinterModal(printer)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePrinter(printer._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tax Slab Modal */}
        {isTaxSlabModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {editingTaxSlab ? "Edit Tax Slab" : "Add Tax Slab"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTaxSlabModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTaxSlabSubmit} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={taxSlabFormData.name}
                      onChange={(e) =>
                        setTaxSlabFormData({
                          ...taxSlabFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={taxSlabFormData.description}
                      onChange={(e) =>
                        setTaxSlabFormData({
                          ...taxSlabFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>GST Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxSlabFormData.gstRate}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            gstRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Service Rate (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxSlabFormData.serviceRate}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            serviceRate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>CGST Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxSlabFormData.cgstRate}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            cgstRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>SGST Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxSlabFormData.sgstRate}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            sgstRate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>IGST Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={taxSlabFormData.igstRate}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            igstRate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Applicable For</Label>
                      <Select
                        value={taxSlabFormData.applicableFor}
                        onValueChange={(value) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            applicableFor: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Dine-in">Dine-in</SelectItem>
                          <SelectItem value="Takeaway">Takeaway</SelectItem>
                          <SelectItem value="Delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        min="0"
                        value={taxSlabFormData.priority}
                        onChange={(e) =>
                          setTaxSlabFormData({
                            ...taxSlabFormData,
                            priority: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={taxSlabFormData.isActive}
                      onChange={(e) =>
                        setTaxSlabFormData({
                          ...taxSlabFormData,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsTaxSlabModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* UOM Modal */}
        {isUOMModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingUOM ? "Edit UOM" : "Add UOM"}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUOMModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUOMSubmit} className="space-y-4">
                  <div>
                    <Label>Label *</Label>
                    <Input
                      value={uomFormData.label}
                      onChange={(e) =>
                        setUomFormData({
                          ...uomFormData,
                          label: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Unit *</Label>
                    <Input
                      value={uomFormData.unit}
                      onChange={(e) =>
                        setUomFormData({ ...uomFormData, unit: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUOMModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Kitchen Printer Modal */}
        {isPrinterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {editingPrinter
                    ? "Edit Kitchen Printer"
                    : "Add Kitchen Printer"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPrinterModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePrinterSubmit} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={printerFormData.name}
                      onChange={(e) =>
                        setPrinterFormData({
                          ...printerFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>IP Address *</Label>
                      <Input
                        value={printerFormData.ipAddress}
                        onChange={(e) =>
                          setPrinterFormData({
                            ...printerFormData,
                            ipAddress: e.target.value,
                          })
                        }
                        required
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div>
                      <Label>Port *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="65535"
                        value={printerFormData.port}
                        onChange={(e) =>
                          setPrinterFormData({
                            ...printerFormData,
                            port: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Branch *</Label>
                    <Select
                      value={printerFormData.branchId}
                      onValueChange={handleBranchChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            {branch.branchName || branch.restaurantName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Printer Type</Label>
                      <Select
                        value={printerFormData.printerType}
                        onValueChange={(value) =>
                          setPrinterFormData({
                            ...printerFormData,
                            printerType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thermal">Thermal</SelectItem>
                          <SelectItem value="inkjet">Inkjet</SelectItem>
                          <SelectItem value="laser">Laser</SelectItem>
                          <SelectItem value="dot-matrix">Dot Matrix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Paper Size</Label>
                      <Select
                        value={printerFormData.paperSize}
                        onValueChange={(value) =>
                          setPrinterFormData({
                            ...printerFormData,
                            paperSize: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="58mm">58mm</SelectItem>
                          <SelectItem value="80mm">80mm</SelectItem>
                          <SelectItem value="A4">A4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Categories</Label>
                    <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                      {categories.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No categories available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <label
                              key={category._id}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={printerFormData.categories?.includes(
                                  category._id
                                )}
                                onChange={() =>
                                  handleCategoryToggle(
                                    category._id,
                                    category.name || category.categoryName
                                  )
                                }
                              />
                              <span className="text-sm">
                                {category.name || category.categoryName}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Copies</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={printerFormData.copies}
                        onChange={(e) =>
                          setPrinterFormData({
                            ...printerFormData,
                            copies: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="isActivePrinter"
                        checked={printerFormData.isActive}
                        onChange={(e) =>
                          setPrinterFormData({
                            ...printerFormData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isActivePrinter">Active</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={printerFormData.description}
                      onChange={(e) =>
                        setPrinterFormData({
                          ...printerFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPrinterModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantConfig;
