import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Lock, FileText, Calendar, Truck, Activity, Repeat } from 'lucide-react';

const RegisterCustomer = () => {
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
      reg_Number: form.reg_Number.value,
      make: form.make.value,
      model: form.model.value,
      manufacture_Year: parseInt(form.manufacture_Year.value),
      vehicle_Type: form.vehicle_Type.value,
      fuel_Type: form.fuel_Type.value,
      condition: form.condition.value,
      usage_Pattern: form.usage_Pattern.value
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'https://localhost:7111/api/Staff/register-customer',
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
        toast.success(data?.message || 'Customer registered successfully!');
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
        <h1 className="text-2xl font-bold text-gray-800">Register Customer</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new customer and their vehicle details to the system.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required name="fullName" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input required type="email" name="email" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input required name="phoneNumber" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input required name="address" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Password</label>
                <input required type="password" name="password" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" /> Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Registration Number</label>
                <input required name="reg_Number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Make</label>
                <input required name="make" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <input required name="model" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Manufacture Year</label>
                <input required type="number" name="manufacture_Year" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <input required name="vehicle_Type" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fuel Type</label>
                <input required name="fuel_Type" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Condition</label>
                <input required name="condition" className={inputClass} />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Usage Pattern</label>
                <input required name="usage_Pattern" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 text-white font-semibold text-sm rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
            >
              'Complete Registration'
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCustomer;
