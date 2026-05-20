import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api/Admin/vendors";

function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchVendors = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load vendors");

      setVendors(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      toast.success(data.message || "Vendor saved successfully");
      setForm({ name: "", phone: "", email: "", address: "" });
      setEditingId(null);
      fetchVendors();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setForm({
      name: vendor.name || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      toast.success(data.message || "Vendor deleted successfully");
      fetchVendors();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Vendor Management
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input name="name" value={form.name} onChange={handleChange} placeholder="Vendor Name" required className="border p-3 rounded-xl" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required className="border p-3 rounded-xl" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="border p-3 rounded-xl" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required className="border p-3 rounded-xl" />

        <button className="bg-blue-600 text-white py-3 rounded-xl font-semibold">
          {editingId ? "Update Vendor" : "Add Vendor"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", phone: "", email: "", address: "" });
            }}
            className="bg-gray-500 text-white py-3 rounded-xl font-semibold"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Email</th>
              <th className="p-4">Address</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-t">
                <td className="p-4">{vendor.name}</td>
                <td className="p-4">{vendor.phone}</td>
                <td className="p-4">{vendor.email}</td>
                <td className="p-4">{vendor.address}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(vendor)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(vendor.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {vendors.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorPage;