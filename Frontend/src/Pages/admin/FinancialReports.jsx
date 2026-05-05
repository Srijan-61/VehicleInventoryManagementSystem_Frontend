import React from 'react';
import DataTable from '../../components/common/DataTable';

const FinancialReports = () => {
  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Revenue', accessor: 'revenue' },
    { header: 'Expenses', accessor: 'expenses' },
    { header: 'Net Profit', accessor: 'profit' },
  ];

  const data = [
    { date: '2026-05-01', revenue: '$50,000', expenses: '$30,000', profit: '$20,000' },
    { date: '2026-04-01', revenue: '$45,000', expenses: '$28,000', profit: '$17,000' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default FinancialReports;
