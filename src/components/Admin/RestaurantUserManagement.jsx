import { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Users,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ChefHat,
  DollarSign,
  ShoppingCart,
  Package,
  UserCog,
  Shield,
} from "lucide-react";

// Restaurant-specific roles with icons
const RESTAURANT_ROLES = [
  { value: "Admin", label: "Admin", icon: Shield, color: "red" },
  { value: "Manager", label: "Manager", icon: UserCog, color: "purple" },
  { value: "Cashier", label: "Cashier", icon: DollarSign, color: "green" },
  { value: "Chef", label: "Chef", icon: ChefHat, color: "orange" },
  { value: "Waiter", label: "Waiter", icon: Users, color: "blue" },
  {
    value: "Store Manager",
    label: "Store Manager",
    icon: Package,
    color: "indigo",
  },
  {
    value: "Purchase Manager",
    label: "Purchase Manager",
    icon: ShoppingCart,
    color: "teal",
  },
];

// Restaurant modules that can be assigned
// IMPORTANT: These IDs must match the menu item IDs in CRMSidebar.jsx
const RESTAURANT_MODULES = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "View restaurant overview and statistics",
  },
  {
    id: "menu",
    name: "Menu Management",
    description: "Manage menu items, categories, and pricing",
  },
  {
    id: "setup",
    name: "Restaurant Setup",
    description: "Configure restaurant profile, tables, and settings",
  },
  {
    id: "purchase",
    name: "Purchase Management",
    description: "Manage supplier orders and purchases",
  },
  {
    id: "inventory",
    name: "Inventory Management",
    description: "Track and manage stock levels",
    subModules: [
      { id: "inventory-view", name: "View Inventory" },
      { id: "inventory-distribution", name: "Inventory Distribution" },
      { id: "indent-management", name: "Indent / Requisition (Raise)" },
      { id: "indent-hod", name: "Indent HOD Approval" },
      { id: "indent-store", name: "Indent Store Issue" },
    ],
  },
  {
    id: "billing",
    name: "Order & Billing",
    description: "Process and manage customer orders and billing",
  },
  {
    id: "customers",
    name: "Customer Management",
    description: "Manage customer data and loyalty",
  },
  {
    id: "kitchen",
    name: "Kitchen Management",
    description: "View and manage kitchen orders",
  },
  {
    id: "finance",
    name: "Finance & Accounts",
    description: "Manage accounts and financial records",
  },
  {
    id: "expense-management",
    name: "Expense Management",
    description: "Track and manage business expenses",
  },
  {
    id: "hrms-admin",
    name: "HRMS Administration",
    description: "Manage employee records, attendance, and payroll",
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    description: "View sales and business reports",
  },
  {
    id: "admin",
    name: "Admin Management",
    description: "Manage users, roles, and system settings",
  },
];

const RestaurantUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserForModules, setSelectedUserForModules] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Waiter",
    crmType: "restaurant",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://crm.jagalikoota.com/api/users");
      // Filter only restaurant users
      const restaurantUsers = response.data.filter(
        (user) => user.crmType === "restaurant"
      );
      setUsers(restaurantUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update user
        const response = await axios.put(
          `https://crm.jagalikoota.com/api/users/${editingUser._id}`,
          formData
        );
        console.log("User updated:", response.data);
        setMessage({ type: "success", text: "User updated successfully!" });
      } else {
        // Create new user
        const response = await axios.post(
          "https://crm.jagalikoota.com/api/users",
          formData
        );
        console.log("User created:", response.data);
        setMessage({ type: "success", text: "User created successfully!" });
      }

      fetchUsers();
      resetForm();
      setShowAddModal(false);

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving user:", error);
      console.error("Error details:", error.response?.data);
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to save user";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      await axios.delete(`https://crm.jagalikoota.com/api/users/${userId}`);
      setMessage({ type: "success", text: "User deleted successfully!" });
      fetchUsers();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage({ type: "error", text: "Failed to delete user" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      crmType: "restaurant",
    });
    setShowAddModal(true);
  };

  const handleManageModules = (user) => {
    setSelectedUserForModules(user);
    setSelectedModules(user.allowedModules || []);
    setShowModuleModal(true);
  };

  const toggleModule = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const saveModuleAccess = async () => {
    if (!selectedUserForModules) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `https://crm.jagalikoota.com/api/users/${selectedUserForModules._id}/modules`,
        {
          allowedModules: selectedModules,
        }
      );

      console.log("Module access updated:", response.data);
      setMessage({
        type: "success",
        text: "Module access updated successfully!",
      });
      fetchUsers();
      setShowModuleModal(false);
      setSelectedUserForModules(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating module access:", error);
      console.error("Error details:", error.response?.data);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update module access";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Waiter",
      crmType: "restaurant",
    });
    setEditingUser(null);
  };

  const getRoleIcon = (roleName) => {
    const role = RESTAURANT_ROLES.find((r) => r.value === roleName);
    return role ? role.icon : Users;
  };

  const getRoleColor = (roleName) => {
    const role = RESTAURANT_ROLES.find((r) => r.value === roleName);
    return role ? role.color : "gray";
  };

  const colorClasses = {
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    blue: "bg-blue-100 text-blue-800",
    indigo: "bg-[#F5F0EF] text-[#5c1e15]",
    teal: "bg-teal-100 text-teal-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Restaurant User Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage restaurant staff and their permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {message.text}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Modules
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">
                        No restaurant users found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Click "Add New User" to create your first restaurant
                        staff member
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    const roleColor = getRoleColor(user.role);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 ${colorClasses[roleColor]} text-xs font-medium rounded-full inline-flex items-center space-x-1`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleManageModules(user)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {user.allowedModules &&
                            user.allowedModules.length > 0
                              ? `${user.allowedModules.length} modules assigned`
                              : "Assign modules"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password{" "}
                    {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    {RESTAURANT_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {loading
                        ? "Saving..."
                        : editingUser
                        ? "Update User"
                        : "Create User"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Module Access Modal */}
        {showModuleModal && selectedUserForModules && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Module Access
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Assign modules for {selectedUserForModules.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setSelectedUserForModules(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {RESTAURANT_MODULES.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedModules.includes(module.id)
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedModules.includes(module.id)}
                            onChange={() => toggleModule(module.id)}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {module.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      {selectedModules.includes(module.id) && (
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Enabled
                        </span>
                      )}
                    </div>
                    {/* Sub-modules */}
                    {module.subModules && selectedModules.includes(module.id) && (
                      <div className="mt-3 ml-7 pl-3 border-l-2 border-orange-200 space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sub-module access:</p>
                        {module.subModules.map((sub) => (
                          <label
                            key={sub.id}
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedModules.includes(sub.id)}
                              onChange={() => toggleModule(sub.id)}
                              className="w-3.5 h-3.5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setSelectedUserForModules(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveModuleAccess}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantUserManagement;
