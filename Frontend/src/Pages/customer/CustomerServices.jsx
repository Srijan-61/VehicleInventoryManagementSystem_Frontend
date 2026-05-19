import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Calendar, Package, Star, RefreshCw } from 'lucide-react';
import { customerApi } from '../../api/customerApi';

// ─── Endpoint paths — update only these constants if the API routes ever change ─
const ENDPOINTS = {
  vehicles:              '/customer/vehicles',
  appointments:          '/customer/appointments',
  cancelAppointment:     (id) => `/customer/appointments/${id}/cancel`,
  partRequests:          '/customer/part-requests',
  completedAppointments: '/customer/appointments/completed',
  reviews:               '/customer/reviews',
};

// ─── Tab metadata — drives the page header for each section ─────────────────
const TAB_META = {
  appointment: { title: 'Book Appointment', description: 'Book a new service appointment or manage your existing ones.', icon: Calendar },
  partRequest: { title: 'Request Part',     description: 'Request an unavailable part for your vehicle.',                icon: Package  },
  review:      { title: 'Review Service',   description: 'Leave a review for a completed service appointment.',          icon: Star     },
};

// ─── Service type options for the appointment form ────────────────────────────
// Add or remove entries here to change what the customer can select.
const SERVICE_TYPES = [
  'Oil Change',
  'Tyre Replacement',
  'Battery Replacement',
  'Brake Service',
  'AC Service',
  'Full Service',
  'Engine Checkup',
  'Wheel Alignment',
  'Other',
];

// ─── Initial (empty) values for every form ───────────────────────────────────
const INIT_APPT = {
  vehicle_ID:          '',
  service_Type:        '',
  preferred_Date:      '',
  preferred_Time:      '',
  problem_Description: '',
  notes:               '',
};

const INIT_PART = {
  part_Name: '',
  brand:     '',
  category:  '',
  quantity:  '',
  reason:    '',
  urgency:   'Medium',
};

const INIT_REVIEW = {
  appointment_ID: '',
  rating:         0,   // 0 = nothing selected yet; valid range is 1–5
  comment:        '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pull the most useful error message from an Axios error.
// Checks backend response body first, then the JS error message, then the fallback.
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg  = data?.message || data?.Message || data || err?.message || fallback;
  return typeof msg === 'string' ? msg : fallback;
};

// Format an ISO date string to a readable short date, e.g. "May 18, 2026"
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// Format an ISO datetime to include the time, e.g. "May 18, 2026, 10:30 AM"
const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Today's date as YYYY-MM-DD — used as the min= value on the date input
// so the browser blocks past dates at the UI level.
const TODAY = new Date().toISOString().split('T')[0];

// Normalise the response data from either a plain array or a { data: [] } wrapper
const extractRows = (res) =>
  Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

// ─── Shared Tailwind class strings ────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm ' +
  'focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
  'disabled:opacity-60';

const labelCls  = 'block text-xs font-semibold text-gray-600 mb-1';
const selectCls = inputCls + ' cursor-pointer';

// ─── Status badge ─────────────────────────────────────────────────────────────
// Returns a colored pill that matches the appointment / request status.
const StatusBadge = ({ status }) => {
  const colorMap = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100   text-blue-700',
    Completed: 'bg-green-100  text-green-700',
    Cancelled: 'bg-gray-100   text-gray-500',
    Approved:  'bg-green-100  text-green-700',
    Rejected:  'bg-red-100    text-red-700',
    Purchased: 'bg-teal-100   text-teal-700',
  };
  const cls = colorMap[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {status || '—'}
    </span>
  );
};

// ─── Urgency badge ────────────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }) => {
  const colorMap = {
    Low:    'bg-gray-100   text-gray-600',
    Medium: 'bg-yellow-100 text-yellow-700',
    High:   'bg-red-100    text-red-700',
  };
  const cls = colorMap[urgency] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {urgency || '—'}
    </span>
  );
};

// ─── Star rating picker ───────────────────────────────────────────────────────
// Renders 5 clickable stars. Filled (gold) up to the selected value.
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? 's' : ''}`}
        className={`text-2xl leading-none transition-colors ${
          n <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─── Empty table state ────────────────────────────────────────────────────────
// Spans all columns and shows a centered message when there is no data.
const EmptyRow = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} className="py-10 text-center text-sm text-gray-400">
      {message}
    </td>
  </tr>
);

// ─── Loading row ──────────────────────────────────────────────────────────────
const LoadingPane = () => (
  <div className="flex items-center justify-center py-12 text-gray-400">
    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
    <span className="text-sm">Loading…</span>
  </div>
);

// ─── Submit button ────────────────────────────────────────────────────────────
// Reused across all three forms — shows a spinner when submitting.
const SubmitButton = ({ loading, disabled, icon: Icon, idleLabel, loadingLabel }) => (
  <button
    type="submit"
    disabled={disabled || loading}
    className="w-full flex items-center justify-center gap-2 py-2.5
      bg-blue-600 text-white text-sm font-semibold rounded-lg
      hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
      transition-colors"
  >
    {loading
      ? <RefreshCw className="w-4 h-4 animate-spin" />
      : <Icon className="w-4 h-4" />
    }
    {loading ? loadingLabel : idleLabel}
  </button>
);

// ─── Section header (inside a card) ──────────────────────────────────────────
const CardHeader = ({ icon: Icon, title, count }) => (
  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-blue-500" />
      {title}
    </p>
    {count !== undefined && (
      <span className="text-xs text-gray-400">{count} total</span>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const CustomerServices = ({ defaultTab = 'appointment' }) => {

  // ── Active tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab when the user navigates to a different sidebar link.
  // useState(defaultTab) only runs on first mount; this effect handles prop changes.
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // ── Appointment tab state ───────────────────────────────────────────────────
  const [vehicles,       setVehicles]       = useState([]);  // customer's registered vehicles
  const [apptForm,       setApptForm]       = useState(INIT_APPT);
  const [appointments,   setAppointments]   = useState([]);  // customer's full appointment history
  const [apptLoading,    setApptLoading]    = useState(false);
  const [submittingAppt, setSubmittingAppt] = useState(false);
  const [cancellingId,   setCancellingId]   = useState(null); // ID of the appt currently being cancelled

  // ── Part request tab state ──────────────────────────────────────────────────
  const [partForm,        setPartForm]        = useState(INIT_PART);
  const [partRequests,    setPartRequests]    = useState([]);
  const [partLoading,     setPartLoading]     = useState(false);
  const [submittingPart,  setSubmittingPart]  = useState(false);

  // ── Review tab state ────────────────────────────────────────────────────────
  const [reviewForm,       setReviewForm]       = useState(INIT_REVIEW);
  const [completedAppts,   setCompletedAppts]   = useState([]); // appointments with Completed status
  const [reviews,          setReviews]          = useState([]); // reviews already left by this customer
  const [reviewLoading,    setReviewLoading]    = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // ── Reviewable appointments ─────────────────────────────────────────────────
  // Filters out completed appointments that the customer already reviewed.
  // useMemo ensures this only recalculates when the underlying data changes.
  const reviewableAppts = useMemo(() => {
    // Build a set of already-reviewed appointment IDs for an O(1) lookup
    const reviewedIds = new Set(
      reviews.map((r) => r.appointment_ID || r.appointmentId)
    );
    return completedAppts.filter(
      (a) => !reviewedIds.has(a.appointment_ID || a.appointmentId)
    );
  }, [completedAppts, reviews]);

  // ── Data fetchers ───────────────────────────────────────────────────────────

  // Load vehicles and appointments for the booking tab.
  // Uses Promise.all so both requests fire simultaneously (faster than sequential).
  const loadAppointmentTab = async () => {
    setApptLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        customerApi.getVehicles(),
        customerApi.getAppointments(),
      ]);
      setVehicles(extractRows(vRes));
      setAppointments(extractRows(aRes));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load appointment data.'));
    } finally {
      setApptLoading(false);
    }
  };

  // Refresh only the appointments list (called after booking or cancellation).
  const reloadAppointments = async () => {
    try {
      const res = await customerApi.getAppointments();
      setAppointments(extractRows(res));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to refresh appointments.'));
    }
  };

  // Load all part requests for the current customer.
  const loadPartTab = async () => {
    setPartLoading(true);
    try {
      const res = await customerApi.getPartRequests();
      setPartRequests(extractRows(res));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load part requests.'));
    } finally {
      setPartLoading(false);
    }
  };

  // Load completed appointments and existing reviews at the same time.
  // Both are needed together to compute the reviewableAppts list.
  const loadReviewTab = async () => {
    setReviewLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([
        customerApi.getCompletedAppointments(),
        customerApi.getReviews(),
      ]);
      setCompletedAppts(extractRows(cRes));
      setReviews(extractRows(rRes));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load review data.'));
    } finally {
      setReviewLoading(false);
    }
  };

  // ── Auto-fetch when the active tab changes ──────────────────────────────────
  // Each tab only loads its own data — other tabs are unaffected.
  useEffect(() => {
    if (activeTab === 'appointment') loadAppointmentTab();
    if (activeTab === 'partRequest') loadPartTab();
    if (activeTab === 'review')      loadReviewTab();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Appointment form handlers ───────────────────────────────────────────────

  const handleApptChange = (e) => {
    const { name, value } = e.target;
    setApptForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmittingAppt(true);
    try {
      // Combine the separate date and time fields into one ISO datetime string.
      // Default to 08:00 when no time is entered (prevents invalid date errors).
      const time     = apptForm.preferred_Time || '08:00';
      const datetime = new Date(`${apptForm.preferred_Date}T${time}`).toISOString();

      await customerApi.bookAppointment({
        vehicle_ID:          Number(apptForm.vehicle_ID),
        service_Type:        apptForm.service_Type,
        appointment_Date:    datetime,
        problem_Description: apptForm.problem_Description || null,
        notes:               apptForm.notes               || null,
      });

      toast.success('Appointment booked successfully!');
      setApptForm(INIT_APPT);
      // Reload the list so the new appointment appears immediately
      await reloadAppointments();
    } catch (err) {
      // Backend may return a specific message when a time slot is already taken
      toast.error(getErrorMessage(err, 'Failed to book appointment. The selected slot may be unavailable.'));
    } finally {
      setSubmittingAppt(false);
    }
  };

  // Cancel a Pending appointment.
  // Updates the row in-place immediately so the UI reacts without waiting for a reload.
  const handleCancelAppointment = async (apptId) => {
    setCancellingId(apptId);
    try {
      await customerApi.cancelAppointment(apptId);
      toast.success('Appointment cancelled.');
      setAppointments((prev) =>
        prev.map((a) =>
          (a.appointment_ID || a.appointmentId) === apptId
            ? { ...a, status: 'Cancelled' }
            : a
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to cancel appointment.'));
    } finally {
      setCancellingId(null);
    }
  };

  // ── Part request form handlers ──────────────────────────────────────────────

  const handlePartChange = (e) => {
    const { name, value } = e.target;
    setPartForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartSubmit = async (e) => {
    e.preventDefault();
    // Client-side quantity guard — prevents a pointless API call for bad input
    if (Number(partForm.quantity) < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }
    setSubmittingPart(true);
    try {
      // Backend contract: only requested_Part_Name and requested_Quantity are required.
      // Customer_ID is NOT sent — the backend reads it from the JWT token.
      await customerApi.createPartRequest({
        requested_Part_Name: partForm.part_Name,
        requested_Quantity:  Number(partForm.quantity),
      });
      toast.success('Part request submitted! Staff will review it shortly.');
      setPartForm(INIT_PART);
      // Reload so the new request appears in the list
      const res = await customerApi.getPartRequests();
      setPartRequests(extractRows(res));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit part request. Please try again.'));
    } finally {
      setSubmittingPart(false);
    }
  };

  // ── Review form handlers ────────────────────────────────────────────────────

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Rating guard — the button is also disabled, but this is a safety check
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error('Please select a rating between 1 and 5.');
      return;
    }
    setSubmittingReview(true);
    try {
      await customerApi.submitReview({
        appointment_ID: Number(reviewForm.appointment_ID),
        rating:         Number(reviewForm.rating),
        comment:        reviewForm.comment || null,
      });
      toast.success('Thank you! Your review has been submitted.');
      setReviewForm(INIT_REVIEW);
      // Reload both lists so the reviewed appointment disappears from the dropdown
      await loadReviewTab();
    } catch (err) {
      // Backend returns a specific error message if the customer tries to review twice
      toast.error(getErrorMessage(err, 'Failed to submit review. You may have already reviewed this appointment.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Submit guards ───────────────────────────────────────────────────────────
  // These are checked on the submit button's disabled prop.
  // Vehicle, service type, and date are the minimum required appointment fields.
  const canBookAppt = Boolean(
    apptForm.vehicle_ID && apptForm.service_Type && apptForm.preferred_Date
  );
  // Part name and a positive quantity are the only backend-required fields.
  const canSubmitPart = Boolean(
    partForm.part_Name.trim() && Number(partForm.quantity) > 0
  );
  // An appointment selection and a star rating are both required to submit a review.
  const canSubmitReview = Boolean(reviewForm.appointment_ID && reviewForm.rating > 0);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50/50 flex items-center gap-3">
          {React.createElement(TAB_META[activeTab].icon, { className: 'w-6 h-6 text-blue-500' })}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{TAB_META[activeTab].title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{TAB_META[activeTab].description}</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1 — BOOK APPOINTMENT
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appointment' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Booking form (2/5 width on large screens) ─────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              New Appointment
            </h2>

            <form onSubmit={handleBookAppointment} className="space-y-4">

              {/* Vehicle — loaded from the customer's registered vehicles */}
              <div>
                <label className={labelCls}>
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicle_ID"
                  value={apptForm.vehicle_ID}
                  onChange={handleApptChange}
                  className={selectCls}
                  required
                >
                  <option value="">Select your vehicle</option>
                  {vehicles.map((v) => {
                    const id    = v.vehicle_ID || v.vehicleId;
                    const label = [v.make || v.brand, v.model, v.licence_Plate || v.licensePlate || v.plateNumber]
                      .filter(Boolean).join(' — ');
                    return <option key={id} value={id}>{label || `Vehicle #${id}`}</option>;
                  })}
                </select>
                {!apptLoading && vehicles.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No vehicles found for your account. Please contact staff.
                  </p>
                )}
              </div>

              {/* Service type */}
              <div>
                <label className={labelCls}>
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_Type"
                  value={apptForm.service_Type}
                  onChange={handleApptChange}
                  className={selectCls}
                  required
                >
                  <option value="">Select a service</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Preferred date and time — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  {/* min={TODAY} prevents the customer from picking a past date */}
                  <input
                    type="date"
                    name="preferred_Date"
                    value={apptForm.preferred_Date}
                    onChange={handleApptChange}
                    min={TODAY}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Preferred Time</label>
                  <input
                    type="time"
                    name="preferred_Time"
                    value={apptForm.preferred_Time}
                    onChange={handleApptChange}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Problem description */}
              <div>
                <label className={labelCls}>Problem Description</label>
                <textarea
                  name="problem_Description"
                  value={apptForm.problem_Description}
                  onChange={handleApptChange}
                  rows={3}
                  placeholder="Describe the issue with your vehicle…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Additional notes */}
              <div>
                <label className={labelCls}>Additional Notes</label>
                <textarea
                  name="notes"
                  value={apptForm.notes}
                  onChange={handleApptChange}
                  rows={2}
                  placeholder="Any other notes for the service team…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <SubmitButton
                loading={submittingAppt}
                disabled={!canBookAppt}
                icon={Calendar}
                idleLabel="Book Appointment"
                loadingLabel="Booking…"
              />
            </form>
          </div>

          {/* ── Appointment list (3/5 width on large screens) ─────────────── */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader icon={Calendar} title="My Appointments" count={appointments.length} />

            {apptLoading ? <LoadingPane /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['ID', 'Service', 'Date & Time', 'Status', 'Action'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0
                      ? <EmptyRow cols={5} message="No appointments found. Book your first one!" />
                      : appointments.map((a, i) => {
                          const id     = a.appointment_ID || a.appointmentId;
                          const status = a.status || a.appointment_Status || 'Pending';
                          return (
                            <tr
                              key={id}
                              className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                            >
                              <td className="px-4 py-3 text-gray-400 text-xs">#{id}</td>
                              <td className="px-4 py-3 text-gray-800 font-medium">
                                {a.service_Type || a.serviceType || '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {formatDateTime(a.appointment_Date || a.appointmentDate)}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={status} />
                              </td>
                              <td className="px-4 py-3">
                                {/* Cancel button is only shown for Pending appointments */}
                                {status === 'Pending' && (
                                  <button
                                    onClick={() => handleCancelAppointment(id)}
                                    disabled={cancellingId === id}
                                    className="text-xs px-3 py-1 rounded-lg border border-red-200
                                      text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                                  >
                                    {cancellingId === id ? 'Cancelling…' : 'Cancel'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2 — REQUEST PART
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'partRequest' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Part request form (2/5) ────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              New Part Request
            </h2>

            <form onSubmit={handlePartSubmit} className="space-y-4">

              {/* Part name is the only required text field */}
              <div>
                <label className={labelCls}>
                  Part Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="part_Name"
                  value={partForm.part_Name}
                  onChange={handlePartChange}
                  placeholder="e.g. Brake Pad"
                  className={inputCls}
                  required
                />
              </div>

              {/* Brand and category — optional but helpful for staff sourcing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={partForm.brand}
                    onChange={handlePartChange}
                    placeholder="e.g. Bosch"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={partForm.category}
                    onChange={handlePartChange}
                    placeholder="e.g. Brakes"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Quantity and urgency — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={partForm.quantity}
                    onChange={handlePartChange}
                    min="1"
                    placeholder="1"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Urgency</label>
                  <select
                    name="urgency"
                    value={partForm.urgency}
                    onChange={handlePartChange}
                    className={selectCls}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Reason — optional extra context for staff; not required by backend */}
              <div>
                <label className={labelCls}>Reason / Description</label>
                <textarea
                  name="reason"
                  value={partForm.reason}
                  onChange={handlePartChange}
                  rows={3}
                  placeholder="Explain why you need this part…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <SubmitButton
                loading={submittingPart}
                disabled={!canSubmitPart}
                icon={Package}
                idleLabel="Submit Request"
                loadingLabel="Submitting…"
              />
            </form>
          </div>

          {/* ── Part request list (3/5) ────────────────────────────────────── */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader icon={Package} title="My Part Requests" count={partRequests.length} />

            {partLoading ? <LoadingPane /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Part', 'Brand', 'Qty', 'Urgency', 'Status', 'Requested'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partRequests.length === 0
                      ? <EmptyRow cols={6} message="No part requests found." />
                      : partRequests.map((r, i) => (
                          <tr
                            key={r.request_ID || r.requestId || i}
                            className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                          >
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {r.part_Name || r.partName || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.brand || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.quantity}</td>
                            <td className="px-4 py-3">
                              <UrgencyBadge urgency={r.urgency} />
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                              {formatDate(r.requested_Date || r.requestedDate || r.created_At)}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3 — REVIEW SERVICE
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Review form (2/5) ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              Leave a Review
            </h2>

            <form onSubmit={handleReviewSubmit} className="space-y-4">

              {/* Completed appointment selector.
                  Already-reviewed appointments are filtered out by reviewableAppts. */}
              <div>
                <label className={labelCls}>
                  Completed Appointment <span className="text-red-500">*</span>
                </label>
                <select
                  name="appointment_ID"
                  value={reviewForm.appointment_ID}
                  onChange={handleReviewChange}
                  className={selectCls}
                  required
                >
                  <option value="">Select an appointment</option>
                  {reviewableAppts.map((a) => {
                    const id = a.appointment_ID || a.appointmentId;
                    return (
                      <option key={id} value={id}>
                        #{id} — {a.service_Type || a.serviceType} ({formatDate(a.appointment_Date || a.appointmentDate)})
                      </option>
                    );
                  })}
                </select>
                {/* Helpful message when all completed appointments have already been reviewed */}
                {!reviewLoading && reviewableAppts.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    No completed appointments available to review.
                  </p>
                )}
              </div>

              {/* Star rating — click a star to set the rating.
                  StarPicker handles its own click events and updates state via onChange. */}
              <div>
                <label className={labelCls}>
                  Rating <span className="text-red-500">*</span>
                </label>
                <StarPicker
                  value={reviewForm.rating}
                  onChange={(n) => setReviewForm((prev) => ({ ...prev, rating: n }))}
                />
                {reviewForm.rating > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{reviewForm.rating} / 5 stars selected</p>
                )}
              </div>

              {/* Review comment */}
              <div>
                <label className={labelCls}>Comment</label>
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  rows={4}
                  placeholder="Share your experience with this service…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <SubmitButton
                loading={submittingReview}
                disabled={!canSubmitReview}
                icon={Star}
                idleLabel="Submit Review"
                loadingLabel="Submitting…"
              />
            </form>
          </div>

          {/* ── Review list (3/5) ──────────────────────────────────────────── */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader icon={Star} title="My Reviews" count={reviews.length} />

            {reviewLoading ? <LoadingPane /> : (
              reviews.length === 0 ? (
                // Empty state for reviews
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                  <Star className="w-9 h-9 mb-2 opacity-25" />
                  <p className="text-sm font-medium">No reviews yet.</p>
                  <p className="text-xs mt-1">Complete an appointment and come back to leave a review.</p>
                </div>
              ) : (
                // Review cards — one per review, displayed as a vertical list
                <div className="divide-y divide-gray-100">
                  {reviews.map((r, i) => {
                    const rating = Number(r.rating) || 0;
                    return (
                      <div key={r.review_ID || r.reviewId || i} className="px-6 py-5">
                        {/* Header row: appointment reference + review date */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">
                            Appointment #{r.appointment_ID || r.appointmentId}
                            {(r.service_Type || r.serviceType) && (
                              <span> — {r.service_Type || r.serviceType}</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(r.review_Date || r.reviewDate || r.created_At)}
                          </p>
                        </div>

                        {/* Gold stars for the given rating, gray for the remaining ones */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className={`text-lg leading-none ${n <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1.5 text-xs text-gray-500">{rating}/5</span>
                        </div>

                        {/* Comment — only rendered if the customer left one */}
                        {r.comment && (
                          <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerServices;
