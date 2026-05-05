import React from 'react';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Edit, Trash2, Plus } from 'lucide-react';


const ManageParts = () => {
  const columns = [
    { header: 'Part Name', accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Stock', accessor: 'stock' },
    { header: 'Price', accessor: 'price' },
    { 
      header: 'Actions', 
      render: () => (
        <div className="flex gap-2">
          <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <Edit className="w-4 h-4 mr-1" /> Edit
          </button>
          <button className="flex items-center text-red-600 hover:text-red-800 transition-colors">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </button>
        </div>
      )
    },
  ];

  const data = [
    { name: 'Engine Oil', sku: 'EO-101', stock: 150, price: '$25.00' },
    { name: 'Brake Pads', sku: 'BP-202', stock: 45, price: '$40.00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Parts Inventory</h1>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ManageParts;
