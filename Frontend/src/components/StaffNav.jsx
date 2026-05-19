import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Staff portal sidebar — fixed on the left side of every staff page.
// Renders navigation links from the navLinks array and handles logout.
const StaffNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Clear the stored JWT token and redirect back to the login page.
  // Uses toast instead of alert so the message matches the rest of the app.
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Add new staff pages here — they will automatically appear in the sidebar
  const navLinks = [
    { name: 'Overview', path: '/staff' },
    { name: 'Register Customer', path: '/staff/register-customer' },
    { name: 'Sales Invoice', path: '/staff/sales-invoice' },
    { name: 'Customer Search', path: '/staff/search' },
    { name: 'Customer Reports', path: '/staff/customer-reports' },
    { name: 'Send Invoice Email', path: '/staff/invoice-email' },
    { name: 'Approvals', path: '/staff/approvals' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Staff Panel</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            // True when the current URL matches this link's path — used to highlight the active link
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
