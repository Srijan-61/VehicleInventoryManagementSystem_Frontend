import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Package, Star, Car, ArrowRight, CheckCircle, ChevronLeft, Wrench, Clock, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { bookAppointment, requestPart, submitReview } from '../../api/customerSelfServiceApi';
import LoadingButton from '../../components/LoadingButton';

// ── shared field styles ────────────────────────────────────────────────────
const field = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100';
const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

// ── service card data ──────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'appointment',
    icon: CalendarCheck,
    title: 'Book a Service Appointment',
    desc: 'Schedule your vehicle for a checkup, repair, or routine maintenance.',
    accent: 'blue',
    badge: 'Most Popular',
  },
  {
    id: 'part',
    icon: Package,
    title: 'Request an Unavailable Part',
    desc: "Can't find the part you need? Submit a request and we'll source it for you.",
    accent: 'violet',
    badge: null,
  },
  {
    id: 'review',
    icon: Star,
    title: 'Leave a Service Review',
    desc: 'Help us improve by sharing your feedback on a completed appointment.',
    accent: 'amber',
    badge: null,
  },
];

const accentMap = {
  blue:   { card: 'hover:border-blue-400',   icon: 'bg-blue-50 text-blue-600',   btn: 'bg-blue-600 hover:bg-blue-700',   ring: 'focus:ring-blue-100 focus:border-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  violet: { card: 'hover:border-violet-400', icon: 'bg-violet-50 text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700', ring: 'focus:ring-violet-100 focus:border-violet-500', badge: 'bg-violet-100 text-violet-700' },
  amber:  { card: 'hover:border-amber-400',  icon: 'bg-amber-50 text-amber-600',  btn: 'bg-amber-500 hover:bg-amber-600',  ring: 'focus:ring-amber-100 focus:border-amber-500',  badge: 'bg-amber-100 text-amber-700' },
};

// ── star-rating component ──────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button type="button" key={n} onClick={() => onChange(n)}
        className={`text-2xl transition-transform hover:scale-110 ${n <= value ? 'text-amber-400' : 'text-gray-200'}`}>
        ★
      </button>
    ))}
    <span className="ml-2 self-center text-sm text-gray-500">{value} / 5</span>
  </div>
);

// ── AppointmentForm ────────────────────────────────────────────────────────
const AppointmentForm = ({ onBack }) => {
  const [form, setForm] = useState({ customer_ID: '', vehicle_ID: '', appointment_Date: '', service_Type: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await bookAppointment({
        customer_ID: Number(form.customer_ID),
        vehicle_ID: Number(form.vehicle_ID),
        appointment_Date: new Date(form.appointment_Date).toISOString(),
        service_Type: form.service_Type,
      });
      setDone(true);
      toast.success('Appointment booked!');
    } catch (err) { toast.error(err.message || 'Failed to book appointment.'); }
    finally { setLoading(false); }
  };

  if (done) return <SuccessCard message="Your appointment has been booked!" detail="We'll contact you to confirm the time." onBack={() => { setDone(false); onBack(); }} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Customer ID</label>
          <input type="number" min="1" name="customer_ID" className={field} placeholder="e.g. 1" value={form.customer_ID} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Vehicle ID</label>
          <input type="number" min="1" name="vehicle_ID" className={field} placeholder="e.g. 1" value={form.vehicle_ID} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Preferred Date & Time</label>
          <input type="datetime-local" name="appointment_Date" className={field} value={form.appointment_Date} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Service Type</label>
          <input name="service_Type" className={field} placeholder="e.g. Engine Checkup" value={form.service_Type} onChange={onChange} required />
        </div>
      </div>
      <LoadingButton type="submit" isLoading={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold">
        Confirm Appointment
      </LoadingButton>
    </form>
  );
};

// ── PartRequestForm ────────────────────────────────────────────────────────
const PartRequestForm = ({ onBack }) => {
  const [form, setForm] = useState({ customer_ID: '', requested_Part_Name: '', requested_Quantity: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await requestPart({
        customer_ID: Number(form.customer_ID),
        requested_Part_Name: form.requested_Part_Name,
        requested_Quantity: Number(form.requested_Quantity),
      });
      setDone(true);
      toast.success('Part request submitted!');
    } catch (err) { toast.error(err.message || 'Failed to submit request.'); }
    finally { setLoading(false); }
  };

  if (done) return <SuccessCard message="Part request received!" detail="Our team will source the part and get back to you." onBack={() => { setDone(false); onBack(); }} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
        Can't find a part in stock? Tell us what you need and we'll procure it.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={label}>Customer ID</label>
          <input type="number" min="1" name="customer_ID" className={field} placeholder="e.g. 1" value={form.customer_ID} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Part Name</label>
          <input name="requested_Part_Name" className={field} placeholder="e.g. Toyota Brake Pad" value={form.requested_Part_Name} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Quantity Needed</label>
          <input type="number" min="1" name="requested_Quantity" className={field} placeholder="e.g. 2" value={form.requested_Quantity} onChange={onChange} required />
        </div>
      </div>
      <LoadingButton type="submit" isLoading={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-semibold">
        Submit Part Request
      </LoadingButton>
    </form>
  );
};

// ── ReviewForm ─────────────────────────────────────────────────────────────
const ReviewForm = ({ onBack }) => {
  const [form, setForm] = useState({ customer_ID: '', appointment_ID: '', rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await submitReview({
        customer_ID: Number(form.customer_ID),
        appointment_ID: Number(form.appointment_ID),
        rating: Number(form.rating),
        comment: form.comment,
      });
      setDone(true);
      toast.success('Thank you for your review!');
    } catch (err) { toast.error(err.message || 'Failed to submit review.'); }
    finally { setLoading(false); }
  };

  if (done) return <SuccessCard message="Review submitted — thank you!" detail="Your feedback helps us serve you better." onBack={() => { setDone(false); onBack(); }} />;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Customer ID</label>
          <input type="number" min="1" name="customer_ID" className={field} placeholder="e.g. 1" value={form.customer_ID} onChange={onChange} required />
        </div>
        <div>
          <label className={label}>Appointment ID</label>
          <input type="number" min="1" name="appointment_ID" className={field} placeholder="e.g. 1" value={form.appointment_ID} onChange={onChange} required />
        </div>
      </div>
      <div>
        <label className={label}>Your Rating</label>
        <StarRating value={form.rating} onChange={(v) => setForm(p => ({ ...p, rating: v }))} />
      </div>
      <div>
        <label className={label}>Comment</label>
        <textarea rows={4} name="comment" className={field} placeholder="Share your experience with us…" value={form.comment} onChange={onChange} required />
      </div>
      <LoadingButton type="submit" isLoading={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 text-sm font-semibold">
        Submit Review
      </LoadingButton>
    </form>
  );
};

// ── Success state ──────────────────────────────────────────────────────────
const SuccessCard = ({ message, detail, onBack }) => (
  <div className="flex flex-col items-center py-8 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <CheckCircle className="h-8 w-8 text-green-600" />
    </div>
    <h3 className="text-lg font-bold text-gray-800">{message}</h3>
    <p className="mt-1 text-sm text-gray-500">{detail}</p>
    <button onClick={onBack} className="mt-6 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
      <ChevronLeft className="h-4 w-4" /> Back to services
    </button>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────
const CustomerPortalPage = () => {
  const [active, setActive] = useState(null);

  const activeService = SERVICES.find(s => s.id === active);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-none">VehicleIMS</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Customer Self Service</p>
            </div>
          </div>
          <Link to="/login"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
            Staff Login <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-5 pb-16 pt-14 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-sm">
            <Wrench className="h-3.5 w-3.5" /> Vehicle Inventory Management System
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How can we help you today?
          </h1>
          <p className="mt-3 text-base text-blue-100/80">
            Book a service, request a part, or share your experience — all in one place.
          </p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 px-5 py-3">
          {[
            { icon: Clock,  text: 'Quick Booking' },
            { icon: Shield, text: 'Trusted Service' },
            { icon: Star,   text: 'Top-Rated Technicians' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Icon className="h-3.5 w-3.5 text-blue-500" /> {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      <main className="mx-auto max-w-5xl px-5 py-10">
        {!active ? (
          <>
            <p className="mb-6 text-center text-sm font-medium text-gray-500">Choose a service to get started</p>
            <div className="grid gap-5 sm:grid-cols-3">
              {SERVICES.map(({ id, icon: Icon, title, desc, accent, badge }) => {
                const a = accentMap[accent];
                return (
                  <button key={id} onClick={() => setActive(id)} className={`group relative flex flex-col items-start rounded-2xl border-2 border-gray-100 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:shadow-md ${a.card}`}>
                    {badge && (
                      <span className={`mb-3 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.badge}`}>{badge}</span>
                    )}
                    {!badge && <span className="mb-3 h-5 block" />}
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${a.icon}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 leading-snug">{title}</h3>
                    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{desc}</p>
                    <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gray-400 transition-colors group-hover:text-gray-600">
                      Get Started <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-2xl">
            <button onClick={() => setActive(null)} className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back to services
            </button>
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accentMap[activeService.accent].icon}`}>
                  <activeService.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">{activeService.title}</h2>
                  <p className="text-xs text-gray-400">{activeService.desc}</p>
                </div>
              </div>
              <div className="h-px bg-gray-100 mb-6" />
              {active === 'appointment' && <AppointmentForm onBack={() => setActive(null)} />}
              {active === 'part'        && <PartRequestForm  onBack={() => setActive(null)} />}
              {active === 'review'      && <ReviewForm       onBack={() => setActive(null)} />}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Vehicle Inventory Management System
      </footer>
    </div>
  );
};

export default CustomerPortalPage;
