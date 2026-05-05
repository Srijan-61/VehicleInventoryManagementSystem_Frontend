import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, FileText } from 'lucide-react';

const SalesInvoice = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ part_ID: '', quantity: 1 }]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/Staff/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'part_ID' || field === 'quantity' ? parseInt(value) || '' : value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { part_ID: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);

    const payload = {
      customer_ID: parseInt(form.customer_ID.value),
      staff_ID: parseInt(form.staff_ID.value),
      is_Paid: form.is_Paid.value === 'true',
      items: items.map(item => ({
        part_ID: parseInt(item.part_ID),
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'https://localhost:7111/api/Staff/create-sales-invoice',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json().catch(() => null);
        toast.success(data?.message || 'Sales invoice created successfully!');
        form.reset();
        setItems([{ part_ID: '', quantity: 1 }]);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Failed to create invoice.');
      }
    } catch (error) {
      toast.error('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new sale and generate an invoice.</p>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Select Customer</label>
              <div className="relative">
                <select
                  required
                  name="customer_ID"
                  className={inputClass}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.customer_ID} value={c.customer_ID}>
                      {c.fullName} (ID: {c.customer_ID})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Staff ID</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  name="staff_ID"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Payment Status</label>
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="is_Paid"
                    value="true"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600">Paid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="is_Paid"
                    value="false"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600">Pending</span>
                </label>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-gray-200">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block">Part ID</label>
                    <input
                      required
                      type="number"
                      value={item.part_ID}
                      onChange={(e) => handleItemChange(index, 'part_ID', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block">Quantity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 text-white font-semibold text-sm rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
            >
                <>
                  <FileText className="w-4 h-4" />
                  Generate Sales Invoice
                </>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesInvoice;
