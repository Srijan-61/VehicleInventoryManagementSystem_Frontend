import React from 'react';
import Button from '../../components/common/Button';
import { Calendar, Wrench } from 'lucide-react';


const SelfService = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Self Service Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Request Maintenance</h2>
          <p className="text-gray-600 mb-4">Book a service appointment for your vehicle.</p>
          <Button className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Order Parts</h2>
          <p className="text-gray-600 mb-4">Browse and order spare parts for your car.</p>
          <Button className="flex items-center">
            <Wrench className="w-4 h-4 mr-2" /> Browse Parts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfService;
