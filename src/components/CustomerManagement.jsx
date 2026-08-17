import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Inline SMS Panel Component
const InlineSmsPanel = ({ customer, onClose }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const messageTemplate = `Hello ${customer.name || 'Customer'}, thank you for being a valued customer! We appreciate your business. Best regards, Your Hotel Team.`;

  const handleSendMessage = (type) => {
    setSelectedOption(type);
    let successMessage = '';
    let url = '';

    switch (type) {
      case 'Normal SMS':
        url = `sms:${customer.phone.replace(/[^+\d]/g, '')}?body=${encodeURIComponent(messageTemplate)}`;
        successMessage = `Normal SMS opened for ${customer.name} (${customer.phone})!`;
        window.open(url, '_blank');
        break;
      case 'WhatsApp':
        const waPhone = customer.phone.replace(/[^+\d]/g, '');
        url = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageTemplate)}`;
        successMessage = `WhatsApp opened for ${customer.name} (${customer.phone})!`;
        window.open(url, '_blank');
        break;
      case 'Email':
        const subject = `Thank You for Your Visit - ${customer.name}`;
        url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageTemplate)}`;
        successMessage = `Email client opened for ${customer.name} (${customer.email || 'default'})!`;
        window.location.href = url;
        break;
      default:
        successMessage = `${type} sent successfully to ${customer.name}!`;
    }

    setTimeout(() => {
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onClose();
      setSelectedOption('');
    }, 1000);
  };

  return (
    <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-md max-w-sm ml-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-800">Send Message</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => handleSendMessage('Normal SMS')}
          disabled={selectedOption === 'Normal SMS'}
          className="w-full p-3 text-left border-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 text-sm">Normal SMS</p>
          </div>
        </button>
        <button
          onClick={() => handleSendMessage('WhatsApp')}
          disabled={selectedOption === 'WhatsApp'}
          className="w-full p-3 text-left border-2 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 disabled:opacity-50 border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 text-sm">WhatsApp</p>
          </div>
        </button>
        <button
          onClick={() => handleSendMessage('Email')}
          disabled={selectedOption === 'Email'}
          className="w-full p-3 text-left border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50 border-gray-200"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 text-sm">Email</p>
          </div>
        </button>
      </div>
    </div>
  );
};

// Customer Details Modal
const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
    {/* Header */}
    <div className="flex justify-between items-center mb-6 border-b pb-3">
      <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    {/* Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Customer Name
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {customer.name || "N/A"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Phone Number
          </label>
          <p className="text-gray-900">{customer.phone || "N/A"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Email Address
          </label>
          <p className="text-gray-900">{customer.email || "N/A"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Address
          </label>
          <p className="text-gray-900">{customer.address || "N/A"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Total Spent
          </label>
          <p className="text-xl font-bold text-green-600">
            ₹{(customer.total_spent ?? 0).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Reward Points
          </label>
          <p className="text-lg font-semibold text-blue-600">
            {(customer.reward_points ?? 0).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Total Orders
          </label>
          <p className="text-gray-900">
            {customer.customer_visits
              ? `${customer.customer_visits} orders`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

// Customer Table Component
const CustomerTable = ({ data, onSendSms, onViewDetails, onPrintCustomer }) => {
  const [openSmsId, setOpenSmsId] = useState(null);

  const handleSmsClick = (customer) => {
    setOpenSmsId(openSmsId === customer.id ? null : customer.id);
    if (openSmsId !== customer.id) onSendSms(customer);
  };

  const closeSmsPanel = () => {
    setOpenSmsId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Customer Data</h2>
        <p className="text-sm text-gray-600 mt-1">Showing {data.length} customers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{customer.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">₹{(customer.total_spent ?? 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-600 font-medium">{(customer.reward_points ?? 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-purple-600 font-medium">{customer.customer_visits ? `${customer.customer_visits} orders` : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSmsClick(customer)}
                          className={`p-2 rounded-full transition-colors ${openSmsId === customer.id ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          title={openSmsId === customer.id ? 'Close SMS Panel' : 'Send SMS'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onViewDetails(customer)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onPrintCustomer(customer)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full transition-colors"
                          title="Print PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openSmsId === customer.id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-0">
                        <InlineSmsPanel customer={customer} onClose={closeSmsPanel} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Function to aggregate orders into unique customers (Online/Darshini)
const aggregateCustomers = (orders) => {
  console.log('Aggregating Orders:', orders);
  const customerMap = new Map();

  orders.forEach((order) => {
    const phone = order.phone || order.mobileNumber || order.phoneNumber || order.customerMobile || 'N/A';
    if (phone === 'N/A') {
      console.log('Skipping order due to no phone:', order);
      return;
    }

    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        id: order._id || phone,
        name: order.name || order.customerName || order.userId?.name || 'Unknown',
        phone,
        email: order.email || order.userId?.email || 'N/A',
        total_spent: 0,
        reward_points: 0,
        address: order.address || order.deliveryAddress?.addressLine || 'N/A',
        preferences: order.preferences || 'N/A',
        customer_visits: 0,
        birthday: order.dob || 'N/A',
        anniversary: order.anniversary || 'N/A',
        lastVisit: order.createdAt || 'N/A',
      });
    }

    const cust = customerMap.get(phone);
    cust.total_spent += order.total || order.totalAmount || order.grandTotal || 0;
    cust.reward_points += order.loyaltyPoints || 0;
    cust.customer_visits += 1;

    const orderDate = order.createdAt || order.orderDate;
    if (orderDate && !isNaN(new Date(orderDate)) && (!cust.lastVisit || new Date(orderDate) > new Date(cust.lastVisit))) {
      cust.lastVisit = orderDate;
    }
  });

  const customers = Array.from(customerMap.values()).map((cust) => ({
    ...cust,
    lastVisit: cust.lastVisit !== 'N/A' ? new Date(cust.lastVisit).toLocaleDateString() : 'N/A',
  }));

  console.log('Aggregated Customers:', customers);
  return customers;
};

// Function to aggregate restaurant orders into unique customers
const aggregateRestaurantCustomers = (orders) => {
  console.log('Restaurant Orders:', orders);
  const customerMap = new Map();

  orders.forEach((order) => {
    const phone = order.customerMobile || order.phone || order.mobileNumber || order.customerPhone || 'N/A';
    if (phone === 'N/A' || !phone) {
      console.log('Skipping restaurant order due to no phone:', order);
      return;
    }

    if (!customerMap.has(phone)) {
      customerMap.set(phone, {
        id: order._id || phone,
        name: order.customerName || order.name || 'Guest Customer',
        phone,
        email: order.email || 'N/A',
        total_spent: 0,
        reward_points: 0,
        address: order.branchId?.address || order.address || 'N/A',
        preferences: 'N/A',
        customer_visits: 0,
        birthday: 'N/A',
        anniversary: 'N/A',
        lastVisit: order.orderTime || order.createdAt || 'N/A',
      });
    }

    const cust = customerMap.get(phone);
    cust.total_spent += order.grandTotal || order.totalAmount || order.total || 0;
    cust.reward_points += order.loyaltyPoints || order.rewardPoints || 0;
    cust.customer_visits += 1;

    const orderDate = order.orderTime || order.createdAt;
    if (orderDate && !isNaN(new Date(orderDate)) && (!cust.lastVisit || new Date(orderDate) > new Date(cust.lastVisit))) {
      cust.lastVisit = orderDate;
    }
  });

  const customers = Array.from(customerMap.values()).map((cust) => ({
    ...cust,
    lastVisit: cust.lastVisit !== 'N/A' ? new Date(cust.lastVisit).toLocaleDateString() : 'N/A',
  }));

  console.log('Aggregated Restaurant Customers:', customers);
  return customers;
};

// Helper function to fetch all orders (for online)
const fetchAllOrders = async (urlBase, tab) => {
  let allData = [];
  let page = 1;
  const config = {}; // Add headers if needed
  while (true) {
    try {
      const res = await axios.get(`${urlBase}?page=${page}`, config);
      console.log(`Fetching ${tab} page ${page}:`, res.data);
      const data = Array.isArray(res.data) ? res.data : res.data.orders || res.data.data || [];
      if (data.length === 0) break;
      allData = [...allData, ...data];
      page++;
    } catch (err) {
      console.error(`Error fetching ${tab} page ${page}:`, err.response?.data || err.message);
      toast.error(`Failed to fetch ${tab} orders: ${err.message}`, { position: 'top-right', autoClose: 5000 });
      break;
    }
  }
  console.log(`All ${tab} Orders Fetched:`, allData);
  return allData;
};

// Main Customer Management Component
const CustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersData, setCustomersData] = useState({ online: [], darshini: [], restaurant: [] });
  const [loading, setLoading] = useState({ online: false, darshini: false, restaurant: false });
  const [error, setError] = useState({ online: null, darshini: null, restaurant: null });
  const [page, setPage] = useState({ online: 1, darshini: 1, restaurant: 1 });
  const [totalPages, setTotalPages] = useState({ online: 1, darshini: 1, restaurant: 1 });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading({ online: true, darshini: true, restaurant: true });
      setError({ online: null, darshini: null, restaurant: null });

      const config = {}; // Add headers if needed, e.g., { headers: { Authorization: 'Bearer YOUR_TOKEN' } }

      // Fetch online orders (all pages)
      try {
        const onlineData = await fetchAllOrders('https://crm.jagalikoota.com/api/v1/hotel/order', 'online');
        const onlineCustomers = aggregateCustomers(onlineData);
        setCustomersData((prev) => ({ ...prev, online: onlineCustomers }));
        setTotalPages((prev) => ({ ...prev, online: 1 }));
      } catch (err) {
        const message =
          err.response?.status === 404
            ? 'Online orders endpoint not found'
            : err.response?.status === 401
              ? 'Unauthorized access to online orders'
              : 'Failed to fetch online orders: ' + err.message;
        console.error('Online Fetch Error:', err.response?.data || err.message);
        setError((prev) => ({ ...prev, online: message }));
        toast.error(message, { position: 'top-right', autoClose: 5000 });
      } finally {
        setLoading((prev) => ({ ...prev, online: false }));
      }

      // Fetch darshini orders (single page)
      try {
        const darshiniRes = await axios.get(
          `https://crm.jagalikoota.com/api/v1/hotel/counter-order/orders?page=${page.darshini}`,
          config
        );
        console.log('Darshini API Response:', darshiniRes.data);
        const darshiniData = Array.isArray(darshiniRes.data.orders)
          ? darshiniRes.data.orders
          : darshiniRes.data.data || [];
        const darshiniCustomers = aggregateCustomers(darshiniData);
        setCustomersData((prev) => ({ ...prev, darshini: darshiniCustomers }));
        setTotalPages((prev) => ({ ...prev, darshini: darshiniRes.data.totalPages || 1 }));
      } catch (err) {
        const message =
          err.response?.status === 404
            ? 'Counter orders endpoint not found'
            : err.response?.status === 401
              ? 'Unauthorized access to counter orders'
              : 'Failed to fetch counter orders: ' + err.message;
        console.error('Darshini Fetch Error:', err.response?.data || err.message);
        setError((prev) => ({ ...prev, darshini: message }));
        toast.error(message, { position: 'top-right', autoClose: 5000 });
      } finally {
        setLoading((prev) => ({ ...prev, darshini: false }));
      }

      // Fetch restaurant orders (single page)
      try {
        const restaurantRes = await axios.get(
          `https://crm.jagalikoota.com/api/v1/hotel/staff-order?page=${page.restaurant}`,
          config
        );
        console.log('Restaurant API Response:', restaurantRes.data);
        const restaurantData = restaurantRes.data.orders || [];
        console.log('Restaurant Orders:', restaurantData);
        const restaurantCustomers = aggregateRestaurantCustomers(restaurantData);
        console.log('Final Restaurant Customers:', restaurantCustomers);
        setCustomersData((prev) => ({ ...prev, restaurant: restaurantCustomers }));
        setTotalPages((prev) => ({ ...prev, restaurant: restaurantRes.data.totalPages || 1 }));
      } catch (err) {
        const message =
          err.response?.status === 404
            ? 'Restaurant orders endpoint not found'
            : err.response?.status === 401
              ? 'Unauthorized access to restaurant orders'
              : 'Failed to fetch restaurant orders: ' + err.message;
        console.error('Restaurant Fetch Error:', err.response?.data || err.message);
        setError((prev) => ({ ...prev, restaurant: message }));
        toast.error(message, { position: 'top-right', autoClose: 5000 });
      } finally {
        setLoading((prev) => ({ ...prev, restaurant: false }));
      }
    };

    fetchCustomers();
  }, [page]);

  const handlePageChange = (tab, newPage) => {
    if (newPage >= 1 && newPage <= totalPages[tab]) {
      setPage((prev) => ({ ...prev, [tab]: newPage }));
    }
  };

  const getFilteredData = () => {
    const data = customersData[activeTab] || [];
    if (searchQuery) {
      return data.filter(
        (customer) =>
          (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.phone || '').includes(searchQuery) ||
          (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  };

  const getTabCount = (tabType) => {
    return customersData[tabType]?.length || 0;
  };

  const handleSendSms = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setDetailsModalOpen(true);
  };

  const handlePrintCustomer = (customer) => {
    let leftHtml = `
      <div class="field">
        <div class="label">Customer Name:</div>
        <div class="value">${customer.name || 'Unknown'}</div>
      </div>
      <div class="field">
        <div class="label">Phone Number:</div>
        <div class="value">${customer.phone || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${customer.email || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="label">Address:</div>
        <div class="value">${customer.address || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="label">Birthday:</div>
        <div class="value">${customer.birthday || 'N/A'}</div>
      </div>
    `;
    let rightHtml = `
      <div class="field">
        <div class="label">Total Spent:</div>
        <div class="value">₹${(customer.total_spent || 0).toLocaleString()}</div>
      </div>
      <div class="field">
        <div class="label">Reward Points:</div>
        <div class="value">${(customer.reward_points || 0).toLocaleString()}</div>
      </div>
      <div class="field">
        <div class="label">Total Orders:</div>
        <div class="value">${customer.customer_visits || 0} orders</div>
      </div>
      <div class="field">
        <div class="label">Anniversary:</div>
        <div class="value">${customer.anniversary || 'N/A'}</div>
      </div>
    `;
    let bottomHtml = `
      <div class="field">
        <div class="label">Food Preferences:</div>
        <div class="value">${customer.preferences || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="label">Last Visit:</div>
        <div class="value">${customer.lastVisit || 'N/A'}</div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Details - ${customer.name || 'Unknown'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Customer Details Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="details">
            <div>${leftHtml}</div>
            <div>${rightHtml}</div>
          </div>
          ${bottomHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getTotalStats = () => {
    const tabCustomers = customersData[activeTab] || [];
    return {
      totalCustomers: tabCustomers.length,
      totalRevenue: tabCustomers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0),
      totalRewardPoints: tabCustomers.reduce((sum, customer) => sum + (customer.reward_points || 0), 0),
      totalOrders: tabCustomers.reduce((sum, customer) => sum + (customer.customer_visits || 0), 0),
    };
  };

  const stats = getTotalStats();

  if (loading[activeTab]) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading {activeTab} customer data...</div>
      </div>
    );
  }

  if (error[activeTab]) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-red-600">Error: {error[activeTab]}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage customers across Online, Darshini, and Restaurant</p>
        </div>
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Customers</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
            <p className="text-sm text-gray-500 mt-1">In {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Lifetime value</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Active Reward Points</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRewardPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Points in circulation</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Orders</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Across all customers</p>
          </div>
        </div>
        <div className="mb-6 flex flex-col md:flex-row justify-end items-start md:items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Customers</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <nav className="flex space-x-8">
            {['online', 'darshini', 'restaurant'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${activeTab === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {type === 'online' ? 'Online Orders' : type === 'darshini' ? 'Darshini Orders' : 'Restaurant Orders'} (
                {getTabCount(type)})
              </button>
            ))}
          </nav>
          {totalPages[activeTab] > 1 && activeTab !== 'online' && (
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded ${page[activeTab] === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'
                  }`}
                onClick={() => handlePageChange(activeTab, page[activeTab] - 1)}
                disabled={page[activeTab] === 1}
              >
                Previous
              </button>
              <span>
                Page {page[activeTab]} of {totalPages[activeTab]}
              </span>
              <button
                className={`px-4 py-2 rounded ${page[activeTab] === totalPages[activeTab] ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'
                  }`}
                onClick={() => handlePageChange(activeTab, page[activeTab] + 1)}
                disabled={page[activeTab] === totalPages[activeTab]}
              >
                Next
              </button>
            </div>
          )}
        </div>
        <CustomerTable
          data={getFilteredData()}
          onSendSms={handleSendSms}
          onViewDetails={handleViewDetails}
          onPrintCustomer={handlePrintCustomer}
        />
        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            isOpen={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default CustomerManagement;