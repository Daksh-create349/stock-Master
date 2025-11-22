import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Contact } from '../types';
import { Plus, Search, User, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';

export const Contacts: React.FC = () => {
  const { contacts, addContact, deleteContact } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '', type: 'Vendor', email: '', phone: '', address: ''
  });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type) {
      addContact({
        id: `c-${Date.now()}`,
        ...formData as Contact
      });
      setIsModalOpen(false);
      setFormData({ name: '', type: 'Vendor', email: '', phone: '', address: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Contacts</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <input 
                 type="text" 
                 placeholder="Search partners..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
               />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
           {filteredContacts.map(contact => (
             <div key={contact.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all bg-white dark:bg-gray-800 relative group">
                <button 
                  onClick={() => deleteContact(contact.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                   <Trash2 size={18} />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      contact.type === 'Vendor' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                   }`}>
                      {contact.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{contact.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        contact.type === 'Vendor' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }`}>{contact.type}</span>
                   </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                   <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400"/>
                      <span className="truncate">{contact.email}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400"/>
                      <span>{contact.phone}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400"/>
                      <span className="truncate">{contact.address}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Partner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option value="Vendor">Vendor</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="tel" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};