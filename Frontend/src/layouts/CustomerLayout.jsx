import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">Customer Portal</div>
        <nav className="flex gap-6">
          <Link to="/customer" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/customer/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
          <Link to="/customer/history" className="text-gray-600 hover:text-blue-600">Order History</Link>
          <Link to="/customer/self-service" className="text-gray-600 hover:text-blue-600">Self Service</Link>
        </nav>
        <button className="px-4 py-2 text-sm text-red-600 font-medium border border-red-600 rounded hover:bg-red-50">[Logout]</button>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
