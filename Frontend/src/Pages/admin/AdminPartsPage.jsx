import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Edit2, Trash2, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllParts, purchaseParts, updatePart, deletePart } from '../../api/adminPartsApi';
import LoadingButton from '../../components/LoadingButton';

const emptyEditForm = {
  part_Name: '', part_Category: '', brand: '',
  stock_Quantity: '', minimum_Stock_Level: '', unit_Price: '', purchase_Price: '',
};
const emptyItem = { part_ID: '', quantity_Purchased: '', purchase_Unit_Cost: '' };
const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-md bg-bgcolor focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

const AdminPartsPage = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPart, setEditingPart] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingPart, setDeletingPart] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ vendor_ID: '', admin_ID: '', payment_Status: 'Paid', items: [{ ...emptyItem }] });
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => { fetchParts(); }, []);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const data = await getAllParts();
      setParts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load parts.');
    } finally {
      setLoading(false);
    }
  };

  const filteredParts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return parts;
    return parts.filter(p =>
      p.part_Name?.toLowerCase().includes(q) ||
      p.part_Category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    );
  }, [parts, searchTerm]);

  const openEdit = (part) => {
    setEditingPart(part);
    setEditForm({
      part_Name: part.part_Name || '', part_Category: part.part_Category || '',
      brand: part.brand || '', stock_Quantity: part.stock_Quantity ?? '',
      minimum_Stock_Level: part.minimum_Stock_Level ?? '', unit_Price: part.unit_Price ?? '',
      purchase_Price: part.purchase_Price ?? '',
    });
  };
  const closeEdit = () => { setEditingPart(null); setEditForm(emptyEditForm); };
  const handleEditChange = (e) => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditLoading(true);
    try {
      await updatePart(editingPart.part_ID, {
        ...editForm,
        stock_Quantity: Number(editForm.stock_Quantity),
        minimum_Stock_Level: Number(editForm.minimum_Stock_Level),
        unit_Price: Number(editForm.unit_Price),
        purchase_Price: Number(editForm.purchase_Price),
      });
      toast.success('Part updated successfully.'); closeEdit(); fetchParts();
    } catch (err) { toast.error(err.message || 'Failed to update part.'); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePart(deletingPart.part_ID);
      toast.success('Part deleted.'); setDeletingPart(null); fetchParts();
    } catch (err) { toast.error(err.message || 'Failed to delete part.'); }
    finally { setDeleteLoading(false); }
  };

  const resetPurchaseForm = () => setPurchaseForm({ vendor_ID: '', admin_ID: '', payment_Status: 'Paid', items: [{ ...emptyItem }] });
  const closePurchase = () => { setPurchaseOpen(false); resetPurchaseForm(); };
  const handlePurchaseChange = (e) => setPurchaseForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleItemChange = (i, e) => { const u = [...purchaseForm.items]; u[i] = { ...u[i], [e.target.name]: e.target.value }; setPurchaseForm(p => ({ ...p, items: u })); };
  const addItem = () => setPurchaseForm(p => ({ ...p, items: [...p.items, { ...emptyItem }] }));
  const removeItem = (i) => { if (purchaseForm.items.length === 1) return; setPurchaseForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) })); };
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault(); setPurchaseLoading(true);
    try {
      await purchaseParts({
        vendor_ID: Number(purchaseForm.vendor_ID), admin_ID: Number(purchaseForm.admin_ID),
        payment_Status: purchaseForm.payment_Status,
        items: purchaseForm.items.map(it => ({ part_ID: Number(it.part_ID), quantity_Purchased: Number(it.quantity_Purchased), purchase_Unit_Cost: Number(it.purchase_Unit_Cost) })),
      });
      toast.success('Purchase order submitted.'); closePurchase(); fetchParts();
    } catch (err) { toast.error(err.message || 'Failed to submit purchase.'); }
    finally { setPurchaseLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Parts Management</h2>
        </div>
        <button onClick={() => setPurchaseOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm">
          <ShoppingCart className="h-4 w-4" /> Purchase Parts
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input type="text" placeholder="Search by name, category, or brand…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-colors" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-gray-400 gap-3">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading parts…
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-gray-400">
            <Package className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-sm">{searchTerm ? 'No parts match your search.' : 'No parts found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['ID','Name','Category','Brand','Stock','Min Stock','Unit Price','Purchase Price','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredParts.map(part => (
                  <tr key={part.part_ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{part.part_ID}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{part.part_Name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{part.part_Category}</td>
                    <td className="px-4 py-3 text-gray-600">{part.brand}</td>
                    <td className="px-4 py-3"><span className={`font-semibold ${part.stock_Quantity <= part.minimum_Stock_Level ? 'text-red-600' : 'text-green-600'}`}>{part.stock_Quantity}</span></td>
                    <td className="px-4 py-3 text-gray-600">{part.minimum_Stock_Level}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">₱{Number(part.unit_Price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">₱{Number(part.purchase_Price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(part)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeletingPart(part)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Part</h3>
              <button onClick={closeEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['part_Name','Part Name'],['part_Category','Category'],['brand','Brand']].map(([name,label]) => (
                  <div key={name}><label className={labelCls}>{label}</label><input className={inputCls} name={name} value={editForm[name]} onChange={handleEditChange} required /></div>
                ))}
                {[['stock_Quantity','Stock Quantity'],['minimum_Stock_Level','Min Stock Level'],['unit_Price','Unit Price (₱)'],['purchase_Price','Purchase Price (₱)']].map(([name,label]) => (
                  <div key={name}><label className={labelCls}>{label}</label><input type="number" min="0" step="0.01" className={inputCls} name={name} value={editForm[name]} onChange={handleEditChange} required /></div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Cancel</button>
                <LoadingButton type="submit" isLoading={editLoading} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm">Save Changes</LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center"><Trash2 className="h-5 w-5 text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-800">Delete Part</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{deletingPart.part_Name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingPart(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Cancel</button>
              <LoadingButton onClick={handleDelete} isLoading={deleteLoading} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm">Delete</LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {purchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Purchase Parts</h3>
              <button onClick={closePurchase} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handlePurchaseSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className={labelCls}>Vendor ID</label><input type="number" min="1" className={inputCls} name="vendor_ID" value={purchaseForm.vendor_ID} onChange={handlePurchaseChange} required /></div>
                <div><label className={labelCls}>Admin ID</label><input type="number" min="1" className={inputCls} name="admin_ID" value={purchaseForm.admin_ID} onChange={handlePurchaseChange} required /></div>
                <div><label className={labelCls}>Payment Status</label>
                  <select className={inputCls} name="payment_Status" value={purchaseForm.payment_Status} onChange={handlePurchaseChange}>
                    <option value="Paid">Paid</option><option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Items</span>
                  <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"><Plus className="h-4 w-4" /> Add Item</button>
                </div>
                <div className="space-y-3">
                  {purchaseForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end bg-gray-50 p-3 rounded-lg">
                      <div><label className={labelCls}>Part ID</label><input type="number" min="1" className={inputCls} name="part_ID" value={item.part_ID} onChange={e => handleItemChange(idx, e)} required /></div>
                      <div><label className={labelCls}>Quantity</label><input type="number" min="1" className={inputCls} name="quantity_Purchased" value={item.quantity_Purchased} onChange={e => handleItemChange(idx, e)} required /></div>
                      <div><label className={labelCls}>Unit Cost (₱)</label><input type="number" min="0" step="0.01" className={inputCls} name="purchase_Unit_Cost" value={item.purchase_Unit_Cost} onChange={e => handleItemChange(idx, e)} required /></div>
                      <button type="button" onClick={() => removeItem(idx)} disabled={purchaseForm.items.length === 1} className="mb-0.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><Minus className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closePurchase} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Cancel</button>
                <LoadingButton type="submit" isLoading={purchaseLoading} className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm">Submit Purchase</LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartsPage;
