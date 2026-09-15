import { createSlice } from '@reduxjs/toolkit';

const loadSavedCylinders = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_inventory_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(c => !c.id?.startsWith('CYL-2026-00'));
    }
  } catch (e) {
    console.error('Failed to load cylinders from localStorage', e);
  }
  return [];
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
      const { id, status, customerId, customerName, shopId, shopName } = action.payload;
      const cylinder = state.cylinders.find(c => c.id === id);
      if (cylinder) {
        cylinder.status = status;
        if (customerId !== undefined) cylinder.customerId = customerId;
        if (customerName !== undefined) cylinder.customerName = customerName;
        if (shopId) cylinder.shopId = shopId;
        if (shopName) cylinder.shopName = shopName;
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
  deleteCylinder, 
  setLoading, 
  setError 
} = inventorySlice.actions;
export default inventorySlice.reducer;