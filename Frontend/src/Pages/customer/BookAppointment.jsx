import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function BookAppointment() {
  const { user } = useAuth();
  const customerId = user?.customerId || user?.id || "2";

  const [form, setForm] = useState({
    vehicle_ID: '',
    appointment_Date: '',
    service_Type: ''
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/customer/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_ID: Number(customerId),
          vehicle_ID: Number(form.vehicle_ID),
          appointment_Date: new Date(form.appointment_Date).toISOString(),
          service_Type: form.service_Type
        })
      });

      if (response.ok) {
        setMsg('Appointment booked successfully!');
        setForm({ vehicle_ID: '', appointment_Date: '', service_Type: '' });
      } else {
        const errorText = await response.text();
        setMsg('Failed: ' + errorText);
      }
    } catch (error) {
      setMsg('Error: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Service Appointment</h1>
      
      <div className="bg-white border rounded-2xl shadow-sm p-8 max-w-lg">
        <p className="text-gray-500 mb-6">Schedule your vehicle for maintenance, checkup, or repairs.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Vehicle ID:</label>
            <input
              type="number"
              min="1"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your vehicle ID"
              required
              value={form.vehicle_ID}
              onChange={(e) => setForm({ ...form, vehicle_ID: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Preferred Date & Time:</label>
            <input
              type="datetime-local"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
              value={form.appointment_Date}
              onChange={(e) => setForm({ ...form, appointment_Date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Service Type:</label>
            <input
              type="text"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Full Service, Oil Change"
              required
              value={form.service_Type}
              onChange={(e) => setForm({ ...form, service_Type: e.target.value })}
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
            Confirm Appointment
          </button>
          
          {msg && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${msg.includes('Failed') || msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;
