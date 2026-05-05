import React from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { Plus, FileText } from 'lucide-react';


const POSInvoice = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">POS (Point of Sale) Invoice</h1>
      <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Search Part" placeholder="Enter Part Name or SKU" />
        <InputField label="Quantity" type="number" placeholder="1" />
        <div className="flex items-end">
          <Button className="w-full flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cart</h2>
        <p className="text-gray-500 italic">No items added to cart.</p>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Generate Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSInvoice;
