import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Utensils, 
  List, 
  Building,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Clock
} from "lucide-react";
import { fetchDualBackend } from "../utils/apiHelpers";
const RestaurantDashboard = () => {
  const [stats, setStats] = useState({
    menu: {
      totalItems: 0,
      categories: 0,
      byBranch: {}
    },
    branches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API Base URL
  let API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
  API_BASE_URL = API_BASE_URL.replace(/\/$/, "");
  const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
    ? `${API_BASE_URL}/hotel`
    : `${API_BASE_URL}/api/v1/hotel`;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [menuData, branchesData] = await Promise.all([
          fetchDualBackend("/hotel/menu", {}, true).catch(() => []),
          fetch(`${HOTEL_API_BASE}/getAllRestaurants?all=true`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
              if (data.success && data.data) return data.data;
              if (Array.isArray(data)) return data;
              return [];
            })
            .catch(() => [])
        ]);

        // Calculate menu statistics
        const menuItems = Array.isArray(menuData) ? menuData : [];
        const categories = new Set(menuItems.map(item => item.categoryId?._id || item.categoryId)).size;

        // Group menu items by branch
        const menuByBranch = menuItems.reduce((acc, item) => {
          const branchName = item.branchId?.name || "Unknown Branch";
          acc[branchName] = (acc[branchName] || 0) + 1;
          return acc;
        }, {});

        setStats({
          menu: {
            totalItems: menuItems.length,
            categories: categories,
            byBranch: menuByBranch
          },
          branches: Array.isArray(branchesData) ? branchesData.length : 0
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "#69231B" }}></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your restaurant operations</p>
        </div>

        {/* Menu Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-orange-600" />
            Menu Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Utensils}
              title="Total Menu Items"
              value={stats.menu.totalItems}
              subtitle="Active items"
              color="bg-orange-600"
            />
            <StatCard
              icon={List}
              title="Categories"
              value={stats.menu.categories}
              subtitle="Menu categories"
              color="bg-[#69231B]"
            />
            <StatCard
              icon={Building}
              title="Branches"
              value={stats.branches}
              subtitle="Active locations"
              color="bg-emerald-600"
            />
          </div>
        </div>

        {/* Branch Overview */}
        {Object.keys(stats.menu.byBranch).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-600" />
              Branch Overview
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Menu Items
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(stats.menu.byBranch).map(([branchName, count]) => (
                    <tr key={branchName} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {branchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/restaurant/menu/menu'}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left"
            >
              <Utensils className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Menu</p>
            </button>
            <button
              onClick={() => window.location.href = '/restaurant/menu/category'}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left"
            >
              <List className="w-8 h-8 text-[#69231B] mb-2" />
              <p className="text-sm font-medium text-gray-900">Categories</p>
            </button>
            <button
              onClick={() => window.location.href = '/restaurant/setup/restaurant-profile'}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-left"
            >
              <Building className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Branches</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RestaurantDashboard;
