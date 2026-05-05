import { useState } from "react";

function SearchCustomer() {
  const [query, setQuery] = useState("");

  const customers = [
    { name: "Ram", phone: "9800000000", vehicle: "BA1234" },
    { name: "Shyam", phone: "9811111111", vehicle: "BA5678" },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query) ||
      c.vehicle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Customer</h2>

      <input
        placeholder="Search by Name / Phone / Vehicle"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <table border="1" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Vehicle</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.vehicle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SearchCustomer;