// src/components/ProtectedRoute.js
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, AlertCircle } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, hasModuleAccess } = useAuth();
  const location = useLocation();

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin users have access to everything
  if (user.role === 'Admin' || user.role === 'admin' || user.role === 'superadmin' || user.role === 'Main Admin') {
    return children;
  }

  // Map URL paths to module IDs
  const getModuleFromPath = (pathname) => {
    // Remove leading/trailing slashes and split
    const parts = pathname.toLowerCase().split('/').filter(Boolean);
    
    // If it's a restaurant path
    if (parts[0] === 'restaurant') {
      const section = parts[1];
      const subSection = parts[2];
      
      // Sub-module level checks for inventory
      if (section === 'inventory') {
        if (subSection === 'inventory-management') return 'inventory-view';
        if (subSection === 'inventory-distribution') return 'inventory-distribution';
        if (subSection === 'indent') return null; // Indent page handles its own tab visibility
      }

      // Map sections to module IDs
      const moduleMap = {
        'dashboard': 'dashboard',
        'menu': 'menu',
        'billing': 'orders',
        'orders': 'orders',
        'setup': 'tables', // Table setup is under setup
        'kitchen': 'kitchen',
        'inventory': 'inventory',
        'stock': 'inventory',
        'purchase': 'purchase',
        'customers': 'customers',
        'reservations': 'customers',
        'hrms': 'hr',
        'hr': 'hr',
        'payroll': 'payroll',
        'finance': 'finance',
        'reports': 'reports',
      };
      
      return moduleMap[section] || null;
    }
    
    // Common/admin paths - check specific routes
    if (pathname.includes('/admin')) {
      return 'admin'; // Admin module
    }
    
    return null; // Unknown path, allow access
  };

  const requiredModule = getModuleFromPath(location.pathname);

  // If we can't determine the module, allow access (for common routes)
  if (!requiredModule) {
    return children;
  }

  // Check if user has access to the required module
  if (!hasModuleAccess(requiredModule)) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Need Access?
                  </p>
                  <p className="text-sm text-blue-700">
                    Please contact your administrator to request access to this module.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              Logged in as: <strong>{user?.name || user?.email}</strong>
            </div>
            <div className="text-xs text-gray-400 mb-6">
              Required module: <strong>{requiredModule}</strong>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] hover:from-[#7a2920] hover:to-[#5c1e15] text-white rounded-xl font-medium transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the children
  return children;
};

export default ProtectedRoute;
