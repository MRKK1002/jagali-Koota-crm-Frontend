import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Search,
  RefreshCw,
  FileText,
  Download,
  Printer,
  TrendingUp,
  Building2,
  ShoppingCart,
  AlertCircle,
  Eye,
  Calendar,
  X,
  Package,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";

const SupplierLedger = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Filter suppliers based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.companyName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          supplier.supplierID?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchQuery, suppliers]);

  // Build transactions when supplier, invoices or payments change
  useEffect(() => {
    if (selectedSupplier && (invoices.length > 0 || payments.length > 0)) {
      buildTransactions();
    }
  }, [selectedSupplier, invoices, payments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSupplierDropdown(false);
      }
    };

    if (showSupplierDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSupplierDropdown]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [suppliersResponse, invoicesResponse, paymentsResponse] =
        await Promise.all([
          axios.get("https://crm.jagalikoota.com/res/supplier"),
          axios.get("https://crm.jagalikoota.com/api/v1/restaurant/invoice"),
          axios.get("https://crm.jagalikoota.com/api/v1/restaurant/payment"),
        ]);

      const fetchedSuppliers = suppliersResponse.data.data || [];
      const invoicesData = invoicesResponse.data.success
        ? invoicesResponse.data.data || []
        : [];
      const paymentsData = paymentsResponse.data.success
        ? paymentsResponse.data.data || []
        : [];

      setSuppliers(fetchedSuppliers);
      setFilteredSuppliers(fetchedSuppliers);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Please try again.");
      toast.error("Failed to fetch data. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  // Match supplier helper - matches invoices with suppliers
  const matchSupplier = (invoice, supplier) => {
    if (!invoice || !supplier) return false;

    // Get supplier name from invoice (can be populated object or direct field)
    const invoiceSupplierName =
      invoice.supplierName ||
      (typeof invoice.supplier === "object"
        ? invoice.supplier?.name
        : invoice.supplier) ||
      "";
    const invoiceSupplierNameLower = invoiceSupplierName
      .toString()
      .toLowerCase()
      .trim();

    // Get supplier identifiers
    const supplierName = supplier.name?.toLowerCase().trim() || "";
    const supplierCompany = supplier.companyName?.toLowerCase().trim() || "";
    const supplierID = supplier.supplierID?.toLowerCase().trim() || "";

    // Also check GRN supplier field as fallback
    const grnSupplier = (invoice.grn?.supplier || invoice.grnId?.supplier || "")
      .toString()
      .toLowerCase()
      .trim();

    return (
      invoiceSupplierNameLower === supplierName ||
      invoiceSupplierNameLower === supplierCompany ||
      invoiceSupplierNameLower === supplierID ||
      grnSupplier === supplierName ||
      grnSupplier === supplierCompany ||
      (supplierName &&
        (invoiceSupplierNameLower.includes(supplierName) ||
          supplierName.includes(invoiceSupplierNameLower))) ||
      (supplierCompany &&
        (invoiceSupplierNameLower.includes(supplierCompany) ||
          supplierCompany.includes(invoiceSupplierNameLower)))
    );
  };

  // Build transactions from invoices and payments
  const buildTransactions = () => {
    if (!selectedSupplier) {
      setTransactions([]);
      return;
    }

    const transactionList = [];

    // Get invoices for selected supplier
    const supplierInvoices = invoices.filter((inv) =>
      matchSupplier(inv, selectedSupplier)
    );

    // Get payments for this supplier's invoices
    const supplierPayments = payments.filter((payment) => {
      // Payment model uses 'invoice' field, not 'invoiceId'
      const paymentInvoiceId =
        typeof payment.invoice === "object"
          ? payment.invoice?._id
          : payment.invoice;
      // Also check invoiceId for backward compatibility
      const paymentInvoiceIdAlt =
        typeof payment.invoiceId === "object"
          ? payment.invoiceId?._id
          : payment.invoiceId;
      const paymentInvoiceIdStr = paymentInvoiceId?.toString();
      const paymentInvoiceIdAltStr = paymentInvoiceIdAlt?.toString();

      return supplierInvoices.some((inv) => {
        const invId = inv._id?.toString() || inv.id?.toString();
        return (
          invId === paymentInvoiceIdStr || invId === paymentInvoiceIdAltStr
        );
      });
    });

    // Add invoice transactions
    supplierInvoices.forEach((invoice) => {
      const invoiceDate = invoice.invoiceDate
        ? new Date(invoice.invoiceDate)
        : new Date();

      // Get items quantity from invoice items or GRN items
      let quantity = 0;
      if (invoice.items && Array.isArray(invoice.items)) {
        quantity = invoice.items.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
      } else if (invoice.grn?.items && Array.isArray(invoice.grn.items)) {
        quantity = invoice.grn.items.reduce(
          (sum, item) => sum + (item.receivedQty || item.quantity || 0),
          0
        );
      } else if (invoice.grnId?.items && Array.isArray(invoice.grnId.items)) {
        quantity = invoice.grnId.items.reduce(
          (sum, item) => sum + (item.receivedQty || item.quantity || 0),
          0
        );
      }

      // Get GRN number from populated grn or grnId field
      const grnNumber =
        invoice.grn?.grnNumber ||
        invoice.grnId?.grnNumber ||
        invoice.grnNumber ||
        "";

      transactionList.push({
        id: `invoice-${invoice._id || invoice.id}`,
        date: invoiceDate.toISOString().split("T")[0],
        invoiceNumber: invoice.invoiceNumber,
        quantity: quantity,
        invoiceValue: invoice.amount || invoice.totalAmount || 0,
        paymentMade: 0,
        balance: 0,
        remark: grnNumber
          ? `GRN: ${grnNumber}`
          : `Invoice: ${invoice.invoiceNumber}`,
        type: "Invoice",
        transactionData: invoice,
      });
    });

    // Add payment transactions
    supplierPayments.forEach((payment) => {
      const relatedInvoice = supplierInvoices.find((inv) => {
        const invId = inv._id?.toString() || inv.id?.toString();
        // Payment model uses 'invoice' field
        const payInvId = (
          typeof payment.invoice === "object"
            ? payment.invoice?._id
            : payment.invoice
        )?.toString();
        const payInvIdAlt = (
          payment.invoiceId?._id || payment.invoiceId
        )?.toString();
        return invId === payInvId || invId === payInvIdAlt;
      });

      const paymentDate = payment.paymentDate
        ? new Date(payment.paymentDate)
        : new Date();

      transactionList.push({
        id: `payment-${payment._id || payment.id}`,
        date: paymentDate.toISOString().split("T")[0],
        invoiceNumber:
          relatedInvoice?.invoiceNumber ||
          payment.paymentNumber ||
          `PAY-${payment._id || payment.id}`,
        quantity: 0,
        invoiceValue: 0,
        paymentMade: payment.paidAmount || payment.amount || 0,
        balance: 0,
        remark: `Payment: ${
          payment.paymentMethod?.replace("_", " ").toUpperCase() || "Payment"
        }${
          relatedInvoice ? ` (Invoice: ${relatedInvoice.invoiceNumber})` : ""
        }${payment.reference ? ` - Ref: ${payment.reference}` : ""}`,
        type: "Payment",
        transactionData: payment,
      });
    });

    // Sort by date
    transactionList.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    const openingBalance = selectedSupplier?.openingBalance || 0;
    let runningBalance = openingBalance;

    transactionList.forEach((transaction) => {
      runningBalance =
        runningBalance + transaction.invoiceValue - transaction.paymentMade;
      transaction.balance = runningBalance;
    });

    // Filter by date range if provided
    let filtered = transactionList;
    if (fromDate || toDate) {
      filtered = transactionList.filter((t) => {
        const transactionDate = new Date(t.date);
        if (fromDate && transactionDate < new Date(fromDate)) return false;
        if (toDate && transactionDate > new Date(toDate)) return false;
        return true;
      });
    }

    setTransactions(filtered);
  };

  // Get supplier summary
  const getSupplierSummary = () => {
    if (!selectedSupplier) {
      return {
        totalPurchases: 0,
        paidAmount: 0,
        pendingAmount: 0,
        purchaseOrders: 0,
      };
    }

    const supplierInvoices = invoices.filter((inv) =>
      matchSupplier(inv, selectedSupplier)
    );
    const supplierPayments = payments.filter((payment) => {
      // Payment model uses 'invoice' field
      const paymentInvoiceId =
        typeof payment.invoice === "object"
          ? payment.invoice?._id
          : payment.invoice;
      const paymentInvoiceIdAlt =
        typeof payment.invoiceId === "object"
          ? payment.invoiceId?._id
          : payment.invoiceId;
      const paymentInvoiceIdStr = paymentInvoiceId?.toString();
      const paymentInvoiceIdAltStr = paymentInvoiceIdAlt?.toString();

      return supplierInvoices.some((inv) => {
        const invId = inv._id?.toString() || inv.id?.toString();
        return (
          invId === paymentInvoiceIdStr || invId === paymentInvoiceIdAltStr
        );
      });
    });

    const totalPurchases = supplierInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.amount || 0),
      0
    );
    const paidAmount = supplierPayments.reduce(
      (sum, pay) => sum + (pay.paidAmount || pay.amount || 0),
      0
    );
    const pendingAmount = totalPurchases - paidAmount;

    return {
      totalPurchases,
      paidAmount,
      pendingAmount,
      purchaseOrders: supplierInvoices.length,
    };
  };

  // Get overall summary
  const getOverallSummary = () => {
    const allInvoices = invoices;
    const allPayments = payments;

    const totalPurchases = allInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.amount || 0),
      0
    );
    const totalPaid = allPayments.reduce(
      (sum, pay) => sum + (pay.paidAmount || pay.amount || 0),
      0
    );
    const totalOutstanding = totalPurchases - totalPaid;

    // Count active suppliers (suppliers with invoices)
    const suppliersWithInvoices = new Set();
    invoices.forEach((inv) => {
      const supplierName =
        inv.supplierName ||
        (typeof inv.supplier === "object"
          ? inv.supplier?.name
          : inv.supplier) ||
        inv.grn?.supplier ||
        inv.grnId?.supplier;
      if (supplierName) {
        suppliersWithInvoices.add(supplierName.toString());
      }
    });

    return {
      totalOutstanding,
      activeSuppliers: suppliersWithInvoices.size,
      totalPurchases,
    };
  };

  const supplierSummary = getSupplierSummary();
  const overallSummary = getOverallSummary();

  // Get closing balance
  const getClosingBalance = () => {
    if (transactions.length === 0) {
      return selectedSupplier?.openingBalance || 0;
    }
    return transactions[transactions.length - 1].balance;
  };

  const closingBalance = getClosingBalance();
  const openingBalance = selectedSupplier?.openingBalance || 0;

  // Handle supplier select
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDropdown(false);
    setSearchQuery("");
    toast.success(`Selected supplier: ${supplier.name}`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Clear dates
  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
    buildTransactions();
    toast.info("Date filter cleared", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Export to Excel
  const handleExportToExcel = () => {
    if (transactions.length === 0) {
      toast.error("No data to export", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const worksheetData = [
      [
        "Date",
        "Invoice No.",
        "Quantity",
        "Invoice Value",
        "Payment Made",
        "Balance",
        "Remark",
      ],
      ...transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.invoiceNumber,
        t.quantity,
        t.invoiceValue,
        t.paymentMade,
        t.balance,
        t.remark,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Ledger");
    XLSX.writeFile(workbook, `Supplier-Ledger-${Date.now()}.xlsx`);
    toast.success("Excel file downloaded successfully!");
  };

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  // Aging report
  const handleAgingReport = () => {
    toast.info("Aging Report feature coming soon!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (transactions.length === 0) {
      toast.error("No data to export", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Supplier Ledger Report", 14, 22);

      doc.setFontSize(12);
      doc.text(`Supplier: ${selectedSupplier?.name || "N/A"}`, 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);

      const tableData = transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.invoiceNumber,
        t.quantity.toString(),
        `₹${t.invoiceValue.toFixed(2)}`,
        `₹${t.paymentMade.toFixed(2)}`,
        `₹${t.balance.toFixed(2)}`,
        t.remark.substring(0, 30),
      ]);

      // Use autoTable function directly
      autoTable(doc, {
        head: [
          [
            "Date",
            "Invoice No.",
            "Quantity",
            "Invoice Value",
            "Payment Made",
            "Balance",
            "Remark",
          ],
        ],
        body: tableData,
        startY: 45,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      doc.save(`Supplier-Ledger-${Date.now()}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <ToastContainer />

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
            color: "#4f46e5",
          }}
        >
          Supplier Ledger
        </h1>

        {/* Search Suppliers Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: "300px",
          }}
        >
          <div
            style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
          >
            Search Suppliers
          </div>
          <div
            style={{ display: "flex", gap: "8px", position: "relative" }}
            ref={dropdownRef}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                placeholder="Search supplier"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSupplierDropdown(true);
                }}
                onFocus={() => setShowSupplierDropdown(true)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  border: "2px solid #4f46e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Search
                size={18}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
            </div>
            <button
              onClick={fetchData}
              style={{
                padding: "10px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            {/* Supplier Dropdown */}
            {showSupplierDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: "50px",
                  backgroundColor: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  marginTop: "4px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {filteredSuppliers.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    No suppliers found
                  </div>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const supplierInvoices = invoices.filter((inv) =>
                      matchSupplier(inv, supplier)
                    );
                    const supplierPayments = payments.filter((payment) => {
                      const paymentInvoiceId =
                        typeof payment.invoice === "object"
                          ? payment.invoice?._id
                          : payment.invoice;
                      const paymentInvoiceIdAlt =
                        typeof payment.invoiceId === "object"
                          ? payment.invoiceId?._id
                          : payment.invoiceId;
                      return supplierInvoices.some((inv) => {
                        const invId = inv._id?.toString() || inv.id?.toString();
                        return (
                          invId === paymentInvoiceId?.toString() ||
                          invId === paymentInvoiceIdAlt?.toString()
                        );
                      });
                    });
                    const totalPurchases = supplierInvoices.reduce(
                      (sum, inv) => sum + (inv.totalAmount || inv.amount || 0),
                      0
                    );
                    const totalPaid = supplierPayments.reduce(
                      (sum, pay) => sum + (pay.paidAmount || pay.amount || 0),
                      0
                    );
                    const balance = totalPurchases - totalPaid;
                    const status = balance > 0 ? "overdue" : "current";

                    return (
                      <div
                        key={supplier._id}
                        onClick={() => handleSupplierSelect(supplier)}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor:
                            selectedSupplier?._id === supplier._id
                              ? "#f3f4f6"
                              : "white",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSupplier?._id !== supplier._id)
                            e.target.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSupplier?._id !== supplier._id)
                            e.target.style.backgroundColor = "white";
                        }}
                      >
                        <div style={{ fontWeight: "600", color: "#1f2937" }}>
                          {supplier.supplierID} - {supplier.name} (
                          {supplier.companyName})
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                          }}
                        >
                          Balance: ₹{balance.toFixed(2)} | Status:{" "}
                          <span
                            style={{
                              color:
                                status === "overdue" ? "#ef4444" : "#10b981",
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedSupplier ? (
        /* Empty State */
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "60px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Search size={64} color="#9ca3af" style={{ margin: "0 auto 20px" }} />
          <h2
            style={{
              margin: "0 0 12px 0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Select a Supplier to View Ledger
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Use the search box above to find and select a supplier to view their
            detailed ledger information, transactions, and balance.
          </p>
        </div>
      ) : (
        <>
          {/* Supplier Details Card */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <FileText size={20} color="#4f46e5" />
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                Supplier Details
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
              }}
            >
              {/* Basic Information */}
              <div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}
                >
                  BASIC INFORMATION
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Contact Name:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Company:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.companyName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Supplier ID:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.supplierID || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      GST Number:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.gst || selectedSupplier.gstin || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      PAN Number:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.pan || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Billing Address:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.billingAddress ||
                        selectedSupplier.address ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}
                >
                  CONTACT INFORMATION
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Phone Number:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.contact ||
                        selectedSupplier.phone ||
                        "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Email:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    textTransform: "uppercase",
                  }}
                >
                  FINANCIAL INFORMATION
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Payment Terms:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {selectedSupplier.paymentTerms || "30 days"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Total Purchases:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      ₹{supplierSummary.totalPurchases.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Paid Amount:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#10b981",
                        fontWeight: "500",
                      }}
                    >
                      ₹{supplierSummary.paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Pending Amount:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#ef4444",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ₹{supplierSummary.pendingAmount.toFixed(2)}
                      {supplierSummary.pendingAmount > 0 && (
                        <AlertCircle size={16} />
                      )}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Purchase Orders:{" "}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1f2937",
                        fontWeight: "500",
                      }}
                    >
                      {supplierSummary.purchaseOrders}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter Card */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  From Date
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      buildTransactions();
                    }}
                    style={{
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      width: "150px",
                    }}
                  />
                  <Calendar
                    size={18}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  To Date
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      buildTransactions();
                    }}
                    style={{
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      width: "150px",
                    }}
                  />
                  <Calendar
                    size={18}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleClearDates}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  height: "40px",
                }}
              >
                Clear Dates
              </button>
            </div>
            <div
              style={{
                backgroundColor: "#e0e7ff",
                color: "#4f46e5",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Total Transactions: {transactions.length}
            </div>
          </div>

          {/* Supplier Ledger Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FileText size={20} color="#4f46e5" />
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  Supplier Ledger ({transactions.length})
                </h2>
              </div>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            {/* Opening Balance */}
            <div
              style={{
                backgroundColor: "#e0e7ff",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#4f46e5",
              }}
            >
              Opening Balance: ₹{openingBalance.toFixed(2)}
            </div>

            {/* Table */}
            {transactions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                No transactions found
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Invoice No.
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Invoice Value
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Payment Made
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Balance
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Remark
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr
                        key={transaction.id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor:
                            index % 2 === 0 ? "white" : "#f9fafb",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#374151",
                          }}
                        >
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#374151",
                            fontFamily: "monospace",
                          }}
                        >
                          {transaction.invoiceNumber}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#374151",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {transaction.quantity > 0 && (
                            <>
                              <Package size={16} color="#6b7280" />
                              {transaction.quantity} items
                            </>
                          )}
                          {transaction.quantity === 0 && "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#374151",
                            textAlign: "right",
                            fontWeight: "500",
                          }}
                        >
                          {transaction.invoiceValue > 0
                            ? `₹${transaction.invoiceValue.toFixed(2)}`
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#10b981",
                            textAlign: "right",
                            fontWeight: "500",
                          }}
                        >
                          {transaction.paymentMade > 0
                            ? `₹${transaction.paymentMade.toFixed(2)}`
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            textAlign: "right",
                            fontWeight: "600",
                            color:
                              transaction.balance >= 0 ? "#ef4444" : "#10b981",
                          }}
                        >
                          ₹{transaction.balance.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            color: "#374151",
                          }}
                        >
                          {transaction.remark}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {transaction.type === "Invoice" ? (
                            <button
                              onClick={() => {
                                setViewTransaction(transaction);
                                setShowViewModal(true);
                              }}
                              style={{
                                padding: "6px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#4f46e5",
                              }}
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setViewTransaction(transaction);
                                setShowViewModal(true);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "8px",
                                backgroundColor:
                                  transaction.transactionData?.paymentMethod ===
                                  "cash"
                                    ? "#10b981"
                                    : transaction.transactionData
                                        ?.paymentMethod === "bank_transfer"
                                    ? "#3b82f6"
                                    : transaction.transactionData
                                        ?.paymentMethod === "cheque"
                                    ? "#f59e0b"
                                    : transaction.transactionData
                                        ?.paymentMethod === "online"
                                    ? "#8b5cf6"
                                    : "#6b7280",
                                color: "white",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "36px",
                                height: "36px",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "scale(1.05)";
                                e.target.style.boxShadow =
                                  "0 4px 8px rgba(0,0,0,0.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)";
                                e.target.style.boxShadow = "none";
                              }}
                              title={`${
                                transaction.transactionData?.paymentMethod
                                  ? transaction.transactionData.paymentMethod.replace(
                                      "_",
                                      " "
                                    )
                                  : "Payment"
                              }: ₹${transaction.paymentMade.toFixed(2)}`}
                            >
                              <CreditCard size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Closing Balance */}
            <div
              style={{
                backgroundColor: "#e0e7ff",
                padding: "12px 16px",
                borderRadius: "8px",
                marginTop: "16px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#4f46e5",
              }}
            >
              Closing Balance: ₹{closingBalance.toFixed(2)}
            </div>
          </div>
        </>
      )}

      {/* Action Buttons - Always Visible */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "30px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={handleExportToExcel}
          disabled={!selectedSupplier || transactions.length === 0}
          style={{
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor:
              selectedSupplier && transactions.length > 0
                ? "pointer"
                : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            opacity: selectedSupplier && transactions.length > 0 ? 1 : 0.6,
          }}
        >
          <Download size={18} />
          Export to Excel
        </button>
        <button
          onClick={handlePrintReport}
          disabled={!selectedSupplier || transactions.length === 0}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor:
              selectedSupplier && transactions.length > 0
                ? "pointer"
                : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            opacity: selectedSupplier && transactions.length > 0 ? 1 : 0.6,
          }}
        >
          <Printer size={18} />
          Print Report
        </button>
        <button
          onClick={handleAgingReport}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <TrendingUp size={18} />
          Aging Report
        </button>
      </div>

      {/* Summary Cards - Always Visible */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Total Outstanding
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#ef4444",
                }}
              >
                ₹{overallSummary.totalOutstanding.toFixed(2)}
              </p>
            </div>
            <AlertCircle size={32} color="#ef4444" />
          </div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #10b981",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Active Suppliers
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                {overallSummary.activeSuppliers}
              </p>
            </div>
            <Building2 size={32} color="#10b981" />
          </div>
        </div>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #4f46e5",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Total Purchases
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#4f46e5",
                }}
              >
                ₹{overallSummary.totalPurchases.toFixed(2)}
              </p>
            </div>
            <ShoppingCart size={32} color="#4f46e5" />
          </div>
        </div>
      </div>

      {/* View Transaction Modal */}
      {showViewModal && viewTransaction && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowViewModal(false);
            setViewTransaction(null);
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                {viewTransaction.type === "Invoice"
                  ? "Invoice Details"
                  : "Payment Details"}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewTransaction(null);
                }}
                style={{
                  padding: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  Date:
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#1f2937",
                  }}
                >
                  {new Date(viewTransaction.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  Invoice Number:
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#1f2937",
                    fontFamily: "monospace",
                  }}
                >
                  {viewTransaction.invoiceNumber}
                </p>
              </div>

              {viewTransaction.type === "Invoice" && (
                <>
                  {viewTransaction.quantity > 0 && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Total Quantity:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.quantity} items
                      </p>
                    </div>
                  )}
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "600",
                      }}
                    >
                      Invoice Value:
                    </span>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "16px",
                        color: "#1f2937",
                        fontWeight: "600",
                      }}
                    >
                      ₹{viewTransaction.invoiceValue.toFixed(2)}
                    </p>
                  </div>
                  {(viewTransaction.transactionData?.grn ||
                    viewTransaction.transactionData?.grnId) && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        GRN Number:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.grn?.grnNumber ||
                          viewTransaction.transactionData.grnId?.grnNumber ||
                          viewTransaction.transactionData.grn ||
                          viewTransaction.transactionData.grnId}
                      </p>
                    </div>
                  )}
                  {(viewTransaction.transactionData?.supplierName ||
                    viewTransaction.transactionData?.supplier) && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Supplier:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.supplierName ||
                          (typeof viewTransaction.transactionData.supplier ===
                          "object"
                            ? viewTransaction.transactionData.supplier?.name
                            : viewTransaction.transactionData.supplier)}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.invoiceDate && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Invoice Date:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {new Date(
                          viewTransaction.transactionData.invoiceDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.dueDate && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Due Date:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {new Date(
                          viewTransaction.transactionData.dueDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.status && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Status:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.status}
                      </p>
                    </div>
                  )}

                  {/* Products Purchased */}
                  {(() => {
                    const items =
                      viewTransaction.transactionData?.items ||
                      viewTransaction.transactionData?.grn?.items ||
                      viewTransaction.transactionData?.grnId?.items;
                    return (
                      items &&
                      Array.isArray(items) &&
                      items.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "600",
                            }}
                          >
                            Products Purchased:
                          </span>
                          <div
                            style={{
                              marginTop: "8px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: "#f9fafb" }}>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "left",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#374151",
                                      borderBottom: "1px solid #e5e7eb",
                                    }}
                                  >
                                    Product
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#374151",
                                      borderBottom: "1px solid #e5e7eb",
                                    }}
                                  >
                                    Qty
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#374151",
                                      borderBottom: "1px solid #e5e7eb",
                                    }}
                                  >
                                    Rate
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#374151",
                                      borderBottom: "1px solid #e5e7eb",
                                    }}
                                  >
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    style={{
                                      borderBottom:
                                        idx < items.length - 1
                                          ? "1px solid #e5e7eb"
                                          : "none",
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "8px",
                                        fontSize: "12px",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {item.name ||
                                        item.product ||
                                        item.productName ||
                                        "N/A"}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "right",
                                        fontSize: "12px",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {item.quantity || item.receivedQty || 0}{" "}
                                      {item.unit || "pcs"}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "right",
                                        fontSize: "12px",
                                        color: "#1f2937",
                                      }}
                                    >
                                      ₹{(item.rate || 0).toFixed(2)}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        textAlign: "right",
                                        fontSize: "12px",
                                        color: "#1f2937",
                                        fontWeight: "500",
                                      }}
                                    >
                                      ₹{(item.amount || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    );
                  })()}
                </>
              )}

              {viewTransaction.type === "Payment" && (
                <>
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: "600",
                      }}
                    >
                      Payment Amount:
                    </span>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "16px",
                        color: "#10b981",
                        fontWeight: "600",
                      }}
                    >
                      ₹{viewTransaction.paymentMade.toFixed(2)}
                    </p>
                  </div>
                  {viewTransaction.transactionData?.paymentMethod && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Payment Method:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.paymentMethod
                          .replace("_", " ")
                          .toUpperCase()}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.paymentDate && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Payment Date:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {new Date(
                          viewTransaction.transactionData.paymentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {(viewTransaction.transactionData?.reference ||
                    viewTransaction.transactionData?.referenceNumber) && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Reference Number:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.reference ||
                          viewTransaction.transactionData.referenceNumber}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.notes && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Notes:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.notes}
                      </p>
                    </div>
                  )}
                  {viewTransaction.transactionData?.status && (
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        Status:
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "14px",
                          color: "#1f2937",
                        }}
                      >
                        {viewTransaction.transactionData.status}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  Remark:
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#1f2937",
                  }}
                >
                  {viewTransaction.remark}
                </p>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: "600",
                  }}
                >
                  Balance After Transaction:
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    color: viewTransaction.balance >= 0 ? "#ef4444" : "#10b981",
                    fontWeight: "600",
                  }}
                >
                  ₹{viewTransaction.balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewTransaction(null);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
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

export default SupplierLedger;
