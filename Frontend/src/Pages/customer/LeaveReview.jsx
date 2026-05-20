import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Lets a logged-in customer submit a star rating and written comment
// for a completed service appointment.
function LeaveReview() {
  const { user } = useAuth();
  // Resolve the customer ID from whichever key the JWT payload uses
  const customerId = user?.customerId || user?.id || "2";

  // Form fields: which appointment to review, the star rating, and a comment
  const [form, setForm] = useState({
    appointment_ID: '',
    rating: '5',
    comment: ''
  });
  // Feedback message shown below the form after submit (success or error)
  const [msg, setMsg] = useState('');

  // POST the review to the backend when the form is submitted.
  // Clears any previous feedback message first, then shows the result.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      // Read the JWT from localStorage — set during login
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/customer/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_ID: customerId,
          appointment_ID: Number(form.appointment_ID),
          rating: Number(form.rating),
          comment: form.comment
        })
      });

      if (response.ok) {
        setMsg('Thank you for your feedback! Review submitted.');
        // Reset form so the customer can submit another review if needed
        setForm({ appointment_ID: '', rating: '5', comment: '' });
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
      <h1 className="text-2xl font-bold mb-6">Leave a Service Review</h1>
      
      <div className="bg-white border rounded-2xl shadow-sm p-8 max-w-lg">
        <p className="text-gray-500 mb-6">How was your recent service? Help us improve by sharing your experience.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Appointment ID:</label>
            <input
              type="number"
              min="1"
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="e.g. 101"
              required
              value={form.appointment_ID}
              onChange={(e) => setForm({ ...form, appointment_ID: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Rating (1 to 5):</label>
            <select
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              required
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Your Comment:</label>
            <textarea
              rows={4}
              className="border w-full p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Tell us what you liked or how we can improve..."
              required
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          
          <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors shadow-lg">
            Submit Review
          </button>
          
          {/* Red banner for errors, green for success */}
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

export default LeaveReview;