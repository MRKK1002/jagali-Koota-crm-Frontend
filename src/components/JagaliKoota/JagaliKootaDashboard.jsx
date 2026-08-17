// Jagali Koota Analytics Dashboard for CRM
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Home,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import jagaliKootaService from '../../services/jagaliKootaService';

const JagaliKootaDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsData, activityData] = await Promise.all([
        jagaliKootaService.getAnalytics(dateRange.start, dateRange.end),
        jagaliKootaService.getRecentActivity(10),
      ]);
      setAnalytics(analyticsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError('Failed to fetch Jagali Koota data. Please check if the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-purple-600" />
        <span className="ml-2 text-gray-600">Loading Jagali Koota data...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jagali Koota Analytics</h1>
          <p className="text-gray-600">Real-time data from Jagali Koota operations</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#5c1e15]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#5c1e15]"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-[#5c1e15] rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(analytics?.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{analytics?.orders.total}</p>
              <p className="text-blue-100 text-xs mt-1">
                Avg: {formatCurrency(analytics?.orders.averageOrderValue)}
              </p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Room Occupancy</p>
              <p className="text-2xl font-bold mt-1">
                {analytics?.rooms.occupancyRate.toFixed(1)}%
              </p>
              <p className="text-green-100 text-xs mt-1">
                {analytics?.rooms.occupied}/{analytics?.rooms.total} rooms
              </p>
            </div>
            <Home className="h-12 w-12 text-green-200" />
          </div>
        </div>

        {/* Room Bookings */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Room Bookings</p>
              <p className="text-2xl font-bold mt-1">{analytics?.rooms.bookings}</p>
              <p className="text-orange-100 text-xs mt-1">
                Revenue: {formatCurrency(analytics?.rooms.revenue)}
              </p>
            </div>
            <Calendar className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.orders.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      status === 'completed' || status === 'delivered'
                        ? 'bg-green-500'
                        : status === 'pending'
                        ? 'bg-yellow-500'
                        : status === 'preparing'
                        ? 'bg-blue-500'
                        : status === 'cancelled'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-gray-700 capitalize">{status}</span>
                </div>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.orders.byCategory || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-700">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#69231B] h-2 rounded-full"
                      style={{
                        width: `${(count / analytics?.orders.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Types */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Types</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">Guest Orders</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {analytics?.orders.guestOrders}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-purple-600 text-sm font-medium">Staff Orders</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {analytics?.orders.staffOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'order' ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                >
                  {activity.type === 'order' ? (
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(activity.amount)}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'completed' || activity.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JagaliKootaDashboard;

