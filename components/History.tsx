import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { OperationStatus } from '../types';

export const History: React.FC = () => {
  const { operations } = useInventory();
  const doneOps = operations.filter(o => o.status === OperationStatus.DONE || o.status === OperationStatus.SHIPPED);

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Move History</h1>
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
               <tr>
                 <th className="px-6 py-3">Date</th>
                 <th className="px-6 py-3">Reference</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3">From</th>
                 <th className="px-6 py-3">To</th>
                 <th className="px-6 py-3 text-right">Items</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
               {doneOps.map(op => (
                 <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(op.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{op.reference}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        op.status === 'Done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{op.sourceLocation}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{op.destLocation}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">{op.items.reduce((acc, i) => acc + i.quantity, 0)} units</td>
                 </tr>
               ))}
               {doneOps.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">No movement history recorded yet.</td></tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
};