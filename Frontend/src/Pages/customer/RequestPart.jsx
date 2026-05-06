import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function RequestPart() {
  const { user } = useAuth();
  const customerId = user?.customerId || user?.id || "2";

  const [form, setForm] = useState({
    requested_Part_Name: '',
    requested_Quantity: ''
  });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/customer/part-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_ID: customerId,
          requested_Part_Name: form.requested_Part_Name,
          requested_Quantity: Number(form.requested_Quantity)
        })
      });

      if (response.ok) {
        setMsg('Part request submitted successfully!');
        setForm({ requested_Part_Name: '', requested_Quantity: '' });
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
      <h1 className="text-2xl font-bold mb-6">Request an Unavailable Part</h1>
      
      <div className="bg-white border rounded-2xl shadow-sm p-8 max-w-lg">
        <p className="text-gray-500 mb-6">Can't find a part in our inventory? Tell us what you need and we'll source it for you.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Part Name:</label>
            <input
              type="text"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. Brake Pads, Air Filter"
              required
              value={form.requested_Part_Name}
              onChange={(e) => setForm({ ...form, requested_Part_Name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Quantity Needed:</label>
            <input
              type="number"
              min="1"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. 2"
              required
              value={form.requested_Quantity}
              onChange={(e) => setForm({ ...form, requested_Quantity: e.target.value })}
            />
          </div>
          
          <button type="submit" className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors shadow-lg">
            Submit Part Request
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

export default RequestPart;
