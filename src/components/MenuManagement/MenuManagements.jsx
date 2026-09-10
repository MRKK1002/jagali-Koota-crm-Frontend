import React, { useState, useEffect, useMemo } from "react";

import { X, Edit, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDualBackend } from "../../utils/apiHelpers";

// Reusable image component with error fallback
const FOOD_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#f3f4f6"/><circle cx="32" cy="26" r="11" fill="#e5e7eb"/><path d="M20 46c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#e5e7eb"/><circle cx="32" cy="26" r="8" fill="#d1d5db"/><path d="M28 24a4 4 0 1 1 8 0" stroke="#9ca3af" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="26" r="3" fill="#9ca3af"/></svg>`)}`;

const MenuItemImage = ({ src, alt }) => {
  const [failed, setFailed] = React.useState(false);

  // When src changes (different item), reset failed state
  React.useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
        <img
          src={FOOD_PLACEHOLDER}
          alt="No image"
          className="w-10 h-10 opacity-50"
        />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || "menu item"}
      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
      onError={() => setFailed(true)}
    />
  );
};

// Reusable form for Add/Edit Menu Item
const MenuItemForm = ({
  formData,
  handleChange,
  handlePriceChange,
  handleImageChange,
  onSubmit,
  submitText,
  branches,
  categories,
  subcategories,
  handleCancel,
  handleQuantityChange,
  quantities,
  existingImageUrl,
  isEditMode = false,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    {/* Branch */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Branch *
      </label>
      <select
        name="branchId"
        value={String(formData.branchId || "")}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B] transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        required
        disabled={isEditMode}
      >
        <option value="">Select Branch</option>
        {branches.map((b) => (
          <option key={b._id} value={String(b._id)}>
            {b.name}
          </option>
        ))}
      </select>
      {isEditMode && (
        <p className="mt-1 text-xs text-gray-500">Branch cannot be changed after creation</p>
      )}
    </div>

    {/* Category */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category *
      </label>
      <select
        name="categoryId"
        value={String(formData.categoryId || "")}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B] transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        required
        disabled={isEditMode}
      >
        <option value="">Select Category</option>
        {(() => {
          if (!formData.branchId) {
            // If no branch selected, show ALL categories (for editing old items without branch)
            return categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ));
          }
          
          // Filter categories by selected branch
          const filteredCategories = categories.filter((cat) => {
            const catBranchId = cat.branchId ? String(cat.branchId) : (cat.branch?.id ? String(cat.branch.id) : "");
            const selectedBranchId = String(formData.branchId || "");
            return catBranchId === selectedBranchId && selectedBranchId !== "";
          });
          
          if (filteredCategories.length === 0) {
            // If no categories match, show all categories
            return categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ));
          }

          return filteredCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ));
        })()}
      </select>
      {isEditMode && (
        <p className="mt-1 text-xs text-gray-500">Category cannot be changed after creation</p>
      )}
    </div>

    {/* Subcategory */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Subcategory (Optional)
      </label>
      <select
        name="subcategoryId"
        value={String(formData.subcategoryId || "")}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B] transition-all duration-200"
      >
        <option value="">Select Subcategory (Optional)</option>
        {(() => {
          if (!formData.categoryId) {
            return []; // No subcategories if no category selected
          }
          
          // Filter subcategories by selected category
          const filteredSubcategories = subcategories.filter((subcat) => {
            const subcatCategoryId = subcat.categoryId?._id || subcat.categoryId;
            const selectedCategoryId = String(formData.categoryId || "");
            return subcatCategoryId === selectedCategoryId && selectedCategoryId !== "";
          });
          
          return filteredSubcategories.map((subcat) => (
            <option key={subcat._id} value={subcat._id}>
              {subcat.name}
            </option>
          ));
        })()}
      </select>
    </div>

    {/* Item Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Item Name *
      </label>
      <input
        type="text"
        name="itemName"
        value={formData.itemName}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B] transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        required
        placeholder="Enter item name (e.g., Pizza, Sandwich, Pasta)"
        disabled={isEditMode}
      />
      {isEditMode && (
        <p className="mt-1 text-xs text-gray-500">Item name cannot be changed after creation</p>
      )}
    </div>

    {/* Quantities */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quantities *
      </label>
      <div className="flex gap-4 flex-wrap">
        {quantities.map((quantity) => (
          <label key={quantity} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="quantities"
              value={quantity}
              checked={formData.quantities.includes(quantity)}
              onChange={handleQuantityChange}
              className="h-4 w-4 text-[#69231B] rounded border-gray-300 focus:ring-[#69231B]"
            />
            <span className="text-sm text-gray-600">{quantity}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Dynamic Price Inputs for Selected Quantities */}
    {formData.quantities.length > 0 && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prices *
        </label>
        {formData.quantities.map((quantity) => (
          <div key={quantity} className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              Price for {quantity}
            </label>
            <input
              type="number"
              name={quantity}
              value={formData.prices[quantity] || ""}
              onChange={handlePriceChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B] transition-all duration-200"
              required
              min="0"
              step="0.01"
              placeholder={`Enter price for ${quantity}`}
            />
          </div>
        ))}
      </div>
    )}

    {/* Image Upload */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Menu Item Image
      </label>
      
      {/* Show existing image if available and no new image selected */}
      {existingImageUrl && !formData.image && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Current Image:</p>
          <MenuItemImage src={existingImageUrl} alt="Current menu item" />
        </div>
      )}
      
      <input
        type="file"
        name="image"
        onChange={handleImageChange}
        accept="image/*"
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FCFCFC] file:text-[#69231B] hover:file:bg-[#F5F0EF] transition-all duration-200"
      />
      {formData.image && (
        <div className="mt-3">
          {formData.image instanceof File ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <p className="mt-2 text-xs text-green-600">
                ✓ New image selected: {formData.image.name}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-green-600">
              ✓ Image selected: {formData.image.name || "Image"}
            </p>
          )}
        </div>
      )}
      <p className="mt-1 text-xs text-gray-500">
        {existingImageUrl && !formData.image 
          ? "Upload a new image to replace the current one (optional)" 
          : "Upload an image for this menu item (JPEG, PNG, GIF, WEBP, AVIF up to 1MB)"}
      </p>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-4 pt-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleCancel}
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
      >
        Cancel
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="px-6 py-3 rounded-lg shadow-md transition-all duration-200"
        style={{ backgroundColor: "#FFFFFF", color: "#69231B", border: "1.5px solid #69231B" }}
      >
        {submitText}
      </motion.button>
    </div>
  </form>
);

const MenuManagements = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(""); // Branch filter for displaying menu items
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(""); // Category filter for displaying menu items
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState(""); // Subcategory filter for displaying menu items
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    branchId: "",
    categoryId: "",
    subcategoryId: "",
    quantities: [],
    prices: {},
    image: null,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Constants for quantity variants
  const quantities = ["Small", "Medium", "Large"];

  // API Base URL - use environment variable or default (same as CategoryManagement.jsx)
  // Always derive backend base URL (without /api/v1) for images and direct calls
  const BACKEND_BASE = "https://crm.jagalikoota.com";
  let API_BASE_URL = import.meta.env.VITE_API_URL || `${BACKEND_BASE}/api/v1`;
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "");
  const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
    ? `${API_BASE_URL}/hotel`
    : `${API_BASE_URL}/api/v1/hotel`;

  // Determine API URL based on environment
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const API_URL = isDevelopment
    ? `${BACKEND_BASE}/api/v1/hotel`
    : HOTEL_API_BASE;

  // Helper function to get correct image URL - SIMPLIFIED & ROBUST
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Normalize: backslashes → slashes, trim, strip leading slashes
    let cleanPath = imagePath.replace(/\\/g, '/').trim().replace(/^\/+/, '');

    // Ensure starts with uploads/
    if (!cleanPath.startsWith('uploads/')) {
      // If it's just a filename, put under uploads/menu by default
      cleanPath = cleanPath.includes('/') ? `uploads/${cleanPath}` : `uploads/menu/${cleanPath}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/v1.*$/, '')
      : BACKEND_BASE;

    return `${baseUrl}/${cleanPath}`;
  };

  // Helper function to extract ID from various formats (defined early so it can be used everywhere)
  const extractId = (idValue) => {
    if (!idValue) return null;
    if (typeof idValue === "object" && idValue._id) {
      return String(idValue._id);
    }
    if (typeof idValue === "object" && idValue.id) {
      return String(idValue.id);
    }
    return String(idValue);
  };

  // Fetch menu items, branches, categories, and recipes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch restaurants from Restaurant Profile (EXACT same as CategoryManagement.jsx)
        // Use the exact same API call and method as RestaurantProfile.jsx and CategoryManagement.jsx
        const restaurantUrl = `${HOTEL_API_BASE}/getAllRestaurants?all=true`;
        console.log("MenuManagements: Fetching from URL:", restaurantUrl);

        const restaurantResponse = await fetch(restaurantUrl);
        let restaurantsData = [];
        if (restaurantResponse.ok) {
          const data = await restaurantResponse.json();
          // Use the exact same parsing logic as RestaurantProfile.jsx (line 51-54) and CategoryManagement.jsx (line 487-488)
          if (data.success && data.data) {
            restaurantsData = Array.isArray(data.data) ? data.data : [];
          } else {
            console.warn(
              "MenuManagements: Unexpected response structure:",
              data
            );
          }
        } else {
          console.error(
            "MenuManagements: Failed to fetch restaurants:",
            restaurantResponse.status,
            restaurantResponse.statusText
          );
        }

        console.log(
          "MenuManagements: Fetched restaurants from Restaurant Profile:",
          restaurantsData.length,
          restaurantsData
        );

        if (restaurantsData.length === 0) {
          console.warn("MenuManagements: No restaurants found! Branches will be empty.");
        }

        // Convert restaurants to branch format (EXACT same as CategoryManagement.jsx)
        // Use the exact same logic as RestaurantProfile.jsx for branch name
        const restaurantProfileBranches = restaurantsData.map((restaurant) => {
          // Combine address fields into a single address string
          const addressParts = [];
          if (restaurant.address?.street)
            addressParts.push(restaurant.address.street);
          if (restaurant.address?.city)
            addressParts.push(restaurant.address.city);
          if (restaurant.address?.state)
            addressParts.push(restaurant.address.state);
          if (restaurant.address?.country)
            addressParts.push(restaurant.address.country);
          const fullAddress = addressParts.join(", ");

          // Use branchName first (same as RestaurantProfile.jsx line 297)
          const branchName =
            restaurant.branchName ||
            restaurant.restaurantName ||
            "Unnamed Branch";

          console.log("MenuManagements Restaurant Profile Branch:", {
            _id: restaurant._id,
            branchName: restaurant.branchName,
            restaurantName: restaurant.restaurantName,
            finalName: branchName,
          });

          return {
            _id: restaurant._id,
            name: branchName,
            address:
              fullAddress ||
              (typeof restaurant.address === "string"
                ? restaurant.address
                : "") ||
              "",
            image: restaurant.image || null,
            source: "restaurant",
          };
        });

        console.log(
          "MenuManagements Restaurant Profile Branches:",
          restaurantProfileBranches.map((b) => ({ id: b._id, name: b.name }))
        );

        // Fetch branches from Branch Management to match categories (for backward compatibility)
        const branchResponse = await fetch(`${HOTEL_API_BASE}/branch`);
        let branchesData = [];
        if (branchResponse.ok) {
          branchesData = await branchResponse.json();
          branchesData = Array.isArray(branchesData) ? branchesData : [];
          console.log("MenuManagements: Fetched branches from Branch Management:", branchesData.length, branchesData);
        } else {
          console.error("MenuManagements: Failed to fetch branches from Branch Management");
        }

        // If no restaurant profile branches, use branch management branches as fallback
        let finalBranches = restaurantProfileBranches;
        if (restaurantProfileBranches.length === 0 && branchesData.length > 0) {
          console.log("MenuManagements: Using Branch Management branches as fallback");
          finalBranches = branchesData.map(branch => ({
            _id: branch._id,
            name: branch.name || branch.branchName || "Unnamed Branch",
            address: branch.address || "",
            source: "branch-management"
          }));
        }

        // Fetch categories
        const categoriesResponse = await fetch(`${HOTEL_API_BASE}/category`);
        let categoriesData = [];
        if (categoriesResponse.ok) {
          const raw = await categoriesResponse.json();
          categoriesData = Array.isArray(raw) ? raw : (raw.data || raw.categories || []);
        } else {
          console.warn("MenuManagements: Failed to fetch categories:", categoriesResponse.status);
        }

        // Fetch subcategories - gracefully handle if endpoint doesn't exist
        let subcategoriesData = [];
        try {
          const subcategoriesResponse = await fetchDualBackend("/hotel/subcategory", {}, true);
          if (subcategoriesResponse && Array.isArray(subcategoriesResponse)) {
            subcategoriesData = subcategoriesResponse;
          } else if (subcategoriesResponse && subcategoriesResponse.data && Array.isArray(subcategoriesResponse.data)) {
            subcategoriesData = subcategoriesResponse.data;
          }
        } catch (subErr) {
          console.warn("MenuManagements: Subcategories not available (endpoint may not exist):", subErr.message);
        }
        console.log("MenuManagements: Fetched subcategories:", subcategoriesData.length);

        // Transform categories - PRESERVE original branchId from API
        // Categories created in CategoryManagement.jsx already have the correct branchId
        const transformedCategories = categoriesData.map((category) => {
          // PRESERVE the original branchId from the category (this is what was saved when category was created)
          const originalBranchId = category.branchId || category.branch?.id;

          console.log("MenuManagements Category (Original):", {
            _id: category._id,
            name: category.name,
            originalBranchId: originalBranchId,
            branchId: category.branchId,
            branchIdFromBranch: category.branch?.id,
            branchName: category.branch?.name,
            branchAddress: category.branch?.address,
          });

          // Find the corresponding branch from Restaurant Profile branches for display
          let branch = null;
          if (originalBranchId) {
            // First try Restaurant Profile branches
            branch = restaurantProfileBranches.find(
              (b) => String(b._id) === String(originalBranchId)
            );

            // If not found, try Branch Management branches
            if (!branch) {
              const branchMgmtBranch = branchesData.find(
                (b) => String(b._id) === String(originalBranchId)
              );
              if (branchMgmtBranch) {
                // Check if this matches a Restaurant Profile branch
                const matchingRPBranch = restaurantProfileBranches.find(
                  (rpBranch) =>
                    rpBranch.name === branchMgmtBranch.name &&
                    rpBranch.address === branchMgmtBranch.address
                );
                branch = matchingRPBranch || branchMgmtBranch;
              }
            }
          }

          // If still not found but category has branch info, use that
          if (!branch && category.branch) {
            branch = {
              _id: category.branch.id || originalBranchId,
              name: category.branch.name,
              address: category.branch.address,
            };
          }

          console.log(
            "MenuManagements Matched branch:",
            branch ? { id: branch._id, name: branch.name } : "NOT FOUND"
          );

          // IMPORTANT: Preserve the original branchId - this is what we'll use for filtering
          // Convert to string for consistent comparison
          const branchIdString = originalBranchId
            ? String(originalBranchId)
            : undefined;

          return {
            ...category,
            branchId: branchIdString, // Use original branchId from API - this is what CategoryManagement.jsx saved
            branch: branch
              ? {
                  id: String(branch._id),
                  name: branch.name,
                  address: branch.address || "Address not available",
                }
              : {
                  id: originalBranchId ? String(originalBranchId) : "unknown",
                  name: category.branch?.name || "Unknown Branch",
                  address: category.branch?.address || "Address not available",
                },
          };
        });
        
        // Use Restaurant Profile branches or fallback to Branch Management branches
        console.log(
          "MenuManagements: Setting branches:",
          finalBranches.length,
          finalBranches.map((b) => ({
            id: b._id,
            idString: String(b._id),
            name: b.name,
          }))
        );
        console.log(
          "MenuManagements: Setting categories:",
          transformedCategories.length,
          transformedCategories.map((c) => ({
            id: c._id,
            name: c.name,
            branchId: c.branchId,
            branchIdString: String(c.branchId || ""),
            branchIdFromBranch: c.branch?.id,
            branchIdFromBranchString: String(c.branch?.id || ""),
          }))
        );

        // Categories already have branchId as string from transformation above
        setBranches(finalBranches);
        setCategories(transformedCategories);
        setSubcategories(subcategoriesData);

        // Fetch menu items - gracefully handle failures
        let fetchedMenuItems = [];
        try {
          const result = await fetchDualBackend("/hotel/menu", {}, true);
          fetchedMenuItems = Array.isArray(result) ? result : [];
        } catch (menuErr) {
          console.warn("MenuManagements: Could not fetch menu items:", menuErr.message);
          fetchedMenuItems = [];
        }

        // Debug: Log menu items structure
        console.log(
          "MenuManagements: Fetched menu items:",
          fetchedMenuItems.length
        );
        if (fetchedMenuItems.length > 0) {
          console.log("MenuManagements: Sample menu item structure:", {
            itemName: fetchedMenuItems[0].itemName,
            branchId: fetchedMenuItems[0].branchId,
            branchIdType: typeof fetchedMenuItems[0].branchId,
            branchIdIsObject: typeof fetchedMenuItems[0].branchId === "object",
            branchId_id: fetchedMenuItems[0].branchId?._id,
            branchIdName: fetchedMenuItems[0].branchId?.name,
            categoryId: fetchedMenuItems[0].categoryId,
            categoryIdType: typeof fetchedMenuItems[0].categoryId,
            categoryId_id: fetchedMenuItems[0].categoryId?._id,
            categoryIdName: fetchedMenuItems[0].categoryId?.name,
          });
          console.log(
            "MenuManagements: All menu items with IDs:",
            fetchedMenuItems.map((item) => ({
              name: item.itemName,
              branchId: item.branchId,
              branchId_id: item.branchId?._id,
              branchIdString: item.branchId
                ? String(item.branchId._id || item.branchId)
                : null,
              categoryId: item.categoryId,
              categoryId_id: item.categoryId?._id,
              categoryIdString: item.categoryId
                ? String(item.categoryId._id || item.categoryId)
                : null,
              subcategoryId: item.subcategoryId,
              subcategoryId_id: item.subcategoryId?._id,
              subcategoryIdString: item.subcategoryId
                ? String(item.subcategoryId._id || item.subcategoryId)
                : null,
            }))
          );
        }

        // Compare branch IDs from menu items with branches
        console.log("MenuManagements: Branch ID comparison:", {
          branchesFromRestaurantProfile: restaurantProfileBranches.map((b) => ({
            id: b._id,
            idString: String(b._id),
            name: b.name,
          })),
          menuItemBranchIds: fetchedMenuItems.map((item) => ({
            itemName: item.itemName,
            branchId: item.branchId,
            branchIdExtracted: extractId(item.branchId),
          })),
        });

        setMenuItems(fetchedMenuItems);

        setLoading(false);
      } catch (err) {
        console.warn("MenuManagements: fetchData error (non-critical):", err.message);
        // Don't show error — show empty state instead
        setMenuItems([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter subcategories based on selected category
  useEffect(() => {
    if (selectedCategoryFilter && subcategories.length > 0) {
      const filtered = subcategories.filter((subcategory) => {
        const subcatCategoryId = subcategory.categoryId?._id || subcategory.categoryId;
        return subcatCategoryId === selectedCategoryFilter;
      });
      setFilteredSubcategories(filtered);
      
      // Clear subcategory selection if it doesn't belong to the new category
      if (selectedSubcategoryFilter) {
        const subcategoryBelongsToCategory = filtered.some(
          (subcat) => subcat._id === selectedSubcategoryFilter
        );
        if (!subcategoryBelongsToCategory) {
          setSelectedSubcategoryFilter("");
        }
      }
    } else {
      setFilteredSubcategories([]);
      setSelectedSubcategoryFilter("");
    }
  }, [selectedCategoryFilter, subcategories, selectedSubcategoryFilter]);

  // Filter menu items based on selected branch, category, and subcategory
  const filteredMenuItems = menuItems.filter((item) => {
    // Filter by branch
    if (selectedBranchFilter) {
      const selectedBranch = branches.find(
        (b) => b._id === selectedBranchFilter
      );
      if (!selectedBranch) return false;

      const itemBranchId = extractId(item.branchId);
      const selectedBranchId = String(selectedBranchFilter);

      // Get branch name from menu item (could be populated object or direct name)
      const itemBranchName = item.branchId?.name || item.branchName;

      // Match by ID first, then by name as fallback (for backward compatibility)
      const idMatch = itemBranchId === selectedBranchId;
      const nameMatch = itemBranchName === selectedBranch.name;

      // Debug logging
      if (menuItems.indexOf(item) < 2) {
        console.log("MenuManagements: Branch filter check:", {
          itemName: item.itemName,
          itemBranchId: itemBranchId,
          itemBranchIdRaw: item.branchId,
          itemBranchName: itemBranchName,
          selectedBranchId: selectedBranchId,
          selectedBranchName: selectedBranch.name,
          idMatch: idMatch,
          nameMatch: nameMatch,
          finalMatch: idMatch || nameMatch,
        });
      }

      if (!idMatch && !nameMatch) {
        return false;
      }
    }

    // Filter by category
    if (selectedCategoryFilter) {
      const itemCategoryId = extractId(item.categoryId);
      const selectedCategoryId = String(selectedCategoryFilter);

      // Debug logging
      if (menuItems.indexOf(item) < 2) {
        console.log("MenuManagements: Category filter check:", {
          itemName: item.itemName,
          itemCategoryId: itemCategoryId,
          itemCategoryIdRaw: item.categoryId,
          selectedCategoryId: selectedCategoryId,
          matches: itemCategoryId === selectedCategoryId,
          categoryIdType: typeof item.categoryId,
        });
      }

      if (itemCategoryId !== selectedCategoryId) {
        return false;
      }
    }

    // Filter by subcategory
    if (selectedSubcategoryFilter) {
      const itemSubcategoryId = extractId(item.subcategoryId);
      const selectedSubcategoryId = String(selectedSubcategoryFilter);

      if (itemSubcategoryId !== selectedSubcategoryId) {
        return false;
      }
    }

    return true;
  });

  // Debug: Log filter results
  useEffect(() => {
    console.log("MenuManagements: Filter state:", {
      selectedBranchFilter: selectedBranchFilter,
      selectedCategoryFilter: selectedCategoryFilter,
      totalMenuItems: menuItems.length,
      filteredMenuItems: filteredMenuItems.length,
      branches: branches.map((b) => ({
        id: b._id,
        idString: String(b._id),
        name: b.name,
      })),
      categories: categories.map((c) => ({
        id: c._id,
        idString: String(c._id),
        name: c.name,
        branchId: c.branchId,
      })),
    });
  }, [
    selectedBranchFilter,
    selectedCategoryFilter,
    menuItems.length,
    filteredMenuItems.length,
  ]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "itemName") {
      const filteredValue = value.replace(/[^a-zA-Z ]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: filteredValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newQuantities = prev.quantities.includes(value)
        ? prev.quantities.filter((qty) => qty !== value)
        : [...prev.quantities, value];

      const newPrices = { ...prev.prices };
      if (!newQuantities.includes(value)) {
        delete newPrices[value];
      }

      return { ...prev, quantities: newQuantities, prices: newPrices };
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      prices: { ...prev.prices, [name]: parseFloat(value) || "" },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setError(""); // Clear any previous errors
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      branchId: "",
      categoryId: "",
      subcategoryId: "",
      quantities: [],
      prices: {},
      image: null,
    });
    setExistingImageUrl(null);
    setError("");
  };

  // Helper to get display values with lookup
  const getDisplayBranch = (item) => {
    return (
      item.branchId?.name ||
      item.branchName ||
      branches.find(
        (b) => b._id === item.branchId || b._id === item.branchId?._id
      )?.name ||
      "N/A"
    );
  };

  const getDisplayCategory = (item) => {
    return (
      item.categoryId?.name ||
      item.categoryName ||
      categories.find(
        (c) => c._id === item.categoryId || c._id === item.categoryId?._id
      )?.name ||
      "N/A"
    );
  };

  const getDisplaySubcategory = (item) => {
    if (!item.subcategoryId) return "None";
    
    return (
      item.subcategoryId?.name ||
      item.subcategoryName ||
      subcategories.find(
        (s) => s._id === item.subcategoryId || s._id === item.subcategoryId?._id
      )?.name ||
      "N/A"
    );
  };

  const getDisplayName = (item) => {
    return item.name || item.itemName || "N/A";
  };

  // Handle edit click - populate form with item data
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.name || item.itemName || "",
      branchId: extractId(item.branchId) || "",
      categoryId: extractId(item.categoryId) || "",
      subcategoryId: extractId(item.subcategoryId) || "",
      quantities: item.quantities || [],
      // Normalize prices: handle both plain object and Mongoose Map
      prices: item.prices instanceof Map
        ? Object.fromEntries(item.prices)
        : (item.prices || {}),
      image: null, // Don't pre-populate image
    });
    
    // Set existing image URL for preview
    if (item.image) {
      setExistingImageUrl(getImageUrl(item.image));
    } else {
      setExistingImageUrl(null);
    }
    
    setIsEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Add item
  const handleAddItem = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.quantities.length === 0) {
      setError("Please select at least one quantity");
      return;
    }
    for (const qty of formData.quantities) {
      if (!formData.prices[qty] || formData.prices[qty] <= 0) {
        setError(`Please enter a valid price for ${qty}`);
        return;
      }
    }
    if (!formData.itemName || !formData.branchId || !formData.categoryId) {
      setError("Please fill all required fields");
      return;
    }

    try {
      // Get branch and category details
      const selectedBranch = branches.find((b) => b._id === formData.branchId);
      const selectedCategory = categories.find(
        (c) => c._id === formData.categoryId
      );

      // Validate branch and category are found
      if (!selectedBranch) {
        setError("Selected branch not found. Please refresh and try again.");
        return;
      }
      if (!selectedCategory) {
        setError("Selected category not found. Please refresh and try again.");
        return;
      }

      // Common fields - ensure all values are properly formatted
      // Backend expects menuTypes (required) - using quantities as menuTypes since form doesn't have menuTypes field
      const requestData = {
        itemName: formData.itemName.trim(),
        categoryId: String(formData.categoryId), // Ensure string format
        branchId: String(formData.branchId), // Ensure string format
        menuTypes: Array.isArray(formData.quantities)
          ? formData.quantities
          : [], // Backend requires menuTypes
        quantities: Array.isArray(formData.quantities)
          ? formData.quantities
          : [],
        prices: formData.prices || {},
      };

      // Ensure prices object has valid numbers for all quantities
      const validatedPrices = {};
      let hasInvalidPrice = false;
      formData.quantities.forEach((qty) => {
        const price = formData.prices[qty];
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        if (
          price !== undefined &&
          price !== null &&
          price !== "" &&
          !isNaN(numPrice) &&
          numPrice > 0
        ) {
          validatedPrices[qty] = numPrice;
        } else {
          hasInvalidPrice = true;
          console.error(`Invalid price for ${qty}:`, price);
        }
      });

      if (
        hasInvalidPrice ||
        Object.keys(validatedPrices).length !== formData.quantities.length
      ) {
        setError("Please enter valid prices for all selected quantities");
        return;
      }

      requestData.prices = validatedPrices;

      console.log("MenuManagements: Sending request data:", requestData);
      console.log("MenuManagements: Quantities:", requestData.quantities);
      console.log("MenuManagements: Prices:", requestData.prices);
      console.log(
        "MenuManagements: Image:",
        formData.image ? formData.image.name : "No image"
      );

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("itemName", requestData.itemName);
      formDataToSend.append("categoryId", requestData.categoryId);
      formDataToSend.append("branchId", requestData.branchId);
      if (formData.subcategoryId) {
        formDataToSend.append("subcategoryId", formData.subcategoryId);
      }
      formDataToSend.append("menuTypes", JSON.stringify(requestData.menuTypes));
      formDataToSend.append(
        "quantities",
        JSON.stringify(requestData.quantities)
      );
      formDataToSend.append("prices", JSON.stringify(requestData.prices));
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Send request to both backends with FormData
      const response = await fetchDualBackend("/hotel/menu", {
        method: "POST",
        body: formDataToSend,
      });

      console.log(
        "MenuManagements: Response after adding item:",
        response
      );
      console.log(
        "MenuManagements: Menu item image path:",
        response.image
      );

      // Add a small delay to ensure file is written to disk
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh menu items from both backends
      const menuItems = await fetchDualBackend("/hotel/menu", {}, true);
      setMenuItems(menuItems);
      
      // Show success message
      setSuccessMessage(`Menu item "${formData.itemName}" added successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      
      resetForm();
      setIsAddModalOpen(false);
      setError("");
    } catch (err) {
      console.error("Error adding menu item:", err);
      
      const errorMessage = err.message || "Failed to add menu item";
      setError(`Failed to add menu item: ${errorMessage}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Edit item
  const handleEditItem = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (formData.quantities.length === 0) {
      setError("Please select at least one quantity");
      setTimeout(() => setError(""), 5000);
      return;
    }
    for (const qty of formData.quantities) {
      if (!formData.prices[qty] || formData.prices[qty] <= 0) {
        setError(`Please enter a valid price for ${qty}`);
        setTimeout(() => setError(""), 5000);
        return;
      }
    }

    // Use selectedItem data for disabled fields (branch, category, itemName)
    const itemName = selectedItem.itemName || selectedItem.name || formData.itemName;
    const branchId = extractId(selectedItem.branchId) || formData.branchId;
    const categoryId = extractId(selectedItem.categoryId) || formData.categoryId;

    if (!itemName) {
      setError("Item name is required");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (!categoryId) {
      setError("Category is required");
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {

      // Use data from selectedItem for disabled fields, formData for editable fields
      const requestData = {
        itemName: itemName.trim(),
        categoryId: String(categoryId),
        branchId: branchId ? String(branchId) : undefined, // Optional - some items don't have branch
        menuTypes: Array.isArray(formData.quantities) ? formData.quantities : [],
        quantities: Array.isArray(formData.quantities) ? formData.quantities : [],
        prices: formData.prices || {},
      };

      // Ensure prices object has valid numbers for all quantities
      const validatedPrices = {};
      formData.quantities.forEach((qty) => {
        const price = formData.prices[qty];
        const numPrice = typeof price === "string" ? parseFloat(price) : price;
        if (
          price !== undefined &&
          price !== null &&
          price !== "" &&
          !isNaN(numPrice) &&
          numPrice > 0
        ) {
          validatedPrices[qty] = numPrice;
        }
      });
      requestData.prices = validatedPrices;

      console.log("MenuManagements: Updating menu item with data:", requestData);
      console.log("MenuManagements: Image:", formData.image ? formData.image.name : "No new image");

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("itemName", requestData.itemName);
      formDataToSend.append("categoryId", requestData.categoryId);
      if (requestData.branchId) {
        formDataToSend.append("branchId", requestData.branchId);
      }
      if (formData.subcategoryId) {
        formDataToSend.append("subcategoryId", formData.subcategoryId);
      }
      formDataToSend.append("menuTypes", JSON.stringify(requestData.menuTypes));
      formDataToSend.append(
        "quantities",
        JSON.stringify(requestData.quantities)
      );
      formDataToSend.append("prices", JSON.stringify(requestData.prices));
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const itemId = selectedItem._id || selectedItem.id;
      const response = await fetchDualBackend(`/hotel/menu/${itemId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      console.log(
        "MenuManagements: Response after updating item:",
        response
      );
      console.log(
        "MenuManagements: Updated menu item image path:",
        response.image
      );

      // Refresh menu items from both backends
      const menuItems = await fetchDualBackend("/hotel/menu", {}, true);
      setMenuItems(menuItems);

      // Show success message
      setSuccessMessage(`Menu item "${itemName}" updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);

      setIsEditModalOpen(false);
      resetForm();
      setError("");
    } catch (err) {
      console.error("Error updating menu item:", err);
      
      const errorMessage = err.message || "Failed to update menu item";
      setError(`Failed to update menu item: ${errorMessage}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Delete item
  const handleDeleteItem = async () => {
    if (!selectedItem) {
      setError("No item selected for deletion");
      return;
    }

    // Get the item ID - check multiple possible ID fields
    const itemId = selectedItem._id || selectedItem.id || selectedItem.menuId;

    if (!itemId) {
      setError("Cannot delete item: ID is missing");
      setIsDeleteModalOpen(false);
      return;
    }

    const itemName = selectedItem.itemName || selectedItem.name || "Menu item";
    
    try {
      await fetchDualBackend(`/hotel/menu/${itemId}`, {
        method: "DELETE",
      });

      // Update state
      setMenuItems((prev) =>
        prev.filter((item) => {
          const id = item._id || item.id || item.menuId;
          return id !== itemId;
        })
      );
      
      // Show success message
      setSuccessMessage(`Menu item "${itemName}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      setError("");
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setError("Failed to delete menu item: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FCFCFC" }}>
        <div className="text-lg font-medium text-gray-600">
          Loading menu data...
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        marginTop: "-24px",
        marginLeft: "-24px",
        marginRight: "0",
        paddingTop: 0,
      }}
    >
      <div className="min-h-screen" style={{ backgroundColor: "#FCFCFC" }}>
        {/* Background: clean white/off-white, no gradients */}

        <div className="relative z-10 container mx-auto px-4 py-8">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300 flex items-center gap-2"
            >
              <span className="text-xl">&#9888;</span>
              <span>{error}</span>
            </motion.div>
          )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-300 flex items-center gap-2"
          >
            <span className="text-xl">&#10003;</span>
            <span>{successMessage}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Menu Management
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: "#FFFFFF", color: "#69231B", border: "1.5px solid #69231B" }}
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </motion.button>
        </motion.div>

          {/* Branch Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 overflow-x-auto">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Branch:
                </label>
              </div>
              <div className="flex gap-2 min-w-max">
                {/* All Branches Tab */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedBranchFilter("");
                    setSelectedCategoryFilter(""); // Reset category when switching to all branches
                    setSelectedSubcategoryFilter(""); // Reset subcategory
                  }}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedBranchFilter === ""
                      ? "text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={selectedBranchFilter === "" ? { backgroundColor: "#69231B" } : {}}
                >
                  All Branches
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedBranchFilter === ""
                        ? "text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                    style={selectedBranchFilter === "" ? { backgroundColor: "#7a2920" } : {}}
                  >
                    {menuItems.length}
                  </span>
                </motion.button>

                {/* Individual Branch Tabs */}
                {(() => {
                  console.log("MenuManagements: Rendering branch buttons, branches:", branches.length, branches.map(b => ({ id: b._id, name: b.name })));
                  return branches.map((branch) => {
                    const branchItemCount = menuItems.filter((item) => {
                      const itemBranchId = extractId(item.branchId);
                      const branchIdStr = String(branch._id);

                      // Also check by branch name if IDs don't match (for backward compatibility)
                      const itemBranchName =
                        item.branchId?.name || item.branchName;
                      const branchNameMatch = itemBranchName === branch.name;

                      return itemBranchId === branchIdStr || branchNameMatch;
                    }).length;

                    console.log(`MenuManagements: Branch "${branch.name}" has ${branchItemCount} items`);

                    return (
                      <motion.button
                        key={branch._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          console.log("MenuManagements: Branch clicked:", branch.name, branch._id);
                          setSelectedBranchFilter(branch._id);
                          setSelectedCategoryFilter(""); // Reset category when switching branch
                          setSelectedSubcategoryFilter(""); // Reset subcategory
                        }}
                        className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                          selectedBranchFilter === branch._id
                            ? "bg-[#69231B] text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {branch.name}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            selectedBranchFilter === branch._id
                              ? "bg-[#FCFCFC]0 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {branchItemCount}
                        </span>
                      </motion.button>
                    );
                  });
                })()}
              </div>
            </div>
          </motion.div>

          {/* Category Filter - Always show */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 overflow-x-auto">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Category:
                </label>
              </div>
              <div className="flex gap-2 min-w-max">
                {/* All Categories Tab */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategoryFilter("")}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedCategoryFilter === ""
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Categories
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedCategoryFilter === ""
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {
                      selectedBranchFilter
                        ? menuItems.filter((item) => {
                            const itemBranchId = extractId(item.branchId);
                            return itemBranchId === String(selectedBranchFilter);
                          }).length
                        : menuItems.length
                    }
                  </span>
                </motion.button>

                {/* Individual Category Tabs - Filter by selected branch if any */}
                {categories
                  .filter((category) => {
                    if (!selectedBranchFilter) return true; // Show all categories if no branch selected
                    
                    const selectedBranch = branches.find(
                      (b) => b._id === selectedBranchFilter
                    );
                    if (!selectedBranch) return false;

                    const categoryBranchId = extractId(
                      category.branchId || category.branch?.id
                    );
                    const categoryBranchName =
                      category.branch?.name || category.branchName;

                    // Match by ID or name
                    return (
                      categoryBranchId === String(selectedBranchFilter) ||
                      categoryBranchName === selectedBranch.name
                    );
                  })
                  .map((category) => {
                    const categoryItemCount = menuItems.filter((item) => {
                      const itemCategoryId = extractId(item.categoryId);
                      
                      // Match category
                      const categoryMatches = itemCategoryId === String(category._id);
                      
                      // If branch filter is active, also match branch
                      if (selectedBranchFilter) {
                        const selectedBranch = branches.find(
                          (b) => b._id === selectedBranchFilter
                        );
                        if (!selectedBranch) return false;
                        
                        const itemBranchId = extractId(item.branchId);
                        const itemBranchName = item.branchId?.name || item.branchName;
                        const branchMatches =
                          itemBranchId === String(selectedBranchFilter) ||
                          itemBranchName === selectedBranch.name;
                        
                        return branchMatches && categoryMatches;
                      }
                      
                      return categoryMatches;
                    }).length;

                    return (
                      <motion.button
                        key={category._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSelectedCategoryFilter(category._id)
                        }
                        className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                          selectedCategoryFilter === category._id
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.name}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            selectedCategoryFilter === category._id
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {categoryItemCount}
                        </span>
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          </motion.div>

          {/* Subcategory Filter - Only show when a category is selected and has subcategories */}
          {selectedCategoryFilter && filteredSubcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2 overflow-x-auto">
                <div className="flex items-center gap-3 mb-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Filter by Subcategory:
                  </label>
                </div>
                <div className="flex gap-2 min-w-max">
                  {/* All Subcategories Tab */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubcategoryFilter("")}
                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                      selectedSubcategoryFilter === ""
                        ? "bg-[#69231B] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Subcategories
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        selectedSubcategoryFilter === ""
                          ? "bg-[#69231B] text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {filteredMenuItems.length}
                    </span>
                  </motion.button>

                  {/* Individual Subcategory Tabs */}
                  {filteredSubcategories.map((subcategory) => {
                    const subcategoryItemCount = menuItems.filter((item) => {
                      const itemBranchId = extractId(item.branchId);
                      const itemCategoryId = extractId(item.categoryId);
                      const itemSubcategoryId = extractId(item.subcategoryId);

                      const branchMatches = selectedBranchFilter
                        ? itemBranchId === String(selectedBranchFilter)
                        : true;
                      const categoryMatches =
                        itemCategoryId === String(selectedCategoryFilter);
                      const subcategoryMatches =
                        itemSubcategoryId === String(subcategory._id);

                      return branchMatches && categoryMatches && subcategoryMatches;
                    }).length;

                    return (
                      <motion.button
                        key={subcategory._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSelectedSubcategoryFilter(subcategory._id)
                        }
                        className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                          selectedSubcategoryFilter === subcategory._id
                            ? "bg-[#69231B] text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {subcategory.name}
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            selectedSubcategoryFilter === subcategory._id
                              ? "bg-[#69231B] text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {subcategoryItemCount}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Menu Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 overflow-x-auto"
            style={{ maxWidth: "100%", whiteSpace: "nowrap" }}
          >
            {filteredMenuItems.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {selectedBranchFilter || selectedCategoryFilter
                    ? `No menu items found${
                        selectedBranchFilter
                          ? ` for ${
                              branches.find(
                                (b) => b._id === selectedBranchFilter
                              )?.name || "this branch"
                            }`
                          : ""
                      }${
                        selectedCategoryFilter
                          ? ` in ${
                              categories.find(
                                (c) => c._id === selectedCategoryFilter
                              )?.name || "this category"
                            }`
                          : ""
                      }.`
                    : "No menu items found. Add your first menu item to get started!"}
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#69231B] to-[#D1C9BC] text-white">
                    <th className="p-4 text-left text-sm font-semibold">
                      Image
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Subcategory
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Item Name
                    </th>
                    {/* <th className="p-4 text-left text-sm font-semibold">Recipe</th> */}
                    <th className="p-4 text-left text-sm font-semibold">
                      Prices
                    </th>
                    <th className="p-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.map((item, index) => {
                    // Ensure unique key - use ID or fallback to index
                    const itemId =
                      item._id || item.id || item.menuId || `item-${index}`;
                    return (
                      <motion.tr
                        key={itemId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-[#FCFCFC] transition-all duration-200`}
                      >
                        <td className="p-4 border-t border-gray-200">
                          <MenuItemImage src={getImageUrl(item.image)} alt={getDisplayName(item)} />
                        </td>
                        <td className="p-4 border-t border-gray-200 text-gray-700">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {getDisplayCategory(item)}
                          </span>
                        </td>
                        <td className="p-4 border-t border-gray-200 text-gray-700">
                          {item.subcategoryId ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {getDisplaySubcategory(item)}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              None
                            </span>
                          )}
                        </td>
                        <td className="p-4 border-t border-gray-200 text-gray-700">
                          <div className="font-medium text-sm">
                            {getDisplayName(item)}
                          </div>
                        </td>
                        {/* <td className="p-4 border-t border-gray-200 text-gray-700">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {item.recipeId?.name || "No Recipe"}
                    </span>
                  </td> */}
                  <td className="p-4 border-t border-gray-200 text-gray-700 max-w-[200px]">
                    <div className="flex flex-col gap-2">
                      {(item.quantities || []).map((qty) => (
                        <div
                          key={qty}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{qty}:</span>
                          <span className="font-medium text-green-600">
                            &#8377;{item.prices?.[qty] ?? "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-[#69231B] hover:text-[#7a2920] hover:bg-[#FCFCFC] rounded-lg transition-all duration-200"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
                );
              })}
            </tbody>
          </table>
          )}
        </motion.div>

          {/* Add Modal */}
          <AnimatePresence>
            {isAddModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]"
                >
                  <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Plus className="h-6 w-6 text-[#69231B]" /> Add Item
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsAddModalOpen(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                  <MenuItemForm
                    formData={formData}
                    handleChange={handleChange}
                    handlePriceChange={handlePriceChange}
                    handleImageChange={handleImageChange}
                    handleQuantityChange={handleQuantityChange}
                    onSubmit={handleAddItem}
                    submitText="Add Item"
                    branches={branches}
                    categories={categories}
                    subcategories={subcategories}
                    quantities={quantities}
                    handleCancel={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {isEditModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]"
                >
                  <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Edit className="h-6 w-6 text-[#69231B]" /> Edit Item
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsEditModalOpen(false);
                        resetForm();
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                  <MenuItemForm
                    formData={formData}
                    handleChange={handleChange}
                    handlePriceChange={handlePriceChange}
                    handleImageChange={handleImageChange}
                    handleQuantityChange={handleQuantityChange}
                    onSubmit={handleEditItem}
                    submitText="Update Item"
                    branches={branches}
                    categories={categories}
                    subcategories={subcategories}
                    quantities={quantities}
                    existingImageUrl={existingImageUrl}
                    isEditMode={true}
                    handleCancel={() => {
                      setIsEditModalOpen(false);
                      resetForm();
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Modal */}
          <AnimatePresence>
            {isDeleteModalOpen && selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[80vh]"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="mb-6 text-gray-700 text-center">
                    Are you sure you want to delete{" "}
                    <strong>{getDisplayName(selectedItem)}</strong>? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteItem}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default MenuManagements;


