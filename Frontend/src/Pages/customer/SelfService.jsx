import React from 'react';
import { Wrench, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

const SelfService = () => {
  const options = [
    { 
      title: 'Check Vehicle Health', 
      desc: 'Run a quick diagnostic on your vehicle based on recent service data.', 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      title: 'Maintenance Alerts', 
      desc: 'View upcoming service requirements and maintenance schedules.', 
      icon: AlertTriangle, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50' 
    },
    { 
      title: 'Service History', 
      desc: 'Access detailed reports of all past services and repairs.', 
      icon: Clock, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Self-Service</h1>
        <p className="text-sm text-gray-500">Quick tools to manage your vehicle's health and service records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-blue-100 group cursor-pointer">
            <div className={`w-14 h-14 rounded-xl ${option.bg} ${option.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <option.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{option.desc}</p>
            <div className="flex items-center text-blue-600 font-semibold text-sm">
              Open Tool <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg shadow-blue-200">
        <div>
          <h3 className="text-xl font-bold mb-2">Need professional help?</h3>
          <p className="text-blue-100">Our technicians are available for a full inspection of your vehicle.</p>
        </div>
        <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default SelfService;
