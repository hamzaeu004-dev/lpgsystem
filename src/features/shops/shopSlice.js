import { createSlice } from '@reduxjs/toolkit';

const loadSavedShops = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_shops_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // filter out legacy dummy shop IDs if any exist in user localStorage
      return parsed.filter(s => !s.id?.startsWith('SHOP-00'));
    }
  } catch (e) {
    console.error('Failed to load shops from localStorage', e);
  }
  return [];
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