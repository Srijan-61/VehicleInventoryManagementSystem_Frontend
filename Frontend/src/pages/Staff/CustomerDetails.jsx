function CustomerDetails() {
  const customer = {
    name: "Ram",
    phone: "9800000000",
    vehicle: "BA1234",
    model: "Yamaha R15",
    history: ["Oil Change", "Brake Repair"],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customer Details</h2>

      <p><b>Name:</b> {customer.name}</p>
      <p><b>Phone:</b> {customer.phone}</p>
      <p><b>Vehicle:</b> {customer.vehicle}</p>
      <p><b>Model:</b> {customer.model}</p>

      <h3>Service History</h3>
      <ul>
        {customer.history.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerDetails;