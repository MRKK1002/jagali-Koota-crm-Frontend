import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RawMaterial = () => {
  const API_URL = "https://crm.jagalikoota.com/api/v1/hotel"; // Change to "https://crm.jagalikoota.com/api/v1/hotel" for prod

  const [categories, setCategories] = useState([]);

  const [materials, setMaterials] = useState([]);
  const [materialInput, setMaterialInput] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialError, setMaterialError] = useState(""); // New: Error state
  const [materialLoading, setMaterialLoading] = useState(false); // New: Loading state

  const [uoms, setUoms] = useState([]);
  const [uomError, setUomError] = useState(""); // New: Error state

  // Refs for scrolling
  const materialFormRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchMaterials(), fetchUOMs()]);
  };

  const fetchCategories = async () => {
    try {
      console.log(`Fetching categories from: ${API_URL}/category`); // Debug log

      const res = await axios.get(`${API_URL}/category`);
      console.log("Categories Response:", res.data); // Full response log

      const data = res.data.data || res.data || []; // Handle both structures
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchMaterials = async () => {
    setMaterialLoading(true);
    setMaterialError("");
    try {
      console.log(`Fetching materials from: ${API_URL}/matRawMaterial`); // Debug log

      const res = await axios.get(`${API_URL}/matRawMaterial`);
      console.log("Materials Response:", res.data); // Full response log

      const data = res.data.data || res.data || [];
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching materials:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch materials";
      setMaterialError(msg);
    } finally {
      setMaterialLoading(false);
    }
  };

  const fetchUOMs = async () => {
    try {
      const res = await axios.get(`${API_URL}/UOM`).catch(() =>
        axios.get("https://crm.jagalikoota.com/UOM")
      );
      console.log("UOMs Response:", res.data);

      const data = res.data.data || res.data || [];
      setUoms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching UOMs:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to fetch UOMs";
      setUomError(msg);
    }
  };

  // Helper to get category ID consistently (always string)
  const getCategoryId = (category) => {
    return typeof category === "string" ? category : category?._id || "";
  };

  // Helper to get category name by ID (always lookup from categories state)
  const getCategoryNameById = (catId) => {
    return categories.find((c) => c._id === catId)?.name || "—";
  };

  // ----------------- Raw Material Management -----------------
  const handleMaterialSubmit = async () => {
    if (!materialInput.trim() || !materialUnit) return;

    try {
      let newMaterialId = null;

      if (editingMaterial) {
        const res = await axios.put(
          `${API_URL}/matRawMaterial/${editingMaterial}`,
          {
            name: materialInput,
            unit: materialUnit,
          }
        );
        const updated = materials.map((m) =>
          m._id === editingMaterial ? res.data.data : m
        );
        setMaterials(updated);
        setEditingMaterial(null);
        newMaterialId = editingMaterial;
      } else {
        const res = await axios.post(`${API_URL}/matRawMaterial`, {
          name: materialInput,
          unit: materialUnit,
        });
        const newMaterial = res.data.data;
        setMaterials([...materials, newMaterial]);
        newMaterialId = newMaterial._id;
      }

      setMaterialInput("");
      setMaterialUnit("");

      // Scroll to row
      if (newMaterialId) {
        setTimeout(() => {
          const row = document.getElementById(`material-row-${newMaterialId}`);
          if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    } catch (err) {
      console.error("Error updating material:", err);
      setMaterialError(
        err.response?.data?.message || err.message || "Failed to save material"
      );
    }
  };

  const handleMaterialDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/matRawMaterial/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error("Error deleting material:", err);
      setMaterialError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete material"
      );
    }
  };

  // ----------------- Filter Materials -----------------
  const filteredMaterials = useMemo(() => {
    return materials;
  }, [materials]);

  // Scroll functions (unchanged)
  const scrollToForm = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy(0, -60);
    }
  };

  const handleEditWithScroll = (ref, updateFunction) => {
    requestAnimationFrame(() => {
      updateFunction();
      setTimeout(() => scrollToForm(ref), 50);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative z-10 flex flex-col lg:flex-row mt-12">
        <div className="flex-1 p-4 sm:p-8">
          <div className="p-6">
            <div ref={materialFormRef}>
              <Card className="p-4 my-4">
                <CardContent className="flex flex-row gap-3 items-center">
                  <Input
                    placeholder="Enter Raw Material"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                  <Select
                    value={materialUnit}
                    onValueChange={setMaterialUnit}
                    className="flex-1 min-w-[120px]"
                  >
                    <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {uoms.map((u) => (
                        <SelectItem key={u._id} value={u.unit}>
                          {u.label} ({u.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleMaterialSubmit}
                    disabled={materialLoading}
                  >
                    {materialLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : editingMaterial ? (
                      "Update"
                    ) : (
                      <Plus />
                    )}
                  </Button>
                </CardContent>
                {materialError && (
                  <p className="text-red-500 text-sm mt-2">{materialError}</p>
                )}
              </Card>
            </div>

            {materialLoading ? (
              <p className="text-center py-4">Loading materials...</p>
            ) : materialError ? (
              <div className="text-center py-4">
                <p className="text-red-500">{materialError}</p>
                <Button onClick={fetchMaterials} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" /> Retry
                </Button>
              </div>
            ) : (
              <table className="w-full border border-gray-200 mt-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">#</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Unit</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((m, i) => (
                    <tr
                      key={m._id}
                      id={`material-row-${m._id}`}
                      className="text-center"
                    >
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">{m.name}</td>
                      <td className="border p-2">{m.unit || "—"}</td>
                      <td className="border p-2 flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            handleEditWithScroll(materialFormRef, () => {
                              setMaterialInput(m.name);
                              setMaterialUnit(m.unit || "");
                              setEditingMaterial(m._id);
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleMaterialDelete(m._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-3 text-gray-500 text-center">
                        No raw materials found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMaterial;
