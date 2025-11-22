import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { WAREHOUSE_LOCATIONS } from '../constants';
import { MapPin, Shield, Navigation, Locate, Moon, Sun } from 'lucide-react';
import { LocationMap } from './LocationMap';

export const Settings: React.FC = () => {
  const { isGeofencingEnabled, toggleGeofencing, userLocation, setUserLocation, fetchRealLocation, theme, toggleTheme } = useInventory();
  
  const handleMapClick = (lat: number, lng: number) => {
     setUserLocation({ lat, lng });
  };

  const teleportTo = (locName: string) => {
    const loc = WAREHOUSE_LOCATIONS[locName];
    if (loc) {
      setUserLocation({ lat: loc.lat, lng: loc.lng });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
      
      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg">
              {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white">Appearance</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Customize how StockMaster looks on your device.</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <button 
               onClick={() => toggleTheme('light')}
               className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                  theme === 'light' 
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-gray-700 dark:border-primary-400 dark:text-white' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
               }`}
            >
               <Sun size={20} />
               <span className="font-medium">Light Mode</span>
            </button>
            <button 
               onClick={() => toggleTheme('dark')}
               className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                  theme === 'dark' 
                  ? 'border-primary-600 bg-gray-800 text-white' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
               }`}
            >
               <Moon size={20} />
               <span className="font-medium">Dark Mode</span>
            </button>
         </div>
      </div>

      {/* Security & Geofencing */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white">Security & Geofencing</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Restrict inventory operations to physical warehouse locations.</p>
            </div>
         </div>

         <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 mb-6">
            <div>
               <span className="font-medium text-gray-900 dark:text-white">Enable Geofencing Validation</span>
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Users must be within warehouse radius to validate moves.</p>
            </div>
            <button 
              onClick={() => toggleGeofencing(!isGeofencingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGeofencingEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-500'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${isGeofencingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
         </div>

         {/* Map Visualization */}
         <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-end mb-4">
               <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Navigation size={16}/>
                  Location Manager
               </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Map Container */}
               <div className="lg:col-span-2 h-96 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 shadow-inner relative">
                  <LocationMap 
                    userLocation={userLocation} 
                    warehouses={WAREHOUSE_LOCATIONS}
                    onLocationSelect={handleMapClick}
                    onLocate={fetchRealLocation}
                  />
               </div>

               {/* Controls */}
               <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 p-3 rounded-lg">
                     <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200 uppercase mb-1">Current Position</p>
                     <div className="text-sm font-mono text-yellow-900 dark:text-yellow-100">
                        Lat: {userLocation?.lat.toFixed(5)}<br/>
                        Lng: {userLocation?.lng.toFixed(5)}
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Teleport to...</label>
                     <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {Object.values(WAREHOUSE_LOCATIONS).map(wh => (
                          <button 
                            key={wh.name}
                            onClick={() => teleportTo(wh.name)}
                            className="w-full flex items-center justify-between p-2 text-left text-sm border rounded hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors group"
                          >
                            <span className="truncate w-32">{wh.name}</span>
                            <MapPin size={14} className="text-gray-400 group-hover:text-indigo-500 flex-shrink-0"/>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
         <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Warehouse Configuration</h3>
         <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.values(WAREHOUSE_LOCATIONS).map(wh => (
               <div key={wh.name} className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-0">
                  <div>
                     <span className="font-medium text-gray-900 dark:text-white">{wh.name}</span>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Radius: {wh.radius}m • Lat: {wh.lat} • Lng: {wh.lng}</p>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">Active</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};