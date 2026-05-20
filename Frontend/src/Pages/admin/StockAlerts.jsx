import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  AlertTriangle, Bell, Mail, CheckCircle, RefreshCw, 
  Package, Users, DollarSign, Send
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

const StockAlerts = () => {
  const [lowStockParts, setLowStockParts] = useState([]);
  const [overdueCustomers, setOverdueCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lowStockRes, overdueRes] = await Promise.all([
        adminApi.getLowStockAlerts(),
        adminApi.getOverdueCustomers()
      ]);
      // Backend returns { data: [...] }
      setLowStockParts(lowStockRes?.data || []);
      setOverdueCustomers(overdueRes?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load alerts data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (overdueCustomers.length === 0) {
      toast.info('No overdue customers to send reminders to');
      return;
    }
    setSending(true);
    try {
      const response = await adminApi.sendCreditReminders();
      toast.success(response?.data?.message || response?.message || `Reminders sent to ${overdueCustomers.length} customers`);
      setLastSent(new Date());
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to send reminders');
    } finally {
      setSending(false);
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

  const lowStockCount = lowStockParts.length;
  const overdueCount = overdueCustomers.length;
  const totalOverdueAmount = overdueCustomers.reduce((sum, c) => sum + (c.pendingCredit || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stock Alerts & Credit Reminders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor low stock parts and send automated email reminders to customers with overdue credit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          <div className={`rounded-xl p-4 border ${lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Package className={`w-5 h-5 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Low Stock Alerts</p>
                <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {lowStockCount}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-4 border ${overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Users className={`w-5 h-5 ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Overdue Customers</p>
                <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {overdueCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total Overdue Amount</p>
                <p className="text-2xl font-bold text-yellow-800">{formatCurrency(totalOverdueAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-gray-800">Low Stock Alerts (&lt; 10 units)</h3>
          </div>
          <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {lowStockParts.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>All parts are well-stocked! No low stock alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {lowStockParts.map((part) => (
              <div key={part.partId} className="p-4 hover:bg-red-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-red-500" />
                      <h4 className="font-semibold text-gray-800">{part.partName}</h4>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        CRITICAL
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                      <div><span className="text-gray-500">Current Stock:</span> <span className="font-semibold text-red-600">{part.currentStock} units</span></div>
                      <div><span className="text-gray-500">Minimum Threshold:</span> <span>10 units</span></div>
                      <div><span className="text-gray-500">Part Code:</span> <span>{part.partCode || '—'}</span></div>
                      <div><span className="text-gray-500">Category:</span> <span>{part.category || '—'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overdue Credit Reminders Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-gray-800">Overdue Credit Reminders (&gt; 30 days)</h3>
          </div>
          <div className="flex gap-2">
            {lastSent && (
              <span className="text-xs text-gray-400">Last sent: {formatDate(lastSent)}</span>
            )}
            <button
              onClick={handleSendReminders}
              disabled={sending || overdueCustomers.length === 0}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? 'Sending...' : 'Send All Reminders'}
            </button>
          </div>
        </div>
        {overdueCustomers.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>No overdue credit payments! All customers are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Customer Name', 'Email', 'Phone', 'Credit Balance', 'Days Overdue', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overdueCustomers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-red-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{customer.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(customer.pendingCredit)}</td>
                    <td className="px-4 py-3 text-gray-600">{customer.daysOverdue} days</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Overdue</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlerts;