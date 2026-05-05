import React from 'react';

const InputField = ({ label, type = 'text', value, onChange, placeholder, name, error, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default InputField;
