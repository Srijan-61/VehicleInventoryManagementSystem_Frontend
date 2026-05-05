import React from 'react';
import DataTable from '../../components/common/DataTable';

const History = () => {
  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Service/Item', accessor: 'item' },
    { header: 'Total', accessor: 'total' },
    { header: 'Status', accessor: 'status' },
  ];

  const data = [
    { date: '2026-04-15', item: 'Oil Change', total: '$45.00', status: 'Completed' },
    { date: '2026-03-10', item: 'Tire Rotation', total: '$30.00', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction & Service History</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default History;
