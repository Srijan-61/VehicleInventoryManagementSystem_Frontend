import React, { useState } from 'react';
import { CalendarCheck, Package, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { bookAppointment, requestPart, submitReview } from '../../api/customerSelfServiceApi';
import LoadingButton from '../../components/LoadingButton';

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-bgcolor focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

const SectionCard = ({ icon: Icon, title, iconColor, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 ${iconColor}`}>
      <Icon className="h-5 w-5" /><h3 className="text-base font-semibold">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const CustomerSelfServicePage = () => {
  const [apptForm, setApptForm] = useState({ customer_ID: '', vehicle_ID: '', appointment_Date: '', service_Type: '' });
  const [apptLoading, setApptLoading] = useState(false);
  const handleApptChange = (e) => setApptForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleApptSubmit = async (e) => {
    e.preventDefault(); setApptLoading(true);
    try {
      await bookAppointment({ customer_ID: Number(apptForm.customer_ID), vehicle_ID: Number(apptForm.vehicle_ID), appointment_Date: new Date(apptForm.appointment_Date).toISOString(), service_Type: apptForm.service_Type });
      toast.success('Appointment booked successfully!');
      setApptForm({ customer_ID: '', vehicle_ID: '', appointment_Date: '', service_Type: '' });
    } catch (err) { toast.error(err.message || 'Failed to book appointment.'); }
    finally { setApptLoading(false); }
  };

  const [partForm, setPartForm] = useState({ customer_ID: '', requested_Part_Name: '', requested_Quantity: '' });
  const [partLoading, setPartLoading] = useState(false);
  const handlePartChange = (e) => setPartForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePartSubmit = async (e) => {
    e.preventDefault(); setPartLoading(true);
    try {
      await requestPart({ customer_ID: Number(partForm.customer_ID), requested_Part_Name: partForm.requested_Part_Name, requested_Quantity: Number(partForm.requested_Quantity) });
      toast.success('Part request submitted!');
      setPartForm({ customer_ID: '', requested_Part_Name: '', requested_Quantity: '' });
    } catch (err) { toast.error(err.message || 'Failed to submit part request.'); }
    finally { setPartLoading(false); }
  };

  const [reviewForm, setReviewForm] = useState({ customer_ID: '', appointment_ID: '', rating: '5', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const handleReviewChange = (e) => setReviewForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleReviewSubmit = async (e) => {
    e.preventDefault(); setReviewLoading(true);
    try {
      await submitReview({ customer_ID: Number(reviewForm.customer_ID), appointment_ID: Number(reviewForm.appointment_ID), rating: Number(reviewForm.rating), comment: reviewForm.comment });
      toast.success('Review submitted — thank you!');
      setReviewForm({ customer_ID: '', appointment_ID: '', rating: '5', comment: '' });
    } catch (err) { toast.error(err.message || 'Failed to submit review.'); }
    finally { setReviewLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customer Self Service</h2>
        <p className="text-sm text-gray-500 mt-1">Book appointments, request unavailable parts, or leave a service review.</p>
      </div>

      <SectionCard icon={CalendarCheck} title="Book an Appointment" iconColor="text-blue-700">
        <form onSubmit={handleApptSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Customer ID</label><input type="number" min="1" className={inputCls} name="customer_ID" value={apptForm.customer_ID} onChange={handleApptChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Vehicle ID</label><input type="number" min="1" className={inputCls} name="vehicle_ID" value={apptForm.vehicle_ID} onChange={handleApptChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Appointment Date & Time</label><input type="datetime-local" className={inputCls} name="appointment_Date" value={apptForm.appointment_Date} onChange={handleApptChange} required /></div>
            <div><label className={labelCls}>Service Type</label><input className={inputCls} name="service_Type" value={apptForm.service_Type} onChange={handleApptChange} placeholder="e.g. Engine Checkup" required /></div>
          </div>
          <LoadingButton type="submit" isLoading={apptLoading} className="w-full bg-primary hover:bg-primary-hover text-white text-sm">Book Appointment</LoadingButton>
        </form>
      </SectionCard>

      <SectionCard icon={Package} title="Request an Unavailable Part" iconColor="text-amber-700">
        <form onSubmit={handlePartSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>Customer ID</label><input type="number" min="1" className={inputCls} name="customer_ID" value={partForm.customer_ID} onChange={handlePartChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Part Name</label><input className={inputCls} name="requested_Part_Name" value={partForm.requested_Part_Name} onChange={handlePartChange} placeholder="e.g. Toyota Brake Pad" required /></div>
            <div><label className={labelCls}>Quantity Needed</label><input type="number" min="1" className={inputCls} name="requested_Quantity" value={partForm.requested_Quantity} onChange={handlePartChange} placeholder="e.g. 2" required /></div>
          </div>
          <LoadingButton type="submit" isLoading={partLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm">Submit Part Request</LoadingButton>
        </form>
      </SectionCard>

      <SectionCard icon={Star} title="Leave a Service Review" iconColor="text-green-700">
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelCls}>Customer ID</label><input type="number" min="1" className={inputCls} name="customer_ID" value={reviewForm.customer_ID} onChange={handleReviewChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Appointment ID</label><input type="number" min="1" className={inputCls} name="appointment_ID" value={reviewForm.appointment_ID} onChange={handleReviewChange} placeholder="e.g. 1" required /></div>
            <div><label className={labelCls}>Rating</label>
              <select className={inputCls} name="rating" value={reviewForm.rating} onChange={handleReviewChange}>
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                <option value="4">⭐⭐⭐⭐ Good (4)</option>
                <option value="3">⭐⭐⭐ Average (3)</option>
                <option value="2">⭐⭐ Poor (2)</option>
                <option value="1">⭐ Very Poor (1)</option>
              </select>
            </div>
          </div>
          <div><label className={labelCls}>Comment</label><textarea rows={3} className={inputCls} name="comment" value={reviewForm.comment} onChange={handleReviewChange} placeholder="Share your experience with us…" required /></div>
          <LoadingButton type="submit" isLoading={reviewLoading} className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">Submit Review</LoadingButton>
        </form>
      </SectionCard>
    </div>
  );
};

export default CustomerSelfServicePage;
