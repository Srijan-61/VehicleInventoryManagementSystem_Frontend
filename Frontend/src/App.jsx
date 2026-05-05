import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FileText, Users, Settings, ShoppingCart, Truck, 
  UserPlus, Monitor, Search, PieChart, Mail, 
  User, Wrench, Clock 
} from 'lucide-react';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import CustomerRegister from './pages/auth/CustomerRegister';

// Admin Pages
import FinancialReports from './pages/admin/FinancialReports';
import ManageStaff from './pages/admin/ManageStaff';
import ManageParts from './pages/admin/ManageParts';
import PurchaseInvoices from './pages/admin/PurchaseInvoices';
import ManageVendors from './pages/admin/ManageVendors';

// Staff Pages
import RegisterCustomer from './pages/staff/RegisterCustomer';
import POSInvoice from './pages/staff/POSInvoice';
import CustomerSearch from './pages/staff/CustomerSearch';
import CustomerReports from './pages/staff/CustomerReports';

// Customer Pages
import Profile from './pages/customer/Profile';
import SelfService from './pages/customer/SelfService';
import History from './pages/customer/History';

function App() {
  const adminLinks = [
    { to: '/admin/reports', label: 'Financial Reports', icon: FileText },
    { to: '/admin/staff', label: 'Register Staff', icon: Users },
    { to: '/admin/parts', label: 'Parts Management', icon: Settings },
    { to: '/admin/invoices', label: 'Purchase Invoices/Restock', icon: ShoppingCart },
    { to: '/admin/vendors', label: 'Vendor Management', icon: Truck }
  ];

  const staffLinks = [
    { to: '/staff/register-customer', label: 'Register Customer', icon: UserPlus },
    { to: '/staff/pos', label: 'Sales Invoices/POS', icon: Monitor },
    { to: '/staff/search', label: 'Customer Search & Details', icon: Search },
    { to: '/staff/reports', label: 'Customer Reports', icon: PieChart },
    { to: '/staff/email-invoice', label: 'Send Email Invoice', icon: Mail }
  ];

  const customerLinks = [
    { to: '/customer/profile', label: 'Profile Details', icon: User },
    { to: '/customer/self-service', label: 'Self-Service', icon: Wrench },
    { to: '/customer/history', label: 'Purchase History', icon: Clock }
  ];

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<CustomerRegister />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout title="Admin Portal" links={adminLinks} />}>
            <Route index element={<Navigate to="/admin/reports" replace />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="staff" element={<ManageStaff />} />
            <Route path="parts" element={<ManageParts />} />
            <Route path="invoices" element={<PurchaseInvoices />} />
            <Route path="vendors" element={<ManageVendors />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={<DashboardLayout title="Staff Portal" links={staffLinks} />}>
            <Route index element={<Navigate to="/staff/register-customer" replace />} />
            <Route path="register-customer" element={<RegisterCustomer />} />
            <Route path="pos" element={<POSInvoice />} />
            <Route path="search" element={<CustomerSearch />} />
            <Route path="reports" element={<CustomerReports />} />
            <Route path="email-invoice" element={<div>Send Email Invoice Page</div>} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<DashboardLayout title="Customer Portal" links={customerLinks} />}>
            <Route index element={<Navigate to="/customer/profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="self-service" element={<SelfService />} />
            <Route path="history" element={<History />} />
          </Route>

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
