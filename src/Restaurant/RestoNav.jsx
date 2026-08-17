import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Settings, Utensils, Building } from "lucide-react";

const RestoNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/restaurant/dashboard", label: "Dashboard", icon: Home },
    { path: "/restaurant/menu", label: "Menu", icon: Utensils },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full pl-4 md:pl-6 pr-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img 
              src="/logo4.jpeg" 
              alt="Jagali Koota Logo" 
              className="h-10 w-10 rounded-xl object-cover shadow-md"
            />
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#69231B" }}>Jagali Koota</h1>
              <span className="text-xs text-gray-500 font-medium">Restaurant CRM</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-rose-100 text-rose-700"
                      : "text-gray-600 hover:bg-rose-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RestoNav;

