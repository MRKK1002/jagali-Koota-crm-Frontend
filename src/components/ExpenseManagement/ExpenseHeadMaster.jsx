"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  CheckCircle,
  XCircle,
  DollarSign,
  IndianRupee,
  FileText,
  Upload,
  Calendar,
  User,
  AlertCircle,
  Download,
  Filter,
  Send,
  Edit,
  Trash2,
  Settings,
  Type,
  TrendingUp,
  Clock,
  Users,
  Eye,
} from "lucide-react";

const ExpenseHeadMaster = () => {
  const [branch, setBranch] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClaimTypesModal, setShowClaimTypesModal] = useState(false);
  const [showExpenseTypesModal, setShowExpenseTypesModal] = useState(false);
  const [showExpenseDetailsModal, setShowExpenseDetailsModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isExpenseFilterVisible, setIsExpenseFilterVisible] = useState(false);
  const [isClaimFilterVisible, setIsClaimFilterVisible] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [claimTypes, setClaimTypes] = useState([]);
  const [newExpenseType, setNewExpenseType] = useState("");
  const [newClaimType, setNewClaimType] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    amount: "",
    person: "",
    branch: "",
    document: null,
    fileName: "",
  });
  const [editingClaim, setEditingClaim] = useState(null);
  const [claimForm, setClaimForm] = useState({
    type: "",
    amount: "",
    person: "",
    branch: "",
    document: null,
    fileName: "",
  });
  const [approvalAction, setApprovalAction] = useState("approve");
  const [reducedAmount, setReducedAmount] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [expenseFilter, setExpenseFilter] = useState({
    date: "",
    type: "",
    minAmount: "",
    maxAmount: "",
  });
  const [claimFilter, setClaimFilter] = useState({
    date: "",
    type: "",
    minAmount: "",
    maxAmount: "",
  });
  const [fileError, setFileError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [expenseImagePreview, setExpenseImagePreview] = useState(null);
  const [claimImagePreview, setClaimImagePreview] = useState(null);

  // Calculate summary metrics

  const fetchBranch = async () => {
    try {
      // Fetch branches from Restaurant Profile (same as RestaurantProfile.jsx)
      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com";
      const HOTEL_API_BASE = API_BASE_URL.includes("/api/v1")
        ? `${API_BASE_URL}/hotel`
        : `${API_BASE_URL}/api/v1/hotel`;

      const response = await axios.get(
        `${HOTEL_API_BASE}/getAllRestaurants?all=true`
      );

      console.log("ExpenseHeadMaster: Branches API response:", response.data);

      // Extract restaurants array from response (same structure as RestaurantProfile)
      let branchesData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        branchesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        branchesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        branchesData = response.data.data;
      }

      // Map to ensure consistent structure with name field
      const mappedBranches = branchesData.map((restaurant) => ({
        _id: restaurant._id,
        name:
          restaurant.branchName || restaurant.restaurantName || restaurant.name,
        address:
          typeof restaurant.address === "object"
            ? `${restaurant.address.street || ""}, ${
                restaurant.address.city || ""
              }, ${restaurant.address.state || ""}`.trim()
            : restaurant.address || "",
        ...restaurant,
      }));

      setBranch(mappedBranches);
      console.log(
        "ExpenseHeadMaster: Fetched branches:",
        mappedBranches.length,
        mappedBranches
      );
    } catch (error) {
      console.error("Error while fetching branches", error);
      setErrorMessage("Failed to load branches");
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const pendingClaims = claims.filter(
    (claim) => claim.status === "pending"
  ).length;
  const approvedClaims = claims.filter(
    (claim) =>
      claim.status === "approved" || claim.status === "partially_approved"
  ).length;

  useEffect(() => {
    fetchExpenseTypes();
    fetchExpenseManagement();
    fetchClaims();
    fetchBranch();
  }, []);
  const fetchExpenseTypes = async () => {
    try {
      const response = await axios.get("https://crm.jagalikoota.com/api/settings");
      setExpenseTypes(response.data.expenseTypes || []);
      setClaimTypes(response.data.claimTypes || []);
    } catch (error) {
      console.error("Error fetching expense types:", error);
      setErrorMessage("Failed to load expense types");
    }
  };

  const fetchExpenseManagement = async () => {
    try {
      const res = await axios.get("https://crm.jagalikoota.com/api/expenses");
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expense management:", error);
      setErrorMessage("Failed to load expense management");
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await axios.get("https://crm.jagalikoota.com/api/claims");
      console.log("Fetched claims:", res.data);
      setClaims(res.data);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setErrorMessage("Failed to load claims");
    }
  };

  // Handle expense filter changes
  const handleExpenseFilterChange = (e) => {
    const { name, value } = e.target;
    setExpenseFilter({
      ...expenseFilter,
      [name]: value,
    });
  };

  // Handle claim filter changes
  const handleClaimFilterChange = (e) => {
    const { name, value } = e.target;
    setClaimFilter({
      ...claimFilter,
      [name]: value,
    });
  };

  // Handle expense form changes
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm({
      ...expenseForm,
      [name]: value,
    });
  };

  // Handle claim form changes
  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimForm({
      ...claimForm,
      [name]: value,
    });
  };

  // Handle expense document upload
  const handleExpenseDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileError(
          "Please upload a valid file (PDF, DOC, DOCX, JPG, PNG, GIF, WEBP)."
        );
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size must be less than 10MB.");
        return;
      }

      setExpenseForm({
        ...expenseForm,
        document: file,
        fileName: file.name,
      });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setExpenseImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setExpenseImagePreview(null);
      }

      setFileError("");
    }
  };

  // Handle claim document upload
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFileError(
          "Please upload a valid file (PDF, DOC, DOCX, JPG, PNG, GIF, WEBP)."
        );
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File size must be less than 10MB.");
        return;
      }

      setClaimForm({
        ...claimForm,
        document: file,
        fileName: file.name,
      });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setClaimImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setClaimImagePreview(null);
      }

      setFileError("");
    }
  };

  // Handle edit expense
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    // Parse amount to remove any currency symbols or formatting
    const cleanAmount =
      typeof expense.amount === "string"
        ? expense.amount.replace(/[?,\s]/g, "")
        : expense.amount;
    setExpenseForm({
      date: expense.date.split("T")[0],
      type: expense.type,
      amount: parseFloat(cleanAmount).toString(),
      person: expense.person,
      branch: expense.branch?.id || expense.branchId || "",
      document: null,
      fileName: expense.documentName || "",
    });
    // Set image preview if it's an image
    if (
      expense.filePath &&
      expense.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      setExpenseImagePreview(`https://crm.jagalikoota.com${expense.filePath}`);
    } else {
      setExpenseImagePreview(null);
    }
    setFileError("");
    // Scroll to form
    setTimeout(() => {
      document
        .querySelector("[data-expense-form]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axios.delete(`https://crm.jagalikoota.com/api/expenses/${expenseId}`);
      setExpenses(expenses.filter((e) => e._id !== expenseId));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error deleting expense"
      );
    }
  };

  // Submit expense to backend
  const submitExpense = async (e) => {
    e.preventDefault();
    console.log("Submitting expense:", expenseForm);

    // Document required only for new expenses, not edits
    if (!editingExpense && !expenseForm.document) {
      setFileError("Please upload a document (PDF, DOC, or DOCX).");
      return;
    }

    // Find the selected branch details
    const selectedBranch = branch.find((b) => b._id === expenseForm.branch);
    if (!selectedBranch) {
      setFileError("Please select a valid branch");
      return;
    }

    const formData = new FormData();
    formData.append("date", expenseForm.date);
    formData.append("type", expenseForm.type);
    formData.append("amount", expenseForm.amount);
    formData.append("person", expenseForm.person);
    formData.append("branchId", selectedBranch._id);
    formData.append("branchName", selectedBranch.name);
    formData.append("branchAddress", selectedBranch.address);
    if (expenseForm.document) {
      formData.append("document", expenseForm.document);
    }

    try {
      let response;
      if (editingExpense) {
        response = await axios.put(
          `https://crm.jagalikoota.com/api/expenses/${editingExpense._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setExpenses(
          expenses.map((e) =>
            e._id === editingExpense._id ? response.data : e
          )
        );
        setEditingExpense(null);
      } else {
        response = await axios.post(
          "https://crm.jagalikoota.com/api/expenses",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setExpenses([...expenses, response.data]);
      }
      setExpenseForm({
        date: new Date().toISOString().split("T")[0],
        type: "",
        amount: "",
        person: "",
        document: null,
        fileName: "",
        branch: "",
      });
      // Clear the image preview after successful submission
      setExpenseImagePreview(null);
      setFileError("");
      setErrorMessage("");
    } catch (error) {
      setFileError(
        error.response?.data?.message ||
          `Error ${editingExpense ? "updating" : "adding"} expense`
      );
    }
  };

  // Handle edit claim
  const handleEditClaim = (claim) => {
    // Prevent editing if approved or paid
    if (
      claim.status === "approved" ||
      claim.status === "partially_approved" ||
      claim.paymentStatus === "paid"
    ) {
      setErrorMessage("Cannot edit claim that is already approved or paid");
      return;
    }

    setEditingClaim(claim);
    // Parse amount to remove any currency symbols or formatting
    const cleanAmount =
      typeof claim.amount === "string"
        ? claim.amount.replace(/[?,\s]/g, "")
        : claim.amount;
    setClaimForm({
      type: claim.type,
      amount: parseFloat(cleanAmount).toString(),
      person: claim.person,
      branch: claim.branch?.id || claim.branchId || "",
      document: null,
      fileName: claim.documentName || "",
    });
    // Set image preview if it's an image
    if (claim.filePath && claim.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setClaimImagePreview(`https://crm.jagalikoota.com${claim.filePath}`);
    } else {
      setClaimImagePreview(null);
    }
    setFileError("");
    // Scroll to form
    setTimeout(() => {
      document
        .querySelector("[data-claim-form]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Handle delete claim
  const handleDeleteClaim = async (claimId, claimStatus, paymentStatus) => {
    // Prevent deletion if approved or paid
    if (
      claimStatus === "approved" ||
      claimStatus === "partially_approved" ||
      paymentStatus === "paid"
    ) {
      setErrorMessage("Cannot delete claim that is already approved or paid");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this claim?")) {
      return;
    }

    try {
      await axios.delete(`https://crm.jagalikoota.com/api/claims/${claimId}`);
      fetchClaims();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error deleting claim");
    }
  };

  // Submit claim to backend
  const submitClaim = async (e) => {
    e.preventDefault();
    // Document required only for new claims, not edits
    if (!editingClaim && !claimForm.document) {
      setFileError("Please upload a document (PDF, DOC, or DOCX).");
      return;
    }

    // Find the selected branch details
    const selectedBranch = branch.find((b) => b._id === claimForm.branch);
    if (!selectedBranch) {
      setFileError("Please select a valid branch");
      return;
    }

    const formData = new FormData();
    formData.append("type", claimForm.type);
    formData.append("amount", claimForm.amount);
    formData.append("person", claimForm.person);
    formData.append("branchId", selectedBranch._id);
    formData.append("branchName", selectedBranch.name);
    formData.append("branchAddress", selectedBranch.address);
    if (claimForm.document) {
      formData.append("document", claimForm.document);
    }

    try {
      let response;
      if (editingClaim) {
        console.log("Updating claim with amount:", claimForm.amount);
        response = await axios.put(
          `https://crm.jagalikoota.com/api/claims/${editingClaim._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Claim update response:", response.data);
        await fetchClaims(); // Wait for fetch to complete
        setEditingClaim(null);
      } else {
        response = await axios.post(
          "https://crm.jagalikoota.com/api/claims",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        fetchClaims();
      }
      setClaimForm({
        type: "",
        amount: "",
        person: "",
        branch: "",
        document: null,
        fileName: "",
      });
      // Clear the image preview after successful submission
      setClaimImagePreview(null);
      setFileError("");
      setErrorMessage("");
    } catch (error) {
      setFileError(
        error.response?.data?.message ||
          `Error ${editingClaim ? "updating" : "adding"} claim`
      );
    }
  };

  // Add expense type to backend
  const addExpenseType = async () => {
    if (newExpenseType && !expenseTypes.includes(newExpenseType)) {
      try {
        const response = await axios.post(
          "https://crm.jagalikoota.com/api/settings/expense-types",
          {
            type: newExpenseType,
          }
        );
        setExpenseTypes(
          response.data.expenseTypes || response.data.settings?.expenseTypes
        );
        setNewExpenseType("");
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Error adding expense type"
        );
      }
    }
  };

  // Remove expense type from backend
  const removeExpenseType = async (type) => {
    try {
      const response = await axios.delete(
        `https://crm.jagalikoota.com/api/settings/expense-types/${encodeURIComponent(
          type
        )}`
      );
      setExpenseTypes(response.data.expenseTypes);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error removing expense type"
      );
    }
  };

  // Add claim type to backend
  const addClaimType = async () => {
    if (newClaimType && !claimTypes.includes(newClaimType)) {
      try {
        const response = await axios.post(
          "https://crm.jagalikoota.com/api/settings/claim-types",
          {
            type: newClaimType,
          }
        );
        setClaimTypes(response.data.claimTypes);
        setNewClaimType("");
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Error adding claim type"
        );
      }
    }
  };

  // Remove claim type from backend
  const removeClaimType = async (type) => {
    try {
      const response = await axios.delete(
        `https://crm.jagalikoota.com/api/settings/claim-types/${encodeURIComponent(
          type
        )}`
      );
      setClaimTypes(response.data.claimTypes);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error removing claim type"
      );
    }
  };

  // Handle claim approval
  const handleApproval = async (action, amount, remarks) => {
    if (!selectedClaim) return;

    try {
      const response = await axios.put(
        `https://crm.jagalikoota.com/api/claims/${selectedClaim._id}/approve`,
        { action, amount, remarks }
      );
      // Refresh claims list from server
      fetchClaims();
      setShowApprovalModal(false);
      setSelectedClaim(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error approving claim");
    }
  };

  // Handle claim payment
  const handlePayment = async (transactionNo, paymentRemarks) => {
    if (!selectedClaim) return;

    try {
      const response = await axios.put(
        `https://crm.jagalikoota.com/api/claims/${selectedClaim._id}/pay`,
        { transactionNo, paymentRemarks }
      );
      // Refresh claims list from server
      fetchClaims();
      setShowPaymentModal(false);
      setSelectedClaim(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Error processing payment"
      );
    }
  };

  // Filter expenses based on local state
  const filterExpenses = (expense) => {
    const minAmount = Number.parseFloat(expenseFilter.minAmount) || 0;
    const maxAmount = Number.parseFloat(expenseFilter.maxAmount) || Infinity;
    return (
      (expenseFilter.date === "" ||
        expense.date.split("T")[0] === expenseFilter.date) &&
      (expenseFilter.type === "" || expense.type === expenseFilter.type) &&
      expense.amount >= minAmount &&
      expense.amount <= maxAmount
    );
  };

  // Filter claims based on local state
  const filterClaims = (claim) => {
    const minAmount = Number.parseFloat(claimFilter.minAmount) || 0;
    const maxAmount = Number.parseFloat(claimFilter.maxAmount) || Infinity;
    return (
      (claimFilter.date === "" ||
        claim.date.split("T")[0] === claimFilter.date) &&
      (claimFilter.type === "" || claim.type === claimFilter.type) &&
      claim.amount >= minAmount &&
      claim.amount <= maxAmount
    );
  };

  // Reset expense filters
  const resetExpenseFilter = () => {
    setExpenseFilter({
      date: "",
      type: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  // Reset claim filters
  const resetClaimFilter = () => {
    setClaimFilter({
      date: "",
      type: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  // Open approval modal
  const openApprovalModal = (claim) => {
    setSelectedClaim(claim);
    setApprovalAction("approve");
    setReducedAmount("0"); // Start with 0 deduction
    setApprovalRemarks("");
    setShowApprovalModal(true);
  };

  // Open payment modal
  const openPaymentModal = (claim) => {
    setSelectedClaim(claim);
    setTransactionNo("");
    setPaymentRemarks("");
    setShowPaymentModal(true);
  };

  // Handle approval submission
  const handleApprovalSubmit = () => {
    let action = approvalAction;
    let amount;

    if (action === "reduce") {
      // Subtract the deduction amount from the original amount
      const deductionAmount = Number.parseFloat(reducedAmount) || 0;
      amount = selectedClaim.amount - deductionAmount;
      // Ensure amount doesn't go below 0
      amount = Math.max(0, amount);
    } else if (action === "reject") {
      amount = 0;
    } else {
      // Approve full amount
      amount = selectedClaim.amount;
    }

    let remarks = approvalRemarks;
    handleApproval(action, amount, remarks);
  };

  // Handle payment submission
  const handlePaymentSubmit = () => {
    handlePayment(transactionNo, paymentRemarks);
  };

  // Get status class for UI
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800";
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800";
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800";
      case "partially_approved":
        return "bg-gradient-to-r from-blue-100 to-[#F5F0EF] text-blue-800";
      default:
        return "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Expense Management System
              </h1>
              <p className="text-slate-600 text-lg">
                Streamline your expense tracking and approval workflow
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Total Expenses
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  ?{totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Pending Claims
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {pendingClaims}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Approved Claims
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {approvedClaims}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-slate-200/50">
            <button
              className={`flex items-center px-8 py-6 text-sm font-semibold transition-all duration-300 ${
                activeTab === "expenses"
                  ? "text-blue-600 border-b-3 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
              onClick={() => setActiveTab("expenses")}
            >
              <IndianRupee className="w-5 h-5 mr-3" />
              Expenses Management
            </button>
            <button
              className={`flex items-center px-8 py-6 text-sm font-semibold transition-all duration-300 ${
                activeTab === "claims"
                  ? "text-blue-600 border-b-3 border-blue-600 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
              onClick={() => setActiveTab("claims")}
            >
              <FileText className="w-5 h-5 mr-3" />
              Employees Claim Approval
            </button>
          </div>

          <div className="p-8">
            {activeTab === "expenses" ? (
              <div className="expenses-section">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Expense History
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300"
                      onClick={() => {
                        setIsExpenseFilterVisible(!isExpenseFilterVisible);
                        setIsClaimFilterVisible(false);
                      }}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isExpenseFilterVisible && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Filter Expenses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={expenseFilter.date}
                          onChange={handleExpenseFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Type
                        </label>
                        <select
                          name="type"
                          value={expenseFilter.type}
                          onChange={handleExpenseFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All</option>
                          {expenseTypes.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Min Amount
                        </label>
                        <input
                          type="number"
                          name="minAmount"
                          value={expenseFilter.minAmount}
                          onChange={handleExpenseFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Max Amount
                        </label>
                        <input
                          type="number"
                          name="maxAmount"
                          value={expenseFilter.maxAmount}
                          onChange={handleExpenseFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Infinity"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={resetExpenseFilter}
                        className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-medium transition-all duration-300"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200/50"
                    data-expense-form
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#69231B] to-[#7a2920] flex items-center justify-center mr-3">
                          {editingExpense ? (
                            <Edit className="w-4 h-4 text-white" />
                          ) : (
                            <Plus className="w-4 h-4 text-white" />
                          )}
                        </div>
                        {editingExpense ? "Edit Expense" : "Add New Expense"}
                      </h2>
                      <button
                        onClick={() => setShowExpenseTypesModal(true)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage Types
                      </button>
                    </div>
                    <form onSubmit={submitExpense} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="date"
                            name="date"
                            value={expenseForm.date}
                            onChange={handleExpenseChange}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Type of Expense
                        </label>
                        <select
                          name="type"
                          value={expenseForm.type}
                          onChange={handleExpenseChange}
                          className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                          required
                        >
                          <option value="">Select Type</option>
                          {expenseTypes.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="number"
                            name="amount"
                            value={expenseForm.amount}
                            onChange={handleExpenseChange}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Person Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="text"
                            name="person"
                            value={expenseForm.person}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^a-zA-Z\s]/g,
                                ""
                              );
                              setExpenseForm({
                                ...expenseForm,
                                person: value,
                              });
                            }}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                            placeholder="Enter person name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Select Branch
                        </label>
                        <div className="relative">
                          <select
                            name="branch"
                            value={expenseForm.branch}
                            onChange={handleExpenseChange}
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                          >
                            <option value="">Select Branch</option>
                            {branch?.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Upload Document
                        </label>

                        <label
                          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 bg-white/50 ${
                            fileError ? "border-red-400" : "border-slate-300"
                          }`}
                        >
                          {expenseImagePreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={expenseImagePreview}
                                alt="Preview"
                                className="max-h-32 max-w-full object-contain rounded-lg"
                              />
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {expenseForm.fileName}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-[#F5F0EF] flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-blue-600" />
                              </div>
                              <p className="text-sm text-slate-600 font-medium">
                                {expenseForm.fileName ||
                                  "Click to upload or drag and drop"}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            name="document"
                            onChange={handleExpenseDocumentUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          />
                        </label>
                        {fileError && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fileError}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {editingExpense && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpense(null);
                              setExpenseForm({
                                date: new Date().toISOString().split("T")[0],
                                type: "",
                                amount: "",
                                person: "",
                                branch: "",
                                document: null,
                                fileName: "",
                              });
                              setExpenseImagePreview(null);
                              setFileError("");
                            }}
                            className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`${
                            editingExpense ? "flex-1" : "w-full"
                          } bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                        >
                          {editingExpense ? (
                            <>
                              <Edit className="w-5 h-5 mr-2" />
                              Update Expense
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 mr-2" />
                              Add Expense
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">
                        Expense History
                      </h2>
                      <div className="flex space-x-2">
                        <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300">
                          {/* <Filter className="w-5 h-5" /> */}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                      {expenses.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                            <IndianRupee className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 text-lg font-medium">
                            No expenses recorded yet.
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            Add your first expense using the form
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                          {expenses.filter(filterExpenses).map((expense) => (
                            <div
                              key={expense._id}
                              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-800 text-lg">
                                    {expense.type}
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    Submitted by {expense.person} on{" "}
                                    {expense.date.split("T")[0]}
                                  </p>
                                  {expense.supplier && (
                                    <p className="text-sm text-slate-500">
                                      Supplier: {expense.supplier.name}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-slate-800 text-xl">
                                    ?
                                    {(typeof expense.amount === "number"
                                      ? expense.amount
                                      : parseFloat(expense.amount) || 0
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600 mb-2">
                                  <span className="font-semibold">
                                    Document:
                                  </span>{" "}
                                  {expense.documentName}
                                </p>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedExpense(expense);
                                      setShowExpenseDetailsModal(true);
                                    }}
                                    className="text-sm text-green-600 hover:text-green-800 flex items-center font-medium bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-all duration-300"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </button>
                                  <a
                                    href={`https://crm.jagalikoota.com/api/expenses/${expense._id}/download`}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    {expense.filePath?.match(
                                      /\.(jpg|jpeg|png|gif|webp)$/i
                                    )
                                      ? "View Image"
                                      : "Download Document"}
                                  </a>
                                  <button
                                    onClick={() => handleEditExpense(expense)}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteExpense(expense._id)
                                    }
                                    className="text-sm text-red-600 hover:text-red-800 flex items-center font-medium bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-all duration-300"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="claims-section">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Claims Waiting Approval
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300"
                      onClick={() => {
                        setIsClaimFilterVisible(!isClaimFilterVisible);
                        setIsExpenseFilterVisible(false);
                      }}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {isClaimFilterVisible && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                      Filter Claims
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={claimFilter.date}
                          onChange={handleClaimFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Type
                        </label>
                        <select
                          name="type"
                          value={claimFilter.type}
                          onChange={handleClaimFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All</option>
                          {claimTypes.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Min Amount
                        </label>
                        <input
                          type="number"
                          name="minAmount"
                          value={claimFilter.minAmount}
                          onChange={handleClaimFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Max Amount
                        </label>
                        <input
                          type="number"
                          name="maxAmount"
                          value={claimFilter.maxAmount}
                          onChange={handleClaimFilterChange}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Infinity"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={resetClaimFilter}
                        className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-medium transition-all duration-300"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200/50"
                    data-claim-form
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#69231B] to-[#7a2920] flex items-center justify-center mr-3">
                          {editingClaim ? (
                            <Edit className="w-4 h-4 text-white" />
                          ) : (
                            <Plus className="w-4 h-4 text-white" />
                          )}
                        </div>
                        {editingClaim ? "Edit Claim" : "Add New Claim"}
                      </h2>
                      <button
                        onClick={() => setShowClaimTypesModal(true)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Manage Types
                      </button>
                    </div>
                    <form onSubmit={submitClaim} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Type of Claim
                        </label>
                        <div className="relative">
                          <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <select
                            name="type"
                            value={claimForm.type}
                            onChange={handleClaimChange}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                          >
                            <option value="">Select Claim Type</option>
                            {claimTypes.map((type, index) => (
                              <option key={index} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="number"
                            name="amount"
                            value={claimForm.amount}
                            onChange={handleClaimChange}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Person Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input
                            type="text"
                            name="person"
                            value={claimForm.person}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^a-zA-Z\s]/g,
                                ""
                              );
                              setClaimForm({
                                ...claimForm,
                                person: value,
                              });
                            }}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                            placeholder="Enter person name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Select Branch
                        </label>
                        <div className="relative">
                          <select
                            name="branch"
                            value={claimForm.branch}
                            onChange={handleClaimChange}
                            className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                            required
                          >
                            <option value="">Select Branch</option>
                            {branch.map((branch, index) => (
                              <option key={index} value={branch._id}>
                                {branch.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Upload Document
                        </label>

                        <label
                          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 bg-white/50 ${
                            fileError ? "border-red-400" : "border-slate-300"
                          }`}
                        >
                          {claimImagePreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={claimImagePreview}
                                alt="Preview"
                                className="max-h-32 max-w-full object-contain rounded-lg"
                              />
                              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {claimForm.fileName}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-[#F5F0EF] flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-blue-600" />
                              </div>
                              <p className="text-sm text-slate-600 font-medium">
                                {claimForm.fileName ||
                                  "Click to upload or drag and drop"}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            name="document"
                            onChange={handleDocumentUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          />
                        </label>
                        {fileError && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fileError}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {editingClaim && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClaim(null);
                              setClaimForm({
                                type: "",
                                amount: "",
                                person: "",
                                branch: "",
                                document: null,
                                fileName: "",
                              });
                              setClaimImagePreview(null);
                              setFileError("");
                            }}
                            className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`${
                            editingClaim ? "flex-1" : "w-full"
                          } bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#7a2920] hover:to-[#5c1e15] transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                        >
                          {editingClaim ? (
                            <>
                              <Edit className="w-5 h-5 mr-2" />
                              Update Claim
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Submit Claim
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">
                        Claims Waiting Approval
                      </h2>
                      <div className="flex space-x-2">
                        <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300">
                          {/* <Filter className="w-5 h-5" /> */}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
                      {claims.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 text-lg font-medium">
                            No claims submitted yet.
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            Submit your first claim using the form
                          </p>
                        </div>
                      ) : (
                        claims.filter(filterClaims).map((claim) => (
                          <div
                            key={claim._id}
                            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-800 text-lg">
                                  {claim.type}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  Submitted by {claim.person} on{" "}
                                  {claim.date.split("T")[0]}
                                </p>
                                {(claim.branchName || claim.branch) && (
                                  <p className="text-sm text-slate-500">
                                    Branch:{" "}
                                    {claim.branchName ||
                                      (typeof claim.branch === "object"
                                        ? claim.branch?.name
                                        : claim.branch) ||
                                      "N/A"}
                                    {claim.branchAddress &&
                                      ` - ${claim.branchAddress}`}
                                    {!claim.branchAddress &&
                                      typeof claim.branch === "object" &&
                                      claim.branch?.address &&
                                      ` - ${claim.branch.address}`}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-800 text-xl">
                                  ?
                                  {(typeof claim.amount === "number"
                                    ? claim.amount
                                    : parseFloat(claim.amount) || 0
                                  ).toFixed(2)}
                                </p>
                                <div
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                    claim.status
                                  )}`}
                                >
                                  {claim.status === "pending" && (
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {claim.status === "approved" && (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {claim.status === "rejected" && (
                                    <XCircle className="w-3 h-3 mr-1" />
                                  )}
                                  {claim.status === "partially_approved" && (
                                    <Edit className="w-3 h-3 mr-1" />
                                  )}
                                  {claim.status.replace("_", " ")}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between mt-6">
                              <div className="flex gap-2">
                                <a
                                  href={`https://crm.jagalikoota.com/api/claims/${claim._id}/download`}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {claim.filePath?.match(
                                    /\.(jpg|jpeg|png|gif|webp)$/i
                                  )
                                    ? "View Image"
                                    : "Download Document"}
                                </a>
                                <button
                                  onClick={() => handleEditClaim(claim)}
                                  disabled={
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                  }
                                  className={`text-sm flex items-center font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                      : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                                  }`}
                                  title={
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                      ? "Cannot edit approved or paid claim"
                                      : "Edit claim"
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClaim(
                                      claim._id,
                                      claim.status,
                                      claim.paymentStatus
                                    )
                                  }
                                  disabled={
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                  }
                                  className={`text-sm flex items-center font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                      : "text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100"
                                  }`}
                                  title={
                                    claim.status === "approved" ||
                                    claim.status === "partially_approved" ||
                                    claim.paymentStatus === "paid"
                                      ? "Cannot delete approved or paid claim"
                                      : "Delete claim"
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                              <div className="flex flex-col space-y-2">
                                {claim.status === "pending" && (
                                  <button
                                    onClick={() => openApprovalModal(claim)}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold rounded-lg hover:from-amber-200 hover:to-orange-200 flex items-center transition-all duration-300"
                                  >
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Needs Approval
                                  </button>
                                )}
                                {claim.paymentStatus !== "paid" && (
                                  <button
                                    onClick={() => openPaymentModal(claim)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center transition-all duration-300 ${
                                      claim.status === "pending" ||
                                      claim.status === "rejected"
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 hover:from-emerald-200 hover:to-green-200"
                                    }`}
                                    disabled={
                                      claim.status === "pending" ||
                                      claim.status === "rejected"
                                    }
                                    title={
                                      claim.status === "pending"
                                        ? "Your claim is not approved. Waiting for approval."
                                        : claim.status === "rejected"
                                        ? "Claim rejected, cannot pay"
                                        : ""
                                    }
                                  >
                                    <IndianRupee className="w-4 h-4 mr-1" />
                                    Pay
                                  </button>
                                )}
                                {claim.paymentStatus === "paid" && (
                                  <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-sm font-semibold rounded-lg flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Paid
                                  </span>
                                )}
                              </div>
                            </div>
                            {claim.status !== "pending" && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                  <span className="font-semibold">
                                    Approved Amount:
                                  </span>{" "}
                                  ?{claim.approvedAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-slate-600">
                                  <span className="font-semibold">
                                    Remarks:
                                  </span>{" "}
                                  {claim.remarks}
                                </p>
                                <p className="text-sm text-slate-600">
                                  <span className="font-semibold">
                                    Document:
                                  </span>{" "}
                                  {claim.documentName}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#69231B] to-[#7a2920] flex items-center justify-center mr-3">
                  <Edit className="w-4 h-4 text-white" />
                </div>
                Process Claim
              </h3>
              <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50 shadow-inner">
                <p className="font-semibold text-lg text-slate-800 mb-2">
                  {selectedClaim.type}
                </p>
                <p className="text-slate-600 mb-1">
                  Amount: ?{selectedClaim.amount.toFixed(2)}
                </p>
                <p className="text-slate-600">
                  Submitted by: {selectedClaim.person}
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Action
                  </label>
                  <select
                    value={approvalAction}
                    onChange={(e) => setApprovalAction(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="approve">Approve Full Amount</option>
                    <option value="reduce">Reduce Amount</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
                {approvalAction === "reduce" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Amount to Deduct (?)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="number"
                        value={reducedAmount}
                        onChange={(e) => setReducedAmount(e.target.value)}
                        className="pl-12 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                        min="0"
                        max={selectedClaim.amount}
                        step="0.01"
                        placeholder="Enter amount to deduct"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Original Amount: ?{selectedClaim.amount.toFixed(2)} |
                      Approved Amount will be: ?
                      {(
                        selectedClaim.amount - (parseFloat(reducedAmount) || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    rows="4"
                    placeholder="Add remarks here"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-all duration-300 shadow-sm hover:shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-xl hover:from-[#7a2920] hover:to-[#5c1e15] font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Process Payment
              </h3>
              <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/50 shadow-inner">
                <p className="font-semibold text-lg text-slate-800 mb-2">
                  {selectedClaim.type}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <p className="text-slate-600">Original Amount:</p>
                  <p className="text-slate-800 font-semibold">
                    ?{selectedClaim.amount.toFixed(2)}
                  </p>
                  <p className="text-slate-600">Approved Amount:</p>
                  <p className="text-slate-800 font-semibold">
                    ?{selectedClaim.approvedAmount.toFixed(2)}
                  </p>
                  {selectedClaim.status === "rejected" && (
                    <>
                      <p className="text-red-600">Status:</p>
                      <p className="text-red-600 font-semibold">Rejected</p>
                    </>
                  )}
                  {selectedClaim.status === "partially_approved" && (
                    <>
                      <p className="text-amber-600">Reduced by:</p>
                      <p className="text-amber-600 font-semibold">
                        ?
                        {(
                          selectedClaim.amount - selectedClaim.approvedAmount
                        ).toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction Number
                  </label>
                  <input
                    type="text"
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter transaction number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    rows="4"
                    placeholder="Add payment remarks here"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-all duration-300 shadow-sm hover:shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Submit Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Types Modal */}
        {showClaimTypesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#69231B] to-[#7a2920] flex items-center justify-center mr-3">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Manage Claim Types
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Add New Claim Type
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newClaimType}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setNewClaimType(value);
                    }}
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter new claim type"
                  />
                  <button
                    onClick={addClaimType}
                    className="px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-xl hover:from-[#7a2920] hover:to-[#5c1e15] font-medium transition-all duration-300"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Current Claim Types
                </label>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 max-h-60 overflow-y-auto bg-white/50">
                  {claimTypes.length === 0 ? (
                    <p className="p-4 text-center text-slate-500">
                      No claim types added yet
                    </p>
                  ) : (
                    claimTypes.map((type, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <span className="font-medium text-slate-700">
                          {type}
                        </span>
                        <button
                          onClick={() => removeClaimType(type)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowClaimTypesModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-medium transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense Types Modal */}
        {showExpenseTypesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#69231B] to-[#7a2920] flex items-center justify-center mr-3">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Manage Expense Types
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Add New Expense Type
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newExpenseType}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setNewExpenseType(value);
                    }}
                    className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="Enter new expense type"
                  />
                  <button
                    onClick={addExpenseType}
                    className="px-6 py-3 bg-gradient-to-r from-[#69231B] to-[#7a2920] text-white rounded-xl hover:from-[#7a2920] hover:to-[#5c1e15] font-medium transition-all duration-300"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Current Expense Types
                </label>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 max-h-60 overflow-y-auto bg-white/50">
                  {expenseTypes.length === 0 ? (
                    <p className="p-4 text-center text-slate-500">
                      No expense types added yet
                    </p>
                  ) : (
                    expenseTypes.map((type, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <span className="font-medium text-slate-700">
                          {type}
                        </span>
                        <button
                          onClick={() => removeExpenseType(type)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowExpenseTypesModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 font-medium transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense Details Modal */}
        {showExpenseDetailsModal && selectedExpense && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Eye className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Expense Details</h2>
                      <p className="text-green-100 text-sm">
                        Complete expense information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowExpenseDetailsModal(false);
                      setSelectedExpense(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Expense Type and Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Expense Type
                      </p>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {selectedExpense.type}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Amount
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        ?
                        {(typeof selectedExpense.amount === "number"
                          ? selectedExpense.amount
                          : parseFloat(selectedExpense.amount) || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Date
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {new Date(selectedExpense.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Submitted By
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedExpense.person}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Branch
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {selectedExpense.branchName ||
                        (typeof selectedExpense.branch === "object"
                          ? selectedExpense.branch?.name
                          : selectedExpense.branch) ||
                        "N/A"}
                    </p>
                  </div>

                  {selectedExpense.supplier && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500 font-medium mb-1">
                        Supplier
                      </p>
                      <p className="text-lg font-semibold text-slate-800">
                        {selectedExpense.supplier.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Branch Address */}
                {selectedExpense.branchAddress && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      Branch Address
                    </p>
                    <p className="text-base text-slate-700">
                      {selectedExpense.branchAddress}
                    </p>
                  </div>
                )}

                {/* Document Section */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium mb-3">
                    Document
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {selectedExpense.documentName || "Document"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedExpense.filePath?.match(
                            /\.(jpg|jpeg|png|gif|webp)$/i
                          )
                            ? "Image File"
                            : "Document File"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://crm.jagalikoota.com/api/expenses/${selectedExpense._id}/download`}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Document Preview (if image) */}
                {selectedExpense.filePath?.match(
                  /\.(jpg|jpeg|png|gif|webp)$/i
                ) && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium mb-3">
                      Document Preview
                    </p>
                    <img
                      src={`https://crm.jagalikoota.com/api/expenses/${selectedExpense._id}/download`}
                      alt="Expense document"
                      className="w-full rounded-xl border border-slate-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-3xl">
                <button
                  onClick={() => {
                    setShowExpenseDetailsModal(false);
                    setSelectedExpense(null);
                  }}
                  className="w-full py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all duration-300 font-medium"
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
};

export default ExpenseHeadMaster;
