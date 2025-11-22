import { Product, Operation, OperationType, OperationStatus, WarehouseLocation, Contact } from './types';

// Helper to generate realistic-looking Mumbai warehouse locations
const generateMumbaiLocations = () => {
  const locations: Record<string, WarehouseLocation> = {};
  const names: string[] = [];
  
  // 50+ Locations covering Mumbai, Navi Mumbai, Thane, and suburbs
  const mumbaiAreas = [
    { name: 'Andheri East Hub', lat: 19.1136, lng: 72.8697 },
    { name: 'Bandra Terminus Depot', lat: 19.0544, lng: 72.8402 },
    { name: 'Kurla Logistics Park', lat: 19.0726, lng: 72.8794 },
    { name: 'Goregaon Distribution', lat: 19.1646, lng: 72.8493 },
    { name: 'Powai Storage', lat: 19.1187, lng: 72.9073 },
    { name: 'Vashi Sector 17', lat: 19.0771, lng: 73.0022 },
    { name: 'Thane West Warehouse', lat: 19.2183, lng: 72.9781 },
    { name: 'Dadar Central', lat: 19.0178, lng: 72.8478 },
    { name: 'Colaba Cold Chain', lat: 18.9067, lng: 72.8147 },
    { name: 'Worli Stockyard', lat: 19.0144, lng: 72.8152 },
    { name: 'Saki Naka Hub', lat: 19.1064, lng: 72.8868 },
    { name: 'Malad West Zone', lat: 19.1874, lng: 72.8282 },
    { name: 'Borivali Dispatch', lat: 19.2316, lng: 72.8456 },
    { name: 'Chembur East', lat: 19.0522, lng: 72.9005 },
    { name: 'Ghatkopar Industrial', lat: 19.0863, lng: 72.9083 },
    { name: 'Mulund Check Naka', lat: 19.1726, lng: 72.9425 },
    { name: 'Airoli Mindspace', lat: 19.1648, lng: 72.9953 },
    { name: 'Kopar Khairane', lat: 19.1034, lng: 73.0113 },
    { name: 'Turbhe MIDC', lat: 19.0745, lng: 73.0288 },
    { name: 'Sanpada Yard', lat: 19.0634, lng: 73.0113 },
    { name: 'Nerul Cross', lat: 19.0330, lng: 73.0297 },
    { name: 'Belapur CBD', lat: 19.0237, lng: 73.0402 },
    { name: 'Panvel Junction', lat: 18.9894, lng: 73.1175 },
    { name: 'Taloja MIDC', lat: 19.0601, lng: 73.1212 },
    { name: 'Bhiwandi Complex A', lat: 19.2966, lng: 73.0631 },
    { name: 'Bhiwandi Complex B', lat: 19.2812, lng: 73.0489 },
    { name: 'Bhiwandi Complex C', lat: 19.2756, lng: 73.0578 },
    { name: 'Kalyan West', lat: 19.2403, lng: 73.1305 },
    { name: 'Dombivli MIDC', lat: 19.2094, lng: 73.1022 },
    { name: 'Ambernath Badlapur', lat: 19.1984, lng: 73.1988 },
    { name: 'Vasai East', lat: 19.3919, lng: 72.8397 },
    { name: 'Nalasopara Hub', lat: 19.4176, lng: 72.8192 },
    { name: 'Virar Industrial', lat: 19.4565, lng: 72.7925 },
    { name: 'Mira Road Extension', lat: 19.2813, lng: 72.8561 },
    { name: 'Dahisar Check Naka', lat: 19.2496, lng: 72.8596 },
    { name: 'Kandivali East', lat: 19.2047, lng: 72.8691 },
    { name: 'Jogeshwari Caves', lat: 19.1321, lng: 72.8646 },
    { name: 'Santacruz Airport', lat: 19.0896, lng: 72.8656 },
    { name: 'Vile Parle East', lat: 19.0992, lng: 72.8542 },
    { name: 'Sion Circle', lat: 19.0390, lng: 72.8619 },
    { name: 'Wadala Truck Terminus', lat: 19.0254, lng: 72.8756 },
    { name: 'Sewri Timber Pond', lat: 18.9951, lng: 72.8593 },
    { name: 'Mazgaon Docks', lat: 18.9678, lng: 72.8464 },
    { name: 'Byculla Zoo Area', lat: 18.9792, lng: 72.8333 },
    { name: 'Mahalaxmi Racecourse', lat: 18.9827, lng: 72.8240 },
    { name: 'Lower Parel Phoenix', lat: 18.9934, lng: 72.8275 },
    { name: 'Elphinstone Road', lat: 19.0070, lng: 72.8297 },
    { name: 'Parel TT', lat: 19.0094, lng: 72.8376 },
    { name: 'Matunga Central', lat: 19.0269, lng: 72.8553 },
    { name: 'Mahim Causeway', lat: 19.0434, lng: 72.8409 },
    { name: 'Bandra Reclamation', lat: 19.0469, lng: 72.8197 },
    { name: 'Khar Road West', lat: 19.0683, lng: 72.8330 },
    { name: 'Juhu Beach Depot', lat: 19.0959, lng: 72.8265 },
    { name: 'Versova Link', lat: 19.1349, lng: 72.8140 },
    { name: 'Mumbai Port Trust', lat: 18.9520, lng: 72.8510 },
    { name: 'Kalbadevi Market', lat: 18.9502, lng: 72.8307 },
    { name: 'Crawford Storage', lat: 18.9474, lng: 72.8350 }
  ];

  mumbaiAreas.forEach(area => {
     names.push(area.name);
     locations[area.name] = {
       name: area.name,
       lat: area.lat,
       lng: area.lng,
       radius: 300 // Default geofence radius in meters
     };
  });

  return { names, locations };
};

const mumbaiData = generateMumbaiLocations();

// Export Arrays and Objects
export const WAREHOUSES = [
  'Main Warehouse',
  'Production Floor',
  'Distribution Center',
  ...mumbaiData.names
];

export const WAREHOUSE_LOCATIONS: Record<string, WarehouseLocation> = {
  'Main Warehouse': { name: 'Main Warehouse', lat: 40.7128, lng: -74.0060, radius: 500 }, // NYC
  'Production Floor': { name: 'Production Floor', lat: 34.0522, lng: -118.2437, radius: 300 }, // LA
  'Distribution Center': { name: 'Distribution Center', lat: 51.5074, lng: -0.1278, radius: 1000 }, // London
  ...mumbaiData.locations
};

// Generator for Realistic Mumbai Contacts
const generateMumbaiContacts = (): Contact[] => {
  const contacts: Contact[] = [];
  
  const contactTypes = [
    { suffix: 'Steel & Alloys', type: 'Vendor', areas: ['Carnac Bunder', 'Masjid Bunder', 'Kalamboli'] },
    { suffix: 'Pharma Distributors', type: 'Vendor', areas: ['Andheri MIDC', 'Saki Naka', 'Dava Bazaar'] },
    { suffix: 'Textiles Pvt Ltd', type: 'Vendor', areas: ['Kalbadevi', 'Dadar Market', 'Bhiwandi'] },
    { suffix: 'Electronics World', type: 'Vendor', areas: ['Lamington Road', 'Grant Road', 'Manish Market'] },
    { suffix: 'Polymers & Plast', type: 'Vendor', areas: ['Goregaon East', 'Vasai East', 'Saki Naka'] },
    { suffix: 'Logistics Solutions', type: 'Internal', areas: ['Nhava Sheva', 'Bhiwandi', 'Taloja'] },
    { suffix: 'Retail Mart', type: 'Customer', areas: ['Bandra West', 'Colaba', 'Juhu'] },
    { suffix: 'Supermarkets', type: 'Customer', areas: ['Thane West', 'Kalyan', 'Borivali'] },
    { suffix: 'Builders & Developers', type: 'Customer', areas: ['Worli', 'Lower Parel', 'Navi Mumbai'] },
    { suffix: 'Enterprises', type: 'Vendor', areas: ['Kurla West', 'Ghatkopar', 'Sion'] },
    { suffix: 'Trading Co', type: 'Vendor', areas: ['Masjid Bunder', 'Crawford Market', 'Byculla'] },
    { suffix: 'Tech Solutions', type: 'Customer', areas: ['Powai', 'Airoli Mindspace', 'Malad Mindspace'] },
    { suffix: 'Automobiles', type: 'Customer', areas: ['Kurla', 'Andheri West', 'Worli Naka'] },
    { suffix: 'Chemicals Corp', type: 'Vendor', areas: ['Turbhe MIDC', 'Mahape', 'Rabale'] },
    { suffix: 'Packaging Industries', type: 'Vendor', areas: ['Vasai', 'Palghar', 'Bhiwandi'] }
  ];

  const firstNames = [
    'Ramesh', 'Suresh', 'Jayant', 'Aditya', 'Vijay', 'Ketan', 'Rajesh', 'Amit', 'Sanjay', 'Manoj',
    'Pooja', 'Deepak', 'Anil', 'Sunil', 'Chetan', 'Nitin', 'Gaurav', 'Rahul', 'Prakash', 'Vinay',
    'Om', 'Sai', 'Shree', 'Royal', 'Apex', 'Zenith', 'Global', 'National', 'Bombay', 'Maharashtra',
    'United', 'Prime', 'Star', 'Delta', 'Sigma', 'Alpha', 'Classic', 'Modern', 'Metro', 'Urban'
  ];

  // Generate 80 contacts
  for (let i = 0; i < 80; i++) {
    const business = contactTypes[Math.floor(Math.random() * contactTypes.length)];
    const namePrefix = firstNames[Math.floor(Math.random() * firstNames.length)];
    const area = business.areas[Math.floor(Math.random() * business.areas.length)];
    
    // Ensure mostly Vendors for supply chain realism
    const type = business.type; 
    const shopNo = Math.floor(Math.random() * 500) + 1;
    
    contacts.push({
      id: `c-mum-${i}`,
      name: `${namePrefix} ${business.suffix}`,
      type: type as any,
      email: `contact@${namePrefix.toLowerCase().replace(/\s/g,'')}${business.suffix.split(' ')[0].toLowerCase()}.com`,
      phone: `+91-${Math.floor(9000000000 + Math.random() * 999999999)}`,
      address: `Shop ${shopNo}, ${area}, Mumbai`
    });
  }

  return contacts;
};

export const INITIAL_CONTACTS: Contact[] = [
  // A few key specific ones
  { id: 'c1', name: 'Tata Steel Ltd', type: 'Vendor', email: 'sales@tatasteel.com', phone: '+91-22-66658282', address: 'Bombay House, Fort, Mumbai' },
  { id: 'c2', name: 'Reliance Retail', type: 'Customer', email: 'procurement@ril.com', phone: '+91-22-44770000', address: 'Reliance Corporate Park, Ghansoli' },
  { id: 'c3', name: 'Godrej & Boyce Mfg', type: 'Vendor', email: 'info@godrej.com', phone: '+91-22-67965656', address: 'Pirojshanagar, Vikhroli, Mumbai' },
  { id: 'c4', name: 'Asian Paints', type: 'Vendor', email: 'supply@asianpaints.com', phone: '+91-22-62181000', address: 'Santacruz East, Mumbai' },
  { id: 'c5', name: 'Larsen & Toubro', type: 'Customer', email: 'projects@larsentoubro.com', phone: '+91-22-67525656', address: 'Powai Campus, Mumbai' },
  ...generateMumbaiContacts()
];

// Base manual products to ensure existing operations link correctly
const BASE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Steel Rods', sku: 'RM-001', barcode: '10000001', category: 'Raw Material', uom: 'Units', stock: 100, location: 'Main Warehouse', price: 50, minStockRule: 20 },
  { id: 'p2', name: 'Chair Frame', sku: 'WIP-001', barcode: '10000002', category: 'Work in Progress', uom: 'Units', stock: 45, location: 'Production Floor', price: 120, minStockRule: 10 },
  { id: 'p3', name: 'Office Chair', sku: 'FG-001', barcode: '10000003', category: 'Finished Goods', uom: 'Units', stock: 8, location: 'Main Warehouse', price: 350, minStockRule: 15 },
  { id: 'p4', name: 'Fabric Roll', sku: 'RM-002', barcode: '10000004', category: 'Raw Material', uom: 'Meters', stock: 200, location: 'Main Warehouse', price: 15, minStockRule: 50 },
];

// Generator function for dummy products
const generateProducts = (startId: number, count: number): Product[] => {
  const categories = ['Raw Material', 'Work in Progress', 'Finished Goods', 'Safety Gear', 'Tools', 'Packaging', 'Office Supplies', 'Electronics'];
  const uoms = ['Units', 'Meters', 'Kg', 'Liters', 'Box', 'Roll', 'Pair'];
  const materials = ['Steel', 'Wood', 'Plastic', 'Aluminum', 'Copper', 'Glass', 'Rubber', 'Cotton', 'Nylon', 'Leather'];
  const items = ['Tube', 'Sheet', 'Screw', 'Bolt', 'Nut', 'Panel', 'Wire', 'Cable', 'Valve', 'Gasket', 'Filter', 'Paint', 'Glue', 'Tape', 'Box', 'Gloves', 'Helmet'];
  
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const uom = uoms[Math.floor(Math.random() * uoms.length)];
    
    // Distribute items across all warehouses including Mumbai ones
    const location = WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)];
    
    // Random price between 1 and 500
    const price = parseFloat((Math.random() * 500 + 1).toFixed(2));
    // Random stock between 0 and 1000
    const stock = Math.floor(Math.random() * 1000);
    // Random min stock rule
    const minStockRule = Math.floor(Math.random() * 50) + 5;
    // Random barcode
    const barcode = Math.floor(10000000 + Math.random() * 90000000).toString();

    products.push({
      id: `p${startId + i}`,
      name: `${material} ${item} ${Math.floor(Math.random() * 100)}`, // Add number for uniqueness
      sku: `${category.substring(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      barcode,
      category,
      uom,
      stock,
      location,
      price,
      minStockRule
    });
  }

  return products;
};

// Generate 150 additional products
export const INITIAL_PRODUCTS: Product[] = [
  ...BASE_PRODUCTS,
  ...generateProducts(5, 150)
];

export const INITIAL_OPERATIONS: Operation[] = [
  {
    id: 'op1',
    type: OperationType.RECEIPT,
    status: OperationStatus.DONE,
    reference: 'WH/IN/0001',
    sourceLocation: 'Vendor',
    destLocation: 'Main Warehouse',
    items: [{ productId: 'p1', quantity: 50 }],
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    partnerId: 'c1'
  },
  {
    id: 'op2',
    type: OperationType.DELIVERY,
    status: OperationStatus.READY,
    reference: 'WH/OUT/0005',
    sourceLocation: 'Main Warehouse',
    destLocation: 'Customer',
    items: [{ productId: 'p3', quantity: 10 }],
    date: new Date().toISOString(),
    partnerId: 'c2'
  },
  {
    id: 'op3',
    type: OperationType.INTERNAL,
    status: OperationStatus.DRAFT,
    reference: 'WH/INT/0012',
    sourceLocation: 'Main Warehouse',
    destLocation: 'Production Floor',
    items: [{ productId: 'p1', quantity: 20 }],
    date: new Date().toISOString(),
  }
];

// --- Geofencing Utils ---

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}