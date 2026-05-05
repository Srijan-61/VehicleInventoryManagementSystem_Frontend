import React from 'react';

const InvoicePrintView = ({ invoiceData }) => {
  return (
    <div className="p-8 bg-white border border-gray-300 max-w-4xl mx-auto my-8 print:border-none print:shadow-none print:m-0">
      <div className="flex justify-between border-b pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase">Invoice</h1>
          <p className="text-gray-600">Vehicle Inventory Management System</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Invoice #: {invoiceData?.invoiceNumber || 'N/A'}</p>
          <p>Date: {invoiceData?.date || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Billed To:</h2>
        <p className="font-semibold">{invoiceData?.customerName || 'N/A'}</p>
        <p>{invoiceData?.customerAddress || 'N/A'}</p>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Quantity</th>
            <th className="py-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData?.items?.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{item.unitPrice}</td>
              <td className="py-2 text-right">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span>Subtotal:</span>
            <span>{invoiceData?.subtotal || '0.00'}</span>
          </div>
          <div className="flex justify-between py-2 border-b font-bold text-lg">
            <span>Total:</span>
            <span>{invoiceData?.total || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintView;
