import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Password: '',
    Address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/Admin/register-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Staff registered successfully.');
        setFormData({ FullName: '', Email: '', PhoneNumber: '', Password: '', Address: '' });
      } else {
        const data = await response.json();
        toast.error(data.Message || data.message || 'Failed to register staff.');
      }
    } catch (err) {
      toast.error('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2 bg-bgcolor border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <UserPlus className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Register Staff</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="FullName">Full Name</label>
              <input id="FullName" className={inputClass} value={formData.FullName} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="Email">Email</label>
              <input id="Email" type="email" className={inputClass} value={formData.Email} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="PhoneNumber">Phone Number</label>
              <input id="PhoneNumber" className={inputClass} value={formData.PhoneNumber} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="Password">Password</label>
              <input id="Password" type="password" className={inputClass} value={formData.Password} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="Address">Address</label>
            <input id="Address" className={inputClass} value={formData.Address} onChange={handleChange} required />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Register Staff'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffRegistration;
