import React from 'react';

const StatsCard = ({ title, value, icon: Icon, description, iconColorClass = "bg-blue-50 text-blue-600", descColorClass = "text-gray-500" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${iconColorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {description && (
        <p className={`text-sm mt-2 font-medium ${descColorClass}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
