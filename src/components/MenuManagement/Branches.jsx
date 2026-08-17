// import { useState, useEffect } from "react"
// import { Search, Plus, Edit, Trash2, MapPin, AlertCircle, Check, Upload, X, ImageIcon } from "lucide-react"
// import axios from "axios"

// // Create axios instance
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Helper function to get image URL - Updated to handle full file system paths
// const getImageUrl = (imagePath) => {
//   if (!imagePath) return null

//   // If it's already a full URL, return as is
//   if (imagePath.startsWith("http")) {
//     return imagePath
//   }

//   // Clean up the path to remove any leading/trailing slashes and normalize separators
//   let cleanPath = imagePath.toString().trim().replace(/\\/g, "/") // Convert backslashes to forward slashes

//   // Extract the filename from the path
//   const parts = cleanPath.split("/")
//   const filename = parts[parts.length - 1]

//   // Handle various path formats
//   if (cleanPath.includes("uploads/branch/") || cleanPath.includes("/opt/render/project/src/uploads/")) {
//     // If path contains uploads/branch/ or server-specific paths, use the filename
//     return `https://crm.jagalikoota.com/api/v1/uploads/branch/${filename}`
//   }

//   // If it starts with uploads/, use it directly
//   if (cleanPath.startsWith("uploads/")) {
//     return `https://crm.jagalikoota.com/api/v1/${cleanPath}`
//   }

//   // If it's just a filename, assume it's in uploads/branch/
//   return `https://crm.jagalikoota.com/api/v1/uploads/branch/${filename}`
// }

// const BranchModal = ({ branch, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: branch?.name || "",
//     address: branch?.address || "",
//     image: null,
//   })
//   const [imagePreview, setImagePreview] = useState(branch?.image ? (branch.image) : null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     if (branch?.image) {
//       setImagePreview((branch.image))
//     }
//   }, [branch])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData({ ...formData, [name]: value })
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       // Validate file size (5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB")
//         return
//       }

//       // Validate file type
//       if (!file.type.startsWith("image/")) {
//         setError("Please select a valid image file")
//         return
//       }

//       setError("")
//       setFormData({ ...formData, image: file })

//       // Create preview URL
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setImagePreview(reader.result)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const removeImage = () => {
//     setFormData({ ...formData, image: null })
//     setImagePreview(null)
//     // Reset file input
//     const fileInput = document.getElementById("image-upload")
//     if (fileInput) {
//       fileInput.value = ""
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//     setError("")

//     try {
//       // Create FormData for file upload
//       const submitData = new FormData()
//       submitData.append("name", formData.name)
//       submitData.append("address", formData.address)

//       // Handle image logic for updates
//       if (branch) {
//         // For updates: only append image if a new file is selected
//         if (formData.image && formData.image instanceof File) {
//           submitData.append("image", formData.image)
//         }
//       } else {
//         // For new branches: append image if selected
//         if (formData.image && formData.image instanceof File) {
//           submitData.append("image", formData.image)
//         }
//       }

//       await onSave(submitData)
//       onClose()
//     } catch (error) {
//       setError(error.message || "Failed to save branch. Please try again.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h3 className="modal-title">{branch ? "Edit Branch" : "Add New Branch"}</h3>
//           <button className="modal-close" onClick={onClose}>
//             �
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="modal-body">
//             {error && (
//               <div
//                 className="error-message"
//                 style={{ marginBottom: "15px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}
//               >
//                 <AlertCircle size={16} />
//                 <span>{error}</span>
//               </div>
//             )}

//             {/* Image Upload Section */}
//             <div className="form-group">
//               <label className="form-label">Branch Image</label>
//               <div className="image-upload-container">
//                 {imagePreview ? (
//                   <div className="image-preview-wrapper">
//                     <img
//                       src={imagePreview || "/placeholder.svg"}
//                       alt="Branch preview"
//                       className="image-preview"
//                       onError={(e) => {
//                         console.error("Image failed to load:", imagePreview)
//                         e.target.style.display = "none"
//                         e.target.nextSibling.style.display = "flex"
//                       }}
//                     />
//                     <div
//                       className="category-image-placeholder"
//                       style={{
//                         display: "none",
//                         width: "100%",
//                         height: "150px",
//                         fontSize: "14px",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         backgroundColor: "#f3f4f6",
//                         borderRadius: "8px",
//                       }}
//                     >
//                       <ImageIcon size={24} />
//                       <span>Image not found</span>
//                     </div>
//                     <div className="image-overlay">
//                       <button
//                         type="button"
//                         onClick={removeImage}
//                         style={{
//                           background: "rgba(220, 38, 38, 0.8)",
//                           border: "none",
//                           borderRadius: "50%",
//                           width: "32px",
//                           height: "32px",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           cursor: "pointer",
//                           color: "white",
//                         }}
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <label htmlFor="image-upload" className="image-upload-label">
//                     <div className="image-upload-placeholder">
//                       <Upload size={24} />
//                       <span>Click to upload branch image</span>
//                       <small style={{ color: "#6b7280", marginTop: "4px" }}>PNG, JPG up to 5MB</small>
//                     </div>
//                   </label>
//                 )}
//                 <input
//                   type="file"
//                   id="image-upload"
//                   className="image-upload-input"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label" htmlFor="name">
//                 Branch Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 className="form-input"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label className="form-label" htmlFor="address">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 name="address"
//                 className="form-textarea"
//                 value={formData.address}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
//               Cancel
//             </button>
//             <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
//               {isSubmitting ? "Saving..." : branch ? "Update Branch" : "Add Branch"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// const DeleteConfirmationModal = ({ branch, onClose, onConfirm }) => {
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [error, setError] = useState("")

//   const handleDelete = async () => {
//     setIsDeleting(true)
//     setError("")

//     try {
//       await onConfirm(branch._id)
//       onClose()
//     } catch (error) {
//       setError(error.message || "Failed to delete branch. Please try again.")
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   return (
//     <div className="modal-overlay">
//       <div className="modal" style={{ maxWidth: "400px" }}>
//         <div className="modal-header">
//           <h3 className="modal-title">Delete Branch</h3>
//           <button className="modal-close" onClick={onClose}>
//             �
//           </button>
//         </div>
//         <div className="modal-body">
//           {error && (
//             <div
//               className="error-message"
//               style={{ marginBottom: "15px", color: "#dc2626", display: "flex", alignItems: "center", gap: "8px" }}
//             >
//               <AlertCircle size={16} />
//               <span>{error}</span>
//             </div>
//           )}
//           <p>
//             Are you sure you want to delete <strong>{branch.name}</strong>? This will also delete all associated
//             categories and products.
//           </p>
//           <p style={{ color: "#dc2626", marginTop: "10px" }}>This action cannot be undone.</p>
//         </div>
//         <div className="modal-footer">
//           <button type="button" className="btn btn-outline" onClick={onClose} disabled={isDeleting}>
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="btn"
//             style={{ backgroundColor: "#dc2626", color: "white", borderColor: "#dc2626" }}
//             onClick={handleDelete}
//             disabled={isDeleting}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// const Branches = () => {
//   const [branches, setBranches] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [showModal, setShowModal] = useState(false)
//   const [currentBranch, setCurrentBranch] = useState(null)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [branchToDelete, setBranchToDelete] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [successMessage, setSuccessMessage] = useState("")

//   // Fetch branches on component mount
//   useEffect(() => {
//     fetchBranches()
//   }, [])

//   // Fetch all branches from API
//   const fetchBranches = async () => {
//     setLoading(true)
//     setError("")

//     try {
//       const response = await api.get("/branch")
//       console.log("Fetched branches:", response.data)
//       setBranches(response.data)
//     } catch (error) {
//       console.error("Error fetching branches:", error)
//       setError("Failed to load branches. Please refresh the page and try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredBranches = branches.filter(
//     (branch) =>
//       branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       branch.address.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const handleAddClick = () => {
//     setCurrentBranch(null)
//     setShowModal(true)
//   }

//   const handleEditClick = (branch) => {
//     setCurrentBranch(branch)
//     setShowModal(true)
//   }

//   const handleDeleteClick = (branch) => {
//     setBranchToDelete(branch)
//     setShowDeleteModal(true)
//   }

//   // Handle save branch (create or update)
//   const handleSaveBranch = async (formData) => {
//     try {
//       let response

//       if (currentBranch) {
//         // Update existing branch
//         response = await axios.put(
//           `https://crm.jagalikoota.com/api/v1/hotel/branch/${currentBranch._id}`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//             timeout: 30000,
//           },
//         )
//         setBranches(branches.map((branch) => (branch._id === currentBranch._id ? response.data : branch)))
//         setSuccessMessage(`Branch "${response.data.name}" updated successfully`)
//       } else {
//         // Create new branch
//         response = await axios.post("https://crm.jagalikoota.com/api/v1/hotel/branch", formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           timeout: 30000,
//         })
//         setBranches([...branches, response.data])
//         setSuccessMessage(`Branch "${response.data.name}" created successfully`)
//       }

// /*       console.log("Branch saved:", response.data)
//  */
//       // Auto-hide success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("")
//       }, 3000)

//       return true
//     } catch (error) {
//       console.error("Error saving branch:", error)

//       let errorMessage = "Failed to save branch"
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message
//       } else if (error.message) {
//         errorMessage = error.message
//       }

//       throw new Error(errorMessage)
//     }
//   }

//   // Handle delete branch
//   const handleDeleteBranch = async (branchId) => {
//     try {
//       await api.delete(`/branch/${branchId}`)
//       setBranches(branches.filter((branch) => branch._id !== branchId))
//       setSuccessMessage("Branch deleted successfully")

//       setTimeout(() => {
//         setSuccessMessage("")
//       }, 3000)

//       return true
//     } catch (error) {
//       console.error("Error deleting branch:", error)
//       throw new Error(error.response?.data?.message || "Failed to delete branch")
//     }
//   }

//   return (
//     <div className="branches-page">
//       {/* Success message */}
//       {successMessage && (
//         <div className="success-message">
//           <Check size={16} />
//           <span>{successMessage}</span>
//           <button onClick={() => setSuccessMessage("")}>
//             <span>�</span>
//           </button>
//         </div>
//       )}

//       <div className="page-header">
//         <h1>Branches</h1>
//         <div className="header-actions">
//           <button className="btn btn-primary" onClick={handleAddClick}>
//             <Plus size={16} />
//             <span>Add Branch</span>
//           </button>
//         </div>
//       </div>

//       <div className="filters-bar">
//         <div className="search-container">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search branches by name or address..."
//             className="search-input"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Error message */}
//       {error && (
//         <div
//           className="error-container"
//           style={{
//             margin: "20px 0",
//             padding: "10px 15px",
//             backgroundColor: "#fee2e2",
//             color: "#dc2626",
//             borderRadius: "4px",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//           }}
//         >
//           <AlertCircle size={18} />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Loading state */}
//       {loading ? (
//         <div className="loading-container" style={{ textAlign: "center", padding: "40px 0" }}>
//           <p>Loading branches...</p>
//         </div>
//       ) : (
//         <div className="grid-container">
//           {filteredBranches.length > 0 ? (
//             filteredBranches.map((branch) => {
//               return (
//                 <div key={branch._id} className="grid-item">
//                   {/* Branch Image */}
//                   <div className="grid-item-image-container">
//                     {(() => {
//                       const imageUrl = (branch.image)
//                       console.log(`Branch ${branch.name} image URL:`, imageUrl)

//                       if (!imageUrl) {
//                         return (
//                           <div
//                             className="category-image-placeholder"
//                             style={{
//                               display: "flex",
//                               width: "100%",
//                               height: "200px",
//                               fontSize: "16px",
//                               flexDirection: "column",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               backgroundColor: "#f3f4f6",
//                               color: "#9ca3af",
//                             }}
//                           >
//                             <MapPin size={24} />
//                             <span style={{ marginTop: "8px", fontSize: "14px" }}>No Image</span>
//                           </div>
//                         )
//                       }

//                       return (
//                         <>
//                           <img
//                             src={imageUrl || "/placeholder.svg"}
//                             alt={branch.name}
//                             className="grid-item-image"
//                             onLoad={() => console.log(`Image loaded successfully: ${imageUrl}`)}
//                             onError={(e) => {
//                               console.error(`Image failed to load: ${imageUrl}`)
//                               e.target.style.display = "none"
//                               if (e.target.nextSibling) {
//                                 e.target.nextSibling.style.display = "flex"
//                               }
//                             }}
//                           />
//                           <div
//                             className="category-image-placeholder"
//                             style={{
//                               display: "none",
//                               width: "100%",
//                               height: "200px",
//                               fontSize: "16px",
//                               flexDirection: "column",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               backgroundColor: "#f3f4f6",
//                               color: "#9ca3af",
//                             }}
//                           >
//                             <ImageIcon size={24} />
//                             <span style={{ marginTop: "8px", fontSize: "14px" }}>Image failed to load</span>
//                           </div>
//                         </>
//                       )
//                     })()}
//                   </div>

//                   <div className="grid-item-content">
//                     <h3 className="grid-item-title">{branch.name}</h3>
//                     <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "8px" }}>
//                       <MapPin
//                         size={16}
//                         style={{ marginRight: "8px", color: "#6b7280", marginTop: "2px", flexShrink: 0 }}
//                       />
//                       <p className="grid-item-subtitle" style={{ lineHeight: "1.4" }}>
//                         {branch.address}
//                       </p>
//                     </div>
//                     <div className="grid-item-footer">
//                       <div className="grid-item-actions">
//                         <button className="action-btn edit" onClick={() => handleEditClick(branch)}>
//                           <Edit size={14} />
//                         </button>
//                         <button className="action-btn delete" onClick={() => handleDeleteClick(branch)}>
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })
//           ) : (
//             <div className="empty-state" style={{ textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
//               <p>
//                 No branches found. {searchQuery ? "Try a different search term." : "Add a new branch to get started."}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {showModal && (
//         <BranchModal branch={currentBranch} onClose={() => setShowModal(false)} onSave={handleSaveBranch} />
//       )}

//       {showDeleteModal && (
//         <DeleteConfirmationModal
//           branch={branchToDelete}
//           onClose={() => setShowDeleteModal(false)}
//           onConfirm={handleDeleteBranch}
//         />
//       )}
//     </div>
//   )
// }

// export default Branches

// import { useState, useEffect } from "react"
// import { Search, Plus, Edit, Trash2, MapPin, AlertCircle, Check, Upload, X, ImageIcon } from "lucide-react"
// import axios from "axios"

// // Create axios instance
// const api = axios.create({
//   baseURL: "https://crm.jagalikoota.com/api/v1/hotel",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Helper function to get image URL - Updated to handle full file system paths
// const getImageUrl = (imagePath) => {
//   if (!imagePath) return null

//   // If it's already a full URL, return as is
//   if (imagePath.startsWith("http")) {
//     return imagePath
//   }

//   // Clean up the path to remove any leading/trailing slashes and normalize separators
//   let cleanPath = imagePath.toString().trim().replace(/\\/g, "/") // Convert backslashes to forward slashes

//   // Extract the filename from the path
//   const parts = cleanPath.split("/")
//   const filename = parts[parts.length - 1]

//   // Handle various path formats
//   if (cleanPath.includes("uploads/branch/") || cleanPath.includes("/opt/render/project/src/uploads/")) {
//     // If path contains uploads/branch/ or server-specific paths, use the filename
//     return `https://crm.jagalikoota.com/api/v1/uploads/branch/${filename}`
//   }

//   // If it starts with uploads/, use it directly
//   if (cleanPath.startsWith("uploads/")) {
//     return `https://crm.jagalikoota.com/api/v1/${cleanPath}`
//   }

//   // If it's just a filename, assume it's in uploads/branch/
//   return `https://crm.jagalikoota.com/api/v1/uploads/branch/${filename}`
// }

// // Branch Modal Component
// const BranchModal = ({ branch, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: branch?.name || "",
//     address: branch?.address || "",
//     image: null,
//   })
//   const [imagePreview, setImagePreview] = useState(branch?.image ? (branch.image) : null)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     if (branch?.image) {
//       setImagePreview((branch.image))
//     }
//   }, [branch])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData({ ...formData, [name]: value })
//   }

//   const handleImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       // Validate file size (5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB")
//         return
//       }

//       // Validate file type
//       if (!file.type.startsWith("image/")) {
//         setError("Please select a valid image file")
//         return
//       }

//       setError("")
//       setFormData({ ...formData, image: file })

//       // Create preview URL
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setImagePreview(reader.result)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const removeImage = () => {
//     setFormData({ ...formData, image: null })
//     setImagePreview(null)
//     // Reset file input
//     const fileInput = document.getElementById("image-upload")
//     if (fileInput) {
//       fileInput.value = ""
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//     setError("")

//     try {
//       // Create FormData for file upload
//       const submitData = new FormData()
//       submitData.append("name", formData.name)
//       submitData.append("address", formData.address)

//       // Handle image logic for updates
//       if (branch) {
//         // For updates: only append image if a new file is selected
//         if (formData.image && formData.image instanceof File) {
//           submitData.append("image", formData.image)
//         }
//       } else {
//         // For new branches: append image if selected
//         if (formData.image && formData.image instanceof File) {
//           submitData.append("image", formData.image)
//         }
//       }

//       await onSave(submitData)
//       onClose()
//     } catch (error) {
//       setError(error.message || "Failed to save branch. Please try again.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h3 className="modal-title">{branch ? "Edit Branch" : "Add New Branch"}</h3>
//           <button className="modal-close" onClick={onClose}>
//             �
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="modal-body">
//             {error && (
//               <div className="error-message">
//                 <AlertCircle size={16} />
//                 <span>{error}</span>
//               </div>
//             )}

//             {/* Image Upload Section */}
//             <div className="form-group">
//               <label className="form-label">Branch Image</label>
//               <div className="image-upload-container">
//                 {imagePreview ? (
//                   <div className="image-preview-wrapper">
//                     <img
//                       src={imagePreview || "/placeholder.svg"}
//                       alt="Branch preview"
//                       className="image-preview"
//                       onError={(e) => {
//                         console.error("Image failed to load:", imagePreview)
//                         e.target.style.display = "none"
//                         e.target.nextSibling.style.display = "flex"
//                       }}
//                     />
//                     <div className="category-image-placeholder">
//                       <ImageIcon size={24} />
//                       <span>Image not found</span>
//                     </div>
//                     <div className="image-overlay">
//                       <button
//                         type="button"
//                         onClick={removeImage}
//                         className="remove-image-btn"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <label htmlFor="image-upload" className="image-upload-label">
//                     <div className="image-upload-placeholder">
//                       <Upload size={24} />
//                       <span>Click to upload branch image</span>
//                       <small>PNG, JPG up to 5MB</small>
//                     </div>
//                   </label>
//                 )}
//                 <input
//                   type="file"
//                   id="image-upload"
//                   className="image-upload-input"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label className="form-label" htmlFor="name">
//                 Branch Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 className="form-input"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label className="form-label" htmlFor="address">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 name="address"
//                 className="form-textarea"
//                 value={formData.address}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
//               Cancel
//             </button>
//             <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
//               {isSubmitting ? "Saving..." : branch ? "Update Branch" : "Add Branch"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// // Delete Confirmation Modal Component
// const DeleteConfirmationModal = ({ branch, onClose, onConfirm }) => {
//   const [isDeleting, setIsDeleting] = useState(false)
//   const [error, setError] = useState("")

//   const handleDelete = async () => {
//     setIsDeleting(true)
//     setError("")

//     try {
//       await onConfirm(branch._id)
//       onClose()
//     } catch (error) {
//       setError(error.message || "Failed to delete branch. Please try again.")
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   return (
//     <div className="modal-overlay">
//       <div className="modal delete-modal">
//         <div className="modal-header">
//           <h3 className="modal-title">Delete Branch</h3>
//           <button className="modal-close" onClick={onClose}>
//             �
//           </button>
//         </div>
//         <div className="modal-body">
//           {error && (
//             <div className="error-message">
//               <AlertCircle size={16} />
//               <span>{error}</span>
//             </div>
//           )}
//           <p>
//             Are you sure you want to delete <strong>{branch.name}</strong>? This will also delete all associated
//             categories and products.
//           </p>
//           <p className="warning-text">This action cannot be undone.</p>
//         </div>
//         <div className="modal-footer">
//           <button type="button" className="btn btn-outline" onClick={onClose} disabled={isDeleting}>
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="btn btn-danger"
//             onClick={handleDelete}
//             disabled={isDeleting}
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Main Branches Component
// const Branches = () => {
//   const [branches, setBranches] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [showModal, setShowModal] = useState(false)
//   const [currentBranch, setCurrentBranch] = useState(null)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)
//   const [branchToDelete, setBranchToDelete] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [successMessage, setSuccessMessage] = useState("")

//   // Fetch branches on component mount
//   useEffect(() => {
//     fetchBranches()
//   }, [])

//   // Fetch all branches from API
//   const fetchBranches = async () => {
//     setLoading(true)
//     setError("")

//     try {
//       const response = await api.get("/branch")
//       console.log("Fetched branches:", response.data)
//       setBranches(response.data)
//     } catch (error) {
//       console.error("Error fetching branches:", error)
//       setError("Failed to load branches. Please refresh the page and try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredBranches = branches.filter(
//     (branch) =>
//       branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       branch.address.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const handleAddClick = () => {
//     setCurrentBranch(null)
//     setShowModal(true)
//   }

//   const handleEditClick = (branch) => {
//     setCurrentBranch(branch)
//     setShowModal(true)
//   }

//   const handleDeleteClick = (branch) => {
//     setBranchToDelete(branch)
//     setShowDeleteModal(true)
//   }

//   // Handle save branch (create or update)
//   const handleSaveBranch = async (formData) => {
//     try {
//       let response

//       if (currentBranch) {
//         // Update existing branch
//         response = await axios.put(
//           `https://crm.jagalikoota.com/api/v1/hotel/branch/${currentBranch._id}`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//             timeout: 30000,
//           },
//         )
//         setBranches(branches.map((branch) => (branch._id === currentBranch._id ? response.data : branch)))
//         setSuccessMessage(`Branch "${response.data.name}" updated successfully`)
//       } else {
//         // Create new branch
//         response = await axios.post("https://crm.jagalikoota.com/api/v1/hotel/branch", formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           timeout: 30000,
//         })
//         setBranches([...branches, response.data])
//         setSuccessMessage(`Branch "${response.data.name}" created successfully`)
//       }

//       // Auto-hide success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("")
//       }, 3000)

//       return true
//     } catch (error) {
//       console.error("Error saving branch:", error)

//       let errorMessage = "Failed to save branch"
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message
//       } else if (error.message) {
//         errorMessage = error.message
//       }

//       throw new Error(errorMessage)
//     }
//   }

//   // Handle delete branch
//   const handleDeleteBranch = async (branchId) => {
//     try {
//       await api.delete(`/branch/${branchId}`)
//       setBranches(branches.filter((branch) => branch._id !== branchId))
//       setSuccessMessage("Branch deleted successfully")

//       setTimeout(() => {
//         setSuccessMessage("")
//       }, 3000)

//       return true
//     } catch (error) {
//       console.error("Error deleting branch:", error)
//       throw new Error(error.response?.data?.message || "Failed to delete branch")
//     }
//   }

//   return (
//     <div className="branches-page">
//       {/* Success message */}
//       {successMessage && (
//         <div className="success-message">
//           <Check size={16} />
//           <span>{successMessage}</span>
//           <button onClick={() => setSuccessMessage("")}>
//             <span>�</span>
//           </button>
//         </div>
//       )}

//       <div className="page-header">
//         <h1>Branches</h1>
//         <div className="header-actions">
//           <button className="btn btn-primary" onClick={handleAddClick}>
//             <Plus size={16} />
//             <span>Add Branch</span>
//           </button>
//         </div>
//       </div>

//       <div className="filters-bar">
//         <div className="search-container">
//           <Search size={18} className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search branches by name or address..."
//             className="search-input"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Error message */}
//       {error && (
//         <div className="error-container">
//           <AlertCircle size={18} />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Loading state */}
//       {loading ? (
//         <div className="loading-container">
//           <p>Loading branches...</p>
//         </div>
//       ) : (
//         <div className="grid-container">
//           {filteredBranches.length > 0 ? (
//             filteredBranches.map((branch) => {
//               return (
//                 <div key={branch._id} className="grid-item">
//                   {/* Branch Image */}
//                   <div className="grid-item-image-container">
//                     {(() => {
//                       const imageUrl = (branch.image)

//                       console.log(`Branch ${branch.name} image URL:`, imageUrl)

//                       if (!imageUrl) {
//                         return (
//                           <div className="category-image-placeholder">
//                             <MapPin size={24} />
//                             <span>No Image</span>
//                           </div>
//                         )
//                       }

//                       return (
//                         <>
//                           <img
//                             src={imageUrl || "/placeholder.svg"}
//                             alt={branch.name}
//                             className="grid-item-image"
//                             onLoad={() => console.log(`Image loaded successfully: ${imageUrl}`)}
//                             onError={(e) => {
//                               console.error(`Image failed to load: ${imageUrl}`)
//                               e.target.style.display = "none"
//                               if (e.target.nextSibling) {
//                                 e.target.nextSibling.style.display = "flex"
//                               }
//                             }}
//                           />
//                           <div className="category-image-placeholder">
//                             <ImageIcon size={24} />
//                             <span>Image failed to load</span>
//                           </div>
//                         </>
//                       )
//                     })()}
//                   </div>

//                   <div className="grid-item-content">
//                     <h3 className="grid-item-title">{branch.name}</h3>
//                     <div className="address-container">
//                       <MapPin size={16} />
//                       <p className="grid-item-subtitle">
//                         {branch.address}
//                       </p>
//                     </div>
//                     <div className="grid-item-footer">
//                       <div className="grid-item-actions">
//                         <button className="action-btn edit" onClick={() => handleEditClick(branch)}>
//                           <Edit size={14} />
//                         </button>
//                         <button className="action-btn delete" onClick={() => handleDeleteClick(branch)}>
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })
//           ) : (
//             <div className="empty-state">
//               <p>
//                 No branches found. {searchQuery ? "Try a different search term." : "Add a new branch to get started."}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {showModal && (
//         <BranchModal branch={currentBranch} onClose={() => setShowModal(false)} onSave={handleSaveBranch} />
//       )}

//       {showDeleteModal && (
//         <DeleteConfirmationModal
//           branch={branchToDelete}
//           onClose={() => setShowDeleteModal(false)}
//           onConfirm={handleDeleteBranch}
//         />
//       )}

//       <style jsx>{`
//         /* Global Styles */
//         * {
//           box-sizing: border-box;
//         }

//         .branches-page {
//           padding: 20px;
//           max-width: 1200px;
//           margin: 0 auto;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
//           color: #333;
//         }

//         /* Header Styles */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 24px;
//           padding-bottom: 16px;
//           border-bottom: 1px solid #e5e7eb;
//         }

//         .page-header h1 {
//           font-size: 24px;
//           font-weight: 700;
//           color: #1f2937;
//         }

//         /* Button Styles */
//         .btn {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           padding: 8px 16px;
//           border-radius: 6px;
//           font-weight: 500;
//           font-size: 14px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           border: 1px solid transparent;
//           gap: 8px;
//         }

//         .btn-primary {
//           background-color: #3b82f6;
//           color: white;
//           border-color: #3b82f6;
//         }

//         .btn-primary:hover {
//           background-color: #2563eb;
//           border-color: #2563eb;
//         }

//         .btn-outline {
//           background-color: transparent;
//           color: #6b7280;
//           border-color: #d1d5db;
//         }

//         .btn-outline:hover {
//           background-color: #f9fafb;
//           color: #374151;
//         }

//         .btn-danger {
//           background-color: #ef4444;
//           color: white;
//           border-color: #ef4444;
//         }

//         .btn-danger:hover {
//           background-color: #dc2626;
//           border-color: #dc2626;
//         }

//         .btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         /* Search Bar */
//         .filters-bar {
//           margin-bottom: 24px;
//         }

//         .search-container {
//           position: relative;
//           max-width: 400px;
//         }

//         .search-icon {
//           position: absolute;
//           left: 12px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #9ca3af;
//         }

//         .search-input {
//           width: 100%;
//           padding: 10px 16px 10px 40px;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 14px;
//           transition: border-color 0.2s ease;
//         }

//         .search-input:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         /* Messages */
//         .success-message {
//           display: flex;
//           align-items: center;
//           padding: 12px 16px;
//           margin-bottom: 20px;
//           background-color: #ecfdf5;
//           color: #065f46;
//           border-radius: 6px;
//           font-size: 14px;
//           gap: 8px;
//         }

//         .success-message button {
//           margin-left: auto;
//           background: none;
//           border: none;
//           cursor: pointer;
//           font-size: 18px;
//           color: #065f46;
//         }

//         .error-container {
//           display: flex;
//           align-items: center;
//           padding: 12px 16px;
//           margin: 20px 0;
//           background-color: #fef2f2;
//           color: #dc2626;
//           border-radius: 6px;
//           gap: 8px;
//         }

//         .error-message {
//           display: flex;
//           align-items: center;
//           margin-bottom: 15px;
//           color: #dc2626;
//           gap: 8px;
//           font-size: 14px;
//         }

//         /* Grid Layout */
//         .grid-container {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//           gap: 24px;
//         }

//         .grid-item {
//           background: white;
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           transition: transform 0.2s ease, box-shadow 0.2s ease;
//         }

//         .grid-item:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//         }

//         .grid-item-image-container {
//           position: relative;
//           height: 200px;
//           overflow: hidden;
//         }

//         .grid-item-image {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .category-image-placeholder {
//           display: flex;
//           width: 100%;
//           height: 100%;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           background-color: #f3f4f6;
//           color: #9ca3af;
//         }

//         .grid-item-content {
//           padding: 16px;
//         }

//         .grid-item-title {
//           font-size: 18px;
//           font-weight: 600;
//           margin-bottom: 8px;
//           color: #1f2937;
//         }

//         .address-container {
//           display: flex;
//           align-items: flex-start;
//           margin-bottom: 8px;
//           gap: 8px;
//         }

//         .grid-item-subtitle {
//           line-height: 1.4;
//           color: #6b7280;
//           font-size: 14px;
//         }

//         .grid-item-footer {
//           display: flex;
//           justify-content: flex-end;
//           margin-top: 16px;
//         }

//         .grid-item-actions {
//           display: flex;
//           gap: 8px;
//         }

//         .action-btn {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 32px;
//           height: 32px;
//           border-radius: 6px;
//           border: none;
//           cursor: pointer;
//           transition: background-color 0.2s ease;
//         }

//         .action-btn.edit {
//           background-color: #eff6ff;
//           color: #3b82f6;
//         }

//         .action-btn.edit:hover {
//           background-color: #dbeafe;
//         }

//         .action-btn.delete {
//           background-color: #fef2f2;
//           color: #ef4444;
//         }

//         .action-btn.delete:hover {
//           background-color: #fee2e2;
//         }

//         /* Loading and Empty States */
//         .loading-container, .empty-state {
//           text-align: center;
//           padding: 40px 0;
//           grid-column: 1 / -1;
//         }

//         .empty-state p {
//           color: #6b7280;
//         }

//         /* Modal Styles */
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-color: rgba(0, 0, 0, 0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//           padding: 20px;
//         }

//         .modal {
//           background: white;
//           border-radius: 8px;
//           width: 100%;
//           max-width: 500px;
//           max-height: 90vh;
//           overflow-y: auto;
//           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
//         }

//         .delete-modal {
//           max-width: 400px;
//         }

//         .modal-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 16px 20px;
//           border-bottom: 1px solid #e5e7eb;
//         }

//         .modal-title {
//           font-size: 18px;
//           font-weight: 600;
//           color: #1f2937;
//         }

//         .modal-close {
//           background: none;
//           border: none;
//           font-size: 24px;
//           cursor: pointer;
//           color: #6b7280;
//         }

//         .modal-close:hover {
//           color: #374151;
//         }

//         .modal-body {
//           padding: 20px;
//         }

//         .modal-footer {
//           display: flex;
//           justify-content: flex-end;
//           gap: 12px;
//           padding: 16px 20px;
//           border-top: 1px solid #e5e7eb;
//         }

//         /* Form Styles */
//         .form-group {
//           margin-bottom: 20px;
//         }

//         .form-label {
//           display: block;
//           margin-bottom: 6px;
//           font-weight: 500;
//           color: #374151;
//         }

//         .form-input, .form-textarea {
//           width: 100%;
//           padding: 10px 12px;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           font-size: 14px;
//           transition: border-color 0.2s ease;
//         }

//         .form-input:focus, .form-textarea:focus {
//           outline: none;
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         }

//         .form-textarea {
//           min-height: 100px;
//           resize: vertical;
//         }

//         /* Image Upload Styles */
//         .image-upload-container {
//           margin-bottom: 16px;
//         }

//         .image-upload-label {
//           display: block;
//           cursor: pointer;
//         }

//         .image-upload-placeholder {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           border: 2px dashed #d1d5db;
//           border-radius: 6px;
//           padding: 24px;
//           text-align: center;
//           transition: border-color 0.2s ease;
//         }

//         .image-upload-placeholder:hover {
//           border-color: #9ca3af;
//         }

//         .image-upload-placeholder small {
//           color: #6b7280;
//           margin-top: 4px;
//         }

//         .image-upload-input {
//           display: none;
//         }

//         .image-preview-wrapper {
//           position: relative;
//           border-radius: 6px;
//           overflow: hidden;
//         }

//         .image-preview {
//           width: 100%;
//           height: 150px;
//           object-fit: cover;
//           border-radius: 6px;
//         }

//         .image-overlay {
//           position: absolute;
//           top: 8px;
//           right: 8px;
//         }

//         .remove-image-btn {
//           background: rgba(220, 38, 38, 0.8);
//           border: none;
//           border-radius: 50%;
//           width: 32px;
//           height: 32px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           color: white;
//         }

//         .remove-image-btn:hover {
//           background: rgba(220, 38, 38, 1);
//         }

//         /* Warning Text */
//         .warning-text {
//           color: #dc2626;
//           margin-top: 10px;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default Branches

import React, { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

// API Base URL - use environment variable or default to localhost
// Handle both cases: with or without /api/v1 in the base URL
let API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "");
// If API_BASE_URL already includes /api/v1, use it as is, otherwise add it
const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
  ? `${API_BASE_URL}/hotel`
  : `${API_BASE_URL}/api/v1/hotel`;
// For uploads, we need the base without /api/v1
const UPLOADS_BASE_URL = API_BASE_URL.includes("/api/v1")
  ? API_BASE_URL.replace("/api/v1", "")
  : API_BASE_URL;

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(""); // For branch selection dropdown
  const [allBranchesForDropdown, setAllBranchesForDropdown] = useState([]); // All branches (including Restaurant Profile) for dropdown
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    image: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch branches from Branch Management
      const branchResponse = await fetch(`${HOTEL_API_BASE}/branch`);
      let branchesData = [];
      if (branchResponse.ok) {
        branchesData = await branchResponse.json();
        // Ensure it's an array
        branchesData = Array.isArray(branchesData) ? branchesData : [];
      }

      // Fetch restaurants from Restaurant Profile (with all=true to get all restaurants, not just paginated)
      const restaurantUrl = `${HOTEL_API_BASE}/getAllRestaurants?all=true`;
      console.log("Fetching restaurants from:", restaurantUrl);
      const restaurantResponse = await fetch(restaurantUrl);
      let restaurantsData = [];
      if (restaurantResponse.ok) {
        const restaurantResult = await restaurantResponse.json();
        console.log("Restaurant API Response:", restaurantResult);
        console.log("Response structure:", {
          success: restaurantResult.success,
          hasData: !!restaurantResult.data,
          dataIsArray: Array.isArray(restaurantResult.data),
          dataLength: restaurantResult.data?.length,
          isArray: Array.isArray(restaurantResult),
        });

        if (restaurantResult.success && restaurantResult.data) {
          restaurantsData = Array.isArray(restaurantResult.data)
            ? restaurantResult.data
            : [];
        } else if (Array.isArray(restaurantResult)) {
          // Fallback: if response is directly an array
          restaurantsData = restaurantResult;
        } else if (
          restaurantResult.data &&
          Array.isArray(restaurantResult.data)
        ) {
          // Another fallback
          restaurantsData = restaurantResult.data;
        }
        console.log(
          "Parsed restaurantsData:",
          restaurantsData.length,
          restaurantsData
        );
      } else {
        const errorText = await restaurantResponse.text();
        console.warn(
          "Failed to fetch restaurants:",
          restaurantResponse.status,
          restaurantResponse.statusText,
          errorText
        );
      }

      // Convert restaurants to branch format
      const convertedRestaurants = restaurantsData.map((restaurant, index) => {
        console.log(`Converting restaurant ${index + 1}:`, {
          _id: restaurant._id,
          branchName: restaurant.branchName,
          restaurantName: restaurant.restaurantName,
          address: restaurant.address,
          gstNumber: restaurant.gstNumber,
        });

        // Combine address fields into a single address string
        const addressParts = [];
        if (restaurant.address?.street)
          addressParts.push(restaurant.address.street);
        if (restaurant.address?.city)
          addressParts.push(restaurant.address.city);
        if (restaurant.address?.state)
          addressParts.push(restaurant.address.state);
        if (restaurant.address?.country)
          addressParts.push(restaurant.address.country);
        const fullAddress = addressParts.join(", ");

        const converted = {
          _id: restaurant._id,
          name:
            restaurant.branchName ||
            restaurant.restaurantName ||
            "Unnamed Branch",
          address:
            fullAddress ||
            (typeof restaurant.address === "string"
              ? restaurant.address
              : "") ||
            "",
          image: restaurant.image || null,
          source: "restaurant", // Mark as coming from restaurant profile
          gstNumber: restaurant.gstNumber || "",
          contact: restaurant.contact || {},
        };

        console.log(`Converted restaurant ${index + 1}:`, converted);
        return converted;
      });

      // Simply combine all branches from both sources
      // Show ALL branches from Branch Management
      // Show ALL restaurants from Restaurant Profile
      const allBranches = [...branchesData, ...convertedRestaurants];

      // Check for duplicate IDs (shouldn't happen, but just in case)
      const uniqueBranches = [];
      const seenIds = new Set();
      for (const branch of allBranches) {
        if (!seenIds.has(branch._id)) {
          seenIds.add(branch._id);
          uniqueBranches.push(branch);
        } else {
          console.warn(
            `Duplicate branch ID found: ${branch._id} (${branch.name})`
          );
        }
      }

      console.log(
        "Branches from Branch Management:",
        branchesData.length,
        branchesData
      );
      console.log(
        "Restaurants from Restaurant Profile:",
        restaurantsData.length,
        restaurantsData
      );
      console.log(
        "Converted restaurants:",
        convertedRestaurants.length,
        convertedRestaurants
      );
      console.log(
        "All branches merged (total):",
        allBranches.length,
        allBranches
      );
      console.log(
        "Unique branches (after deduplication):",
        uniqueBranches.length,
        uniqueBranches
      );
      console.log(
        "Branch IDs:",
        uniqueBranches.map((b) => ({
          id: b._id,
          name: b.name,
          source: b.source,
        }))
      );

      // Store all branches (including Restaurant Profile) for dropdown selection
      setAllBranchesForDropdown(uniqueBranches);

      // Only show branches from Branch Management that match a Restaurant Profile branch
      // This filters out manually added branches that don't come from Restaurant Profile
      const restaurantProfileBranches = convertedRestaurants;
      const branchManagementBranches = uniqueBranches.filter((b) => {
        // Skip Restaurant Profile branches themselves
        if (b.source === "restaurant") return false;

        // Only show Branch Management branches that match a Restaurant Profile branch
        // Match by name and address to ensure it came from Restaurant Profile selection
        const matchesRestaurantProfile = restaurantProfileBranches.some(
          (rpBranch) =>
            rpBranch.name === b.name && rpBranch.address === b.address
        );

        return matchesRestaurantProfile;
      });

      console.log(
        "Displaying only branches from Restaurant Profile:",
        branchManagementBranches.length,
        branchManagementBranches
      );

      setBranches(branchManagementBranches);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle branch selection from dropdown - auto-fill address
  const handleBranchSelect = (branchId) => {
    // Search in all branches (including Restaurant Profile) for dropdown selection
    const selectedBranch = allBranchesForDropdown.find(
      (b) => b._id === branchId
    );
    if (selectedBranch) {
      setSelectedBranchId(branchId);
      setFormData({
        ...formData,
        name: selectedBranch.name,
        address: selectedBranch.address || "",
      });
      toast.success(
        `Branch "${selectedBranch.name}" selected. Address auto-filled.`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const filteredValue = value.replace(/[^a-zA-Z ]/g, "");
      setFormData({
        ...formData,
        [name]: filteredValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("?? Form submitted");
    console.log("Editing branch:", editingBranch);
    console.log("Form data:", formData);
    console.log("Selected branch ID:", selectedBranchId);
    
    // Validation: Branch selection and image are required ONLY for new branches
    if (!editingBranch) {
      if (!selectedBranchId) {
        console.error("? Validation failed: No branch selected");
        toast.error("Please select a branch from Restaurant Profile");
        return;
      }
      
      if (!formData.image) {
        console.error("? Validation failed: No image uploaded");
        toast.error("Please upload a branch image");
        return;
      }
    }

    if (!formData.name || !formData.address) {
      console.error("? Validation failed: Missing name or address");
      toast.error("Please ensure branch name and address are filled");
      return;
    }
    
    console.log("? Validation passed");
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("address", formData.address);
      
      // Only append image if a new one is selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
        console.log("?? New image attached:", formData.image.name);
      } else {
        console.log("?? No new image - keeping existing");
      }

      const url = editingBranch
        ? `${HOTEL_API_BASE}/branch/${editingBranch._id || editingBranch.id}`
        : `${HOTEL_API_BASE}/branch`;

      const method = editingBranch ? "PUT" : "POST";
      
      console.log("?? API Request:", { url, method, branchId: editingBranch?._id });
      
      toast.info(`${editingBranch ? 'Updating' : 'Creating'} branch...`);

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });
      
      console.log("?? Response:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("? Server error:", errorData);
        throw new Error(errorData.message || "Failed to save branch");
      }

      const result = await response.json();
      console.log("? Success:", result);
      
      toast.success(editingBranch ? "Branch updated successfully!" : "Branch added successfully!");
      
      setShowModal(false);
      setEditingBranch(null);
      setSelectedBranchId(""); // Reset selection
      setFormData({
        name: "",
        address: "",
        image: null,
      });

      // Refresh the data to show the newly added branch
      console.log("?? Refreshing data...");
      fetchData();
    } catch (err) {
      console.error("? Error:", err);
      setError(err.message);
      toast.error(`Failed: ${err.message}`);
    }
  };

  const handleEdit = (branch) => {
    console.log("?? Edit button clicked for branch:", branch);
    console.log("Branch ID:", branch._id);
    console.log("Branch name:", branch.name);
    console.log("Branch address:", branch.address);
    
    setEditingBranch(branch);
    setSelectedBranchId(""); // Reset selection when editing
    setFormData({
      name: branch.name,
      address: branch.address,
      image: null,
    });
    setShowModal(true);
    
    toast.info(`Editing branch: ${branch.name}`);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this branch? This will also delete all associated categories and products."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${HOTEL_API_BASE}/branch/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete branch");
      }

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setEditingBranch(null);
    setSelectedBranchId(""); // Reset selection when adding new branch
    setFormData({
      name: "",
      address: "",
      image: null,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-t-[#69231B] border-gray-200 rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl m-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg relative shadow-md"
      >
        <strong className="font-bold text-lg">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => setError(null)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        marginTop: "-24px",
        marginLeft: "-24px",
        marginRight: "0",
        paddingTop: 0,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-gray-100">
        {/* Enhanced Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F0E8E7]/20 via-[#FCFCFC]/30 to-white/50"></div>
          <div className="absolute top-0 left-0 right-0 h-[1000px] bg-gradient-to-b from-[#FCFCFC]0/10 to-transparent blur-lg"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#7a5a57] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#69231B] to-[#D1C9BC]">
                Branch Management
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Total Branches:{" "}
                <span className="font-semibold text-[#69231B]">
                  {branches.length}
                </span>
                {branches.length > 0 && (
                  <span className="ml-4">
                    (Added through Branch Management)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="mt-6 md:mt-0 bg-gradient-to-r from-[#69231B] to-[#D1C9BC] hover:from-[#7a2920] hover:to-[#D1C9BC] text-white font-semibold py-3 px-8 rounded-full flex items-center space-x-2 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Branch</span>
            </button>
          </motion.div>

          {/* Branches Grid - Only show branches added through Branch Management */}
          {branches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm border border-yellow-200 text-yellow-700 px-8 py-6 rounded-2xl shadow-lg text-center"
            >
              No branches found. Click "Add New Branch" to create your first
              branch.
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                style={{ width: "100%", overflow: "visible" }}
              >
                {branches.map((branch, index) => {
                  console.log(
                    `Rendering branch ${index + 1}/${branches.length}:`,
                    { id: branch._id, name: branch.name, source: branch.source }
                  );
                  return (
                    <motion.div
                      key={branch._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                      style={{ minHeight: "400px" }} // Ensure all cards are visible
                    >
                      <div className="relative">
                        {getImageUrl(branch.image) ? (
                          <img
                            src={getImageUrl(branch.image)}
                            alt={branch.name}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-64 flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F0EF] to-purple-100 ${
                            getImageUrl(branch.image) ? "hidden" : ""
                          }`}
                          style={{
                            display: getImageUrl(branch.image)
                              ? "none"
                              : "flex",
                          }}
                        >
                          <div className="text-[#69231B] text-6xl mb-2">
                            ??
                          </div>
                          <div className="text-[#7a2920] text-sm font-medium">
                            No Image
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-2xl font-bold text-white truncate drop-shadow-md">
                            {branch.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2"></div>
                        <div className="text-sm text-gray-600 mb-4">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-800">
                              Address:
                            </span>
                            <span>{branch.address}</span>
                          </div>
                          {branch.gstNumber && (
                            <div className="flex items-start gap-2 mt-2">
                              <span className="font-medium text-gray-800">
                                GST:
                              </span>
                              <span>{branch.gstNumber}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleEdit(branch)}
                            className="p-2 rounded-lg transition-colors duration-200 bg-[#F5F0EF] text-[#69231B] hover:bg-[#F0E8E7]"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleDelete(branch._id)}
                            className="p-2 rounded-lg transition-colors duration-200 bg-red-100 text-red-600 hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative mx-auto p-8 border w-11/12 md:w-2/3 lg:w-1/2 shadow-2xl rounded-2xl bg-white overflow-y-auto max-h-[90vh]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingBranch ? "Edit Branch" : "Add New Branch"}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowModal(false);
                      setSelectedBranchId(""); // Reset selection when closing modal
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Branch Selection Dropdown - Only show when adding (not editing) */}
                  {!editingBranch && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Existing Branch to Copy
                          {allBranchesForDropdown.length > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({allBranchesForDropdown.length} available)
                            </span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={fetchData}
                          className="text-[#69231B] hover:text-[#7a2920] text-sm flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Refresh
                        </button>
                      </div>
                      {allBranchesForDropdown.filter(
                        (branch) => branch.source === "restaurant"
                      ).length === 0 ? (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <p>
                            No branches found in Restaurant Profile. Please add
                            branches in Restaurant Profile first.
                          </p>
                        </div>
                      ) : (
                        <Select
                          value={selectedBranchId || ""}
                          onValueChange={handleBranchSelect}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a branch from Restaurant Profile *" />
                          </SelectTrigger>
                          <SelectContent>
                            {allBranchesForDropdown
                              .filter(
                                (branch) => branch.source === "restaurant"
                              ) // Only show Restaurant Profile branches
                              .map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.name}{" "}
                                  {branch.address
                                    ? `- ${branch.address.substring(0, 40)}...`
                                    : ""}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {selectedBranchId && (
                        <p className="text-sm text-green-600 mt-2">
                          ? Branch selected - Details auto-filled below. Please
                          upload an image to continue.
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      readOnly
                      className="block w-full rounded-lg border-gray-200 shadow-sm py-3 px-4 bg-gray-100 cursor-not-allowed"
                      placeholder="Select a branch to auto-fill"
                      required
                    />
                    {!selectedBranchId && !editingBranch && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please select a branch from the dropdown above
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      readOnly
                      className="block w-full rounded-lg border-gray-200 shadow-sm py-3 px-4 bg-gray-100 cursor-not-allowed min-h-[120px]"
                      placeholder="Select a branch to auto-fill"
                      required
                    />
                    {!selectedBranchId && !editingBranch && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please select a branch from the dropdown above
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Image {editingBranch ? "(Optional - leave empty to keep current image)" : "*"}
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="block w-full text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FCFCFC] file:text-[#69231B] hover:file:bg-[#F5F0EF] transition-all duration-200"
                    accept="image/*"
                    required={!editingBranch}
                  />
                  {editingBranch && !formData.image && (
                    <p className="text-xs text-blue-600 mt-1">Current image will be kept if you don't upload a new one</p>
                  )}
                  {!editingBranch && !formData.image && (
                    <p className="text-xs text-amber-600 mt-1">Please upload a branch image</p>
                  )}
                  {formData.image && (
                    <p className="text-xs text-green-600 mt-1">? New image selected: {formData.image.name}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedBranchId(""); // Reset selection when canceling
                    }}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-[#69231B] to-[#D1C9BC] text-white rounded-lg hover:from-[#7a2920] hover:to-[#D1C9BC] shadow-md transition-all duration-200 font-medium"
                  >
                    {editingBranch ? "Update" : "Add"} Branch
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Clean up the path to remove any leading/trailing slashes and normalize separators
  let cleanPath = imagePath.toString().trim().replace(/\\/g, "/");

  // Extract the filename from the path
  const parts = cleanPath.split("/");
  const filename = parts[parts.length - 1];

  // Handle various path formats
  if (
    cleanPath.includes("uploads/branch/") ||
    cleanPath.includes("/opt/render/project/src/uploads/")
  ) {
    // Use /uploads/branch/ for local serving (common Express static configuration)
    return `${UPLOADS_BASE_URL}/uploads/branch/${filename}`;
  }

  // If it starts with uploads/, use it directly without /api/v1 prefix
  if (cleanPath.startsWith("uploads/")) {
    return `${UPLOADS_BASE_URL}/${cleanPath}`;
  }

  // If it's just a filename, assume it's in uploads/branch/
  return `${UPLOADS_BASE_URL}/uploads/branch/${filename}`;
};

export default BranchManagement;
