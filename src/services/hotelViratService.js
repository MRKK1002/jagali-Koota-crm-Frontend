// Jagali Koota Integration Service
// Fetches data from Jagali Koota backend and formats it for CRM

const HOTEL_VIRAT_API = 'http://192.168.1.40:9000/api/v1/hotel';

class JagaliKootaService {
  constructor() {
    this.baseURL = HOTEL_VIRAT_API;
  }

  // Generic fetch method
  async fetch(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Jagali Koota API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get all orders (staff + online)
  async getOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/staff-order${queryParams ? `?${queryParams}` : ''}`;
    return await this.fetch(endpoint);
  }

  // Get online orders
  async getOnlineOrders(limit = 1000) {
    return await this.fetch(`/order?limit=${limit}`);
  }

  // Get branches
  async getBranches() {
    return await this.fetch('/branch');
  }

  // Get categories
  async getCategories() {
    return await this.fetch('/category');
  }

  // Get menu items
  async getMenuItems() {
    return await this.fetch('/menu');
  }

  // Get tables
  async getTables() {
    return await this.fetch('/table');
  }

  // Get rooms
  async getRooms() {
    return await this.fetch('/room');
  }

  // Get room bookings
  async getRoomBookings() {
    return await this.fetch('/room-booking');
  }

  // Get staff users
  async getStaffUsers() {
    return await this.fetch('/staff-auth');
  }

  // Get counter users
  async getCounterUsers() {
    return await this.fetch('/counter-auth');
  }

  // Get analytics data
  async getAnalytics(startDate, endDate) {
    try {
      const [orders, onlineOrders, rooms, bookings] = await Promise.all([
        this.getOrders(),
        this.getOnlineOrders(),
        this.getRooms(),
        this.getRoomBookings(),
      ]);

      // Process orders
      const allOrders = [
        ...(Array.isArray(orders) ? orders : orders.orders || []),
        ...(Array.isArray(onlineOrders) ? onlineOrders : onlineOrders.data || []),
      ];

      // Filter by date range if provided
      let filteredOrders = allOrders;
      if (startDate || endDate) {
        filteredOrders = allOrders.filter(order => {
          const orderDate = new Date(order.orderTime || order.createdAt);
          if (startDate && orderDate < new Date(startDate)) return false;
          if (endDate && orderDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Calculate metrics
      const totalRevenue = filteredOrders.reduce((sum, order) => 
        sum + (order.grandTotal || 0), 0
      );

      const totalOrders = filteredOrders.length;

      const ordersByStatus = filteredOrders.reduce((acc, order) => {
        const status = order.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const ordersByCategory = filteredOrders.reduce((acc, order) => {
        const category = order.categoryName || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const guestOrders = filteredOrders.filter(o => o.isGuestOrder).length;
      const staffOrders = filteredOrders.filter(o => !o.isGuestOrder).length;

      // Room metrics
      const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
      const availableRooms = Array.isArray(rooms) 
        ? rooms.filter(r => r.status === 'available').length 
        : 0;
      const occupiedRooms = totalRooms - availableRooms;

      const roomBookings = Array.isArray(bookings) ? bookings : [];
      const totalBookings = roomBookings.length;
      const roomRevenue = roomBookings.reduce((sum, booking) => 
        sum + (booking.totalAmount || 0), 0
      );

      return {
        orders: {
          total: totalOrders,
          revenue: totalRevenue,
          byStatus: ordersByStatus,
          byCategory: ordersByCategory,
          guestOrders,
          staffOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
          bookings: totalBookings,
          revenue: roomRevenue,
        },
        totalRevenue: totalRevenue + roomRevenue,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      console.error('Error fetching Jagali Koota analytics:', error);
      throw error;
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const [orders, bookings] = await Promise.all([
        this.getOrders(),
        this.getRoomBookings(),
      ]);

      const allOrders = Array.isArray(orders) ? orders : orders.orders || [];
      const allBookings = Array.isArray(bookings) ? bookings : [];

      // Combine and sort by date
      const activities = [
        ...allOrders.map(order => ({
          type: 'order',
          id: order.orderId,
          description: `Order ${order.orderId} - ${order.customerName || 'Guest'}`,
          amount: order.grandTotal,
          status: order.status,
          date: new Date(order.orderTime || order.createdAt),
        })),
        ...allBookings.map(booking => ({
          type: 'booking',
          id: booking.bookingId || booking._id,
          description: `Room Booking - ${booking.guestName}`,
          amount: booking.totalAmount,
          status: booking.status,
          date: new Date(booking.checkInDate || booking.createdAt),
        })),
      ];

      // Sort by date (newest first) and limit
      return activities
        .sort((a, b) => b.date - a.date)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
}

export default new JagaliKootaService();
