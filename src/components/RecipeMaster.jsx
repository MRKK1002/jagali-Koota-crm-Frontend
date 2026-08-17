import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit, ChefHat, Search, Package } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_BACKEND_PRIMARY || "https://crm.jagalikoota.com/api/v1/hotel";

const RecipeMaster = () => {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    menuItemId: "",
    menuItemName: "",
    department: "",
    category: "",
    branch: "",
    ingredients: [{ rawMaterial: "", productName: "", quantity: "", unit: "" }],
    servingSize: 1,
    notes: "",
  });

  useEffect(() => {
    fetchRecipes();
    fetchMenuItems();
    fetchRawMaterials();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments`);
      setDepartments(res.data.data || []);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/recipe-master`);
      if (res.data.success) {
        setRecipes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      toast.error("Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/menu`);
      if (res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.data || [];
        setMenuItems(items);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      toast.error("Failed to fetch menu items");
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const res = await axios.get(`${API_BASE}/raw-material`);
      if (res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.data || [];
        setRawMaterials(items);
      }
    } catch (err) {
      console.error("Error fetching raw materials:", err);
      toast.error("Failed to fetch raw materials");
    }
  };

  const handleMenuItemSelect = (menuItemId) => {
    const menuItem = menuItems.find((item) => item._id === menuItemId);
    if (menuItem) {
      setFormData((prev) => ({
        ...prev,
        menuItemId: menuItem._id,
        menuItemName: menuItem.name,
        category: menuItem.categoryId?.name || "",
        branch: menuItem.branchId?.name || "",
      }));
    }
  };

  const handleRawMaterialSelect = (index, rawMaterialId) => {
    const material = rawMaterials.find((m) => m._id === rawMaterialId);
    if (material) {
      const updatedIngredients = [...formData.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        rawMaterial: material._id,
        productName: material.name,
        unit: material.distributionUnit || material.unit || "",
      };
      setFormData((prev) => ({ ...prev, ingredients: updatedIngredients }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setFormData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { rawMaterial: "", productName: "", quantity: "", unit: "" },
      ],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length === 1) {
      toast.warning("At least one ingredient is required");
      return;
    }
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const resetForm = () => {
    setFormData({
      menuItemId: "",
      menuItemName: "",
      department: "",
      category: "",
      branch: "",
      ingredients: [{ rawMaterial: "", productName: "", quantity: "", unit: "" }],
      servingSize: 1,
      notes: "",
    });
    setEditingRecipe(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      menuItemId: recipe.menuItemId,
      menuItemName: recipe.menuItemName,
      category: recipe.category || "",
      branch: recipe.branch || "",
      ingredients: recipe.ingredients.map((ing) => ({
        rawMaterial: ing.rawMaterial?._id || ing.rawMaterial || "",
        productName: ing.productName,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      servingSize: recipe.servingSize || 1,
      notes: recipe.notes || "",
    });
    setShowDialog(true);
  };

  const openDetailDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.menuItemId) {
      toast.error("Please select a menu item");
      return;
    }

    const validIngredients = formData.ingredients.filter(
      (ing) => ing.rawMaterial && ing.quantity
    );
    if (validIngredients.length === 0) {
      toast.error("Please add at least one ingredient with quantity");
      return;
    }

    const payload = {
      ...formData,
      ingredients: validIngredients.map((ing) => ({
        rawMaterial: ing.rawMaterial,
        productName: ing.productName,
        quantity: Number(ing.quantity),
        unit: ing.unit,
      })),
      servingSize: Number(formData.servingSize) || 1,
    };

    try {
      if (editingRecipe) {
        const res = await axios.put(
          `${API_BASE}/recipe-master/${editingRecipe._id}`,
          payload
        );
        if (res.data.success) {
          toast.success("Recipe updated successfully");
          fetchRecipes();
          setShowDialog(false);
          resetForm();
        }
      } else {
        const res = await axios.post(`${API_BASE}/recipe-master`, payload);
        if (res.data.success) {
          toast.success("Recipe created successfully");
          fetchRecipes();
          setShowDialog(false);
          resetForm();
        }
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      toast.error(err.response?.data?.error || "Failed to save recipe");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/recipe-master/${id}`);
      if (res.data.success) {
        toast.success("Recipe deleted successfully");
        fetchRecipes();
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Error deleting recipe:", err);
      toast.error("Failed to delete recipe");
    }
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.menuItemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#69231B]/10 rounded-lg">
            <ChefHat className="w-6 h-6 text-[#69231B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#69231B]">Recipe Management</h1>
            <p className="text-sm text-gray-500">
              Manage recipes and ingredients for menu items
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-[#69231B] hover:bg-[#69231B]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Recipe
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by menu item or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#69231B] flex items-center gap-2">
            <Package className="w-5 h-5" />
            Saved Recipes ({filteredRecipes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading recipes...</div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recipes found. Create your first recipe!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-[#69231B]/5">
                    <th className="text-left p-3 font-semibold text-[#69231B]">Menu Item</th>
                    <th className="text-left p-3 font-semibold text-[#69231B]">Category</th>
                    <th className="text-left p-3 font-semibold text-[#69231B]">Ingredients</th>
                    <th className="text-left p-3 font-semibold text-[#69231B]">Serving Size</th>
                    <th className="text-left p-3 font-semibold text-[#69231B]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
                    <tr
                      key={recipe._id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetailDialog(recipe)}
                    >
                      <td className="p-3 font-medium">{recipe.menuItemName}</td>
                      <td className="p-3 text-gray-600">{recipe.category || "-"}</td>
                      <td className="p-3">
                        <span className="bg-[#69231B]/10 text-[#69231B] px-2 py-1 rounded-full text-sm font-medium">
                          {recipe.ingredients?.length || 0} items
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{recipe.servingSize || 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(recipe)}
                            className="border-[#69231B] text-[#69231B] hover:bg-[#69231B]/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(recipe._id)}
                            className="border-red-500 text-red-500 hover:bg-red-50"
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

      {/* Create/Edit Recipe Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#69231B]">
              {editingRecipe ? "Edit Recipe" : "Create New Recipe"}
            </DialogTitle>
            <DialogDescription>
              {editingRecipe
                ? "Update the recipe details and ingredients."
                : "Select a menu item and add ingredients to create a recipe."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Menu Item Selection */}
            <div className="space-y-2">
              <Label className="font-semibold">Menu Item *</Label>
              <Select
                value={formData.menuItemId}
                onValueChange={handleMenuItemSelect}
                disabled={!!editingRecipe}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} {item.price ? `(₹${item.price})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled category & branch */}
            {formData.category && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Category</Label>
                  <Input value={formData.category} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Branch</Label>
                  <Input value={formData.branch} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Department (Kitchen) *</Label>
                  <Select
                    value={formData.department || ""}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, department: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Which kitchen makes this?" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {!formData.category && (
              <div className="space-y-2">
                <Label className="font-semibold">Department (Kitchen) *</Label>
                <Select
                  value={formData.department || ""}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, department: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Which kitchen makes this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ingredients Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Ingredients *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                  className="border-[#69231B] text-[#69231B] hover:bg-[#69231B]/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-500">Raw Material</Label>
                      <Select
                        value={ingredient.rawMaterial}
                        onValueChange={(val) => handleRawMaterialSelect(index, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.map((mat) => (
                            <SelectItem key={mat._id} value={mat._id}>
                              {mat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-gray-500">Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Qty"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          handleIngredientChange(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-24 space-y-1">
                      <Label className="text-xs text-gray-500">Unit</Label>
                      <Input
                        value={ingredient.unit}
                        onChange={(e) =>
                          handleIngredientChange(index, "unit", e.target.value)
                        }
                        placeholder="Unit"
                        className="bg-white"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Serving Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Serving Size</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.servingSize}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, servingSize: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="font-semibold">Notes</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#69231B]/30 focus:border-[#69231B]"
                placeholder="Add any preparation notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#69231B] hover:bg-[#69231B]/90 text-white"
              >
                {editingRecipe ? "Update Recipe" : "Save Recipe"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recipe Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#69231B] flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              {selectedRecipe?.menuItemName}
            </DialogTitle>
            <DialogDescription>
              Recipe details and ingredients breakdown
            </DialogDescription>
          </DialogHeader>

          {selectedRecipe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedRecipe.category || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium">{selectedRecipe.branch || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serving Size</p>
                  <p className="font-medium">{selectedRecipe.servingSize || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Ingredients</p>
                  <p className="font-medium">{selectedRecipe.ingredients?.length || 0}</p>
                </div>
              </div>

              {selectedRecipe.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedRecipe.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2 font-semibold">Ingredients</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#69231B]/5 border-b">
                        <th className="text-left p-2 text-sm font-semibold text-[#69231B]">#</th>
                        <th className="text-left p-2 text-sm font-semibold text-[#69231B]">Material</th>
                        <th className="text-left p-2 text-sm font-semibold text-[#69231B]">Quantity</th>
                        <th className="text-left p-2 text-sm font-semibold text-[#69231B]">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecipe.ingredients?.map((ing, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="p-2 text-sm">{idx + 1}</td>
                          <td className="p-2 text-sm font-medium">{ing.productName}</td>
                          <td className="p-2 text-sm">{ing.quantity}</td>
                          <td className="p-2 text-sm">{ing.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeMaster;
