import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PieChart, RefreshCw } from 'lucide-react';

const TABS = [
  { key: 'regular',  label: 'Regular Customers',  url: 'https://localhost:7111/api/staff/reports/regular-customers?minimumPurchases=2&limit=10' },
  { key: 'high',     label: 'High Spenders',       url: 'https://localhost:7111/api/staff/reports/high-spenders?limit=10' },
  { key: 'pending',  label: 'Pending Credits',     url: 'https://localhost:7111/api/staff/reports/pending-credits' },
];

const CustomerReports = () => {
  const [activeTab, setActiveTab] = useState('regular');
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReport = async (tab) => {
    const selected = TABS.find(t => t.key === tab);
    if (!selected) return;
    setLoading(true);
    setData([]);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(selected.url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const json = await response.json();
        setData(json.data || []);
        setMessage(json.message || '');
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.message || 'Failed to load report.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(activeTab); }, [activeTab]);

  const thClass = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200';
  const tdClass = 'px-4 py-3 text-sm text-gray-700';

  const renderHeader = () => {
    if (activeTab === 'regular') return (
      <tr>
        <th className={thClass}>Customer</th>
        <th className={thClass}>Phone</th>
        <th className={thClass}>Purchases</th>
        <th className={thClass}>Total Spent</th>
        <th className={thClass}>Last Purchase</th>
      </tr>
    );
    if (activeTab === 'high') return (
      <tr>
        <th className={thClass}>Customer</th>
        <th className={thClass}>Phone</th>
        <th className={thClass}>Total Spent</th>
        <th className={thClass}>Invoices</th>
      </tr>
    );
    return (
      <tr>
        <th className={thClass}>Invoice No</th>
        <th className={thClass}>Customer</th>
        <th className={thClass}>Phone</th>
        <th className={thClass}>Pending Amount</th>
        <th className={thClass}>Due Date</th>
        <th className={thClass}>Status</th>
      </tr>
    );
  };

  const renderRows = () => {
    if (loading) return (
      <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
    );
    if (data.length === 0) return (
      <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">No records found.</td></tr>
    );
    return data.map((item, i) => {
      if (activeTab === 'regular') return (
        <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
          <td className={`${tdClass} font-medium text-gray-900`}>{item.fullName}</td>
          <td className={tdClass}>{item.phoneNumber || '—'}</td>
          <td className={tdClass}>{item.totalPurchases}</td>
          <td className={tdClass}>Rs. {Number(item.totalSpent).toLocaleString()}</td>
          <td className={tdClass}>{item.lastPurchaseDate ? new Date(item.lastPurchaseDate).toLocaleDateString() : '—'}</td>
        </tr>
      );
      if (activeTab === 'high') return (
        <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
          <td className={`${tdClass} font-medium text-gray-900`}>{item.fullName}</td>
          <td className={tdClass}>{item.phoneNumber || '—'}</td>
          <td className={tdClass}>Rs. {Number(item.totalSpent).toLocaleString()}</td>
          <td className={tdClass}>{item.totalInvoices}</td>
        </tr>
      );
      return (
        <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
          <td className={tdClass}>#{item.sales_Invoice_No}</td>
          <td className={`${tdClass} font-medium text-gray-900`}>{item.fullName}</td>
          <td className={tdClass}>{item.phoneNumber || '—'}</td>
          <td className={tdClass}>Rs. {Number(item.pendingAmount).toLocaleString()}</td>
          <td className={tdClass}>{item.credit_Due_Date ? new Date(item.credit_Due_Date).toLocaleDateString() : '—'}</td>
          <td className={tdClass}>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${item.isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.isOverdue ? 'Overdue' : 'Pending'}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">View regular customers, high spenders, and pending credit records.</p>
          </div>
        </div>
        <button
          onClick={() => fetchReport(activeTab)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && !loading && (
          <p className="text-xs text-gray-400 mb-3">{message}</p>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">{renderHeader()}</thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerReports;
