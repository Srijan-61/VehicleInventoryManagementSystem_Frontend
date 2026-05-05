import React from 'react';
import DataTable from '../../components/common/DataTable';

const CustomerReports = () => {
  const columns = [
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total Spent', accessor: 'total' },
    { header: 'Last Visit', accessor: 'lastVisit' },
  ];

  const data = [
    { customer: 'Alice Johnson', total: '$1,500.00', lastVisit: '2026-04-15' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Activity Reports</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CustomerReports;
