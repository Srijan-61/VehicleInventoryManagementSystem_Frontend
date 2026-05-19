import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Package, AlertTriangle, XCircle, DollarSign,
  Plus, Pencil, Trash2, Search, X, ShoppingCart, RefreshCw,
} from 'lucide-react';
import {
  getAllParts,
  purchaseParts,
  updatePart,
  deletePart,
  getVendors,
} from '../../api/adminPartsApi';

// ─── Shared Tailwind class strings ────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm ' +
  'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

// ─── Modal overlay wrapper ─────────────────────────────────────────────────────
// wide=true uses max-w-2xl (purchase form), default is max-w-md (edit / delete)
const ModalOverlay = ({ onClose, children, wide = false }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-xl shadow-2xl w-full ${
        wide ? 'max-w-2xl' : 'max-w-md'
      } max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()} // prevent click-outside from leaking
    >
      {children}
    </div>
  </div>
);

// ─── Stock status logic ────────────────────────────────────────────────────────
const getStockStatus = (part) => {
  if (part.stock_Quantity === 0) return 'out-of-stock';
  if (part.stock_Quantity <= part.minimum_Stock_Level) return 'low-stock';
  return 'in-stock';
};

// Colored badge based on stock status
const StockBadge = ({ part }) => {
  const s = getStockStatus(part);
  const map = {
    'out-of-stock': ['bg-red-100 text-red-700', 'Out of Stock'],
    'low-stock':    ['bg-yellow-100 text-yellow-700', 'Low Stock'],
    'in-stock':     ['bg-green-100 text-green-700', 'In Stock'],
  };
  const [cls, label] = map[s];
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {label}
    </span>
  );
};

// ─── Summary stat card ─────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, iconBg, label, value, sub }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
    <div className={`p-3 rounded-lg ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Default form values ───────────────────────────────────────────────────────
const INIT_PURCHASE = {
  vendor_ID:          '',
  payment_Status:     'Paid',
  // item-level fields
  part_ID:            '',   // used when purchasing an existing part
  part_Name:          '',   // used when creating a new part
  brand:              '',
  part_Category:      '',
  selling_Price:      '',
  quantity_Purchased: '',
  purchase_Unit_Cost: '',
};

const INIT_EDIT = {
  part_Name:          '',
  brand:              '',
  part_Category:      '',
  unit_Price:         '',
  stock_Quantity:     '',
  minimum_Stock_Level:'',
};

// ─── Client-side validators ──────────────────────────────────────────────────────
// Each function returns an error string describing the first problem found,
// or null if every field is valid. Running these before the API call avoids
// sending bad data across the network.

const validatePurchase = (form, isNewPart) => {
  if (!form.vendor_ID)             return 'Please select a vendor.';
  if (!isNewPart && !form.part_ID) return 'Please select a part to restock.';
  if (isNewPart) {
    if (!form.part_Name.trim())     return 'Part name is required.';
    if (!form.brand.trim())         return 'Brand is required.';
    if (!form.part_Category.trim()) return 'Category is required.';
    if (Number(form.selling_Price) <= 0) return 'Selling price must be greater than 0.';
  }
  if (Number(form.quantity_Purchased) < 1)  return 'Quantity must be at least 1.';
  if (Number(form.purchase_Unit_Cost) <= 0) return 'Purchase unit cost must be greater than 0.';
  return null;
};

const validateEdit = (form) => {
  if (!form.part_Name.trim())     return 'Part name is required.';
  if (!form.brand.trim())         return 'Brand is required.';
  if (!form.part_Category.trim()) return 'Category is required.';
  if (Number(form.unit_Price) < 0)          return 'Unit price cannot be negative.';
  if (Number(form.stock_Quantity) < 0)      return 'Stock quantity cannot be negative.';
  if (Number(form.minimum_Stock_Level) < 0) return 'Reorder level cannot be negative.';
  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminPartsManagement = () => {

  // ── Data ──────────────────────────────────────────────────────────────────────
  const [parts,   setParts]   = useState([]);   // full list of parts fetched from the backend
  const [vendors, setVendors] = useState([]);   // vendor list shown in the purchase form dropdown
  const [loading, setLoading] = useState(true); // true while the initial page load is happening

  // ── Search & filter ───────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');    // text typed in the search box
  const [categoryFilter, setCategoryFilter] = useState('');    // selected category (empty string = show all)
  const [stockFilter,    setStockFilter]    = useState('all'); // selected stock status filter

  // ── Modal visibility ──────────────────────────────────────────────────────────
  const [showPurchase, setShowPurchase] = useState(false); // controls whether the purchase modal is open
  const [showEdit,     setShowEdit]     = useState(false); // controls whether the edit modal is open
  const [showDelete,   setShowDelete]   = useState(false); // controls whether the delete confirm modal is open

  // ── Form data ─────────────────────────────────────────────────────────────────
  const [purchaseForm,   setPurchaseForm]   = useState(INIT_PURCHASE); // all input values inside the purchase form
  const [isNewPart,      setIsNewPart]      = useState(false); // true = entering a brand-new part, false = restocking an existing part
  const [editForm,       setEditForm]       = useState(INIT_EDIT);    // all input values inside the edit form
  const [editingPartId,  setEditingPartId]  = useState(null); // ID of the part currently being edited
  const [deletingPart,   setDeletingPart]   = useState(null); // the full part object chosen for deletion (displayed in the confirm modal)

  // ── Async loading flags (prevent double-clicks and show loading text on buttons) ─
  const [purchasing, setPurchasing] = useState(false); // true while the purchase API call is running
  const [editing,    setEditing]    = useState(false); // true while the edit API call is running
  const [deleting,   setDeleting]   = useState(false); // true while the delete API call is running

  // ── Load parts + vendors on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  // Fetch parts and vendors at the same time to reduce wait time on first load
  const loadAll = async () => {
    setLoading(true);
    try {
      // Promise.all fires both requests simultaneously instead of one after the other
      const [partsData, vendorsData] = await Promise.all([
        getAllParts(),
        getVendors(),
      ]);
      setParts(partsData);
      setVendors(vendorsData);
    } catch (err) {
      toast.error(err.message || 'Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh only the parts table (called after every mutation)
  const reloadParts = async () => {
    try {
      const data = await getAllParts();
      setParts(data);
    } catch (err) {
      toast.error(err.message || 'Failed to refresh parts list.');
    }
  };

  // ── Derived / memoized values ─────────────────────────────────────────────────

  // Summary stats computed from the parts array.
  // useMemo caches the result so it only recalculates when the parts list changes.
  const summary = useMemo(() => ({
    total:      parts.length, // total number of unique part types
    // Low stock: still has some quantity, but at or below the reorder warning level
    lowStock:   parts.filter(p => p.stock_Quantity > 0 && p.stock_Quantity <= p.minimum_Stock_Level).length,
    // Out of stock: quantity has dropped to exactly zero
    outOfStock: parts.filter(p => p.stock_Quantity === 0).length,
    // Inventory value: selling price × current stock quantity, summed for every part
    totalValue: parts.reduce((sum, p) => sum + (p.unit_Price * p.stock_Quantity), 0),
  }), [parts]);

  // Build a sorted list of unique category names from the parts data.
  // This populates the "Filter by category" dropdown automatically — no hardcoding needed.
  const categories = useMemo(
    () => [...new Set(parts.map(p => p.part_Category).filter(Boolean))].sort(),
    [parts]
  );

  // Apply all three active filters at once: search text, category, and stock status.
  // Only re-runs when the parts list or any filter value changes.
  const filteredParts = useMemo(() => {
    const q = searchQuery.toLowerCase(); // convert once so every row comparison is consistent
    return parts.filter(p => {
      // True if the part name or brand contains the search text (case-insensitive)
      const matchesSearch   = !q || p.part_Name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
      // True if no category is selected, or the part belongs to the selected category
      const matchesCategory = !categoryFilter || p.part_Category === categoryFilter;
      // Calculate this part's stock status to compare with the stock filter
      const status          = getStockStatus(p);
      // True if the stock status matches the chosen filter option
      const matchesStock    =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock'     && status === 'in-stock') ||
        (stockFilter === 'low-stock'    && status === 'low-stock') ||
        (stockFilter === 'out-of-stock' && status === 'out-of-stock');
      // The part appears in the table only if it passes all three checks
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [parts, searchQuery, categoryFilter, stockFilter]);

  // ── Purchase modal handlers ───────────────────────────────────────────────────
  // Reset the purchase form to blank values and open the modal in "Existing Part" mode by default
  const openPurchaseModal = () => {
    setPurchaseForm(INIT_PURCHASE); // clear any data left over from the last time the modal was open
    setIsNewPart(false);            // default to restocking an existing part
    setShowPurchase(true);
  };

  // Generic change handler for every input field in the purchase form.
  // Spreads the previous state and only overwrites the field that just changed.
  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({ ...prev, [name]: value }));
  };

  // Called when the admin submits the purchase form.
  // Builds the correct payload depending on whether it is a new or existing part.
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    // Validate locally before locking the button or making a network request
    const validationError = validatePurchase(purchaseForm, isNewPart);
    if (validationError) { toast.error(validationError); return; }

    setPurchasing(true);
    try {
      // ── Payload ────────────────────────────────────────────────────────────
      // Admin_ID is intentionally NOT sent — the backend extracts it from the
      // JWT token automatically. purchase_Date and notes are also not required.
      //
      // Backend behaviour:
      //   - part_ID = null   → creates a new part record, then adds stock
      //   - part_ID = number → finds existing part and increases stock_Quantity
      const payload = {
        vendor_ID:      Number(purchaseForm.vendor_ID),
        payment_Status: purchaseForm.payment_Status,
        items: [
          isNewPart
            ? {
                part_ID:            null,
                part_Name:          purchaseForm.part_Name,
                brand:              purchaseForm.brand,
                part_Category:      purchaseForm.part_Category,
                selling_Price:      Number(purchaseForm.selling_Price),
                quantity_Purchased: Number(purchaseForm.quantity_Purchased),
                purchase_Unit_Cost: Number(purchaseForm.purchase_Unit_Cost),
              }
            : {
                part_ID:            Number(purchaseForm.part_ID),
                quantity_Purchased: Number(purchaseForm.quantity_Purchased),
                purchase_Unit_Cost: Number(purchaseForm.purchase_Unit_Cost),
              },
        ],
      };

      const result = await purchaseParts(payload);

      // The backend returns { success: true/false, message: "..." }.
      // When success is false the HTTP status may still be 200, so we check
      // the flag explicitly to decide whether to show success or error.
      if (result && result.success === false) {
        toast.error(result.message || 'Purchase failed. Please try again.');
        return; // keep modal open so the admin can correct the issue
      }

      toast.success(result?.message || 'Part purchased successfully! Stock has been updated.');
      setShowPurchase(false);
      setPurchaseForm(INIT_PURCHASE); // clear the form for next time
      reloadParts();                 // refresh table to reflect new stock
    } catch (err) {
      // Network or server error — show the most specific message available
      toast.error(err.message || 'Failed to purchase part. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // ── Edit modal handlers ───────────────────────────────────────────────────────
  // Pre-fill the edit form with the selected part's current values and open the modal.
  // Using ?? '' ensures no field is ever undefined (undefined would break controlled inputs).
  const openEditModal = (part) => {
    setEditingPartId(part.part_ID); // remember which part we are saving changes to
    setEditForm({
      part_Name:           part.part_Name          ?? '',
      brand:               part.brand               ?? '',
      part_Category:       part.part_Category       ?? '',
      unit_Price:          part.unit_Price           ?? '',
      stock_Quantity:      part.stock_Quantity       ?? '',
      minimum_Stock_Level: part.minimum_Stock_Level  ?? '',
    });
    setShowEdit(true);
  };

  // Generic change handler for every input field in the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Called when the admin submits the edit form. Sends the updated fields to the backend.
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate locally before locking the button or making a network request
    const validationError = validateEdit(editForm);
    if (validationError) { toast.error(validationError); return; }

    setEditing(true);
    try {
      // Adjust payload fields to match your backend PUT /api/admin/parts/{partId} contract
      const payload = {
        part_Name:           editForm.part_Name,
        brand:               editForm.brand,
        part_Category:       editForm.part_Category,
        unit_Price:          Number(editForm.unit_Price),
        stock_Quantity:      Number(editForm.stock_Quantity),
        minimum_Stock_Level: Number(editForm.minimum_Stock_Level),
      };
      await updatePart(editingPartId, payload);
      toast.success('Part updated successfully!');
      setShowEdit(false);
      reloadParts();
    } catch (err) {
      toast.error(err.message || 'Failed to update part.');
    } finally {
      setEditing(false);
    }
  };

  // ── Delete modal handlers ─────────────────────────────────────────────────────
  // Store the full part object so the confirm modal can display its name and details
  const openDeleteModal = (part) => {
    setDeletingPart(part);
    setShowDelete(true);
  };

  // Called when the admin clicks "Yes, Delete" inside the confirm modal.
  // Sends the DELETE request and removes the part from the table on success.
  const handleDelete = async () => {
    if (!deletingPart) return; // safety check — should never be null here
    setDeleting(true);
    try {
      await deletePart(deletingPart.part_ID);
      toast.success(`"${deletingPart.part_Name}" deleted successfully.`);
      setShowDelete(false);
      setDeletingPart(null);
      reloadParts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete part.');
    } finally {
      setDeleting(false);
    }
  };

  // Format currency in Nepali Rupees
  const fmt = (v) => `Rs. ${Number(v).toLocaleString('en-IN')}`;

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 animate-pulse">Loading parts inventory…</p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parts Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage vehicle parts inventory — purchase, edit, and delete parts.
          </p>
        </div>
        <button
          onClick={openPurchaseModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg
                     font-semibold text-sm hover:bg-blue-700 active:bg-blue-800
                     transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Purchase Part
        </button>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={Package}
          iconBg="bg-blue-50 text-blue-600"
          label="Total Parts"
          value={summary.total}
          sub="unique part types"
        />
        <SummaryCard
          icon={AlertTriangle}
          iconBg="bg-yellow-50 text-yellow-600"
          label="Low Stock Parts"
          value={summary.lowStock}
          sub="at or below reorder level"
        />
        <SummaryCard
          icon={XCircle}
          iconBg="bg-red-50 text-red-600"
          label="Out of Stock"
          value={summary.outOfStock}
          sub="zero quantity"
        />
        <SummaryCard
          icon={DollarSign}
          iconBg="bg-green-50 text-green-600"
          label="Inventory Value"
          value={fmt(summary.totalValue)}
          sub="unit price × stock"
        />
      </div>

      {/* ── Search + filter bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search by name or brand */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part name or brand…"
              className={`${inputCls} pl-9`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter by category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${inputCls} sm:w-44`}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Filter by stock status */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className={`${inputCls} sm:w-44`}
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ── Parts table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Parts Inventory
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({filteredParts.length} of {parts.length})
            </span>
          </h2>
          <button
            onClick={reloadParts}
            title="Refresh parts list"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {filteredParts.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No parts match your current search or filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Part Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock Qty</th>
                  <th className="px-4 py-3 text-center font-semibold">Reorder Level</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParts.map(part => (
                  <tr key={part.part_ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{part.part_ID}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{part.part_Name}</td>
                    <td className="px-4 py-3 text-gray-600">{part.brand}</td>
                    <td className="px-4 py-3 text-gray-600">{part.part_Category}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(part.unit_Price)}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800">{part.stock_Quantity}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{part.minimum_Stock_Level}</td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge part={part} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(part)}
                          title="Edit part"
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => openDeleteModal(part)}
                          title="Delete part"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PURCHASE PART MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showPurchase && (
        <ModalOverlay onClose={() => setShowPurchase(false)} wide>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Purchase Part</h3>
            </div>
            <button
              onClick={() => setShowPurchase(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable form body */}
          <form onSubmit={handlePurchaseSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">

              {/* Vendor + payment status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Vendor <span className="text-red-500">*</span></label>
                  <select
                    name="vendor_ID"
                    value={purchaseForm.vendor_ID}
                    onChange={handlePurchaseChange}
                    required
                    className={inputCls}
                  >
                    <option value="">— Select vendor —</option>
                    {vendors.map(v => (
                      <option key={v.vendor_ID} value={v.vendor_ID}>{v.vendor_Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Payment Status</label>
                  <select
                    name="payment_Status"
                    value={purchaseForm.payment_Status}
                    onChange={handlePurchaseChange}
                    className={inputCls}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              {/* Toggle: existing part vs new part */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Part type:</span>
                <button
                  type="button"
                  onClick={() => setIsNewPart(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    !isNewPart
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Existing Part
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPart(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isNewPart
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  New Part
                </button>
              </div>

              {/* Existing part — select from dropdown */}
              {!isNewPart && (
                <div>
                  <label className={labelCls}>Select Part <span className="text-red-500">*</span></label>
                  <select
                    name="part_ID"
                    value={purchaseForm.part_ID}
                    onChange={handlePurchaseChange}
                    required
                    className={inputCls}
                  >
                    <option value="">— Select a part —</option>
                    {parts.map(p => (
                      <option key={p.part_ID} value={p.part_ID}>
                        {p.part_Name} — {p.brand}  (Stock: {p.stock_Quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* New part — extra detail fields */}
              {isNewPart && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Part Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="part_Name"
                      value={purchaseForm.part_Name}
                      onChange={handlePurchaseChange}
                      required
                      placeholder="e.g. Brake Pad"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Brand <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="brand"
                      value={purchaseForm.brand}
                      onChange={handlePurchaseChange}
                      required
                      placeholder="e.g. Bosch"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="part_Category"
                      value={purchaseForm.part_Category}
                      onChange={handlePurchaseChange}
                      required
                      placeholder="e.g. Brakes"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Selling Price (Rs.) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      name="selling_Price"
                      value={purchaseForm.selling_Price}
                      onChange={handlePurchaseChange}
                      required
                      placeholder="0"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Quantity + unit cost — always visible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Quantity Purchased <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    name="quantity_Purchased"
                    value={purchaseForm.quantity_Purchased}
                    onChange={handlePurchaseChange}
                    required
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Purchase Unit Cost (Rs.) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    name="purchase_Unit_Cost"
                    value={purchaseForm.purchase_Unit_Cost}
                    onChange={handlePurchaseChange}
                    required
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowPurchase(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={purchasing}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
                           bg-blue-600 rounded-lg hover:bg-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                {purchasing ? 'Purchasing…' : 'Confirm Purchase'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT PART MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showEdit && (
        <ModalOverlay onClose={() => setShowEdit(false)}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Edit Part</h3>
            </div>
            <button
              onClick={() => setShowEdit(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Part Name <span className="text-red-500">*</span></label>
                  <input type="text" name="part_Name" value={editForm.part_Name}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Brand <span className="text-red-500">*</span></label>
                  <input type="text" name="brand" value={editForm.brand}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                  <input type="text" name="part_Category" value={editForm.part_Category}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Unit Price (Rs.) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" name="unit_Price" value={editForm.unit_Price}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stock Quantity <span className="text-red-500">*</span></label>
                  <input type="number" min="0" name="stock_Quantity" value={editForm.stock_Quantity}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Reorder Level <span className="text-red-500">*</span></label>
                  <input type="number" min="0" name="minimum_Stock_Level" value={editForm.minimum_Stock_Level}
                    onChange={handleEditChange} required className={inputCls} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editing}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editing ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showDelete && deletingPart && (
        <ModalOverlay onClose={() => setShowDelete(false)}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Part</h3>
            </div>
            <button
              onClick={() => setShowDelete(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Warning block */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Are you sure you want to delete this part?
                </p>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently remove{' '}
                  <span className="font-bold">{deletingPart.part_Name}</span>
                  {' '}({deletingPart.brand}) from the inventory.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Part summary */}
            <div className="text-sm text-gray-600 space-y-1 pl-1">
              <p><span className="font-medium">Part ID:</span> #{deletingPart.part_ID}</p>
              <p><span className="font-medium">Category:</span> {deletingPart.part_Category}</p>
              <p><span className="font-medium">Current Stock:</span> {deletingPart.stock_Quantity} units</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              onClick={() => setShowDelete(false)}
              disabled={deleting}
              className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg
                         hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white
                         bg-red-600 rounded-lg hover:bg-red-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
};

export default AdminPartsManagement;
