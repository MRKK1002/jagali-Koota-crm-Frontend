import React, { useState, useEffect } from "react";
import {
  User,
  Building,
  DollarSign,
  Search,
  Plus,
  UserCheck,
  Calendar,
  Edit,
  Trash2,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  AlertCircle,
  Save,
  Camera,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import FaceCapture from "./FaceCapture";

const EmployeeRegistrationForm = () => {
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    empId: "Auto-generated",
    designation: "",
    department: "",
    dateOfJoining: "",
    phoneNumber: "", // NEW
    email: "", // NEW
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    basicSalary: "",
    salaryType: "fixed",
    hra: "",
    conveyance: "",
    medicalAllowance: "",
    specialAllowance: "",
    pf: "",
    professionalTax: "",
    tds: "",
    otherDeductions: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [faceImage, setFaceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [selectedEmployeeForFace, setSelectedEmployeeForFace] = useState(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaceImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle face capture from webcam
  const handleFaceCapture = (file, preview, faceDescriptor) => {
    setFaceImage(file);
    setImagePreview(preview);
    setShowFaceCapture(false);

    if (faceDescriptor) {
      setFormData((prev) => ({ ...prev, faceDescriptor }));
    }

    if (errors.faceImage) {
      setErrors((prev) => ({ ...prev, faceImage: "" }));
    }
  };

  // Clear image
  const clearImage = () => {
    setFaceImage(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, faceDescriptor: null }));
    if (document.getElementById("faceImage")) {
      document.getElementById("faceImage").value = "";
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === "ascending" ? "asc" : "desc",
      };
      
      // Add branch filter if selected
      if (selectedBranchFilter) {
        params.branch = selectedBranchFilter;
      }
      
      const response = await apiService.getEmployees(params);

      if (response.success) {
        setEmployees(response.employees);
        setTotalPages(response.totalPages);
        setTotalEmployees(response.total);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setNotification({
        message: error.message || "Failed to fetch employees",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches on component mount
  const fetchBranches = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
      const response = await fetch(`${API_BASE_URL}/hotel/getAllRestaurants`);
      const data = await response.json();
      const branchList = Array.isArray(data) ? data : (data.data || data.hotels || []);
      setBranches(branchList);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  // Fetch departments dynamically
  const fetchDepartments = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
      const response = await fetch(`${API_BASE_URL}/hotel/departments`);
      const data = await response.json();
      setDepartments(data.data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
    fetchDepartments();
  }, [currentPage, itemsPerPage, searchQuery, sortConfig, selectedBranchFilter]);

  // Open modal for adding new employee
  const openModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setEditingEmployeeId(null);
    setFormData({
      name: "",
      empId: "Auto-generated",
      designation: "",
      department: "",
      dateOfJoining: "",
      phoneNumber: "", // NEW
      email: "", // NEW
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      branch: "",
      basicSalary: "",
      salaryType: "fixed",
      hra: "",
      conveyance: "",
      medicalAllowance: "",
      specialAllowance: "",
      pf: "",
      professionalTax: "",
      tds: "",
      otherDeductions: "",
      faceDescriptor: null,
    });

    setFaceImage(null);
    setImagePreview(null);
    setErrors({});
  };

  // Open modal for editing employee
  const openEditModal = async (employee) => {
    try {
      setLoading(true);
      const response = await apiService.getEmployee(employee._id);

      if (response.success) {
        setIsModalOpen(true);
        setIsEditing(true);
        setEditingEmployeeId(employee._id);

        const dateOfJoining = employee.dateOfJoining
          ? new Date(employee.dateOfJoining).toISOString().split("T")[0]
          : "";

        setFormData({
          name: employee.name || "",
          empId: employee.empId || "Auto-generated",
          designation: employee.designation || "",
          department: employee.department || "",
          dateOfJoining: dateOfJoining,
          phoneNumber: employee.phoneNumber || "", // NEW
          email: employee.email || "", // NEW
          bankName: employee.bankName || "",
          accountNumber: employee.accountNumber || "",
          ifscCode: employee.ifscCode || "",
          branch: employee.branch || "",
          basicSalary: employee.basicSalary?.toString() || "",
          salaryType: employee.salaryType || "fixed",
          hra: employee.hra?.toString() || "",
          conveyance: employee.conveyance?.toString() || "",
          medicalAllowance: employee.medicalAllowance?.toString() || "",
          specialAllowance: employee.specialAllowance?.toString() || "",
          pf: employee.pf?.toString() || "",
          professionalTax: employee.professionalTax?.toString() || "",
          tds: employee.tds?.toString() || "",
          otherDeductions: employee.otherDeductions?.toString() || "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Failed to fetch employee details:", error);
      setNotification({
        message: error.message || "Failed to load employee details",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingEmployeeId(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "salaryType") {
      // When switching salary type, reset all salary fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        basicSalary: "",
        hra: "",
        conveyance: "",
        medicalAllowance: "",
        specialAllowance: "",
        pf: "",
        professionalTax: "",
        tds: "",
        otherDeductions: "",
      }));
    } else {
      const updatedFormData = { ...formData, [name]: value };

      // Auto-calculate PF and Professional Tax when salary components change
      if (formData.salaryType === "fixed" && 
          (name === "basicSalary" || name === "hra" || name === "conveyance" || 
           name === "medicalAllowance" || name === "specialAllowance")) {
        
        const basic = parseFloat(name === "basicSalary" ? value : formData.basicSalary) || 0;
        const hra = parseFloat(name === "hra" ? value : formData.hra) || 0;
        const conveyance = parseFloat(name === "conveyance" ? value : formData.conveyance) || 0;
        const medical = parseFloat(name === "medicalAllowance" ? value : formData.medicalAllowance) || 0;
        const special = parseFloat(name === "specialAllowance" ? value : formData.specialAllowance) || 0;
        
        // Calculate PF as 12% of basic salary
        const calculatedPF = (basic * 0.12).toFixed(2);
        updatedFormData.pf = calculatedPF;
        
        // Calculate gross salary
        const grossSalary = basic + hra + conveyance + medical + special;
        
        // Calculate Professional Tax based on gross salary
        const calculatedPT = grossSalary >= 25000 ? "200" : "0";
        updatedFormData.professionalTax = calculatedPT;
      }

      setFormData(updatedFormData);
    }

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of Joining is required";
    if (!formData.bankName.trim()) newErrors.bankName = "Bank Name is required";

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account Number is required";
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account Number must be 9-18 digits";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC Code is required";
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())
    ) {
      newErrors.ifscCode = "Invalid IFSC Code format (e.g., SBIN0001234)";
    }

    if (!formData.branch.trim()) newErrors.branch = "Branch is required";

    // Salary validations based on type
    if (!formData.basicSalary) {
      if (formData.salaryType === "fixed") {
        newErrors.basicSalary = "Basic Salary is required";
      } else if (formData.salaryType === "daily") {
        newErrors.basicSalary = "Daily Rate is required";
      } else if (formData.salaryType === "hourly") {
        newErrors.basicSalary = "Hourly Rate is required";
      }
    } else if (parseFloat(formData.basicSalary) <= 0) {
      if (formData.salaryType === "fixed") {
        newErrors.basicSalary = "Basic Salary must be greater than 0";
      } else if (formData.salaryType === "daily") {
        newErrors.basicSalary = "Daily Rate must be greater than 0";
      } else if (formData.salaryType === "hourly") {
        newErrors.basicSalary = "Hourly Rate must be greater than 0";
      }
    }

    // Face image validation - only required for new employees
    if (!faceImage && !isEditing) {
      newErrors.faceImage = "Face image is required for recognition";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate salaries based on salary type
  const calculateSalaries = () => {
    if (formData.salaryType === "fixed") {
      const basic = parseFloat(formData.basicSalary) || 0;
      const hra = parseFloat(formData.hra) || 0;
      const conveyance = parseFloat(formData.conveyance) || 0;
      const medical = parseFloat(formData.medicalAllowance) || 0;
      const special = parseFloat(formData.specialAllowance) || 0;
      const pf = parseFloat(formData.pf) || 0;
      const profTax = parseFloat(formData.professionalTax) || 0;
      const tds = parseFloat(formData.tds) || 0;
      const otherDed = parseFloat(formData.otherDeductions) || 0;

      const gross = basic + hra + conveyance + medical + special;
      const net = gross - (pf + profTax + tds + otherDed);

      return {
        grossSalary: gross.toFixed(2),
        netSalary: Math.max(0, net).toFixed(2),
      };
    } else {
      // For variable salary, show the rate as both gross and net
      const rate = parseFloat(formData.basicSalary) || 0;
      return {
        grossSalary: rate.toFixed(2),
        netSalary: rate.toFixed(2),
      };
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submission started:", {
      isEditing,
      editingEmployeeId,
      formData: {
        ...formData,
        faceDescriptor: formData.faceDescriptor ? "Present" : "Not present",
      },
      faceImage: faceImage ? "Present" : "Not present",
    });

    if (validateForm()) {
      try {
        setLoading(true);

        const formDataToSend = new FormData();

        // Append common employee data
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("empId", formData.empId);
        formDataToSend.append("designation", formData.designation.trim());
        formDataToSend.append("department", formData.department.trim());
        formDataToSend.append("dateOfJoining", formData.dateOfJoining);
        formDataToSend.append("phoneNumber", formData.phoneNumber.trim()); // NEW
        formDataToSend.append("email", formData.email.trim().toLowerCase());
        formDataToSend.append("bankName", formData.bankName.trim());
        formDataToSend.append("accountNumber", formData.accountNumber.trim());
        formDataToSend.append("ifscCode", formData.ifscCode.trim());
        formDataToSend.append("branch", formData.branch.trim());
        formDataToSend.append("basicSalary", formData.basicSalary.toString());
        formDataToSend.append("salaryType", formData.salaryType);

        // Handle allowances and deductions based on salary type
        if (formData.salaryType === "fixed") {
          formDataToSend.append("hra", (formData.hra || 0).toString());
          formDataToSend.append(
            "conveyance",
            (formData.conveyance || 0).toString()
          );
          formDataToSend.append(
            "medicalAllowance",
            (formData.medicalAllowance || 0).toString()
          );
          formDataToSend.append(
            "specialAllowance",
            (formData.specialAllowance || 0).toString()
          );
          formDataToSend.append("pf", (formData.pf || 0).toString());
          formDataToSend.append(
            "professionalTax",
            (formData.professionalTax || 0).toString()
          );
          formDataToSend.append("tds", (formData.tds || 0).toString());
          formDataToSend.append(
            "otherDeductions",
            (formData.otherDeductions || 0).toString()
          );
        } else {
          // For daily/hourly rates, set all allowances and deductions to 0
          formDataToSend.append("hra", "0");
          formDataToSend.append("conveyance", "0");
          formDataToSend.append("medicalAllowance", "0");
          formDataToSend.append("specialAllowance", "0");
          formDataToSend.append("pf", "0");
          formDataToSend.append("professionalTax", "0");
          formDataToSend.append("tds", "0");
          formDataToSend.append("otherDeductions", "0");
        }

        // Append face image and embedding
        if (faceImage) {
          formDataToSend.append("faceImage", faceImage);
        }

        if (formData.faceDescriptor) {
          formDataToSend.append(
            "faceEmbedding",
            JSON.stringify(formData.faceDescriptor)
          );
        }

        console.log("FormData contents:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key, typeof value === "object" ? "File object" : value);
        }

        let response;
        if (isEditing && editingEmployeeId) {
          console.log("Updating employee:", editingEmployeeId);
          response = await apiService.updateEmployeeWithImage(
            editingEmployeeId,
            formDataToSend
          );
        } else {
          console.log("Creating new employee");
          response = await apiService.createEmployeeWithImage(formDataToSend);
        }

        if (response.success) {
          setNotification({
            message: `Employee ${
              isEditing ? "updated" : "registered"
            } successfully!`,
            type: "success",
          });
          closeModal();
          fetchEmployees();
        }
      } catch (error) {
        console.error("Form submission error:", error);
        setNotification({
          message:
            error.message ||
            `Failed to ${isEditing ? "update" : "register"} employee`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    } else {
      setNotification({
        message: "Please fix the errors in the form before submitting.",
        type: "error",
      });
    }

    setTimeout(() => setNotification({ message: "", type: "" }), 4000);
  };

  // Cancel form
  const cancelForm = () => {
    closeModal();
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort employees
  const sortedEmployees = React.useMemo(() => {
    let sortableItems = [...employees];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [employees, sortConfig]);

  // Mask account number
  const maskAccountNumber = (accNo) => {
    if (!accNo) return "";
    const len = accNo.length;
    return len > 4 ? "*".repeat(len - 4) + accNo.slice(-4) : accNo;
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        setLoading(true);
        const response = await apiService.deleteEmployee(id);

        if (response.success) {
          setNotification({
            message: "Employee deleted successfully!",
            type: "success",
          });
          fetchEmployees();
        }
      } catch (error) {
        setNotification({
          message: error.message || "Failed to delete employee",
          type: "error",
        });
      } finally {
        setLoading(false);
      }

      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    }
  };

  const { grossSalary, netSalary } = calculateSalaries();

  // Calculate estimates for daily/hourly rates
  const calculateMonthlyEstimate = () => {
    const rate = parseFloat(formData.basicSalary) || 0;
    if (formData.salaryType === "daily") {
      return (rate * 26).toFixed(2); // Assuming 26 working days
    } else if (formData.salaryType === "hourly") {
      return (rate * 8 * 26).toFixed(2); // Assuming 8 hours/day, 26 days
    }
    return "0";
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees;

  // Go to first page
  const goToFirstPage = () => setCurrentPage(1);

  // Go to last page
  const goToLastPage = () => setCurrentPage(totalPages);

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Employee Management System
          </h1>
          <p className="text-gray-600">
            Streamline your employee registration and management
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={openModal}
              disabled={loading}
              className="px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2 text-white shadow-md disabled:opacity-50"
              style={{ backgroundColor: "#69231B" }}
            >
              {loading ? (
                <Loader size={18} className="animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Register Employee</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.message && (
          <div
            className={`mb-6 p-4 rounded-lg shadow-md ${
              notification.type === "success"
                ? "bg-green-100 border border-green-300 text-green-800"
                : "bg-red-100 border border-red-300 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <UserCheck className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}

        {/* Registration/Edit Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 flex justify-between items-center" style={{ backgroundColor: "#69231B" }}>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  {isEditing ? "Edit Employee" : "Employee Registration Form"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-[#69231B]" />
                    <h3 className="text-xl font-semibold text-gray-800">
                      Basic Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.name
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="empId"
                        value={formData.empId}
                        readOnly
                        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    {/* NEW: Phone Number Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                        placeholder="Enter phone number"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* NEW: Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.designation
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="e.g., Software Engineer"
                      />
                      {errors.designation && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.designation}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Joining <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.dateOfJoining
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.dateOfJoining && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.dateOfJoining}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Face Image Capture */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-[#69231B]" />
                    <h3 className="text-xl font-semibold text-gray-800">
                      Face Image for Recognition
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Face Image{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        id="faceImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.faceImage
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.faceImage && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.faceImage}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Upload a clear front-facing photo for face recognition
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowFaceCapture(true)}
                        disabled={loading}
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture from Camera
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Preview
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview}
                              alt="Face preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <User className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">No image selected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="w-5 h-5 text-[#69231B]" />
                    <h3 className="text-xl font-semibold text-gray-800">
                      Bank Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.bankName
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="e.g., State Bank of India"
                      />
                      {errors.bankName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.bankName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.accountNumber
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="Enter account number (9-18 digits)"
                      />
                      {errors.accountNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.accountNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.ifscCode
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="e.g., SBIN0001234"
                        style={{ textTransform: "uppercase" }}
                      />
                      {errors.ifscCode && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ifscCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        disabled={loading}
                        className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                          errors.branch
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-[#69231B]"
                        } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch.branchName || branch.restaurantName}>
                            {branch.branchName || branch.restaurantName}
                          </option>
                        ))}
                      </select>
                      {errors.branch && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.branch}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Salary Type */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Salary Type
                  </h3>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="salaryType"
                        value="fixed"
                        checked={formData.salaryType === "fixed"}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-4 h-4 text-[#69231B]"
                      />
                      <span className="text-gray-700">Fixed Salary</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="salaryType"
                        value="daily"
                        checked={formData.salaryType === "daily"}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-4 h-4 text-[#69231B]"
                      />
                      <span className="text-gray-700">Daily Rate</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="salaryType"
                        value="hourly"
                        checked={formData.salaryType === "hourly"}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-4 h-4 text-[#69231B]"
                      />
                      <span className="text-gray-700">Hourly Rate</span>
                    </label>
                  </div>
                </div>

                {/* Salary Inputs - Conditional Rendering */}
                {formData.salaryType === "fixed" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Earnings for Fixed Salary */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <DollarSign className="w-5 h-5 text-[#69231B]" />
                        <h3 className="text-xl font-semibold text-gray-800">
                          Earnings
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Basic Salary <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="basicSalary"
                            value={formData.basicSalary}
                            onChange={handleChange}
                            disabled={loading}
                            className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                              errors.basicSalary
                                ? "border-red-300 focus:border-red-500"
                                : "border-gray-200 focus:border-[#69231B]"
                            } ${
                              loading ? "bg-gray-100 cursor-not-allowed" : ""
                            }`}
                            min="0"
                            step="0.01"
                            placeholder="Enter basic salary"
                          />
                          {errors.basicSalary && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.basicSalary}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            House Rent Allowance (HRA)
                          </label>
                          <input
                            type="number"
                            name="hra"
                            value={formData.hra}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter HRA amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Conveyance Allowance
                          </label>
                          <input
                            type="number"
                            name="conveyance"
                            value={formData.conveyance}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter conveyance amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medical Allowance
                          </label>
                          <input
                            type="number"
                            name="medicalAllowance"
                            value={formData.medicalAllowance}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter medical allowance"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Special Allowance
                          </label>
                          <input
                            type="number"
                            name="specialAllowance"
                            value={formData.specialAllowance}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter special allowance"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gross Salary
                          </label>
                          <input
                            type="text"
                            value={`₹${grossSalary}`}
                            readOnly
                            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-orange-50 text-orange-700 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deductions for Fixed Salary */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <DollarSign className="w-5 h-5 text-[#69231B]" />
                        <h3 className="text-xl font-semibold text-gray-800">
                          Deductions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provident Fund (PF) <span className="text-xs text-gray-500">(12% of Basic)</span>
                          </label>
                          <input
                            type="text"
                            name="pf"
                            value={formData.pf ? `₹${formData.pf}` : "₹0.00"}
                            readOnly
                            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-calculated as 12% of basic salary</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Professional Tax <span className="text-xs text-gray-500">(Auto-calculated)</span>
                          </label>
                          <input
                            type="text"
                            name="professionalTax"
                            value={formData.professionalTax ? `₹${formData.professionalTax}` : "₹0"}
                            readOnly
                            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            ₹0 if gross salary &lt; ₹25,000 | ₹200 if ≥ ₹25,000
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Deducted at Source (TDS)
                          </label>
                          <input
                            type="number"
                            name="tds"
                            value={formData.tds}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter TDS amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Deductions
                          </label>
                          <input
                            type="number"
                            name="otherDeductions"
                            value={formData.otherDeductions}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B]"
                            min="0"
                            step="0.01"
                            placeholder="Enter other deductions"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Net Salary
                          </label>
                          <input
                            type="text"
                            value={`₹${netSalary}`}
                            readOnly
                            className="w-full p-3 border-2 border-gray-200 rounded-lg bg-amber-50 text-amber-700 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Daily Rate Input */}
                {formData.salaryType === "daily" && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="w-5 h-5 text-[#69231B]" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Daily Rate
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Rate <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary}
                          onChange={handleChange}
                          disabled={loading}
                          className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                            errors.basicSalary
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-[#69231B]"
                          } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          min="0"
                          step="0.01"
                          placeholder="Enter daily rate"
                        />
                        {errors.basicSalary && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.basicSalary}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Amount paid per working day
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Monthly (26 days)
                        </label>
                        <input
                          type="text"
                          value={`₹${calculateMonthlyEstimate()}`}
                          readOnly
                          className="w-full p-3 border-2 border-gray-200 rounded-lg bg-blue-50 text-blue-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Hourly Rate Input */}
                {formData.salaryType === "hourly" && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="w-5 h-5 text-[#69231B]" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Hourly Rate
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary}
                          onChange={handleChange}
                          disabled={loading}
                          className={`w-full p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                            errors.basicSalary
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-[#69231B]"
                          } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          min="0"
                          step="0.01"
                          placeholder="Enter hourly rate"
                        />
                        {errors.basicSalary && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.basicSalary}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Amount paid per working hour
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Monthly (8hrs/day, 26 days)
                        </label>
                        <input
                          type="text"
                          value={`₹${calculateMonthlyEstimate()}`}
                          readOnly
                          className="w-full p-3 border-2 border-gray-200 rounded-lg bg-blue-50 text-blue-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex justify-center space-x-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    style={{ backgroundColor: "#69231B" }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#5c1e15"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#69231B"; }}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin mr-2" />
                        {isEditing ? "Updating..." : "Registering..."}
                      </>
                    ) : (
                      <>
                        {isEditing ? (
                          <>
                            <Save size={18} className="mr-2" />
                            Update Employee
                          </>
                        ) : (
                          "Register Employee"
                        )}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    disabled={loading}
                    className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 flex items-center disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Employee Directory
              </h2>
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 mr-2">Show</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    disabled={loading}
                    className="border border-gray-300 rounded-md p-1 text-sm disabled:opacity-50"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm text-gray-600 ml-2">entries</span>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Branch Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedBranchFilter}
                      onChange={(e) => setSelectedBranchFilter(e.target.value)}
                      disabled={loading}
                      className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B] disabled:opacity-50 appearance-none bg-white"
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch.branchName || branch.restaurantName}>
                          {branch.branchName || branch.restaurantName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={loading}
                      className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#69231B] w-64 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader
                  size={32}
                  className="animate-spin text-[#69231B] mx-auto mb-4"
                />
                <p className="text-gray-500">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No employees match your search criteria."
                    : "No employees registered yet. Start by adding your first employee!"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={openModal}
                    className="mt-4 px-6 py-2 bg-[#69231B] text-white rounded-lg hover:bg-[#5c1e15] transition-colors duration-200"
                  >
                    Add First Employee
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th
                          className="p-3 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Employee Name
                            {sortConfig.key === "name" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="p-3 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("empId")}
                        >
                          <div className="flex items-center">
                            ID
                            {sortConfig.key === "empId" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="p-3 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("designation")}
                        >
                          <div className="flex items-center">
                            Designation
                            {sortConfig.key === "designation" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">
                          Salary Type
                        </th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">
                          Bank Details
                        </th>
                        <th
                          className="p-3 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("netSalary")}
                        >
                          <div className="flex items-center">
                            Rate/Salary
                            {sortConfig.key === "netSalary" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employees.map((emp) => (
                        <tr key={emp._id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                                  <User className="w-5 h-5 text-[#69231B]" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {emp.name}
                                </div>
                                <div className="text-gray-500">
                                  Joined:{" "}
                                  {new Date(
                                    emp.dateOfJoining
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <span className="px-2 py-1 bg-orange-100 text-[#69231B] rounded-full text-xs font-medium">
                              {emp.empId}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            {emp.designation}
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                emp.salaryType === "fixed"
                                  ? "bg-green-100 text-green-800"
                                  : emp.salaryType === "daily"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {emp.salaryType === "fixed"
                                ? "Fixed"
                                : emp.salaryType === "daily"
                                ? "Daily"
                                : "Hourly"}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-700">
                            <div className="space-y-1">
                              <div className="font-medium">{emp.bankName}</div>
                              <div className="text-gray-500">
                                A/C: {maskAccountNumber(emp.accountNumber)}
                              </div>
                              <div className="text-gray-500">
                                IFSC: {emp.ifscCode}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <div className="font-bold text-[#69231B]">
                              {emp.salaryType === "fixed" ? "₹" : ""}
                              {emp.basicSalary?.toLocaleString()}
                              {emp.salaryType === "daily"
                                ? "/day"
                                : emp.salaryType === "hourly"
                                ? "/hour"
                                : "/month"}
                            </div>
                            {emp.salaryType === "fixed" && (
                              <div className="text-xs text-gray-500">
                                Basic Salary (before attendance)
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <div className="flex justify-center space-x-2">
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50"
                                onClick={() => openEditModal(emp)}
                                disabled={loading}
                                title="Edit Employee"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
                                onClick={() => {
                                  setSelectedEmployeeForFace(emp);
                                  setShowFaceCapture(true);
                                }}
                                disabled={loading}
                                title="Update Face Image"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                onClick={() => deleteEmployee(emp._id)}
                                disabled={loading}
                                title="Delete Employee"
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

                {/* Pagination Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-2 py-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700 mb-4 md:mb-0">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, totalEmployees)} of{" "}
                    {totalEmployees} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1 || loading}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1 || loading}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          disabled={loading}
                          className={`w-8 h-8 rounded-md text-sm ${
                            currentPage === pageNumber
                              ? "bg-[#69231B] text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          } disabled:opacity-50`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || loading}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages || loading}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Face Capture Modal */}
      {showFaceCapture && (
        <FaceCapture
          onCapture={handleFaceCapture}
          onClose={() => setShowFaceCapture(false)}
          employeeName={formData.name}
        />
      )}
    </div>
  );
};

export default EmployeeRegistrationForm;
