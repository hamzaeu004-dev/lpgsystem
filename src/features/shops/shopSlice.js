import { createSlice } from '@reduxjs/toolkit';

const defaultShops = [
  { id: 'SHOP-001', name: 'Main Central Depot', location: 'Industrial Area, Plant #1', manager: 'Hamza Khan', phone: '+92 300 1111111', totalCylinders: 250, inStock: 180, dispatched: 40, refillPending: 30, status: 'Active', monthlyRevenue: 1450000 },
  { id: 'SHOP-002', name: 'Gulberg Branch Outlet', location: 'Main Market, Gulberg III', manager: 'Tariq Mahmood', phone: '+92 300 2222222', totalCylinders: 120, inStock: 80, dispatched: 25, refillPending: 15, status: 'Active', monthlyRevenue: 780000 },
  { id: 'SHOP-003', name: 'Johar Town Outlet', location: 'G1 Market, Johar Town', manager: 'Usman Ali', phone: '+92 300 3333333', totalCylinders: 95, inStock: 60, dispatched: 20, refillPending: 15, status: 'Active', monthlyRevenue: 620000 }
];

const loadSavedShops = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_shops_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load shops from localStorage', e);
  }
  return defaultShops;
};

const saveShopsToStorage = (shops) => {
  try {
    localStorage.setItem('lpg_erp_shops_data', JSON.stringify(shops));
  } catch (e) {
    console.error('Failed to save shops to localStorage', e);
  }
};

const initialState = {
  shops: loadSavedShops(),
  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setShops: (state, action) => {
      state.shops = action.payload;
      saveShopsToStorage(state.shops);
    },
    addShop: (state, action) => {
      state.shops.unshift(action.payload);
      saveShopsToStorage(state.shops);
    },
    updateShop: (state, action) => {
      const index = state.shops.findIndex(shop => shop.id === action.payload.id);
      if (index !== -1) {
        state.shops[index] = { ...state.shops[index], ...action.payload };
        saveShopsToStorage(state.shops);
      }
    },
    deleteShop: (state, action) => {
      state.shops = state.shops.filter(shop => shop.id !== action.payload);
      saveShopsToStorage(state.shops);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setShops, addShop, updateShop, deleteShop, setLoading, setError } = shopSlice.actions;
export default shopSlice.reducer;