import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';

const AdminDashboard = () => {
  return (
    <div className="bg-background text-on-surface antialiased min-h-screen">
      {/* TopAppBar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 docked full-width top-0 z-40 fixed w-full">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tighter text-slate-900 dark:text-slate-50 uppercase">Inventory Management</span>
            <div className="hidden md:flex items-center gap-6">
              <h1 className="font-h2 text-h2 text-primary">Financial Reports</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-50 rounded-full" data-icon="notifications">notifications</span>
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-50 rounded-full" data-icon="settings">settings</span>
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-50 rounded-full" data-icon="account_circle">account_circle</span>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <AdminNav />

      {/* Main Content Area */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
