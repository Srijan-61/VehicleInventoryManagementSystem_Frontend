import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  ClipboardList, Package, CheckCircle, XCircle,
  RefreshCw, AlertCircle, Calendar, CalendarCheck,
} from 'lucide-react';
import { staffApi } from '../../api/staffApi';

// ─── Pull the most useful error message from an Axios error ──────────────────
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const msg  = data?.message || data?.Message || data || err?.message || fallback;
  return typeof msg === 'string' ? msg : fallback;
};

// ─── Format an ISO date string to a readable datetime ────────────────────────
const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Format an ISO date string to a readable date only ───────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Colored status badge ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100   text-blue-700',
    Completed: 'bg-green-100  text-green-700',
    Cancelled: 'bg-gray-100   text-gray-500',
    Approved:  'bg-green-100  text-green-700',
    Rejected:  'bg-red-100    text-red-700',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {status || '—'}
    </span>
  );
};

// ─── Inline error / empty state banner ───────────────────────────────────────
const InfoBanner = ({ icon: Icon, color, message }) => (
  <div className={`flex items-center gap-3 px-4 py-10 justify-center text-${color}-500`}>
    <Icon className="w-5 h-5 shrink-0" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Loading spinner row ──────────────────────────────────────────────────────
const LoadingPane = () => (
  <div className="flex items-center justify-center py-12 text-gray-400">
    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
    <span className="text-sm">Loading…</span>
  </div>
);

// ─── Action button used in both tabs ─────────────────────────────────────────
// Shows a spinner while this specific action is running; disables during any action.
const ActionButton = ({ onClick, disabled, loading, colorCls, icon: Icon, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorCls}`}
  >
    {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
    {loading ? '…' : label}
  </button>
);

// ─── sessionStorage helpers — persist approved appointments across page refreshes ─
// The backend only exposes a /pending endpoint; approved rows are kept locally
// until staff marks them complete or rejects them.
const APPROVED_KEY = 'staff_approved_appointments';

const storedApproved = () => {
  try { return JSON.parse(sessionStorage.getItem(APPROVED_KEY) || '[]'); }
  catch { return []; }
};

const saveApproved = (appt) => {
  try {
    const id  = appt.appointment_ID || appt.appointmentId;
    const arr = storedApproved().filter((a) => (a.appointment_ID || a.appointmentId) !== id);
    sessionStorage.setItem(APPROVED_KEY, JSON.stringify([...arr, appt]));
  } catch {}
};

const removeApproved = (appointmentId) => {
  try {
    const arr = storedApproved().filter((a) => (a.appointment_ID || a.appointmentId) !== appointmentId);
    sessionStorage.setItem(APPROVED_KEY, JSON.stringify(arr));
  } catch {}
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const StaffApproval = () => {
  // ── Active tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('appointments');

  // ── Appointments state ──────────────────────────────────────────────────────
  const [appointments, setAppointments]     = useState([]);
  const [apptLoading,  setApptLoading]      = useState(false);
  const [apptError,    setApptError]        = useState('');
  // Tracks which appointment ID + action is currently processing, e.g. "12-approve"
  const [apptActing,   setApptActing]       = useState('');

  // ── Part requests state ─────────────────────────────────────────────────────
  const [partRequests, setPartRequests]     = useState([]);
  const [partLoading,  setPartLoading]      = useState(false);
  const [partError,    setPartError]        = useState('');
  // Tracks which request ID + action is currently processing, e.g. "5-reject"
  const [partActing,   setPartActing]       = useState('');

  // ── Fetch pending + approved appointments (both shown in one table) ─────────
  const loadAppointments = useCallback(async () => {
    setApptLoading(true);
    setApptError('');
    try {
      const extractRows = (res) =>
        Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

      // Only pending is guaranteed to exist on the backend.
      // Approved appointments are stored in sessionStorage so they persist across
      // page refreshes without needing a separate backend endpoint.
      const res = await staffApi.getPendingAppointments();
      const pending = extractRows(res);

      // Merge with sessionStorage-persisted approved rows.
      // Filter out any that are also in the pending list (shouldn't happen, but guard).
      const pendingIds   = new Set(pending.map((a) => a.appointment_ID || a.appointmentId));
      const fromStorage  = storedApproved().filter((a) =>
        !pendingIds.has(a.appointment_ID || a.appointmentId)
      );

      setAppointments([...pending, ...fromStorage]);
    } catch (err) {
      setApptError(getErrorMessage(err, 'Failed to load appointments.'));
    } finally {
      setApptLoading(false);
    }
  }, []);

  // ── Fetch pending part requests ─────────────────────────────────────────────
  const loadPartRequests = useCallback(async () => {
    setPartLoading(true);
    setPartError('');
    try {
      const res = await staffApi.getPendingPartRequests();
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setPartRequests(rows);
    } catch (err) {
      setPartError(getErrorMessage(err, 'Failed to load pending part requests.'));
    } finally {
      setPartLoading(false);
    }
  }, []);

  // Load the correct data whenever the active tab changes
  useEffect(() => {
    if (activeTab === 'appointments') loadAppointments();
    if (activeTab === 'parts')        loadPartRequests();
  }, [activeTab, loadAppointments, loadPartRequests]);

  // ── Handle appointment action (approve / reject / complete) ─────────────────
  const handleApptAction = async (appointmentId, action) => {
    const key = `${appointmentId}-${action}`;
    setApptActing(key);
    try {
      if (action === 'approve')  await staffApi.approveAppointment(appointmentId);
      if (action === 'reject')   await staffApi.rejectAppointment(appointmentId);
      if (action === 'complete') await staffApi.completeAppointment(appointmentId);

      const labels = { approve: 'approved', reject: 'rejected', complete: 'completed' };
      toast.success(`Appointment #${appointmentId} ${labels[action]} successfully.`);

      if (action === 'approve') {
        // Keep the row but switch its status — the Complete button will appear.
        // Also persist to sessionStorage so it survives page refreshes.
        const updatedAppt = appointments.find(
          (a) => (a.appointment_ID || a.appointmentId) === appointmentId
        );
        if (updatedAppt) {
          const saved = { ...updatedAppt, appointment_Status: 'Approved', status: 'Approved' };
          saveApproved(saved);
        }
        setAppointments((prev) =>
          prev.map((a) =>
            (a.appointment_ID || a.appointmentId) === appointmentId
              ? { ...a, appointment_Status: 'Approved', status: 'Approved' }
              : a
          )
        );
      } else {
        // Complete or Reject — remove from sessionStorage and from the table.
        removeApproved(appointmentId);
        setAppointments((prev) =>
          prev.filter((a) => (a.appointment_ID || a.appointmentId) !== appointmentId)
        );
      }
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${action} appointment.`));
    } finally {
      setApptActing('');
    }
  };

  // ── Handle part request action (approve / reject) ───────────────────────────
  const handlePartAction = async (requestId, action) => {
    const key = `${requestId}-${action}`;
    setPartActing(key);
    try {
      if (action === 'approve') await staffApi.approvePartRequest(requestId);
      if (action === 'reject')  await staffApi.rejectPartRequest(requestId);

      const labels = { approve: 'approved', reject: 'rejected' };
      toast.success(`Part request #${requestId} ${labels[action]} successfully.`);

      // Remove the row immediately so the table updates without waiting for the network
      setPartRequests((prev) =>
        prev.filter((r) => (r.request_ID || r.requestId) !== requestId)
      );
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to ${action} part request.`));
    } finally {
      setPartActing('');
    }
  };

  // ── Tab button styles ───────────────────────────────────────────────────────
  const tabCls = (tab) =>
    `flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Approvals</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review and act on pending customer appointments and part requests.
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab switcher ────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button onClick={() => setActiveTab('appointments')} className={tabCls('appointments')}>
          <Calendar className="w-4 h-4" />
          Appointments
          {appointments.length > 0 && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {appointments.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('parts')} className={tabCls('parts')}>
          <Package className="w-4 h-4" />
          Pending Part Requests
          {partRequests.length > 0 && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {partRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1 — PENDING APPOINTMENTS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Card header with refresh button */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Pending Appointments
            </p>
            <button
              onClick={loadAppointments}
              disabled={apptLoading}
              title="Refresh"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${apptLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Content */}
          {apptLoading ? (
            <LoadingPane />
          ) : apptError ? (
            <InfoBanner icon={AlertCircle} color="red" message={apptError} />
          ) : appointments.length === 0 ? (
            <InfoBanner icon={CheckCircle} color="green" message="No pending or approved appointments." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    {['ID', 'Customer ID', 'Vehicle', 'Service Type', 'Date & Time', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((a) => {
                    const id        = a.appointment_ID   || a.appointmentId;
                    const custId    = a.customer_ID      || a.customerId;
                    const vehicle   = a.vehicleName      || a.vehicle_Name   || '—';
                    const service   = a.service_Type     || a.serviceType    || '—';
                    const date      = a.appointment_Date || a.appointmentDate;
                    const status    = a.appointment_Status || a.status || 'Pending';
                    // A row is "busy" when any action for this appointment is running
                    const isBusy    = apptActing.startsWith(`${id}-`);

                    return (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{id}</td>
                        <td className="px-4 py-3 text-gray-600">#{custId}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{vehicle}</td>
                        <td className="px-4 py-3 text-gray-700">{service}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(date)}</td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* Pending → show Approve + Reject */}
                            {status === 'Pending' && (
                              <>
                                <ActionButton
                                  onClick={() => handleApptAction(id, 'approve')}
                                  disabled={isBusy}
                                  loading={apptActing === `${id}-approve`}
                                  colorCls="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  icon={CheckCircle}
                                  label="Approve"
                                />
                                <ActionButton
                                  onClick={() => handleApptAction(id, 'reject')}
                                  disabled={isBusy}
                                  loading={apptActing === `${id}-reject`}
                                  colorCls="bg-red-50 text-red-500 hover:bg-red-100"
                                  icon={XCircle}
                                  label="Reject"
                                />
                              </>
                            )}
                            {/* Approved → show Complete only */}
                            {status === 'Approved' && (
                              <ActionButton
                                onClick={() => handleApptAction(id, 'complete')}
                                disabled={isBusy}
                                loading={apptActing === `${id}-complete`}
                                colorCls="bg-green-50 text-green-600 hover:bg-green-100"
                                icon={CalendarCheck}
                                label="Complete"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2 — PENDING PART REQUESTS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'parts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Card header with refresh button */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              Pending Part Requests
            </p>
            <button
              onClick={loadPartRequests}
              disabled={partLoading}
              title="Refresh"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${partLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Content */}
          {partLoading ? (
            <LoadingPane />
          ) : partError ? (
            <InfoBanner icon={AlertCircle} color="red" message={partError} />
          ) : partRequests.length === 0 ? (
            <InfoBanner icon={CheckCircle} color="green" message="No pending part requests. All caught up!" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    {['Request ID', 'Customer ID', 'Part Name', 'Qty', 'Requested On', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partRequests.map((r) => {
                    const id      = r.request_ID          || r.requestId;
                    const custId  = r.customer_ID         || r.customerId;
                    const name    = r.requested_Part_Name || r.partName   || '—';
                    const qty     = r.requested_Quantity  || r.quantity   || '—';
                    const date    = r.request_Date        || r.requestDate;
                    const status  = r.status              || 'Pending';
                    // A row is "busy" when any action for this request is running
                    const isBusy  = partActing.startsWith(`${id}-`);

                    return (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{id}</td>
                        <td className="px-4 py-3 text-gray-600">#{custId}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium">{name}</td>
                        <td className="px-4 py-3 text-gray-700 text-center">{qty}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(date)}</td>
                        <td className="px-4 py-3"><StatusBadge status={status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ActionButton
                              onClick={() => handlePartAction(id, 'approve')}
                              disabled={isBusy}
                              loading={partActing === `${id}-approve`}
                              colorCls="bg-green-50 text-green-600 hover:bg-green-100"
                              icon={CheckCircle}
                              label="Approve"
                            />
                            <ActionButton
                              onClick={() => handlePartAction(id, 'reject')}
                              disabled={isBusy}
                              loading={partActing === `${id}-reject`}
                              colorCls="bg-red-50 text-red-500 hover:bg-red-100"
                              icon={XCircle}
                              label="Reject"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StaffApproval;
