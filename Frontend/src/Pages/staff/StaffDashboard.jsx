import React from 'react';
import { Outlet } from 'react-router-dom';
import StaffNav from '../components/StaffNav';

const StaffDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <StaffNav />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome, Staff</h1>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
