
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Operation, OperationType, OperationStatus, User, Contact, Notification, WarehouseLocation } from '../types';
import { INITIAL_PRODUCTS, INITIAL_OPERATIONS, INITIAL_CONTACTS, WAREHOUSE_LOCATIONS, calculateDistance, WAREHOUSES } from '../constants';
import { interpretCommand } from '../services/geminiService';

interface InventoryContextType {
  products: Product[];
  operations: Operation[];
  contacts: Contact[];
  currentUser: User | null;
  notifications: Notification[];
  
  // Geofencing State
  isGeofencingEnabled: boolean;
  userLocation: { lat: number; lng: number } | null;
  toggleGeofencing: (enabled: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  fetchRealLocation: () => void;

  // Theme State
  theme: 'light' | 'dark';
  toggleTheme: (theme: 'light' | 'dark') => void;

  login: (email: string, warehouse: string) => void;
  logout: () => void;
  addProduct: (product: Product) => void;
  addOperation: (op: Operation) => void;
  validateOperation: (opId: string) => void;
  updateStock: (productId: string, newQty: number) => void;
  
  addContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;

  // AI
  processVoiceCommand: (text: string) => Promise<string>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  // Geofencing
  const [isGeofencingEnabled, setIsGeofencingEnabled] = useState(false);
  // Default to null to trigger auto-fetch or fallback to warehouse location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [{ id, type, message, timestamp: Date.now() }, ...prev]);
    // Auto dismiss after 5s
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchRealLocation = () => {
    if (!navigator.geolocation) {
      addNotification('error', 'Geolocation is not supported by your browser');
      return;
    }

    addNotification('info', 'Fetching GPS location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        addNotification('success', 'Location updated via GPS');
      },
      (error) => {
        addNotification('error', `GPS Error: ${error.message}. Ensure permissions are allowed.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const login = (email: string, warehouse: string) => {
    setCurrentUser({
      id: 'u1',
      name: email.split('@')[0],
      email,
      role: 'Manager',
      warehouse
    });
    addNotification('success', `Welcome to ${warehouse}, ${email.split('@')[0]}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    addNotification('info', 'Logged out successfully.');
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
    addNotification('success', `Product ${product.name} created.`);
  };

  const addOperation = (op: Operation) => {
    setOperations(prev => [op, ...prev]);
    addNotification('info', `${op.type} created (${op.reference}).`);
  };

  const addContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
    addNotification('success', `Contact ${contact.name} added.`);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    addNotification('info', 'Contact removed.');
  };

  const updateStock = (productId: string, newQty: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newQty } : p));
    addNotification('success', 'Stock adjusted manually.');
  };

  const validateOperation = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;
    if (op.status === OperationStatus.DONE) return; 

    // Handle Shipped -> Done transition for Deliveries (No stock change, just status update)
    if (op.type === OperationType.DELIVERY && op.status === OperationStatus.SHIPPED) {
       setOperations(prev => prev.map(o => o.id === opId ? { ...o, status: OperationStatus.DONE } : o));
       addNotification('success', 'Delivery marked as completed.');
       return;
    }

    // --- Geofencing Check ---
    if (isGeofencingEnabled && userLocation) {
      let requiredLocationName = '';
      if (op.type === OperationType.RECEIPT) requiredLocationName = op.destLocation;
      else requiredLocationName = op.sourceLocation;

      const whData = WAREHOUSE_LOCATIONS[requiredLocationName];
      
      if (whData) {
         const distance = calculateDistance(userLocation.lat, userLocation.lng, whData.lat, whData.lng);
         if (distance > whData.radius) {
           addNotification('error', `Geofence Violation: You are ${Math.round(distance)}m away from ${requiredLocationName}. Operation blocked.`);
           return;
         }
      }
    }

    // --- Stock Availability Check ---
    if (op.type === OperationType.DELIVERY || op.type === OperationType.INTERNAL) {
       const insufficientStock = op.items.some(item => {
          const prod = products.find(p => p.id === item.productId);
          return !prod || prod.stock < item.quantity;
       });
       
       if (insufficientStock) {
         addNotification('error', `Validation Failed: Insufficient stock for one or more items.`);
         return;
       }
    }

    // Update product stocks
    const updatedProducts = [...products];
    
    op.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex > -1) {
        const product = { ...updatedProducts[productIndex] };
        
        if (op.type === OperationType.RECEIPT) {
          product.stock += item.quantity;
        } else if (op.type === OperationType.DELIVERY) {
          product.stock -= item.quantity;
        } else if (op.type === OperationType.INTERNAL) {
          product.location = op.destLocation; 
        }
        updatedProducts[productIndex] = product;
      }
    });

    setProducts(updatedProducts);

    // Calculate next status
    const nextStatus = op.type === OperationType.DELIVERY ? OperationStatus.SHIPPED : OperationStatus.DONE;

    setOperations(prev => prev.map(o => o.id === opId ? { ...o, status: nextStatus } : o));

    addNotification('success', op.type === OperationType.DELIVERY ? 'Order marked as Shipped.' : 'Operation validated successfully.');
  };

  // --- AI COMMAND PROCESSOR ---
  const processVoiceCommand = async (text: string): Promise<string> => {
    try {
      const result = await interpretCommand(
        text, 
        products.map(p => p.name), 
        contacts.map(c => c.name)
      );

      if (result.intent === 'UNKNOWN') return result.reply;

      // Intent: CHECK_STOCK
      if (result.intent === 'CHECK_STOCK' && result.data?.productName) {
        const p = products.find(prod => prod.name.toLowerCase().includes(result.data!.productName!.toLowerCase()));
        if (p) {
           return `We have ${p.stock} units of ${p.name} in ${p.location}.`;
        }
        return `I couldn't find a product named ${result.data.productName}.`;
      }

      // Intent: CREATE_PRODUCT
      if (result.intent === 'CREATE_PRODUCT' && result.data?.productName) {
        const newProd: Product = {
          id: `p-${Date.now()}`,
          name: result.data.productName,
          sku: `AUTO-${Math.floor(Math.random()*9000)}`,
          barcode: Math.floor(10000000 + Math.random() * 90000000).toString(),
          category: 'Uncategorized',
          uom: 'Units',
          stock: result.data.quantity || 0,
          location: currentUser?.warehouse || WAREHOUSES[0],
          price: 0,
          minStockRule: 10
        };
        addProduct(newProd);
        return result.reply || `Created new product: ${result.data.productName}`;
      }

      // Intent: CREATE_OPERATION
      if (result.intent === 'CREATE_OPERATION') {
        const { productName, quantity = 1, partnerName, operationType } = result.data!;
        const p = products.find(prod => prod.name.toLowerCase().includes(productName?.toLowerCase() || ''));
        
        if (!p) return `Could not identify product: ${productName}`;

        const partner = contacts.find(c => c.name.toLowerCase().includes(partnerName?.toLowerCase() || ''));
        
        // Determine Type & Context based on current User Warehouse
        let type = OperationType.INTERNAL;
        let source = currentUser?.warehouse || WAREHOUSES[0];
        let dest = currentUser?.warehouse || WAREHOUSES[0];

        if (operationType === 'IN') {
            type = OperationType.RECEIPT;
            source = 'Vendor';
            dest = currentUser?.warehouse || WAREHOUSES[0];
        } else if (operationType === 'OUT') {
            type = OperationType.DELIVERY;
            source = currentUser?.warehouse || WAREHOUSES[0];
            dest = 'Customer';
        }

        addOperation({
           id: `op-ai-${Date.now()}`,
           type,
           status: OperationStatus.DRAFT,
           reference: `AI/${type === OperationType.RECEIPT ? 'IN' : 'OUT'}/${Math.floor(Math.random()*1000)}`,
           sourceLocation: source,
           destLocation: dest,
           items: [{ productId: p.id, quantity }],
           date: new Date().toISOString(),
           partnerId: partner?.id
        });

        return result.reply;
      }

      return "I understood the intent but was unable to execute the parameter match.";

    } catch (e) {
      console.error(e);
      return "System error processing voice command.";
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      products, 
      operations, 
      contacts,
      currentUser, 
      notifications,
      isGeofencingEnabled,
      userLocation,
      toggleGeofencing: setIsGeofencingEnabled,
      setUserLocation,
      fetchRealLocation,
      theme,
      toggleTheme,
      login, 
      logout,
      addProduct,
      addOperation,
      validateOperation,
      updateStock,
      addContact,
      deleteContact,
      addNotification,
      removeNotification,
      processVoiceCommand
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within an InventoryProvider");
  return context;
};
