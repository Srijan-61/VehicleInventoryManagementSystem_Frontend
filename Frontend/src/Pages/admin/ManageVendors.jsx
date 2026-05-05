import React from 'react';
import { Truck, UserPlus, Search, Phone, Mail } from 'lucide-react';

const ManageVendors = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your suppliers and vendor contact information.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md">
          <UserPlus className="w-5 h-5" /> Add New Vendor
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Active Vendors</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6">
            <Truck className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Vendors Registered</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Maintain a list of all your vehicle parts suppliers and vendors here.</p>
        </div>
      </div>
    </div>
  );
};

export default ManageVendors;
