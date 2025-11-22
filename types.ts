
export enum OperationType {
  RECEIPT = 'Incoming Receipt',
  DELIVERY = 'Delivery Order',
  INTERNAL = 'Internal Transfer',
  ADJUSTMENT = 'Inventory Adjustment'
}

export enum OperationStatus {
  DRAFT = 'Draft',
  WAITING = 'Waiting',
  READY = 'Ready',
  SHIPPED = 'Shipped',
  DONE = 'Done',
  CANCELLED = 'Cancelled'
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string; // New
  category: string;
  uom: string; // Unit of Measure
  stock: number;
  location: string; // Simplified for this demo
  price: number;
  minStockRule: number;
}

export interface OperationItem {
  productId: string;
  quantity: number;
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  reference: string; // e.g., WH/IN/0001
  sourceLocation: string;
  destLocation: string;
  items: OperationItem[];
  date: string;
  partnerId?: string; // Changed from string to partnerId
}

export interface User {
  id: string;
  name: string;
  role: 'Manager' | 'Staff';
  email: string;
  warehouse: string; // Active warehouse context
}

export interface DashboardMetrics {
  totalProducts: number;
  lowStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfers: number;
}

// New Types
export interface Contact {
  id: string;
  name: string;
  type: 'Vendor' | 'Customer' | 'Internal';
  email: string;
  phone: string;
  address: string;
}

export interface WarehouseLocation {
  name: string;
  lat: number;
  lng: number;
  radius: number; // meters
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

// AI Command Types
export interface AICommandResponse {
  intent: 'CREATE_PRODUCT' | 'CREATE_OPERATION' | 'CHECK_STOCK' | 'UNKNOWN';
  data?: {
    productName?: string;
    quantity?: number;
    partnerName?: string;
    operationType?: 'IN' | 'OUT' | 'INT';
    targetLocation?: string;
  };
  reply: string;
}
