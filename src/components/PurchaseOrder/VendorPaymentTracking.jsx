import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  RefreshCw,
  Download,
  Building2,
  CreditCard,
  AlertCircle,
  Eye,
  X,
  Plus,
  CheckCircle2,
  FileText,
  Receipt,
  Trash2,
  Clock,
  FileDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";

const VendorPaymentTracking = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [grns, setGrns] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    dueDate: "",
    notes: "",
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    paidAmount: "",
    paymentMethod: "Cash",
    paymentType: "full",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [suppRes, payRes, grnRes, invRes] = await Promise.all([
        axios.get(`${API_URL.replace("/api/v1", "")}/res/supplier`),
        axios.get(`${API_URL}/restaurant/payment?limit=500`),
        axios.get(`${API_URL}/hotel/grn?limit=9999`),
        axios.get(`${API_URL}/restaurant/invoice`),
      ]);

      setSuppliers(suppRes.data.data || []);
      setPayments(payRes.data.data || []);
      setGrns(grnRes.data.data || grnRes.data || []);
      const invData = invRes.data.data || invRes.data || [];
      setInvoices(Array.isArray(invData) ? invData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Match supplier name to GRN
  const matchSupplierToGrn = (grn, supplier) => {
    if (!grn || !supplier) return false;
    const grnSupplier = (grn.supplier || "").toLowerCase().trim();
    const suppName = (supplier.name || "").toLowerCase().trim();
    const suppCompany = (supplier.companyName || "").toLowerCase().trim();
    return (
      grnSupplier === suppName ||
      grnSupplier === suppCompany ||
      (suppName && grnSupplier.includes(suppName)) ||
      (suppName && suppName.includes(grnSupplier)) ||
      (suppCompany && grnSupplier.includes(suppCompany)) ||
      (suppCompany && suppCompany.includes(grnSupplier))
    );
  };

  // Check if a GRN already has an invoice
  const getInvoiceForGrn = (grnId) => {
    return invoices.find((inv) => {
      const invGrn = typeof inv.grn === "object" ? inv.grn?._id : inv.grn;
      return invGrn === grnId;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Check if an invoice is overdue
  const isInvoiceOverdue = (invoice) => {
    if (!invoice || invoice.paymentStatus === "Paid") return false;
    if (!invoice.dueDate) return false;
    return new Date(invoice.dueDate) < new Date();
  };

  // Get overdue invoices
  const overdueInvoices = useMemo(() => {
    return invoices.filter((inv) => isInvoiceOverdue(inv));
  }, [invoices]);

  const overdueTotal = useMemo(() => {
    return overdueInvoices.reduce((sum, inv) => {
      const pending = inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0);
      return sum + pending;
    }, 0);
  }, [overdueInvoices]);

  // Supplier summary from GRN data
  const getSupplierSummary = () => {
    const summary = suppliers.map((supplier) => {
      const supplierGrns = grns.filter((grn) => matchSupplierToGrn(grn, supplier));
      const totalGrnAmount = supplierGrns.reduce((sum, grn) => sum + (grn.totalAmount || 0), 0);

      let totalPaidFromInvoices = 0;
      let nearestDueDate = null;

      supplierGrns.forEach((grn) => {
        const inv = getInvoiceForGrn(grn._id);
        if (inv) {
          totalPaidFromInvoices += inv.paidAmount || 0;
          // Track nearest unpaid due date
          if (inv.paymentStatus !== "Paid" && inv.dueDate) {
            const d = new Date(inv.dueDate);
            if (!nearestDueDate || d < nearestDueDate) {
              nearestDueDate = d;
            }
          }
        }
      });

      const paidGrnAmount = supplierGrns
        .filter((grn) => grn.status === "Paid")
        .reduce((sum, grn) => sum + (grn.totalAmount || 0), 0);

      const effectivePaid = Math.max(totalPaidFromInvoices, paidGrnAmount);
      const totalPending = Math.max(0, totalGrnAmount - effectivePaid);
      const grnCount = supplierGrns.length;
      const unpaidCount = supplierGrns.filter((grn) => {
        if (grn.status === "Paid") return false;
        const inv = getInvoiceForGrn(grn._id);
        if (inv && inv.paymentStatus === "Paid") return false;
        return true;
      }).length;
      const invoicedCount = supplierGrns.filter((grn) => getInvoiceForGrn(grn._id)).length;

      return {
        ...supplier,
        totalGrnAmount,
        totalPaid: effectivePaid,
        totalPending,
        grnCount,
        unpaidCount,
        invoicedCount,
        nearestDueDate,
      };
    });

    return summary.filter((s) => s.grnCount > 0).sort((a, b) => b.totalPending - a.totalPending);
  };

  // Get GRNs for a supplier (for the detail/invoice view)
  const getSupplierGrns = () => {
    if (!selectedSupplier) return grns;
    return grns.filter((grn) => matchSupplierToGrn(grn, selectedSupplier));
  };

  // Filter payments
  const getFilteredPayments = () => {
    let filtered = [...payments];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.supplierName || "").toLowerCase().includes(q) ||
          (p.paymentNumber || "").toLowerCase().includes(q) ||
          (p.reference || "").toLowerCase().includes(q)
      );
    }
    if (filterStatus) filtered = filtered.filter((p) => p.status === filterStatus);
    if (filterMethod) filtered = filtered.filter((p) => p.paymentMethod === filterMethod);
    if (fromDate) filtered = filtered.filter((p) => new Date(p.paymentDate) >= new Date(fromDate));
    if (toDate) filtered = filtered.filter((p) => new Date(p.paymentDate) <= new Date(toDate + "T23:59:59"));
    if (selectedSupplier) {
      filtered = filtered.filter((p) => {
        return (p.supplierName || "").toLowerCase().trim() === selectedSupplier.name?.toLowerCase().trim();
      });
    }
    return filtered;
  };

  // Get pending invoices (for payment modal)
  const getPendingInvoices = () => {
    let pending = invoices.filter((inv) => inv.paymentStatus !== "Paid");
    if (selectedSupplier) {
      pending = pending.filter((inv) => {
        const invSupp = (inv.supplierName || "").toLowerCase().trim();
        return (
          invSupp === selectedSupplier.name?.toLowerCase().trim() ||
          invSupp === selectedSupplier.companyName?.toLowerCase().trim()
        );
      });
    }
    return pending;
  };

  // === FEATURE 5: Payment Ageing Analysis ===
  const getAgeingData = () => {
    const now = new Date();
    const buckets = {
      "0-7": { label: "0–7 days", total: 0, suppliers: {} },
      "8-15": { label: "8–15 days", total: 0, suppliers: {} },
      "16-30": { label: "16–30 days", total: 0, suppliers: {} },
      "30+": { label: "30+ days", total: 0, suppliers: {} },
    };

    invoices.forEach((inv) => {
      if (inv.paymentStatus === "Paid") return;
      const pending = inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0);
      if (pending <= 0) return;

      const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.invoiceDate || inv.createdAt);
      const daysOld = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)));

      let bucket;
      if (daysOld <= 7) bucket = "0-7";
      else if (daysOld <= 15) bucket = "8-15";
      else if (daysOld <= 30) bucket = "16-30";
      else bucket = "30+";

      buckets[bucket].total += pending;
      const suppName = inv.supplierName || "Unknown";
      if (!buckets[bucket].suppliers[suppName]) {
        buckets[bucket].suppliers[suppName] = 0;
      }
      buckets[bucket].suppliers[suppName] += pending;
    });

    return buckets;
  };

  // Generate Invoice from GRN
  const handleGenerateInvoice = async () => {
    if (!selectedGrn) return;

    try {
      const res = await axios.post(`${API_URL}/restaurant/invoice/create-from-grn`, {
        grnId: selectedGrn._id,
        invoiceDate: new Date().toISOString(),
        dueDate: invoiceForm.dueDate || undefined,
        notes: invoiceForm.notes || undefined,
      });

      if (res.data.success) {
        toast.success(`Invoice ${res.data.data.invoiceNumber} created for ${selectedGrn.grnNumber}`);
        setShowInvoiceModal(false);
        setSelectedGrn(null);
        setInvoiceForm({ dueDate: "", notes: "" });
        fetchAllData();
      } else {
        toast.error(res.data.message || "Failed to create invoice");
      }
    } catch (err) {
      console.error("Invoice creation error:", err);
      toast.error(err.response?.data?.message || "Failed to create invoice");
    }
  };

  // === FEATURE 2: Bulk Invoice Generation ===
  const handleBulkGenerateInvoices = async () => {
    const grnsWithoutInvoice = getSupplierGrns().filter((grn) => !getInvoiceForGrn(grn._id));
    if (grnsWithoutInvoice.length === 0) {
      toast.info("All GRNs already have invoices");
      return;
    }

    const confirmed = window.confirm(
      `Generate invoices for ${grnsWithoutInvoice.length} GRN(s)? Due date will be set to 15 days from today.`
    );
    if (!confirmed) return;

    setBulkGenerating(true);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    const dueDateStr = dueDate.toISOString();

    let success = 0;
    let failed = 0;

    for (let i = 0; i < grnsWithoutInvoice.length; i++) {
      const grn = grnsWithoutInvoice[i];
      try {
        const res = await axios.post(`${API_URL}/restaurant/invoice/create-from-grn`, {
          grnId: grn._id,
          invoiceDate: new Date().toISOString(),
          dueDate: dueDateStr,
          notes: "Auto-generated via bulk action",
        });
        if (res.data.success) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      // Progress toast every 5 items
      if ((i + 1) % 5 === 0 || i === grnsWithoutInvoice.length - 1) {
        toast.info(`Progress: ${i + 1}/${grnsWithoutInvoice.length} processed`, { autoClose: 1500 });
      }
    }

    setBulkGenerating(false);
    toast.success(`Bulk generation done: ${success} created, ${failed} failed`);
    fetchAllData();
  };

  // === FEATURE 6: Auto-update GRN status after full payment ===
  const handleRecordPayment = async () => {
    if (!paymentForm.invoiceId) {
      toast.error("Please select an invoice");
      return;
    }
    if (!paymentForm.paidAmount || parseFloat(paymentForm.paidAmount) <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/restaurant/payment/create`, {
        invoiceId: paymentForm.invoiceId,
        paidAmount: parseFloat(paymentForm.paidAmount),
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
      });

      if (res.data.success) {
        toast.success("Payment recorded successfully");

        // Auto-update GRN status if invoice is fully paid
        const updatedInvoice = res.data.invoice || res.data.data?.invoice;
        const invoiceFullyPaid = updatedInvoice?.paymentStatus === "Paid";
        
        // Also check from local state if response doesn't include full invoice data
        const selectedInvoice = invoices.find((i) => i._id === paymentForm.invoiceId);
        const pendingAfterPayment = selectedInvoice 
          ? (selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0) - parseFloat(paymentForm.paidAmount))
          : null;
        const isNowFullyPaid = invoiceFullyPaid || (pendingAfterPayment !== null && pendingAfterPayment <= 0.01);

        if (isNowFullyPaid) {
          // Find the GRN linked to this invoice from local state
          let grnId = null;
          if (updatedInvoice?.grn) {
            grnId = typeof updatedInvoice.grn === "object" ? updatedInvoice.grn._id : updatedInvoice.grn;
          } else if (selectedInvoice?.grn) {
            grnId = typeof selectedInvoice.grn === "object" ? selectedInvoice.grn._id : selectedInvoice.grn;
          }
          
          if (grnId) {
            try {
              await axios.put(`${API_URL}/hotel/grn/${grnId}`, { status: "Paid" });
              toast.info("GRN status updated to Paid");
            } catch (grnErr) {
              console.error("GRN status update failed:", grnErr);
            }
          }
        }

        setShowPaymentModal(false);
        setPaymentForm({
          invoiceId: "",
          paidAmount: "",
          paymentMethod: "Cash",
          paymentType: "full",
          reference: "",
          notes: "",
        });
        fetchAllData();
      } else {
        toast.error(res.data.message || "Failed to record payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  // === FEATURE 7: Delete/void payment ===
  const handleDeletePayment = async (payment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete payment ${payment.paymentNumber || ""}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/restaurant/payment/${payment._id}`);
      toast.success("Payment deleted successfully");
      fetchAllData();
    } catch (err) {
      console.error("Delete payment error:", err);
      toast.error(err.response?.data?.message || "Failed to delete payment");
    }
  };

  // === FEATURE 3: Supplier-wise payment report PDF ===
  const generateSupplierPDF = (supplier) => {
    const doc = new jsPDF();
    const supplierGrns = grns.filter((grn) => matchSupplierToGrn(grn, supplier));

    // Header
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19);
    doc.text("Supplier Payment Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Supplier: ${supplier.name || ""}`, 14, 32);
    doc.text(`Company: ${supplier.companyName || "—"}`, 14, 38);
    doc.text(`Address: ${supplier.address || "—"}`, 14, 44);
    doc.text(`GST: ${supplier.gstNumber || supplier.gst || "—"}`, 14, 50);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 56);

    // Invoice table
    const tableData = [];
    let totalAmount = 0;
    let totalPaid = 0;
    let totalPending = 0;

    supplierGrns.forEach((grn) => {
      const inv = getInvoiceForGrn(grn._id);
      if (inv) {
        const pending = inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0);
        totalAmount += inv.totalAmount || 0;
        totalPaid += inv.paidAmount || 0;
        totalPending += pending;
        tableData.push([
          inv.invoiceNumber || "—",
          inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-IN") : "—",
          `₹${(inv.totalAmount || 0).toLocaleString("en-IN")}`,
          `₹${(inv.paidAmount || 0).toLocaleString("en-IN")}`,
          `₹${pending.toLocaleString("en-IN")}`,
          inv.paymentStatus || "Unpaid",
        ]);
      } else {
        totalAmount += grn.totalAmount || 0;
        totalPending += grn.totalAmount || 0;
        tableData.push([
          "No Invoice",
          grn.createdAt ? new Date(grn.createdAt).toLocaleDateString("en-IN") : "—",
          `₹${(grn.totalAmount || 0).toLocaleString("en-IN")}`,
          "₹0",
          `₹${(grn.totalAmount || 0).toLocaleString("en-IN")}`,
          "No Invoice",
        ]);
      }
    });

    autoTable(doc, {
      startY: 64,
      head: [["Invoice #", "Date", "Amount", "Paid", "Pending", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [139, 69, 19] },
      styles: { fontSize: 9 },
    });

    // Summary
    const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 200;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: ₹${totalAmount.toLocaleString("en-IN")}`, 14, finalY);
    doc.text(`Total Paid: ₹${totalPaid.toLocaleString("en-IN")}`, 14, finalY + 7);
    doc.setTextColor(200, 0, 0);
    doc.text(`Total Pending: ₹${totalPending.toLocaleString("en-IN")}`, 14, finalY + 14);

    doc.save(`${supplier.name || "Supplier"}_Payment_Report.pdf`);
    toast.success("PDF downloaded");
  };

  // Export
  const exportToExcel = () => {
    const data = getFilteredPayments().map((p) => ({
      "Payment #": p.paymentNumber,
      Supplier: p.supplierName || "—",
      Date: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : "—",
      Method: p.paymentMethod,
      "Invoice Amount": p.invoiceAmount || 0,
      "Paid Amount": p.paidAmount || 0,
      Type: p.paymentType,
      Status: p.status,
      Reference: p.reference || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Vendor_Payments.xlsx");
    toast.success("Exported to Excel");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  const supplierSummary = getSupplierSummary();
  const filteredPayments = getFilteredPayments();
  const pendingInvoices = getPendingInvoices();
  const supplierGrns = getSupplierGrns();
  const ageingData = getAgeingData();

  const totalPending = supplierSummary.reduce((sum, s) => sum + s.totalPending, 0);
  const totalPaid = supplierSummary.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalGrnValue = supplierSummary.reduce((sum, s) => sum + s.totalGrnAmount, 0);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendors & Payments Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">GRN → Invoice → Payment flow</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedSupplier(null);
              setShowPaymentModal(true);
            }}
            className="flex items-center gap-2 bg-[#8B4513] text-white px-4 py-2 rounded-lg hover:bg-[#6B3410] transition-colors"
          >
            <Plus size={16} /> Record Payment
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats — 5 cards including overdue */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total GRN Value</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalGrnValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Paid</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pending</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Payments</p>
              <p className="text-lg font-bold text-gray-800">{payments.length}</p>
            </div>
          </div>
        </div>
        {/* FEATURE 1: Overdue stat card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock size={20} className="text-red-700" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Overdue ({overdueInvoices.length})</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(overdueTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — includes new "Ageing" tab */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border w-fit flex-wrap">
        {[
          { id: "overview", label: "Supplier Overview" },
          { id: "grns", label: "GRNs & Invoices" },
          { id: "payments", label: "Payment History" },
          { id: "ageing", label: "Ageing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-[#8B4513] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === SUPPLIER OVERVIEW TAB === */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">GRNs</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Invoiced</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Pending</th>
                  {/* FEATURE 4: Next Due column */}
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Next Due</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplierSummary
                  .filter((s) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (s.name || "").toLowerCase().includes(q) ||
                      (s.companyName || "").toLowerCase().includes(q)
                    );
                  })
                  .map((supplier) => {
                    const isDueOverdue = supplier.nearestDueDate && supplier.nearestDueDate < new Date();
                    return (
                      <tr key={supplier._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{supplier.name}</p>
                          <p className="text-xs text-gray-500">{supplier.supplierID}</p>
                        </td>
                        <td className="text-right px-4 py-3">
                          <span className="text-gray-700">{supplier.grnCount}</span>
                          {supplier.unpaidCount > 0 && (
                            <span className="ml-1 text-xs text-red-500">({supplier.unpaidCount} unpaid)</span>
                          )}
                        </td>
                        <td className="text-right px-4 py-3 text-blue-700">
                          {supplier.invoicedCount}/{supplier.grnCount}
                        </td>
                        <td className="text-right px-4 py-3 font-medium text-gray-700">
                          {formatCurrency(supplier.totalGrnAmount)}
                        </td>
                        <td className="text-right px-4 py-3 text-green-700">{formatCurrency(supplier.totalPaid)}</td>
                        <td className="text-right px-4 py-3 font-semibold text-red-700">
                          {formatCurrency(supplier.totalPending)}
                        </td>
                        {/* FEATURE 4: Next Due date */}
                        <td className="text-center px-4 py-3">
                          {supplier.nearestDueDate ? (
                            <span className={`text-xs font-medium ${isDueOverdue ? "text-red-600" : "text-gray-600"}`}>
                              {supplier.nearestDueDate.toLocaleDateString("en-IN")}
                              {isDueOverdue && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px]">
                                  Overdue
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-3">
                          {supplier.totalPending <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Cleared
                            </span>
                          ) : supplier.totalPaid > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Partial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="text-center px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setActiveTab("grns");
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                              title="View GRNs & Invoices"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600"
                              title="Record payment"
                            >
                              <Plus size={16} />
                            </button>
                            {/* FEATURE 3: PDF download button */}
                            <button
                              onClick={() => generateSupplierPDF(supplier)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                              title="Download PDF Report"
                            >
                              <FileDown size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === GRNs & INVOICES TAB === */}
      {activeTab === "grns" && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex flex-col md:flex-row gap-3 items-center">
            {selectedSupplier && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-sm">
                <Building2 size={14} className="text-blue-600" />
                <span className="text-blue-700 font-medium">{selectedSupplier.name}</span>
                <button onClick={() => setSelectedSupplier(null)} className="text-blue-400 hover:text-blue-600">
                  <X size={14} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">Select a GRN → Generate Invoice → Then Record Payment</p>
            {/* FEATURE 2: Bulk Invoice Generation */}
            <button
              onClick={handleBulkGenerateInvoices}
              disabled={bulkGenerating}
              className="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Receipt size={14} />
              {bulkGenerating ? "Generating..." : "Generate All Invoices"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">GRN #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Invoice</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Payment Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {supplierGrns.map((grn) => {
                  const invoice = getInvoiceForGrn(grn._id);
                  const hasInvoice = !!invoice;
                  const isPaid = invoice?.paymentStatus === "Paid" || grn.status === "Paid";
                  const overdue = hasInvoice && isInvoiceOverdue(invoice);

                  return (
                    <tr key={grn._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{grn.grnNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{grn.supplier}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {grn.createdAt ? new Date(grn.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="text-right px-4 py-3 font-medium">{formatCurrency(grn.totalAmount)}</td>
                      <td className="text-center px-4 py-3">
                        {hasInvoice ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {invoice.invoiceNumber}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Not generated
                          </span>
                        )}
                      </td>
                      <td className="text-center px-4 py-3">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Paid
                            </span>
                          ) : hasInvoice && invoice.paymentStatus === "Partially Paid" ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              Partial ({formatCurrency(invoice.paidAmount)})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Unpaid
                            </span>
                          )}
                          {/* FEATURE 1: Overdue badge */}
                          {overdue && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        {!hasInvoice ? (
                          <button
                            onClick={() => {
                              setSelectedGrn(grn);
                              setShowInvoiceModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                          >
                            <Receipt size={12} /> Generate Invoice
                          </button>
                        ) : !isPaid ? (
                          <button
                            onClick={() => {
                              setPaymentForm({
                                invoiceId: invoice._id,
                                paidAmount:
                                  invoice.pendingAmount || invoice.totalAmount - (invoice.paidAmount || 0),
                                paymentMethod: "Cash",
                                paymentType: "full",
                                reference: "",
                                notes: "",
                              });
                              setShowPaymentModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                          >
                            <CreditCard size={12} /> Pay
                          </button>
                        ) : (
                          <span className="text-green-600 text-xs font-medium">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {supplierGrns.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No GRNs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === PAYMENT HISTORY TAB === */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex flex-col md:flex-row gap-3 items-start md:items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
              />
            </div>
            {selectedSupplier && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg text-sm">
                <Building2 size={14} className="text-blue-600" />
                <span className="text-blue-700 font-medium">{selectedSupplier.name}</span>
                <button onClick={() => setSelectedSupplier(null)} className="text-blue-400 hover:text-blue-600">
                  <X size={14} />
                </button>
              </div>
            )}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="Cleared">Cleared</option>
              <option value="Pending">Pending</option>
              <option value="Bounced">Bounced</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Payment #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{payment.paymentNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{payment.supplierName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 font-semibold text-green-700">
                      {formatCurrency(payment.paidAmount)}
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.paymentType === "Full"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "Cleared"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "Bounced"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setViewPayment(payment);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        {/* FEATURE 7: Delete payment button */}
                        <button
                          onClick={() => handleDeletePayment(payment)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete payment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === FEATURE 5: AGEING TAB === */}
      {activeTab === "ageing" && (
        <div className="space-y-6">
          {/* Ageing summary bars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(ageingData).map(([key, bucket]) => {
              const colors = {
                "0-7": "bg-green-50 border-green-200 text-green-700",
                "8-15": "bg-yellow-50 border-yellow-200 text-yellow-700",
                "16-30": "bg-orange-50 border-orange-200 text-orange-700",
                "30+": "bg-red-50 border-red-200 text-red-700",
              };
              return (
                <div key={key} className={`rounded-xl p-4 shadow-sm border ${colors[key]}`}>
                  <p className="text-xs font-medium opacity-75">{bucket.label}</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(bucket.total)}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {Object.keys(bucket.suppliers).length} supplier(s)
                  </p>
                </div>
              );
            })}
          </div>

          {/* Ageing bar visualization */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ageing Distribution</h3>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {(() => {
                const grandTotal = Object.values(ageingData).reduce((s, b) => s + b.total, 0);
                if (grandTotal === 0)
                  return <div className="w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No pending amounts</div>;
                const barColors = ["bg-green-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];
                return Object.values(ageingData).map((bucket, i) => {
                  const pct = (bucket.total / grandTotal) * 100;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={i}
                      className={`${barColors[i]} flex items-center justify-center text-xs text-white font-medium`}
                      style={{ width: `${pct}%` }}
                      title={`${bucket.label}: ${formatCurrency(bucket.total)}`}
                    >
                      {pct > 10 ? `${Math.round(pct)}%` : ""}
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400"></span>0–7d</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400"></span>8–15d</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400"></span>16–30d</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span>30+d</span>
            </div>
          </div>

          {/* Ageing table by supplier */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-700">Supplier-wise Ageing Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">0–7 days</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">8–15 days</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">16–30 days</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">30+ days</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Collect all suppliers across all buckets
                    const allSupps = new Set();
                    Object.values(ageingData).forEach((b) => {
                      Object.keys(b.suppliers).forEach((s) => allSupps.add(s));
                    });
                    const suppArray = Array.from(allSupps).sort();
                    if (suppArray.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            No pending invoices
                          </td>
                        </tr>
                      );
                    }
                    return suppArray.map((suppName) => {
                      const a = ageingData["0-7"].suppliers[suppName] || 0;
                      const b = ageingData["8-15"].suppliers[suppName] || 0;
                      const c = ageingData["16-30"].suppliers[suppName] || 0;
                      const d = ageingData["30+"].suppliers[suppName] || 0;
                      return (
                        <tr key={suppName} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{suppName}</td>
                          <td className="text-right px-4 py-3 text-green-700">{a > 0 ? formatCurrency(a) : "—"}</td>
                          <td className="text-right px-4 py-3 text-yellow-700">{b > 0 ? formatCurrency(b) : "—"}</td>
                          <td className="text-right px-4 py-3 text-orange-700">{c > 0 ? formatCurrency(c) : "—"}</td>
                          <td className="text-right px-4 py-3 text-red-700">{d > 0 ? formatCurrency(d) : "—"}</td>
                          <td className="text-right px-4 py-3 font-semibold">{formatCurrency(a + b + c + d)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === GENERATE INVOICE MODAL === */}
      {showInvoiceModal && selectedGrn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Generate Invoice from GRN</h2>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedGrn(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">GRN Number</span>
                  <span className="font-medium text-blue-800">{selectedGrn.grnNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Supplier</span>
                  <span className="font-medium text-blue-800">{selectedGrn.supplier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Total Amount</span>
                  <span className="font-bold text-blue-800">{formatCurrency(selectedGrn.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Items</span>
                  <span className="font-medium text-blue-800">{selectedGrn.items?.length || 0} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Received Date</span>
                  <span className="font-medium text-blue-800">
                    {selectedGrn.createdAt ? new Date(selectedGrn.createdAt).toLocaleDateString("en-IN") : "—"}
                  </span>
                </div>
              </div>

              {selectedGrn.items && selectedGrn.items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">Items in this GRN</div>
                  <div className="max-h-40 overflow-y-auto">
                    {selectedGrn.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between px-3 py-2 text-xs border-t">
                        <span className="text-gray-700">
                          {item.product} ({item.receivedQty || item.quantity} {item.unit})
                        </span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  placeholder="Any remarks..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedGrn(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === RECORD PAYMENT MODAL === */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedSupplier && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-blue-700 font-medium">{selectedSupplier.name}</p>
                  <p className="text-blue-500 text-xs">{selectedSupplier.supplierID}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i._id === e.target.value);
                    const pending = inv ? inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0) : "";
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: e.target.value,
                      paidAmount: pending,
                      paymentType: "full",
                    });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                >
                  <option value="">Select invoice...</option>
                  {pendingInvoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} — {inv.supplierName} — {formatCurrency(inv.totalAmount)} (Pending:{" "}
                      {formatCurrency(inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0))})
                    </option>
                  ))}
                </select>
                {pendingInvoices.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No pending invoices. Generate an invoice from a GRN first.
                  </p>
                )}
              </div>

              {paymentForm.invoiceId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inv = invoices.find((i) => i._id === paymentForm.invoiceId);
                        const pending = inv ? inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0) : "";
                        setPaymentForm({ ...paymentForm, paymentType: "full", paidAmount: pending });
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                        paymentForm.paymentType !== "partial"
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Full Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, paymentType: "partial", paidAmount: "" })}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                        paymentForm.paymentType === "partial"
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Partial Payment
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                  {paymentForm.invoiceId && paymentForm.paymentType !== "partial" && (
                    <span className="text-green-600 text-xs ml-2">(Full pending amount)</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.paidAmount}
                  onChange={(e) => {
                    if (e.target.value === "" || parseFloat(e.target.value) >= 0)
                      setPaymentForm({ ...paymentForm, paidAmount: e.target.value });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                  placeholder={paymentForm.paymentType === "partial" ? "Enter partial amount" : "Full pending amount"}
                  readOnly={paymentForm.paymentType !== "partial" && !!paymentForm.invoiceId}
                />
                {paymentForm.paymentType === "partial" &&
                  paymentForm.invoiceId &&
                  (() => {
                    const inv = invoices.find((i) => i._id === paymentForm.invoiceId);
                    const pending = inv ? inv.pendingAmount || inv.totalAmount - (inv.paidAmount || 0) : 0;
                    return <p className="text-xs text-gray-500 mt-1">Max payable: {formatCurrency(pending)}</p>;
                  })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                  placeholder="Cheque no / UTR / Txn ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm hover:bg-[#6B3410]"
              >
                {paymentForm.paymentType === "partial" ? "Record Partial Payment" : "Record Full Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === VIEW PAYMENT MODAL === */}
      {showViewModal && viewPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ["Payment #", viewPayment.paymentNumber],
                ["Supplier", viewPayment.supplierName || "—"],
                ["Date", viewPayment.paymentDate ? new Date(viewPayment.paymentDate).toLocaleDateString("en-IN") : "—"],
                ["Method", viewPayment.paymentMethod],
                ["Invoice Amount", formatCurrency(viewPayment.invoiceAmount)],
                ["Paid Amount", formatCurrency(viewPayment.paidAmount)],
                ["Type", viewPayment.paymentType],
                ["Status", viewPayment.status],
                ["Reference", viewPayment.reference || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              {viewPayment.notes && (
                <div className="text-sm">
                  <span className="text-gray-500">Notes:</span>
                  <p className="mt-1 text-gray-700">{viewPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end p-5 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPaymentTracking;
