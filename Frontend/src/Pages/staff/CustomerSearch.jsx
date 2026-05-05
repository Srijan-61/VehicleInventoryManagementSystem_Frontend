import React from 'react';
import InputField from '../../components/common/InputField';
import DataTable from '../../components/common/DataTable';
import { History } from 'lucide-react';


const CustomerSearch = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { 
      header: 'Actions', 
      render: () => (
        <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <History className="w-4 h-4 mr-1" /> View History
        </button>
      )
    },
  ];

  const data = [
    { name: 'Alice Johnson', email: 'alice@example.com', vehicle: 'Tesla Model 3' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Search</h1>
      <div className="max-w-md">
        <InputField placeholder="Search by name or email..." />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CustomerSearch;
