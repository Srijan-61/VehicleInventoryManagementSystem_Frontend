import React from "react";

const CustomerRegistration = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value,
      role: "Customer",
      vehicles: [
        {
          reg_Number: form.reg_Number.value,
          vehicle_Type: form.vehicle_Type.value,
          manufacture_Year: parseInt(form.manufacture_Year.value),
          owner_ID: 0,
        },
      ],
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://localhost:7111/api/Staff/register-customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const data = await response.json().catch(() => null);
        alert(data?.message || "Customer registered successfully!");
        form.reset();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || "Registration failed.");
      }
    } catch (error) {
      alert("Network error occurred.");
    }
  };

  const inputClass =
    "mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-800">
          Customer Registration
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Register a new customer and their primary vehicle.
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  className={inputClass}
                  placeholder="Name"
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  className={inputClass}
                  placeholder="username@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Password</label>
                <input
                  required
                  type="password"
                  name="password"
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Vehicle Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Registration Number</label>
                <input
                  required
                  type="text"
                  name="reg_Number"
                  className={inputClass}
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <input
                  required
                  type="text"
                  name="vehicle_Type"
                  className={inputClass}
                  placeholder="SUV"
                />
              </div>
              <div>
                <label className={labelClass}>Manufacture Year</label>
                <input
                  required
                  type="number"
                  name="manufacture_Year"
                  className={inputClass}
                  placeholder="2023"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Register Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegistration;
