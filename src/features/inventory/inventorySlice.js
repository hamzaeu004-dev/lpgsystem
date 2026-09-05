import { createSlice } from '@reduxjs/toolkit';

const initialCylinders = [
  {
    id: 'CYL-2026-001',
    serialNo: 'LPG-PK-11801',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'stock', // stock | customer | market | refill | damaged
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-08-28',
  },
  {
    id: 'CYL-2026-002',
    serialNo: 'LPG-PK-11802',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.6,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'customer',
    customerId: 'CUST-001',
    customerName: 'Ali Ahmed',
    depositPkr: 4500,
    lastRefillDate: '2026-09-01',
  },
  {
    id: 'CYL-2026-003',
    serialNo: 'LPG-PK-45401',
    type: 'Commercial 45.4 kg',
    weightKg: 45.4,
    tareWeightKg: 42.0,
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    status: 'customer',
    customerId: 'CUST-003',
    customerName: 'Usman Commercial Hotel',
    depositPkr: 15000,
    lastRefillDate: '2026-08-30',
  },
  {
    id: 'CYL-2026-004',
    serialNo: 'LPG-PK-15001',
    type: 'Commercial 15.0 kg',
    weightKg: 15.0,
    tareWeightKg: 16.2,
    shopId: 'SHOP-003',
    shopName: 'Saddar Express Outlet',
    status: 'stock',
    customerId: null,
    customerName: null,
    depositPkr: 6000,
    lastRefillDate: '2026-09-02',
  },
  {
    id: 'CYL-2026-005',
    serialNo: 'LPG-PK-11803',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.4,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'refill',
    customerId: null,
    customerName: null,
    depositPkr: 4500,
    lastRefillDate: '2026-08-15',
  },
  {
    id: 'CYL-2026-006',
    serialNo: 'LPG-PK-11804',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    status: 'customer',
    customerId: 'CUST-002',
    customerName: 'Sara Khan',
    depositPkr: 4500,
    lastRefillDate: '2026-08-25',
  },
  {
    id: 'CYL-2026-007',
    serialNo: 'LPG-PK-45402',
    type: 'Commercial 45.4 kg',
    weightKg: 45.4,
    tareWeightKg: 42.1,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    status: 'market',
    customerId: null,
    customerName: null,
    depositPkr: 15000,
    lastRefillDate: '2026-09-02',
  },
];

const initialState = {
  cylinders: initialCylinders,
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setCylinders: (state, action) => {
      state.cylinders = action.payload;
    },
    addCylinder: (state, action) => {
      state.cylinders.unshift(action.payload);
    },
    updateCylinderStatus: (state, action) => {
      const { id, status, customerId, customerName, shopId, shopName } = action.payload;
      const cylinder = state.cylinders.find(c => c.id === id);
      if (cylinder) {
        cylinder.status = status;
        if (customerId !== undefined) cylinder.customerId = customerId;
        if (customerName !== undefined) cylinder.customerName = customerName;
        if (shopId) cylinder.shopId = shopId;
        if (shopName) cylinder.shopName = shopName;
        cylinder.lastUpdated = new Date().toISOString();
      }
    },
    deleteCylinder: (state, action) => {
      state.cylinders = state.cylinders.filter(c => c.id !== action.payload);
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
  deleteCylinder, 
  setLoading, 
  setError 
} = inventorySlice.actions;
export default inventorySlice.reducer;