import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ title, links }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-md border-r border-gray-200">
        <div className="p-6 text-xl font-bold border-b border-gray-200 tracking-wider text-blue-600">
          {title}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link 
                key={idx} 
                to={link.to} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                {Icon && <Icon className="w-5 h-5" />}
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
