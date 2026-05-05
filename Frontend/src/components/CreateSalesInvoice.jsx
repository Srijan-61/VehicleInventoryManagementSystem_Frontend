import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CreateSalesInvoice = () => {
  const [items, setItems] = useState([{ part_ID: '', quantity: 1 }]);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://localhost:7111/api/Staff/customers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' || field === 'part_ID' ? Number(value) : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { part_ID: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    try {
      // Filter out empty items
      const validItems = items.filter(item => item.part_ID !== '');
      
      if (validItems.length === 0) {
        toast.warning("Please add at least one valid item.");
        return;
      }

      const payload = {
        customer_ID: Number(form.customer_ID.value),
        staff_ID: Number(form.staff_ID.value),
        is_Paid: form.is_Paid.checked,
        items: validItems
      };

      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/Staff/create-sales-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        toast.success(data?.message || 'Invoice generated successfully!');
        setCreatedInvoice({ ...payload, ...data }); // Merge payload with backend response
        form.reset();
        setItems([{ part_ID: '', quantity: 1 }]);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Failed to create invoice.');
      }
    } catch (error) {
      toast.error('Network error occurred.');
    }
  };

  const inputClass = "mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">Create Sales Invoice</h2>
          <p className="text-sm text-gray-500 mt-1">Manually generate a new sales invoice for a customer.</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Customer</label>
                <select required name="customer_ID" className={inputClass}>
                  <option value="">Select a Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_ID} value={customer.customer_ID}>
                      {customer.fullName} {customer.customer_ID}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Staff ID</label>
                <input required type="number" name="staff_ID" className={inputClass} placeholder="e.g., 1" />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors w-max">
                <input 
                  type="checkbox" 
                  name="is_Paid" 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Paid</span>
              </label>
            </div>

            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium transition-colors"
                >
                  + Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex-1 w-full">
                      <label className={labelClass}>Part ID</label>
                      <input 
                        required 
                        type="number" 
                        min="1"
                        value={item.part_ID}
                        onChange={(e) => handleItemChange(index, 'part_ID', e.target.value)}
                        className={inputClass} 
                        placeholder="e.g., 101" 
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <label className={labelClass}>Quantity</label>
                      <input 
                        required 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={inputClass} 
                      />
                    </div>
                    {items.length > 1 && (
                      <div className="w-full sm:w-auto">
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)}
                          className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors border border-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-100">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
              >
                Generate Invoice
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Render Created Invoice Details */}
      {createdInvoice && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-green-100 bg-green-50/50 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
            <h3 className="text-lg font-medium text-green-800">
              {createdInvoice.invoice_No ? `Invoice ID: #${createdInvoice.invoice_No}` : 'Invoice Receipt'}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                {createdInvoice.is_Paid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${createdInvoice.discount_Amount > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-6`}>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Customer ID</span>
                <span className="text-base font-semibold text-gray-900">{createdInvoice.customer_ID}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Sub Total</span>
                <span className="text-base font-semibold text-gray-900">Rs. {createdInvoice.sub_Total?.toFixed(2) || '0.00'}</span>
              </div>
              {createdInvoice.discount_Amount > 0 && (
                <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                  <span className="text-xs text-green-600 font-medium uppercase tracking-wider block mb-1">Discount</span>
                  <span className="text-base font-semibold text-green-700">- Rs. {createdInvoice.discount_Amount.toFixed(2)}</span>
                </div>
              )}
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <span className="text-xs text-blue-600 font-medium uppercase tracking-wider block mb-1">Final Total</span>
                <span className="text-lg font-bold text-blue-700">Rs. {createdInvoice.final_Total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="mt-6 border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Part ID</th>
                    <th className="px-6 py-3">Part Name</th>
                    <th className="px-6 py-3 text-right">Unit Price</th>
                    <th className="px-6 py-3 text-right">Quantity</th>
                    <th className="px-6 py-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {createdInvoice.items?.map((item, idx) => (
                    <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.part_ID}</td>
                      <td className="px-6 py-4 text-gray-600">{item.part_Name || '-'}</td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {item.unit_Price ? `Rs. ${item.unit_Price.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {item.total_Price ? `Rs. ${item.total_Price.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSalesInvoice;
