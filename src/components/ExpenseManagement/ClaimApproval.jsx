
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

function ClaimApprovalFlow() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState({ employee: '', status: '', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', employee: '', expenseType: '', amount: '', date: '', description: '', status: 'Pending', approver: '', receipt: '' 
  });

  useEffect(() => {
    const mockData = [
      { id: 1, employee: 'John Doe', expenseType: 'Air Travel', amount: 45000, date: '2025-01-15', description: 'Business trip to Mumbai for client presentation and project discussion', status: 'Approved', approver: 'Sarah Wilson', receipt: 'Receipt_001.pdf' },
      { id: 2, employee: 'Jane Smith', expenseType: 'Hotel Accommodation', amount: 28000, date: '2025-01-16', description: '3-night premium hotel stay during conference', status: 'Pending', approver: 'Michael Brown', receipt: 'Receipt_002.pdf' },
      { id: 3, employee: 'Robert Brown', expenseType: 'Meals & Entertainment', amount: 12000, date: '2025-01-17', description: 'Client dinner at premium restaurant for deal closure', status: 'Rejected', approver: 'Sarah Wilson', receipt: 'Receipt_003.pdf' },
      { id: 4, employee: 'Sarah Johnson', expenseType: 'Transportation', amount: 6500, date: '2025-01-18', description: 'Airport transfers and local taxi services', status: 'Pending', approver: 'David Chen', receipt: 'Receipt_004.pdf' },
      { id: 5, employee: 'Michael Lee', expenseType: 'Communication', amount: 8500, date: '2025-01-19', description: 'International roaming charges during business trip', status: 'Approved', approver: 'Michael Brown', receipt: 'Receipt_005.pdf' },
    ];
    setClaims(mockData);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      setClaims(claims.map(claim => claim.id === parseInt(formData.id) ? {...formData, id: parseInt(formData.id), amount: parseFloat(formData.amount)} : claim));
    } else {
      const newClaim = { ...formData, id: Date.now(), amount: parseFloat(formData.amount) };
      setClaims([...claims, newClaim]);
    }
    setShowForm(false);
    setFormData({ id: '', employee: '', expenseType: '', amount: '', date: '', description: '', status: 'Pending', approver: '', receipt: '' });
  };

  const handleEdit = (claim) => {
    setFormData({...claim, amount: claim.amount.toString()});
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setClaims(claims.filter(claim => claim.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setClaims(claims.map(claim => 
      claim.id === id ? { ...claim, status: newStatus } : claim
    ));
  };

  // Function to export claims data as CSV
  const exportToCSV = () => {
    const headers = ['Employee', 'Expense Type', 'Amount', 'Date', 'Description', 'Status', 'Approver', 'Receipt'];
    const csvData = filteredClaims.map(claim => [
      claim.employee,
      claim.expenseType,
      claim.amount,
      claim.date,
      claim.description,
      claim.status,
      claim.approver,
      claim.receipt
    ]);

    // Add headers to the CSV
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');

    // Create a Blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claims_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Function to download receipt
  const downloadReceipt = (receiptName) => {
    // In a real application, this would fetch the actual file from a server
    // For demo purposes, we'll create a dummy file
    const content = "This is a dummy receipt file for " + receiptName;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = receiptName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredClaims = claims.filter(claim => {
    return (filter.employee === '' || claim.employee.toLowerCase().includes(filter.employee.toLowerCase())) &&
           (filter.status === '' || claim.status === filter.status) &&
           (filter.search === '' || 
            claim.employee.toLowerCase().includes(filter.search.toLowerCase()) ||
            claim.expenseType.toLowerCase().includes(filter.search.toLowerCase()) ||
            claim.description.toLowerCase().includes(filter.search.toLowerCase())
           );
  });

  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const expenseTypes = ['Air Travel', 'Hotel Accommodation', 'Meals & Entertainment', 'Transportation', 'Communication', 'Office Supplies', 'Training & Development'];
  const approvers = ['Sarah Wilson', 'Michael Brown', 'David Chen', 'Lisa Anderson', 'James Rodriguez'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);
  const approvedAmount = filteredClaims.filter(c => c.status === 'Approved').reduce((sum, claim) => sum + claim.amount, 0);
  const pendingCount = filteredClaims.filter(c => c.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
              <p className="text-gray-600 mt-1">Track and approve employee expense claims efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Claims</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">₹{approvedAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Search claims by employee, type, or description..."
                value={filter.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                name="employee"
                value={filter.employee}
                onChange={handleFilterChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {[...new Set(claims.map(item => item.employee))].map(employee => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button 
                onClick={exportToCSV}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Claim
              </button>
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#EF7F1B]/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">
                              {claim.employee.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{claim.employee}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{claim.expenseType}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={claim.description}>
                        {claim.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-gray-900">₹{claim.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(claim.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{claim.approver}</td>
                    <td className="px-6 py-4">
                      <select
                        value={claim.status}
                        onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                        className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center gap-2 ${getStatusColor(claim.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDetails(claim)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(claim)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(claim.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredClaims.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {formData.id ? 'Edit Expense Claim' : 'Add New Expense Claim'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                    <input
                      type="text"
                      name="employee"
                      value={formData.employee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
                    <select
                      name="expenseType"
                      value={formData.expenseType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select expense type</option>
                      {expenseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Approver</label>
                    <select
                      name="approver"
                      value={formData.approver}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select approver</option>
                      {approvers.map(approver => (
                        <option key={approver} value={approver}>{approver}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                    placeholder="Provide detailed description of the expense..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt/Document</label>
                  <input
                    type="text"
                    name="receipt"
                    value={formData.receipt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Receipt_001.pdf"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ id: '', employee: '', expenseType: '', amount: '', date: '', description: '', status: 'Pending', approver: '', receipt: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {formData.id ? 'Update' : 'Create'} Claim
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Claim Details</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(showDetails.status)}`}>
                    {getStatusIcon(showDetails.status)}
                    {showDetails.status}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employee</label>
                    <p className="text-lg font-semibold text-gray-900">{showDetails.employee}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-lg font-semibold text-gray-900">₹{showDetails.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expense Type</label>
                    <p className="text-gray-900">{showDetails.expenseType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{new Date(showDetails.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Approver</label>
                    <p className="text-gray-900">{showDetails.approver}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Receipt</label>
                    <p 
                      className="text-blue-600 cursor-pointer hover:underline" 
                      onClick={() => downloadReceipt(showDetails.receipt)}
                    >
                      {showDetails.receipt}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{showDetails.description}</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimApprovalFlow;