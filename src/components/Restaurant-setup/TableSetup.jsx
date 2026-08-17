import { useState, useEffect } from "react"
import { Search, Download, X, Check, AlertCircle, Plus, Upload, Loader, Store, QrCode } from "lucide-react"
import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: "http://192.168.1.40:9000/api/v1/hotel",
  headers: {
    "Content-Type": "application/json",
  },
})

const TableSetup = () => {
  const [allTables, setAllTables] = useState([]) // Store all tables from API
  const [displayedTables, setDisplayedTables] = useState([]) // Tables to display for current page
  const [filteredTables, setFilteredTables] = useState([]) // Tables after applying search filter
  const [branches, setBranches] = useState([])
  const [categories, setCategories] = useState([]) // Categories for filtering
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // State for modals
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState(null)
  const [addFormData, setAddFormData] = useState({
    branchId: "",
    categoryId: "",
    number: "",
    status: "available",
    image: null,
  })
  const [editFormData, setEditFormData] = useState({
    branchId: "",
    categoryId: "",
    number: "",
    status: "available",
    image: null,
  })
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const tablesPerPage = 10

  // Image preview states
  const [addImagePreview, setAddImagePreview] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)

  // Fetch tables, branches, and categories on component mount or when filters change
  useEffect(() => {
    fetchBranches()
    fetchCategories()
    fetchTables()
  }, [statusFilter, branchFilter, categoryFilter])

  // Fetch all branches
  const fetchBranches = async () => {
    try {
      const response = await api.get("/branch")
      setBranches(response.data)
    } catch (error) {
      console.error("Error fetching branches:", error)
      setError("Failed to load branches. Some filter options may not be available.")
    }
  }

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/category")
      console.log("Categories API response:", response.data)
      setCategories(response.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  // Fetch all tables
  const fetchTables = async () => {
    setLoading(true)
    setError("")
    setAllTables([]) // Clear all tables before fetching
    setFilteredTables([]) // Clear filtered tables
    setDisplayedTables([]) // Clear displayed tables

    try {
      // Build query parameters
      const params = {}

      // Add filters if they're not set to "all"
      if (branchFilter !== "all") {
        params.branchId = branchFilter
      }

     /*  console.log("Fetching tables with params:", params) */ // Debug log
      const response = await api.get("/table", { params })
     /*  console.log("API response:", response.data) */ // Debug log

      // Verify response structure
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: tables array missing")
      }

      // Format and validate tables for display
      const formattedTables = response.data
        .map((table, index) => {
          return {
            id: table._id || `temp-id-${index}`, // Fallback ID if _id is missing
            number: table.number || 0,
            status: table.status || "available",
            branchId: table.branchId?._id || table.branchId || null,
            branchName: table.branchId?.name || "Unknown Branch",
            categoryId: table.categoryId?._id || table.categoryId || null,
            categoryName: table.categoryId?.name || "All Categories",
            image: table.image || null,
            qrCode: table.qrCode || null,
            createdAt: new Date(table.createdAt || Date.now()).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            // Include the original table for reference
            originalTable: table,
          }
        })
        .filter((table) => table.id) // Remove any invalid tables

      setAllTables(formattedTables)
    } catch (error) {
      console.error("Error fetching tables:", error)
      setError("Failed to load tables. Please refresh the page and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle search filtering and pagination
  useEffect(() => {
    // Apply client-side search filter with defensive checks
    let filtered = allTables

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((table) => table.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase()
      filtered = filtered.filter((table) => {
        const number = table.number?.toString() || ""
        const branchName = table.branchName || ""
        const status = table.status || ""

        return (
          number.toLowerCase().includes(searchLower) ||
          branchName.toLowerCase().includes(searchLower) ||
          status.toLowerCase().includes(searchLower)
        )
      })
    }

    setFilteredTables(filtered)
    setTotalPages(Math.ceil(filtered.length / tablesPerPage))
    setCurrentPage(1) // Reset to first page on search or filter change
  }, [allTables, searchTerm, statusFilter])

  // Handle pagination
  useEffect(() => {
    // Slice filtered tables for the current page
    const startIndex = (currentPage - 1) * tablesPerPage
    const endIndex = startIndex + tablesPerPage
    const paginatedTables = filteredTables.slice(startIndex, endIndex)
    setDisplayedTables(paginatedTables)
  }, [filteredTables, currentPage])

  // Handle view table
  const handleViewTable = (table) => {
    setSelectedTable(table)
    setViewModalOpen(true)
  }

  // Handle add table
  const handleAddTable = () => {
    setAddFormData({
      branchId: "",
      categoryId: "",
      number: "",
      status: "available",
      image: null,
    })
    setAddImagePreview(null)
    setAddModalOpen(true)
  }

  // Handle edit table
  const handleEditTable = (table) => {
    setSelectedTable(table)
    setEditFormData({
      branchId: table.branchId || "",
      categoryId: table.categoryId || "",
      number: table.number || "",
      status: table.status || "available",
      image: null,
    })
    setEditImagePreview(table.image ? `${table.image}` : null)
    setEditModalOpen(true)
  }

  // Handle delete table
  const handleDeleteTable = (table) => {
    setSelectedTable(table)
    setDeleteModalOpen(true)
  }

  // Handle form input change
  const handleAddInputChange = (e) => {
    const { name, value } = e.target
    setAddFormData({
      ...addFormData,
      [name]: value,
    })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
  }

  // Handle image upload
  const handleAddImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAddFormData({
        ...addFormData,
        image: file,
      })
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => setAddImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditFormData({
        ...editFormData,
        image: file,
      })
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => setEditImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Handle save new table
  const handleSaveNewTable = async () => {
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!addFormData.branchId || !addFormData.number) {
        alert("Please fill in all required fields")
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("branchId", addFormData.branchId)
      if (addFormData.categoryId) {
        formData.append("categoryId", addFormData.categoryId)
      }
      formData.append("number", addFormData.number)
      formData.append("status", addFormData.status)
      if (addFormData.image) {
        formData.append("image", addFormData.image)
      }

      // Create table
      await api.post("/table", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh tables
      await fetchTables()

      setAddModalOpen(false)
      setSuccessMessage("Table created successfully")

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error creating table:", error)
      alert("Failed to create table. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!editFormData.branchId || !editFormData.number) {
        alert("Please fill in all required fields")
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("branchId", editFormData.branchId)
      if (editFormData.categoryId) {
        formData.append("categoryId", editFormData.categoryId)
      }
      formData.append("number", editFormData.number)
      formData.append("status", editFormData.status)
      if (editFormData.image) {
        formData.append("image", editFormData.image)
      }

      // Update table
      await api.put(`/table/${selectedTable.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh tables
      await fetchTables()

      setEditModalOpen(false)
      setSuccessMessage(`Table ${selectedTable.number} updated successfully`)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error updating table:", error)
      alert("Failed to update table. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    setIsSubmitting(true)

    try {
      // Delete table
      await api.delete(`/table/${selectedTable.id}`)

      // Refresh tables
      await fetchTables()

      setDeleteModalOpen(false)
      setSuccessMessage(`Table ${selectedTable.number} deleted successfully`)

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error deleting table:", error)
      alert("Failed to delete table. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Close modals
  const closeViewModal = () => {
    setViewModalOpen(false)
    setSelectedTable(null)
  }

  const closeAddModal = () => {
    setAddModalOpen(false)
    setAddImagePreview(null)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setSelectedTable(null)
    setEditImagePreview(null)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedTable(null)
  }

  // Reset pagination when filters change
  const handleFilterChange = (type, value) => {
    if (type === "status") {
      setStatusFilter(value)
    } else if (type === "branch") {
      setBranchFilter(value)
    }
    setCurrentPage(1)
  }

  // Generate QR code URL for a table
  const generateQRCodeUrl = (table) => {
    // Use local network IP for mobile access (your computer's IP on the network)
    const baseUrl = "http://192.168.1.40:5174"
    // Point to /menu page (public menu component) with table parameters
    let menuUrl = `${baseUrl}/menu?branch=${table.branchId}&name=${encodeURIComponent(table.branchName)}&table=${table.number}`
    if (table.categoryId) {
      menuUrl += `&category=${table.categoryId}&categoryName=${encodeURIComponent(table.categoryName || '')}`
    }
    // Use QR code API to generate QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`
  }

  // Download QR code for a table
  const downloadQRCode = async (table) => {
    const qrUrl = generateQRCodeUrl(table)
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `table-${table.number}-${table.branchName}-qr.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading QR code:", error)
      alert("Failed to download QR code")
    }
  }

  // Export tables as CSV
  const exportTables = () => {
    // Create CSV header
    let csv = "Table Number,Branch,Status,Created At\n"

    // Add each table as a row
    filteredTables.forEach((table) => {
      csv += `${table.number},"${table.branchName}",${table.status},"${table.createdAt}"\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `tables-export-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="tables-page">
      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <Check size={16} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="page-header" style={{ position: 'relative', zIndex: 100 }}>
        <h1>Tables Management</h1>
        <div className="header-actions" style={{ position: 'relative', zIndex: 101 }}>
          <button className="btn btn-outline" onClick={exportTables}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by table number, branch, or status..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
          </select>
          <select
            className="filter-select"
            value={branchFilter}
            onChange={(e) => handleFilterChange("branch", e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="error-container"
          style={{
            margin: "20px 0",
            padding: "10px 15px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="data-card">
        {loading ? (
          <div
            className="loading-container"
            style={{
              textAlign: "center",
              padding: "40px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Loader size={24} className="animate-spin" />
            <p>Loading tables...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Table Number</th>
                <th>Branch</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTables.length > 0 ? (
                displayedTables.map((table) => (
                  <tr key={table.id}>
                    <td>
                      {table.image ? (
                        <img
                          src={`${table.image}`}
                          alt={`Table ${table.number}`}
                          className="table-image"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : (
                        <div
                          className="table-image-placeholder"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                          }}
                        >
                          <Store size={20} />
                        </div>
                      )}
                    </td>
                    <td>Table {table.number}</td>
                    <td>{table.branchName}</td>
                    <td>{table.categoryName}</td>
                    <td>
                      <span className={`status-badge ${table.status}`}>
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                      </span>
                    </td>
                    <td>{table.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => handleViewTable(table)}>
                          View
                        </button>
                        <button 
                          className="action-btn" 
                          onClick={() => downloadQRCode(table)}
                          style={{ backgroundColor: "#8b5cf6", color: "white" }}
                          title="Download QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-tables">
                    No tables found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-page ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                className={`pagination-page ${currentPage === totalPages ? "active" : ""}`}
                onClick={() => setCurrentPage(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {/* View Table Modal */}
      {viewModalOpen && selectedTable && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Table Details - Table {selectedTable.number}</h3>
              <button className="modal-close" onClick={closeViewModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="order-detail-row">
                  <div className="order-detail-label">Table Number</div>
                  <div className="order-detail-value">Table {selectedTable.number}</div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Branch</div>
                  <div className="order-detail-value">{selectedTable.branchName}</div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Category</div>
                  <div className="order-detail-value">{selectedTable.categoryName}</div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Status</div>
                  <div className="order-detail-value">
                    <span className={`status-badge ${selectedTable.status}`}>
                      {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="order-detail-row">
                  <div className="order-detail-label">Created At</div>
                  <div className="order-detail-value">{selectedTable.createdAt}</div>
                </div>
                {selectedTable.image && (
                  <div className="order-detail-row">
                    <div className="order-detail-label">Image</div>
                    <div className="order-detail-value">
                      <img
                        src={`${selectedTable.image}`}
                        alt={`Table ${selectedTable.number}`}
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="order-detail-row">
                  <div className="order-detail-label">QR Code</div>
                  <div className="order-detail-value">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <img
                        src={generateQRCodeUrl(selectedTable)}
                        alt={`QR Code for Table ${selectedTable.number}`}
                        style={{
                          width: "200px",
                          height: "200px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => downloadQRCode(selectedTable)}
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        <Download size={16} />
                        Download QR Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Table</h3>
              <button className="modal-close" onClick={closeAddModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select
                    name="branchId"
                    value={addFormData.branchId}
                    onChange={handleAddInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category (Optional)</label>
                  <select
                    name="categoryId"
                    value={addFormData.categoryId}
                    onChange={handleAddInputChange}
                    className="form-select"
                  >
                    <option value="">All Categories (No Filter)</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Table Number *</label>
                  <input
                    type="number"
                    name="number"
                    value={addFormData.number}
                    onChange={handleAddInputChange}
                    className="form-input"
                    placeholder="Enter table number"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={addFormData.status}
                  onChange={handleAddInputChange}
                  className="form-select"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeAddModal} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveNewTable} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create Table"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editModalOpen && selectedTable && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Table - Table {selectedTable.number}</h3>
              <button className="modal-close" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select
                    name="branchId"
                    value={editFormData.branchId}
                    onChange={handleEditInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category (Optional)</label>
                  <select
                    name="categoryId"
                    value={editFormData.categoryId}
                    onChange={handleEditInputChange}
                    className="form-select"
                  >
                    <option value="">All Categories (No Filter)</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Table Number *</label>
                  <input
                    type="number"
                    name="number"
                    value={editFormData.number}
                    onChange={handleEditInputChange}
                    className="form-input"
                    placeholder="Enter table number"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="form-select"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeEditModal} disabled={isSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveChanges} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Modal */}
      {deleteModalOpen && selectedTable && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Delete Table</h3>
              <button className="modal-close" onClick={closeDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <AlertCircle size={48} color="#dc2626" style={{ marginBottom: "16px" }} />
                <h4 style={{ marginBottom: "8px", color: "#dc2626" }}>Are you sure?</h4>
                <p style={{ color: "#666", marginBottom: "16px" }}>
                  Do you want to delete Table {selectedTable.number} from {selectedTable.branchName}?
                </p>
                <p style={{ color: "#dc2626", fontSize: "14px" }}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeDeleteModal} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "1px solid #dc2626",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Table"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableSetup
