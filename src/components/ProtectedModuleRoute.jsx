import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const ProtectedModuleRoute = ({ children, moduleName, moduleDisplayName }) => {
  const { isAuthenticated, hasModuleAccess, user } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to this module
  if (!hasModuleAccess(moduleName)) {
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
              You don't have permission to access the <strong>{moduleDisplayName || moduleName}</strong> module.
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
            <div className="text-sm text-gray-500">
              Logged in as: <strong>{user?.name || user?.email}</strong>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] hover:from-[#7a2920] hover:to-[#5c1e15] text-white rounded-xl font-medium transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the children
  return <>{children}</>;
};

export default ProtectedModuleRoute;
