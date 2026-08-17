
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Download, Eye, CheckCircle, XCircle, Clock, FileText, Upload, Filter, Calendar, User, FileCheck } from 'lucide-react';

function DocumentTracker() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState({ employee: '', status: '', search: '', documentType: '' });
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', employee: '', documentType: '', uploadedDate: '', verifiedDate: '', status: 'Pending', verifier: '', fileName: '', fileSize: '', comments: '' 
  });

  useEffect(() => {
    const mockData = [
      { 
        id: 1, 
        employee: 'John Doe', 
        documentType: 'Travel Receipts', 
        uploadedDate: '2025-01-15', 
        verifiedDate: '2025-01-16', 
        status: 'Verified', 
        verifier: 'Sarah Wilson',
        fileName: 'travel_receipts_jan2025.pdf',
        fileSize: '2.4 MB',
        comments: 'All receipts are valid and properly documented'
      },
      { 
        id: 2, 
        employee: 'Jane Smith', 
        documentType: 'Hotel Invoice', 
        uploadedDate: '2025-01-16', 
        verifiedDate: '', 
        status: 'Pending', 
        verifier: 'Michael Brown',
        fileName: 'hotel_invoice_mumbai.pdf',
        fileSize: '1.8 MB',
        comments: 'Awaiting verification'
      },
      { 
        id: 3, 
        employee: 'Robert Brown', 
        documentType: 'Meal Receipts', 
        uploadedDate: '2025-01-17', 
        verifiedDate: '2025-01-18', 
        status: 'Rejected', 
        verifier: 'Sarah Wilson',
        fileName: 'meal_receipts_client_dinner.pdf',
        fileSize: '3.2 MB',
        comments: 'Receipt amount exceeds policy limit. Please provide justification'
      },
      { 
        id: 4, 
        employee: 'Sarah Johnson', 
        documentType: 'Transportation', 
        uploadedDate: '2025-01-18', 
        verifiedDate: '', 
        status: 'Under Review', 
        verifier: 'David Chen',
        fileName: 'taxi_receipts_airport.pdf',
        fileSize: '0.9 MB',
        comments: 'Under review for policy compliance'
      },
      { 
        id: 5, 
        employee: 'Michael Lee', 
        documentType: 'Communication Bills', 
        uploadedDate: '2025-01-19', 
        verifiedDate: '2025-01-20', 
        status: 'Verified', 
        verifier: 'Michael Brown',
        fileName: 'phone_bill_international.pdf',
        fileSize: '1.1 MB',
        comments: 'International roaming charges approved'
      },
      { 
        id: 6, 
        employee: 'Lisa Anderson', 
        documentType: 'Training Certificate', 
        uploadedDate: '2025-01-20', 
        verifiedDate: '', 
        status: 'Pending', 
        verifier: 'Sarah Wilson',
        fileName: 'training_certificate_aws.pdf',
        fileSize: '0.7 MB',
        comments: 'New submission awaiting review'
      }
    ];
    setDocuments(mockData);
  }, []);

  // Function to export documents as CSV
  const exportToCSV = () => {
    const headers = ['Employee', 'Document Type', 'File Name', 'File Size', 'Uploaded Date', 'Verified Date', 'Status', 'Verifier', 'Comments'];
    const csvData = filteredDocuments.map(doc => [
      doc.employee,
      doc.documentType,
      doc.fileName,
      doc.fileSize,
      doc.uploadedDate,
      doc.verifiedDate || 'N/A',
      doc.status,
      doc.verifier,
      doc.comments || 'No comments'
    ]);

    // Add headers to the CSV
    const csv = [headers, ...csvData].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    // Create a Blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document_tracker_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Function to download a document file
  const downloadFile = (fileName) => {
    // In a real application, this would fetch the actual file from a server
    // For demo purposes, we'll create a dummy file
    const content = `This is a dummy file for ${fileName}. In a real application, this would be the actual file content.`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (formData.id) {
      setDocuments(documents.map(doc => doc.id === parseInt(formData.id) ? {...formData, id: parseInt(formData.id)} : doc));
    } else {
      const newDoc = { ...formData, id: Date.now() };
      setDocuments([...documents, newDoc]);
    }
    setShowForm(false);
    setFormData({ id: '', employee: '', documentType: '', uploadedDate: '', verifiedDate: '', status: 'Pending', verifier: '', fileName: '', fileSize: '', comments: '' });
  };

  const handleEdit = (doc) => {
    setFormData(doc);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    const verifiedDate = newStatus === 'Verified' ? new Date().toISOString().split('T')[0] : '';
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status: newStatus, verifiedDate } : doc
    ));
  };

  const filteredDocuments = documents.filter(doc => {
    return (filter.employee === '' || doc.employee.toLowerCase().includes(filter.employee.toLowerCase())) &&
           (filter.status === '' || doc.status === filter.status) &&
           (filter.documentType === '' || doc.documentType === filter.documentType) &&
           (filter.search === '' || 
            doc.employee.toLowerCase().includes(filter.search.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(filter.search.toLowerCase()) ||
            doc.fileName.toLowerCase().includes(filter.search.toLowerCase())
           );
  });

  const statusOptions = ['Pending', 'Under Review', 'Verified', 'Rejected'];
  const documentTypes = ['Travel Receipts', 'Hotel Invoice', 'Meal Receipts', 'Transportation', 'Communication Bills', 'Training Certificate', 'Medical Bills', 'Office Supplies'];
  const verifiers = ['Sarah Wilson', 'Michael Brown', 'David Chen', 'Lisa Anderson', 'James Rodriguez'];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Verified': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      case 'Under Review': return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Under Review': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getDocumentIcon = (type) => {
    switch(type) {
      case 'Travel Receipts': return '✈️';
      case 'Hotel Invoice': return '🏨';
      case 'Meal Receipts': return '🍽️';
      case 'Transportation': return '🚗';
      case 'Communication Bills': return '📱';
      case 'Training Certificate': return '🎓';
      case 'Medical Bills': return '🏥';
      default: return '📄';
    }
  };

  const totalDocuments = filteredDocuments.length;
  const verifiedCount = filteredDocuments.filter(d => d.status === 'Verified').length;
  const pendingCount = filteredDocuments.filter(d => d.status === 'Pending' || d.status === 'Under Review').length;
  const rejectedCount = filteredDocuments.filter(d => d.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileCheck className="w-8 h-8 text-blue-600" />
                Document Verification Hub
              </h1>
              <p className="text-gray-600 mt-1">Track, verify, and manage employee document submissions</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalDocuments}</div>
                <div className="text-sm text-gray-500">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div>
                <div className="text-sm text-gray-500">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                <div className="text-sm text-gray-500">Rejected</div>
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
                placeholder="Search documents by employee, type, or filename..."
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
                {[...new Set(documents.map(item => item.employee))].map(employee => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
              <select
                name="documentType"
                value={filter.documentType}
                onChange={handleFilterChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                Add Document
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                    {getDocumentIcon(doc.documentType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{doc.documentType}</h3>
                    <p 
                      className="text-sm text-blue-600 cursor-pointer hover:underline"
                      onClick={() => downloadFile(doc.fileName)}
                    >
                      {doc.fileName}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                  {getStatusIcon(doc.status)}
                  {doc.status}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{doc.employee}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Uploaded: {new Date(doc.uploadedDate).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</span>
                </div>
                {doc.verifiedDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verified: {new Date(doc.verifiedDate).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Size: {doc.fileSize}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Verifier:</span> {doc.verifier}
                </p>
                {doc.comments && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.comments}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <select
                  value={doc.status}
                  onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg border ${getStatusColor(doc.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDetails(doc)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(doc)}
                    className="text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50 transition-all"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  {formData.id ? 'Edit Document' : 'Add New Document'}
                </h3>
              </div>
              <div className="p-6 space-y-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select document type</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                    <input
                      type="text"
                      name="fileName"
                      value={formData.fileName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., receipt_001.pdf"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Size</label>
                    <input
                      type="text"
                      name="fileSize"
                      value={formData.fileSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2.4 MB"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Date</label>
                    <input
                      type="date"
                      name="uploadedDate"
                      value={formData.uploadedDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verifier</label>
                    <select
                      name="verifier"
                      value={formData.verifier}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select verifier</option>
                      {verifiers.map(verifier => (
                        <option key={verifier} value={verifier}>{verifier}</option>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verified Date</label>
                    <input
                      type="date"
                      name="verifiedDate"
                      value={formData.verifiedDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Add any comments or notes about this document..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ id: '', employee: '', documentType: '', uploadedDate: '', verifiedDate: '', status: 'Pending', verifier: '', fileName: '', fileSize: '', comments: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {formData.id ? 'Update' : 'Create'} Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{getDocumentIcon(showDetails.documentType)}</span>
                    Document Details
                  </h3>
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
                    <label className="block text-sm font-medium text-gray-500">Document Type</label>
                    <p className="text-gray-900">{showDetails.documentType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">File Name</label>
                    <p 
                      className="text-blue-600 font-mono text-sm cursor-pointer hover:underline"
                      onClick={() => downloadFile(showDetails.fileName)}
                    >
                      {showDetails.fileName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">File Size</label>
                    <p className="text-gray-900">{showDetails.fileSize}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Uploaded Date</label>
                    <p className="text-gray-900">{new Date(showDetails.uploadedDate).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Verified Date</label>
                    <p className="text-gray-900">
                      {showDetails.verifiedDate ? new Date(showDetails.verifiedDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Not verified yet'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Verifier</label>
                    <p className="text-gray-900">{showDetails.verifier}</p>
                  </div>
                </div>
                {showDetails.comments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Comments</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{showDetails.comments}</p>
                  </div>
                )}
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

export default DocumentTracker;