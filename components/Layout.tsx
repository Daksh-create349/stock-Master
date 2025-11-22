
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  History, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  Box,
  Users,
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Warehouse
} from 'lucide-react';
import { AIAssistant } from './AIAssistant';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
      ? 'bg-primary-600 text-white' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC = () => {
  const { currentUser, logout, notifications, removeNotification } = useInventory();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const unreadCount = notifications.length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
           <div className="bg-primary-600 p-1.5 rounded mr-2">
              <Box className="text-white" size={20}/>
           </div>
           <span className="text-xl font-bold text-gray-800 dark:text-white">StockMaster</span>
        </div>

        <div className="px-4 pt-4">
           <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 p-3 rounded-lg flex items-start gap-3">
              <Warehouse size={18} className="text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                 <p className="text-xs text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wide">Active Warehouse</p>
                 <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={currentUser?.warehouse}>
                    {currentUser?.warehouse}
                 </p>
              </div>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 pt-2">Main</div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
          <SidebarItem to="/products" icon={Package} label="Products" active={isActive('/products')} />
          <SidebarItem to="/operations" icon={ArrowRightLeft} label="Operations" active={isActive('/operations')} />
          <SidebarItem to="/contacts" icon={Users} label="Contacts" active={isActive('/contacts')} />
          <SidebarItem to="/history" icon={History} label="Move History" active={isActive('/history')} />
          
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 pt-6">System</div>
          <SidebarItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Logout / Switch</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-20 transition-colors">
          <div className="flex items-center md:hidden">
             <div className="bg-primary-600 p-1.5 rounded mr-2">
                <Box className="text-white" size={20}/>
             </div>
             <span className="text-lg font-bold text-gray-800 dark:text-white">StockMaster</span>
          </div>
          
          {/* Spacer for desktop to push bell to right */}
          <div className="hidden md:block flex-1"></div>

          <div className="flex items-center gap-4">
             {/* Notifications */}
             <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                       <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">Notifications</h4>
                       <span className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} new</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                       {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                       ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className="p-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex gap-3 relative group">
                               <div className={`mt-1 flex-shrink-0 ${
                                 notif.type === 'success' ? 'text-green-500' : 
                                 notif.type === 'error' ? 'text-red-500' : 'text-blue-500'
                               }`}>
                                  {notif.type === 'success' ? <CheckCircle size={16}/> : 
                                   notif.type === 'error' ? <AlertCircle size={16}/> : <Info size={16}/>}
                               </div>
                               <div className="flex-1">
                                 <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">{notif.message}</p>
                                 <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                               </div>
                               <button onClick={() => removeNotification(notif.id)} className="absolute right-2 top-2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100">
                                 <X size={14}/>
                               </button>
                            </div>
                          ))
                       )}
                    </div>
                  </div>
                )}
             </div>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-400 md:hidden ml-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 z-10 pt-20 px-4 space-y-2 md:hidden">
             <div className="px-4 pb-2">
               <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Context</p>
               <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                 <Warehouse size={16} className="text-primary-600 dark:text-primary-400" />
                 <span className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.warehouse}</span>
               </div>
             </div>
             <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
             <SidebarItem to="/products" icon={Package} label="Products" active={isActive('/products')} />
             <SidebarItem to="/operations" icon={ArrowRightLeft} label="Operations" active={isActive('/operations')} />
             <SidebarItem to="/contacts" icon={Users} label="Contacts" active={isActive('/contacts')} />
             <SidebarItem to="/history" icon={History} label="Move History" active={isActive('/history')} />
             <SidebarItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
             <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-600">
               <LogOut size={20} />
               <span className="font-medium">Logout / Switch</span>
             </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors relative">
          <Outlet />
        </main>
        
        <AIAssistant />
      </div>
    </div>
  );
};
