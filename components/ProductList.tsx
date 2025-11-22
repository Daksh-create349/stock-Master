
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, OperationType, OperationStatus } from '../types';
import { Plus, Search, Filter, MoreVertical, MapPin, X, ScanLine, PackagePlus } from 'lucide-react';
import { WAREHOUSES } from '../constants';

export const ProductList: React.FC = () => {
  const { products, addProduct, updateStock, addOperation } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick Add State
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [quickAddQty, setQuickAddQty] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', barcode: '', category: '', uom: 'Units', stock: 0, location: WAREHOUSES[0], minStockRule: 0, price: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.sku) {
      addProduct({
        id: `p-${Date.now()}`,
        ...formData as Product,
        barcode: formData.barcode || Math.floor(10000000 + Math.random() * 90000000).toString()
      });
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', barcode: '', category: '', uom: 'Units', stock: 0, location: WAREHOUSES[0], minStockRule: 0, price: 0 });
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quickAddQty);
    if (!quickAddProduct || isNaN(qty) || qty <= 0) return;

    const newStock = quickAddProduct.stock + qty;

    // Log Operation
    addOperation({
      id: `quick-add-${Date.now()}`,
      type: OperationType.ADJUSTMENT,
      status: OperationStatus.DONE,
      reference: `ADJ/QUICK/${Math.floor(1000 + Math.random() * 9000)}`,
      sourceLocation: 'Adjustment',
      destLocation: quickAddProduct.location,
      items: [{ productId: quickAddProduct.id, quantity: qty }],
      date: new Date().toISOString(),
      partnerId: undefined
    });

    // Update Stock
    updateStock(quickAddProduct.id, newStock);
    
    // Reset
    setQuickAddProduct(null);
    setQuickAddQty('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Create Product</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search name, SKU, or barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Barcode</th>
                <th className="px-6 py-3 font-medium">Internal Ref</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium text-right">On Hand</th>
                <th className="px-6 py-3 font-medium text-right">Price</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                     <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded px-2 py-0.5">
                        <ScanLine size={14} className="text-gray-400"/>
                        {product.barcode}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400"/>
                      {product.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-medium ${product.stock <= product.minStockRule ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {product.stock} {product.uom}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setQuickAddProduct(product)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                        title="Quick Add Stock"
                      >
                        <PackagePlus size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU / Internal Reference</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode (Optional)</label>
                  <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="Leave blank to auto-generate"
                    value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Tools">Tools</option>
                    <option value="Safety Gear">Safety Gear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit of Measure</label>
                  <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})} />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Stock</label>
                   <input type="number" min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Stock Rule</label>
                   <input type="number" min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.minStockRule} onChange={e => setFormData({...formData, minStockRule: Number(e.target.value)})} />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Location</label>
                   <select className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                    {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Price (INR)</label>
                   <input type="number" min="0" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Stock Add</h3>
              <button onClick={() => setQuickAddProduct(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleQuickAddSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product Details</label>
                <div className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{quickAddProduct.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Stock: <span className="font-mono font-medium">{quickAddProduct.stock} {quickAddProduct.uom}</span></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity to Add</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Plus size={18} className="text-gray-400" />
                  </div>
                  <input 
                    required 
                    autoFocus
                    type="number" 
                    min="1"
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors text-xl font-bold"
                    placeholder="0"
                    value={quickAddQty} 
                    onChange={e => setQuickAddQty(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setQuickAddProduct(null)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow flex items-center gap-2">
                   <PackagePlus size={18} />
                   <span>Add to Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
