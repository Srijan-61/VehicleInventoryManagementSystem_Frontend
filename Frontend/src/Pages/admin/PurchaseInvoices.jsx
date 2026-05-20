import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  ShoppingCart, Plus, X, Trash2, RefreshCw, 
  DollarSign, CheckCircle, Clock, FileText
} from 'lucide-react';
import apiClient from '../../api/axiosConfig';
import { adminApi } from '../../api/adminApi';

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vendorId: '',
    notes: '',
    items: [{ partId: '', quantity: 1, unitPrice: '' }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, vendorsRes, partsRes] = await Promise.all([
        adminApi.getPurchaseInvoices(),
        adminApi.getVendorsForPurchase(),
        adminApi.getAllParts()
      ]);
      setInvoices(invoicesRes.data || []);
      setVendors(vendorsRes.data || []);
      setParts(partsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    setDetailLoading(true);
    try {
      const response = await apiClient.get(`/AdminPurchaseInvoice/${invoiceId}`);
      setSelectedInvoice(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { partId: '', quantity: 1, unitPrice: '' }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorId) {
      toast.error('Please select a vendor');
      return;
    }
    if (formData.items.some(item => !item.partId || !item.quantity || !item.unitPrice)) {
      toast.error('Please fill all item details');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vendorId: parseInt(formData.vendorId),
        adminId: 1,
        items: formData.items.map(item => ({
          partId: parseInt(item.partId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        })),
        notes: formData.notes
      };
      await adminApi.createPurchaseInvoice(payload);
      toast.success('Purchase invoice created successfully!');
      setShowModal(false);
      setFormData({ vendorId: '', notes: '', items: [{ partId: '', quantity: 1, unitPrice: '' }] });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'Rs. 0';
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const totalInvoices = invoices.length;
  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.total_Cost || inv.totalCost || 0), 0);
  const pendingPayments = invoices.filter(inv => (inv.payment_Status || inv.paymentStatus) === 'Pending')
    .reduce((sum, inv) => sum + (inv.total_Cost || inv.totalCost || 0), 0);

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Purchase Invoices</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Create and manage purchase invoices for stock updates from vendors.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600">Total Invoices</p>
                <p className="text-2xl font-bold text-green-800">{totalInvoices}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600">Total Spent</p>
                <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-yellow-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-800">{formatCurrency(pendingPayments)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-800">All Purchase Invoices</h3>
          <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No purchase invoices found. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Invoice No', 'Date', 'Vendor', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.purchase_Invoice_No} className="hover:bg-gray-50 cursor-pointer" onClick={() => fetchInvoiceDetails(inv.purchase_Invoice_No)}>
                    <td className="px-4 py-3 text-gray-400">#{inv.purchase_Invoice_No}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{inv.invoice_Number}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(inv.purchase_Date)}</td>
                    <td className="px-4 py-3 text-gray-700">{inv.vendorName}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.itemCount || 0}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(inv.total_Cost)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        inv.payment_Status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.payment_Status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); fetchInvoiceDetails(inv.purchase_Invoice_No); }} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-800">Create Purchase Invoice</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Select Vendor <span className="text-red-500">*</span></label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                  className={inputClass}
                  required
                >
                  <option value="">— Select Vendor —</option>
                  {vendors.map(v => (
                    <option key={v.id || v.vendor_ID} value={v.id || v.vendor_ID}>
                      {v.name || v.vendor_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Items</label>
                  <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end bg-gray-50 p-3 rounded-lg">
                      <div>
                        <label className={labelClass}>Part</label>
                        <select
                          value={item.partId}
                          onChange={(e) => handleItemChange(idx, 'partId', e.target.value)}
                          className={inputClass}
                          required
                        >
                          <option value="">Select Part</option>
                          {parts.map(p => (
                            <option key={p.part_ID} value={p.part_ID}>
                              {p.part_Name} — Stock: {p.stock_Quantity}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Unit Price (Rs.)</label>
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} className={inputClass} required />
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="mb-0.5 p-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Notes (Optional)</label>
                <textarea rows={2} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className={`${inputClass} resize-none`} placeholder="Additional notes..." />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="p-10 text-center">Loading details...</div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800">Invoice Details</h3>
                  </div>
                  <button onClick={() => setSelectedInvoice(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Invoice No" value={selectedInvoice.invoice_Number} />
                    <InfoRow label="Date" value={formatDate(selectedInvoice.purchase_Date)} />
                    <InfoRow label="Vendor" value={selectedInvoice.vendorName} />
                    <InfoRow label="Status" value={selectedInvoice.payment_Status || 'Pending'} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Part Name</th>
                          <th className="px-3 py-2 text-right">Quantity</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedInvoice.items || []).map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{item.partName || item.PartName || 'N/A'}</td>
                            <td className="px-3 py-2 text-right">{item.quantity_Purchased || item.quantityPurchased || item.Quantity || 0}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.purchase_Unit_Cost || item.unitPrice || 0)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.line_Total || item.totalPrice || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between"><span className="font-semibold">Subtotal:</span><span>{formatCurrency(selectedInvoice.sub_Total)}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Tax (13%):</span><span>{formatCurrency(selectedInvoice.tax_Amount)}</span></div>
                    <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>{formatCurrency(selectedInvoice.total_Cost)}</span></div>
                  </div>
                  {selectedInvoice.notes && <InfoRow label="Notes" value={selectedInvoice.notes} />}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-medium text-gray-800">{value || '—'}</p></div>
);

export default PurchaseInvoices;