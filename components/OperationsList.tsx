
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Operation, OperationStatus, OperationType, Product } from '../types';
import { Plus, Check, X, ArrowRight, ClipboardList, AlertTriangle, MapPin, ScanLine, Truck, PackageCheck, FileText, Download } from 'lucide-react';
import { WAREHOUSES } from '../constants';

const OperationModal = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: OperationType }) => {
  const { products, addOperation, contacts, currentUser } = useInventory();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([{ productId: '', quantity: 0 }]);
  const [partnerId, setPartnerId] = useState('');
  
  // Initialize locations based on Current User's Warehouse Context
  const currentWarehouse = currentUser?.warehouse || WAREHOUSES[0];
  
  const [source, setSource] = useState(type === OperationType.RECEIPT ? 'Vendor' : currentWarehouse);
  const [dest, setDest] = useState(type === OperationType.DELIVERY ? 'Customer' : type === OperationType.RECEIPT ? currentWarehouse : WAREHOUSES[0]);

  // Filter partners based on operation type
  const partnerOptions = contacts.filter(c => 
    type === OperationType.RECEIPT ? c.type === 'Vendor' : 
    type === OperationType.DELIVERY ? c.type === 'Customer' : false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) return;

    const newOp: Operation = {
      id: `op-${Date.now()}`,
      type,
      status: OperationStatus.DRAFT,
      reference: `WH/${type === OperationType.RECEIPT ? 'IN' : type === OperationType.DELIVERY ? 'OUT' : 'INT'}/${Math.floor(1000 + Math.random() * 9000)}`,
      sourceLocation: source,
      destLocation: dest,
      items: validItems,
      date: new Date().toISOString(),
      partnerId: partnerId || undefined
    };
    addOperation(newOp);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="flex justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">New {type}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Operating from: {currentWarehouse}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             {type !== OperationType.INTERNAL && (
               <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partner</label>
                 <select className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" value={partnerId} onChange={e => setPartnerId(e.target.value)}>
                   <option value="">Select Partner</option>
                   {partnerOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
             )}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Location</label>
               <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-700" 
                  value={source} 
                  onChange={e => setSource(e.target.value)} 
                  disabled={type === OperationType.RECEIPT || type === OperationType.DELIVERY || type === OperationType.INTERNAL}
               >
                 {type === OperationType.RECEIPT && <option value="Vendor">Vendor</option>}
                 {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
               </select>
               {type !== OperationType.RECEIPT && (
                 <p className="text-xs text-gray-400 mt-1">Locked to current warehouse</p>
               )}
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Location</label>
               <select 
                 className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-700" 
                 value={dest} 
                 onChange={e => setDest(e.target.value)} 
                 disabled={type === OperationType.DELIVERY || type === OperationType.RECEIPT}
               >
                 {type === OperationType.DELIVERY && <option value="Customer">Customer</option>}
                 {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
               </select>
               {type === OperationType.RECEIPT && (
                 <p className="text-xs text-gray-400 mt-1">Locked to current warehouse</p>
               )}
             </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
               <span>Items</span>
               <span className="text-xs text-gray-400 flex items-center gap-1"><ScanLine size={12}/> Scan Barcode supported</span>
            </label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <select 
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" 
                  value={item.productId} 
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].productId = e.target.value;
                    setItems(newItems);
                  }}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Stock: {p.stock}</option>)}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  className="w-24 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" 
                  placeholder="Qty" 
                  value={item.quantity} 
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].quantity = Number(e.target.value);
                    setItems(newItems);
                  }} 
                  required
                />
                {idx === items.length - 1 && (
                  <button type="button" onClick={() => setItems([...items, {productId: '', quantity: 0}])} className="p-2 text-primary-600 dark:text-primary-400">
                    <Plus />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 shadow">Save & Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const OperationsList: React.FC = () => {
  const { operations, validateOperation, products, contacts, isGeofencingEnabled, currentUser } = useInventory();
  const [activeTab, setActiveTab] = useState<OperationType | 'ALL'>('ALL');
  const [createModalType, setCreateModalType] = useState<OperationType | null>(null);

  const currentWarehouse = currentUser?.warehouse || '';

  // Filter operations relevant to current user's warehouse context
  const relevantOps = operations.filter(op => 
    op.sourceLocation === currentWarehouse || op.destLocation === currentWarehouse
  );

  const filteredOps = relevantOps.filter(op => activeTab === 'ALL' || op.type === activeTab);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getPartnerName = (id?: string) => contacts.find(c => c.id === id)?.name || 'Unknown Partner';

  const handlePrintReceipt = (op: Operation) => {
    const opDate = new Date(op.date).toLocaleDateString();
    const opTime = new Date(op.date).toLocaleTimeString();
    
    // Company/Warehouse Info
    const companyInfo = {
       name: 'StockMaster Logistics Ltd.',
       address: 'Unit 402, Tech Park, Andheri East, Mumbai, MH 400072',
       phone: '+91 22 2850 1234',
       gstin: '27AABCU9603R1ZM'
    };

    // Resolve Sender & Receiver
    let sender = { name: '', address: '', phone: '', label: 'Sender' };
    let receiver = { name: '', address: '', phone: '', label: 'Receiver' };
    
    const partner = contacts.find(c => c.id === op.partnerId);
    
    if (op.type === OperationType.RECEIPT) {
       // Vendor sending to Us
       sender = {
          name: partner?.name || 'Unknown Vendor',
          address: partner?.address || 'Address Not Available',
          phone: partner?.phone || 'Phone Not Available',
          label: 'Vendor (From)'
       };
       receiver = {
          name: `${companyInfo.name} (${op.destLocation})`,
          address: companyInfo.address,
          phone: companyInfo.phone,
          label: 'Warehouse (To)'
       };
    } else if (op.type === OperationType.DELIVERY) {
       // Us sending to Customer
       sender = {
          name: `${companyInfo.name} (${op.sourceLocation})`,
          address: companyInfo.address,
          phone: companyInfo.phone,
          label: 'Warehouse (From)'
       };
       receiver = {
          name: partner?.name || 'Unknown Customer',
          address: partner?.address || 'Address Not Available',
          phone: partner?.phone || 'Phone Not Available',
          label: 'Customer (To)'
       };
    } else {
       // Internal
       sender = { name: op.sourceLocation, address: companyInfo.address, phone: companyInfo.phone, label: 'Source Warehouse' };
       receiver = { name: op.destLocation, address: companyInfo.address, phone: companyInfo.phone, label: 'Destination Warehouse' };
    }

    // Calculate Financials
    let totalUnits = 0;
    let subtotal = 0;

    const lineItems = op.items.map(item => {
       const product = products.find(p => p.id === item.productId);
       const qty = item.quantity;
       const rate = product?.price || 0;
       const amount = qty * rate;
       totalUnits += qty;
       subtotal += amount;

       return {
          name: product?.name || 'Unknown Item',
          sku: product?.sku || '-',
          qty,
          rate,
          amount,
          uom: product?.uom || 'Units'
       };
    });

    // Charges & Tax
    const shippingCharge = op.type === OperationType.INTERNAL ? 0 : 150.00;
    const handlingCharge = op.type === OperationType.INTERNAL ? 0 : 50.00;
    const taxableAmount = subtotal + shippingCharge + handlingCharge;
    const gstRate = 0.18; // 18% GST
    const gstAmount = taxableAmount * gstRate;
    const grandTotal = taxableAmount + gstAmount;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${op.reference}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; max-width: 850px; margin: 0 auto; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px; }
          .brand { font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
          .brand-sub { font-size: 14px; color: #6b7280; font-weight: 500; margin-top: 4px; }
          .invoice-title { font-size: 24px; font-weight: 700; text-transform: uppercase; color: #111827; text-align: right; }
          .meta-table { text-align: right; margin-top: 8px; font-size: 14px; }
          .meta-table td { padding: 2px 0 2px 16px; }
          .meta-label { color: #6b7280; font-weight: 500; }
          .meta-val { font-weight: 600; }

          .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 40px; }
          .addr-box h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
          .addr-name { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
          .addr-text { font-size: 14px; color: #4b5563; margin-bottom: 2px; }

          table.items { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px; }
          table.items th { background: #f9fafb; text-align: left; padding: 12px 16px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
          table.items td { padding: 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937; }
          table.items tr:last-child td { border-bottom: none; }
          .text-right { text-align: right; }
          .font-mono { font-family: monospace; color: #6b7280; }

          .summary-section { display: flex; justify-content: flex-end; }
          .summary-table { width: 350px; font-size: 14px; }
          .summary-table td { padding: 6px 0; }
          .summary-label { color: #6b7280; }
          .summary-val { text-align: right; font-weight: 600; }
          .total-row td { border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 6px; font-size: 16px; font-weight: 700; color: #111827; }

          .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #e0e7ff; color: #4338ca; margin-top: 8px; }
          .status-done { background: #dcfce7; color: #166534; }

          @media print {
             body { padding: 0; max-width: 100%; }
             .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">StockMaster</div>
            <div class="brand-sub">Inventory Management System</div>
            <div style="margin-top: 16px; font-size: 13px; color: #6b7280;">
               <b>GSTIN:</b> ${companyInfo.gstin}<br>
               <b>Support:</b> support@stockmaster.com
            </div>
          </div>
          <div>
            <div class="invoice-title">${op.type === OperationType.DELIVERY ? 'TAX INVOICE' : 'RECEIPT VOUCHER'}</div>
            <div style="text-align: right;"><span class="status-badge ${op.status === 'Done' ? 'status-done' : ''}">${op.status}</span></div>
            <table class="meta-table" align="right">
               <tr><td class="meta-label">Reference:</td><td class="meta-val">${op.reference}</td></tr>
               <tr><td class="meta-label">Date:</td><td class="meta-val">${opDate}</td></tr>
               <tr><td class="meta-label">Time:</td><td class="meta-val">${opTime}</td></tr>
            </table>
          </div>
        </div>

        <div class="addresses">
           <div class="addr-box">
              <h3>${sender.label}</h3>
              <div class="addr-name">${sender.name}</div>
              <div class="addr-text">${sender.address}</div>
              <div class="addr-text"><b>Tel:</b> ${sender.phone}</div>
           </div>
           <div class="addr-box">
              <h3>${receiver.label}</h3>
              <div class="addr-name">${receiver.name}</div>
              <div class="addr-text">${receiver.address}</div>
              <div class="addr-text"><b>Tel:</b> ${receiver.phone}</div>
           </div>
        </div>

        <table class="items">
           <thead>
              <tr>
                 <th style="width: 40%">Item Description</th>
                 <th style="width: 20%">SKU</th>
                 <th class="text-right" style="width: 10%">Qty</th>
                 <th class="text-right" style="width: 15%">Rate</th>
                 <th class="text-right" style="width: 15%">Amount</th>
              </tr>
           </thead>
           <tbody>
              ${lineItems.map(item => `
                <tr>
                   <td>
                      <div style="font-weight: 600;">${item.name}</div>
                   </td>
                   <td class="font-mono">${item.sku}</td>
                   <td class="text-right"><b>${item.qty}</b> <span style="font-size:11px;color:#6b7280">${item.uom}</span></td>
                   <td class="text-right">$${item.rate.toFixed(2)}</td>
                   <td class="text-right">$${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
           </tbody>
        </table>

        <div class="summary-section">
           <table class="summary-table">
              <tr>
                 <td class="summary-label">Total Units</td>
                 <td class="summary-val">${totalUnits}</td>
              </tr>
              <tr>
                 <td class="summary-label">Subtotal</td>
                 <td class="summary-val">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                 <td class="summary-label">Shipping Charges</td>
                 <td class="summary-val">$${shippingCharge.toFixed(2)}</td>
              </tr>
              <tr>
                 <td class="summary-label">Handling / Packing</td>
                 <td class="summary-val">$${handlingCharge.toFixed(2)}</td>
              </tr>
              <tr>
                 <td class="summary-label">GST (18%)</td>
                 <td class="summary-val">$${gstAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                 <td>Grand Total</td>
                 <td class="text-right">$${grandTotal.toFixed(2)}</td>
              </tr>
           </table>
        </div>

        <div style="margin-top: 40px;">
           <p style="font-size: 13px; color: #4b5563;"><b>Amount in Words:</b> ${grandTotal.toFixed(0)} Dollars Only.</p>
        </div>

        <div class="footer">
           <p>Thank you for your business!</p>
           <p style="margin-top: 4px;">Registered Office: ${companyInfo.address}</p>
           <p>This is a computer generated document and does not require signature.</p>
        </div>

        <script>
           window.onload = () => { setTimeout(() => window.print(), 500); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Operations</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">
             Managing inventory for <span className="font-bold text-primary-600 dark:text-primary-400">{currentWarehouse}</span>
           </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCreateModalType(OperationType.RECEIPT)} className="px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 shadow-sm">Receive</button>
          <button onClick={() => setCreateModalType(OperationType.DELIVERY)} className="px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 shadow-sm">Deliver</button>
          <button onClick={() => setCreateModalType(OperationType.INTERNAL)} className="px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 shadow-sm">Transfer</button>
        </div>
      </div>

      {/* Geofencing Warning Banner */}
      {isGeofencingEnabled && (
         <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 flex items-start gap-3">
            <MapPin className="text-indigo-600 dark:text-indigo-400 mt-0.5" size={18} />
            <div>
               <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Geofencing Active</p>
               <p className="text-xs text-indigo-700 dark:text-indigo-300">Validation is restricted to user location. Ensure you are physically near the source/destination warehouse.</p>
            </div>
         </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {['ALL', OperationType.RECEIPT, OperationType.DELIVERY, OperationType.INTERNAL].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab 
              ? 'text-primary-600 dark:text-primary-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'ALL' ? 'All Operations' : tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Kanban / List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOps.map(op => (
          <div key={op.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{op.reference}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    op.type === OperationType.RECEIPT ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                    op.type === OperationType.DELIVERY ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>{op.type}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wide ${
                  op.status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                  op.status === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300' :
                  op.status === 'Ready' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {op.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                <span className="truncate max-w-[80px] font-medium" title={op.sourceLocation}>{op.sourceLocation}</span>
                <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate max-w-[80px] font-medium" title={op.destLocation}>{op.destLocation}</span>
              </div>

              {op.partnerId && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                   <span className="font-medium text-gray-700 dark:text-gray-300">Partner:</span> {getPartnerName(op.partnerId)}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase">Items</p>
                {op.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{getProductName(item.productId)}</span>
                    <span className="text-gray-900 dark:text-white font-medium">x{item.quantity}</span>
                  </div>
                ))}
                {op.items.length > 3 && <p className="text-xs text-gray-400 italic">+{op.items.length - 3} more</p>}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-xl flex justify-between items-center">
               <div>
                 {(op.status === OperationStatus.DONE || op.status === OperationStatus.SHIPPED) && (
                    <button 
                      onClick={() => handlePrintReceipt(op)}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                      title="Download Receipt"
                    >
                      <FileText size={16} />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>
                 )}
               </div>

               <div className="flex justify-end">
                {op.status !== OperationStatus.DONE && op.status !== OperationStatus.CANCELLED && (
                  <button 
                    onClick={() => validateOperation(op.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow ${
                      op.status === OperationStatus.SHIPPED 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {op.status === OperationStatus.SHIPPED ? (
                      <>
                          <PackageCheck size={16} />
                          <span>Mark Delivered</span>
                      </>
                    ) : (
                      <>
                          <Check size={16} />
                          <span>{op.type === OperationType.DELIVERY ? 'Ship Order' : 'Validate'}</span>
                      </>
                    )}
                  </button>
                )}
                {op.status === OperationStatus.DONE && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <ClipboardList size={16} />
                    <span>Completed</span>
                  </div>
                )}
               </div>
            </div>
          </div>
        ))}
        
        {filteredOps.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <ClipboardList size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No operations found</p>
              <p className="text-sm">There are no {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} records for {currentWarehouse}.</p>
           </div>
        )}
      </div>

      {createModalType && (
        <OperationModal 
          isOpen={!!createModalType} 
          onClose={() => setCreateModalType(null)} 
          type={createModalType} 
        />
      )}
    </div>
  );
};
