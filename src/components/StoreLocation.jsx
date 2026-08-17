import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";

const StoreLocation = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    manager: "",
    contact: "",
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/hotel/store-location`);
      setLocations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching store locations:", error);
      toast.error("Failed to load store locations");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", manager: "", contact: "" });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.manager.trim() || !form.contact.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const payload = { ...form, address: form.name }; // address required by schema, default to name
      if (editing) {
        await axios.put(`${API_URL}/hotel/store-location/${editing._id}`, payload);
        toast.success("Store location updated");
      } else {
        await axios.post(`${API_URL}/hotel/store-location`, payload);
        toast.success("Store location created");
      }
      setShowModal(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error("Error saving store location:", error);
      toast.error(error.response?.data?.message || "Failed to save store location");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store location?")) return;
    try {
      await axios.delete(`${API_URL}/hotel/store-location/${id}`);
      toast.success("Store location deleted");
      fetchLocations();
    } catch (error) {
      console.error("Error deleting store location:", error);
      toast.error("Failed to delete store location");
    }
  };

  const handleExport = () => {
    if (locations.length === 0) {
      toast.error("No store locations to export");
      return;
    }
    const data = locations.map((loc, idx) => ({
      "S.No": idx + 1,
      "Name": loc.name || "",
      "Manager": loc.manager || "",
      "Contact": loc.contact || "",
      "Item Count": loc.itemCount || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Locations");
    XLSX.writeFile(wb, "Store_Locations.xlsx");
    toast.success("Store locations exported to Excel");
  };
  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#69231B]" />
              Store Locations
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Manage your store/warehouse locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Store Location
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No store locations found</p>
              <p className="text-gray-400 text-sm">Add your first store location to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%]">#</TableHead>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead className="w-[25%]">Manager</TableHead>
                    <TableHead className="w-[25%]">Contact</TableHead>
                    <TableHead className="w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc, idx) => (
                    <TableRow key={loc._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell>{loc.manager}</TableCell>
                      <TableCell>{loc.contact}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditing(loc);
                              setForm({
                                name: loc.name || "",
                                manager: loc.manager || "",
                                contact: loc.contact || "",
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(loc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Store Location" : "Add Store Location"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="e.g., Main Store, Kitchen Store"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager <span className="text-red-500">*</span></Label>
              <Input
                id="manager"
                placeholder="Manager name"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact <span className="text-red-500">*</span></Label>
              <Input
                id="contact"
                placeholder="Phone number"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default StoreLocation;
