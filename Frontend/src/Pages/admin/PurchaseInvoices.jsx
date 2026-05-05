import React from 'react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Eye, Plus } from 'lucide-react';


const PurchaseInvoices = () => {
  const columns = [
    { header: 'Invoice #', accessor: 'id' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Date', accessor: 'date' },
    { header: 'Total', accessor: 'total' },
    { 
      header: 'Actions', 
      render: () => (
        <div className="flex gap-2">
          <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <Eye className="w-4 h-4 mr-1" /> View
          </button>
        </div>
      )
    },
  ];

  const data = [
    { id: 'INV-001', vendor: 'Auto Parts Inc', date: '2026-05-02', total: '$1,200.00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Invoices</h1>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default PurchaseInvoices;
