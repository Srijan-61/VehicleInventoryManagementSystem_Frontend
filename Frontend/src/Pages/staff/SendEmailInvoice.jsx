import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Mail, CheckCircle, User } from 'lucide-react';

const SendEmailInvoice = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://localhost:7111/api/Staff/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          toast.error('Failed to load customer list.');
        }
      } catch {
        toast.error('Network error loading customers.');
      } finally {
        setFetchingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Clear invoice number whenever customer changes
  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
    setInvoiceNo('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!selectedCustomer) {
      toast.error('Please select a customer.');
      return;
    }

    const num = Number(invoiceNo);
    if (!num || num <= 0) {
      toast.error('Please enter a valid invoice number.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/staff/invoices/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sales_Invoice_No: num }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        const customer = customers.find(c => String(c.customer_ID) === String(selectedCustomer));
        setSuccessMessage(
          data?.message || `Invoice #${num} sent successfully to ${customer?.fullName || 'customer'}.`
        );
        toast.success('Invoice email sent successfully!');
        setInvoiceNo('');
        setSelectedCustomer('');
      } else {
        toast.error(data?.message || 'Failed to send invoice email.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const selectedCustomerObj = customers.find(c => String(c.customer_ID) === String(selectedCustomer));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
        <Mail className="w-6 h-6 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Send Invoice Email</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a customer and enter their invoice number to send the invoice via email.</p>
        </div>
      </div>

      <div className="p-6 max-w-lg">
        {/* Success banner */}
        {successMessage && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-600 hover:text-green-800 text-lg leading-none font-bold"
            >×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer selector */}
          <div>
            <label className={labelClass}>Select Customer</label>
            <select
              required
              value={selectedCustomer}
              onChange={handleCustomerChange}
              disabled={fetchingCustomers}
              className={inputClass}
            >
              <option value="">
                {fetchingCustomers ? 'Loading customers…' : '— Select a customer —'}
              </option>
              {customers.map((c) => (
                <option key={c.customer_ID} value={c.customer_ID}>
                  {c.fullName} (ID: {c.customer_ID})
                </option>
              ))}
            </select>
          </div>

          {/* Customer info card — shown after selection */}
          {selectedCustomerObj && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{selectedCustomerObj.fullName}</p>
                <p className="text-gray-500">Customer ID: {selectedCustomerObj.customer_ID}</p>
              </div>
            </div>
          )}

          {/* Invoice number — only shown after customer is selected */}
          {selectedCustomer && (
            <div>
              <label className={labelClass}>Sales Invoice Number</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 7"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">Enter the invoice number belonging to this customer.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fetchingCustomers || !selectedCustomer}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold text-sm rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading || !selectedCustomer ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Invoice Email
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendEmailInvoice;
