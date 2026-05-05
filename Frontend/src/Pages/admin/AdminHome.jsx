import React from 'react';
import { Users, AlertTriangle, FileText } from 'lucide-react';
import StatsCard from '../components/StatsCard';

const AdminHome = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard 
          title="Total Staff"
          value="24"
          icon={Users}
          description="↑ +2 from last month"
          iconColorClass="bg-blue-50 text-blue-600"
          descColorClass="text-green-600"
        />
        
        <StatsCard 
          title="Low Stock Alerts"
          value="7"
          icon={AlertTriangle}
          description="Needs attention"
          iconColorClass="bg-amber-50 text-amber-500"
          descColorClass="text-amber-600"
        />
        
        <StatsCard 
          title="Pending Invoices"
          value="12"
          icon={FileText}
          description="3 due today"
          iconColorClass="bg-purple-50 text-purple-600"
          descColorClass="text-gray-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
          <FileText className="h-12 w-12 text-gray-200 mb-4" />
          <p>No recent activity found.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
