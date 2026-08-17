import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Search, Filter, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchDualBackend } from "../../utils/apiHelpers";

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
  ? `${API_BASE_URL}/hotel`
  : `${API_BASE_URL}/api/v1/hotel`;

// Helper function to get image URL
const getImageUrl = (imagePath, bustCache = false) => {
  if (!imagePath) return null;

  // Already a full URL (Cloudinary, http, https)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return bustCache ? `${imagePath}?t=${Date.now()}` : imagePath;
  }

  // Normalize backslashes (Windows paths) → forward slashes
  let cleanPath = imagePath.replace(/\\/g, '/').trim();

  // Strip leading slashes so we can prepend base cleanly
  cleanPath = cleanPath.replace(/^\/+/, '');

  // If path doesn't start with "uploads/", it might be just a filename — put it under uploads/
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1.*$/, '')
    : 'https://crm.jagalikoota.com';

  const url = `${baseUrl}/${cleanPath}`;
  return bustCache ? `${url}?t=${Date.now()}` : url;
};

// Small reusable image cell — shows fallback on load error
const CAT_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#f3f4f6"/><rect x="10" y="14" width="28" height="20" rx="3" fill="#e5e7eb"/><circle cx="18" cy="20" r="4" fill="#d1d5db"/><path d="M10 30l8-8 6 6 4-4 10 10H10z" fill="#d1d5db"/></svg>`)}`;

const CategoryImage = ({ src, alt }) => {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
        <img src={CAT_PLACEHOLDER} alt="No image" className="w-8 h-8 opacity-50" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
      onError={() => setFailed(true)}
    />
  );
};

// Category Modal Component
const CategoryModal = ({ category, onClose, onSave, branches, selectedBranch }) => {
  const categoryBranchId = category?.branchId || category?.branch?.id || selectedBranch || (branches.length > 0 ? branches[0]._id : "");
  
  const [formData, setFormData] = useState({
    name: category?.name || "",
    branchId: categoryBranchId,
    image: category?.image || "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category?.image) {
      const imageUrl = getImageUrl(category.image);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        className="relative mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-2xl rounded-2xl bg-white overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              required
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            {imagePreview && (
              <div className="mb-3">
                <CategoryImage src={imagePreview} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FCFCFC] file:text-[#69231B] hover:file:bg-[#F5F0EF]"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#69231B] text-white rounded-lg hover:bg-[#7a2920]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (category ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
// Delete Confirmation Modal
const DeleteConfirmationModal = ({ category, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await onDelete(category._id);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
        className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Delete Category</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <p className="text-gray-600 mb-2">
          Are you sure you want to delete <strong>{category.name}</strong>?
        </p>
        <p className="text-red-600 text-sm mb-6">This action cannot be undone.</p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
// Subcategory Modal Component
const SubcategoryModal = ({ subcategory, onClose, onSave, categories, branches }) => {
  const [formData, setFormData] = useState({
    name: subcategory?.name || "",
    categoryId: subcategory?.categoryId?._id || subcategory?.categoryId || "",
    branchId: subcategory?.branchId?._id || subcategory?.branchId || "",
    description: subcategory?.description || "",
  });
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.branchId) {
      const filtered = categories.filter((cat) => {
        const catBranchId = cat.branchId || cat.branch?.id;
        return catBranchId === formData.branchId;
      });
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [formData.branchId, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setError(error.message || "Failed to save subcategory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        className="relative mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-2xl rounded-2xl bg-white overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {subcategory ? "Edit Subcategory" : "Add New Subcategory"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              required
              placeholder="Enter subcategory name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch *
            </label>
            <select
              name="branchId"
              value={formData.branchId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              required
            >
              <option value="">Select Category</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
              rows="3"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#69231B] text-white rounded-lg hover:bg-[#7a2920]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (subcategory ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
// Main CategoryManagement Component
const CategoryManagement = () => {
  // Category states
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Subcategory states
  const [subcategories, setSubcategories] = useState([]);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [showSubcategoryDeleteModal, setShowSubcategoryDeleteModal] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [subcategorySearchQuery, setSubcategorySearchQuery] = useState("");

  useEffect(() => {
    fetchBranches();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [selectedBranch]);

  useEffect(() => {
    filterCategories();
  }, [categories, selectedBranch, searchQuery]);
  
  useEffect(() => {
    filterSubcategories();
  }, [subcategories, selectedCategoryForSubcategory, subcategorySearchQuery]);

  const fetchBranches = async () => {
    try {
      // Fetch restaurants from Restaurant Profile
      const restaurantUrl = `${HOTEL_API_BASE}/getAllRestaurants?all=true`;
      const restaurantResponse = await fetch(restaurantUrl);
      let restaurantsData = [];
      
      if (restaurantResponse.ok) {
        const data = await restaurantResponse.json();
        if (data.success && data.data) {
          restaurantsData = Array.isArray(data.data) ? data.data : [];
        }
      }

      // Convert restaurants to branch format
      const restaurantProfileBranches = restaurantsData.map((restaurant) => {
        const addressParts = [];
        if (restaurant.address?.street) addressParts.push(restaurant.address.street);
        if (restaurant.address?.city) addressParts.push(restaurant.address.city);
        if (restaurant.address?.state) addressParts.push(restaurant.address.state);
        if (restaurant.address?.country) addressParts.push(restaurant.address.country);
        const fullAddress = addressParts.join(", ");

        const branchName = restaurant.branchName || restaurant.restaurantName || "Unnamed Branch";

        return {
          _id: restaurant._id,
          name: branchName,
          address: fullAddress || (typeof restaurant.address === "string" ? restaurant.address : "") || "",
          image: restaurant.image || null,
          source: "restaurant",
        };
      });

      setBranches(restaurantProfileBranches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to load branches. Please refresh the page and try again.");
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = selectedBranch ? `/hotel/category?branchId=${selectedBranch}` : "/hotel/category";
      const shouldMerge = !selectedBranch;
      const data = await fetchDualBackend(endpoint, {}, shouldMerge);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await fetchDualBackend("/hotel/subcategory", {}, true);
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      // Subcategory endpoint may not exist — silently ignore, not critical
      console.warn("Subcategories not available:", error.message);
      setSubcategories([]);
    }
  };

  const filterCategories = () => {
    let filtered = categories;
    if (selectedBranch) {
      filtered = filtered.filter((category) => {
        const categoryBranchId = category.branchId || category.branch?.id;
        return categoryBranchId === selectedBranch;
      });
    }
    if (searchQuery) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  };

  const filterSubcategories = () => {
    let filtered = subcategories;
    if (selectedCategoryForSubcategory) {
      filtered = filtered.filter((subcat) => {
        const subcatCategoryId = subcat.categoryId?._id || subcat.categoryId;
        return subcatCategoryId === selectedCategoryForSubcategory;
      });
    }
    if (subcategorySearchQuery) {
      filtered = filtered.filter((subcat) =>
        subcat.name.toLowerCase().includes(subcategorySearchQuery.toLowerCase())
      );
    }
    setFilteredSubcategories(filtered);
  };
  const handleAddClick = () => {
    setCurrentCategory(null);
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleSaveCategory = async (formData) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("branchId", formData.branchId);
      
      const branch = branches.find((b) => b._id === formData.branchId);
      if (branch) {
        formDataObj.append("branchName", branch.name);
        formDataObj.append("branchAddress", branch.address || "");
      }

      if (formData.image && formData.image.startsWith("data:image")) {
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], "category-image.jpg", { type: blob.type });
        formDataObj.append("image", file);
      } else if (formData.image && !formData.image.startsWith("http")) {
        formDataObj.append("image", formData.image);
      }

      let responseData;
      if (currentCategory) {
        responseData = await fetchDualBackend(`/hotel/category/${currentCategory._id}`, {
          method: "PUT",
          body: formDataObj,
        });
        setCategories(prevCategories => 
          prevCategories.map((cat) => 
            cat._id === currentCategory._id ? { ...responseData, _imageTimestamp: Date.now() } : cat
          )
        );
        setSuccessMessage(`Category "${responseData.name}" updated successfully`);
      } else {
        responseData = await fetchDualBackend("/hotel/category", {
          method: "POST",
          body: formDataObj,
        });
        setCategories(prevCategories => [...prevCategories, responseData]);
        setSuccessMessage(`Category "${responseData.name}" created successfully`);
      }
      
      fetchCategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving category:", error);
      throw new Error(error.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await fetchDualBackend(`/hotel/category/${categoryId}`, {
        method: "DELETE",
      });
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      setSuccessMessage("Category deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw new Error(error.message || "Failed to delete category");
    }
  };

  // Subcategory handlers
  const handleAddSubcategoryClick = () => {
    setCurrentSubcategory(null);
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategoryClick = (subcategory) => {
    setCurrentSubcategory(subcategory);
    setShowSubcategoryModal(true);
  };

  const handleDeleteSubcategoryClick = (subcategory) => {
    setSubcategoryToDelete(subcategory);
    setShowSubcategoryDeleteModal(true);
  };

  const handleSaveSubcategory = async (formData) => {
    try {
      let responseData;
      if (currentSubcategory) {
        responseData = await fetchDualBackend(`/hotel/subcategory/${currentSubcategory._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        setSubcategories(subcategories.map((subcat) => 
          subcat._id === currentSubcategory._id ? responseData : subcat
        ));
        setSuccessMessage("Subcategory updated successfully");
      } else {
        responseData = await fetchDualBackend("/hotel/subcategory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        setSubcategories([...subcategories, responseData]);
        setSuccessMessage("Subcategory created successfully");
      }
      fetchSubcategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving subcategory:", error);
      throw new Error(error.message || "Failed to save subcategory");
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      await fetchDualBackend(`/hotel/subcategory/${subcategoryId}`, {
        method: "DELETE",
      });
      setSubcategories(subcategories.filter((subcat) => subcat._id !== subcategoryId));
      setSuccessMessage("Subcategory deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw new Error(error.message || "Failed to delete subcategory");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#69231B] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md mx-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" />
            <div>
              <strong className="font-bold text-lg">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <Check size={16} />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="ml-auto">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <button
              onClick={handleAddClick}
              className="mt-4 md:mt-0 bg-[#69231B] text-white px-4 py-2 rounded-lg hover:bg-[#7a2920] flex items-center gap-2"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" />
              <span className="text-sm text-gray-600">Branch:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#69231B] focus:border-[#69231B]"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Branch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <CategoryImage src={getImageUrl(category.image)} alt={category.name} />
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {category.branch?.name || branches.find(b => b._id === category.branchId)?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="text-[#69231B] hover:text-[#5c1e15] p-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        {/* Subcategories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
            <button
              onClick={handleAddSubcategoryClick}
              className="mt-4 md:mt-0 bg-[#69231B] text-white px-4 py-2 rounded-lg hover:bg-[#5c1e15] flex items-center gap-2"
            >
              <Plus size={16} />
              Add Subcategory
            </button>
          </div>

          {/* Subcategory Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={subcategorySearchQuery}
                  onChange={(e) => setSubcategorySearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" />
              <span className="text-sm text-gray-600">Category:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={selectedCategoryForSubcategory}
                onChange={(e) => setSelectedCategoryForSubcategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategories Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Branch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcategory) => (
                    <tr key={subcategory._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{subcategory.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {subcategory.categoryId?.name || 
                         categories.find(c => c._id === subcategory.categoryId)?.name || 
                         "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {branches.find(b => b._id === subcategory.branchId)?.name || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {subcategory.description || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSubcategoryClick(subcategory)}
                            className="text-purple-600 hover:text-purple-800 p-1"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategoryClick(subcategory)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No subcategories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <CategoryModal
            category={currentCategory}
            onClose={() => setShowModal(false)}
            onSave={handleSaveCategory}
            branches={branches}
            selectedBranch={selectedBranch}
          />
        )}
        
        {showDeleteModal && (
          <DeleteConfirmationModal
            category={categoryToDelete}
            onClose={() => setShowDeleteModal(false)}
            onDelete={handleDeleteCategory}
          />
        )}
        
        {showSubcategoryModal && (
          <SubcategoryModal
            subcategory={currentSubcategory}
            onClose={() => setShowSubcategoryModal(false)}
            onSave={handleSaveSubcategory}
            categories={categories}
            branches={branches}
          />
        )}
        
        {showSubcategoryDeleteModal && (
          <DeleteConfirmationModal
            category={subcategoryToDelete}
            onClose={() => setShowSubcategoryDeleteModal(false)}
            onDelete={handleDeleteSubcategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManagement;