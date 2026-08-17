// src/components/CRMSidebar.js
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Settings,
  Utensils,
  ShoppingCart,
  FileText,
  Users,
  ChefHat,
  CreditCard,
  BarChart3,
  Warehouse,
  Wallet,
  UserCog,
  ClipboardList,
  MapPinCheck,
  ReceiptIndianRupee,
  ChartBar,
  TrendingUp,
  PanelsTopLeft,
  Building,
  ClipboardCheck,
  Calculator,
  PieChart,
  Truck,
  Package,
  CreditCard as CardIcon,
  Calendar,
  BookOpen,
  ShieldCheck,
  Bell,
  List,
  MapPin,
  Coffee,
  Receipt,
  UserCheck,
  CookingPot,
  UserPlus,
  Clock,
  ChevronRight,
  LogOut,
  ChevronDown,
  Shield,
  // Construction Icons
  User as UserIcon,
  LockKeyhole,
  FileSpreadsheet,
  CalendarDays,
  Download,
  Users as Users2,
  Banknote,
  DollarSign,
  Camera,
  Bed,
} from "lucide-react";

// Import all your components
import RestaurantDashboard from "./RestaurantDashboard";
import RestaurantSetup from "./RestaurantSetup";
import MenuManagement from "./MenuManagement";
import StockManagement from "./StockManagement";
import PurchaseManagement from "./PurchaseManagement";
import OrderBilling from "./OrderBilling";
import CustomerManagement from "./CustomerManagement";
import ReservationsManagement from "./ReservationsManagement";
import KitchenManagement from "./KitchenManagement";
import HRManagement from "./HRManagement";
import ExpenseManagement from "./ExpenseManagement";
import FinanceAccounts from "./FinanceAccounts";
import SubAdmin from "./SubAdmin";
import ReportsAnalytics from "./ReportsAnalytics";
import InventoryManagement from "./InventoryManagement";

const CRMSidebar = () => {
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState({});
  const [activeSubRoute, setActiveSubRoute] = useState(null);

  const navigate = useNavigate();
  const { logout, user, crmType, hasModuleAccess } = useAuth();
  
  console.log('CRMSidebar loaded - Admin Dashboard REMOVED - Version 2');

  // Restaurant Menu Items
  const restaurantMenuItems = [
    {
      id: "dashboard",
      name: "Restaurant Dashboard",
      icon: Home,
      path: "/restaurant/dashboard",
      component: RestaurantDashboard,
      color: "text-[#69231B]",
    },
    {
      id: "menu",
      name: "Menu Management",
      icon: BookOpen,
      path: "/restaurant/menu",
      component: MenuManagement,
      hasSubmenu: true,
      color: "text-orange-600",
      subItems: [
        {
          id: "menu-category",
          name: "Category",
          path: "/restaurant/menu/category",
          icon: List,
        },
        {
          id: "menu-menu",
          name: "Menu",
          path: "/restaurant/menu/menu",
          icon: Utensils,
        },
        {
          id: "recipe-master",
          name: "Recipe Management",
          path: "/restaurant/menu/recipe-master",
          icon: CookingPot,
        },
        // {
        //   id: "menu-rooms",
        //   name: "Rooms",
        //   path: "/restaurant/menu/rooms",
        //   icon: Bed,
        // },
        // {
        //   id: "menu-recipe-requirement",
        //   name: "Recipe Requirement",
        //   path: "/restaurant/menu/recipe-requirement",
        //   icon: Calculator,
        // },
      ],
    },
    // {
    //   id: "setup",
    //   name: "Restaurant Setup",
    //   icon: Building,
    //   path: "/restaurant/setup",
    //   component: RestaurantSetup,
    //   hasSubmenu: true,
    //   color: "text-emerald-600",
    //   subItems: [
    //     {
    //       id: "restaurant-profile",
    //       name: "Restaurant Profile",
    //       path: "/restaurant/setup/restaurant-profile",
    //       icon: Building,
    //     },
    //     {
    //       id: "setup-overview",
    //       name: "Table-Setup",
    //       path: "/restaurant/setup/Table-Setup",
    //       icon: ClipboardCheck,
    //     },
    //   ],
    // },
    {
      id: "purchase",
      name: "Purchase Management",
      icon: ShoppingCart,
      path: "/restaurant/purchase",
      component: PurchaseManagement,
      hasSubmenu: true,
      color: "text-[#D1C9BC]",
      subItems: [
           {
          id: "purchase-overview",
          name: "Supplier",
          path: "/restaurant/purchase/res-supplier",
          icon: Truck,
        },
     
        {
          id: "purchase-orders",
          name: "Purchase Orders",
          path: "/restaurant/purchase/purchase-orders",
          icon: ClipboardList,
        },
        {
          id: "purchase-vendors-payments-tracking",
          name: "Vendors & Payments Tracking",
          path: "/restaurant/purchase/purchase-vendors",
          icon: ShieldCheck,
        },
        {
          id: "purchase-reports",
          name: "GRN",
          path: "/restaurant/purchase/GRN",
          icon: ClipboardCheck,
        },
        {
          id: "purchase-store-location",
          name: "Store Location",
          path: "/restaurant/purchase/store-location",
          icon: MapPin,
        },
        {
          id: "purchase-raw-material",
          name: "Raw Material",
          path: "/restaurant/purchase/raw-material",
          icon: Package,
        },
      ],
    },
    {
      id: "inventory",
      name: "Inventory Management",
      path: "/restaurant/inventory",
      component: InventoryManagement,
      icon: Warehouse,
      hasSubmenu: true,
      color: "text-[#69231B]",
      subItems: [
        {
          id: "inventory",
          name: "Inventory",
          path: "/restaurant/inventory/inventory-management",
          icon: Package,
          roles: ["Admin", "admin", "superadmin", "Main Admin", "Manager", "Store Manager"],
        },
        {
          id: "inventory-distribution",
          name: "Inventory Distribution",
          path: "/restaurant/inventory/inventory-distribution",
          icon: Package,
          roles: ["Admin", "admin", "superadmin", "Main Admin", "Manager", "Store Manager"],
        },
        {
          id: "indent-management",
          name: "Indent / Requisition",
          path: "/restaurant/inventory/indent",
          icon: ClipboardList,
        },
        {
          id: "department-stock",
          name: "Department Stock",
          path: "/restaurant/inventory/department-stock",
          icon: Package,
          roles: ["Admin", "admin", "superadmin", "Main Admin", "Manager", "Store Manager", "Head Chef"],
        },
      ],
    },
    // {
    //   id: "billing",
    //   name: "Order & Billing",
    //   icon: FileText,
    //   path: "/restaurant/billing",
    //   component: OrderBilling,
    //   hasSubmenu: true,
    //   color: "text-rose-600",
    //   subItems: [
    //     {
    //       id: "Restaurant-Orders",
    //       name: "Restaurant",
    //       path: "/restaurant/billing/restaurant-orders",
    //       icon: Utensils,
    //     },
    //     {
    //       id: "Self-Service-Orders",
    //       name: "Self Service",
    //       path: "/restaurant/billing/self-service-orders",
    //       icon: ShoppingCart,
    //     },
    //     {
    //       id: "Temple-Meals-Orders",
    //       name: "Temple Meals",
    //       path: "/restaurant/billing/temple-meals-orders",
    //       icon: Coffee,
    //     },
    //     {
    //       id: "Online-Payments",
    //       name: "Online Payments",
    //       path: "/restaurant/billing/online-payments",
    //       icon: CreditCard,
    //     },
    //     {
    //       id: "Darshini-Payment",
    //       name: "Darshini Payment",
    //       path: "/restaurant/billing/darshini-payment",
    //       icon: Wallet,
    //     },
    //     {
    //       id: "Restaurant-Payment",
    //       name: "Restaurant Payment",
    //       path: "/restaurant/billing/restaurant-payment",
    //       icon: Receipt,
    //     },
    //   ],
    // },
    // {
    //   id: "customers",
    //   name: "Customer Management",
    //   icon: Users,
    //   path: "/restaurant/customers",
    //   component: CustomerManagement,
    //   hasSubmenu: true,
    //   color: "text-cyan-600",
    //   subItems: [
    //     {
    //       id: "customer-Management",
    //       name: "Customer Management",
    //       path: "/restaurant/customers/customer-mangement",
    //       icon: UserCheck,
    //     },
    //   ],
    // },
    // {
    //   id: "kitchen",
    //   name: "Kitchen Management",
    //   icon: ChefHat,
    //   path: "/restaurant/kitchen",
    //   component: KitchenManagement,
    //   hasSubmenu: true,
    //   color: "text-amber-600",
    //   subItems: [
    //     {
    //       id: "kitchen-overview",
    //       name: "kitchen",
    //       path: "/restaurant/kitchen/manage",
    //       icon: CookingPot,
    //     },
    //   ],
    // },
    // {
    //   id: "finance",
    //   name: "Finance & Accounts",
    //   icon: CreditCard,
    //   path: "/restaurant/finance",
    //   component: FinanceAccounts,
    //   hasSubmenu: true,
    //   color: "text-[#69231B]",
    //   subItems: [
    //     {
    //       id: "finance-overview",
    //       name: "SupplierLedger",
    //       path: "/restaurant/finance/supplierledger",
    //       icon: BookOpen,
    //     },
    //   ],
    // },
    {
      id: "expense-management",
      name: "Expense Management",
      path: "/restaurant/expenses",
      component: ExpenseManagement,
      icon: Wallet,
      hasSubmenu: true,
      color: "text-[#69231B]",
      subItems: [
        {
          id: "expense-head-master",
          name: "Expense Head Master",
          path: "/restaurant/expenses/expense-head-master",
          icon: List,
        },
      ],
    },
    {
      id: "hrms-admin",
      name: "HRMS Administration",
      path: "/restaurant/HRMS",
      component: HRManagement,
      icon: UserCog,
      hasSubmenu: true,
      color: "text-[#69231B]",
      subItems: [
        {
          id: "Employee Registration",
          name: "Employee Registration",
          path: "/restaurant/HRMS/employee-registration",
          icon: UserPlus,
        },
        {
          id: "attendance-master",
          name: "Attendance Master",
          path: "/restaurant/HRMS/attendance-master",
          icon: Clock,
        },
        // {
        //   id: "attendance",
        //   name: "Attendance Records",
        //   path: "/restaurant/HRMS/attendance",
        //   icon: Calendar,
        // },
        // {
        //   id: "generate-salary-slip",
        //   name: "Generate Salary Slip",
        //   path: "/restaurant/HRMS/generate-salary-slip",
        //   icon: ReceiptIndianRupee,
        // },
        // {
        //   id: "shift-management",
        //   name: "Shift Management",
        //   path: "/restaurant/HRMS/shift-management",
        //   icon: Settings,
        // },
      ],
    },
    // {
    //   id: "reports",
    //   name: "Reports & Analytics",
    //   icon: BarChart3,
    //   path: "/restaurant/reports",
    //   component: ReportsAnalytics,
    //   hasSubmenu: true,
    //   color: "text-pink-600",
    //   subItems: [
    //     {
    //       id: "reports-overview",
    //       name: "Sales Report",
    //       path: "/restaurant/reports/salesreport",
    //       icon: ChartBar,
    //     },
    //     {
    //       id: "reports-settings",
    //       name: "Item Sales Report",
    //       path: "/restaurant/reports/itemsalesreport",
    //       icon: PieChart,
    //     },
    //     {
    //       id: "reports-reports",
    //       name: "Purchase vs Sales vs Expenses",
    //       path: "/restaurant/reports/purchasesalesreport",
    //       icon: TrendingUp,
    //     },
    //   ],
    // },
    {
      id: "admin",
      name: "Admin Management",
      icon: UserCog,
      path: "/common/admin",
      color: "text-[#69231B]",
      hasSubmenu: true,
      subItems: [
        // {
        //   id: "admin-dashboard",
        //   name: "Admin Dashboard",
        //   path: "/common/admin",
        //   icon: UserCog,
        // },
        // {
        //   id: "user-management",
        //   name: "User Management",
        //   path: "/admin/users",
        //   icon: Users,
        // },
        {
          id: "restaurant-users",
          name: "Restaurant Users",
          path: "/admin/restaurant-users",
          icon: ChefHat,
        },
        // {
        //   id: "module-access",
        //   name: "Module Access Control",
        //   path: "/admin/module-access",
        //   icon: Shield,
        // },
      ],
    },
  ];

  // Get menu items based on CRM type
  const getMenuItems = () => {
    switch (crmType) {
      case "restaurant":
        return restaurantMenuItems;
      case "common":
        return commonMenuItems;
      default:
        return restaurantMenuItems;
    }
  };

  const menuItems = getMenuItems();

  // Filter menu items based on user permissions
  const filterMenuItemsByPermissions = (items) => {
    if (!user) return items;
    
    // If user is admin or has admin role, show all items
    if (user.role === 'Admin' || user.role === 'admin' || user.role === 'superadmin' || user.role === 'Main Admin') {
      return items;
    }

    // If user has no allowedModules, show nothing
    if (!user.allowedModules || user.allowedModules.length === 0) {
      return [];
    }

    // Filter items based on allowedModules
    return items.filter(item => {
      // Check if user has access to this module
      const hasAccess = hasModuleAccess(item.id);
      
      // If parent has access, show it with ALL its subitems
      // This allows users to access all submenu items when they have the parent module
      if (hasAccess) {
        return true; // Keep the item with all its subitems
      }
      
      // If parent doesn't have access but has subitems, check if any subitem is accessible
      if (item.subItems && item.subItems.length > 0) {
        // Filter subitems to only show those the user has access to
        const filteredSubItems = item.subItems.filter(subItem => hasModuleAccess(subItem.id));
        
        // If there are accessible subitems, show the parent with only those subitems
        if (filteredSubItems.length > 0) {
          item.subItems = filteredSubItems;
          return true;
        }
        return false;
      }

      // For items without subitems and no access, don't show
      return false;
    });
  };

  const filteredMenuItems = filterMenuItemsByPermissions(menuItems);

  const toggleSubmenu = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleMenuClick = (item) => {
    setActiveRoute(item.id);
    if (item.hasSubmenu) {
      toggleSubmenu(item.id);
      // If user doesn't have access to the parent path directly, navigate to first allowed subitem
      if (item.subItems && item.subItems.length > 0) {
        const visibleSubItems = item.subItems.filter((subItem) => {
          if (subItem.roles && subItem.roles.length > 0) {
            if (!subItem.roles.includes(user?.role)) return false;
          }
          if (user?.allowedModules && Array.isArray(user.allowedModules)) {
            if (user.role === 'Admin' || user.role === 'admin' || user.role === 'superadmin' || user.role === 'Main Admin') return true;
            if (subItem.id && user.allowedModules.includes(subItem.id)) return true;
            if (!subItem.roles) return true;
          }
          if (!subItem.roles) return true;
          return false;
        });
        if (visibleSubItems.length > 0) {
          navigate(visibleSubItems[0].path);
          setActiveSubRoute(visibleSubItems[0].id);
        }
      }
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (subItem) => {
    setActiveSubRoute(subItem.id);
    if (subItem.path) {
      navigate(subItem.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Recursive function to render nested submenus
  const renderMenuItem = (item, level = 0) => {
    const Icon = item.icon;
    const isActive = activeRoute === item.id;
    const isExpanded = expandedItems[item.id];
    const hasNestedSubmenu =
      item.subItems && item.subItems.some((subItem) => subItem.hasSubmenu);

    return (
      <div key={item.id} className="group">
        <button
          onClick={() => handleMenuClick(item)}
          className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
            isActive
              ? "border-l-4 shadow-sm"
              : ""
          } ${level > 0 ? `pl-${4 + level * 2}` : ""}`}
          style={isActive
            ? { backgroundColor: "rgba(105,35,27,0.12)", borderLeftColor: "#69231B" }
            : { backgroundColor: "transparent" }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(105,35,27,0.08)"; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-white shadow-sm"
                : "group-hover:bg-white group-hover:shadow-sm"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-colors duration-200`}
                style={{ color: "#69231B" }}
            />
          </div>
          <div className="ml-3 flex-1">
            <span
              className={`font-medium transition-colors duration-200`}
                style={{ color: "#69231B", fontWeight: isActive ? "600" : "500" }}
            >
              {item.name}
            </span>
          </div>
          {(item.hasSubmenu || hasNestedSubmenu) && (
            <div className="ml-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ color: "#69231B" }} />
              ) : (
                <ChevronRight className="w-4 h-4 transition-transform duration-200" style={{ color: "#69231B" }} />
              )}
            </div>
          )}
        </button>

        {item.hasSubmenu && isExpanded && item.subItems && (
          <div
            className={`mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200 ${
              level > 0 ? "border-l border-slate-200 ml-6" : "pl-6"
            }`}
          >
            {item.subItems
              .filter((subItem) => {
                // If subItem has a roles array, check if user's role is in it
                if (subItem.roles && subItem.roles.length > 0) {
                  if (!subItem.roles.includes(user?.role)) return false;
                }
                // Check if user has specific sub-module access via allowedModules
                if (user?.allowedModules && Array.isArray(user.allowedModules)) {
                  // Admin/superadmin always see everything
                  if (user.role === 'Admin' || user.role === 'admin' || user.role === 'superadmin' || user.role === 'Main Admin') return true;
                  // If specific sub-module IDs exist in allowedModules, filter by them
                  if (subItem.id && user.allowedModules.includes(subItem.id)) return true;
                  // If no sub-module IDs in allowedModules but parent is allowed, show all without role restrictions
                  if (!subItem.roles) return true;
                }
                // No roles restriction = visible to all
                if (!subItem.roles) return true;
                return false;
              })
              .map((subItem) => (
              <div key={subItem.id}>
                {subItem.hasSubmenu ? (
                  renderMenuItem(subItem, level + 1)
                ) : (
                  <button
                    onClick={() => handleSubMenuClick(subItem)}
                    className="w-full flex items-center px-4 py-2 text-left text-sm rounded-lg transition-all duration-150"
                    style={{
                      color: "#69231B",
                      backgroundColor: activeSubRoute === subItem.id ? "rgba(105,35,27,0.12)" : "transparent",
                      borderLeft: activeSubRoute === subItem.id ? "3px solid #69231B" : "3px solid transparent",
                      fontWeight: activeSubRoute === subItem.id ? "600" : "400"
                    }}
                    onMouseEnter={e => { if (activeSubRoute !== subItem.id) e.currentTarget.style.backgroundColor = "rgba(105,35,27,0.08)"; }}
                    onMouseLeave={e => { if (activeSubRoute !== subItem.id) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {subItem.icon && (
                      <subItem.icon
                        className="w-4 h-4 mr-3"
                      style={{ color: "#69231B" }}
                      />
                    )}
                    <span>{subItem.name}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getHeaderTitle = () => {
    switch (crmType) {
      case "restaurant":
        return "Jagali Koota";
      default:
        return "Jagali Koota CRM";
    }
  };

  const getHeaderIcon = () => {
    return null; // using logo image instead
  };

  return (
    <div className="w-72 shadow-xl border-r flex flex-col h-full" style={{ backgroundColor: "#D1C9BC", borderColor: "#c4b5af" }}>
      {/* Header */}
      <div className="p-5 border-b" style={{ backgroundColor: "#D1C9BC", borderColor: "#c4b5af" }}>
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden shadow-sm border" style={{ borderColor: "#69231B" }}>
            <img
              src="/logo4.jpeg"
              alt="Jagali Koota"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#69231B" }}>{getHeaderTitle()}</h1>
            <p className="text-sm font-medium" style={{ color: "#69231B", opacity: 0.75 }}>
              {crmType
                ? `${crmType.charAt(0).toUpperCase() + crmType.slice(1)} Dashboard`
                : "Admin Dashboard"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3" style={{ backgroundColor: "#D1C9BC" }}>
        <div className="space-y-1">
          {filteredMenuItems.map((item) => renderMenuItem(item))}
        </div>

        {/* Logout */}
        <div className="border-t mt-6 pt-4" style={{ borderColor: "#69231B" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group"
            style={{ color: "#69231B" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(105,35,27,0.1)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <div className="p-2 rounded-lg">
              <LogOut className="w-5 h-5" style={{ color: "#69231B" }} />
            </div>
            <span className="ml-3 font-medium" style={{ color: "#69231B" }}>
              Logout
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom user section */}
      <div className="p-4 border-t" style={{ backgroundColor: "#c4b5af", borderColor: "#69231B" }}>
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
            style={{ backgroundColor: "#69231B", borderColor: "#69231B" }}
          >
            <span className="font-semibold text-sm" style={{ color: "#D1C9BC" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold" style={{ color: "#69231B" }}>
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs" style={{ color: "#69231B", opacity: 0.7 }}>
              {user?.role || "Restaurant Manager"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMSidebar;
