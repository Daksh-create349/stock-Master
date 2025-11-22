
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Box, Warehouse } from 'lucide-react';
import { WAREHOUSES } from '../constants';

export const LoginScreen: React.FC = () => {
  const { login } = useInventory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warehouse, setWarehouse] = useState('Main Warehouse');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, warehouse);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors border border-transparent dark:border-gray-700">
        <div className="bg-primary-600 p-8 text-center">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
              <Box className="text-primary-600" size={32} />
           </div>
           <h1 className="text-3xl font-bold text-white">StockMaster</h1>
           <p className="text-primary-100 mt-2">Modular Inventory Management System</p>
        </div>
        
        <div className="p-8">
           <form onSubmit={handleLogin} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
               <input 
                 type="email" 
                 required 
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                 placeholder="manager@company.com"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Warehouse</label>
               <div className="relative">
                  <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                    value={warehouse}
                    onChange={e => setWarehouse(e.target.value)}
                  >
                    {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
               <input 
                 type="password" 
                 required 
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                 placeholder="Enter password for warehouse access"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
             </div>

             <button 
               type="submit" 
               className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
             >
               Sign In
             </button>
           </form>
           
           <div className="mt-6 text-center">
             <a href="#" className="text-sm text-primary-600 hover:underline dark:text-primary-400">Forgot password?</a>
           </div>
        </div>
      </div>
    </div>
  );
};
