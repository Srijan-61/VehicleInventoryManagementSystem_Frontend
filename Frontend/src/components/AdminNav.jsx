import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LayoutDashboard, UserPlus, Settings, LogOut } from 'lucide-react';

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Returns true if the current URL exactly matches the given path.
  // Used to highlight the active navigation link with a blue color and border.
  const isActive = (path) => location.pathname === path;

  // Remove the stored JWT token and send the admin back to the login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Add new admin pages here — they will automatically appear in the sidebar
  const navLinks = [
    { to: '/admin',                  label: 'Dashboard',         icon: LayoutDashboard },
    { to: '/admin/parts-management', label: 'Parts Management',  icon: Settings },
    { to: '/admin/register-staff',   label: 'Register Staff',    icon: UserPlus },
  ];

  return (
    <aside className="h-screen w-64 border-r border-slate-200 fixed left-0 top-0 pt-16 bg-slate-50 z-30 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="text-blue-700 font-black uppercase text-xs tracking-widest">System Admin</div>
        <div className="text-slate-500 text-[10px] font-bold uppercase mt-1">Enterprise Control</div>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out ${
              isActive(to)
                ? 'bg-white text-blue-700 border-r-2 border-blue-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-inter text-xs font-bold uppercase tracking-wider">{label}</span>
          </Link>
        ))}
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
