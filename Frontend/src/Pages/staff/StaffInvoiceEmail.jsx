import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { staffApi } from '../../api/staffApi';

// ─── Small helper to render a label + value row in the preview card ──────────
const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value || '—'}</span>
  </div>
);

// ─── Shared Tailwind classes ──────────────────────────────────────────────────
const selectClass =
  'w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm ' +
  'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

// ─── Error message extractor ──────────────────────────────────────────────────
// Pulls the most useful error message out of a raw Axios error.
// Checks for backend response messages first, then falls back to the provided default.
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg = data?.message || data?.Message || data || err?.message || fallback;
  return typeof msg === 'string' ? msg : fallback;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffInvoiceEmail = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [customers, setCustomers]               = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoices, setInvoices]                 = useState([]);
  const [selectedInvoiceNo, setSelectedInvoiceNo]   = useState('');
  const [invoicePreview, setInvoicePreview]     = useState(null);

  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  const [fetchingInvoices, setFetchingInvoices]   = useState(false);
  const [fetchingPreview, setFetchingPreview]     = useState(false);
  const [sending, setSending]                     = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]     = useState('');

  // ── Load all customers on first render ─────────────────────────────────────
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await staffApi.getCustomers();
        setCustomers(res.data);
      } catch (err) {
        // Show the actual backend error so the staff knows what went wrong
        setErrorMessage(getErrorMessage(err, 'Failed to load customer list. Please refresh the page.'));
      } finally {
        setFetchingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  // ── When customer changes: load that customer's invoices ───────────────────
  useEffect(() => {
    // Reset downstream state whenever the customer selection changes
    setInvoices([]);
    setSelectedInvoiceNo('');
    setInvoicePreview(null);
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedCustomerId) return;

    const loadInvoices = async () => {
      try {
        setFetchingInvoices(true);
        const res = await staffApi.getCustomerInvoices(selectedCustomerId);
        setInvoices(res.data);
      } catch (err) {
        // Show the actual backend error instead of silently failing
        setErrorMessage(getErrorMessage(err, 'Failed to load invoices for the selected customer.'));
      } finally {
        setFetchingInvoices(false);
      }
    };
    loadInvoices();
  }, [selectedCustomerId]);

  // ── When customer OR invoice changes: load full invoice details for preview ─
  // Listed in deps as [selectedCustomerId, selectedInvoiceNo] — both values are used inside the effect. The guard below stops the API call when either is empty.
  useEffect(() => {
    // Reset preview and messages whenever either selection changes
    setInvoicePreview(null);
    setSuccessMessage('');
    setErrorMessage('');

    // Do not call the API until both a customer and an invoice are selected
    if (!selectedCustomerId || !selectedInvoiceNo) return;

    const loadPreview = async () => {
      try {
        setFetchingPreview(true);
        const res = await staffApi.getInvoiceDetails(selectedCustomerId, selectedInvoiceNo);
        const raw = res.data;
        console.log('Invoice details response:', raw);
        console.log('Invoice response keys:', Object.keys(raw ?? {}));

        // Resolve the items array — .NET backends commonly return PascalCase or
        // mixed-case collection names. Try every known variant before defaulting to [].
        const resolvedItems =
          raw.items          ||   // camelCase (expected)
          raw.Items          ||   // PascalCase
          raw.salesItems     ||
          raw.SalesItems     ||
          raw.invoiceItems   ||
          raw.InvoiceItems   ||
          raw.saleItems      ||
          raw.SaleItems      ||
          raw.lineItems      ||
          raw.LineItems      ||
          [];

        if (resolvedItems.length === 0) {
          console.warn(
            'No items found under any known key. Check "Invoice response keys" above to find the correct property name.'
          );
        }

        setInvoicePreview({ ...raw, items: resolvedItems });
      } catch (err) {
        // Show the actual backend error instead of silently failing
        setErrorMessage(getErrorMessage(err, 'Failed to load invoice details. Please try again.'));
      } finally {
        setFetchingPreview(false);
      }
    };
    loadPreview();
  }, [selectedCustomerId, selectedInvoiceNo]);

  // ── Send invoice email ─────────────────────────────────────────────────────
  // Called when the staff clicks "Send Invoice Email".
  // Shows a success message if the email is sent, or an error message if it fails.
  const handleSendEmail = async () => {
    // Safety guard — the button should already be disabled if either value is missing
    if (!selectedCustomerId || !selectedInvoiceNo) return;

    try {
      setSending(true);
      setSuccessMessage('');
      setErrorMessage('');

      // Always send BOTH customer_ID and sales_Invoice_No to prevent sending the wrong invoice
      const res = await staffApi.sendInvoiceEmail(selectedCustomerId, selectedInvoiceNo);
      setSuccessMessage(res.data?.message || 'Invoice email sent successfully!');
    } catch (err) {
      // getErrorMessage centralises the extraction logic — no inline duplication needed
      setErrorMessage(getErrorMessage(err, 'Failed to send invoice email. Please try again.'));
    } finally {
      setSending(false); // re-enable the button whether the request succeeded or failed
    }
  };

  // ── Formatting helpers ─────────────────────────────────────────────────────
  // Format a number as Nepali Rupees, e.g. 25000 → "Rs. 25,000"
  const formatCurrency = (amount) =>
    `Rs. ${Number(amount).toLocaleString('en-IN')}`;

  // Format an ISO date string into a readable date, e.g. "2026-05-18" → "May 18, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Send button is only active when both selections are made and not already sending
  const canSend = Boolean(selectedCustomerId && selectedInvoiceNo && !sending);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Selection card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Send Invoice Email</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select a customer and their invoice to preview details and send via email.
            </p>
          </div>
        </div>

        <div className="p-6">

          {/* Success banner */}
          {successMessage && (
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-auto text-green-600 hover:text-green-800 text-lg font-bold leading-none"
                aria-label="Dismiss"
              >×</button>
            </div>
          )}

          {/* Error banner */}
          {errorMessage && (
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage('')}
                className="ml-auto text-red-600 hover:text-red-800 text-lg font-bold leading-none"
                aria-label="Dismiss"
              >×</button>
            </div>
          )}

          {/* Dropdowns row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">

            {/* Step 1 — Customer dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step 1 — Select Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                disabled={fetchingCustomers}
                className={selectClass}
              >
                <option value="">
                  {fetchingCustomers ? 'Loading customers…' : '— Select a customer —'}
                </option>
                {customers.map((c) => (
                  <option key={c.customer_ID} value={c.customer_ID}>
                    {c.fullName}
                    {c.email ? ` (${c.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2 — Invoice dropdown (enabled only after customer is chosen) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step 2 — Select Invoice <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInvoiceNo}
                onChange={(e) => setSelectedInvoiceNo(e.target.value)}
                disabled={!selectedCustomerId || fetchingInvoices || invoices.length === 0}
                className={selectClass}
              >
                <option value="">
                  {!selectedCustomerId
                    ? 'Select a customer first'
                    : fetchingInvoices
                    ? 'Loading invoices…'
                    : invoices.length === 0
                    ? 'No invoices found for this customer'
                    : '— Select an invoice —'}
                </option>
                {invoices.map((inv) => (
                  <option key={inv.sales_Invoice_No} value={inv.sales_Invoice_No}>
                    {`Invoice #${inv.sales_Invoice_No}  •  ${formatDate(inv.sales_Date)}  •  ${formatCurrency(inv.final_Total)}  •  ${inv.is_Paid ? 'Paid' : 'Unpaid'}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview loading spinner ─────────────────────────────────────────── */}
      {fetchingPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 flex justify-center">
          <p className="text-gray-400 text-sm animate-pulse">Loading invoice preview…</p>
        </div>
      )}

      {/* ── Full invoice preview card ───────────────────────────────────────── */}
      {invoicePreview && !fetchingPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Preview header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Invoice Preview</h2>
            {/* Payment status badge */}
            <span
              className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                invoicePreview.is_Paid
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {invoicePreview.is_Paid ? 'Paid' : 'Unpaid / Credit'}
            </span>
          </div>

          <div className="p-6 space-y-6">

            {/* Customer info + Invoice info side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Customer info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Customer Information
                </h3>
                <InfoRow label="Name"  value={invoicePreview.customerName} />
                <InfoRow label="Email" value={invoicePreview.customerEmail} />
                <InfoRow label="Phone" value={invoicePreview.customerPhone} />
              </div>

              {/* Invoice info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Invoice Information
                </h3>
                <InfoRow label="Invoice No." value={`#${invoicePreview.sales_Invoice_No}`} />
                <InfoRow label="Sales Date"  value={formatDate(invoicePreview.sales_Date)} />
                <InfoRow label="Staff"       value={invoicePreview.staffName} />
                {invoicePreview.credit_Due_Date && (
                  <InfoRow label="Credit Due" value={formatDate(invoicePreview.credit_Due_Date)} />
                )}
              </div>
            </div>

            {/* Items table */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Invoice Items
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Part Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Brand</th>
                      <th className="px-4 py-3 text-center font-semibold">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!invoicePreview.items?.length ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                          No items found for this invoice.
                        </td>
                      </tr>
                    ) : (
                      invoicePreview.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-800 font-medium">{item.partName}</td>
                          <td className="px-4 py-3 text-gray-600">{item.brand}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{item.quantity_Sold}</td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {formatCurrency(item.unit_Price)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                            {formatCurrency(item.total_Price)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sub Total</span>
                  <span>{formatCurrency(invoicePreview.sub_Total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount</span>
                  <span className="text-red-500">− {formatCurrency(invoicePreview.discount_Amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-200 pt-2">
                  <span>Final Total</span>
                  <span>{formatCurrency(invoicePreview.final_Total)}</span>
                </div>
              </div>
            </div>

            {/* Send button — shown inside the preview card */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={handleSendEmail}
                disabled={!canSend}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg
                           font-semibold text-sm hover:bg-blue-700 active:bg-blue-800
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                {sending ? 'Sending…' : 'Send Invoice Email'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StaffInvoiceEmail;
