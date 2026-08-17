import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  RefreshCw,
  Store,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://crm.jagalikoota.com/api/v1/hotel";

const StockManagement = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [stockInward, setStockInward] = useState([]);
  const [locationInventory, setLocationInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lowStockItems, setLowStockItems] = useState([]);

  // Modal states
  const [showStockInwardModal, setShowStockInwardModal] = useState(false);
  const [showRawMaterialModal, setShowRawMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  // Form states
  const [stockInwardForm, setStockInwardForm] = useState({
    rawMaterialId: "",
    locationId: "",
    supplierId: "",
    quantity: "",
    costPrice: "",
    expiryDate: "",
    batchNumber: "",
    notes: "",
    referenceNumber: "",
  });

  const [rawMaterialForm, setRawMaterialForm] = useState({
    name: "",
    category: "",
    unit: "",
    minLevel: "",
    description: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRawMaterials(),
        fetchStoreLocations(),
        fetchStockInward(),
        fetchLocationInventory(),
        fetchLowStockItems(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/raw-material`);
      setRawMaterials(response.data.data || []);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  const fetchStoreLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/store-location`);
      setStoreLocations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching store locations:", error);
    }
  };

  const fetchStockInward = async () => {
    try {
      const response = await axios.get(`${API_URL}/stock-inward`);
      setStockInward(response.data.data || []);
    } catch (error) {
      console.error("Error fetching stock inward:", error);
    }
  };

  const fetchLocationInventory = async () => {
    try {
      // This endpoint might need to be created
      const response = await axios.get(`${API_URL}/location-inventory`);
      setLocationInventory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching location inventory:", error);
      // If endpoint doesn't exist, calculate from raw materials
      calculateLocationInventory();
    }
  };

  const calculateLocationInventory = () => {
    // Calculate inventory from raw materials and their locations
    const inventory = [];
    rawMaterials.forEach((material) => {
      if (material.locations && material.locations.length > 0) {
        material.locations.forEach((loc) => {
          inventory.push({
            rawMaterialId: material._id,
            rawMaterialName: material.name,
            locationId: loc.location,
            quantity: loc.quantity,
            unit: material.unit,
            category: material.category,
            minLevel: material.minLevel,
            status: material.status,
          });
        });
      }
    });
    setLocationInventory(inventory);
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/raw-material/alerts/low-stock`
      );
      setLowStockItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  };

  const handleStockInwardSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...stockInwardForm,
        quantity: parseFloat(stockInwardForm.quantity),
        costPrice: parseFloat(stockInwardForm.costPrice),
        requestedBy: "System", // You might want to get this from auth context
      };

      await axios.post(`${API_URL}/stock-inward`, payload);
      toast.success("Stock inward created successfully");
      setShowStockInwardModal(false);
      resetStockInwardForm();
      fetchAllData();
    } catch (error) {
      console.error("Error creating stock inward:", error);
      toast.error(
        error.response?.data?.error || "Failed to create stock inward"
      );
    }
  };

  const handleRawMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...rawMaterialForm,
        minLevel: parseFloat(rawMaterialForm.minLevel) || 5,
        suppliers: [],
      };

      if (editingMaterial) {
        await axios.put(
          `${API_URL}/raw-material/${editingMaterial._id}`,
          payload
        );
        toast.success("Raw material updated successfully");
      } else {
        await axios.post(`${API_URL}/raw-material`, payload);
        toast.success("Raw material created successfully");
      }

      setShowRawMaterialModal(false);
      resetRawMaterialForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving raw material:", error);
      toast.error(error.response?.data?.error || "Failed to save raw material");
    }
  };

  const resetStockInwardForm = () => {
    setStockInwardForm({
      rawMaterialId: "",
      locationId: "",
      supplierId: "",
      quantity: "",
      costPrice: "",
      expiryDate: "",
      batchNumber: "",
      notes: "",
      referenceNumber: "",
    });
  };

  const resetRawMaterialForm = () => {
    setRawMaterialForm({
      name: "",
      category: "",
      unit: "",
      minLevel: "",
      description: "",
    });
    setEditingMaterial(null);
  };

  const handleDeleteRawMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/raw-material/${id}`);
      toast.success("Raw material deleted successfully");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting raw material:", error);
      toast.error("Failed to delete raw material");
    }
  };

  const handleEditRawMaterial = (material) => {
    setEditingMaterial(material);
    setRawMaterialForm({
      name: material.name || "",
      category: material.category || "",
      unit: material.unit || "",
      minLevel: material.minLevel || "",
      description: material.description || "",
    });
    setShowRawMaterialModal(true);
  };

  // Filter inventory
  const filteredInventory = locationInventory.filter((item) => {
    const matchesSearch =
      item.rawMaterialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" ||
      item.locationId?.toString() === selectedLocation;
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Out of Stock":
        return "text-red-600 bg-red-50";
      case "Low Stock":
        return "text-yellow-600 bg-yellow-50";
      case "In Stock":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const categories = [...new Set(rawMaterials.map((m) => m.category))].filter(
    Boolean
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-purple-600" />
            Stock Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage inventory, track stock levels, and receive alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              resetRawMaterialForm();
              setShowRawMaterialModal(true);
            }}
            className="bg-[#69231B] hover:bg-[#5c1e15]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Raw Material
          </Button>
          <Button
            onClick={() => {
              resetStockInwardForm();
              setShowStockInwardModal(true);
            }}
            variant="outline"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Stock Inward
          </Button>
          <Button onClick={fetchAllData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="px-3 py-1 bg-yellow-100 rounded-full text-sm text-yellow-800"
                >
                  {item.name} - {item.totalQuantity || 0} {item.unit} (Min:{" "}
                  {item.minLevel})
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <div className="px-3 py-1 bg-yellow-100 rounded-full text-sm text-yellow-800">
                  +{lowStockItems.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {storeLocations.map((loc) => (
                  <SelectItem key={loc._id} value={loc._id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No inventory items found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => {
                    const location = storeLocations.find(
                      (loc) =>
                        loc._id.toString() === item.locationId?.toString()
                    );
                    const isLowStock =
                      item.quantity <= item.minLevel ||
                      item.status === "Low Stock";
                    const isOutOfStock =
                      item.quantity === 0 || item.status === "Out of Stock";

                    return (
                      <TableRow
                        key={`${item.rawMaterialId}-${item.locationId}`}
                      >
                        <TableCell className="font-medium">
                          {item.rawMaterialName}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Store className="h-4 w-4 text-gray-400" />
                            {location?.name || "Unknown"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {isLowStock && !isOutOfStock ? (
                              <TrendingDown className="h-4 w-4 text-yellow-600" />
                            ) : isOutOfStock ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                            <span
                              className={
                                isOutOfStock
                                  ? "text-red-600 font-semibold"
                                  : isLowStock
                                  ? "text-yellow-600 font-semibold"
                                  : ""
                              }
                            >
                              {item.quantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.minLevel}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status || "In Stock"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const material = rawMaterials.find(
                                  (m) =>
                                    m._id.toString() ===
                                    item.rawMaterialId?.toString()
                                );
                                if (material) handleEditRawMaterial(material);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Inward Modal */}
      <Dialog
        open={showStockInwardModal}
        onOpenChange={setShowStockInwardModal}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stock Inward</DialogTitle>
            <DialogDescription>
              Add new stock to inventory from purchase or manual entry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockInwardSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Raw Material *</Label>
                <Select
                  value={stockInwardForm.rawMaterialId}
                  onValueChange={(value) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      rawMaterialId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawMaterials.map((material) => (
                      <SelectItem key={material._id} value={material._id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Store Location *</Label>
                <Select
                  value={stockInwardForm.locationId}
                  onValueChange={(value) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      locationId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeLocations.map((location) => (
                      <SelectItem key={location._id} value={location._id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stockInwardForm.quantity}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Cost Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={stockInwardForm.costPrice}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      costPrice: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={stockInwardForm.expiryDate}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Batch Number</Label>
                <Input
                  value={stockInwardForm.batchNumber}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      batchNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Reference Number</Label>
                <Input
                  value={stockInwardForm.referenceNumber}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      referenceNumber: e.target.value,
                    })
                  }
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={stockInwardForm.notes}
                  onChange={(e) =>
                    setStockInwardForm({
                      ...stockInwardForm,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStockInwardModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Raw Material Modal */}
      <Dialog
        open={showRawMaterialModal}
        onOpenChange={setShowRawMaterialModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? "Edit Raw Material" : "Add Raw Material"}
            </DialogTitle>
            <DialogDescription>
              Define raw materials like Tomatoes, Cheese, Flour, etc.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRawMaterialSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={rawMaterialForm.name}
                onChange={(e) =>
                  setRawMaterialForm({
                    ...rawMaterialForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Tomatoes, Cheese, Flour"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Input
                  value={rawMaterialForm.category}
                  onChange={(e) =>
                    setRawMaterialForm({
                      ...rawMaterialForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g., Vegetables, Dairy, Grains"
                  required
                />
              </div>
              <div>
                <Label>Unit *</Label>
                <Input
                  value={rawMaterialForm.unit}
                  onChange={(e) =>
                    setRawMaterialForm({
                      ...rawMaterialForm,
                      unit: e.target.value,
                    })
                  }
                  placeholder="e.g., kg, pcs, liters"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Minimum Stock Level *</Label>
              <Input
                type="number"
                step="0.01"
                value={rawMaterialForm.minLevel}
                onChange={(e) =>
                  setRawMaterialForm({
                    ...rawMaterialForm,
                    minLevel: e.target.value,
                  })
                }
                placeholder="Alert when stock falls below this"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={rawMaterialForm.description}
                onChange={(e) =>
                  setRawMaterialForm({
                    ...rawMaterialForm,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRawMaterialModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingMaterial ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;
