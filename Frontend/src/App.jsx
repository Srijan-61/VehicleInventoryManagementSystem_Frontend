 sarwogya
import CustomerDetails from "./pages/Staff/CustomerDetails";

function App() {
  return <CustomerDetails />;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import StaffRegistration from './pages/staff/StaffRegistration';
import AdminPartsPage from './pages/admin/AdminPartsPage';
import CustomerSelfServicePage from './pages/customer/CustomerSelfServicePage';
import CustomerPortalPage from './pages/customer/CustomerPortalPage';
import SalesInvoicePage from './pages/admin/SalesInvoicePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {/* Public customer portal — no login required */}
        <Route path="/customer" element={<CustomerPortalPage />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="register-staff" element={<StaffRegistration />} />
          <Route path="parts" element={<AdminPartsPage />} />
          <Route path="customer-service" element={<CustomerSelfServicePage />} />
          <Route path="sales-invoice" element={<SalesInvoicePage />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </BrowserRouter>
  );
 main
}

export default App;