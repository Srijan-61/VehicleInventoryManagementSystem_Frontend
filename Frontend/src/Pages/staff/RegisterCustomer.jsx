import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Shield, FileText, Calendar, Truck, Activity, Repeat } from 'lucide-react';
import { staffApi } from '../../api/staffApi';

const RegisterCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    setFieldErrors({});

    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      phoneNumber: form.phoneNumber.value,
      address: form.address.value,
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
      const response = await staffApi.registerCustomer(payload);
      toast.success(response.data?.message || 'Customer registered successfully! Credentials sent via email.');
      form.reset();
    } catch (error) {
      let errorMessage = 'Registration failed. Please check the fields.';
      let newFieldErrors = {};

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            // Business logic errors from backend (e.g. Email taken)
            errorMessage = errorData.errors[0];
            errorData.errors.forEach(err => {
              if (err.toLowerCase().includes('email')) newFieldErrors['email'] = err;
            });
          } else {
            // ASP.NET Core Validation errors
            Object.keys(errorData.errors).forEach(key => {
              newFieldErrors[key.toLowerCase()] = errorData.errors[key][0];
            });
            const firstErrorKey = Object.keys(errorData.errors)[0];
            errorMessage = errorData.errors[firstErrorKey][0];
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFieldErrors(newFieldErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "mt-1 block w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 transition-colors";
    const errorClass = "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50";
    const normalClass = "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
    
    return `${baseClass} ${fieldErrors[fieldName.toLowerCase()] ? errorClass : normalClass}`;
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const FieldError = ({ field }) => {
    const errorMsg = fieldErrors[field.toLowerCase()];
    if (!errorMsg) return null;
    return <p className="text-red-500 text-xs mt-1 font-medium">{errorMsg}</p>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <h1 className="text-2xl font-bold text-gray-800">Register Customer</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new customer and their vehicle. A secure password will be auto-generated and emailed to them.</p>
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
                <input required name="fullName" className={getInputClass('fullName')} />
                <FieldError field="fullName" />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input required type="email" name="email" className={getInputClass('email')} />
                <FieldError field="email" />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input required name="phoneNumber" className={getInputClass('phoneNumber')} />
                <FieldError field="phoneNumber" />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input required name="address" className={getInputClass('address')} />
                <FieldError field="address" />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    A secure password will be auto-generated and emailed to the customer upon registration.
                  </p>
                </div>
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
                <input required name="reg_Number" className={getInputClass('reg_Number')} />
                <FieldError field="reg_Number" />
              </div>
              <div>
                <label className={labelClass}>Make</label>
                <select required name="make" className={getInputClass('make')} defaultValue="">
                  <option value="" disabled>Select Make</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Nissan">Nissan</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Audi">Audi</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError field="make" />
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <input required name="model" className={getInputClass('model')} />
                <FieldError field="model" />
              </div>
              <div>
                <label className={labelClass}>Manufacture Year</label>
                <select required name="manufacture_Year" className={getInputClass('manufacture_Year')} defaultValue="">
                  <option value="" disabled>Select Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <FieldError field="manufacture_Year" />
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select required name="vehicle_Type" className={getInputClass('vehicle_Type')} defaultValue="">
                  <option value="" disabled>Select Type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError field="vehicle_Type" />
              </div>
              <div>
                <label className={labelClass}>Fuel Type</label>
                <select required name="fuel_Type" className={getInputClass('fuel_Type')} defaultValue="">
                  <option value="" disabled>Select Fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
                <FieldError field="fuel_Type" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Condition</label>
                <select required name="condition" className={getInputClass('condition')} defaultValue="">
                  <option value="" disabled>Select Condition</option>
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Repair">Needs Repair</option>
                </select>
                <FieldError field="condition" />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass}>Usage Pattern</label>
                <select required name="usage_Pattern" className={getInputClass('usage_Pattern')} defaultValue="">
                  <option value="" disabled>Select Usage</option>
                  <option value="Personal">Personal</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Daily Commute">Daily Commute</option>
                  <option value="Occasional">Occasional</option>
                </select>
                <FieldError field="usage_Pattern" />
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
