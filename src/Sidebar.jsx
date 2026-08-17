"use client"

import { useState } from "react"
import {
  Settings,
  Menu,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Calendar,
  ChefHat,
  UserCheck,
  TrendingUp,
  CreditCard,
  UserCog,
  LogOut,
  ChevronRight,
  ChevronDown,
  Home,
} from "lucide-react"
import SupplierLedger from "./components/Finance & Accounts/SupplierLedger"

// Sample components for each route
const RestaurantDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Restaurant Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#69231B]">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-2xl font-bold">0</p>
            <p className="text-gray-600">Total Orders</p>
            <p className="text-sm text-gray-500">Today: 0</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
        <div className="flex items-center">
          <CreditCard className="w-8 h-8 text-orange-500" />
          <div className="ml-4">
            <p className="text-2xl font-bold">₹0</p>
            <p className="text-gray-600">Total Revenue</p>
            <p className="text-sm text-gray-500">Today: ₹0</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-purple-500" />
          <div className="ml-4">
            <p className="text-2xl font-bold">0</p>
            <p className="text-gray-600">Total Users</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const RestaurantSetup = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Restaurant Setup</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Configure your restaurant settings, location, and basic information.</p>
    </div>
  </div>
)

const MenuManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Menu Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage your restaurant menu items, categories, and pricing.</p>
    </div>
  </div>
)

const StockManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Stock Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Track inventory, manage stock levels, and receive alerts.</p>
    </div>
  </div>
)

const PurchaseManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Purchase Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage supplier purchases and procurement processes.</p>
    </div>
  </div>
)

const OrderBilling = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Order & Billing</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Process orders, generate bills, and manage transactions.</p>
    </div>
  </div>
)

const CustomerManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage customer information, preferences, and history.</p>
    </div>
  </div>
)

const ReservationsManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Reservations Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Handle table reservations and booking management.</p>
    </div>
  </div>
)

const KitchenManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Kitchen Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage kitchen operations, orders, and workflow.</p>
    </div>
  </div>
)

const HRManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">HR & Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage staff, schedules, and human resources.</p>
    </div>
  </div>
)

const ExpenseManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Expense Management</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Track and manage restaurant expenses and costs.</p>
    </div>
  </div>
)

const FinanceAccounts = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Finance & Accounts</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage financial records, accounts, and reporting.</p>
    </div>
  </div>
)

const SubAdmin = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">SubAdmin</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <p>Manage sub-administrator accounts and permissions.</p>
    </div>
  </div>
)

const Sidebar = () => {
  const [activeRoute, setActiveRoute] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState({})

  const menuItems = [
    {
      id: "dashboard",
      name: "Restaurant Dashboard",
      icon: Home,
      component: RestaurantDashboard,
      color: "text-[#69231B]",
    },
    {
      id: "setup",
      name: "Restaurant Setup",
      icon: Settings,
      component: RestaurantSetup,
      hasSubmenu: true,
      color: "text-emerald-600",
    },
    {
      id: "menu",
      name: "Menu Management",
      icon: Menu,
      component: MenuManagement,
      hasSubmenu: true,
      color: "text-orange-600",
    },
    {
      id: "stock",
      name: "Stock Management",
      icon: Package,
      component: StockManagement,
      hasSubmenu: true,
      color: "text-purple-600",
    },
    {
      id: "purchase",
      name: "Purchase Management",
      icon: ShoppingCart,
      component: PurchaseManagement,
      hasSubmenu: true,
      color: "text-[#D1C9BC]",
    },
    {
      id: "billing",
      name: "Order & Billing",
      icon: FileText,
      component: OrderBilling,
      hasSubmenu: true,
      color: "text-rose-600",
    },
    {
      id: "customers",
      name: "Customer Management",
      icon: Users,
      component: CustomerManagement,
      hasSubmenu: true,
      color: "text-cyan-600",
    },
    {
      id: "reservations",
      name: "Reservations Management",
      icon: Calendar,
      component: ReservationsManagement,
      color: "text-teal-600",
    },
    {
      id: "kitchen",
      name: "Kitchen Management",
      icon: ChefHat,
      component: KitchenManagement,
      hasSubmenu: true,
      color: "text-amber-600",
    },
    {
      id: "hr",
      name: "HR & Management",
      icon: UserCheck,
      component: HRManagement,
      hasSubmenu: true,
      color: "text-green-600",
    },
    {
      id: "expenses",
      name: "Expense Management",
      icon: TrendingUp,
      component: ExpenseManagement,
      hasSubmenu: true,
      color: "text-red-600",
    },
    {
      id: "finance",
      name: "Finance & Accounts",
      icon: CreditCard,
      component: SupplierLedger,
      // hasSubmenu: true,
      color: "text-[#69231B]",
    },
    {
      id: "subadmin",
      name: "SubAdmin",
      icon: UserCog,
      component: SubAdmin,
      color: "text-slate-600",
    },
  ]

  const toggleSubmenu = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const getCurrentComponent = () => {
    const activeItem = menuItems.find((item) => item.id === activeRoute)
    return activeItem?.component || RestaurantDashboard
  }

  const CurrentComponent = getCurrentComponent()

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#FCFCFC" }}>
      <div
        className={`shadow-2xl transition-all duration-300 ease-in-out border-r border-[#D1C9BC]/40 ${isSidebarOpen ? "w-72" : "w-16"} flex flex-col`}
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="bg-gradient-to-r from-[#69231B] to-[#D1C9BC] p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo4.jpeg" 
                alt="Jagali Koota Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-white/30"
              />
              <div className={`transition-all duration-300 ${!isSidebarOpen && "opacity-0 w-0 overflow-hidden"}`}>
                <h1 className="text-lg font-bold text-white">
                  Jagali Koota
                </h1>
                <span className="text-xs text-rose-100">Restaurant CRM</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 flex-shrink-0"
              style={{ color: "rgb(255 255 255)" }}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 py-4">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeRoute === item.id
              const isExpanded = expandedItems[item.id]

              return (
                <div key={item.id} className="group">
                  <button
                    onClick={() => {
                      setActiveRoute(item.id)
                      if (item.hasSubmenu && isSidebarOpen) {
                        toggleSubmenu(item.id)
                      }
                      if (!isSidebarOpen) {
                        setIsSidebarOpen(true)
                      }
                    }}
                    className={`w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-200 group-hover:scale-[1.02] ${
                      isActive
                        ? "bg-gradient-to-r from-[#D1C9BC]/20 to-[#69231B]/10 border-l-4 border-[#69231B] shadow-md"
                        : "hover:bg-slate-50 hover:shadow-sm"
                    }`}
                    title={!isSidebarOpen ? item.name : ""}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        isActive ? "bg-white shadow-sm" : "group-hover:bg-white group-hover:shadow-sm"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive ? item.color : "text-slate-600 group-hover:text-slate-800"
                        }`}
                      />
                    </div>
                    {isSidebarOpen && (
                      <>
                        <div className="ml-3 flex-1">
                          <span
                            className={`font-medium text-lg transition-colors duration-200 ${
                              isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        {item.hasSubmenu && (
                          <div className="ml-2">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>

                  {item.hasSubmenu && isExpanded && isSidebarOpen && (
                    <div className="ml-6 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {["Overview", "Settings", "Reports"].map((subItem, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center px-3 py-2 text-left text-base text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-150"
                        >
                          <div className="w-2 h-2 bg-slate-300 rounded-full mr-3"></div>
                          {subItem}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="border-t border-slate-200 mt-6 pt-4 px-3">
            <button
              className="w-full flex items-center px-3 py-3 text-left hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title={!isSidebarOpen ? "Logout" : ""}
            >
              <div className="p-2 rounded-lg group-hover:bg-red-100 transition-colors duration-200">
                <LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors duration-200" />
              </div>
              {isSidebarOpen && (
                <span className="ml-3 font-medium text-lg text-slate-700 group-hover:text-red-700 transition-colors duration-200">
                  Logout
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1 overflow-auto" style={{ backgroundColor: "#FCFCFC" }}>
        <div className="min-h-full">
          <CurrentComponent />
        </div>
      </div>
    </div>
  )
}

export default Sidebar



