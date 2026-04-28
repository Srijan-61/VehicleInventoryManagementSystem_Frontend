import { useState } from "react";

function VendorPage() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const addVendor = () => {
    setVendors([...vendors, form]);
    setForm({ name: "", phone: "", address: "" });
  };

  const deleteVendor = (index) => {
    const newList = vendors.filter((_, i) => i !== index);
    setVendors(newList);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vendor Management</h2>

      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

      <button onClick={addVendor}>Add Vendor</button>

      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={i}>
              <td>{v.name}</td>
              <td>{v.phone}</td>
              <td>{v.address}</td>
              <td>
                <button onClick={() => deleteVendor(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VendorPage;