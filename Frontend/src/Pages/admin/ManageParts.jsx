import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { purchaseParts } from '../../api/adminPartsApi';
import { Settings, Tag, Package, DollarSign } from 'lucide-react';

const ManageParts = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);

    const payload = {
      name: form.name.value,
      sku: form.sku.value,
      stock: parseInt(form.stock.value) || 0,
      price: parseFloat(form.price.value) || 0,
    };

    try {
      const response = await purchaseParts(payload);
      toast.success(response.data?.message || 'Part added successfully!');
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add part.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
        <h1 className="text-2xl font-bold text-gray-800">
          Parts Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new inventory part to the system.
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" /> Part Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Part Name</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="name"
                    className={`${inputClass} pl-10`}
                  />
                  <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="sku"
                    className={`${inputClass} pl-10`}
                  />
                  <Package className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Initial Stock</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    name="stock"
                    className={`${inputClass} pl-10`}
                    min="0"
                  />
                  <Package className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Price</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    name="price"
                    step="0.01"
                    className={`${inputClass} pl-10`}
                    min="0"
                  />
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 text-white font-semibold text-sm rounded-lg transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? 'Adding...' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageParts;
