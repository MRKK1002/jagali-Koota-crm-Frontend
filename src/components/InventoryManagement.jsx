import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  RefreshCw,
  Edit3,
  XCircle,
  CheckCircle,
  Trash2,
  Plus,
  X,
  TrendingUp,
  Eye,
  Send,
  Download,
  ArrowRightLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const INV_API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "https://crm.jagalikoota.com";
const INV_HOTEL_API = `${INV_API_BASE}/api/v1/hotel`;

const HotelInventorySystem = () => {
  const [inventory, setInventory] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [tableSearch, setTableSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [supplierMap, setSupplierMap] = useState({}); // productName -> [{ supplier, gst, grnNumber, qty, rate, amount, date }]
  const [viewProduct, setViewProduct] = useState(null); // productName
  const [showAddModal, setShowAddModal] = useState(false);

  const [manualEntryData, setManualEntryData] = useState({
    productName: "",
    supplier: "",
    branch: "",
    storeType: "Main Store",
    category: "",
    quantity: "",
    basePrice: "",
    unitOfMeasurement: "",
  });
  const [branches, setBranches] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter states
  const [filterStoreType, setFilterStoreType] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStoreLocation, setFilterStoreLocation] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Distribution states
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distributingItem, setDistributingItem] = useState(null);
  const [distributionData, setDistributionData] = useState({
    recipientName: "",
    contact: "",
    quantityToDistribute: "",
    purpose: "",
    branch: "",
    storeLocation: "",
  });

  // Transfer (move between stores) states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferringItem, setTransferringItem] = useState(null);
  const [transferData, setTransferData] = useState({
    toStore: "",
    quantity: "",
    notes: "",
    transferType: "full", // "full" or "partial"
  });

  // Move All (bulk transfer) states
  const [showMoveAllModal, setShowMoveAllModal] = useState(false);
  const [moveAllFromStore, setMoveAllFromStore] = useState("");
  const [moveAllToStore, setMoveAllToStore] = useState("");

  // Fetch GRN and Recipe Requirements, compute available = received - consumed
  const fetchSavedInventory = async () => {
    setLoading(true);
    try {
      const [grnRes, reqRes, stockRes, poRes, branchRes, supplierRes] =
        await Promise.all([
          fetch(`${INV_HOTEL_API}/grn/?limit=1000`).catch((err) => {
            console.error("? Error fetching GRN:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(`${INV_API_BASE}/api/new-recipe-requirements`).catch(
            (err) => {
              console.error("? Error fetching recipe requirements:", err);
              return { ok: false, json: async () => [] };
            }
          ),
          fetch(`${INV_HOTEL_API}/stock`).catch((err) => {
            console.error("? Error fetching stock:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(`${INV_HOTEL_API}/purchaseOrders`).catch(
            (err) => {
              console.error("? Error fetching purchase orders:", err);
              return { ok: false, json: async () => ({ data: [] }) };
            }
          ),
          fetch(`${INV_HOTEL_API}/branch`).catch((err) => {
            console.error("? Error fetching branches:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(`${INV_API_BASE}/res/supplier`).catch((err) => {
            console.error("? Error fetching suppliers:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
        ]);
      const grnJson = await grnRes.json();
      const reqJson = await reqRes.json();

      // Create a map of purchase orders by ID for storeLocation/storeType lookup
      const poMap = new Map();
      const poSupplierMap = new Map(); // Map PO ID to supplier name for debugging
      if (poRes.ok) {
        try {
          const poData = await poRes.json();
          const purchaseOrders = Array.isArray(poData)
            ? poData
            : poData?.data || [];
          console.log(
            `?? Found ${purchaseOrders.length} Purchase Orders for storeLocation mapping`
          );

          purchaseOrders.forEach((po) => {
            if (po._id) {
              // Check for new storeLocation format first, then fall back to old storeType
              const storeLocationName = po.storeLocation?.name || po.storeType;
              if (storeLocationName) {
                poMap.set(po._id.toString(), storeLocationName);
                const supplierName =
                  po.supplierName || po.supplier || "Unknown";
                poSupplierMap.set(po._id.toString(), supplierName);
                console.log(
                  `?? PO ${
                    po.purchaseOrderId || po._id
                  } (Supplier: ${supplierName}) -> Store: "${storeLocationName}"`
                );
              }
            }
          });

          console.log(`? Created PO map with ${poMap.size} entries`);
          console.log(
            `?? Store locations found:`,
            Array.from(new Set(poMap.values()))
          );
        } catch (error) {
          console.error("Error parsing purchase orders:", error);
        }
      } else {
        console.warn(
          "?? Purchase Orders fetch failed, storeLocation mapping may be incomplete"
        );
      }

      // Create branch ID to name mapping for consistent key matching
      const branchMap = new Map(); // ID -> name
      const branchNameMap = new Map(); // name -> ID
      if (branchRes.ok) {
        try {
          const branchData = await branchRes.json();
          const branches = Array.isArray(branchData)
            ? branchData
            : branchData?.data || [];
          branches.forEach((branch) => {
            if (branch._id && branch.name) {
              branchMap.set(branch._id.toString(), branch.name);
              branchNameMap.set(branch.name, branch._id.toString());
            }
          });
          console.log(
            "? Branch mapping created:",
            Object.fromEntries(branchMap)
          );
        } catch (error) {
          console.error("Error parsing branch data:", error);
        }
      }

      // Create supplier name/ID to GST mapping
      const supplierGSTMap = new Map(); // supplier name/ID -> GST
      if (supplierRes.ok) {
        try {
          const supplierData = await supplierRes.json();
          const suppliers = Array.isArray(supplierData)
            ? supplierData
            : supplierData?.data || [];
          suppliers.forEach((supplier) => {
            // Map by name, supplierID, and _id for flexible lookup
            if (supplier.name) {
              supplierGSTMap.set(supplier.name, supplier.gst || "");
            }
            if (supplier.supplierID) {
              supplierGSTMap.set(supplier.supplierID, supplier.gst || "");
            }
            if (supplier._id) {
              supplierGSTMap.set(supplier._id.toString(), supplier.gst || "");
            }
          });
          console.log(
            "? Supplier GST mapping created:",
            Object.fromEntries(supplierGSTMap)
          );
        } catch (error) {
          console.error("Error parsing supplier data:", error);
        }
      }

      // Gracefully handle GRN shape; continue even if GRN fails (we can still use stock)
      const grnOk = grnRes.ok && Array.isArray(grnJson?.data);

      // Aggregate received quantities from GRN by product name + branch + storeType
      const receivedByProduct = new Map(); // key: "productName|branch|storeType"
      const firstMetaByProduct = new Map();
      const supplierAgg = new Map(); // product -> array of supplier entries with transaction history
      const transactionHistory = new Map(); // key: "productName|branch|storeType" -> array of transactions

      (grnOk ? grnJson.data : []).filter((grn) => {
        // Only count GRNs with status "Received" or "Approved" toward inventory
        const s = (grn.status || "").toLowerCase();
        return s === "received" || s === "approved";
      }).forEach((grn) => {

        // Normalize branch: convert ID to name if possible, otherwise use as-is
        let grnBranch = grn.branch || "Unknown";
        if (branchMap.has(grnBranch)) {
          grnBranch = branchMap.get(grnBranch); // Convert ID to name
        }
        // Get storeType from purchase order if available, otherwise use GRN's storeType
        let grnStoreType = grn.storeType || "";

        // If GRN has poId, ALWAYS use storeType from purchase order (this ensures correct store type even for old GRNs)
        if (grn.poId) {
          const poStoreType = poMap.get(grn.poId.toString());
          const poSupplier = poSupplierMap.get(grn.poId.toString());
          if (poStoreType) {
            // Always use PO storeType, even if GRN has a different one
            if (poStoreType !== grnStoreType) {
              console.log(
                `?? GRN ${grn.grnNumber || grn._id} (Supplier: ${
                  grn.supplier || poSupplier || "Unknown"
                }): Using PO storeType "${poStoreType}" instead of GRN storeType "${grnStoreType}"`
              );
            }
            grnStoreType = poStoreType;
          } else {
            console.warn(
              `?? GRN ${grn.grnNumber || grn._id} has poId ${
                grn.poId
              } but storeLocation not found in PO map`
            );
          }
        } else {
          console.warn(
            `?? GRN ${grn.grnNumber || grn._id} (Supplier: ${
              grn.supplier || "Unknown"
            }) has no poId, using GRN storeType: "${grnStoreType}"`
          );
        }

        const grnDate = grn.createdAt
          ? new Date(grn.createdAt).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN");

        // Debug logging for storeType
        if (!grn.storeType && !grn.poId) {
          console.warn(
            `?? GRN ${
              grn.grnNumber || grn._id
            } missing storeType and poId, defaulting to "Main Store"`
          );
        } else if (grn.poId && poMap.has(grn.poId.toString())) {
          console.log(
            `? GRN ${
              grn.grnNumber || grn._id
            } using storeType from PO: ${grnStoreType}`
          );
        } else {
          console.log(
            `? GRN ${grn.grnNumber || grn._id} has storeType: ${grnStoreType}`
          );
        }

        (grn.items || []).forEach((item) => {
          const productName = String(item.product || "").trim();
          if (!productName) return;
          
          // Use acceptedQty (received - rejected) for inventory
          const receivedQty = Number(item.receivedQty || item.quantityReceived || item.quantity || 0);
          const rejectedQty = Number(item.rejectedQty || item.damageQuantity || 0);
          const acceptedQty = Number(item.acceptedQty || item.goodQuantity || (receivedQty - rejectedQty) || 0);
          
          // Check for storeType at item level first, then use corrected GRN storeType, then default
          // This ensures we get the correct storeType even if items have their own storeType
          const itemStoreType = item.storeType || grnStoreType || "";

          // Debug logging for final storeType
          if (itemStoreType !== grnStoreType && item.storeType) {
            console.log(
              `?? Item "${productName}" using item-level storeType: ${itemStoreType} (GRN has: ${grnStoreType})`
            );
          }

          // Create composite key: productName|branch|storeType
          const key = `${productName}|${grnBranch}|${itemStoreType}`;
          
          // Aggregate accepted quantities (this is what's actually available)
          receivedByProduct.set(key, (receivedByProduct.get(key) || 0) + acceptedQty);
          
          // Get supplier name/ID and lookup GST
          const supplierNameOrId = grn.supplier || item.supplier || "Unknown";
          const supplierGST =
            supplierGSTMap.get(supplierNameOrId) ||
            supplierGSTMap.get(supplierNameOrId?.toString()) ||
            "";

          // Store first metadata
          if (!firstMetaByProduct.has(key)) {
            firstMetaByProduct.set(key, {
              grnNumber: grn.grnNumber,
              grnId: grn._id,
              supplier: supplierNameOrId,
              supplierGST: supplierGST,
              branch: grnBranch,
              storeType: itemStoreType,
              category: item.category || "Uncategorized",
              basePrice: item.rate || 0,
              taxRate: grn.taxRate || 0, // Add tax rate from GRN
              unitOfMeasurement: item.unit || "unit",
              date: grnDate,
            });
          }

          // Add to supplier aggregation
          const entry = {
            supplier: supplierNameOrId,
            supplierGST: supplierGST,
            grnNumber: grn.grnNumber || "-",
            quantity: acceptedQty,
            quantityReceived: receivedQty,
            damageQuantity: rejectedQty,
            rate: item.rate || 0,
            amount: item.amount || acceptedQty * (item.rate || 0),
            date: grnDate,
            branch: grnBranch,
            storeType: itemStoreType,
            transactionType: "Received",
          };
          const list = supplierAgg.get(productName) || [];
          list.push(entry);
          supplierAgg.set(productName, list);

          // Add transaction history
          const transKey = `${productName}|${grnBranch}|${itemStoreType}`;
          const transList = transactionHistory.get(transKey) || [];
          transList.push({
            date: grnDate,
            type: "Received",
            quantity: acceptedQty,
            receivedQty: receivedQty,
            damageQty: rejectedQty,
            grnNumber: grn.grnNumber,
            supplier: supplierNameOrId,
            supplierGST: supplierGST,
            rate: item.rate || 0,
            amount: item.amount || acceptedQty * (item.rate || 0),
            storeType: itemStoreType,
          });
          transactionHistory.set(transKey, transList);
        });
      });

      // Aggregate consumed quantities from GRN items first (actual consumed quantities)
      const consumedByProduct = new Map(); // key: "productName|branch|storeType"

      // First, aggregate consumedQuantity from GRN items (this is the actual consumed quantity)
      (grnOk ? grnJson.data : []).filter((grn) => {
        const s = (grn.status || "").toLowerCase();
        return s === "received" || s === "approved";
      }).forEach((grn) => {
        // Normalize branch: convert ID to name if possible, otherwise use as-is
        let grnBranch = grn.branch || "Unknown";
        if (branchMap.has(grnBranch)) {
          grnBranch = branchMap.get(grnBranch); // Convert ID to name
        }
        // Get storeType from purchase order if available, otherwise use GRN's storeType
        // ALWAYS prioritize Purchase Order's storeLocation over GRN's storeType
        let grnStoreType = grn.storeType || "";

        // If GRN has poId, ALWAYS use storeType from purchase order (this ensures correct store type even for old GRNs)
        if (grn.poId) {
          const poStoreType = poMap.get(grn.poId.toString());
          const poSupplier = poSupplierMap.get(grn.poId.toString());
          if (poStoreType) {
            // Always use PO storeType, even if GRN has a different one
            if (poStoreType !== grnStoreType) {
              console.log(
                `?? GRN ${grn.grnNumber || grn._id} (Supplier: ${
                  grn.supplier || poSupplier || "Unknown"
                }): Using PO storeType "${poStoreType}" instead of GRN storeType "${grnStoreType}"`
              );
            }
            grnStoreType = poStoreType;
          } else {
            console.warn(
              `?? GRN ${grn.grnNumber || grn._id} has poId ${
                grn.poId
              } but storeLocation not found in PO map`
            );
          }
        } else {
          console.warn(
            `?? GRN ${grn.grnNumber || grn._id} (Supplier: ${
              grn.supplier || "Unknown"
            }) has no poId, using GRN storeType: "${grnStoreType}"`
          );
        }

        (grn.items || []).forEach((item) => {
          const productName = String(item.product || "").trim();
          if (!productName) return;

          // Check for storeType at item level first, then use corrected GRN storeType, then default
          const itemStoreType = item.storeType || grnStoreType || "";

          // Create composite key: productName|branch|storeType
          const key = `${productName}|${grnBranch}|${itemStoreType}`;

          // Aggregate consumedQuantity from GRN items (this is the actual consumed quantity)
          const consumedQty = Number(item.consumedQuantity || 0);
          // Always add to map, even if 0, to ensure the key exists for proper aggregation
          const currentConsumed = consumedByProduct.get(key) || 0;
          consumedByProduct.set(key, currentConsumed + consumedQty);

          if (consumedQty > 0) {
            console.log(
              `?? GRN consumedQuantity: ${productName} - ${consumedQty} from ${itemStoreType} (Branch: ${grnBranch}, GRN: ${grn.grnNumber})`
            );
          }
        });
      });

      // Then, also aggregate from recipe requirements (only if GRN items don't have consumedQuantity)
      // This ensures we show consumption even if GRN items haven't been updated yet
      if (reqRes.ok && Array.isArray(reqJson)) {
        reqJson.forEach((recipe) => {
          // Normalize recipe branch: use branchName if available, otherwise convert branchId to name
          let recipeBranch = recipe.branchName || recipe.branch || "Unknown";
          if (recipe.branchId && branchMap.has(recipe.branchId.toString())) {
            recipeBranch = branchMap.get(recipe.branchId.toString()); // Convert ID to name
          }
          const recipeStoreType = recipe.storeType || ""; // Recipe-level storeType
          (recipe.items || []).forEach((it) => {
            const productName = String(it.rawMaterial?.name || "").trim();
            if (!productName) return;
            const qty = Number(it.quantity || 0);
            // Use item-level storeType if available, otherwise use recipe-level storeType
            const itemStoreType =
              it.storeType || recipeStoreType || "";
            const key = `${productName}|${recipeBranch}|${itemStoreType}`;

            // Only add from recipe requirements if GRN items don't already have consumedQuantity for this key
            // This prevents double-counting since GRN items' consumedQuantity is updated when recipes are saved
            const existingConsumed = consumedByProduct.get(key) || 0;
            if (existingConsumed === 0) {
              // No consumedQuantity from GRN items, so use recipe requirement
              consumedByProduct.set(key, qty);
              console.log(
                `?? Recipe consumption (fallback): ${productName} - ${qty} ${
                  it.unit || "unit"
                } from ${itemStoreType} (Branch: ${recipeBranch})`
              );
            } else {
              // GRN items already have consumedQuantity, so skip recipe requirement to avoid double-counting
              console.log(
                `?? Skipping recipe consumption for ${productName} (GRN already has consumedQuantity: ${existingConsumed})`
              );
            }

            // Always add consumption transaction for history
            const transKey = key;
            const transList = transactionHistory.get(transKey) || [];
            transList.push({
              date: recipe.createdAt
                ? new Date(recipe.createdAt).toLocaleDateString("en-IN")
                : new Date().toLocaleDateString("en-IN"),
              type: "Consumed",
              quantity: -qty, // Negative for consumption
              recipeName: recipe.productName || recipe.name || "Unknown Recipe",
              branch: recipeBranch,
              storeType: itemStoreType, // Use item-level storeType
            });
            transactionHistory.set(transKey, transList);
          });
        });
      }

      // Log all consumption keys for debugging
      console.log(
        "?? Received quantity keys:",
        Array.from(receivedByProduct.keys())
      );
      console.log("?? Consumption keys:", Array.from(consumedByProduct.keys()));
      console.log(
        "?? Consumption totals:",
        Object.fromEntries(consumedByProduct)
      );
      console.log("?? Received totals:", Object.fromEntries(receivedByProduct));

      // Use stock baseline for realtime availability (reflects recipe consumption)
      const stockJson = await stockRes.json();
      const stockOk = stockRes.ok && Array.isArray(stockJson?.data);
      const stockList = stockOk ? stockJson.data : [];

      let inventoryItems = [];

      // Build inventory items from GRN data grouped by productName|branch|storeType
      const inventoryMap = new Map();

      // Process received quantities
      receivedByProduct.forEach((totalReceived, key) => {
        const [productName, branch, storeType] = key.split("|");
        const consumed = consumedByProduct.get(key) || 0;
        const available = Math.max(0, totalReceived - consumed);
        const meta = firstMetaByProduct.get(key) || {};
        
        // Calculate total value based on AVAILABLE stock (not total received)
        const subtotal = (meta.basePrice || 0) * available;
        const taxAmount = subtotal * ((meta.taxRate || 0) / 100);
        const totalValue = subtotal + taxAmount;
        
        const transList = transactionHistory.get(key) || [];

        inventoryMap.set(key, {
          _id: `${key}-${meta.grnId || Date.now()}`,
          grnNumber: meta.grnNumber || "-",
          grnId: meta.grnId || "-",
          productName,
          supplier: meta.supplier || "-",
          supplierGST: meta.supplierGST || "",
          branch: branch || "-",
          storeType: storeType || "",
          category: meta.category || "-",
          quantity: totalReceived,
          availableQuantity: available,
          consumedQuantity: consumed,
          basePrice: meta.basePrice || 0,
          taxRate: meta.taxRate || 0,
          totalValue,
          gstRate: 0,
          unitOfMeasurement: meta.unitOfMeasurement || "unit",
          date: meta.date || "N/A",
          transactionHistory: transList.sort(
            (a, b) =>
              new Date(b.date.split("/").reverse().join("-")) -
              new Date(a.date.split("/").reverse().join("-"))
          ),
        });
      });

      inventoryItems = Array.from(inventoryMap.values());

      // If stock API has data, merge with it
      if (stockList.length > 0) {
        stockList.forEach((s) => {
          const name = s.rawMaterial?.name || "Unknown";
          if (name === "Unknown") return; // Skip items with no valid material
          // Normalize branch: convert ID to name if possible
          let branch = s.branch || "Unknown";
          if (branchMap.has(branch)) {
            branch = branchMap.get(branch); // Convert ID to name
          }
          const storeType = s.storeType || "";
          if (!storeType) return; // Skip stock items without store
          const key = `${name}|${branch}|${storeType}`;

          if (inventoryMap.has(key)) {
            const existing = inventoryMap.get(key);
            const oldAvailable = existing.availableQuantity;
            existing.availableQuantity =
              s.remainingStock != null
                ? s.remainingStock
                : existing.availableQuantity;
            existing.basePrice = s.avgPrice || existing.basePrice;

            // Recalculate consumedQuantity from availableQuantity when stock API overrides
            // consumedQuantity = quantity - availableQuantity
            if (s.remainingStock != null && existing.quantity > 0) {
              const calculatedConsumed =
                existing.quantity - existing.availableQuantity;
              // Only update if the calculated consumed is different (stock API reflects consumption)
              if (calculatedConsumed !== existing.consumedQuantity) {
                console.log(
                  `?? Updated consumedQuantity for ${name}: ${existing.consumedQuantity} -> ${calculatedConsumed} (Stock API: ${s.remainingStock}, Total: ${existing.quantity})`
                );
                existing.consumedQuantity = Math.max(0, calculatedConsumed);
              }
            }
          } else {
            // Add stock items that don't have GRN yet
            inventoryMap.set(key, {
              _id: s._id || `${key}-stock`,
              grnNumber: "-",
              grnId: "-",
              productName: name,
              supplier: "-",
              supplierGST: "",
              branch: branch,
              storeType: storeType,
              category: s.category || "-",
              quantity: s.totalQuantityPurchased || 0,
              availableQuantity: s.remainingStock || 0,
              consumedQuantity: 0,
              basePrice: s.avgPrice || 0,
              totalValue: (s.avgPrice || 0) * (s.totalQuantityPurchased || 0),
              gstRate: 0,
              unitOfMeasurement: s.rawMaterial?.unit || "unit",
              date: s.createdAt
                ? new Date(s.createdAt).toLocaleDateString("en-IN")
                : "N/A",
              transactionHistory: [],
            });
          }
        });

        inventoryItems = Array.from(inventoryMap.values());
      }

      setInventory(inventoryItems);
      // Save supplier breakdown map
      const supplierObj = {};
      supplierAgg.forEach((val, k) => {
        supplierObj[k] = val;
      });
      setSupplierMap(supplierObj);

      // Log store types found in inventory
      const storeTypesFound = new Set();
      inventoryItems.forEach((item) => {
        if (item.storeType) storeTypesFound.add(item.storeType);
      });
      console.log(
        "?? Computed Inventory (GRN - Recipe Consumption):",
        inventoryItems
      );
      console.log("?? Total Items:", inventoryItems.length);
      console.log("?? Store Types Found:", Array.from(storeTypesFound).sort());
      console.log("?? Transaction History:", transactionHistory);

      // Warn if only one store type found
      if (storeTypesFound.size === 1) {
        const onlyStoreType = Array.from(storeTypesFound)[0];
        console.warn(
          `?? Only one store type found in inventory: "${onlyStoreType}". Check if GRNs have storeType set correctly.`
        );
      }
    } catch (error) {
      console.error("? Network error fetching inventory:", error);

      // Check if it's a connection error
      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("ERR_CONNECTION_REFUSED")
      ) {
        alert(
          "?? Cannot connect to backend server.\n\nPlease ensure:\n1. The backend server is running on https://crm.jagalikoota.com\n2. The server is not blocked by firewall\n3. Check the backend console for errors"
        );
      } else {
        alert(`Network error: ${error.message || "Could not fetch inventory"}`);
      }

      // Set empty inventory on error to prevent UI issues
      setInventory([]);
      setSupplierMap({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches, raw materials, and store locations for manual entry
  // Using the same API endpoints as their respective management pages for consistency
  useEffect(() => {
    const fetchBranchesAndMaterials = async () => {
      try {
        // Use Restaurant Profile API for branches
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const apiBaseUrl = isDevelopment
          ? `${INV_HOTEL_API}`
          : `${INV_HOTEL_API}`;
        const branchApiUrl = `${apiBaseUrl}/getAllRestaurants`;
        // Use the raw-material endpoint that has distributionUnit and conversionFactor
        const materialApiUrl = `${apiBaseUrl}/raw-material`;
        // Use the same store location endpoint as StoreLocation.jsx
        const storeLocationApiUrl = `${apiBaseUrl}/store-location`;
        // Use the same supplier endpoint as ResSupplier.jsx
        const supplierApiUrl = isDevelopment
          ? `${INV_API_BASE}/res/supplier`
          : `${INV_API_BASE}/res/supplier`;
        // Use the same category endpoint as CategoryManagement.jsx
        const categoryApiUrl = `${apiBaseUrl}/category`;

        const [
          branchRes,
          materialRes,
          storeLocationRes,
          supplierRes,
          categoryRes,
        ] = await Promise.all([
          fetch(branchApiUrl).catch((err) => {
            console.error("Error fetching restaurant profiles:", err);
            return { ok: false, json: async () => [] };
          }),
          fetch(materialApiUrl).catch((err) => {
            console.error("Error fetching materials:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(storeLocationApiUrl).catch((err) => {
            console.error("Error fetching store locations:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(supplierApiUrl).catch((err) => {
            console.error("Error fetching suppliers:", err);
            return { ok: false, json: async () => ({ data: [] }) };
          }),
          fetch(categoryApiUrl).catch((err) => {
            console.error("Error fetching categories:", err);
            return { ok: false, json: async () => [] };
          }),
        ]);

        // Store branches list for category transformation
        let branchesList = [];

        if (branchRes.ok) {
          const branchData = await branchRes.json();
          // Restaurant Profile API returns array of restaurant profiles with branchName
          const restaurantProfiles = Array.isArray(branchData)
            ? branchData
            : branchData?.data || [];
          // Transform to match expected format: { _id, name } -> { _id, branchName }
          branchesList = restaurantProfiles.map((profile) => ({
            _id: profile._id,
            name: profile.branchName,
            restaurantName: profile.restaurantName,
          }));
          console.log(
            "? Fetched branches from Restaurant Profile:",
            branchesList.length,
            "branches"
          );
          console.log(
            "Branch names:",
            branchesList.map((b) => b.name)
          );
          setBranches(branchesList);
        } else {
          const errorText = await branchRes.text().catch(() => "");
          console.error(
            "? Failed to fetch restaurant profiles:",
            branchRes.status,
            errorText
          );
        }

        if (materialRes.ok) {
          const materialData = await materialRes.json();
          // Handle response format from matRawMaterial endpoint (same as RawMaterial.jsx)
          const materialsList = Array.isArray(materialData)
            ? materialData
            : materialData?.data || materialData?.materials || [];
          console.log(
            "? Fetched raw materials for manual entry:",
            materialsList.length,
            "materials"
          );
          setRawMaterials(materialsList);
        } else {
          console.warn("?? Failed to fetch raw materials:", materialRes.status);
        }

        if (storeLocationRes.ok) {
          const storeLocationData = await storeLocationRes.json();
          // Handle response format from store-location endpoint (same as StoreLocation.jsx)
          const locationsList = Array.isArray(storeLocationData)
            ? storeLocationData
            : storeLocationData?.data || [];
          console.log(
            "? Fetched store locations for manual entry:",
            locationsList.length,
            "locations"
          );
          setStoreLocations(locationsList);
        } else {
          console.warn(
            "?? Failed to fetch store locations:",
            storeLocationRes.status
          );
        }

        if (supplierRes.ok) {
          const supplierData = await supplierRes.json();
          // Handle response format from supplier endpoint (same as ResSupplier.jsx)
          const suppliersList = Array.isArray(supplierData)
            ? supplierData
            : supplierData?.data || [];
          console.log(
            "? Fetched suppliers for manual entry:",
            suppliersList.length,
            "suppliers"
          );
          setSuppliers(suppliersList);
        } else {
          console.warn("?? Failed to fetch suppliers:", supplierRes.status);
        }

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          // Handle response format from category endpoint (same as CategoryManagement.jsx)
          let categoriesList = Array.isArray(categoryData)
            ? categoryData
            : categoryData?.data || [];

          // Transform categories EXACTLY like CategoryManagement.jsx does (lines 481-499)
          // CategoryManagement uses: const branch = branchesData.find((b) => b._id === category.branchId);
          // But categories from API have branch.id (String), not branchId at root
          console.log(
            "?? Raw category sample (before transformation):",
            categoriesList[0]
          );

          categoriesList = categoriesList.map((category) => {
            // Categories from API have branch.id (String), try to find branchId at root first, then branch.id
            const categoryBranchId = category.branchId || category.branch?.id;

            console.log(
              `  Category "${category.name}": branchId=${category.branchId}, branch.id=${category.branch?.id}, branch.name=${category.branch?.name}`
            );

            // Find the corresponding branch - match exactly like CategoryManagement
            const branch = categoryBranchId
              ? branchesList.find((b) => {
                  // Match by _id (exact match or string comparison)
                  const branchIdMatch =
                    b._id === categoryBranchId ||
                    String(b._id) === String(categoryBranchId);
                  if (branchIdMatch) {
                    console.log(
                      `    ? Found branch match: ${b.name} (${b._id}) for category "${category.name}"`
                    );
                  }
                  return branchIdMatch;
                })
              : null;

            // This matches CategoryManagement.jsx transformation exactly (lines 487-498)
            const transformedCategory = {
              ...category,
              branchId: categoryBranchId, // Keep branchId for reference
              branch: branch
                ? {
                    id: branch._id,
                    name: branch.name, // CRITICAL: Use branch.name from branchesList - this is what CategoryManagement uses
                    address: branch.address || "Address not available",
                  }
                : {
                    id: categoryBranchId || category.branch?.id || "",
                    name: category.branch?.name || "Unknown Branch", // Fallback to category.branch.name from API
                    address:
                      category.branch?.address || "Address not available",
                  },
            };

            console.log(
              `  Transformed "${category.name}": branch.name="${transformedCategory.branch.name}", branch.id="${transformedCategory.branch.id}"`
            );
            return transformedCategory;
          });

          console.log("? Category transformation complete.");
          console.log(
            "?? Total categories after transformation:",
            categoriesList.length
          );
          if (categoriesList.length > 0) {
            console.log("?? Sample transformed category:", categoriesList[0]);
            console.log("?? Sample category branch info:", {
              branchId: categoriesList[0].branchId,
              branchIdType: typeof categoriesList[0].branchId,
              branch: categoriesList[0].branch,
              branchName: categoriesList[0].branch?.name,
              branchIdFromBranch: categoriesList[0].branch?.id,
            });
          }
          console.log("?? All unique branch names in categories:", [
            ...new Set(
              categoriesList.map((c) => c.branch?.name).filter(Boolean)
            ),
          ]);
          console.log("?? All branch IDs in categories:", [
            ...new Set(
              categoriesList
                .map((c) => c.branch?.id || c.branchId)
                .filter(Boolean)
            ),
          ]);
          console.log(
            "?? All branch names in branches list:",
            branchesList.map((b) => ({ id: b._id, name: b.name }))
          );

          console.log(
            "? Fetched categories for manual entry:",
            categoriesList.length,
            "categories"
          );
          setCategories(categoriesList);
        } else {
          console.warn("?? Failed to fetch categories:", categoryRes.status);
        }
      } catch (error) {
        console.error(
          "? Error fetching branches/materials/store locations/suppliers/categories:",
          error
        );
      }
    };

    fetchBranchesAndMaterials();
  }, []);

  useEffect(() => {
    fetchSavedInventory();

    // Auto-fix GRN store types on first load if needed
    // This ensures all GRNs have correct store types from their Purchase Orders
    const autoFixStoreTypes = async () => {
      try {
        const response = await fetch(
          `${INV_HOTEL_API}/grn/fix-store-types`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const result = await response.json();
        if (response.ok && result.data.fixed > 0) {
          console.log(
            `? Auto-fixed ${result.data.fixed} GRN storeTypes. Refreshing inventory...`
          );
          // Refresh inventory after fixing
          setTimeout(() => fetchSavedInventory(), 500);
        }
      } catch (error) {
        console.warn("?? Could not auto-fix GRN store types:", error);
        // Don't show alert for auto-fix failures - user can manually fix if needed
      }
    };

    // Run auto-fix after a short delay to let initial load complete
    const timer = setTimeout(autoFixStoreTypes, 2000);

    // Listen for inventory updates from other components (e.g., RecipeRequirement)
    const handleInventoryUpdate = (event) => {
      console.log("?? Inventory update event received:", event.detail);
      // Refresh inventory after a short delay to allow backend to process
      setTimeout(() => {
        console.log("?? Auto-refreshing inventory after update...");
        fetchSavedInventory();
      }, 1000);
    };

    window.addEventListener("inventoryUpdated", handleInventoryUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("inventoryUpdated", handleInventoryUpdate);
    };
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterStoreType,
    filterBranch,
    filterStoreLocation,
    filterSupplier,
    tableSearch,
  ]);

  // Get unique values for filter options
  const uniqueStoreTypes = useMemo(() => {
    const storeTypes = new Set();
    inventory.forEach((item) => {
      if (item.storeType) storeTypes.add(item.storeType);
    });
    return Array.from(storeTypes).sort();
  }, [inventory]);

  const uniqueBranches = useMemo(() => {
    const branches = new Set();
    inventory.forEach((item) => {
      if (item.branch) branches.add(item.branch);
    });
    return Array.from(branches).sort();
  }, [inventory]);

  // Dynamic months derived from inventory dates
  const uniqueMonths = useMemo(() => {
    const months = new Set();
    inventory.forEach((item) => {
      if (!item.date) return;
      let itemDate;
      if (item.date.includes('/')) {
        const parts = item.date.split('/');
        if (parts.length === 3) {
          itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        itemDate = new Date(item.date);
      }
      if (itemDate && !isNaN(itemDate.getTime())) {
        const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        months.add(key);
      }
    });
    return Array.from(months).sort().reverse(); // newest first
  }, [inventory]);

  const uniqueStoreLocations = useMemo(() => {
    const storeLocations = new Set();
    inventory.forEach((item) => {
      // Check both storeLocation and storeType fields
      if (item.storeLocation) {
        storeLocations.add(item.storeLocation);
      } else if (item.storeType) {
        storeLocations.add(item.storeType);
      }
    });
    console.log("?? Unique Store Locations found:", Array.from(storeLocations));
    console.log("?? Sample inventory items:", inventory.slice(0, 3).map(item => ({
      product: item.productName,
      storeLocation: item.storeLocation,
      storeType: item.storeType
    })));
    return Array.from(storeLocations).sort();
  }, [inventory]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set();
    inventory.forEach((item) => {
      if (item.supplier) suppliers.add(item.supplier);
    });
    return Array.from(suppliers).sort();
  }, [inventory]);

  // Group inventory by store location
  const inventoryByStoreLocation = useMemo(() => {
    const grouped = {};
    inventory.forEach((item) => {
      const storeType = item.storeType;
      if (!storeType) return; // Skip items without a store
      if (!grouped[storeType]) {
        grouped[storeType] = [];
      }
      grouped[storeType].push(item);
    });
    return grouped;
  }, [inventory]);

  // Filter inventory for search
  const filteredInventoryByStore = useMemo(() => {
    const filtered = {};
    Object.keys(inventoryByStoreLocation).forEach((storeType) => {
      filtered[storeType] = inventoryByStoreLocation[storeType].filter(
        (item) => {
          // Search filter
          const matchesSearch =
            (item.grnNumber || "")
              .toLowerCase()
              .includes(tableSearch.toLowerCase()) ||
            (item.supplier || "")
              .toLowerCase()
              .includes(tableSearch.toLowerCase()) ||
            (item.productName || "")
              .toLowerCase()
              .includes(tableSearch.toLowerCase()) ||
            (item.branch || "")
              .toLowerCase()
              .includes(tableSearch.toLowerCase()) ||
            (item.category || "")
              .toLowerCase()
              .includes(tableSearch.toLowerCase());

          // Branch filter
          const matchesBranch =
            filterBranch === "all" || item.branch === filterBranch;

          // Store Location filter - check both storeLocation and storeType
          const matchesStoreLocation =
            filterStoreLocation === "all" ||
            item.storeLocation === filterStoreLocation ||
            item.storeType === filterStoreLocation;

          // Supplier filter
          const matchesSupplier =
            filterSupplier === "all" || item.supplier === filterSupplier;

          // Month filter
          const matchesMonth = filterMonth === "all" || (() => {
            if (!item.date) return false;
            
            // Try to parse the date - it might be in DD/MM/YYYY format or ISO format
            let itemDate;
            if (item.date.includes('/')) {
              // Parse DD/MM/YYYY format
              const parts = item.date.split('/');
              if (parts.length === 3) {
                // parts[0] = day, parts[1] = month, parts[2] = year
                itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
              }
            } else {
              // Try ISO format or other standard formats
              itemDate = new Date(item.date);
            }
            
            if (!itemDate || isNaN(itemDate.getTime())) return false;
            
            const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            return itemMonth === filterMonth;
          })();

          return (
            matchesSearch &&
            matchesBranch &&
            matchesStoreLocation &&
            matchesSupplier &&
            matchesMonth
          );
        }
      );
    });
    return filtered;
  }, [
    inventoryByStoreLocation,
    tableSearch,
    filterBranch,
    filterStoreLocation,
    filterSupplier,
    filterMonth,
  ]);

  // Calculate totals based on filtered inventory by store
  const getTotalInventoryValue = () => {
    return Object.values(filteredInventoryByStore)
      .flat()
      .reduce((total, item) => total + (item.totalValue || 0), 0);
  };

  const getTotalQuantity = () => {
    return Object.values(filteredInventoryByStore)
      .flat()
      .reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getTotalItems = () => {
    return Object.values(filteredInventoryByStore).flat().length;
  };

  // Export inventory to Excel (item-wise totals, not GRN-wise)
  const handleExportInventory = () => {
    const allItems = Object.values(filteredInventoryByStore).flat();
    if (allItems.length === 0) {
      toast.error("No inventory data to export");
      return;
    }

    // Group by product name + store location + unit and sum quantities
    const grouped = {};
    allItems.forEach((item) => {
      const key = `${(item.productName || "").trim().toLowerCase()}||${(item.storeType || "Main Store")}||${(item.unitOfMeasurement || "")}`;
      if (!grouped[key]) {
        grouped[key] = {
          productName: item.productName || "",
          supplier: item.supplier || "-",
          branch: item.branch || "-",
          storeType: item.storeType || "-",
          unit: item.unitOfMeasurement || "",
          receivedQty: 0,
          availableQty: 0,
          consumedQty: 0,
          totalValue: 0,
          basePrice: item.basePrice || 0, // latest base price
        };
      }
      grouped[key].receivedQty += Number(item.quantity || 0);
      grouped[key].availableQty += Number(item.availableQuantity || 0);
      grouped[key].consumedQty += Number(item.consumedQuantity || 0);
      grouped[key].totalValue += Number(item.totalValue || 0);
      // Keep latest base price (from most recent GRN)
      if (item.basePrice) grouped[key].basePrice = item.basePrice;
      // Collect unique suppliers
      if (item.supplier && item.supplier !== "-" && !grouped[key].supplier.includes(item.supplier)) {
        grouped[key].supplier = item.supplier;
      }
    });

    const data = Object.values(grouped).map((item, idx) => ({
      "S.No": idx + 1,
      "Product": item.productName,
      "Store Location": item.storeType,
      "Unit": item.unit,
      "Total Received Qty": parseFloat(item.receivedQty.toFixed(2)),
      "Available Qty": parseFloat(item.availableQty.toFixed(2)),
      "Consumed Qty": parseFloat(item.consumedQty.toFixed(2)),
      "Base Price (₹)": item.basePrice,
      "Total Value (₹)": parseFloat(item.totalValue.toFixed(2)),
      "Supplier": item.supplier,
      "Branch": item.branch,
    }));

    // Sort by product name
    data.sort((a, b) => a["Product"].localeCompare(b["Product"]));
    // Re-number after sort
    data.forEach((row, idx) => { row["S.No"] = idx + 1; });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory.xlsx");
    toast.success("Inventory exported to Excel");
  };

  // Handle stock transfer between stores
  const handleTransferStock = async () => {
    if (!transferringItem || !transferData.toStore) {
      alert("Please select a destination store");
      return;
    }

    const available = transferringItem.availableQuantity || 0;
    const qty = transferData.transferType === "full" ? available : parseFloat(transferData.quantity);

    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (qty > available) {
      alert(`Cannot transfer more than available stock (${available} ${transferringItem.unitOfMeasurement || ""})`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${INV_HOTEL_API}/store-inventory/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: transferringItem.productName,
          fromStore: transferringItem.storeType || "Main Store",
          toStore: transferData.toStore,
          quantity: qty,
          notes: transferData.notes || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Stock transferred successfully");
        setShowTransferModal(false);
        setTransferringItem(null);
        setTransferData({ toStore: "", quantity: "", notes: "", transferType: "full" });
        await fetchSavedInventory();
      } else {
        alert(data.message || "Failed to transfer stock");
      }
    } catch (error) {
      console.error("Error transferring stock:", error);
      alert("Failed to transfer stock: " + (error.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk move — all items from one store to another
  const handleMoveAll = async () => {
    if (!moveAllFromStore || !moveAllToStore) {
      alert("Please select a destination store");
      return;
    }

    const items = filteredInventoryByStore[moveAllFromStore] || [];
    if (items.length === 0) {
      alert("No items to move");
      return;
    }

    if (!window.confirm(`Move ALL ${items.length} items from "${moveAllFromStore}" to "${moveAllToStore}"? This will transfer everything.`)) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      const available = item.availableQuantity || 0;
      if (available <= 0) continue;

      try {
        const response = await fetch(`${INV_HOTEL_API}/store-inventory/transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: item.productName,
            fromStore: moveAllFromStore,
            toStore: moveAllToStore,
            quantity: available,
            notes: "Bulk move — all items",
          }),
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to move ${item.productName}:`, data.message);
        }
      } catch (error) {
        failCount++;
        console.error(`Error moving ${item.productName}:`, error);
      }
    }

    setLoading(false);
    setShowMoveAllModal(false);
    setMoveAllToStore("");

    if (successCount > 0) {
      toast.success(`Moved ${successCount} items from "${moveAllFromStore}" to "${moveAllToStore}"`);
      await fetchSavedInventory();
    }
    if (failCount > 0) {
      toast.error(`${failCount} items failed to move`);
    }
  };

  // Edit functions
  const startEdit = (item) => {
    setEditingItem(item._id);
    setEditingData({ ...item });
  };

  const handleEditChange = (field, value) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    if (
      !editingData.quantity ||
      isNaN(editingData.quantity) ||
      editingData.quantity <= 0
    ) {
      alert("Please enter a valid quantity");
      return;
    }

    editingData.totalValue =
      (editingData.basePrice || 0) * editingData.quantity;
    editingData.availableQuantity =
      editingData.quantity - (editingData.consumedQuantity || 0);

    // Update local state
    setInventory(
      inventory.map((item) => (item._id === id ? editingData : item))
    );

    // Update backend
    try {
      const res = await fetch(
        `${INV_HOTEL_API}/grn/${editingData.grnId}`
      );
      if (!res.ok) throw new Error("Failed to fetch GRN");
      const result = await res.json();
      const grn = result.data;

      if (grn) {
        const grnItem = grn.items.find(
          (i) => i.product === editingData.productName
        ); // Assuming product is the identifier
        if (grnItem) {
          grnItem.quantity = editingData.quantity;
          grnItem.amount = editingData.totalValue;
          grnItem.rate = editingData.basePrice;
          grnItem.availableQuantity = editingData.availableQuantity;
          grnItem.consumedQuantity = editingData.consumedQuantity;

          const updateRes = await fetch(
            `${INV_HOTEL_API}/grn/${editingData.grnId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(grn),
            }
          );

          if (!updateRes.ok) throw new Error("Failed to update GRN");
          console.log("? GRN updated successfully");
        } else {
          alert("Item not found in GRN");
        }
      } else {
        alert("GRN not found");
      }
    } catch (err) {
      console.error("? Error updating GRN:", err);
      alert("Failed to update inventory in backend");
    }

    setEditingItem(null);
    setEditingData(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingData(null);
  };

  const removeFromInventory = async (id) => {
    // Find the inventory item to get its GRN ID
    const item = inventory.find((item) => item._id === id);

    if (!item) {
      alert("Item not found");
      return;
    }

    // Confirm deletion
    if (
      !window.confirm(
        `Are you sure you want to delete this inventory item?\n\nProduct: ${item.productName}\nGRN: ${item.grnNumber}\n\nThis will delete the GRN from the backend.`
      )
    ) {
      return;
    }

    // If it has a GRN ID, delete the GRN from backend
    if (item.grnId && item.grnId !== "-") {
      try {
        setLoading(true);
        // Use the same API base URL as other operations
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const apiBaseUrl = isDevelopment
          ? `${INV_HOTEL_API}`
          : `${INV_HOTEL_API}`;

        const response = await fetch(`${apiBaseUrl}/grn/${item.grnId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to delete GRN" }));
          throw new Error(errorData.message || "Failed to delete GRN");
        }

        // Remove from local state
        setInventory(inventory.filter((item) => item._id !== id));

        // Refresh inventory to get updated data
        await fetchSavedInventory();

        alert("Inventory item deleted successfully from backend!");
      } catch (error) {
        console.error("? Error deleting inventory item:", error);
        alert(`Failed to delete inventory item: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // If no GRN ID, just remove from local state (for items without GRN)
      setInventory(inventory.filter((item) => item._id !== id));
      alert("Inventory item removed locally (no GRN found to delete)");
    }
  };

  // Distribution function
  const handleDistribute = async () => {
    if (!distributingItem) return;

    // Validation
    if (
      !distributionData.recipientName ||
      !distributionData.quantityToDistribute ||
      !distributionData.purpose ||
      !distributionData.branch
    ) {
      alert("Please fill in all required fields (Recipient, Quantity, Purpose, Branch)");
      return;
    }

    const quantity = parseFloat(distributionData.quantityToDistribute);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const availableStock =
      distributingItem.availableQuantity || distributingItem.available || 0;

    // Check if distributing in a smaller unit — convert to base unit for validation
    const distUnit = distributionData.distributionUnit || distributingItem.unitOfMeasurement;
    let baseQuantity = quantity;
    const mat = rawMaterials.find(m => 
      m.name?.toLowerCase() === distributingItem.productName?.toLowerCase()
    );
    if (mat && mat.distributionUnit && mat.conversionFactor && distUnit === mat.distributionUnit) {
      baseQuantity = quantity / mat.conversionFactor;
    }

    if (baseQuantity > availableStock) {
      alert(`Cannot distribute more than available stock (${availableStock} ${distributingItem.unitOfMeasurement})`);
      return;
    }

    setLoading(true);
    try {
      // Calculate total value including tax
      const pricePerUnit = distributingItem.basePrice || 0;
      const taxRate = distributingItem.taxRate || 0;
      const subtotal = baseQuantity * pricePerUnit;
      const taxAmount = subtotal * (taxRate / 100);
      const totalValue = subtotal + taxAmount;

      const response = await fetch(`${INV_HOTEL_API}/inventory-distribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: distributingItem.productName,
          availableStock: availableStock,
          pricePerUnit: pricePerUnit,
          taxRate: taxRate,
          totalValue: totalValue,
          recipientName: distributionData.recipientName,
          contact: distributionData.contact || "",
          quantityDistributed: baseQuantity,
          distributionUnit: distUnit !== distributingItem.unitOfMeasurement ? distUnit : undefined,
          purpose: distributionData.purpose,
          branch: distributionData.branch,
          storeLocation: distributionData.storeLocation || distributingItem.storeType || "Main Store",
          distributedBy: "Current User",
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Distribution API error:", errorData);
        throw new Error(errorData.message || "Failed to create distribution");
      }

      alert("Distribution created successfully!");
      setShowDistributeModal(false);
      setDistributingItem(null);
      setDistributionData({
        recipientName: "",
        contact: "",
        quantityToDistribute: "",
        purpose: "",
        branch: "",
        storeLocation: "",
      });

      // Refresh inventory
      await fetchSavedInventory();
    } catch (error) {
      console.error("Error creating distribution:", error);
      alert(`Failed to create distribution: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manual entry functions
  const handleManualEntryChange = (field, value) => {
    setManualEntryData((prev) => ({ ...prev, [field]: value }));
  };

  const resetManualEntryForm = () => {
    setManualEntryData({
      productName: "",
      supplier: "",
      branch: "",
      storeType: "Main Store",
      category: "",
      quantity: "",
      basePrice: "",
      unitOfMeasurement: "",
    });
  };

  const saveManualEntry = async () => {
    if (
      !manualEntryData.productName ||
      !manualEntryData.quantity ||
      !manualEntryData.basePrice ||
      !manualEntryData.branch ||
      !manualEntryData.supplier
    ) {
      alert(
        "Please fill in all required fields: Product Name, Quantity, Base Price, Branch, and Supplier"
      );
      return;
    }

    const quantity = parseFloat(manualEntryData.quantity);
    const basePrice = parseFloat(manualEntryData.basePrice);

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(basePrice) || basePrice < 0) {
      alert("Please enter a valid base price");
      return;
    }

    setLoading(true);
    try {
      // Find branch - manualEntryData.branch should be the branch name
      const selectedBranch = branches.find(
        (b) =>
          b.name === manualEntryData.branch || b._id === manualEntryData.branch
      );
      const branchId = selectedBranch?._id || manualEntryData.branch;
      const branchName = selectedBranch?.name || manualEntryData.branch;

      if (
        !selectedBranch &&
        !branches.some((b) => b.name === manualEntryData.branch)
      ) {
        alert(
          `Branch "${manualEntryData.branch}" not found. Please select a valid branch.`
        );
        setLoading(false);
        return;
      }

      // Calculate totals
      const itemAmount = quantity * basePrice;
      const totalTax = 0; // No tax for manual entries (can be added later if needed)
      const totalAmount = itemAmount + totalTax;

      // Create a manual GRN entry
      // Store branch as NAME (not ID) to match inventory table format
      // For manual entries, do not include GRN number field

      const grnData = {
        isManualEntry: true, // Flag to indicate this is a manual entry (no GRN number needed)
        // grnNumber is not included for manual entries
        supplier: manualEntryData.supplier, // Required field
        branch: branchName, // Store as NAME to match inventory table format (same as other GRNs)
        branchId: branchId, // Also store ID for reference if needed
        branchName: branchName, // Use name for display and matching
        storeType: manualEntryData.storeType || "Main Store",
        items: [
          {
            product: manualEntryData.productName,
            quantity: quantity,
            quantityReceived: quantity,
            goodQuantity: quantity,
            damageQuantity: 0,
            consumedQuantity: 0,
            rate: basePrice,
            amount: itemAmount,
            category: manualEntryData.category || "Uncategorized",
            unit: manualEntryData.unitOfMeasurement || "kg",
            storeType: manualEntryData.storeType || "Main Store",
          },
        ],
        totalQuantity: quantity, // Required field
        totalTax: totalTax, // Required field (0 for manual entries)
        totalAmount: totalAmount, // Required field
        status: "Pending", // Valid enum values: 'Pending', 'Paid', 'Overdue'
        notes: "Manual inventory entry",
        createdAt: new Date().toISOString(),
      };

      // Retry mechanism for manual entries to handle any GRN number collisions
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (!success && retryCount < maxRetries) {
        try {
          // Use the same API base URL logic as other parts of the code
          const isDevelopment =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
          const apiBaseUrl = isDevelopment
            ? `${INV_HOTEL_API}`
            : `${INV_HOTEL_API}`;

          response = await fetch(`${apiBaseUrl}/grn/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(grnData),
          });

          if (response.ok) {
            success = true;
            break;
          } else {
            const errorData = await response
              .json()
              .catch(() => ({ message: "Failed to create manual entry" }));
            const errorMessage =
              errorData.message ||
              errorData.error ||
              "Failed to create manual entry";

            // If it's a GRN number collision and we haven't exhausted retries, try again
            if (
              (errorMessage.includes("GRN number already exists") ||
                errorMessage.includes("already exists")) &&
              retryCount < maxRetries - 1
            ) {
              retryCount++;
              console.warn(
                `?? GRN number collision detected (attempt ${retryCount}/${maxRetries}), retrying...`
              );
              // Small delay before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 100 * retryCount)
              );
              continue;
            } else {
              throw new Error(errorMessage);
            }
          }
        } catch (error) {
          if (
            retryCount < maxRetries - 1 &&
            error.message.includes("GRN number already exists")
          ) {
            retryCount++;
            console.warn(
              `?? Error on attempt ${retryCount}/${maxRetries}, retrying...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * retryCount)
            );
            continue;
          } else {
            throw error;
          }
        }
      }

      if (!success || !response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to create manual entry" }));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          "Failed to create manual entry after retries";
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("? Manual inventory entry created:", result);

      // Refresh inventory
      await fetchSavedInventory();

      // Reset form but keep modal open for multiple entries
      resetManualEntryForm();

      // Show success message - modal stays open for multiple entries
      alert(
        "? Entry added successfully! The form has been cleared. You can add another entry or click 'Close' when done."
      );

      // Ensure modal stays open (explicitly set to true)
      setShowAddModal(true);
    } catch (error) {
      console.error("? Error creating manual entry:", error);

      // Provide more helpful error messages
      let errorMessage = error.message;
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage =
          "Cannot connect to backend server. Please ensure:\n1. Backend server is running on https://crm.jagalikoota.com\n2. Check backend console for errors\n3. Restart the backend server if needed";
      } else if (error.message.includes("GRN number already exists")) {
        errorMessage =
          "GRN number collision detected. Please try again - the system will generate a new unique number.";
      }

      alert(`Failed to create manual entry: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCFC] to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              Hotel Inventory Management System
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={handleExportInventory}
                disabled={loading}
                className="bg-[#69231B] hover:bg-[#5c1e15] disabled:bg-[#69231B]/50 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Export to Excel</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Manual Entry</span>
              </button>
              <button
                onClick={fetchSavedInventory}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{loading ? "Refreshing..." : "Refresh Inventory"}</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by GRN, Supplier or Product or Branch..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
            />
          </div>

          {/* Filters Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Month
              </label>
              <Select
                value={filterMonth}
                onValueChange={(value) => setFilterMonth(value)}
              >
                <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {uniqueMonths.map((month) => {
                    const [year, m] = month.split('-');
                    const date = new Date(year, parseInt(m) - 1);
                    const label = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                    return (
                      <SelectItem key={month} value={month}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Branch
              </label>
              <Select
                value={filterBranch}
                onValueChange={(value) => setFilterBranch(value)}
              >
                <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {uniqueBranches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Store Location
              </label>
              <Select
                value={filterStoreLocation}
                onValueChange={(value) => setFilterStoreLocation(value)}
              >
                <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                  <SelectValue placeholder="All Store Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Store Locations</SelectItem>
                  {storeLocations.map((location) => (
                    <SelectItem key={location._id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Filter by Supplier
              </label>
              <Select
                value={filterSupplier}
                onValueChange={(value) => setFilterSupplier(value)}
              >
                <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filterMonth !== "all" ||
            filterBranch !== "all" ||
            filterStoreLocation !== "all" ||
            filterSupplier !== "all") && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setFilterMonth("all");
                  setFilterBranch("all");
                  setFilterStoreLocation("all");
                  setFilterSupplier("all");
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Complete Inventory Summary */}
        {Object.keys(filteredInventoryByStore).length > 0 && (
          <div className="bg-gradient-to-r from-[#69231B] via-[#7a2920] to-[#5c1e15] rounded-2xl shadow-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Complete Inventory Summary</h2>
                  <p className="text-sm text-white/70">Across all store locations</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{getTotalItems()}</div>
                  <div className="text-xs text-white/70">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{Object.keys(filteredInventoryByStore).length}</div>
                  <div className="text-xs text-white/70">Store Locations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{parseFloat(getTotalQuantity().toFixed(2))}</div>
                  <div className="text-xs text-white/70">Total Quantity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">₹{parseFloat(getTotalInventoryValue().toFixed(2)).toLocaleString()}</div>
                  <div className="text-xs text-white/70">Total Value</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.keys(filteredInventoryByStore).length > 0 && (
          <div className="space-y-8">
            {Object.entries(filteredInventoryByStore).map(
              ([storeType, items]) => {
                const totalValue = items.reduce(
                  (total, item) => total + (item.totalValue || 0),
                  0
                );
                const totalQuantity = items.reduce(
                  (total, item) => total + (item.quantity || 0),
                  0
                );
                const availableQuantity = items.reduce(
                  (total, item) => total + (item.availableQuantity || 0),
                  0
                );

                // Pagination logic
                const totalPages = Math.ceil(items.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedItems = items.slice(startIndex, endIndex);

                return (
                  <div
                    key={storeType}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#69231B] via-[#7a2920] to-[#5c1e15] px-8 py-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Package className="w-8 h-8" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                              {storeType} Inventory
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">
                              {items.length}{" "}
                              {items.length === 1 ? "item" : "items"} � Last
                              updated today
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <button
                            onClick={() => {
                              setMoveAllFromStore(storeType);
                              setMoveAllToStore("");
                              setShowMoveAllModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
                            title="Move all items to another store"
                          >
                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                            Move All
                          </button>
                          <div>
                            <div className="text-3xl font-bold mb-1">
                              ₹{parseFloat(totalValue.toFixed(2)).toLocaleString()}
                            </div>
                            <div className="text-blue-100 text-sm font-medium">
                              Total Value
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Total Items
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {items.length}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Available Stock
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {parseFloat(availableQuantity.toFixed(2))}
                              </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Total Quantity
                              </p>
                              <p className="text-2xl font-bold text-[#69231B]">
                                {parseFloat(totalQuantity.toFixed(2))}
                              </p>
                            </div>
                            <div className="p-3 bg-[#F5F0EF] rounded-full">
                              <TrendingUp className="w-6 h-6 text-[#69231B]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {items.length > 0 ? (
                        <>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    GRN Number
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Supplier
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Branch
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Received Qty
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Available Qty
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Consumed Qty
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Base Price
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total Value
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedItems.map((item, index) => (
                                  <tr
                                    key={item._id}
                                    className={`hover:bg-blue-50/50 transition-all duration-200 ${
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50/30"
                                    }`}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.grnNumber}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className="text-sm text-gray-900 max-w-32 truncate"
                                        title={item.supplier}
                                      >
                                        {item.supplier}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className="text-sm font-medium text-gray-900 max-w-32 truncate"
                                        title={item.productName}
                                      >
                                        {item.productName}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div
                                        className="text-sm text-gray-600 max-w-40 truncate"
                                        title={item.branch}
                                      >
                                        {item.branch}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      {editingItem === item._id ? (
                                        <input
                                          type="number"
                                          value={editingData.quantity}
                                          onChange={(e) =>
                                            handleEditChange(
                                              "quantity",
                                              e.target.value
                                            )
                                          }
                                          className="w-20 px-3 py-2 text-center border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                          min="1"
                                        />
                                      ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                          {item.quantity || 0} {item.unitOfMeasurement || ""}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                        {item.availableQuantity || 0} {item.unitOfMeasurement || ""}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                        {item.consumedQuantity || 0} {item.unitOfMeasurement || ""}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {editingItem === item._id ? (
                                        <input
                                          type="number"
                                          value={editingData.basePrice}
                                          onChange={(e) =>
                                            handleEditChange(
                                              "basePrice",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-2 text-center border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                          min="0"
                                          step="0.01"
                                        />
                                      ) : (
                                        <span className="text-sm font-semibold text-gray-900">
                                          ₹
                                          {(
                                            item.basePrice || 0
                                          ).toLocaleString()}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-bold text-[#69231B]">
                                        ₹
                                        {(
                                          item.totalValue || 0
                                        ).toLocaleString()}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-600">
                                        {item.date || "N/A"}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {editingItem === item._id ? (
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => saveEdit(item._id)}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                                            title="Save changes"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                            title="Cancel editing"
                                          >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => setViewProduct(item)}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                            title="View details"
                                          >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                          </button>
                                          <button
                                            onClick={() => {
                                              setDistributingItem(item);
                                              setDistributionData({
                                                recipientType: "",
                                                recipientName: "",
                                                contact: "",
                                                quantityToDistribute: "",
                                                purpose: "",
                                                branch: item.branch || "",
                                                location:
                                                  item.storeLocation || "",
                                              });
                                              setShowDistributeModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                            title="Distribute item"
                                          >
                                            <Send className="w-4 h-4 mr-1" />
                                            Distribute
                                          </button>
                                          <button
                                            onClick={() => {
                                              setTransferringItem(item);
                                              setTransferData({ toStore: "", quantity: "", notes: "", transferType: "full" });
                                              setShowTransferModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                            title="Move to another store"
                                          >
                                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                                            Move
                                          </button>
                                          <button
                                            onClick={() => startEdit(item)}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#7a2920] bg-[#FCFCFC] hover:bg-[#F5F0EF] rounded-lg transition-colors duration-200"
                                            title="Edit item"
                                          >
                                            <Edit3 className="w-4 h-4 mr-1" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              removeFromInventory(item._id)
                                            }
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                            title="Delete item"
                                          >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Controls */}
                          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-700">
                                Showing {(currentPage - 1) * itemsPerPage + 1}{" "}
                                to{" "}
                                {Math.min(
                                  currentPage * itemsPerPage,
                                  items.length
                                )}{" "}
                                of {items.length} items
                              </span>
                              <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-700">
                                  Items per page:
                                </label>
                                <Select
                                  value={itemsPerPage.toString()}
                                  onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1); // Reset to first page when changing items per page
                                  }}
                                >
                                  <SelectTrigger className="w-20 bg-white border border-gray-300 text-black rounded-md px-2 py-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="200">200</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Previous
                              </button>

                              <div className="flex items-center space-x-1">
                                {Array.from(
                                  { length: Math.min(5, totalPages) },
                                  (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                          currentPage === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  }
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  setCurrentPage(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No items found
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            There are currently no items in the {storeType}{" "}
                            inventory.
                          </p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Manual Entry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Overall Summary and Modal */}
        <div className="modals-container">

          {viewProduct && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {typeof viewProduct === "object"
                        ? viewProduct.productName
                        : viewProduct}
                    </h3>
                    {typeof viewProduct === "object" && (
                      <p className="text-sm text-gray-600 mt-1">
                        Branch: {viewProduct.branch} | Store:{" "}
                        {viewProduct.storeType || "Main Store"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setViewProduct(null)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Transaction History Section */}
                {typeof viewProduct === "object" &&
                  viewProduct.transactionHistory &&
                  viewProduct.transactionHistory.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        Transaction History
                      </h4>
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Received Qty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Damage Qty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Good Qty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Consumed Qty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                GRN/Recipe
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Supplier
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                GST
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Rate
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {viewProduct.transactionHistory.map(
                              (trans, idx) => (
                                <tr
                                  key={idx}
                                  className={
                                    trans.type === "Received"
                                      ? "bg-green-50"
                                      : "bg-red-50"
                                  }
                                >
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.date}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        trans.type === "Received"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {trans.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.receivedQty || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.damageQty || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                    {trans.type === "Received"
                                      ? trans.quantity || "-"
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-red-600">
                                    {trans.type === "Consumed"
                                      ? Math.abs(trans.quantity || 0)
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.grnNumber || trans.recipeName || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.supplier || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.supplierGST || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.rate
                                      ? `?${Number(
                                          trans.rate
                                        ).toLocaleString()}`
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {trans.amount
                                      ? `?${Number(
                                          trans.amount
                                        ).toLocaleString()}`
                                      : "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Supplier Details Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Supplier Details
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            GRN
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Supplier
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            GST
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Rate
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(
                          supplierMap[
                            typeof viewProduct === "object"
                              ? viewProduct.productName
                              : viewProduct
                          ] || []
                        ).map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.grnNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.supplier}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.supplierGST || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹{Number(row.rate || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₹{Number(row.amount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.date}
                            </td>
                          </tr>
                        ))}
                        {(!supplierMap[
                          typeof viewProduct === "object"
                            ? viewProduct.productName
                            : viewProduct
                        ] ||
                          supplierMap[
                            typeof viewProduct === "object"
                              ? viewProduct.productName
                              : viewProduct
                          ].length === 0) && (
                          <tr>
                            <td
                              colSpan="7"
                              className="px-4 py-6 text-center text-gray-500"
                            >
                              No supplier records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setViewProduct(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Move All Modal */}
        {showMoveAllModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Move All Items
                </h2>
                <button
                  onClick={() => setShowMoveAllModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">
                    Moving all items from:
                  </p>
                  <p className="text-lg font-bold text-purple-900">{moveAllFromStore}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    {(filteredInventoryByStore[moveAllFromStore] || []).length} items will be transferred
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move To <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={moveAllToStore}
                    onChange={(e) => setMoveAllToStore(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Select destination store</option>
                    {storeLocations
                      .filter((loc) => loc.name !== moveAllFromStore)
                      .map((loc) => (
                        <option key={loc._id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowMoveAllModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMoveAll}
                    disabled={loading || !moveAllToStore}
                    className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {loading ? "Moving..." : "Move All Items"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer (Move) Modal */}
        {showTransferModal && transferringItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Move Stock to Another Store
                </h2>
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setTransferringItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="text-lg font-semibold">{transferringItem.productName}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>From: <strong>{transferringItem.storeType || "Main Store"}</strong></span>
                    <span>Available: <strong>{transferringItem.availableQuantity || 0} {transferringItem.unitOfMeasurement || ""}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Store <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={transferData.toStore}
                    onChange={(e) => setTransferData({ ...transferData, toStore: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Select store location</option>
                    {storeLocations
                      .filter((loc) => loc.name !== (transferringItem.storeType || "Main Store"))
                      .map((loc) => (
                        <option key={loc._id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Transfer type radio buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                      style={{ borderColor: transferData.transferType === "full" ? "#7c3aed" : "#e5e7eb" }}
                    >
                      <input
                        type="radio"
                        name="transferType"
                        value="full"
                        checked={transferData.transferType === "full"}
                        onChange={() => setTransferData({ ...transferData, transferType: "full", quantity: "" })}
                        className="accent-purple-600 w-4 h-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Send</p>
                        <p className="text-xs text-gray-500">Move all {transferringItem.availableQuantity || 0} {transferringItem.unitOfMeasurement || ""} to destination</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                      style={{ borderColor: transferData.transferType === "partial" ? "#7c3aed" : "#e5e7eb" }}
                    >
                      <input
                        type="radio"
                        name="transferType"
                        value="partial"
                        checked={transferData.transferType === "partial"}
                        onChange={() => setTransferData({ ...transferData, transferType: "partial" })}
                        className="accent-purple-600 w-4 h-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Partial Move</p>
                        <p className="text-xs text-gray-500">Specify how much to move</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Quantity input — only shown for partial */}
                {transferData.transferType === "partial" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Move <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={transferData.quantity}
                      onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                      placeholder={`Max: ${transferringItem.availableQuantity || 0}`}
                      min="0.01"
                      max={transferringItem.availableQuantity || 0}
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={transferData.notes}
                    onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                    placeholder="Reason for transfer"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferringItem(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransferStock}
                    disabled={loading || !transferData.toStore || (transferData.transferType === "partial" && !transferData.quantity)}
                    className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {loading ? "Moving..." : "Move Stock"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Manual Inventory Entry
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetManualEntryForm();
                  }}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  {rawMaterials.length === 0 ? (
                    <input
                      type="text"
                      value={manualEntryData.productName}
                      onChange={(e) =>
                        handleManualEntryChange("productName", e.target.value)
                      }
                      placeholder="Enter product name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <Select
                      value={manualEntryData.productName}
                      onValueChange={(value) => {
                        // Find the selected material to get its unit
                        const selectedMaterial = rawMaterials.find(
                          (m) => m.name === value
                        );
                        console.log("Selected product:", value);
                        console.log("Found material:", selectedMaterial);

                        handleManualEntryChange("productName", value);

                        // Auto-update unit based on selected product from raw material
                        if (selectedMaterial && selectedMaterial.unit) {
                          console.log(
                            "Auto-setting unit to:",
                            selectedMaterial.unit
                          );
                          handleManualEntryChange(
                            "unitOfMeasurement",
                            selectedMaterial.unit
                          );
                        } else {
                          console.warn(
                            "No unit found for material:",
                            selectedMaterial
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                        <SelectValue placeholder="Select raw material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material._id} value={material.name}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  {branches.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                      Loading branches...{" "}
                      {branches.length === 0 && "(No branches found)"}
                    </div>
                  ) : (
                    <Select
                      value={manualEntryData.branch}
                      onValueChange={(value) => {
                        // Store branch name, not ID, to match inventory system
                        const selectedBranch = branches.find(
                          (b) => b._id === value || b.name === value
                        );
                        console.log("Selected branch:", selectedBranch);
                        handleManualEntryChange(
                          "branch",
                          selectedBranch?.name || value
                        );
                        // Clear category when branch changes (category is branch-specific)
                        handleManualEntryChange("category", "");
                      }}
                    >
                      <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={manualEntryData.quantity}
                      onChange={(e) =>
                        handleManualEntryChange("quantity", e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Unit of Measurement - Auto-filled from selected product (read-only) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={manualEntryData.unitOfMeasurement || ""}
                      readOnly
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder={
                        manualEntryData.productName
                          ? "Select product to see unit"
                          : "Select product first"
                      }
                    />
                    {!manualEntryData.unitOfMeasurement &&
                      manualEntryData.productName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Unit will appear automatically from raw material
                        </p>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Base Price */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Base Price (?) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={manualEntryData.basePrice}
                      onChange={(e) =>
                        handleManualEntryChange("basePrice", e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Total Value (calculated) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Total Value (?)
                    </label>
                    <input
                      type="text"
                      value={
                        manualEntryData.quantity && manualEntryData.basePrice
                          ? (
                              parseFloat(manualEntryData.quantity) *
                              parseFloat(manualEntryData.basePrice)
                            ).toFixed(2)
                          : "0.00"
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  {suppliers.length === 0 ? (
                    <div className="text-sm text-gray-500 py-2">
                      Loading suppliers...{" "}
                      {suppliers.length === 0 && "(No suppliers found)"}
                    </div>
                  ) : (
                    <Select
                      value={manualEntryData.supplier || undefined}
                      onValueChange={(value) => {
                        handleManualEntryChange("supplier", value);
                      }}
                    >
                      <SelectTrigger className="w-full bg-gray-100 border border-gray-300 text-black rounded-md px-3 py-2">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => {
                          const supplierName =
                            supplier.name || supplier.companyName || "Unknown";
                          return (
                            <SelectItem key={supplier._id} value={supplierName}>
                              {supplierName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetManualEntryForm();
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={saveManualEntry}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? "Saving..." : "Save & Add Another"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Modal */}
        {showDistributeModal && distributingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Distribute {distributingItem.productName}
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Available Stock:{" "}
                    {distributingItem.availableQuantity ||
                      distributingItem.available ||
                      0}{" "}
                    {distributingItem.unitOfMeasurement}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDistributeModal(false);
                    setDistributingItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Recipient Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={distributionData.recipientName}
                    onChange={(e) =>
                      setDistributionData({
                        ...distributionData,
                        recipientName: e.target.value,
                      })
                    }
                    placeholder="Enter recipient name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={distributionData.contact}
                    onChange={(e) =>
                      setDistributionData({
                        ...distributionData,
                        contact: e.target.value,
                      })
                    }
                    placeholder="Enter contact number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quantity to Distribute */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Quantity to Distribute{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={distributionData.quantityToDistribute}
                      onChange={(e) =>
                        setDistributionData({
                          ...distributionData,
                          quantityToDistribute: e.target.value,
                        })
                      }
                      placeholder="Enter quantity"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <select
                      value={distributionData.distributionUnit || distributingItem.unitOfMeasurement || ""}
                      onChange={(e) =>
                        setDistributionData({
                          ...distributionData,
                          distributionUnit: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium"
                    >
                      <option value={distributingItem.unitOfMeasurement || "unit"}>
                        {distributingItem.unitOfMeasurement || "unit"}
                      </option>
                      {(() => {
                        // Find the raw material to check if it has a distribution unit
                        const mat = rawMaterials.find(m => 
                          m.name?.toLowerCase() === distributingItem.productName?.toLowerCase()
                        );
                        if (mat && mat.distributionUnit && mat.conversionFactor && mat.distributionUnit !== mat.unit) {
                          return (
                            <option value={mat.distributionUnit}>
                              {mat.distributionUnit} (1 {mat.unit} = {mat.conversionFactor} {mat.distributionUnit})
                            </option>
                          );
                        }
                        return null;
                      })()}
                    </select>
                  </div>
                  {distributionData.distributionUnit && 
                   distributionData.distributionUnit !== distributingItem.unitOfMeasurement &&
                   distributionData.quantityToDistribute && (
                    <p className="text-xs text-blue-600 mt-1">
                      {(() => {
                        const mat = rawMaterials.find(m => 
                          m.name?.toLowerCase() === distributingItem.productName?.toLowerCase()
                        );
                        if (mat && mat.conversionFactor) {
                          const baseQty = parseFloat(distributionData.quantityToDistribute) / mat.conversionFactor;
                          return `= ${baseQty.toFixed(3)} ${mat.unit} will be deducted from inventory`;
                        }
                        return "";
                      })()}
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div className="col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={distributionData.purpose}
                    onChange={(e) =>
                      setDistributionData({
                        ...distributionData,
                        purpose: e.target.value,
                      })
                    }
                    placeholder="Enter purpose of distribution"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={distributionData.branch}
                    onChange={(e) =>
                      setDistributionData({
                        ...distributionData,
                        branch: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Store Location */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Store Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={distributionData.storeLocation}
                    onChange={(e) =>
                      setDistributionData({
                        ...distributionData,
                        storeLocation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select store location</option>
                    {storeLocations.map((location) => (
                      <option key={location._id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDistributeModal(false);
                    setDistributingItem(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Distributing..." : "Distribute"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default HotelInventorySystem