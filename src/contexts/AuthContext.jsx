// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [crmType, setCrmType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedCrmType = localStorage.getItem("crmType");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setCrmType(storedCrmType);
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("crmType");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken, type) => {
    try {
      setToken(authToken);
      setUser(userData);
      setCrmType(type);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("crmType", type);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      setToken(null);
      setUser(null);
      setCrmType(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("crmType");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Check if user has access to a specific module
  const hasModuleAccess = (moduleName) => {
    if (!user) return false;
    
    // Admin has access to all modules
    if (user.role === 'admin' || user.role === 'superadmin') return true;
    
    // Check if user has the module in their allowedModules array
    if (user.allowedModules && Array.isArray(user.allowedModules)) {
      return user.allowedModules.includes(moduleName);
    }
    
    return false;
  };

  const value = {
    user,
    token,
    crmType,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    hasModuleAccess, // New function for module access
    hasPermission: (permission) => {
      if (!user || !user.role) return false;
      // Add your permission logic here based on user role
      return true;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}