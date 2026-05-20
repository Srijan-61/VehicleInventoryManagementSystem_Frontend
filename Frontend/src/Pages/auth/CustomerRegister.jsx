import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Car, Plus, X } from 'lucide-react';
import { customerApi } from '../../api/customerApi';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    vehicles: [{ vehicleNumber: '', make: '', model: '', year: '', color: '' }]
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...formData.vehicles];
    updatedVehicles[index][field] = value;
    setFormData({ ...formData, vehicles: updatedVehicles });
  };

  const addVehicle = () => {
    setFormData({
      ...formData,
      vehicles: [...formData.vehicles, { vehicleNumber: '', make: '', model: '', year: '', color: '' }]
    });
  };

  const removeVehicle = (index) => {
    if (formData.vehicles.length === 1) return;
    const updatedVehicles = formData.vehicles.filter((_, i) => i !== index);
    setFormData({ ...formData, vehicles: updatedVehicles });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        vehicles: formData.vehicles.filter(v => v.vehicleNumber)
      };

      // Using customerApi.register instead of direct fetch
      const response = await customerApi.register(payload);
      
      toast.success(response.data?.message || 'Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title || 
                          error.message || 
                          'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 xl:p-24 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-3 text-sm lg:text-base">Join our vehicle inventory system.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Phone Number"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Address"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm Password"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicles Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-500" />
                  Vehicles (Optional)
                </label>
                <button
                  type="button"
                  onClick={addVehicle}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Vehicle
                </button>
              </div>

              {formData.vehicles.map((vehicle, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 mb-3 relative">
                  {formData.vehicles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVehicle(index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Vehicle Number</label>
                      <input
                        type="text"
                        value={vehicle.vehicleNumber}
                        onChange={(e) => handleVehicleChange(index, 'vehicleNumber', e.target.value)}
                        placeholder="e.g., BA 01 KHA 1234"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Make</label>
                      <input
                        type="text"
                        value={vehicle.make}
                        onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                        placeholder="e.g., Toyota, Honda"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Model</label>
                      <input
                        type="text"
                        value={vehicle.model}
                        onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                        placeholder="e.g., Camry, Civic"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Year</label>
                      <input
                        type="number"
                        value={vehicle.year}
                        onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                        placeholder="e.g., 2020"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-grid-slate-200/[0.04] bg-[size:32px_32px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-indigo-50/50 mix-blend-multiply"></div>
        <div className="absolute top-[10%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-400/20 blur-[120px]"></div>
        
        <div className="relative z-10 w-full max-w-lg p-12">
          <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl p-8 relative">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl rotate-12 opacity-80 blur-[2px]"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full opacity-80 blur-[2px]"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-xl mb-6 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Join Our Community</h3>
              <p className="text-slate-600 leading-relaxed">
                Create an account to manage your vehicles, schedule appointments, and access your service history securely.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-1/2 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-5/6 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;