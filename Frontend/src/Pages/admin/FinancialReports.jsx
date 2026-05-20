import React, { useState } from 'react';
import { Calendar, TrendingUp, DollarSign, FileText, PieChart } from 'lucide-react';

const FinancialReports = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ 
    value: m, 
    label: new Date(0, m-1).toLocaleString('default', { month: 'long' }) 
  }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '';
      if (reportType === 'daily') {
        url = `https://localhost:7111/api/FinancialReport/daily?date=${selectedDate}`;
      } else if (reportType === 'monthly') {
        url = `https://localhost:7111/api/FinancialReport/monthly?year=${selectedYear}&month=${selectedMonth}`;
      } else {
        url = `https://localhost:7111/api/FinancialReport/yearly?year=${selectedYear}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <PieChart className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View daily, monthly, and yearly financial summaries
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          {[
            { id: 'daily', label: 'Daily Report', icon: Calendar },
            { id: 'monthly', label: 'Monthly Report', icon: Calendar },
            { id: 'yearly', label: 'Yearly Report', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setReportType(tab.id);
                setReportData(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                reportType === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            {reportType === 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
            {reportType === 'monthly' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  >
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </>
            )}
            {reportType === 'yearly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                >
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            )}
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.totalSales)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.totalPurchases)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Profit</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(reportData.profit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;