import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { WarehouseLocation } from '../types';
import { calculateDistance } from '../constants';
import { Locate, Navigation } from 'lucide-react';

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  warehouses: Record<string, WarehouseLocation>;
  onLocationSelect?: (lat: number, lng: number) => void;
  onLocate?: () => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({ userLocation, warehouses, onLocationSelect, onLocate }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [nearestInfo, setNearestInfo] = useState<{name: string, dist: number} | null>(null);

  // Auto-locate on mount
  useEffect(() => {
    if (onLocate && !userLocation) {
      // Trigger location fetch immediately when map loads if no location is set
      onLocate();
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const warehousesList = Object.values(warehouses) as WarehouseLocation[];
    const firstWH = warehousesList[0];
    const startLat = userLocation?.lat || firstWH?.lat || 19.0760; // Default Mumbai
    const startLng = userLocation?.lng || firstWH?.lng || 72.8777;

    // Define Layers
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      layers: [streetLayer] // Default layer
    }).setView([startLat, startLng], 11);

    // Add Layer Control
    const baseMaps = {
      "Street Map": streetLayer,
      "Satellite": satelliteLayer
    };
    
    L.control.layers(baseMaps, undefined, { position: 'bottomright' }).addTo(mapRef.current);

    // Add Zoom Control to top-left
    L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    mapRef.current.on('click', (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    });
    
    // Force resize handling
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    const layerGroup = markersRef.current;
    layerGroup.clearLayers();

    let nearest: WarehouseLocation | null = null;
    let minDst = Infinity;

    // 1. Draw Warehouses
    (Object.values(warehouses) as WarehouseLocation[]).forEach(wh => {
      // Geofence Circle
      L.circle([wh.lat, wh.lng], {
        color: '#4f46e5',
        fillColor: '#818cf8',
        fillOpacity: 0.2,
        radius: wh.radius
      }).addTo(layerGroup);

      // Center Marker
      const whIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #4f46e5; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      L.marker([wh.lat, wh.lng], { icon: whIcon })
        .bindPopup(`<b>${wh.name}</b><br>Radius: ${wh.radius}m`)
        .addTo(layerGroup);

      // Calculate nearest if user location exists
      if (userLocation) {
        const dst = calculateDistance(userLocation.lat, userLocation.lng, wh.lat, wh.lng);
        if (dst < minDst) {
          minDst = dst;
          nearest = wh;
        }
      }
    });

    // 2. Draw User & Route
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #ef4444; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup('<b>You are here</b>')
        .addTo(layerGroup);

      // Fly to user
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.5
      });

      if (nearest) {
        const nWh = nearest as WarehouseLocation;
        setNearestInfo({ name: nWh.name, dist: minDst });
        
        // Draw dashed line to nearest warehouse
        L.polyline([[userLocation.lat, userLocation.lng], [nWh.lat, nWh.lng]], {
          color: '#ef4444',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10'
        }).addTo(layerGroup);
      }
    } else {
        setNearestInfo(null);
    }

  }, [userLocation, warehouses]);

  return (
    <div className="relative w-full h-full group">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {onLocate && (
            <button 
                onClick={onLocate}
                className="bg-white dark:bg-gray-800 p-2.5 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-all hover:scale-105"
                title="Locate Me"
            >
                <Locate size={20} />
            </button>
        )}
      </div>

      {/* Nearest Warehouse Info Overlay */}
      {nearestInfo && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-[400] animate-fade-in">
           <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/50 p-2.5 rounded-full text-green-600 dark:text-green-400 flex-shrink-0">
                 <Navigation size={20} />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-0.5">Nearest Warehouse</p>
                 <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {nearestInfo.name}
                 </p>
                 <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                    {(nearestInfo.dist).toFixed(0)} meters away
                 </p>
              </div>
           </div>
        </div>
      )}
      
      {!userLocation && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-[400] pointer-events-none whitespace-nowrap">
            Fetching location...
         </div>
      )}
    </div>
  );
};