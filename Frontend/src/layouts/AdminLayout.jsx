import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">Admin Portal</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 rounded hover:bg-gray-800">[Dashboard]</Link>
          <Link to="/admin/reports" className="block px-4 py-2 rounded hover:bg-gray-800">[Financial Reports]</Link>
          <Link to="/admin/staff" className="block px-4 py-2 rounded hover:bg-gray-800">[Manage Staff]</Link>
          <Link to="/admin/parts" className="block px-4 py-2 rounded hover:bg-gray-800">[Manage Parts]</Link>
          <Link to="/admin/invoices" className="block px-4 py-2 rounded hover:bg-gray-800">[Purchase Invoices]</Link>
          <Link to="/admin/vendors" className="block px-4 py-2 rounded hover:bg-gray-800">[Manage Vendors]</Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700">[Logout]</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
