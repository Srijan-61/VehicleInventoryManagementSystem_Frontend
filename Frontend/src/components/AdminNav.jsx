import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LayoutDashboard, UserPlus, LogOut } from 'lucide-react';

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
    <aside className="h-screen w-64 border-r border-slate-200 fixed left-0 top-0 pt-16 bg-slate-50 z-30 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="text-blue-700 font-black uppercase text-xs tracking-widest">System Admin</div>
        <div className="text-slate-500 text-[10px] font-bold uppercase mt-1">Enterprise Control</div>
      </div>
      
      <nav className="flex flex-col gap-1 p-4 flex-1">
        <Link 
          to="/admin" 
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out ${isActive('/admin') ? 'bg-white text-blue-700 border-r-2 border-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-inter text-xs font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
        <Link 
          to="/admin/register-staff" 
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out ${isActive('/admin/register-staff') ? 'bg-white text-blue-700 border-r-2 border-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-inter text-xs font-bold uppercase tracking-wider">Register Staff</span>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 ease-in-out rounded"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-inter text-xs font-bold uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNav;
