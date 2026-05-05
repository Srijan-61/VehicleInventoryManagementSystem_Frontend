import React, { useState } from 'react';
import { FileText, Plus, Minus, Tag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { createInvoice } from '../../api/salesApi';
import LoadingButton from '../../components/LoadingButton';

const emptyItem = { part_ID: '', quantity_Sold: '' };
const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-bgcolor focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

const pick = (obj, ...keys) => { for (const k of keys) { if (obj[k] !== undefined && obj[k] !== null) return obj[k]; } return 0; };

const SalesInvoicePage = () => {
  const [form, setForm] = useState({ customer_ID: '', staff_ID: '', is_Paid: 'true', items: [{ ...emptyItem }] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleItemChange = (i, e) => { const u = [...form.items]; u[i] = { ...u[i], [e.target.name]: e.target.value }; setForm(p => ({ ...p, items: u })); };
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { ...emptyItem }] }));
  const removeItem = (i) => { if (form.items.length === 1) return; setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setResult(null);
    try {
      const data = await createInvoice({
        customer_ID: Number(form.customer_ID), staff_ID: Number(form.staff_ID),
        is_Paid: form.is_Paid === 'true',
        items: form.items.map(it => ({ part_ID: Number(it.part_ID), quantity_Sold: Number(it.quantity_Sold) })),
      });
      setResult(data); toast.success('Invoice created successfully!');
    } catch (err) { toast.error(err.message || 'Failed to create invoice.'); }
    finally { setLoading(false); }
  };

  const currency = (val) => `₱${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const subTotal = result ? pick(result, 'sub_Total', 'subTotal', 'SubTotal') : null;
  const discountAmount = result ? pick(result, 'discount_Amount', 'discountAmount', 'DiscountAmount') : null;
  const finalTotal = result ? pick(result, 'final_Total', 'finalTotal', 'FinalTotal', 'total') : null;
  const loyaltyApplied = result ? !!(result.loyalty_Discount_Applied ?? result.loyaltyDiscountApplied ?? result.LoyaltyDiscountApplied ?? false) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Invoice</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create an invoice and see the loyalty discount applied automatically.</p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg px-4 py-3">
        <Tag className="h-4 w-4 mt-0.5 shrink-0" />
        <p><strong>Loyalty Discount:</strong> A <strong>10% discount</strong> is automatically applied when the purchase subtotal exceeds <strong>₱5,000</strong>.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>Customer ID</label><input type="number" min="1" className={inputCls} name="customer_ID" value={form.customer_ID} onChange={handleChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Staff ID</label><input type="number" min="1" className={inputCls} name="staff_ID" value={form.staff_ID} onChange={handleChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Payment Status</label>
              <select className={inputCls} name="is_Paid" value={form.is_Paid} onChange={handleChange}>
                <option value="true">Paid</option><option value="false">Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Invoice Items</span>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium"><Plus className="h-4 w-4" /> Add Item</button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end bg-gray-50 p-3 rounded-lg">
                  <div><label className={labelCls}>Part ID</label><input type="number" min="1" className={inputCls} name="part_ID" value={item.part_ID} onChange={e => handleItemChange(i, e)} placeholder="e.g. 1" required /></div>
                  <div><label className={labelCls}>Quantity Sold</label><input type="number" min="1" className={inputCls} name="quantity_Sold" value={item.quantity_Sold} onChange={e => handleItemChange(i, e)} placeholder="e.g. 2" required /></div>
                  <button type="button" onClick={() => removeItem(i)} disabled={form.items.length === 1} className="mb-0.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><Minus className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <LoadingButton type="submit" isLoading={loading} className="w-full bg-primary hover:bg-primary-hover text-white text-sm">Create Invoice</LoadingButton>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 text-gray-800">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold">Invoice Summary</h3>
          </div>
          <div className="p-6 space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-gray-50"><span className="text-sm text-gray-600">Subtotal</span><span className="text-sm font-semibold text-gray-800">{currency(subTotal)}</span></div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50"><span className="text-sm text-gray-600">Discount Amount</span><span className="text-sm font-semibold text-green-600">{Number(discountAmount) > 0 ? `− ${currency(discountAmount)}` : currency(0)}</span></div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50"><span className="text-sm font-bold text-gray-800">Final Total</span><span className="text-lg font-bold text-primary">{currency(finalTotal)}</span></div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Loyalty Discount Applied</span>
              {loyaltyApplied ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold"><CheckCircle className="h-3.5 w-3.5" />Yes — 10% applied</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold"><XCircle className="h-3.5 w-3.5" />No discount</span>
              )}
            </div>
            {!loyaltyApplied && Number(subTotal) > 0 && <p className="text-xs text-gray-400 pt-1">Subtotal must exceed ₱5,000 to qualify for the 10% loyalty discount.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoicePage;
