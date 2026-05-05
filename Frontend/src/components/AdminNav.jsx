import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm h-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          to="/admin" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        <Link 
          to="/admin/register-staff" 
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin/register-staff') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
        >
          <UserPlus className="h-5 w-5" />
          Staff Registration
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg transition-colors text-red-600 hover:bg-red-50 font-medium"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
