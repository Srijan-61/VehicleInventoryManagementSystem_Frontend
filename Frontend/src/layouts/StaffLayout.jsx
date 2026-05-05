import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const StaffLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-blue-800">Staff Portal</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/staff" className="block px-4 py-2 rounded hover:bg-blue-800">[Dashboard]</Link>
          <Link to="/staff/register-customer" className="block px-4 py-2 rounded hover:bg-blue-800">[Register Customer]</Link>
          <Link to="/staff/sales-invoice" className="block px-4 py-2 rounded hover:bg-blue-800">[Sales Invoice]</Link>
          <Link to="/staff/search" className="block px-4 py-2 rounded hover:bg-blue-800">[Customer Search]</Link>
          <Link to="/staff/reports" className="block px-4 py-2 rounded hover:bg-blue-800">[Customer Reports]</Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700">[Logout]</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
