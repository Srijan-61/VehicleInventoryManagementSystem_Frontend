import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import apiClient from '../../api/apiClient';

const StaffRegistration = () => {
  // Field names must match RegisterStaffDto (camelCase) from the backend
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', address: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // POST /api/Admin/register-staff → proxied to https://localhost:7259
      await apiClient.post('/Admin/register-staff', formData);
      toast.success('Staff registered successfully.');
      setFormData({ fullName: '', email: '', phoneNumber: '', password: '', address: '' });
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.message || 'Failed to register staff.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2 bg-bgcolor border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <UserPlus className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Register Staff</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">Full Name</label><input id="fullName" className={inputCls} value={formData.fullName} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label><input id="email" type="email" className={inputCls} value={formData.email} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phoneNumber">Phone Number</label><input id="phoneNumber" className={inputCls} value={formData.phoneNumber} onChange={handleChange} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label><input id="password" type="password" className={inputCls} value={formData.password} onChange={handleChange} required /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">Address</label><input id="address" className={inputCls} value={formData.address} onChange={handleChange} required /></div>
          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Register Staff'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRegistration;
