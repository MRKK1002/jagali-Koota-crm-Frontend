import React, { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Users, Check, X, Save, AlertCircle } from "lucide-react";

const AVAILABLE_MODULES = [
  {
    id: "restaurant",
    name: "Restaurant Management",
    description: "Access to restaurant operations, menu, orders, inventory",
  },
  {
    id: "restaurant",
    name: "Construction Management",
    description: "Access to construction projects, materials, workers",
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    description: "Access to business reports and analytics",
  },
  {
    id: "hr",
    name: "HR Management",
    description: "Access to employee management and payroll",
  },
];

const ModuleAccessManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModules, setUserModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://crm.jagalikoota.com/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserModules(user.allowedModules || []);
    setMessage({ type: "", text: "" });
  };

  const toggleModule = (moduleId) => {
    setUserModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const saveModuleAccess = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await axios.put(
        `https://crm.jagalikoota.com/api/users/${selectedUser._id}/modules`,
        {
          allowedModules: userModules,
        }
      );

      setMessage({
        type: "success",
        text: "Module access updated successfully!",
      });

      // Update local user list
      setUsers(
        users.map((u) =>
          u._id === selectedUser._id ? { ...u, allowedModules: userModules } : u
        )
      );

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating module access:", error);
      setMessage({ type: "error", text: "Failed to update module access" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-[#69231B] to-[#7a2920] rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Module Access Management
              </h1>
              <p className="text-gray-600 mt-1">
                Control which modules users can access
              </p>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Users</h2>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading && users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Loading users...
                  </p>
                ) : users.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No users found
                  </p>
                ) : (
                  users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        selectedUser?._id === user._id
                          ? "bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="font-semibold">
                        {user.name || user.username}
                      </div>
                      <div
                        className={`text-sm ${
                          selectedUser?._id === user._id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {user.email}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          selectedUser?._id === user._id
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        Role: {user.role || "User"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Module Access Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {selectedUser ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Module Access for{" "}
                      {selectedUser.name || selectedUser.username}
                    </h2>
                    <p className="text-gray-600">
                      Select which modules this user can access
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    {AVAILABLE_MODULES.map((module) => (
                      <div
                        key={module.id}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          userModules.includes(module.id)
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {module.name}
                              </h3>
                              {userModules.includes(module.id) && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Enabled
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {module.description}
                            </p>
                          </div>
                          <div
                            className={`ml-4 p-2 rounded-lg ${
                              userModules.includes(module.id)
                                ? "bg-green-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {userModules.includes(module.id) ? (
                              <Check className="w-6 h-6 text-green-600" />
                            ) : (
                              <X className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setUserModules([]);
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveModuleAccess}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] hover:from-[#7a2920] hover:to-[#5c1e15] text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{loading ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    Select a user to manage their module access
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleAccessManagement;
