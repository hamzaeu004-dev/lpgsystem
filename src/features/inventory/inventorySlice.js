import { createSlice } from '@reduxjs/toolkit';

const defaultCylinders = [
  // Main Branch Empty Cylinders
  {
    id: 'CYL-2026-101',
    serialNo: 'REG-LPG-11801',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-09-10',
    returnDate: '2026-09-14'
  },
  {
    id: 'CYL-2026-102',
    serialNo: 'REG-LPG-11802',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.2,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-09-08',
    returnDate: '2026-09-13'
  },
  {
    id: 'CYL-2026-103',
    serialNo: 'REG-LPG-15001',
    type: 'Commercial 15.0 kg',
    weightKg: 15.0,
    tareWeightKg: 16.5,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 6000,
    lastRefillDate: '2026-09-05',
    returnDate: '2026-09-12'
  },
  {
    id: 'CYL-2026-104',
    serialNo: 'REG-LPG-45401',
    type: 'Commercial 45.4 kg',
    weightKg: 45.4,
    tareWeightKg: 42.0,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 15000,
    lastRefillDate: '2026-09-02',
    returnDate: '2026-09-15'
  },
  // Other Branch Outlets Empty Cylinders
  {
    id: 'CYL-2026-105',
    serialNo: 'REG-LPG-11805',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.4,
    shopId: 'SHOP-002',
    shopName: 'Gulberg Branch Outlet',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-09-11',
    returnDate: '2026-09-15'
  },
  {
    id: 'CYL-2026-106',
    serialNo: 'REG-LPG-15002',
    type: 'Commercial 15.0 kg',
    weightKg: 15.0,
    tareWeightKg: 16.8,
    shopId: 'SHOP-002',
    shopName: 'Gulberg Branch Outlet',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 6000,
    lastRefillDate: '2026-09-07',
    returnDate: '2026-09-14'
  },
  {
    id: 'CYL-2026-107',
    serialNo: 'REG-LPG-45402',
    type: 'Commercial 45.4 kg',
    weightKg: 45.4,
    tareWeightKg: 42.5,
    shopId: 'SHOP-003',
    shopName: 'Johar Town Outlet',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 15000,
    lastRefillDate: '2026-09-01',
    returnDate: '2026-09-13'
  },
  {
    id: 'CYL-2026-108',
    serialNo: 'REG-LPG-11808',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.6,
    shopId: 'SHOP-003',
    shopName: 'Johar Town Outlet',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-09-09',
    returnDate: '2026-09-14'
  },
  // In Stock Filled Cylinders
  {
    id: 'CYL-2026-201',
    serialNo: 'REG-LPG-11810',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'stock',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-09-14',
  },
  {
    id: 'CYL-2026-202',
    serialNo: 'REG-LPG-45410',
    type: 'Commercial 45.4 kg',
    weightKg: 45.4,
    tareWeightKg: 42.0,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'stock',
    customerId: null,
    customerName: null,
    depositPkr: 15000,
    lastRefillDate: '2026-09-15',
  },
  {
    id: 'CYL-2026-203',
    serialNo: 'REG-LPG-15010',
    type: 'Commercial 15.0 kg',
    weightKg: 15.0,
    tareWeightKg: 16.5,
    shopId: 'SHOP-002',
    shopName: 'Gulberg Branch Outlet',
    status: 'stock',
    customerId: null,
    customerName: null,
    depositPkr: 6000,
    lastRefillDate: '2026-09-12',
  },
  // Rented to Customers
  {
    id: 'CYL-2026-301',
    serialNo: 'REG-LPG-11820',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'customer',
    customerId: 'CUST-001',
    customerName: 'Al-Madina Hotel',
    depositPkr: 4500,
    lastRefillDate: '2026-09-01',
  }
];

const loadSavedCylinders = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_inventory_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load cylinders from localStorage', e);
  }
  return defaultCylinders;
};

const saveCylindersToStorage = (cylinders) => {
  try {
    localStorage.setItem('lpg_erp_inventory_data', JSON.stringify(cylinders));
  } catch (e) {
    console.error('Failed to save cylinders to localStorage', e);
  }
};

const initialState = {
  cylinders: loadSavedCylinders(),
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setCylinders: (state, action) => {
      state.cylinders = action.payload;
      saveCylindersToStorage(state.cylinders);
    },
    addCylinder: (state, action) => {
      state.cylinders.unshift(action.payload);
      saveCylindersToStorage(state.cylinders);
    },
    updateCylinderStatus: (state, action) => {
      const { id, status, customerId, customerName, shopId, shopName, returnDate } = action.payload;
      const cylinder = state.cylinders.find(c => c.id === id);
      if (cylinder) {
        cylinder.status = status;
        if (customerId !== undefined) cylinder.customerId = customerId;
        if (customerName !== undefined) cylinder.customerName = customerName;
        if (shopId) cylinder.shopId = shopId;
        if (shopName) cylinder.shopName = shopName;
        if (returnDate) cylinder.returnDate = returnDate;
        cylinder.lastUpdated = new Date().toISOString();
        saveCylindersToStorage(state.cylinders);
      }
    },
    transferCylinderBranch: (state, action) => {
      const { id, targetShopId, targetShopName } = action.payload;
      const cylinder = state.cylinders.find(c => c.id === id);
      if (cylinder) {
        cylinder.shopId = targetShopId;
        cylinder.shopName = targetShopName;
        cylinder.lastUpdated = new Date().toISOString();
        saveCylindersToStorage(state.cylinders);
      }
    },
    deleteCylinder: (state, action) => {
      state.cylinders = state.cylinders.filter(c => c.id !== action.payload);
      saveCylindersToStorage(state.cylinders);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setCylinders, 
  addCylinder, 
  updateCylinderStatus, 
  transferCylinderBranch,
  deleteCylinder, 
  setLoading, 
  setError 
} = inventorySlice.actions;
export default inventorySlice.reducer;