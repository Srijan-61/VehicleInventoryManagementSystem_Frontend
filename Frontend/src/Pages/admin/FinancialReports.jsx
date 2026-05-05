import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Download, Calendar } from 'lucide-react';

const FinancialReports = () => {
  const stats = [
    { label: 'Total Revenue', value: '$0.00', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Expenses', value: '$0.00', icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Net Profit', value: '$0.00', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track your business revenue, expenses, and overall profitability.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" /> This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Financial Data Found</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Financial reports will appear here once sales and purchase invoices are recorded in the system.</p>
      </div>
    </div>
  );
};

export default FinancialReports;
