import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  FileText,
  DollarSign,
  Package,
  Search,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Pencil,
  X,
  Share2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  downloadPurchaseOrderPdf,
  sharePurchaseOrderPdf,
} from "@/utils/purchaseOrderPdf";

const API_URL = import.meta.env.VITE_API_URL || "https://crm.jagalikoota.com/api/v1";
// const API_URL = "https://crm.jagalikoota.com/api/v1";
// Correct route map:
//   suppliers       → /api/v1/restaurant/supplier
//   purchase-orders → /api/v1/restaurant/purchase-orders
//   grn             → /api/v1/hotel/grn
//   raw-material    → /api/v1/hotel/raw-material
const PurchaseManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on route
  const getActiveTabFromRoute = () => {
    const path = location.pathname;
    if (path.includes("store-location")) {
      return "suppliers";
    }
    if (path.includes("supplier")) {
      return "suppliers";
    } else if (
      path.includes("purchase-orders") ||
      path.includes("purchase-order")
    ) {
      return "purchase-orders";
    } else if (path.includes("grn") || path.includes("GRN")) {
      return "grn";
    } else if (path.includes("pending")) {
      return "pending";
    } else if (path.includes("raw-material")) {
      return "raw-materials";
    }
    return "suppliers"; // default
  };

  // State management
  const [activeTab, setActiveTab] = useState(getActiveTabFromRoute());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    companyName: "",
    contact: "",
    email: "",
    billingAddress: "",
    gst: "",
    pan: "",
    branchId: "",
  });
  const [supplierFieldErrors, setSupplierFieldErrors] = useState({});

  // Purchase Orders state
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [viewingPO, setViewingPO] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [poForm, setPoForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    branch: { id: "", name: "", address: "" },
    storeLocationId: "",
    orderDate: "",
    deliveryDate: "",
    // Rows are added via the "search & add" box in the Items section
    items: [],
    notes: "",
    paymentTerms: "30",
    taxRate: 0,
  });

  // State for material search (per-row, used to change an already-added item)
  const [materialSearchInputs, setMaterialSearchInputs] = useState({});
  const [materialSearchResults, setMaterialSearchResults] = useState({});

  // State for the "search & add item" box at the top of the PO Items section
  const [poItemSearch, setPoItemSearch] = useState("");
  const [poItemSearchOpen, setPoItemSearchOpen] = useState(false);

  // Delete confirmation for POs and GRNs
  // { type: 'po' | 'grn', id, label }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // GRN state
  const [grns, setGrns] = useState([]);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showViewGRNModal, setShowViewGRNModal] = useState(false);
  const [viewingGRN, setViewingGRN] = useState(null);
  const [editingGRN, setEditingGRN] = useState(null);
  // Guards against double-submit (rapid clicks / retries) creating duplicate GRNs
  const [grnSubmitting, setGrnSubmitting] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [grnForm, setGrnForm] = useState({
    grnNumber: "",
    poId: "",
    poNumber: "",
    supplier: "",
    supplierId: "",
    branch: "",
    branchId: "",
    storeType: "Main Store",
    storeLocationId: "",
    items: [],
    totalQuantity: 0,
    subtotal: 0,
    taxRate: 0,
    totalTax: 0,
    totalAmount: 0,
    status: "Pending",
    notes: "",
    receivedBy: "",
    createdBy: "",
  });

  // Additional data
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  // false = only the slim variant is loaded (no populated supplier details)
  const [rawMaterialsAreFull, setRawMaterialsAreFull] = useState(false);

  // Raw Materials state (for Raw Material management tab)
  const [materialInput, setMaterialInput] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");
  const [materialDistributionUnit, setMaterialDistributionUnit] = useState("");
  const [materialConversionFactor, setMaterialConversionFactor] = useState("");
  const [materialSelectedSuppliers, setMaterialSelectedSuppliers] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialError, setMaterialError] = useState("");
  const [materialLoading, setMaterialLoading] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialUnitFilter, setMaterialUnitFilter] = useState("all");
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState("all");
  const [materialCategories, setMaterialCategories] = useState([]);
  const [materialCategory, setMaterialCategory] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [poStats, setPoStats] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  // Purchase Orders are filtered server-side, so re-query when the search text
  // or month changes. Debounced at 400 ms so typing doesn't fire a request per
  // keystroke — each round trip to this server costs ~1 s.
  useEffect(() => {
    if (activeTab !== "purchase-orders") return;
    const t = setTimeout(() => {
      fetchPurchaseOrders({ search: searchTerm, month: filterMonth });
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, filterMonth, activeTab]);

  // Sync active tab with route changes
  useEffect(() => {
    const tabFromRoute = getActiveTabFromRoute();
    if (tabFromRoute !== activeTab) {
      setActiveTab(tabFromRoute);
    }
  }, [location.pathname]);

  // Ensure suppliers and raw materials are fetched when PO modal opens
  useEffect(() => {
    if (showPOModal) {
      if (suppliers.length === 0) {
        fetchSuppliers();
      }
      if (rawMaterials.length === 0) {
        fetchRawMaterials();
      }
    }
  }, [showPOModal]);

  // Ensure purchase orders and store locations are fetched when GRN modal opens
  useEffect(() => {
    if (showGRNModal) {
      if (purchaseOrders.length === 0) {
        fetchPurchaseOrders();
      }
      if (storeLocations.length === 0) {
        fetchStoreLocations();
      }
    }
  }, [showGRNModal]);

  // The View PO modal resolves item names from rawMaterials. Since that list is
  // now loaded in the background (it's 217 KB and must not block first paint),
  // make sure it's present before the modal needs it — otherwise item names
  // would fall back to showing raw ObjectIds.
  useEffect(() => {
    if (showViewModal && rawMaterials.length === 0) {
      fetchRawMaterials({ minimal: true });
    }
  }, [showViewModal]);
  useEffect(() => {
    if (grnForm.items.length > 0) {
      const newTax = grnForm.items.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || 0;
        const rate = parseFloat(item.gstRate) || 0;
        return sum + (amount * rate) / 100;
      }, 0);
      if (Math.abs(newTax - (grnForm.totalTax || 0)) > 0.01) {
        setGrnForm(prev => ({ ...prev, totalTax: newTax }));
      }
    }
  }, [grnForm.items]);

  // PERF NOTES — this runs on every tab switch, so it must not refetch
  // everything each time.
  //
  //  * Reference data (suppliers/branches/categories/store locations/UOMs/raw
  //    materials) is shared by all tabs and changes rarely, so it is fetched
  //    only when empty. Every mutation handler already refreshes its own
  //    dataset, so this stays correct.
  //  * Raw materials is a ~217 KB / ~3.4 s response — by far the slowest call.
  //    Only the tabs that actually need it request it. The PO and GRN modals
  //    have their own "fetch if empty" effects as a safety net.
  //  * Tab-specific calls run in parallel. They used to be sequential `await`s,
  //    which cost one full round trip each (~1 s per call on this server).
  // PERF — measured against the live API: every round trip costs ~1 s
  // (~0.54 s TCP+TLS, ~0.45 s server overhead) and /hotel/raw-material is
  // 217 KB / ~3.4 s. Mongo itself answers in 26–142 ms, so the cost is
  // per-request overhead and payload size, not query time.
  //
  // Therefore:
  //  1. Only AWAIT what the visible table needs. Everything else loads in the
  //     background so the spinner clears as soon as the tab's own rows arrive.
  //     Previously the 3.4 s raw-material call was awaited, so the table sat
  //     blocked behind data it only needs for item-name lookups.
  //  2. Reference data is fetched once, not on every tab switch.
  //  3. Tab data runs in parallel, never sequential awaits.
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // ── critical path: what this tab must have to render ──
      const critical = [];
      if (activeTab === "purchase-orders") {
        critical.push(fetchPurchaseOrders());
      } else if (activeTab === "grn") {
        critical.push(fetchGRNs());
      } else if (activeTab === "pending") {
        critical.push(fetchPendingPOs(), fetchPOStats());
      } else if (activeTab === "raw-materials") {
        // This tab IS the raw-material list and shows supplier details, so it
        // needs the full records — refetch if only the slim variant is loaded.
        if (rawMaterials.length === 0 || !rawMaterialsAreFull) {
          critical.push(fetchRawMaterials());
        }
      }

      // ── background: needed for modals / name lookups, not for first paint ──
      const background = [];
      if (suppliers.length === 0) background.push(fetchSuppliers());
      if (branches.length === 0) background.push(fetchBranches());
      if (categories.length === 0) background.push(fetchCategories());
      if (storeLocations.length === 0) background.push(fetchStoreLocations());
      if (uoms.length === 0) background.push(fetchUOMs());
      if (materialCategories.length === 0) background.push(fetchMaterialCategories());

      // Heavy (217 KB). Needed to resolve item names in PO/GRN rows and to
      // power the material search in the PO modal — but never for first paint.
      const needsRawMaterials =
        activeTab === "purchase-orders" || activeTab === "grn";
      if (needsRawMaterials && rawMaterials.length === 0) {
        // slim variant — these screens only need to pick a material
        background.push(fetchRawMaterials({ minimal: true }));
      }

      // GRN tab needs the PO list for its "create from PO" dropdown, but the
      // GRN table itself doesn't depend on it.
      if (activeTab === "grn") background.push(fetchPurchaseOrders());

      // deliberately not awaited — failures are logged inside each fetcher
      Promise.all(background).catch((e) =>
        console.error("Background fetch failed:", e)
      );

      await Promise.all(critical);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch UOMs for Raw Material unit selection
  const fetchUOMs = async () => {
    try {
      const res = await axios.get(`${API_URL.replace('/api/v1', '')}/UOM`);
      const data = res.data.data || res.data || [];
      setUoms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching UOMs:", err);
    }
  };

  // Fetch raw material categories
  const fetchMaterialCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/hotel/matCategory`);
      const data = res.data.data || res.data || [];
      setMaterialCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching material categories:", err);
    }
  };

  // Raw Material management functions
  const handleMaterialSubmit = async (e) => {
    e?.preventDefault();

    const trimmedName = materialInput.trim();
    console.log("📦 Material Submit - Name:", trimmedName, "| Code:", materialCode, "| Unit:", materialUnit);

    if (!trimmedName) {
      setMaterialError("Please enter a material name");
      toast.error("Please enter material name");
      return;
    }
    if (!materialUnit || !materialUnit.trim()) {
      setMaterialError("Please select or enter a unit");
      toast.error("Please select or enter a unit");
      return;
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = rawMaterials.some(
      (m) =>
        m.name.toLowerCase() === trimmedName.toLowerCase() &&
        m._id !== editingMaterial
    );

    if (isDuplicate) {
      setMaterialError("A raw material with this name already exists");
      toast.error("A raw material with this name already exists");
      return;
    }

    try {
      setMaterialLoading(true);
      setMaterialError("");

      if (editingMaterial) {
        const existingMaterial = rawMaterials.find((m) => m._id === editingMaterial);
        
        // Merge existing supplier entries with newly selected ones
        const existingSupplierIds = (existingMaterial?.suppliers || [])
          .filter(s => s && s.supplier)
          .map(s => (typeof s.supplier === 'object' ? s.supplier._id : s.supplier));

        // Build supplier entries: keep existing ones, add new ones with defaults
        const allSelectedIds = materialSelectedSuppliers;
        const supplierEntries = allSelectedIds.map(supId => {
          const existing = (existingMaterial?.suppliers || []).find(s => {
            const sId = typeof s.supplier === 'object' ? s.supplier._id : s.supplier;
            return String(sId) === String(supId);
          });
          return existing || { supplier: supId, quantity: 0, price: 0 };
        });

        const payload = {
          name: trimmedName,
          code: materialCode.trim(),
          unit: materialUnit.trim(),
          category: materialCategory || existingMaterial?.category || "General",
          minLevel: existingMaterial?.minLevel || 5,
          suppliers: supplierEntries,
          description: existingMaterial?.description || "",
          distributionUnit: materialDistributionUnit && materialDistributionUnit !== "none" ? materialDistributionUnit : null,
          conversionFactor: materialConversionFactor ? Number(materialConversionFactor) : null,
        };

        await axios.put(`${API_URL}/hotel/raw-material/${editingMaterial}`, payload);
        setEditingMaterial(null);
        toast.success("Raw material updated successfully");
      } else {
        const supplierEntries = materialSelectedSuppliers.map(supId => ({
          supplier: supId,
          quantity: 0,
          price: 0,
        }));

        const payload = {
          name: trimmedName,
          code: materialCode.trim(),
          unit: materialUnit.trim(),
          category: materialCategory || "General",
          minLevel: 5,
          description: "",
          suppliers: supplierEntries,
          distributionUnit: materialDistributionUnit && materialDistributionUnit !== "none" ? materialDistributionUnit : null,
          conversionFactor: materialConversionFactor ? Number(materialConversionFactor) : null,
        };

        const res = await axios.post(`${API_URL}/hotel/raw-material`, payload);
        const newMaterial = res.data.data;
        toast.success("Raw material added successfully");

        // Scroll to the new item after a short delay
        setTimeout(() => {
          const row = document.getElementById(`material-row-${newMaterial._id}`);
          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
            row.classList.add("bg-green-50");
            setTimeout(() => row.classList.remove("bg-green-50"), 2000);
          }
        }, 400);
      }

      // Reset form and refresh table
      setMaterialInput("");
      setMaterialCode("");
      setMaterialUnit("");
      setMaterialCategory("");
      setMaterialDistributionUnit("");
      setMaterialConversionFactor("");
      setMaterialSelectedSuppliers([]);
      setMaterialError("");
      await fetchRawMaterials();
    } catch (err) {
      console.error("Error saving material:", err);

      let msg = "Failed to save material";
      if (err.response?.data) {
        if (err.response.data.error) {
          msg = err.response.data.error;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          if (Array.isArray(errors)) {
            msg = errors.join(", ");
          } else if (typeof errors === 'object') {
            msg = Object.values(errors).join(", ");
          }
        } else if (typeof err.response.data === 'string') {
          msg = err.response.data;
        }
      } else if (err.message) {
        msg = err.message;
      }

      setMaterialError(msg);
      toast.error(msg);
    } finally {
      setMaterialLoading(false);
    }
  };

  const handleMaterialDelete = async (id) => {
    setMaterialToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmMaterialDelete = async () => {
    if (!materialToDelete) return;

    try {
      await axios.delete(`${API_URL}/hotel/raw-material/${materialToDelete}`);
      setRawMaterials(rawMaterials.filter((m) => m._id !== materialToDelete));
      toast.success("Raw material deleted successfully");
      setShowDeleteDialog(false);
      setMaterialToDelete(null);
    } catch (err) {
      console.error("Error deleting material:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete material";
      setMaterialError(msg);
      toast.error(msg);
      setShowDeleteDialog(false);
      setMaterialToDelete(null);
    }
  };

  const handleEditMaterial = (material) => {
    setMaterialInput(material.name);
    setMaterialCode(material.code || "");
    setMaterialUnit(material.unit || "");
    setMaterialCategory(material.category || "");
    setMaterialDistributionUnit(material.distributionUnit || "");
    setMaterialConversionFactor(material.conversionFactor ? String(material.conversionFactor) : "");
    // Restore selected supplier IDs from existing supplier entries
    const existingSupplierIds = (material.suppliers || [])
      .filter(s => s && s.supplier)
      .map(s => (typeof s.supplier === 'object' ? s.supplier._id : s.supplier));
    setMaterialSelectedSuppliers(existingSupplierIds);
    setEditingMaterial(material._id);
    setMaterialError("");
    // Scroll to form
    setTimeout(() => {
      const form = document.getElementById("material-form");
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setEditingMaterial(null);
    setMaterialInput("");
    setMaterialCode("");
    setMaterialUnit("");
    setMaterialCategory("");
    setMaterialDistributionUnit("");
    setMaterialConversionFactor("");
    setMaterialSelectedSuppliers([]);
    setMaterialError("");
  };

  // Filter and search materials
  const filteredMaterials = rawMaterials.filter((m) => {
    const searchLower = materialSearchTerm.toLowerCase();
    const matchesSearch = m.name?.toLowerCase().includes(searchLower) ||
      (m.code && m.code.toLowerCase().includes(searchLower));
    const matchesUnit =
      materialUnitFilter === "all" || m.unit === materialUnitFilter;
    const matchesCategory =
      materialCategoryFilter === "all" || m.category === materialCategoryFilter;
    return matchesSearch && matchesUnit && matchesCategory;
  });

  // Get unique units for filter
  const uniqueUnits = [
    ...new Set(rawMaterials.map((m) => m.unit).filter(Boolean)),
  ].sort();

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/restaurant/supplier`);

      // Handle different response structures
      let suppliersData = [];

      if (response.data?.data && Array.isArray(response.data.data)) {
        suppliersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        suppliersData = response.data;
      } else if (
        response.data?.suppliers &&
        Array.isArray(response.data.suppliers)
      ) {
        suppliersData = response.data.suppliers;
      }

      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
    }
  };

  const fetchBranches = async () => {
    try {
      // Fetch branches from Restaurant Setup (Restaurant Profile)
      const response = await axios.get(
        `${API_URL}/hotel/getAllRestaurants?all=true`
      );

      // Extract only the restaurants array from the response
      let branchesData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Standard response structure: { success: true, data: [...], pagination: {...} }
        branchesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        branchesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Nested data array
        branchesData = response.data.data;
      }
      // Filter to only include valid restaurant branch objects
      branchesData = branchesData.filter((item) => {
        // Must be an object with an ID
        if (!item || typeof item !== "object" || (!item._id && !item.id)) {
          return false;
        }

        // Get the name field
        const name = item.branchName || item.restaurantName || item.name;

        // Exclude items where the name is clearly invalid:
        // - Numbers (like "50")
        // - Very short strings (like "Qt", "a")
        // - Empty strings
        if (name && typeof name === "string") {
          const trimmedName = name.trim();
          // If it's a number or very short, exclude it
          if (trimmedName.length < 2 || /^\d+$/.test(trimmedName)) {
            return false;
          }
        }

        // Keep items with valid IDs (even if name is missing, they'll show as "Unnamed Branch")
        return true;
      });

      // Normalize branch data structure to ensure consistent field names
      const normalizedBranches = branchesData.map((b) => {
        // Get address from nested address object or string
        let branchAddress = "";
        if (b.address) {
          if (typeof b.address === "string") {
            branchAddress = b.address;
          } else if (b.address.street) {
            const addressParts = [];
            if (b.address.street) addressParts.push(b.address.street);
            if (b.address.city) addressParts.push(b.address.city);
            if (b.address.state) addressParts.push(b.address.state);
            branchAddress = addressParts.join(", ");
          }
        }

        return {
          ...b,
          _id: b._id || b.id,
          branchName: b.branchName || b.restaurantName || b.name || "",
          restaurantName: b.restaurantName || b.branchName || "",
          // Keep original fields but also add normalized name for easy access
          name: b.branchName || b.restaurantName || b.name || "",
          address: branchAddress,
        };
      });


      setBranches(normalizedBranches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      console.error("Error details:", error.response?.data);
      setBranches([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/hotel/category`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStoreLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/hotel/store-location`);
      setStoreLocations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching store locations:", error);
    }
  };

  // `minimal: true` asks the API to skip populating full supplier documents.
  // The PO/GRN screens only need name/code/unit + supplier ids, which cuts this
  // response from ~217 KB to ~30 KB. The Raw Materials tab needs the full
  // records (it displays supplier details), so it calls this without the flag.
  const fetchRawMaterials = async ({ minimal = false } = {}) => {
    try {
      const params = { limit: 500 };
      if (minimal) params.minimal = "true";

      const response = await axios.get(`${API_URL}/hotel/raw-material`, { params });
      const data = response.data?.data || response.data || [];
      setRawMaterials(Array.isArray(data) ? data : []);
      // Track which variant is in state so a later tab needing full records
      // knows it must refetch.
      setRawMaterialsAreFull(!minimal);
    } catch (error) {
      console.error("Error fetching raw materials:", error);
    }
  };

  // Filtering is done by the API (search + month), not in the browser, so the
  // client no longer downloads every purchase order to show a filtered handful.
  // `opts` lets callers override the current filter state (used by the debounce).
  const fetchPurchaseOrders = async (opts = {}) => {
    try {
      const search = opts.search !== undefined ? opts.search : searchTerm;
      const month = opts.month !== undefined ? opts.month : filterMonth;

      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (month && month !== "all") params.month = month;

      const response = await axios.get(`${API_URL}/restaurant/purchase-orders`, {
        params,
      });

      // Handle {data:[...]} shape (RestaurantPurchaseRoutes returns this)
      let ordersData = [];
      if (Array.isArray(response.data?.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response.data?.purchaseOrders)) {
        ordersData = response.data.purchaseOrders;
      }

      setPurchaseOrders(ordersData);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setPurchaseOrders([]);
    }
  };

  const fetchPendingPOs = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/restaurant/purchase-orders/pending`
      );
      setPendingPOs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pending POs:", error);
    }
  };

  const fetchPOStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/restaurant/purchase-orders/stats`
      );
      setPoStats(response.data.data);
    } catch (error) {
      console.error("Error fetching PO stats:", error);
    }
  };

  const fetchGRNs = async () => {
    try {
      const response = await axios.get(`${API_URL}/hotel/grn`, {
        params: { limit: 1000 }
      });
      // Controller returns { status:'success', data:[...] }
      const data = response.data?.data || response.data || [];
      setGrns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
    }
  };

  // Filter functions
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export suppliers to Excel
  const handleExportSuppliers = () => {
    const data = filteredSuppliers.map((s, idx) => ({
      "S.No": idx + 1,
      "Name": s.name || "",
      "Company Name": s.companyName || "",
      "Contact": s.contact || "",
      "Email": s.email || "",
      "GST": s.gst || "",
      "PAN": s.pan || "",
      "Billing Address": s.billingAddress || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "Suppliers.xlsx");
    toast.success("Suppliers exported to Excel");
  };

  // Export raw materials to Excel
  const handleExportRawMaterials = () => {
    const data = filteredMaterials.map((m, idx) => ({
      "S.No": idx + 1,
      "Code": m.code || "",
      "Material Name": m.name || "",
      "Unit": m.unit || "",
      "Distribution Unit": m.distributionUnit && m.conversionFactor
        ? `1 ${m.unit} = ${m.conversionFactor} ${m.distributionUnit}`
        : "",
      "Suppliers": m.suppliers && m.suppliers.length > 0
        ? m.suppliers
            .filter(s => s && s.supplier)
            .map(s => typeof s.supplier === 'object' ? s.supplier.name : suppliers.find(sup => sup._id === s.supplier)?.name || "")
            .filter(Boolean)
            .join(", ")
        : "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Raw Materials");
    XLSX.writeFile(wb, "Raw_Materials.xlsx");
    toast.success("Raw materials exported to Excel");
  };

  // Supplier form handlers
  const resetSupplierForm = () => {
    setSupplierForm({
      name: "",
      companyName: "",
      contact: "",
      email: "",
      billingAddress: "",
      gst: "",
      pan: "",
      branchId: "",
    });
    setSupplierFieldErrors({});
    setEditingSupplier(null);
  };

  const validateSupplierForm = () => {
    const errors = {};
    const f = supplierForm;

    if (!f.name?.trim()) errors.name = "Supplier Name is required";
    if (!f.companyName?.trim()) errors.companyName = "Company Name is required";
    if (!f.contact?.trim()) {
      errors.contact = "Contact Number is required";
    } else if (!/^\d{10}$/.test(f.contact.replace(/\D/g, ""))) {
      errors.contact = "Contact must be exactly 10 digits";
    }
    if (f.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!f.billingAddress?.trim()) errors.billingAddress = "Billing Address is required";

    setSupplierFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();

    if (!validateSupplierForm()) return;

    try {
      const contactDigits = supplierForm.contact.trim().replace(/\D/g, "");
      const payload = {
        name: supplierForm.name.trim(),
        companyName: supplierForm.companyName.trim(),
        contact: contactDigits,
        billingAddress: supplierForm.billingAddress.trim(),
      };

      // Add optional fields only if provided
      if (supplierForm.email?.trim()) {
        payload.email = supplierForm.email.trim().toLowerCase();
      }
      if (supplierForm.gst?.trim()) {
        payload.gst = supplierForm.gst.trim().toUpperCase();
      }
      if (supplierForm.pan?.trim()) {
        payload.pan = supplierForm.pan.trim().toUpperCase();
      }

      if (editingSupplier) {
        await axios.put(
          `${API_URL}/restaurant/supplier/${editingSupplier._id}`,
          payload
        );
        toast.success("Supplier updated successfully");
      } else {
        await axios.post(`${API_URL}/restaurant/supplier/add`, payload);
        toast.success("Supplier created successfully");
      }
      setShowSupplierModal(false);
      resetSupplierForm();
      await fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      const errorData = error.response?.data;
      let errorMessage = "Failed to save supplier";

      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        // Show field-level error if backend returns a field
        if (errorData.field) {
          setSupplierFieldErrors((prev) => ({
            ...prev,
            [errorData.field]: errorMessage,
          }));
          return;
        }
      }
      toast.error(errorMessage);
    }
  };

  // ── Purchase Order PDF (vendor-facing) ───────────────────────────────────
  // Deliberately excludes payment status, payment progress and GRN/invoice
  // counts — those are internal tracking and must not go to the supplier.

  const downloadPOPdf = async (po) => {
    try {
      await downloadPurchaseOrderPdf(po, suppliers);
      toast.success("Purchase Order PDF downloaded");
    } catch (err) {
      console.error("PO PDF error:", err);
      toast.error("Could not generate the PDF");
    }
  };

  // Share via the native share sheet (WhatsApp / email on mobile & tablet).
  // Falls back to a plain download where the Web Share API is unavailable.
  const sharePOPdf = async (po) => {
    try {
      const how = await sharePurchaseOrderPdf(po, suppliers);
      if (how === "downloaded") {
        toast.info("Sharing isn't supported on this device — the PDF was downloaded instead");
      }
    } catch (err) {
      if (err?.name === "AbortError") return; // user dismissed the share sheet
      console.error("PO share error:", err);
      toast.error("Could not share the PDF");
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/restaurant/supplier/${id}`);
      toast.success("Supplier deleted successfully");
      await fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    }
  };

  // PO form handlers
  const resetPOForm = () => {
    setPoForm({
      supplierId: "",
      invoiceNumber: "",
      branch: { id: "", name: "", address: "" },
      storeLocationId: "",
      orderDate: "",
      deliveryDate: "",
      items: [],
      notes: "",
      paymentTerms: "30",
      taxRate: 0,
    });
    setEditingPO(null);
    setMaterialSearchInputs({});
    setMaterialSearchResults({});
    setPoItemSearch("");
    setPoItemSearchOpen(false);
  };

  // GRN tax total — item-wise, mirroring the GRN model's own calculation
  const computeGrnTax = (items) =>
    (items || []).reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const rate = parseFloat(item.gstRate) || 0;
      return sum + (amount * rate) / 100;
    }, 0);

  // Delete a Purchase Order or a GRN (confirmed via the dialog)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { type, id, label } = deleteTarget;

    try {
      setDeleting(true);

      if (type === "po") {
        await axios.delete(`${API_URL}/restaurant/purchase-orders/${id}`);
        toast.success(`Purchase order ${label} deleted`);
        await fetchPurchaseOrders();
      } else {
        await axios.delete(`${API_URL}/hotel/grn/${id}?force=true`);
        toast.success(`GRN ${label} deleted`);
        await fetchGRNs();
        // A deleted GRN frees its PO up again, so refresh those too
        await fetchPurchaseOrders();
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${type === "po" ? "purchase order" : "GRN"}`
      );
    } finally {
      setDeleting(false);
    }
  };

  // Raw materials available for the PO — narrowed to the selected supplier when
  // one is chosen, otherwise the full list.
  const getPOAvailableMaterials = () => {
    if (!poForm.supplierId) return rawMaterials;
    return rawMaterials.filter((m) =>
      (m.suppliers || []).some((s) => {
        const sId = typeof s.supplier === "object" ? s.supplier._id : s.supplier;
        return String(sId) === String(poForm.supplierId);
      })
    );
  };

  // Append a raw material as a new PO line item (used by the search & add box)
  const addPOItemFromMaterial = (material) => {
    if (!material?._id) return;

    // Don't allow the same material twice — point the user at the existing row
    const alreadyAdded = poForm.items.some(
      (item) => String(item.name) === String(material._id)
    );
    if (alreadyAdded) {
      toast.error(`${material.name} is already added`);
      setPoItemSearch("");
      setPoItemSearchOpen(false);
      return;
    }

    // Fetch last purchase rate for this material
    axios
      .get(`${API_URL}/restaurant/purchase-orders/last-rates`, {
        params: { materialIds: material._id },
      })
      .then((res) => {
        const rateInfo = res.data?.data?.[material._id];
        if (rateInfo) {
          setPoForm((prev) => {
            const updated = [...prev.items];
            const idx = updated.findIndex((it) => String(it.name) === String(material._id));
            if (idx !== -1) {
              updated[idx].previousRate = rateInfo.rate;
              updated[idx].previousPO = rateInfo.poNumber;
            }
            return { ...prev, items: updated };
          });
        }
      })
      .catch(() => {});

    setPoForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: material._id,
          quantity: "",
          unit: material.unit || "pcs",
          rate: "",
          tax: 0,
          amount: "",
          previousRate: null,
          previousPO: null,
        },
      ],
    }));

    setPoItemSearch("");
    setPoItemSearchOpen(false);
  };

  const handlePOCreate = async (e) => {
    e.preventDefault();
    try {
      // Totals are driven entirely by per-item tax now.
      // subtotal = pre-tax base, tax = sum of each item's tax, total = both.
      // (Previously an order-level taxRate was applied on top of line amounts
      // that already included tax, which double-taxed the order.)
      const subtotal = poForm.items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        return sum + qty * rate;
      }, 0);

      const tax = poForm.items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const taxPercent = parseFloat(item.tax) || 0;
        return sum + (qty * rate * taxPercent) / 100;
      }, 0);

      const total = subtotal + tax;

      // Clean up payload - only send valid fields that match the schema
      const payload = {
        supplierId: poForm.supplierId || undefined,
        supplierName: poForm.supplierName || undefined,
        // Must be undefined (not "") when blank — the schema index is
        // unique+sparse, and sparse ignores null/undefined but NOT empty
        // strings, so a second blank "" would trip a duplicate key error.
        invoiceNumber: poForm.invoiceNumber?.trim() || undefined,
        branch: {
          id: poForm.branch.id,
          name: poForm.branch.name,
          address: poForm.branch.address,
        },
        storeLocationId: poForm.storeLocationId || undefined,
        storeLocation: poForm.storeLocationId
          ? {
              id: poForm.storeLocationId,
              name:
                storeLocations.find((loc) => loc._id === poForm.storeLocationId)
                  ?.name || "",
            }
          : undefined,
        storeType:
          storeLocations.find((loc) => loc._id === poForm.storeLocationId)
            ?.name || undefined,
        orderDate: poForm.orderDate
          ? new Date(poForm.orderDate).toISOString()
          : undefined,
        deliveryDate: poForm.deliveryDate
          ? new Date(poForm.deliveryDate).toISOString()
          : undefined,
        items: poForm.items
          .filter((item) => item.name && item.quantity && item.rate)
          .map((item) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const taxPercent = parseFloat(item.tax) || 0;
            const baseAmount = qty * rate;
            const taxAmount = (baseAmount * taxPercent) / 100;
            return {
              name: item.name,
              quantity: qty,
              unit: item.unit || "pcs",
              rate,
              // Per-item tax — each raw material can have its own rate
              tax: taxPercent,
              taxAmount: parseFloat(taxAmount.toFixed(2)),
              amount: parseFloat(item.amount) || baseAmount + taxAmount,
            };
          }),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        // Kept at 0 for schema/back-compat — tax is per item now, not order-wide
        taxRate: 0,
        paymentTerms: poForm.paymentTerms || "30",
        notes: poForm.notes || "",
        status: "Pending", // Exact enum value
        paymentStatus: "Pending", // Exact enum value
      };

      // Validate required fields before sending
      if (
        !payload.branch?.id ||
        !payload.branch?.name ||
        !payload.branch?.address
      ) {
        toast.error("Please select a branch");
        return;
      }

      if (payload.items.length === 0) {
        toast.error("Add at least one item with quantity and rate");
        return;
      }

      // Guard against negative qty/rate slipping through — they flip the line
      // amount and the order total negative
      const invalidItem = payload.items.find(
        (item) => item.quantity <= 0 || item.rate < 0
      );
      if (invalidItem) {
        const material = rawMaterials.find(
          (m) => String(m._id) === String(invalidItem.name)
        );
        toast.error(
          `Invalid quantity or rate for ${material?.name || "an item"}`
        );
        return;
      }
      if (!payload.orderDate || !payload.deliveryDate) {
        toast.error("Please select order date and delivery date");
        return;
      }
      if (!payload.items || payload.items.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      // Remove undefined/null/empty fields (but keep required ones)
      const requiredFields = ["branch", "orderDate", "deliveryDate", "items"];
      Object.keys(payload).forEach((key) => {
        if (
          !requiredFields.includes(key) &&
          (payload[key] === undefined ||
            payload[key] === null ||
            payload[key] === "")
        ) {
          delete payload[key];
        }
      });

      console.log("PO Payload:", JSON.stringify(payload, null, 2));

      if (editingPO) {
        await axios.put(
          `${API_URL}/restaurant/purchase-orders/${editingPO._id}`,
          payload
        );
        toast.success("Purchase order updated successfully");
      } else {
        await axios.post(`${API_URL}/restaurant/purchase-orders`, payload);
        toast.success("Purchase order created successfully");
      }
      setShowPOModal(false);
      resetPOForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving PO:", error);
      console.error("Error response:", error.response?.data);

      // Get detailed error message
      let errorMessage = "Failed to save purchase order";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast.error(errorMessage);
    }
  };
  const handleGRNSubmit = async (e) => {
    e.preventDefault();
    // Prevent duplicate submissions from rapid double-clicks or retries.
    if (grnSubmitting) return;
    setGrnSubmitting(true);
    try {
      // Validate that at least one item has received quantity
      const hasReceivedItems = grnForm.items.some(
        (item) =>
          parseFloat(item.receivedQuantity || item.receivedQty || item.acceptedQuantity || 0) > 0
      );

      if (!hasReceivedItems) {
        toast.error("Please enter received quantities for at least one item");
        return;
      }

      // Calculate totals - use acceptedQuantity for accurate totals
      const totalQuantity = grnForm.items.reduce((sum, item) => 
        sum + (item.acceptedQuantity || item.receivedQty || item.receivedQuantity || 0), 0);
      const subtotal = grnForm.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalAmount = subtotal + (grnForm.totalTax || 0); // Include tax in total

      console.log("💰 GRN Calculation Summary:", {
        totalQuantity,
        subtotal: subtotal.toFixed(2),
        taxRate: grnForm.taxRate,
        totalTax: (grnForm.totalTax || 0).toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        itemsBreakdown: grnForm.items.map(item => ({
          product: item.product,
          receivedQty: item.receivedQuantity,
          damagedQty: item.damagedQuantity,
          acceptedQty: item.acceptedQuantity,
          rate: item.rate,
          amount: item.amount
        }))
      });

      const payload = {
        grnNumber: editingGRN ? (grnForm.grnNumber || "") : undefined, // Only send grnNumber when editing; let backend auto-generate for new
        poId: grnForm.poId || undefined, // Convert empty string to undefined
        poNumber: grnForm.poNumber || undefined,
        supplier: grnForm.supplier,
        supplierId: grnForm.supplierId || undefined,
        branch: grnForm.branch,
        branchId: grnForm.branchId || undefined,
        storeType: grnForm.storeType || undefined,
        storeLocationId: grnForm.storeLocationId || undefined,
        items: grnForm.items
          .filter(item => parseFloat(item.receivedQuantity || item.receivedQty || item.acceptedQuantity || 0) > 0) // Only include items with received quantity
          .map(item => {
            // Use form values (receivedQuantity, damagedQuantity) first, then fall back to database values
            const receivedQty = Number(item.receivedQuantity || item.receivedQty || item.quantity || 0);
            const rejectedQty = Number(item.damagedQuantity || item.rejectedQty || 0);
            const acceptedQty = Number(item.acceptedQuantity || Math.max(0, receivedQty - rejectedQty));
            
            return {
              product: item.product,
              description: item.description || "",
              quantity: Number(item.quantity) || 0,
              receivedQty: Number(receivedQty),
              acceptedQty: Number(acceptedQty),
              rejectedQty: Number(rejectedQty),
              rate: Number(item.rate) || 0,
              unit: item.unit || "pcs",
              amount: Number(item.amount) || Number(acceptedQty) * Number(item.rate || 0),
              gstRate: Number(item.gstRate) || 0,
              supplier: item.supplier || "",
              branch: item.branch || "",
              category: item.category || "",
              poNumber: item.poNumber || "",
              storeType: grnForm.storeType || item.storeType || "Main Store",
            };
          }),
        totalQuantity,
        taxRate: grnForm.taxRate || 0,
        totalTax: grnForm.totalTax,
        totalAmount,
        status: grnForm.status,
        notes: grnForm.notes,
        receivedBy: grnForm.receivedBy || "Admin",
        createdBy: grnForm.createdBy || "Admin",
      };

      // Remove undefined fields to avoid sending them to backend (but keep items array)
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined && key !== "items") {
          delete payload[key];
        }
      });

     

      if (editingGRN) {
        const response = await axios.put(`${API_URL}/hotel/grn/${editingGRN._id}`, payload);
        const ok = response.data?.status === "success" || response.data?.success || response.data?.data;
        if (ok) toast.success("GRN updated successfully");
        else throw new Error(response.data?.message || "Failed to update GRN");
      } else {
        const response = await axios.post(`${API_URL}/hotel/grn`, payload);
        const ok = response.data?.status === "success" || response.data?.success || response.data?.data;
        if (ok) {
          const grnNumber = response.data?.data?.grnNumber || "";
          toast.success(`GRN created successfully${grnNumber ? ` — ${grnNumber}` : ""}`);
        } else {
          throw new Error(response.data?.message || "Failed to create GRN");
        }
      }

      setShowGRNModal(false);
      resetGRNForm();
      await fetchGRNs(); // Wait for fetch to complete
    } catch (error) {
      console.error("Error saving GRN:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Failed to save GRN";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Show validation errors if present
        if (errorData.errors) {
          console.error("Validation errors:", errorData.errors);
          errorMessage += ": " + JSON.stringify(errorData.errors);
        }
      }

      toast.error(errorMessage);
    } finally {
      setGrnSubmitting(false);
    }
  };
  const resetGRNForm = () => {
    setGrnForm({
      grnNumber: "",
      poId: undefined, // Use undefined instead of empty string for ObjectId fields
      poNumber: "",
      supplier: "",
      supplierId: undefined, // Use undefined instead of empty string for ObjectId fields
      branch: "",
      branchId: undefined, // Use undefined instead of empty string for ObjectId fields
      storeType: "Main Store",
      storeLocationId: undefined, // Use undefined instead of empty string for ObjectId fields
      items: [],
      totalQuantity: 0,
      totalTax: 0,
      totalAmount: 0,
      status: "Pending",
      notes: "",
      receivedBy: "",
      createdBy: "",
    });
    setEditingGRN(null);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Purchase Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage suppliers, purchase orders, GRNs, and raw materials
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          // Update URL based on tab selection
          const basePath = "/restaurant/purchase";
          if (value === "suppliers") {
            navigate(`${basePath}/supplier`);
          } else if (value === "purchase-orders") {
            navigate(`${basePath}/purchase-orders`);
          } else if (value === "grn") {
            navigate(`${basePath}/GRN`);
          } else if (value === "pending") {
            navigate(`${basePath}/pending`);
          } else if (value === "raw-materials") {
            navigate(`${basePath}/raw-material`);
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="grn">GRN</TabsTrigger>
          {/* <TabsTrigger value="pending">Pending POs</TabsTrigger> */}
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Suppliers / Vendors</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  onClick={() => {
                    resetSupplierForm();
                    setShowSupplierModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportSuppliers}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[15%]">Name</TableHead>
                      <TableHead className="w-[10%]">Contact</TableHead>
                      <TableHead className="w-[15%]">Email</TableHead>
                      <TableHead className="w-[12%]">GST</TableHead>
                      <TableHead className="w-[10%]">PAN</TableHead>
                      <TableHead className="w-[25%]">Billing Address</TableHead>
                      <TableHead className="w-[13%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>{supplier.contact}</TableCell>
                        <TableCell className="text-sm">{supplier.email}</TableCell>
                        <TableCell className="text-sm">{supplier.gst || "—"}</TableCell>
                        <TableCell className="text-sm">{supplier.pan || "—"}</TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-xs truncate" title={supplier.billingAddress}>
                            {supplier.billingAddress || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingSupplier(supplier);
                                setSupplierForm({
                                  name: supplier.name || "",
                                  companyName: supplier.companyName || "",
                                  contact: supplier.contact || "",
                                  email: supplier.email || "",
                                  billingAddress: supplier.billingAddress || "",
                                  gst: supplier.gst || "",
                                  pan: supplier.pan || "",
                                  branchId: supplier.branchId || "",
                                });
                                setSupplierFieldErrors({});
                                setShowSupplierModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteSupplier(supplier._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Materials Tab */}
        <TabsContent value="raw-materials">
          <div className="space-y-4">
            {/* Statistics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Materials</p>
                      <p className="text-2xl font-bold">
                        {rawMaterials.length}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Filtered Results</p>
                      <p className="text-2xl font-bold">
                        {filteredMaterials.length}
                      </p>
                    </div>
                    <Search className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Unique Units</p>
                      <p className="text-2xl font-bold">{uniqueUnits.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add/Edit Form Card */}
            <Card id="material-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingMaterial ? (
                    <>
                      <Pencil className="h-5 w-5" />
                      Edit Raw Material
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add New Raw Material
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaterialSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="material-name"
                        className="text-sm font-medium"
                      >
                        Material Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="material-name"
                        placeholder="e.g., Tomatoes, Cheese, Flour"
                        value={materialInput}
                        onChange={(e) => setMaterialInput(e.target.value)}
                        className="w-full"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="material-code"
                        className="text-sm font-medium"
                      >
                        Code
                      </Label>
                      <Input
                        id="material-code"
                        placeholder="e.g., 3008"
                        value={materialCode}
                        onChange={(e) => setMaterialCode(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="material-category"
                        className="text-sm font-medium"
                      >
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={materialCategory}
                        onValueChange={setMaterialCategory}
                      >
                        <SelectTrigger id="material-category" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialCategories.map((cat) => (
                            <SelectItem key={cat._id} value={cat.category}>
                              {cat.category}
                            </SelectItem>
                          ))}
                          {materialCategories.length === 0 && (
                            <div className="px-2 py-1 text-sm text-gray-500">No categories. Add from below.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="material-unit"
                        className="text-sm font-medium"
                      >
                        Unit of Measurement{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {uoms.length > 0 ? (
                        <Select
                          value={materialUnit}
                          onValueChange={setMaterialUnit}
                          required
                        >
                          <SelectTrigger id="material-unit" className="w-full">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {uoms.filter(u => u.unit).map((u) => (
                              <SelectItem key={u._id} value={u.unit}>
                                {u.label} ({u.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="material-unit"
                          placeholder="e.g. kg, liter, pcs"
                          value={materialUnit}
                          onChange={(e) => setMaterialUnit(e.target.value)}
                          className="w-full"
                        />
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        type="submit"
                        disabled={
                          materialLoading ||
                          !materialInput.trim() ||
                          !materialUnit?.trim()
                        }
                        className="flex-1"
                      >
                        {materialLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {editingMaterial ? "Updating..." : "Adding..."}
                          </>
                        ) : editingMaterial ? (
                          <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Update
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Material
                          </>
                        )}
                      </Button>
                      {editingMaterial && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={materialLoading}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  {materialError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{materialError}</p>
                    </div>
                  )}
                  {/* Supplier Selection */}
                  <div className="border-t pt-4 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Suppliers — Who provides this material?
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Select all suppliers who supply this raw material. You can select multiple.
                    </p>
                    {suppliers.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No suppliers added yet. Add suppliers first from the Suppliers tab.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {suppliers.map((sup) => (
                          <label
                            key={sup._id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-150 ${
                              materialSelectedSuppliers.includes(sup._id)
                                ? "border-[#69231B] bg-[#69231B]/5 text-[#69231B]"
                                : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="accent-[#69231B]"
                              checked={materialSelectedSuppliers.includes(sup._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMaterialSelectedSuppliers([...materialSelectedSuppliers, sup._id]);
                                } else {
                                  setMaterialSelectedSuppliers(materialSelectedSuppliers.filter((id) => id !== sup._id));
                                }
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{sup.name}</p>
                              <p className="text-xs text-gray-500 truncate">{sup.companyName}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    {materialSelectedSuppliers.length > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {materialSelectedSuppliers.length} supplier{materialSelectedSuppliers.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                  {/* Distribution Unit Configuration */}
                  <div className="border-t pt-4 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Distribution Unit — Set the smaller unit for kitchen distribution
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Example: Milk in <strong>liter</strong> → ml. Rice in <strong>kg</strong> → g. Cotton box → pieces (1 box = 50 pcs).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="distribution-unit" className="text-sm font-medium">
                          Distribute in
                        </Label>
                        {(materialUnit === "kg" || materialUnit === "Kg") ? (
                          <Select
                            value={materialDistributionUnit}
                            onValueChange={(val) => {
                              setMaterialDistributionUnit(val);
                              if (val === "g") setMaterialConversionFactor("1000");
                              else if (val === "none") { setMaterialConversionFactor(""); }
                              else if (val === "custom") { setMaterialConversionFactor(""); setMaterialDistributionUnit(""); }
                            }}
                          >
                            <SelectTrigger id="distribution-unit" className="w-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Same as base (kg)</SelectItem>
                              <SelectItem value="g">Gram (g) — 1 kg = 1000 g</SelectItem>
                              <SelectItem value="custom">Custom (enter manually)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (materialUnit === "l" || materialUnit === "L" || materialUnit === "liter" || materialUnit === "Liter") ? (
                          <Select
                            value={materialDistributionUnit}
                            onValueChange={(val) => {
                              setMaterialDistributionUnit(val);
                              if (val === "ml") setMaterialConversionFactor("1000");
                              else if (val === "none") { setMaterialConversionFactor(""); }
                              else if (val === "custom") { setMaterialConversionFactor(""); setMaterialDistributionUnit(""); }
                            }}
                          >
                            <SelectTrigger id="distribution-unit" className="w-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Same as base (liter)</SelectItem>
                              <SelectItem value="ml">Milliliter (ml) — 1 l = 1000 ml</SelectItem>
                              <SelectItem value="custom">Custom (enter manually)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (materialUnit === "doz" || materialUnit === "Dozen") ? (
                          <Select
                            value={materialDistributionUnit}
                            onValueChange={(val) => {
                              setMaterialDistributionUnit(val);
                              if (val === "pcs") setMaterialConversionFactor("12");
                              else if (val === "none") { setMaterialConversionFactor(""); }
                              else if (val === "custom") { setMaterialConversionFactor(""); setMaterialDistributionUnit(""); }
                            }}
                          >
                            <SelectTrigger id="distribution-unit" className="w-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Same as base (dozen)</SelectItem>
                              <SelectItem value="pcs">Pieces (pcs) — 1 doz = 12 pcs</SelectItem>
                              <SelectItem value="custom">Custom (enter manually)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="distribution-unit"
                            placeholder="e.g. pcs, packets, units"
                            value={materialDistributionUnit}
                            onChange={(e) => setMaterialDistributionUnit(e.target.value)}
                            className="w-full"
                          />
                        )}
                      </div>
                      {/* Manual entry for custom units (box, case, carton etc.) */}
                      {(materialDistributionUnit === "" || materialDistributionUnit === "custom" || 
                        (materialUnit !== "kg" && materialUnit !== "Kg" && materialUnit !== "l" && materialUnit !== "L" && materialUnit !== "liter" && materialUnit !== "Liter" && materialUnit !== "doz" && materialUnit !== "Dozen")) && (
                        <div className="space-y-2">
                          <Label htmlFor="custom-dist-unit" className="text-sm font-medium">
                            Smaller Unit Name
                          </Label>
                          <Input
                            id="custom-dist-unit"
                            placeholder="e.g. pcs, packets, gm"
                            value={materialDistributionUnit === "custom" ? "" : materialDistributionUnit}
                            onChange={(e) => setMaterialDistributionUnit(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="conversion-factor" className="text-sm font-medium">
                          How many in 1 {materialUnit || "unit"}?
                        </Label>
                        <Input
                          id="conversion-factor"
                          type="number"
                          placeholder={`e.g. 50 (1 ${materialUnit || 'box'} = 50 pcs)`}
                          value={materialConversionFactor}
                          onChange={(e) => setMaterialConversionFactor(e.target.value)}
                          className="w-full"
                          min="1"
                          step="any"
                        />
                      </div>
                    </div>
                    {materialDistributionUnit && materialDistributionUnit !== "none" && materialDistributionUnit !== "custom" && materialConversionFactor > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium text-green-700">
                          ✓ 1 {materialUnit} = {materialConversionFactor} {materialDistributionUnit}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Chef can request any amount in {materialDistributionUnit} and system will auto-deduct from {materialUnit} stock
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Manage Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manage Raw Material Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="New category name (e.g., Frozen Food, Dairy, Spices)"
                    className="max-w-xs"
                    id="new-mat-category-input"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (!val) return;
                        try {
                          await axios.post(`${API_URL}/hotel/matCategory`, { category: val });
                          toast.success("Category added!");
                          e.target.value = "";
                          fetchMaterialCategories();
                        } catch (err) {
                          toast.error(err.response?.data?.message || "Failed to add category");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#69231B] hover:bg-[#7a2920] text-white"
                    onClick={async () => {
                      const input = document.getElementById("new-mat-category-input");
                      const val = input?.value?.trim();
                      if (!val) return;
                      try {
                        await axios.post(`${API_URL}/hotel/matCategory`, { category: val });
                        toast.success("Category added!");
                        input.value = "";
                        fetchMaterialCategories();
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Failed to add category");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materialCategories.map((cat) => (
                    <span
                      key={cat._id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#69231B]/10 text-[#69231B]"
                    >
                      {cat.category}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete category "${cat.category}"?`)) return;
                          try {
                            await axios.delete(`${API_URL}/hotel/matCategory/${cat._id}`);
                            toast.success("Category removed");
                            fetchMaterialCategories();
                          } catch (err) {
                            toast.error("Failed to delete category");
                          }
                        }}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {materialCategories.length === 0 && (
                    <p className="text-sm text-gray-500">No categories added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Raw Materials List</CardTitle>
                <Button
                  variant="outline"
                  onClick={handleExportRawMaterials}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search materials by name..."
                      value={materialSearchTerm}
                      onChange={(e) => setMaterialSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={materialUnitFilter}
                    onValueChange={setMaterialUnitFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {uniqueUnits.filter(unit => unit).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={materialCategoryFilter}
                    onValueChange={setMaterialCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {materialCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.category}>
                          {cat.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(materialSearchTerm || materialUnitFilter !== "all" || materialCategoryFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMaterialSearchTerm("");
                        setMaterialUnitFilter("all");
                        setMaterialCategoryFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {materialLoading && rawMaterials.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Loading materials...</p>
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      {rawMaterials.length === 0
                        ? "No raw materials found"
                        : "No materials match your search"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {rawMaterials.length === 0
                        ? "Add your first raw material to get started"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-16">#</TableHead>
                          <TableHead className="font-semibold">Code</TableHead>
                          <TableHead className="font-semibold">
                            Material Name
                          </TableHead>
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold">Unit</TableHead>
                          <TableHead className="font-semibold">Distribution Unit</TableHead>
                          <TableHead className="font-semibold">Suppliers</TableHead>
                          <TableHead className="text-right font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMaterials.map((m, i) => (
                          <TableRow
                            key={m._id}
                            id={`material-row-${m._id}`}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="text-gray-500">
                              {i + 1}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-gray-600">
                              {m.code || "—"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {m.name}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {m.category || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {m.unit || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {m.distributionUnit && m.conversionFactor ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  1 {m.unit} = {m.conversionFactor} {m.distributionUnit}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {m.suppliers && m.suppliers.length > 0 ? (
                                  m.suppliers
                                    .filter(s => s && s.supplier)
                                    .map((s, si) => {
                                      const supName = typeof s.supplier === 'object'
                                        ? s.supplier.name
                                        : suppliers.find(sup => sup._id === s.supplier)?.name;
                                      return supName ? (
                                        <span key={si} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#69231B]/10 text-[#69231B]">
                                          {supName}
                                        </span>
                                      ) : null;
                                    })
                                ) : (
                                  <span className="text-xs text-gray-400">No supplier assigned</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditMaterial(m)}
                                  className="h-8 w-8"
                                  title="Edit material"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleMaterialDelete(m._id)}
                                  className="h-8 w-8"
                                  title="Delete material"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this raw material? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setMaterialToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmMaterialDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Purchase Orders</CardTitle>
                <Button
                  onClick={() => {
                    resetPOForm();
                    setShowPOModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create PO
                </Button>
              </div>
              <div className="flex gap-2">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="2025-01">January 2025</SelectItem>
                    <SelectItem value="2025-02">February 2025</SelectItem>
                    <SelectItem value="2025-03">March 2025</SelectItem>
                    <SelectItem value="2025-04">April 2025</SelectItem>
                    <SelectItem value="2025-05">May 2025</SelectItem>
                    <SelectItem value="2025-06">June 2025</SelectItem>
                    <SelectItem value="2025-07">July 2025</SelectItem>
                    <SelectItem value="2025-08">August 2025</SelectItem>
                    <SelectItem value="2025-09">September 2025</SelectItem>
                    <SelectItem value="2025-10">October 2025</SelectItem>
                    <SelectItem value="2025-11">November 2025</SelectItem>
                    <SelectItem value="2025-12">December 2025</SelectItem>
                    <SelectItem value="2024-12">December 2024</SelectItem>
                    <SelectItem value="2024-11">November 2024</SelectItem>
                    <SelectItem value="2024-10">October 2024</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search POs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  Loading purchase orders...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Payment Progress</TableHead>
                      <TableHead>GRNs/Invoices</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Filtering is done server-side in fetchPurchaseOrders().
                        This local filter is a deliberate fallback: if the
                        backend hasn't been restarted with the new query-param
                        support it silently ignores `search`/`month`, and
                        without this the search box would appear broken.
                        Once the backend is updated this is a cheap no-op
                        because the server already returned filtered rows. */}
                    {purchaseOrders
                      .filter((po) => {
                        if (!searchTerm && filterMonth === "all") return true;
                        const q = searchTerm.toLowerCase();
                        const matchesSearch =
                          !q ||
                          po.purchaseOrderId?.toLowerCase().includes(q) ||
                          po.invoiceNumber?.toLowerCase().includes(q) ||
                          po.supplierId?.name?.toLowerCase().includes(q) ||
                          po.supplierName?.toLowerCase().includes(q) ||
                          po.branch?.name?.toLowerCase().includes(q);

                        const matchesMonth =
                          filterMonth === "all" ||
                          (po.orderDate &&
                            `${new Date(po.orderDate).getFullYear()}-${String(
                              new Date(po.orderDate).getMonth() + 1
                            ).padStart(2, "0")}` === filterMonth);

                        return matchesSearch && matchesMonth;
                      })
                      .map((po) => (
                        <TableRow key={po._id}>
                          <TableCell className="font-medium">
                            {po.purchaseOrderId || "—"}
                          </TableCell>
                          <TableCell>{po.invoiceNumber || "—"}</TableCell>
                          <TableCell>
                            {typeof po.supplierId === "object" &&
                            po.supplierId?.name
                              ? po.supplierId.name
                              : po.supplierName || "—"}
                          </TableCell>
                          <TableCell>
                            {typeof po.branch === "object" && po.branch?.name
                              ? po.branch.name
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {po.orderDate
                              ? new Date(po.orderDate).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{po.total?.toLocaleString() || "0.00"}
                          </TableCell>

                          {/* Payment Status */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  po.paymentStatus === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : po.paymentStatus === "Partial"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {po.paymentStatus === "Paid" && "✅ "}
                                {po.paymentStatus === "Partial" && "💵 "}
                                {po.paymentStatus === "Pending" && "💰 "}
                                {po.paymentStatus || "Pending"}
                              </span>
                              {po.paymentPercentage !== undefined && (
                                <span className="text-xs text-gray-600">
                                  {po.paymentPercentage}%
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Payment Progress Bar */}
                          <TableCell>
                            <div className="w-full">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    (po.paymentPercentage || 0) === 100
                                      ? "bg-green-600"
                                      : "bg-yellow-600"
                                  }`}
                                  style={{
                                    width: `${po.paymentPercentage || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          {/* GRNs and Invoices Count */}
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="text-gray-600">
                                📦 {po.grns?.length || 0} GRN(s)
                              </span>
                              <span className="text-gray-600">
                                📄 {po.invoices?.length || 0} Invoice(s)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const poData = po;
                                  setEditingPO(poData);
                                  setPoForm({
                                    supplierId:
                                      poData.supplierId?._id ||
                                      poData.supplierId ||
                                      "",
                                    invoiceNumber: poData.invoiceNumber || "",
                                    branch: poData.branch || {
                                      id: "",
                                      name: "",
                                      address: "",
                                    },
                                    storeLocationId:
                                      poData.storeLocationId?._id ||
                                      poData.storeLocationId ||
                                      "",
                                    orderDate: poData.orderDate
                                      ? new Date(poData.orderDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                    deliveryDate: poData.deliveryDate
                                      ? new Date(poData.deliveryDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                    items:
                                      poData.items?.map((item) => ({
                                        name: item.name?._id || item.name || "",
                                        quantity: item.quantity || "",
                                        unit: item.unit || "pcs",
                                        rate: item.rate || "",
                                        tax: item.tax ?? 0,
                                        amount: item.amount || "",
                                        previousRate: null,
                                        previousPO: null,
                                      })) || [],
                                    notes: poData.notes || "",
                                    paymentTerms: poData.paymentTerms || "30",
                                    taxRate: poData.taxRate || 0,
                                  });
                                  setShowPOModal(true);
                                }}
                                title="Edit PO"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setViewingPO(po);
                                  setShowViewModal(true);
                                }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {/* Vendor-facing PO PDF — download / share */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => downloadPOPdf(po)}
                                title="Download PO as PDF"
                                aria-label={`Download purchase order ${po.purchaseOrderId || ""} as PDF`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => sharePOPdf(po)}
                                title="Share PO PDF with supplier"
                                aria-label={`Share purchase order ${po.purchaseOrderId || ""} with supplier`}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "po",
                                    id: po._id,
                                    label: po.purchaseOrderId || "",
                                    hasGRN:
                                      (po.grns && po.grns.length > 0) ||
                                      po.grnGenerated === true,
                                  })
                                }
                                title="Delete PO"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {purchaseOrders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan="10"
                          className="text-center text-gray-500 py-8"
                        >
                          No purchase orders found. Create your first purchase
                          order to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grn">
          <Card>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Goods Receipt Notes (GRN)</CardTitle>
                <Button
                  onClick={() => {
                    setShowGRNModal(true);
                    setEditingGRN(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create GRN
                </Button>
              </div>
              <div className="flex gap-2">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="2025-01">January 2025</SelectItem>
                    <SelectItem value="2025-02">February 2025</SelectItem>
                    <SelectItem value="2025-03">March 2025</SelectItem>
                    <SelectItem value="2025-04">April 2025</SelectItem>
                    <SelectItem value="2025-05">May 2025</SelectItem>
                    <SelectItem value="2025-06">June 2025</SelectItem>
                    <SelectItem value="2025-07">July 2025</SelectItem>
                    <SelectItem value="2025-08">August 2025</SelectItem>
                    <SelectItem value="2025-09">September 2025</SelectItem>
                    <SelectItem value="2025-10">October 2025</SelectItem>
                    <SelectItem value="2025-11">November 2025</SelectItem>
                    <SelectItem value="2025-12">December 2025</SelectItem>
                    <SelectItem value="2024-12">December 2024</SelectItem>
                    <SelectItem value="2024-11">November 2024</SelectItem>
                    <SelectItem value="2024-10">October 2024</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search GRNs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading GRNs...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN Number</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grns
                      .filter((grn) => {
                        const searchLower = searchTerm.toLowerCase();
                        const matchesSearch = (
                          grn.grnNumber?.toLowerCase().includes(searchLower) ||
                          grn.poNumber?.toLowerCase().includes(searchLower) ||
                          grn.supplier?.toLowerCase().includes(searchLower) ||
                          grn.branch?.toLowerCase().includes(searchLower)
                        );
                        
                        const matchesMonth = filterMonth === "all" || (() => {
                          if (!grn.createdAt) return false;
                          const grnDate = new Date(grn.createdAt);
                          const grnMonth = `${grnDate.getFullYear()}-${String(grnDate.getMonth() + 1).padStart(2, '0')}`;
                          return grnMonth === filterMonth;
                        })();
                        
                        return matchesSearch && matchesMonth;
                      })
                      .map((grn) => (
                        <TableRow key={grn._id}>
                          <TableCell className="font-medium">
                            {grn.grnNumber || "—"}
                          </TableCell>
                          <TableCell>{grn.poNumber || "—"}</TableCell>
                          <TableCell>{grn.supplier || "—"}</TableCell>
                          <TableCell>{grn.branch || "—"}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{grn.totalAmount?.toLocaleString() || "0.00"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                grn.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : grn.status === "Received"
                                  ? "bg-blue-100 text-blue-800"
                                  : grn.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {grn.status || "Pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {grn.createdAt
                              ? new Date(grn.createdAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    const response = await axios.get(`${API_URL}/hotel/grn/${grn._id}`);
                                    // Controller returns { status:'success', data:{...} }
                                    const freshGRN = response.data?.data || response.data;
                                    setViewingGRN(freshGRN);
                                    setShowViewGRNModal(true);
                                  } catch (error) {
                                    console.error("Error fetching GRN details:", error);
                                    setViewingGRN(grn);
                                    setShowViewGRNModal(true);
                                  }
                                }}
                                title="View GRN"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={grn.status === "Approved"}
                                onClick={() => {
                                  if (grn.status === "Approved") {
                                    toast.error(
                                      "Cannot edit approved GRN. Approved GRNs are locked to maintain data integrity."
                                    );
                                    return;
                                  }
                                  
                                  console.log("✏️ Editing GRN - Original data:", {
                                    grnNumber: grn.grnNumber,
                                    items: grn.items?.map(item => ({
                                      product: item.product,
                                      quantity: item.quantity,
                                      receivedQty: item.receivedQty,
                                      rejectedQty: item.rejectedQty,
                                      acceptedQty: item.acceptedQty,
                                      rate: item.rate,
                                      amount: item.amount
                                    })),
                                    taxRate: grn.taxRate,
                                    totalTax: grn.totalTax,
                                    totalAmount: grn.totalAmount
                                  });

                                  setEditingGRN(grn);
                                  // Extract poId - handle both populated object and string ID
                                  const poIdValue = typeof grn.poId === 'object' && grn.poId?._id 
                                    ? grn.poId._id 
                                    : grn.poId || undefined;
                                  
                                  const mappedItems = (grn.items || []).map(item => {
                                    // Map database field names to form field names
                                    const receivedQty = item.receivedQty || item.receivedQuantity || item.quantity || 0;
                                    const damagedQty = item.rejectedQty || item.damagedQuantity || 0;
                                    const acceptedQty = item.acceptedQty || item.acceptedQuantity || item.availableQuantity || Math.max(0, receivedQty - damagedQty);
                                    
                                    return {
                                      ...item,
                                      // Map to form field names
                                      receivedQuantity: receivedQty,
                                      damagedQuantity: damagedQty,
                                      acceptedQuantity: acceptedQty,
                                      // Recalculate amount based on accepted quantity
                                      amount: acceptedQty * (item.rate || 0)
                                    };
                                  });

                                  console.log("✏️ Mapped items for form:", mappedItems.map(item => ({
                                    product: item.product,
                                    receivedQuantity: item.receivedQuantity,
                                    damagedQuantity: item.damagedQuantity,
                                    acceptedQuantity: item.acceptedQuantity,
                                    rate: item.rate,
                                    amount: item.amount
                                  })));
                                  
                                  setGrnForm({
                                    grnNumber: grn.grnNumber || "",
                                    poId: poIdValue,
                                    poNumber: grn.poNumber || "",
                                    supplier: grn.supplier || "",
                                    supplierId: grn.supplierId || undefined,
                                    branch: grn.branch || "",
                                    branchId: grn.branchId || undefined,
                                    storeType: grn.storeType || "Main Store",
                                    storeLocationId: grn.storeLocationId || undefined,
                                    items: mappedItems,
                                    totalQuantity: grn.totalQuantity || 0,
                                    subtotal: grn.subtotal || 0,
                                    taxRate: grn.taxRate || 0,
                                    totalTax: grn.totalTax || 0,
                                    totalAmount: grn.totalAmount || 0,
                                    status: grn.status || "Pending",
                                    notes: grn.notes || "",
                                    receivedBy: grn.receivedBy || "",
                                    createdBy: grn.createdBy || "",
                                  });
                                  setShowGRNModal(true);
                                }}
                                title={
                                  grn.status === "Approved"
                                    ? "Cannot edit approved GRN"
                                    : "Edit GRN"
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "grn",
                                    id: grn._id,
                                    label: grn.grnNumber || "",
                                    status: grn.status,
                                  })
                                }
                                title="Delete GRN"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
              {grns.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No GRNs found. Create your first GRN to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Pending POs functionality will be added here...
              </p>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* GRN Modal */}
      <Dialog open={showGRNModal} onOpenChange={setShowGRNModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingGRN ? "Edit GRN" : "Create Goods Receipt Note (GRN)"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingGRN
                ? "Update GRN information"
                : "Create a GRN for received goods"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGRNSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">GRN Number</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={grnForm.grnNumber}
                  onChange={(e) =>
                    setGrnForm({ ...grnForm, grnNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Select Purchase Order
                </Label>
                <Select
                  value={grnForm.poId}
                  disabled={editingGRN} // Disable PO selection when editing
                  onValueChange={(value) => {
                    const selectedOrder = purchaseOrders.find(
                      (po) => po._id === value
                    );
                    if (selectedOrder) {
                      // Handle storeLocationId - it can be an object or string
                      let storeLocationId = "";
                      let storeLocationName =
                        selectedOrder.storeType || "Main Store";

                      if (selectedOrder.storeLocationId) {
                        if (
                          typeof selectedOrder.storeLocationId === "object" &&
                          selectedOrder.storeLocationId._id
                        ) {
                          // storeLocationId is an object with _id and name
                          const poStoreId = selectedOrder.storeLocationId._id;
                          // Find the matching store location from our loaded storeLocations
                          const matchingLocation = storeLocations.find(
                            (loc) => loc._id === poStoreId
                          );
                          if (matchingLocation) {
                            storeLocationId = matchingLocation._id;
                            storeLocationName = matchingLocation.name;
                          } else {
                            // If PO has a store location that doesn't exist in current storeLocations,
                            // fall back to the name from PO and try to find by name
                            storeLocationName =
                              selectedOrder.storeLocationId.name ||
                              selectedOrder.storeType ||
                              "Main Store";
                            const locationByName = storeLocations.find(
                              (loc) => loc.name === storeLocationName
                            );
                            if (locationByName) {
                              storeLocationId = locationByName._id;
                            }
                          }
                        } else if (
                          typeof selectedOrder.storeLocationId === "string"
                        ) {
                          // storeLocationId is a string ID
                          const poStoreId = selectedOrder.storeLocationId;
                          const matchingLocation = storeLocations.find(
                            (loc) => loc._id === poStoreId
                          );
                          if (matchingLocation) {
                            storeLocationId = matchingLocation._id;
                            storeLocationName = matchingLocation.name;
                          } else {
                            storeLocationName =
                              selectedOrder.storeType || "Main Store";
                          }
                        }
                      }

                      console.log("Selected PO store location:", {
                        poId: selectedOrder._id,
                        storeLocationId: storeLocationId,
                        storeLocationName: storeLocationName,
                        poStoreLocationId: selectedOrder.storeLocationId,
                        availableLocations: storeLocations.map((loc) => ({
                          id: loc._id,
                          name: loc.name,
                        })),
                      });

                      console.log("📋 Selected PO for GRN:", {
                        poId: selectedOrder._id,
                        poNumber: selectedOrder.purchaseOrderId,
                        taxRate: selectedOrder.taxRate,
                        tax: selectedOrder.tax,
                        total: selectedOrder.total,
                        subtotal: selectedOrder.subtotal
                      });

                      setGrnForm({
                        ...grnForm,
                        poId: value,
                        poNumber: selectedOrder.purchaseOrderId,
                        supplier:
                          selectedOrder.supplierId?.name ||
                          selectedOrder.supplierName,
                        supplierId:
                          selectedOrder.supplierId?._id ||
                          selectedOrder.supplierId,
                        branch: selectedOrder.branch?.name,
                        branchId: selectedOrder.branch?.id,
                        storeType: storeLocationName,
                        storeLocationId: storeLocationId,
                        subtotal: 0, // Will be calculated based on accepted quantities
                        taxRate: selectedOrder.taxRate || 0, // Keep tax rate from PO
                        totalTax: 0, // Will be calculated based on actual subtotal
                        items: selectedOrder.items.map(item => {
                          // item.name can be: a raw-material ObjectId string, an object {_id, name}, or a plain name string
                          let productName = "";
                          let productId = undefined;
                          if (typeof item.name === "object" && item.name !== null) {
                            // Populated: { _id: "...", name: "Tomatoes" }
                            productName = item.name.name || item.name._id || "";
                            productId = item.name._id;
                          } else if (typeof item.name === "string") {
                            // Could be an ObjectId or a plain name
                            const mat = rawMaterials.find(m => m._id === item.name);
                            productName = mat ? mat.name : item.name;
                            productId = item.name;
                          }
                          return {
                            product: productName,
                            productId: productId,
                            description: "",
                            quantity: item.quantity,
                            receivedQuantity: item.quantity,
                            damagedQuantity: "",
                            acceptedQuantity: item.quantity,
                            rate: item.rate,
                            unit: item.unit,
                            amount: (item.quantity || 0) * (item.rate || 0),
                            // Carry the per-item tax over from the PO instead of
                            // defaulting to 0 — the GRN model computes
                            // totalTax as Σ(amount × gstRate / 100)
                            gstRate: item.tax || 0,
                            supplier:
                              selectedOrder.supplierId?.name ||
                              selectedOrder.supplierName || "",
                            branch: selectedOrder.branch?.name || "",
                            category: "",
                            poNumber: selectedOrder.purchaseOrderId,
                            storeType: storeLocationName,
                          };
                        }),
                      });

                      console.log("✅ GRN Form set with taxRate:", selectedOrder.taxRate || 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO (only POs without GRN)" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search PO..."
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const searchValue = e.target.value.toLowerCase();
                          const items = e.target
                            .closest('[role="listbox"]')
                            ?.querySelectorAll('[role="option"]');
                          items?.forEach((item) => {
                            const text = item.textContent?.toLowerCase() || "";
                            item.style.display = text.includes(searchValue)
                              ? ""
                              : "none";
                          });
                        }}
                      />
                    </div>
                    {purchaseOrders
                      .filter((po) => {
                        // Filter out cancelled POs
                        if (po.status === "Cancelled") return false;

                        // Filter out POs that already have GRNs (unless we're editing that GRN)
                        if (editingGRN && po._id === grnForm.poId) {
                          // Allow the current PO when editing
                          return true;
                        }

                        // Check if PO has any GRNs
                        const hasGRN = po.grns && po.grns.length > 0;
                        const grnGenerated = po.grnGenerated === true;

                        // Only show POs without GRNs
                        return !hasGRN && !grnGenerated;
                      })
                      .map((po) => (
                        <SelectItem key={po._id} value={po._id}>
                          {po.purchaseOrderId} -{" "}
                          {po.supplierId?.name || po.supplierName} - ₹
                          {po.total?.toLocaleString()}
                        </SelectItem>
                      ))}
                    {purchaseOrders.filter((po) => {
                      if (po.status === "Cancelled") return false;
                      if (editingGRN && po._id === grnForm.poId) return true;
                      const hasGRN = po.grns && po.grns.length > 0;
                      const grnGenerated = po.grnGenerated === true;
                      return !hasGRN && !grnGenerated;
                    }).length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No purchase orders available. All POs either have GRNs
                        or are cancelled.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">PO Number</Label>
                <Input
                  value={grnForm.poNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Supplier</Label>
                <Input
                  value={grnForm.supplier}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Branch</Label>
                <Input value={grnForm.branch} readOnly className="bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Store Location
                </Label>
                <Select
                  value={grnForm.storeLocationId || grnForm.storeType || ""}
                  onValueChange={(value) => {
                    const selectedLocation = storeLocations.find((loc) => loc._id === value);
                    setGrnForm({
                      ...grnForm,
                      storeLocationId: value,
                      storeType: selectedLocation?.name || grnForm.storeType,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={grnForm.storeType || "Select store location"} />
                  </SelectTrigger>
                  <SelectContent>
                    {storeLocations.filter(loc => loc._id).map((loc) => (
                      <SelectItem key={loc._id} value={loc._id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={grnForm.status}
                  onValueChange={(value) =>
                    setGrnForm({ ...grnForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Approved">
                      Approved (locks editing)
                    </SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {grnForm.status === "Approved" && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Warning: Once approved, quantities and amounts cannot be
                    modified
                  </p>
                )}
              </div>
            </div>

            <Label className="text-sm font-medium">Items</Label>
            <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
              {grnForm.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Product
                      </Label>
                      <Input
                        placeholder="Product name"
                        value={item.product}
                        onChange={(e) => {
                          const updatedItems = [...grnForm.items];
                          updatedItems[index].product = e.target.value;
                          setGrnForm({ ...grnForm, items: updatedItems });
                        }}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedItems = grnForm.items.filter(
                          (_, i) => i !== index
                        );
                        setGrnForm({ ...grnForm, items: updatedItems });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Ordered Qty
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={item.quantity}
                        readOnly
                        className="mt-1 bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Received Qty
                      </Label>
                      <Input
                        type="number"
                        value={item.receivedQuantity !== undefined && item.receivedQuantity !== null ? item.receivedQuantity : ""}
                        onChange={(e) => {
                          const updatedItems = [...grnForm.items];
                          // Loose material arrives in fractions (500 g = 0.5 kg),
                          // so decimals must pass. Negatives are rejected — a
                          // negative qty flips the line amount and order total.
                          const parsed =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value);
                          const value =
                            Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
                          updatedItems[index].receivedQuantity = value;
                          // Recalculate accepted quantity and amount
                          const acceptedQty = (updatedItems[index].receivedQuantity || 0) - (updatedItems[index].damagedQuantity || 0);
                          updatedItems[index].acceptedQuantity = Math.max(0, acceptedQty);
                          updatedItems[index].amount = updatedItems[index].acceptedQuantity * updatedItems[index].rate;

                          setGrnForm({
                            ...grnForm,
                            items: updatedItems,
                            totalTax: computeGrnTax(updatedItems),
                          });
                        }}
                        className="mt-1"
                        placeholder="Enter received quantity"
                        min="0"
                        step="any"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Damaged Qty (if any)
                      </Label>
                      <Input
                        type="number"
                        value={item.damagedQuantity !== undefined && item.damagedQuantity !== null ? item.damagedQuantity : ""}
                        onChange={(e) => {
                          const updatedItems = [...grnForm.items];
                          const parsed =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value);
                          const value =
                            Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
                          updatedItems[index].damagedQuantity = value;
                          // Recalculate accepted quantity and amount
                          const acceptedQty = (updatedItems[index].receivedQuantity || 0) - updatedItems[index].damagedQuantity;
                          updatedItems[index].acceptedQuantity = Math.max(0, acceptedQty);
                          updatedItems[index].amount = updatedItems[index].acceptedQuantity * updatedItems[index].rate;

                          setGrnForm({
                            ...grnForm,
                            items: updatedItems,
                            totalTax: computeGrnTax(updatedItems),
                          });
                        }}
                        className="mt-1"
                        placeholder="Enter damaged quantity"
                        min="0"
                        step="any"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Price Per Unit
                      </Label>
                      <Input
                        type="number"
                        value={item.rate || ""}
                        onChange={(e) => {
                          const updatedItems = [...grnForm.items];
                          const parsed =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value);
                          const value =
                            Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
                          updatedItems[index].rate = value;
                          // Use accepted quantity for amount calculation
                          const acceptedQty = (updatedItems[index].acceptedQuantity || 0);
                          updatedItems[index].amount = acceptedQty * updatedItems[index].rate;

                          setGrnForm({
                            ...grnForm,
                            items: updatedItems,
                            totalTax: computeGrnTax(updatedItems),
                          });
                        }}
                        className="mt-1"
                        min="0"
                        step="any"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Tax (%)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={
                          item.gstRate !== undefined && item.gstRate !== null
                            ? item.gstRate
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          const parsed = parseFloat(raw);
                          if (raw !== "" && (parsed < 0 || parsed > 100)) return;
                          const updatedItems = [...grnForm.items];
                          updatedItems[index].gstRate =
                            raw === "" ? 0 : parsed || 0;

                          setGrnForm({
                            ...grnForm,
                            items: updatedItems,
                            totalTax: computeGrnTax(updatedItems),
                          });
                        }}
                        className="mt-1"
                        placeholder="Tax %"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Unit
                      </Label>
                      {/* Read-only, same as the PO form. This was a Select with a
                          hardcoded option list (pcs/kg/g/l/...), so any material
                          with a unit outside that list — e.g. "bottle" —
                          rendered as an empty dropdown. The unit belongs to the
                          raw material and must match the PO, so it isn't
                          editable here. */}
                      <Input
                        value={item.unit || "pcs"}
                        readOnly
                        className="mt-1 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Total for this item:{" "}
                        </span>
                        <span className="font-semibold text-green-600">
                          ₹
                          {(
                            (parseFloat(item.amount) || 0) *
                            (1 + (parseFloat(item.gstRate) || 0) / 100)
                          ).toFixed(2)}
                        </span>
                        {parseFloat(item.gstRate) > 0 && (
                          <span className="text-gray-500">
                            {" "}
                            (₹{(parseFloat(item.amount) || 0).toFixed(2)} + {item.gstRate}%
                            tax)
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Net Quantity:{" "}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {(item.acceptedQuantity !== undefined
                            ? item.acceptedQuantity
                            : (item.receivedQuantity || 0) -
                              (item.damagedQuantity || 0)) || 0}{" "}
                          {item.unit || "pcs"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setGrnForm({
                    ...grnForm,
                    items: [
                      ...grnForm.items,
                      {
                        product: "",
                        description: "",
                        quantity: 0,
                        receivedQuantity: "",
                        damagedQuantity: "",
                        acceptedQuantity: 0,
                        rate: 0,
                        unit: "pcs",
                        amount: 0,
                        gstRate: 0,
                        supplier: grnForm.supplier,
                        branch: grnForm.branch,
                        category: "",
                        poNumber: grnForm.poNumber,
                        storeType:
                          storeLocations.find(
                            (loc) => loc._id === grnForm.storeLocationId
                          )?.name || grnForm.storeType,
                      },
                    ],
                  });
                }}
                className="w-full py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Total Quantity (Net)
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={Number(
                    grnForm.items
                      .reduce(
                        (sum, item) =>
                          sum +
                          (item.acceptedQty || item.acceptedQuantity || 0),
                        0
                      )
                      // Summing floats leaks artifacts (318.00000000000006).
                      // 3 dp covers gram-level loose material.
                      .toFixed(3)
                  )}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Subtotal (Before Tax)
                </Label>
                <Input
                  type="number"
                  value={grnForm.items
                    .reduce((sum, item) => sum + (item.amount || 0), 0)
                    .toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              {/* Order-level "Tax Rate (%)" removed — tax comes from each
                  item's Tax (%), carried over from the PO */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Total Tax Amount (item-wise)
                </Label>
                <Input
                  type="number"
                  value={(grnForm.totalTax || 0).toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium font-bold">
                  Grand Total (With Tax)
                </Label>
                <Input
                  type="number"
                  value={(
                    grnForm.items.reduce(
                      (sum, item) => sum + (item.amount || 0),
                      0
                    ) + (grnForm.totalTax || 0)
                  ).toFixed(2)}
                  readOnly
                  className="bg-gray-50 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                placeholder="Enter notes"
                value={grnForm.notes}
                onChange={(e) =>
                  setGrnForm({ ...grnForm, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGRNModal(false)}
                disabled={grnSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={grnSubmitting}>
                {grnSubmitting
                  ? (editingGRN ? "Updating..." : "Creating...")
                  : (editingGRN ? "Update GRN" : "Create GRN")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* GRN View Modal */}
      <Dialog open={showViewGRNModal} onOpenChange={setShowViewGRNModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              GRN Detatails
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              GRN Number: {viewingGRN?.grnNumber}
            </DialogDescription>
          </DialogHeader>
          {viewingGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">GRN Number</Label>
                  <p className="font-medium">{viewingGRN.grnNumber || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">PO Number</Label>
                  <p className="font-medium">{viewingGRN.poNumber || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="font-medium">{viewingGRN.supplier || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Branch</Label>
                  <p className="font-medium">{viewingGRN.branch || "—"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subtotal (Before Tax)</Label>
                  <p className="font-medium">₹{((viewingGRN.totalAmount || 0) - (viewingGRN.totalTax || 0)).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tax Rate</Label>
                  <p className="font-medium">{viewingGRN.taxRate || 0}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tax Amount</Label>
                  <p className="font-medium">₹{viewingGRN.totalTax?.toLocaleString() || "0.00"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount (With Tax)</Label>
                  <p className="font-medium text-lg text-green-600">₹{viewingGRN.totalAmount?.toLocaleString() || "0.00"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewingGRN.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : viewingGRN.status === "Received"
                        ? "bg-blue-100 text-blue-800"
                        : viewingGRN.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewingGRN.status || "Pending"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Items</Label>
                <div className="space-y-3 mt-2">
                  {viewingGRN.items?.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="mb-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Product
                        </Label>
                        <p className="font-medium text-gray-900 mt-1">
                          {item.product || "—"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Ordered Qty</Label>
                          <p className="font-medium mt-1">{item.quantity || 0} {item.unit || "pcs"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Received Qty</Label>
                          <p className="font-medium mt-1">{item.receivedQty || item.receivedQuantity || item.quantity || 0} {item.unit || "pcs"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Rejected Qty</Label>
                          <p className="font-medium mt-1 text-red-600">{item.rejectedQty || item.damagedQuantity || 0} {item.unit || "pcs"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Good Qty (Accepted)</Label>
                          <p className="font-medium mt-1 text-green-600">
                            {item.acceptedQty || item.acceptedQuantity || item.availableQuantity || 
                              Math.max(0, (item.receivedQty || item.receivedQuantity || item.quantity || 0) - (item.rejectedQty || item.damagedQuantity || 0))
                            } {item.unit || "pcs"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Received Qty
                          </Label>
                          <p className="font-medium mt-1">
                            {item.receivedQuantity || item.quantity || 0}{" "}
                            {item.unit || "pcs"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Damaged Qty
                          </Label>
                          <p className="font-medium mt-1 text-red-600">
                            {item.damagedQuantity || 0} {item.unit || "pcs"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Good Qty (Accepted)
                          </Label>
                          <p className="font-medium mt-1 text-green-600">
                            {item.acceptedQuantity !== undefined
                              ? item.acceptedQuantity
                              : Math.max(
                                  0,
                                  (item.receivedQuantity ||
                                    item.quantity ||
                                    0) - (item.damagedQuantity || 0)
                                )}{" "}
                            {item.unit || "pcs"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Price Per Unit
                          </Label>
                          <p className="font-medium mt-1">₹{item.rate || 0}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3 mt-3 bg-blue-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Total Amount (Good Qty × Rate):{" "}
                            </span>
                            <span className="font-semibold text-green-600 text-lg">
                              ₹{(item.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingGRN.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-gray-600">{viewingGRN.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showSupplierModal} onOpenChange={(open) => { if (!open) { setShowSupplierModal(false); resetSupplierForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingSupplier
                ? "Update supplier information"
                : "Add a new supplier to the system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSupplierSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Supplier Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter supplier name"
                  value={supplierForm.name}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, name: e.target.value });
                    if (supplierFieldErrors.name) setSupplierFieldErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={supplierFieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter company name"
                  value={supplierForm.companyName}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, companyName: e.target.value });
                    if (supplierFieldErrors.companyName) setSupplierFieldErrors((p) => ({ ...p, companyName: "" }));
                  }}
                  className={supplierFieldErrors.companyName ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.companyName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter 10-digit contact number"
                  value={supplierForm.contact}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setSupplierForm({ ...supplierForm, contact: val });
                    if (supplierFieldErrors.contact) setSupplierFieldErrors((p) => ({ ...p, contact: "" }));
                  }}
                  maxLength={10}
                  className={supplierFieldErrors.contact ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.contact && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.contact}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={supplierForm.email}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, email: e.target.value });
                    if (supplierFieldErrors.email) setSupplierFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={supplierFieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-sm font-medium">
                  Billing Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Enter billing address"
                  value={supplierForm.billingAddress}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, billingAddress: e.target.value });
                    if (supplierFieldErrors.billingAddress) setSupplierFieldErrors((p) => ({ ...p, billingAddress: "" }));
                  }}
                  rows={2}
                  className={supplierFieldErrors.billingAddress ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.billingAddress && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.billingAddress}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  GST Number
                </Label>
                <Input
                  placeholder="Enter GST number"
                  value={supplierForm.gst}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, gst: e.target.value.toUpperCase() });
                    if (supplierFieldErrors.gst) setSupplierFieldErrors((p) => ({ ...p, gst: "" }));
                  }}
                  className={supplierFieldErrors.gst ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.gst && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.gst}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  PAN Number
                </Label>
                <Input
                  placeholder="Enter PAN number"
                  value={supplierForm.pan}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, pan: e.target.value.toUpperCase() });
                    if (supplierFieldErrors.pan) setSupplierFieldErrors((p) => ({ ...p, pan: "" }));
                  }}
                  className={supplierFieldErrors.pan ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {supplierFieldErrors.pan && (
                  <p className="text-red-500 text-xs mt-1">{supplierFieldErrors.pan}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSupplierModal(false);
                  resetSupplierForm();
                }}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                {editingSupplier ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showPOModal} onOpenChange={setShowPOModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingPO ? "Edit Purchase Order" : "Create Purchase Order"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Generate purchase orders for suppliers and track deliveries
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePOCreate} className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={poForm.supplierId}
                  onValueChange={(value) => {
                    // Don't auto-dump every material this supplier carries into
                    // the items list — items are added deliberately via the
                    // "search & add" box below. Selecting a supplier just
                    // narrows what that search offers.
                    // Any rows already added that this supplier doesn't carry
                    // are dropped, since rates are supplier-specific.
                    const keptItems = poForm.items.filter((item) => {
                      if (!item.name) return false;
                      const material = rawMaterials.find(
                        (m) => String(m._id) === String(item.name)
                      );
                      if (!material) return false;
                      return (material.suppliers || []).some((s) => {
                        const sId =
                          typeof s.supplier === "object"
                            ? s.supplier._id
                            : s.supplier;
                        return String(sId) === String(value);
                      });
                    });

                    const dropped = poForm.items.filter(
                      (i) => i.name && !keptItems.includes(i)
                    ).length;
                    if (dropped > 0) {
                      toast.error(
                        `${dropped} item(s) removed — not supplied by this supplier`
                      );
                    }

                    setPoForm({
                      ...poForm,
                      supplierId: value,
                      items: keptItems,
                    });
                    setMaterialSearchInputs({});
                    setMaterialSearchResults({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      if (suppliers.length === 0) {
                        return (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            No suppliers available
                          </div>
                        );
                      }
                      return suppliers.filter(s => s._id).map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name} - {supplier.companyName}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Branch <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={poForm.branch.id}
                  onValueChange={(value) => {
                    const branch = branches.find(
                      (b) => b._id === value || b.id === value
                    );
                    if (branch) {
                      // Get address from nested address object or string
                      let branchAddress = "";
                      if (branch.address) {
                        if (typeof branch.address === "string") {
                          branchAddress = branch.address;
                        } else if (branch.address.street) {
                          branchAddress = `${branch.address.street}, ${
                            branch.address.city || ""
                          }, ${branch.address.state || ""}`;
                        }
                      }

                      setPoForm({
                        ...poForm,
                        branch: {
                          id: branch._id || branch.id || value,
                          name:
                            branch.branchName || branch.restaurantName || "",
                          address: branchAddress,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        branches.length === 0
                          ? "Loading branches..."
                          : "Select branch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length === 0 ? (
                      <SelectItem value="no-branches" disabled>
                        No branches available
                      </SelectItem>
                    ) : (
                      branches.filter(b => b._id || b.id).map((branch) => (
                        <SelectItem
                          key={branch._id || branch.id}
                          value={branch._id || branch.id}
                        >
                          {branch.branchName ||
                            branch.restaurantName ||
                            "Unnamed Branch"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Order Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={poForm.orderDate}
                  onChange={(e) =>
                    setPoForm({ ...poForm, orderDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={poForm.deliveryDate}
                  onChange={(e) =>
                    setPoForm({ ...poForm, deliveryDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Invoice Number</Label>
                <Input
                  placeholder="Supplier invoice number (optional)"
                  value={poForm.invoiceNumber}
                  onChange={(e) =>
                    setPoForm({ ...poForm, invoiceNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Items <span className="text-red-500">*</span>
              </Label>
              {/* Search & add: type a raw material and pick it to add a row */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  className="pl-10"
                  placeholder="Click or type to add a raw material..."
                  value={poItemSearch}
                  onChange={(e) => {
                    setPoItemSearch(e.target.value);
                    setPoItemSearchOpen(true);
                  }}
                  onFocus={() => setPoItemSearchOpen(true)}
                  onBlur={() => setTimeout(() => setPoItemSearchOpen(false), 200)}
                  onKeyDown={(e) => {
                    // Enter adds the first match so you can add items without the mouse
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const q = poItemSearch.trim().toLowerCase();
                      if (!q) return;
                      const firstMatch = getPOAvailableMaterials().filter(
                        (m) =>
                          m.name?.toLowerCase().includes(q) ||
                          m.code?.toLowerCase().includes(q)
                      )[0];
                      if (firstMatch) addPOItemFromMaterial(firstMatch);
                    } else if (e.key === "Escape") {
                      setPoItemSearchOpen(false);
                    }
                  }}
                />

                {poItemSearchOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-56 overflow-y-auto">
                    {(() => {
                      const q = poItemSearch.trim().toLowerCase();
                      const available = getPOAvailableMaterials();
                      // With no query, list everything available so the
                      // supplier's materials can be browsed without typing
                      const matches = q
                        ? available.filter(
                            (m) =>
                              m.name?.toLowerCase().includes(q) ||
                              m.code?.toLowerCase().includes(q)
                          )
                        : available;

                      if (matches.length === 0) {
                        return (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            {q
                              ? "No raw material found"
                              : "No raw materials available"}
                            {poForm.supplierId ? " for this supplier" : ""}
                          </div>
                        );
                      }

                      const LIMIT = 100;
                      const shown = matches.slice(0, LIMIT);

                      return [
                        ...(matches.length > LIMIT
                          ? [
                              <div
                                key="__hint"
                                className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b sticky top-0"
                              >
                                Showing {LIMIT} of {matches.length} — type to
                                narrow
                              </div>,
                            ]
                          : []),
                        ...shown.map((material) => {
                        const added = poForm.items.some(
                          (item) => String(item.name) === String(material._id)
                        );
                        return (
                          <div
                            key={material._id}
                            className={`px-3 py-2 text-sm flex items-center justify-between gap-2 ${
                              added
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-100"
                            }`}
                            onMouseDown={(e) => {
                              // onMouseDown so it fires before the input's onBlur
                              e.preventDefault();
                              if (!added) addPOItemFromMaterial(material);
                            }}
                          >
                            <span>
                              {material.name}
                              {material.unit ? (
                                <span className="text-gray-400">
                                  {" "}
                                  ({material.unit})
                                </span>
                              ) : null}
                            </span>
                            {added && (
                              <span className="text-xs text-gray-500 shrink-0">
                                Added
                              </span>
                            )}
                          </div>
                        );
                        }),
                      ];
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
                {/* Table headers */}
                <div className="grid grid-cols-7 gap-2 font-medium text-sm text-gray-700 pb-2 border-b">
                  <div>Raw Material</div>
                  <div>Qty</div>
                  <div>Unit</div>
                  <div>Rate</div>
                  <div>Tax (%)</div>
                  <div>Amount</div>
                  <div>Action</div>
                </div>

                {poForm.items.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Click the box above to pick raw materials
                  </div>
                )}
                
                {poForm.items.map((item, index) => {
                  const filteredForPO = poForm.supplierId
                    ? rawMaterials.filter(m =>
                        (m.suppliers || []).some(s => {
                          const sId = typeof s.supplier === 'object' ? s.supplier._id : s.supplier;
                          return String(sId) === String(poForm.supplierId);
                        })
                      )
                    : rawMaterials;
                  
                  const searchTerm = (materialSearchInputs[index] || "").toLowerCase();
                  const filteredMaterials = searchTerm
                    ? filteredForPO.filter(m =>
                        m.name?.toLowerCase().includes(searchTerm) ||
                        m.code?.toLowerCase().includes(searchTerm)
                      )
                    : [];
                  
                  const selectedMaterial = rawMaterials.find(m => m._id === item.name);
                  
                  return (
                    <div key={index} className="grid grid-cols-7 gap-2 items-start">
                      {/* Material Search Input */}
                      <div className="relative">
                        <Input
                          placeholder="Search material..."
                          value={selectedMaterial ? selectedMaterial.name : (materialSearchInputs[index] || "")}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMaterialSearchInputs(prev => ({
                              ...prev,
                              [index]: value
                            }));
                            
                            // Clear selection if user is typing
                            if (item.name) {
                              const updatedItems = [...poForm.items];
                              updatedItems[index].name = "";
                              setPoForm({ ...poForm, items: updatedItems });
                            }
                          }}
                          onFocus={() => {
                            if (!item.name) {
                              setMaterialSearchResults(prev => ({
                                ...prev,
                                [index]: true
                              }));
                            }
                          }}
                          className="pr-8"
                        />
                        {selectedMaterial && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedItems = [...poForm.items];
                              updatedItems[index].name = "";
                              updatedItems[index].unit = "pcs";
                              setPoForm({ ...poForm, items: updatedItems });
                              setMaterialSearchInputs(prev => ({
                                ...prev,
                                [index]: ""
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Search Results Dropdown */}
                        {materialSearchResults[index] && filteredMaterials.length > 0 && !item.name && (
                          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredMaterials.map((material) => (
                              <div
                                key={material._id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  const updatedItems = [...poForm.items];
                                  updatedItems[index].name = material._id;
                                  updatedItems[index].unit = material.unit || "pcs";
                                  setPoForm({ ...poForm, items: updatedItems });
                                  setMaterialSearchResults(prev => ({
                                    ...prev,
                                    [index]: false
                                  }));
                                  setMaterialSearchInputs(prev => ({
                                    ...prev,
                                    [index]: ""
                                  }));
                                }}
                              >
                                {material.name} ({material.unit})
                                {material.code && (
                                  <span className="text-gray-500 text-xs ml-2">
                                    {material.code}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <Input
                        type="number"
                        placeholder="Qty"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => {
                          const raw = e.target.value;
                          // Block negatives — a negative qty silently flips the
                          // line amount and the whole order total negative
                          if (raw !== "" && parseFloat(raw) < 0) return;
                          const updatedItems = [...poForm.items];
                          updatedItems[index].quantity = raw;
                          const qty = parseFloat(raw) || 0;
                          const rate = parseFloat(updatedItems[index].rate) || 0;
                          const taxPercent = parseFloat(updatedItems[index].tax) || 0;
                          const baseAmount = qty * rate;
                          const taxAmount = baseAmount * (taxPercent / 100);
                          updatedItems[index].amount = (baseAmount + taxAmount).toFixed(2);
                          setPoForm({ ...poForm, items: updatedItems });
                        }}
                      />
                      
                      {/* Unit (read-only, auto-populated) */}
                      <Input
                        placeholder="Unit"
                        value={item.unit}
                        readOnly
                        className="bg-gray-50"
                      />
                      
                      {/* Rate */}
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          placeholder="Rate"
                          min="0"
                          step="any"
                          value={item.rate}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Block negative rates for the same reason as qty
                            if (raw !== "" && parseFloat(raw) < 0) return;
                            const updatedItems = [...poForm.items];
                            updatedItems[index].rate = raw;
                            const qty = parseFloat(updatedItems[index].quantity) || 0;
                            const rate = parseFloat(raw) || 0;
                            const taxPercent = parseFloat(updatedItems[index].tax) || 0;
                            const baseAmount = qty * rate;
                            const taxAmount = baseAmount * (taxPercent / 100);
                            updatedItems[index].amount = (baseAmount + taxAmount).toFixed(2);
                            setPoForm({ ...poForm, items: updatedItems });
                          }}
                        />
                        {item.previousRate != null && (
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-0.5 text-left cursor-pointer"
                            onClick={() => {
                              const updatedItems = [...poForm.items];
                              updatedItems[index].rate = item.previousRate;
                              const qty = parseFloat(updatedItems[index].quantity) || 0;
                              const rate = parseFloat(item.previousRate) || 0;
                              const taxPercent = parseFloat(updatedItems[index].tax) || 0;
                              const baseAmount = qty * rate;
                              const taxAmount = baseAmount * (taxPercent / 100);
                              updatedItems[index].amount = (baseAmount + taxAmount).toFixed(2);
                              setPoForm({ ...poForm, items: updatedItems });
                            }}
                            title="Click to use this rate"
                          >
                            Prev: ₹{item.previousRate}
                          </button>
                        )}
                      </div>
                      
                      {/* Tax */}
                      <Input
                        type="number"
                        placeholder="Tax %"
                        min="0"
                        max="100"
                        step="any"
                        value={item.tax}
                        onChange={(e) => {
                          const raw = e.target.value;
                          // Tax is a percentage — keep it within 0–100
                          const parsed = parseFloat(raw);
                          if (raw !== "" && (parsed < 0 || parsed > 100)) return;
                          const updatedItems = [...poForm.items];
                          updatedItems[index].tax = raw;
                          const qty = parseFloat(updatedItems[index].quantity) || 0;
                          const rate = parseFloat(updatedItems[index].rate) || 0;
                          const taxPercent = parsed || 0;
                          const baseAmount = qty * rate;
                          const taxAmount = baseAmount * (taxPercent / 100);
                          updatedItems[index].amount = (baseAmount + taxAmount).toFixed(2);
                          setPoForm({ ...poForm, items: updatedItems });
                        }}
                      />
                      
                      {/* Amount (read-only, auto-calculated with tax) */}
                      <Input placeholder="Amount" value={item.amount} readOnly className="bg-gray-50" />
                      
                      {/* Delete Button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const updatedItems = poForm.items.filter(
                            (_, i) => i !== index
                          );
                          setPoForm({ ...poForm, items: updatedItems });
                          // Clean up search state for this index
                          setMaterialSearchInputs(prev => {
                            const newState = { ...prev };
                            delete newState[index];
                            return newState;
                          });
                          setMaterialSearchResults(prev => {
                            const newState = { ...prev };
                            delete newState[index];
                            return newState;
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Payment Terms (Days)
                </Label>
                <Input
                  type="number"
                  value={poForm.paymentTerms}
                  onChange={(e) =>
                    setPoForm({ ...poForm, paymentTerms: e.target.value })
                  }
                />
              </div>
              {/* Order-level "Tax Rate (%)" removed — tax is captured per item
                  in the Items table. Keeping both double-taxed the order. */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Order Total</Label>
                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">
                  {(() => {
                    const base = poForm.items.reduce((sum, i) => {
                      return (
                        sum +
                        (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0)
                      );
                    }, 0);
                    const taxTotal = poForm.items.reduce((sum, i) => {
                      const q = parseFloat(i.quantity) || 0;
                      const r = parseFloat(i.rate) || 0;
                      const t = parseFloat(i.tax) || 0;
                      return sum + (q * r * t) / 100;
                    }, 0);
                    return (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-500">
                          Subtotal ₹{base.toFixed(2)} + Tax ₹
                          {taxTotal.toFixed(2)}
                        </span>
                        <span className="font-semibold">
                          ₹{(base + taxTotal).toFixed(2)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  value={poForm.notes}
                  onChange={(e) =>
                    setPoForm({ ...poForm, notes: e.target.value })
                  }
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPOModal(false);
                  resetPOForm();
                }}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[80px] bg-blue-600 hover:bg-blue-700"
              >
                {editingPO ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Purchase Order Details
            </DialogTitle>
            <DialogDescription>
              {viewingPO?.purchaseOrderId &&
                `PO Number: ${viewingPO.purchaseOrderId}`}
            </DialogDescription>
          </DialogHeader>

          {viewingPO && (
            <div className="space-y-6 mt-4">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-500">PO Number</Label>
                  <p className="font-semibold text-lg">
                    {viewingPO.purchaseOrderId || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Invoice Number
                  </Label>
                  <p className="font-semibold">
                    {viewingPO.invoiceNumber || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      viewingPO.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : viewingPO.status === "In Transit"
                        ? "bg-blue-100 text-blue-800"
                        : viewingPO.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewingPO.status || "Pending"}
                  </span>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Payment Status
                  </Label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                      viewingPO.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : viewingPO.paymentStatus === "Overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewingPO.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              {/* Supplier & Branch Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Supplier Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">
                        Supplier Name
                      </Label>
                      <p className="font-medium">
                        {viewingPO.supplierId?.name ||
                          viewingPO.supplierName ||
                          "—"}
                      </p>
                    </div>
                    {viewingPO.supplierId?.companyName && (
                      <div>
                        <Label className="text-xs text-gray-500">Company</Label>
                        <p>{viewingPO.supplierId.companyName}</p>
                      </div>
                    )}
                    {viewingPO.supplierId?.contact && (
                      <div>
                        <Label className="text-xs text-gray-500">Contact</Label>
                        <p>{viewingPO.supplierId.contact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Branch Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">
                        Branch Name
                      </Label>
                      <p className="font-medium">
                        {viewingPO.branch?.name || "—"}
                      </p>
                    </div>
                    {viewingPO.branch?.address && (
                      <div>
                        <Label className="text-xs text-gray-500">Address</Label>
                        <p className="text-sm">{viewingPO.branch.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Dates & Store Location */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Order Date</Label>
                  <p className="font-medium">
                    {viewingPO.orderDate
                      ? new Date(viewingPO.orderDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Delivery Date</Label>
                  <p className="font-medium">
                    {viewingPO.deliveryDate
                      ? new Date(viewingPO.deliveryDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Store Location
                  </Label>
                  <p className="font-medium">
                    {viewingPO.storeLocation?.name ||
                      viewingPO.storeType ||
                      "—"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Tax (%)</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPO.items && viewingPO.items.length > 0 ? (
                        viewingPO.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {(() => {
                                // Handle populated material (object with name)
                                if (
                                  typeof item.name === "object" &&
                                  item.name?.name
                                ) {
                                  return item.name.name;
                                }
                                // Handle material ID string - look it up in rawMaterials
                                if (
                                  typeof item.name === "string" &&
                                  item.name
                                ) {
                                  const material = rawMaterials.find(
                                    (m) => m._id === item.name
                                  );
                                  return material?.name || item.name;
                                }
                                // Fallback
                                return "—";
                              })()}
                            </TableCell>
                            <TableCell>{item.quantity || "—"}</TableCell>
                            <TableCell>{item.unit || "—"}</TableCell>
                            <TableCell>
                              ₹{item.rate?.toLocaleString() || "0.00"}
                            </TableCell>
                            <TableCell>
                              {item.tax ? `${item.tax}%` : "—"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{item.amount?.toLocaleString() || "0.00"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan="6"
                            className="text-center text-gray-500"
                          >
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm">Subtotal:</Label>
                      <span className="font-semibold">
                        ₹{viewingPO.subtotal?.toLocaleString() || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      {/* Tax is the sum of per-item tax now, so there's no
                          single order-level percentage to show */}
                      <Label className="text-sm">Tax (item-wise):</Label>
                      <span className="font-semibold">
                        ₹{viewingPO.tax?.toLocaleString() || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <Label className="text-base font-bold">Total:</Label>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{viewingPO.total?.toLocaleString() || "0.00"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Payment Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-gray-500">
                        Payment Terms
                      </Label>
                      <p className="font-medium">
                        {viewingPO.paymentTerms
                          ? `${viewingPO.paymentTerms} days`
                          : "—"}
                      </p>
                    </div>
                    {viewingPO.notes && (
                      <div>
                        <Label className="text-xs text-gray-500">Notes</Label>
                        <p className="text-sm">{viewingPO.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-400 pt-2 border-t">
                <p>
                  Created:{" "}
                  {viewingPO.createdAt
                    ? new Date(viewingPO.createdAt).toLocaleString()
                    : "—"}
                </p>
                {viewingPO.updatedAt &&
                  viewingPO.updatedAt !== viewingPO.createdAt && (
                    <p>
                      Last Updated:{" "}
                      {new Date(viewingPO.updatedAt).toLocaleString()}
                    </p>
                  )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowViewModal(false);
                setViewingPO(null);
              }}
            >
              Close
            </Button>
            {viewingPO && (
              <>
                <Button variant="outline" onClick={() => downloadPOPdf(viewingPO)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => sharePOPdf(viewingPO)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
            {viewingPO && (
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  setEditingPO(viewingPO);
                  setPoForm({
                    supplierId:
                      viewingPO.supplierId?._id || viewingPO.supplierId || "",
                    invoiceNumber: viewingPO.invoiceNumber || "",
                    branch: viewingPO.branch || {
                      id: "",
                      name: "",
                      address: "",
                    },
                    storeLocationId:
                      viewingPO.storeLocationId?._id ||
                      viewingPO.storeLocationId ||
                      "",
                    orderDate: viewingPO.orderDate
                      ? new Date(viewingPO.orderDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    deliveryDate: viewingPO.deliveryDate
                      ? new Date(viewingPO.deliveryDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    items:
                      viewingPO.items?.map((item) => ({
                        name: item.name?._id || item.name || "",
                        quantity: item.quantity || "",
                        unit: item.unit || "pcs",
                        rate: item.rate || "",
                        tax: item.tax ?? 0,
                        amount: item.amount || "",
                        previousRate: null,
                        previousPO: null,
                      })) || [],
                    notes: viewingPO.notes || "",
                    paymentTerms: viewingPO.paymentTerms || "30",
                    taxRate: viewingPO.taxRate || 0,
                  });
                  setViewingPO(null);
                  setShowPOModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit PO
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation — shared by Purchase Orders and GRNs */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.type === "po" ? "Purchase Order" : "GRN"}?
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.label ? (
                <>
                  <span className="font-semibold">{deleteTarget.label}</span>{" "}
                  will be permanently deleted. This cannot be undone.
                </>
              ) : (
                "This record will be permanently deleted. This cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Warn when the PO already has a GRN — deleting it leaves the GRN
              pointing at a record that no longer exists */}
          {deleteTarget?.type === "po" && deleteTarget?.hasGRN && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              This PO already has a GRN. Deleting it will leave that GRN without
              a linked purchase order — consider deleting the GRN first.
            </div>
          )}

          {/* Warn when the GRN is approved — stock may already be posted */}
          {deleteTarget?.type === "grn" &&
            deleteTarget?.status === "Approved" && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                This GRN is Approved. Deleting it will not reverse any stock that
                was already received against it.
              </div>
            )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseManagement;
