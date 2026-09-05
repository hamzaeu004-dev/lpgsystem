import { createSlice } from '@reduxjs/toolkit';

const initialShops = [
  {
    id: 'SHOP-001',
    name: 'Main Central Depot',
    location: 'I-9 Industrial Area, Islamabad',
    manager: 'Tariq Mehmood',
    phone: '+92 300 5551234',
    totalCylinders: 120,
    inStock: 45,
    dispatched: 65,
    refillPending: 10,
    status: 'Active',
    monthlyRevenue: 485000,
  },
  {
    id: 'SHOP-002',
    name: 'Blue Area City Branch',
    location: 'Blue Area, Jinnah Avenue, Islamabad',
    manager: 'Shahid Khan',
    phone: '+92 321 4445678',
    totalCylinders: 75,
    inStock: 28,
    dispatched: 42,
    refillPending: 5,
    status: 'Active',
    monthlyRevenue: 320000,
  },
  {
    id: 'SHOP-003',
    name: 'Saddar Express Outlet',
    location: 'Bank Road, Saddar, Rawalpindi',
    manager: 'Waqas Ahmed',
    phone: '+92 333 7778899',
    totalCylinders: 50,
    inStock: 16,
    dispatched: 30,
    refillPending: 4,
    status: 'Active',
    monthlyRevenue: 210000,
  },
];

const initialState = {
  shops: initialShops,
  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: 'shops',
  initialState,
  reducers: {
    setShops: (state, action) => {
      state.shops = action.payload;
    },
    addShop: (state, action) => {
      state.shops.unshift(action.payload);
    },
    updateShop: (state, action) => {
      const index = state.shops.findIndex(shop => shop.id === action.payload.id);
      if (index !== -1) {
        state.shops[index] = { ...state.shops[index], ...action.payload };
      }
    },
    deleteShop: (state, action) => {
      state.shops = state.shops.filter(shop => shop.id !== action.payload);
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