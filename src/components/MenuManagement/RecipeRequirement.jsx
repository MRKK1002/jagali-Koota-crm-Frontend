import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, Search, RefreshCw, ChevronDown, ChevronUp,
  BookOpen, Package, AlertTriangle, Check, X, Edit2, Save
} from "lucide-react";
import { toast } from "react-toastify";

// ── API base ────────────────────────────────────────────────────────────────
let API_BASE = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
API_BASE = API_BASE.replace(/\/$/, "");
const HOTEL = API_BASE.includes("/api/v1")
  ? `${API_BASE}/hotel`
  : `${API_BASE}/api/v1/hotel`;

// ── tiny helpers ─────────────────────────────────────────────────────────────
const unitLabel = (u) => u || "g";

const stockBadge = (totalQty, minLevel) => {
  if (totalQty <= 0) return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (totalQty <= minLevel) return { label: "Low Stock", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "In Stock", cls: "bg-green-100 text-green-700" };
};

// ── Main component ────────────────────────────────────────────────────────────
const RecipeRequirement = () => {
  // data
  const [menuItems, setMenuItems]       = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [recipes, setRecipes]           = useState([]);

  // ui state
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [expandedId, setExpandedId]   = useState(null);
  const [editingId, setEditingId]     = useState(null);

  // form state
  const [showForm, setShowForm]       = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");
  const [ingredients, setIngredients] = useState([]);          // [{rawMaterialId, quantity, unit}]
  const [ingredientInput, setIngredientInput] = useState({
    rawMaterialId: "", quantity: "", unit: "g"
  });

  // ── fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMenuItems(), fetchRawMaterials(), fetchRecipes()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res  = await fetch(`${HOTEL}/menu`);
      const data = await res.json();
      const arr  = Array.isArray(data) ? data : data.data || [];
      setMenuItems(arr);
    } catch (e) {
      console.error("fetchMenuItems:", e);
      toast.error("Failed to load menu items");
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const res  = await fetch(`${HOTEL}/raw-material`);
      const data = await res.json();
      const arr  = data.success ? data.data : (Array.isArray(data) ? data : []);
      setRawMaterials(arr);
    } catch (e) {
      console.error("fetchRawMaterials:", e);
      toast.error("Failed to load raw materials / inventory");
    }
  };

  const fetchRecipes = async () => {
    try {
      const res  = await fetch(`${HOTEL}/recipes`);
      const data = await res.json();
      const arr  = data.success ? data.data : (Array.isArray(data) ? data : []);
      setRecipes(arr);
    } catch (e) {
      console.error("fetchRecipes:", e);
      toast.error("Failed to load recipes");
    }
  };

  // ── ingredient helpers ──────────────────────────────────────────────────────
  const addIngredient = () => {
    const { rawMaterialId, quantity, unit } = ingredientInput;
    if (!rawMaterialId || !quantity || Number(quantity) <= 0) {
      toast.warn("Select a raw material and enter a valid quantity");
      return;
    }
    if (ingredients.find((i) => i.rawMaterialId === rawMaterialId)) {
      toast.warn("This ingredient is already added");
      return;
    }
    setIngredients((prev) => [
      ...prev,
      { rawMaterialId, quantity: Number(quantity), unit }
    ]);
    setIngredientInput({ rawMaterialId: "", quantity: "", unit: "g" });
  };

  const removeIngredient = (id) =>
    setIngredients((prev) => prev.filter((i) => i.rawMaterialId !== id));

  // ── save recipe ─────────────────────────────────────────────────────────────
  const saveRecipe = async () => {
    if (!selectedMenu) { toast.warn("Please select a menu item"); return; }
    if (ingredients.length === 0) { toast.warn("Add at least one ingredient"); return; }

    const menuItem = menuItems.find((m) => m._id === selectedMenu);

    // Additional recipe fields required by RestaurantRecipeModel
    const payload = {
      name: menuItem?.itemName || menuItem?.name || "Recipe",
      menu: selectedMenu,
      description: `Recipe for ${menuItem?.itemName || menuItem?.name || "menu item"}`,
      category: menuItem?.categoryId?.name || menuItem?.category || "Uncategorized",
      cooking_time: 15,
      servings: 1,
      cost_per_serving: 0,
      instructions: "Standard preparation",
      ingredients,
    };

    setSaving(true);
    try {
      let url    = `${HOTEL}/recipes`;
      let method = "POST";

      if (editingId) {
        url    = `${HOTEL}/recipes/${editingId}`;
        method = "PUT";
      }

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editingId ? "Recipe updated!" : "Recipe saved!");
      resetForm();
      fetchRecipes();
    } catch (e) {
      console.error("saveRecipe:", e);
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const editRecipe = (recipe) => {
    setEditingId(recipe._id);
    setSelectedMenu(
      typeof recipe.menu === "object" ? recipe.menu._id : recipe.menu
    );
    setIngredients(
      recipe.ingredients.map((ing) => ({
        rawMaterialId:
          typeof ing.rawMaterialId === "object"
            ? ing.rawMaterialId._id
            : ing.rawMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
      }))
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(`${HOTEL}/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Recipe deleted");
      fetchRecipes();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedMenu("");
    setIngredients([]);
    setIngredientInput({ rawMaterialId: "", quantity: "", unit: "g" });
  };

  // ── derived ─────────────────────────────────────────────────────────────────
  const filteredRecipes = recipes.filter((r) => {
    const name =
      (typeof r.menu === "object" ? r.menu?.itemName || r.menu?.name : "") ||
      r.name ||
      "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedRaw = rawMaterials.find(
    (m) => m._id === ingredientInput.rawMaterialId
  );

  // menu items that don't have a recipe yet (for new recipe)
  const menuItemsWithoutRecipe = menuItems.filter(
    (m) => !recipes.find(
      (r) => {
        const menuId = typeof r.menu === "object" ? r.menu?._id : r.menu;
        return menuId === m._id;
      }
    )
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            Recipe Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Link menu items to raw materials. Inventory auto-deducts on every KOT / bill.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            New Recipe
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Menu Items",    value: menuItems.length,    icon: "🍽️",  color: "blue" },
          { label: "Recipes",       value: recipes.length,      icon: "📖",  color: "green" },
          { label: "Raw Materials", value: rawMaterials.length, icon: "📦",  color: "purple" },
          {
            label: "Low / Out",
            value: rawMaterials.filter((m) => m.status !== "In Stock").length,
            icon: "⚠️",
            color: "red",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-md p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingId ? "Edit Recipe" : "Create New Recipe"}
            </h2>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Menu item select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Item <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="">-- Select menu item --</option>
              {/* When editing show all; when new show only ones without a recipe */}
              {(editingId ? menuItems : menuItemsWithoutRecipe).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.itemName || m.name}
                  {m.categoryId?.name ? ` (${m.categoryId.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Add ingredient row */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Add Ingredient from Inventory
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Raw material dropdown */}
              <select
                value={ingredientInput.rawMaterialId}
                onChange={(e) =>
                  setIngredientInput((p) => ({
                    ...p,
                    rawMaterialId: e.target.value,
                    unit: rawMaterials.find((m) => m._id === e.target.value)?.unit || "g",
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">-- Select raw material --</option>
                {rawMaterials.map((m) => {
                  const badge = stockBadge(m.totalQuantity, m.minLevel);
                  return (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.totalQuantity} {m.unit}) — {badge.label}
                    </option>
                  );
                })}
              </select>

              {/* Quantity */}
              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="Qty"
                value={ingredientInput.quantity}
                onChange={(e) =>
                  setIngredientInput((p) => ({ ...p, quantity: e.target.value }))
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {/* Unit */}
              <select
                value={ingredientInput.unit}
                onChange={(e) =>
                  setIngredientInput((p) => ({ ...p, unit: e.target.value }))
                }
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {["g", "kg", "ml", "L", "pcs", "tbsp", "tsp"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>

              <button
                onClick={addIngredient}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Stock info for selected raw material */}
            {selectedRaw && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-gray-500">Current stock:</span>
                <span className="font-semibold text-gray-700">
                  {selectedRaw.totalQuantity} {selectedRaw.unit}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockBadge(selectedRaw.totalQuantity, selectedRaw.minLevel).cls}`}>
                  {stockBadge(selectedRaw.totalQuantity, selectedRaw.minLevel).label}
                </span>
              </div>
            )}
          </div>

          {/* Ingredients list */}
          {ingredients.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Ingredients ({ingredients.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Raw Material</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty / Serving</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ingredients.map((ing, idx) => {
                      const mat  = rawMaterials.find((m) => m._id === ing.rawMaterialId);
                      const badge = mat ? stockBadge(mat.totalQuantity, mat.minLevel) : null;
                      return (
                        <tr key={ing.rawMaterialId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-2 font-medium text-gray-800">
                            {mat?.name || ing.rawMaterialId}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            <span className="font-semibold">{ing.quantity}</span>{" "}
                            <span className="text-gray-400">{unitLabel(ing.unit)}</span>
                          </td>
                          <td className="px-4 py-2">
                            {badge && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                                {mat.totalQuantity} {mat.unit}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeIngredient(ing.rawMaterialId)}
                              className="p-1 hover:bg-red-100 rounded text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ingredients.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg mb-4">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No ingredients added yet
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveRecipe}
              disabled={saving || !selectedMenu || ingredients.length === 0}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center gap-2 font-medium"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? "Update Recipe" : "Save Recipe"}
            </button>
          </div>
        </div>
      )}

      {/* ── Recipe List ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            All Recipes
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filteredRecipes.length})
            </span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by menu item…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading…
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recipes found. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRecipes.map((recipe) => {
              const menuItem     = menuItems.find(
                (m) => m._id === (typeof recipe.menu === "object" ? recipe.menu?._id : recipe.menu)
              );
              const menuName     = menuItem?.itemName || menuItem?.name ||
                (typeof recipe.menu === "object" ? recipe.menu?.itemName || recipe.menu?.name : recipe.name) ||
                "Unknown Item";
              const isExpanded   = expandedId === recipe._id;

              return (
                <div key={recipe._id} className="p-4">
                  {/* Row header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : recipe._id)}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-500" />
                        }
                      </button>
                      <div>
                        <p className="font-semibold text-gray-800">{menuName}</p>
                        <p className="text-xs text-gray-400">
                          {recipe.ingredients?.length || 0} ingredient
                          {recipe.ingredients?.length !== 1 ? "s" : ""}
                          {recipe.category ? ` · ${recipe.category}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editRecipe(recipe)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-500"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRecipe(recipe._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded ingredients */}
                  {isExpanded && (
                    <div className="mt-3 ml-9">
                      <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Raw Material</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Per Serving</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Current Stock</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {(recipe.ingredients || []).map((ing, idx) => {
                              const rawId = typeof ing.rawMaterialId === "object"
                                ? ing.rawMaterialId?._id
                                : ing.rawMaterialId;
                              const mat   = rawMaterials.find((m) => m._id === rawId);
                              const badge = mat ? stockBadge(mat.totalQuantity, mat.minLevel) : null;

                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 font-medium text-gray-700">
                                    {ing.rawMaterialId?.name || mat?.name || rawId}
                                  </td>
                                  <td className="px-4 py-2 text-gray-600">
                                    {ing.quantity}{" "}
                                    <span className="text-gray-400">{unitLabel(ing.unit)}</span>
                                  </td>
                                  <td className="px-4 py-2 text-gray-600">
                                    {mat ? `${mat.totalQuantity} ${mat.unit}` : "—"}
                                  </td>
                                  <td className="px-4 py-2">
                                    {badge ? (
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                                        {badge.label}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300 text-xs">Unknown</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* How deduction works info box */}
                      <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          When a KOT or bill is saved for <strong>{menuName}</strong>, each ingredient
                          above gets automatically deducted from inventory.
                          E.g. if 2 portions are ordered, quantities are doubled before deduction.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeRequirement;
