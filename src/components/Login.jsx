// src/components/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "https://crm.jagalikoota.com";
      const response = await fetch(`${baseUrl}/authUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
          type: "restaurant",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          name:
            data.user?.name ||
            data.user?.username ||
            "Restaurant Admin",
          email: credentials.email,
          role: data.user?.role || "admin",
          crmType: "restaurant",
          allowedModules: data.user?.allowedModules || [],
          permissions: data.user?.permissions || {},
        };

        if (data.user?.permissions) {
          localStorage.setItem(
            "userPermissions",
            JSON.stringify(data.user.permissions)
          );
        }

        login(userData, data.token, "restaurant");
        const dashboardPath = getDashboardPath(userData);
        navigate(dashboardPath);
      } else if (response.status === 503) {
        setError(
          "Server ka database abhi connect ho raha hai. Thodi der baad dobara try karein."
        );
      } else if (response.status === 401) {
        setError(data.message || "Invalid email or password.");
      } else if (response.status === 400) {
        setError(data.message || "Please fill all required fields.");
      } else {
        const errorMessage =
          data.message ||
          `Login failed (Status: ${response.status}). Please check your credentials and try again.`;
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network error:", err);
      if (err.message === "Failed to fetch") {
        setError(
          "Backend server se connect nahi ho pa raha. Ensure karo ki server port 3000 pe chal raha hai."
        );
      } else {
        setError(
          `Network error: ${err.message}. Please check your connection.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (userData) => {
    if (
      userData.role === "Admin" ||
      userData.role === "admin" ||
      userData.role === "superadmin" ||
      userData.role === "Main Admin"
    ) {
      return "/restaurant/dashboard";
    }

    if (userData.allowedModules && userData.allowedModules.length > 0) {
      const firstModule = userData.allowedModules[0];
      const modulePaths = {
        dashboard: "/restaurant/dashboard",
        menu: "/restaurant/menu",
        orders: "/restaurant/billing",
        tables: "/restaurant/setup/Table-Setup",
        kitchen: "/restaurant/kitchen",
        inventory: "/restaurant/inventory/inventory-management",
        purchase: "/restaurant/purchase",
        customers: "/restaurant/customers",
        reports: "/restaurant/reports/sales",
        hr: "/restaurant/HRMS",
        payroll: "/restaurant/payroll",
        finance: "/restaurant/finance",
        settings: "/restaurant/setup/config",
        // Sub-module paths
        "inventory-view": "/restaurant/inventory/inventory-management",
        "inventory-distribution": "/restaurant/inventory/inventory-distribution",
        "indent-management": "/restaurant/inventory/indent",
        "indent-hod": "/restaurant/inventory/indent",
        "indent-store": "/restaurant/inventory/indent",
      };

      // Try to find the first module that has a path
      for (const mod of userData.allowedModules) {
        if (modulePaths[mod]) {
          return modulePaths[mod];
        }
      }

      return modulePaths[firstModule] || "/restaurant/inventory/indent";
    }

    return "/restaurant/inventory/indent";
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const isFormValid = credentials.email && credentials.password;

  return (
    /* Page background: #FCFCFC */
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#FCFCFC" }}>
      <div className="max-w-md w-full space-y-6">

        {/* Card: pure white */}
        <div className="p-10 rounded-2xl shadow-xl border border-[#D1C9BC]/40" style={{ backgroundColor: "#FFFFFF" }}>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <img
              src="/logo4.jpeg"
              alt="Jagali Koota"
              className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg"
            />
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Jagali Koota</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#69231B] transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D1C9BC] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                    style={{ backgroundColor: "#FFFFFF" }}
                    onFocus={e => {
                      e.target.style.borderColor = "#69231B";
                      e.target.style.boxShadow = "0 0 0 3px rgba(180,145,141,0.15)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "#D1C9BC";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#69231B] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#D1C9BC] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                    style={{ backgroundColor: "#FFFFFF" }}
                    onFocus={e => {
                      e.target.style.borderColor = "#69231B";
                      e.target.style.boxShadow = "0 0 0 3px rgba(180,145,141,0.15)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "#D1C9BC";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#69231B] transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-[#69231B] transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button: #69231B bg, white text */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="group relative w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#69231B", color: "#FFFFFF" }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#7a2920"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#69231B"; }}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" style={{ color: "#FFFFFF" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
