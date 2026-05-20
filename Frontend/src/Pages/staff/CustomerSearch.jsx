import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CustomerSearch = () => {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error("Please enter customer name, phone, ID or vehicle number");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/Staff/search-customers?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Search failed");

      setCustomers(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Customer Search & Details
        </h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, ID or vehicle number"
            className="border p-3 rounded-xl w-full"
          />
          <button className="bg-blue-600 text-white px-6 rounded-xl font-semibold">
            Search
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Vehicle No.</th>
                <th className="p-4">Model</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId} className="border-t">
                  <td className="p-4">{customer.customerId}</td>
                  <td className="p-4">{customer.name}</td>
                  <td className="p-4">{customer.phone}</td>
                  <td className="p-4">{customer.vehicleRegNumber}</td>
                  <td className="p-4">{customer.vehicleModel}</td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        navigate(`/staff/customer-details/${customer.customerId}`)
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No customers searched yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;