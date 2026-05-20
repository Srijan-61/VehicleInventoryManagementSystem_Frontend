import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FileText, Users, Settings, ShoppingCart, Truck, 
  UserPlus, Monitor, Search, PieChart, Mail, 
  User, Wrench, AlertTriangle
} from 'lucide-react';

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './Pages/auth/Login';
import CustomerRegister from './Pages/auth/CustomerRegister';
import ForgotPassword from './Pages/auth/ForgotPassword';
import ResetPassword from './Pages/auth/ResetPassword';

// Admin Pages
import FinancialReports from './pages/admin/FinancialReports';
import ManageStaff from './pages/admin/ManageStaff';
import ManageParts from './pages/admin/ManageParts';
import AdminPartsManagement from './Pages/admin/AdminPartsManagement';
import PurchaseInvoices from './pages/admin/PurchaseInvoices';
import ManageVendors from './pages/admin/ManageVendors';
import StockAlerts from './pages/admin/StockAlerts';

// Staff Pages
import RegisterCustomer from './Pages/staff/RegisterCustomer';
import SalesInvoice from './Pages/staff/SalesInvoice';
import CustomerSearch from './Pages/staff/CustomerSearch';
import CustomerReports from './Pages/staff/CustomerReports';
import StaffCustomerReports from './Pages/staff/StaffCustomerReports';
import StaffInvoiceEmail from './Pages/staff/StaffInvoiceEmail';

// Customer Pages
import CustomerServices from './Pages/customer/CustomerServices';

function App() {
  const adminLinks = [
    { to: '/admin/reports', label: 'Financial Reports', icon: FileText },
    { to: '/admin/alerts', label: 'Stock Alerts', icon: AlertTriangle },
    { to: '/admin/invoices', label: 'Purchase Invoices/Restock', icon: ShoppingCart },
    { to: '/admin/parts-management', label: 'Parts Management', icon: Settings },
    { to: '/admin/vendors', label: 'Vendor Management', icon: Truck },
    { to: '/admin/staff', label: 'Register Staff', icon: Users }
  ];

  const staffLinks = [
    { to: '/staff/customer-reports', label: 'Customer Reports', icon: PieChart },
    { to: '/staff/register-customer', label: 'Register Customer', icon: UserPlus },
    { to: '/staff/search', label: 'Customer Search & Details', icon: Search },
    { to: '/staff/sales-invoice', label: 'Sales Invoice', icon: FileText },
    { to: '/staff/invoice-email', label: 'Send Invoice Email', icon: Mail }
  ];

  const customerLinks = [
    { to: '/customer/book-appointment', label: 'Book Appointment', icon: Wrench },
    { to: '/customer/request-part',     label: 'Request Part',     icon: ShoppingCart },
    { to: '/customer/leave-review',     label: 'Leave Review',     icon: Search },
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardLayout title="Admin Portal" links={adminLinks} />}>
            <Route index element={<Navigate to="/admin/reports" replace />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="alerts" element={<StockAlerts />} />
            <Route path="staff" element={<ManageStaff />} />
            <Route path="parts" element={<ManageParts />} />
            <Route path="parts-management" element={<AdminPartsManagement />} />
            <Route path="invoices" element={<PurchaseInvoices />} />
            <Route path="vendors" element={<ManageVendors />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={<DashboardLayout title="Staff Portal" links={staffLinks} />}>
            <Route index element={<Navigate to="/staff/register-customer" replace />} />
            <Route path="register-customer" element={<RegisterCustomer />} />
            <Route path="sales-invoice" element={<SalesInvoice />} />
            <Route path="search" element={<CustomerSearch />} />
            <Route path="reports" element={<CustomerReports />} />
            <Route path="customer-reports" element={<StaffCustomerReports />} />
            <Route path="invoice-email" element={<StaffInvoiceEmail />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<DashboardLayout title="Customer Portal" links={customerLinks} />}>
            <Route index element={<Navigate to="/customer/book-appointment" replace />} />
            <Route path="book-appointment" element={<CustomerServices defaultTab="appointment" />} />
            <Route path="request-part" element={<CustomerServices defaultTab="partRequest" />} />
            <Route path="leave-review" element={<CustomerServices defaultTab="review" />} />
          </Route>

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;