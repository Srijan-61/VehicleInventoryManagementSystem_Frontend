import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Users, TrendingUp, AlertCircle, Download,
  Printer, RefreshCw, Search, Filter, BarChart2,
} from 'lucide-react';
import { staffApi } from '../../api/staffApi';

// ─── Endpoint paths — update these if the backend routes ever change ──────────
// These are the only lines that need to change if the API is restructured.
const ENDPOINTS = {
  regular:  '/staff/reports/regular-customers',
  highSpend: '/staff/reports/high-spenders',
  pending:  '/staff/reports/pending-credits',
};

// ─── Tab definitions — drives both the tab bar and the column config below ────
const TABS = [
  { id: 'regular',   label: 'Regular Customers', icon: Users },
  { id: 'highSpend', label: 'High Spenders',      icon: TrendingUp },
  { id: 'pending',   label: 'Pending Credits',    icon: AlertCircle },
];

// ─── Default / reset values for the filter form ───────────────────────────────
const INIT_FILTERS = {
  startDate:        '',    // ISO date string YYYY-MM-DD — regular + highSpend only
  endDate:          '',    // ISO date string YYYY-MM-DD — regular + highSpend only
  limit:            '',    // max records to return — regular + highSpend only
  minPurchaseCount: '',    // maps to minimumPurchases query param — regular tab only
  minSpent:         '',    // maps to minimumSpent query param — highSpend tab only
  overdueOnly:      false, // maps to overdueOnly query param — pending tab only
};

// ─── Pull the most useful error message from an Axios error ───────────────────
// Checks backend response body first, then falls back to the JS error message.
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg  = data?.message || data?.Message || data || err?.message || fallback;
  return typeof msg === 'string' ? msg : fallback;
};

// ─── Currency formatter — e.g. 25000 → "Rs. 25,000" ─────────────────────────
const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

// ─── Date formatter — e.g. "2026-05-18" → "May 18, 2026" ────────────────────
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Shared Tailwind class strings ────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm ' +
  'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
  'disabled:opacity-60';

const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

// ─── Small summary stat card ──────────────────────────────────────────────────
// Reused for all three report summary sections.
const StatCard = ({ icon: Icon, iconBg, label, value }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
    <div className={`p-3 rounded-lg ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffCustomerReports = () => {

  // ── Which report type is visible ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('regular');

  // ── Filter form values — these are what the staff types into the inputs.
  // They are NOT sent to the API until the staff clicks "Generate Report".
  const [filters, setFilters] = useState(INIT_FILTERS);

  // ── Report data returned by the backend ───────────────────────────────────
  const [reportData, setReportData] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // True after at least one successful or failed fetch.
  // Used to distinguish "not yet run" from "ran but empty".
  const [hasLoaded, setHasLoaded] = useState(false);

  // ── Fetch the report from the backend ─────────────────────────────────────
  // Builds the query string from the current tab and the provided filters object,
  // then calls the matching endpoint via staffApi.
  const fetchReport = async (tab, f) => {
    setLoading(true);
    setError(null);
    try {
      // Build URLSearchParams — only append a param when it has a real value.
      // This keeps the query string clean and avoids confusing the backend.
      const params = new URLSearchParams();
      // pending-credits only accepts overdueOnly — date range is not supported for that endpoint.
      if (tab !== 'pending' && f.startDate)          params.set('startDate',        f.startDate);
      if (tab !== 'pending' && f.endDate)            params.set('endDate',          f.endDate);
      if (tab !== 'pending' && f.limit)              params.set('limit',            f.limit);
      // Tab-specific filters
      if (tab === 'regular'   && f.minPurchaseCount) params.set('minimumPurchases', f.minPurchaseCount);
      if (tab === 'highSpend' && f.minSpent)         params.set('minimumSpent',     f.minSpent);
      if (tab === 'pending'   && f.overdueOnly)      params.set('overdueOnly',      'true');

      const qs  = params.toString();
      const url = `${ENDPOINTS[tab]}${qs ? `?${qs}` : ''}`;

      const res = await staffApi.fetchReport(url);

      // Tolerate both a plain array response and a { data: [] } wrapped response
      const rows = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? []);

      setReportData(rows);
      setHasLoaded(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load report. Please try again.'));
      setReportData([]);
      setHasLoaded(true); // still mark loaded so empty state renders correctly
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-fetch when the active tab changes ────────────────────────────────
  // Resets filters and data so the new tab always starts from a clean state.
  // fetchReport is intentionally omitted from deps — it is stable across renders
  // and including it would cause an infinite loop.
  useEffect(() => {
    setFilters(INIT_FILTERS);
    setReportData([]);
    setHasLoaded(false);
    setError(null);
    fetchReport(activeTab, INIT_FILTERS);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply filters and generate the report ────────────────────────────────
  // Called when the staff clicks the "Generate Report" button.
  const handleGenerate = () => {
    fetchReport(activeTab, filters);
  };

  // ── Generic handler for every filter input field ──────────────────────────
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Tab switch handler ────────────────────────────────────────────────────
  const handleTabChange = (tabId) => {
    if (tabId !== activeTab) setActiveTab(tabId);
  };

  // ── Summary stats computed from the loaded data ───────────────────────────
  // useMemo ensures this only recalculates when reportData or activeTab changes,
  // not on every render.
  const summary = useMemo(() => {
    if (activeTab === 'regular') {
      // Backend field: totalPurchases
      const purchases = reportData.map(r => Number(r.totalPurchases || 0));
      return {
        total:          reportData.length,
        maxPurchases:   purchases.length ? Math.max(...purchases) : 0,
        totalPurchases: purchases.reduce((a, b) => a + b, 0),
      };
    }

    if (activeTab === 'highSpend') {
      const spent = reportData.map(r => Number(r.totalSpent || 0));
      const total = spent.reduce((a, b) => a + b, 0);
      return {
        total:    reportData.length,
        maxSpent: spent.length ? Math.max(...spent) : 0,
        avgSpent: spent.length ? total / spent.length : 0,
      };
    }

    // pending credits — backend field: pendingAmount
    return {
      total:        reportData.length,
      totalPending: reportData.reduce((s, r) => s + Number(r.pendingAmount || 0), 0),
      overdueCount: reportData.filter(r => r.isOverdue).length,
    };
  }, [reportData, activeTab]);

  // ── CSV export ─────────────────────────────────────────────────────────────
  // Converts the current reportData array to a comma-separated file and triggers
  // a browser download. No server call needed — runs entirely in the browser.
  const exportCSV = () => {
    if (!reportData.length) {
      toast.info('No data to export. Generate a report first.');
      return;
    }

    // Use the first row's keys as column headers
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(row =>
      Object.values(row)
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`) // escape quotes
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');

    // Create a temporary invisible anchor and click it to start the download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url); // clean up the object URL after download
  };

  // ── Column definitions per tab ────────────────────────────────────────────
  // Each column has a header label and a render function that receives the row.
  // Adjust the field names inside render() to match the actual backend response.
  const COLUMNS = {
    // Backend fields: fullName, email, phoneNumber, totalPurchases, totalSpent, lastPurchaseDate
    regular: [
      { header: 'Customer Name',   render: r => r.fullName || r.customer_Name || r.customerName || '—' },
      { header: 'Email',           render: r => r.email || '—' },
      { header: 'Phone',           render: r => r.phoneNumber || r.phone || '—' },
      { header: 'Total Purchases', render: r => r.totalPurchases ?? 0 },
      { header: 'Total Spent',     render: r => formatCurrency(r.totalSpent) },
      { header: 'Last Purchase',   render: r => formatDate(r.lastPurchaseDate) },
    ],
    // Backend fields: fullName, email, phoneNumber, totalSpent, totalInvoices, lastPurchaseDate
    highSpend: [
      { header: 'Customer Name',  render: r => r.fullName || r.customer_Name || r.customerName || '—' },
      { header: 'Email',          render: r => r.email || '—' },
      { header: 'Phone',          render: r => r.phoneNumber || r.phone || '—' },
      { header: 'Total Spent',    render: r => formatCurrency(r.totalSpent) },
      { header: 'Total Invoices', render: r => r.totalInvoices ?? 0 },
      { header: 'Last Purchase',  render: r => formatDate(r.lastPurchaseDate) },
    ],
    // Backend fields: fullName, email, phoneNumber, sales_Invoice_No, pendingAmount, credit_Due_Date, isOverdue
    pending: [
      { header: 'Customer Name',   render: r => r.fullName || r.customer_Name || r.customerName || '—' },
      { header: 'Email',           render: r => r.email || '—' },
      { header: 'Phone',           render: r => r.phoneNumber || r.phone || '—' },
      { header: 'Invoice No.',     render: r => r.sales_Invoice_No ?? '—' },
      { header: 'Pending Amount',  render: r => formatCurrency(r.pendingAmount) },
      { header: 'Credit Due Date', render: r => formatDate(r.credit_Due_Date) },
      {
        header: 'Status',
        // Overdue rows show a red badge; pending rows show a yellow badge
        render: r =>
          r.isOverdue ? (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
              Overdue
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
              Pending
            </span>
          ),
      },
    ],
  };

  // Select the column set for the current tab
  const columns = COLUMNS[activeTab];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header + tabs + filters ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Page title */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Analyse regular customers, top spenders, and pending credit balances.
            </p>
          </div>
        </div>

        {/* ── Report type tab bar ────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap
                transition-colors border-b-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Filter section ─────────────────────────────────────────────────── */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Date range — regular-customers and high-spenders only.
                pending-credits does not support date filtering. */}
            {activeTab !== 'pending' && (
              <>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className={inputCls}
                  />
                </div>
              </>
            )}

            {/* Tab-specific filters */}
            {activeTab === 'regular' && (
              <div>
                <label className={labelCls}>Min. Purchase Count</label>
                <input
                  type="number"
                  name="minPurchaseCount"
                  value={filters.minPurchaseCount}
                  onChange={handleFilterChange}
                  min="1"
                  placeholder="e.g. 3"
                  className={inputCls}
                />
              </div>
            )}
            {activeTab === 'highSpend' && (
              <div>
                <label className={labelCls}>Min. Spending (Rs.)</label>
                <input
                  type="number"
                  name="minSpent"
                  value={filters.minSpent}
                  onChange={handleFilterChange}
                  min="0"
                  placeholder="e.g. 50000"
                  className={inputCls}
                />
              </div>
            )}
            {/* Limit — how many records to return (regular + highSpend only) */}
            {activeTab !== 'pending' && (
              <div>
                <label className={labelCls}>Limit (max records)</label>
                <input
                  type="number"
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                  min="1"
                  placeholder="e.g. 10"
                  className={inputCls}
                />
              </div>
            )}
            {activeTab === 'pending' && (
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="overdueOnly"
                  name="overdueOnly"
                  checked={filters.overdueOnly}
                  onChange={handleFilterChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="overdueOnly" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Show overdue only
                </label>
              </div>
            )}

            {/* Generate button — fetches data with the current filter values */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2
                  bg-blue-600 text-white text-sm font-semibold rounded-lg
                  hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                  transition-colors"
              >
                {loading
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />
                }
                {loading ? 'Loading…' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800 text-lg font-bold leading-none"
            aria-label="Dismiss"
          >×</button>
        </div>
      )}

      {/* ── Summary stat cards — only rendered once data has loaded ──────────── */}
      {hasLoaded && !loading && !error && reportData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activeTab === 'regular' && (
            <>
              <StatCard
                icon={Users}
                iconBg="bg-blue-100 text-blue-600"
                label="Total Regular Customers"
                value={summary.total}
              />
              <StatCard
                icon={TrendingUp}
                iconBg="bg-green-100 text-green-600"
                label="Highest Purchase Count"
                value={summary.maxPurchases}
              />
              <StatCard
                icon={Filter}
                iconBg="bg-purple-100 text-purple-600"
                label="Total Purchases"
                value={summary.totalPurchases}
              />
            </>
          )}
          {activeTab === 'highSpend' && (
            <>
              <StatCard
                icon={Users}
                iconBg="bg-blue-100 text-blue-600"
                label="Total High Spenders"
                value={summary.total}
              />
              <StatCard
                icon={TrendingUp}
                iconBg="bg-green-100 text-green-600"
                label="Highest Spending"
                value={formatCurrency(summary.maxSpent)}
              />
              <StatCard
                icon={BarChart2}
                iconBg="bg-purple-100 text-purple-600"
                label="Average Spending"
                value={formatCurrency(summary.avgSpent)}
              />
            </>
          )}
          {activeTab === 'pending' && (
            <>
              <StatCard
                icon={Users}
                iconBg="bg-blue-100 text-blue-600"
                label="Total Pending Customers"
                value={summary.total}
              />
              <StatCard
                icon={AlertCircle}
                iconBg="bg-yellow-100 text-yellow-600"
                label="Total Pending Amount"
                value={formatCurrency(summary.totalPending)}
              />
              <StatCard
                icon={AlertCircle}
                iconBg="bg-red-100 text-red-600"
                label="Overdue Customers"
                value={summary.overdueCount}
              />
            </>
          )}
        </div>
      )}

      {/* ── Report table card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Table toolbar — report label, record count, export buttons */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {TABS.find(t => t.id === activeTab)?.label}
            </p>
            {hasLoaded && (
              <p className="text-xs text-gray-400 mt-0.5">
                {reportData.length} record{reportData.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Print: opens the browser print dialog for the full page */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            {/* Export CSV: converts current data to a .csv file download */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg
                text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Loading spinner — shown while the API call is in flight */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading report…</span>
          </div>
        )}

        {/* Initial prompt — shown before any report has been run */}
        {!loading && !hasLoaded && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Filter className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-500">
              Set your filters above and click Generate Report
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Or click Generate Report without filters to see all records.
            </p>
          </div>
        )}

        {/* Empty state — shown after a fetch that returned no rows */}
        {!loading && hasLoaded && !error && reportData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm font-medium">No records match the selected filters.</p>
            <p className="text-xs mt-1">Try widening the date range or removing filter values.</p>
          </div>
        )}

        {/* Data table — rendered when there are rows to display */}
        {!loading && reportData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map(col => (
                    <th
                      key={col.header}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, i) => {
                  // Overdue pending-credit rows get a red tint to catch the staff's eye
                  const isOverdue = activeTab === 'pending' && (row.isOverdue || row.overdue);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 transition-colors ${
                        isOverdue
                          ? 'bg-red-50 hover:bg-red-100'
                          : i % 2 === 0
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50/50 hover:bg-gray-100'
                      }`}
                    >
                      {columns.map((col, j) => (
                        <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCustomerReports;
