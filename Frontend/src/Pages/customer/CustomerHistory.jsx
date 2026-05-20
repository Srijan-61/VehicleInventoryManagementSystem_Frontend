import React, { useState, useEffect } from "react";
import { History, RefreshCw, ShoppingBag, Wrench } from "lucide-react";
import { customerApi } from "../../api/customerApi";

const CustomerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await customerApi.getHistory();
        setHistory(response.data?.historyItems || response.historyItems || []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(
          err.message ||
            "Failed to load customer history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 bg-gray-50/50 flex items-center gap-3">
            <History className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Purchase & Service History</h1>
              <p className="text-sm text-gray-500 mt-0.5">View your past purchases and service appointments.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12">
          <div className="flex items-center justify-center text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  const purchases = history.filter((item) => item.type === "Purchase" || item.type === "Invoice");
  const services = history.filter((item) => item.type !== "Purchase" && item.type !== "Invoice");

  const renderTable = (data, title, Icon, showAmount = true) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-500" />
          {title}
        </p>
        <span className="text-xs text-gray-400">{data.length} total</span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No {title} Found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any {title.toLowerCase()} yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Date', 'Type', 'Description', ...(showAmount ? ['Total Amount'] : []), 'Status'].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${h === 'Total Amount' ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-50 transition-colors duration-200`}
                >
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.date ? new Date(item.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        item.type === "Purchase" || item.type === "Invoice"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{item.description}</td>
                  {showAmount && (
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {item.totalAmount !== null
                        ? `Rs. ${item.totalAmount.toFixed(2)}`
                        : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        item.status === "Paid" || item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Cancelled"
                          ? "bg-gray-100 text-gray-500"
                          : item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50/50 flex items-center gap-3">
          <History className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Purchase & Service History</h1>
            <p className="text-sm text-gray-500 mt-0.5">View your past purchases and service appointments.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!error && (
        <>
          {renderTable(purchases, "Purchase & Invoice History", ShoppingBag, true)}
          {renderTable(services, "Service Appointments", Wrench, false)}
        </>
      )}
    </div>
  );
};

export default CustomerHistory;
