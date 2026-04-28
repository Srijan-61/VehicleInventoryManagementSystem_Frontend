import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const StaffNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', path: '/staff' },
    { name: 'Register Customer', path: '/staff/register-customer' },
    { name: 'Create Invoice', path: '/staff/create-invoice' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Staff Panel</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname === link.path + '/';
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`block px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default StaffNav;
