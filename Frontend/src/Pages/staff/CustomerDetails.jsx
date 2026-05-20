import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const res = await fetch(`https://localhost:7111/api/Staff/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Customer not found");

        setCustomer(data);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (!customer) {
    return <div className="p-8">Loading customer details...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        Back
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Customer Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div>
            <p className="text-gray-500">Customer ID</p>
            <p className="font-semibold">{customer.id}</p>
          </div>

          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-semibold">{customer.name}</p>
          </div>

          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-semibold">{customer.phone}</p>
          </div>

          <div>
            <p className="text-gray-500">Vehicle Number</p>
            <p className="font-semibold">{customer.vehicle}</p>
          </div>

          <div>
            <p className="text-gray-500">Vehicle Model</p>
            <p className="font-semibold">{customer.model}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Purchase / Service History
        </h2>

        {customer.history && customer.history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(customer.history[0]).map((key) => (
                    <th key={key} className="p-4 capitalize">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customer.history.map((item, index) => (
                  <tr key={index} className="border-t">
                    {Object.values(item).map((value, i) => (
                      <td key={i} className="p-4">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No history found for this customer.</p>
        )}
      </div>
    </div>
  );
}

export default CustomerDetails;