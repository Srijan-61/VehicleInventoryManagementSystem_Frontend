import React, { useState, useEffect } from 'react';

function ManageParts() {
  const [parts, setParts] = useState([]);
  
  // Views: 'list', 'purchase', 'edit'
  const [currentView, setCurrentView] = useState('list');
  
  // Form states
  const [purchaseForm, setPurchaseForm] = useState({
    vendor_ID: '',
    admin_ID: '',
    payment_Status: 'Paid',
    part_ID: '',
    quantity_Purchased: '',
    purchase_Unit_Cost: ''
  });

  const [editForm, setEditForm] = useState({
    part_ID: '', // to know which one to edit
    part_Name: '',
    part_Category: '',
    brand: '',
    stock_Quantity: '',
    minimum_Stock_Level: '',
    unit_Price: '',
    purchase_Price: ''
  });

  // Fetch Parts on load
  useEffect(() => {
    if (currentView === 'list') {
      fetchParts();
    }
  }, [currentView]);

  const fetchParts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7111/api/admin/parts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setParts(data);
      } else {
        window.alert('Failed to fetch parts');
      }
    } catch (error) {
      window.alert('Error fetching parts: ' + error.message);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Construct payload according to requirements
      const payload = {
        vendor_ID: purchaseForm.vendor_ID,
        admin_ID: purchaseForm.admin_ID,
        payment_Status: purchaseForm.payment_Status,
        items: [
          {
            part_ID: purchaseForm.part_ID,
            quantity_Purchased: purchaseForm.quantity_Purchased,
            purchase_Unit_Cost: purchaseForm.purchase_Unit_Cost
          }
        ]
      };

      const response = await fetch('https://localhost:7111/api/admin/parts/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        window.alert('Part purchased successfully!');
        setPurchaseForm({
          vendor_ID: '',
          admin_ID: '',
          payment_Status: 'Paid',
          part_ID: '',
          quantity_Purchased: '',
          purchase_Unit_Cost: ''
        });
        setCurrentView('list');
      } else {
        window.alert('Failed to purchase part');
      }
    } catch (error) {
      window.alert('Error: ' + error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7111/api/admin/parts/${editForm.part_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          part_Name: editForm.part_Name,
          part_Category: editForm.part_Category,
          brand: editForm.brand,
          stock_Quantity: editForm.stock_Quantity,
          minimum_Stock_Level: editForm.minimum_Stock_Level,
          unit_Price: editForm.unit_Price,
          purchase_Price: editForm.purchase_Price
        })
      });

      if (response.ok) {
        window.alert('Part updated successfully!');
        setCurrentView('list');
      } else {
        window.alert('Failed to update part');
      }
    } catch (error) {
      window.alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (partId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this part?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7111/api/admin/parts/${partId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 204) {
        window.alert('Part deleted successfully!');
        fetchParts(); // Refresh the list
      } else {
        const errorText = await response.text();
        window.alert('Failed to delete part. Status: ' + response.status + ' - ' + errorText);
      }
    } catch (error) {
      window.alert('Error: ' + error.message);
    }
  };

  const startEdit = (part) => {
    setEditForm({
      part_ID: part.part_ID,
      part_Name: part.part_Name || '',
      part_Category: part.part_Category || '',
      brand: part.brand || '',
      stock_Quantity: part.stock_Quantity || '',
      minimum_Stock_Level: part.minimum_Stock_Level || '',
      unit_Price: part.unit_Price || '',
      purchase_Price: part.purchase_Price || ''
    });
    setCurrentView('edit');
  };

  // Rendering Purchase Form
  if (currentView === 'purchase') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Purchase New Part</h2>
        <form onSubmit={handlePurchaseSubmit} className="space-y-4 max-w-lg bg-white p-6 border rounded shadow-sm">
          
          <div>
            <label className="block mb-1 font-semibold">Vendor ID:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.vendor_ID} onChange={(e) => setPurchaseForm({...purchaseForm, vendor_ID: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Admin ID:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.admin_ID} onChange={(e) => setPurchaseForm({...purchaseForm, admin_ID: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Payment Status:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.payment_Status} onChange={(e) => setPurchaseForm({...purchaseForm, payment_Status: e.target.value})} />
          </div>

          <h3 className="font-bold mt-4 border-b pb-2">Item Details</h3>

          <div>
            <label className="block mb-1 font-semibold">Part ID:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.part_ID} onChange={(e) => setPurchaseForm({...purchaseForm, part_ID: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Quantity Purchased:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.quantity_Purchased} onChange={(e) => setPurchaseForm({...purchaseForm, quantity_Purchased: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Purchase Unit Cost:</label>
            <input type="text" className="border w-full p-2 rounded" required value={purchaseForm.purchase_Unit_Cost} onChange={(e) => setPurchaseForm({...purchaseForm, purchase_Unit_Cost: e.target.value})} />
          </div>

          <div className="pt-4 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">[Submit Purchase]</button>
            <button type="button" onClick={() => setCurrentView('list')} className="bg-gray-400 text-white px-4 py-2 rounded">[Cancel]</button>
          </div>
        </form>
      </div>
    );
  }

  // Rendering Edit Form
  if (currentView === 'edit') {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Part</h2>
        <form onSubmit={handleEditSubmit} className="space-y-4 max-w-lg bg-white p-6 border rounded shadow-sm">
          
          <div>
            <label className="block mb-1 font-semibold">Part Name:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.part_Name} onChange={(e) => setEditForm({...editForm, part_Name: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Part Category:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.part_Category} onChange={(e) => setEditForm({...editForm, part_Category: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Brand:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.brand} onChange={(e) => setEditForm({...editForm, brand: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Stock Quantity:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.stock_Quantity} onChange={(e) => setEditForm({...editForm, stock_Quantity: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Minimum Stock Level:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.minimum_Stock_Level} onChange={(e) => setEditForm({...editForm, minimum_Stock_Level: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Unit Price:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.unit_Price} onChange={(e) => setEditForm({...editForm, unit_Price: e.target.value})} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Purchase Price:</label>
            <input type="text" className="border w-full p-2 rounded" required value={editForm.purchase_Price} onChange={(e) => setEditForm({...editForm, purchase_Price: e.target.value})} />
          </div>

          <div className="pt-4 flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">[Save Changes]</button>
            <button type="button" onClick={() => setCurrentView('list')} className="bg-gray-400 text-white px-4 py-2 rounded">[Cancel]</button>
          </div>
        </form>
      </div>
    );
  }

  // Rendering List View
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Parts</h1>
        <button 
          onClick={() => setCurrentView('purchase')} 
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
        >
          [Purchase New Part]
        </button>
      </div>

      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 border-r">ID</th>
              <th className="p-3 border-r">Name</th>
              <th className="p-3 border-r">Category</th>
              <th className="p-3 border-r">Brand</th>
              <th className="p-3 border-r">Stock</th>
              <th className="p-3 border-r">Unit Price</th>
              <th className="p-3 border-r">Purchase Price</th>
              <th className="p-3 border-r">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500 border-b">No parts available.</td>
              </tr>
            ) : (
              parts.map((part) => (
                <tr key={part.part_ID} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r">{part.part_ID}</td>
                  <td className="p-3 border-r">{part.part_Name}</td>
                  <td className="p-3 border-r">{part.part_Category}</td>
                  <td className="p-3 border-r">{part.brand}</td>
                  <td className="p-3 border-r">{part.stock_Quantity}</td>
                  <td className="p-3 border-r">{part.unit_Price}</td>
                  <td className="p-3 border-r">{part.purchase_Price}</td>
                  <td className="p-3 border-r">{part.isAvailable ? 'Available' : 'Unavailable'}</td>
                  <td className="p-3 space-x-3">
                    <button 
                      onClick={() => startEdit(part)} 
                      className="text-blue-600 font-medium hover:text-blue-800"
                    >
                      [Edit]
                    </button>
                    <button 
                      onClick={() => handleDelete(part.part_ID)} 
                      className="text-red-600 font-medium hover:text-red-800"
                    >
                      [Delete]
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageParts;
