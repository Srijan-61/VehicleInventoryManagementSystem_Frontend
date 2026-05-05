import React from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Details</h1>
        <p className="text-sm text-gray-500">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">User Name</h3>
            <p className="text-sm text-gray-500">Customer</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Account Status
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Membership</span>
                <span className="text-blue-600 font-medium">Standard</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Verified</span>
                <span className="text-green-600 font-medium">Yes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Personal Information</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-gray-900 font-medium">customer@example.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-gray-900 font-medium">+977 9800000000</p>
                </div>
              </div>
              <div className="flex items-start gap-4 md:col-span-2">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Home Address</p>
                  <p className="text-gray-900 font-medium">Kathmandu, Nepal</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100">
              <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
