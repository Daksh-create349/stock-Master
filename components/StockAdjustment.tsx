
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, OperationType, OperationStatus } from '../types';
import { WAREHOUSES } from '../constants';
import { Save, ArrowRight, RefreshCw, Plus } from 'lucide-react';

export const StockAdjustment: React.FC = () => {
  const { products, updateStock, addOperation } = useInventory();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState<'overwrite' | 'add'>('overwrite');
  const [inputValue, setInputValue] = useState<string>('');
  const [location, setLocation] = useState(WAREHOUSES[0]);
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyInput = parseInt(inputValue);
    if (!selectedProduct || isNaN(qtyInput)) return;

    let finalQty = qtyInput;
    let logQty = qtyInput;

    if (adjustmentMode === 'add') {
      finalQty = selectedProduct.stock + qtyInput;
      logQty = qtyInput;
    } else {
      // For overwrite, we effectively "moved" the difference
      logQty = Math.abs(selectedProduct.stock - qtyInput);
    }

    // Create an audit log via Operation
    addOperation({
      id: `adj-${Date.now()}`,
      type: OperationType.ADJUSTMENT,
      status: OperationStatus.DONE,
      reference: `INV/ADJ/${Math.floor(1000 + Math.random() * 9000)}`,
      sourceLocation: location,
      destLocation: location, // In-place adjustment
      items: [{ productId: selectedProductId, quantity: logQty }],
      date: new Date().toISOString(),
      partnerId: 'Internal Audit'
    });

    // Direct update
    updateStock(selectedProductId, finalQty);
    
    setSuccessMsg(`Stock updated for ${selectedProduct.name} to ${finalQty} units.`);
    setTimeout(() => setSuccessMsg(''), 3000);
    
    // Reset
    setSelectedProductId('');
    setInputValue('');
    setReason('');
    setAdjustmentMode('overwrite');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Adjustment</h1>
       <p className="text-gray-500 dark:text-gray-400">Correct stock levels based on physical counts or incoming ad-hoc stock.</p>

       <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product</label>
              <select 
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors"
                value={selectedProductId}
                onChange={e => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  // If overwriting, default to current stock for easier editing
                  if (p && adjustmentMode === 'overwrite') setInputValue(p.stock.toString());
                  else setInputValue('');
                }}
              >
                <option value="">Select product to adjust...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Current: {p.stock} {p.uom})</option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                 <div>
                   <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Current Stock</span>
                   <div className="text-xl font-bold text-gray-800 dark:text-white">{selectedProduct.stock} {selectedProduct.uom}</div>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Value</span>
                   <div className="text-xl font-bold text-gray-800 dark:text-white">₹{(selectedProduct.stock * selectedProduct.price).toLocaleString('en-IN')}</div>
                 </div>
              </div>
            )}

            {/* Mode Selection */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adjustment Mode</label>
               <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentMode('overwrite');
                      if (selectedProduct) setInputValue(selectedProduct.stock.toString());
                    }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      adjustmentMode === 'overwrite' 
                      ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <RefreshCw size={16} />
                    Set Total Quantity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentMode('add');
                      setInputValue('');
                    }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      adjustmentMode === 'add' 
                      ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <Plus size={16} />
                    Add to Stock
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <select 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg transition-colors"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                >
                  {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {adjustmentMode === 'overwrite' ? 'New Total Quantity' : 'Quantity to Add'}
                </label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 font-bold text-lg transition-colors"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={adjustmentMode === 'add' ? "e.g., 50" : "e.g., 100"}
                />
              </div>
            </div>

            {/* Calculation Preview */}
            {selectedProduct && inputValue && adjustmentMode === 'add' && (
               <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                  <span>{selectedProduct.stock} (Current)</span>
                  <Plus size={14} />
                  <span>{inputValue || 0} (Adding)</span>
                  <ArrowRight size={14} />
                  <span className="font-bold text-lg">{selectedProduct.stock + (parseInt(inputValue) || 0)} Total</span>
               </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Adjustment</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg transition-colors"
                  placeholder="e.g., Annual Audit, Damage, Found Stock..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
            </div>

            <div className="pt-4">
               <button 
                 type="submit" 
                 disabled={!selectedProductId}
                 className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-medium transition-colors shadow ${
                   !selectedProductId ? 'bg-gray-300 dark:bg-gray-700' :
                   adjustmentMode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary-600 hover:bg-primary-700'
                 }`}
               >
                 <Save size={20} />
                 <span>{adjustmentMode === 'add' ? 'Add Stock' : 'Update Stock Level'}</span>
               </button>
            </div>
         </form>
         
         {successMsg && (
           <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800 animate-pulse flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
             {successMsg}
           </div>
         )}
       </div>
    </div>
  );
};
