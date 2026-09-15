import { createSlice } from '@reduxjs/toolkit';

const loadSavedCustomers = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_customers_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(c => !c.id?.startsWith('CUST-00'));
    }
  } catch (e) {
    console.error('Failed to load customers from localStorage', e);
  }
  return [];
};

const saveCustomersToStorage = (customers) => {
  try {
    localStorage.setItem('lpg_erp_customers_data', JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to localStorage', e);
  }
};

const initialState = {
  customers: loadSavedCustomers(),
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
      saveCustomersToStorage(state.customers);
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
      saveCustomersToStorage(state.customers);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...action.payload };
        saveCustomersToStorage(state.customers);
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
      saveCustomersToStorage(state.customers);
    },
    returnCylinder: (state, action) => {
      const { customerId, cylinderId } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.assignedCylinders = customer.assignedCylinders.filter(id => id !== cylinderId);
        customer.activeCylindersCount = Math.max(0, customer.activeCylindersCount - 1);
        saveCustomersToStorage(state.customers);
      }
    },
    assignCylinder: (state, action) => {
      const { customerId, cylinderId } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        if (!customer.assignedCylinders.includes(cylinderId)) {
          customer.assignedCylinders.push(cylinderId);
          customer.activeCylindersCount += 1;
          saveCustomersToStorage(state.customers);
        }
      }
    },
    updateCustomerBalance: (state, action) => {
      const { customerId, amountToAdd } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.balance = (customer.balance || 0) + Number(amountToAdd);
        saveCustomersToStorage(state.customers);
      }
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
  setCustomers, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer, 
  returnCylinder,
  assignCylinder,
  updateCustomerBalance,
  setLoading, 
  setError 
} = customerSlice.actions;
export default customerSlice.reducer;