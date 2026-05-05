import React from 'react';
import { Clock, Search, FileText, ShoppingBag } from 'lucide-react';

const History = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchase History</h1>
          <p className="text-sm text-gray-500 mt-1">Review all your previous purchases and service invoices.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Find an invoice..." 
            className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Purchase History Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Your purchase history and service invoices will be displayed here once you make your first transaction.</p>
          <button className="mt-8 px-6 py-2 border-2 border-gray-900 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-900 hover:text-white transition-all">
            Browse Parts
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
