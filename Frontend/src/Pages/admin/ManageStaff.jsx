import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Lock } from 'lucide-react';

const ManageStaff = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);

    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      phoneNumber: form.phoneNumber.value,
      address: form.address.value,
      password: form.password.value,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'https://localhost:7111/api/Admin/register-staff',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json().catch(() => null);
        toast.success(data?.message || 'Staff registered successfully!');
        form.reset();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <h1 className="text-2xl font-bold text-gray-800">
          Register Staff
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new staff member to the system.
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Staff Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="fullName"
                    className={`${inputClass} pl-10`}
                  />
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    name="email"
                    className={`${inputClass} pl-10`}
                  />
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="phoneNumber"
                    className={`${inputClass} pl-10`}
                  />
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="address"
                    className={`${inputClass} pl-10`}
                  />
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    required
                    type="password"
                    name="password"
                    className={`${inputClass} pl-10`}
                  />
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 text-white font-semibold text-sm rounded-lg transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? 'Registering...' : 'Register Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageStaff;
