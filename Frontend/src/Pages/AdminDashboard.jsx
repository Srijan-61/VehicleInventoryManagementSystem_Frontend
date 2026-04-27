import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../components/AdminNav';

const AdminDashboard = () => {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <AdminNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">Welcome Admin</h1>
        </header>
        <main className="flex-1 p-8 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
