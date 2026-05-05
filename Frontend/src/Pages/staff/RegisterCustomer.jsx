import React from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

const RegisterCustomer = () => {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Register New Customer</h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Full Name" placeholder="John Doe" />
        <InputField label="Email" type="email" placeholder="john@example.com" />
        <InputField label="Phone" placeholder="+1 234 567 890" />
        <InputField label="Vehicle Model" placeholder="Toyota Camry" />
        <div className="md:col-span-2">
          <Button type="submit" className="w-full mt-4">Register Customer</Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterCustomer;
