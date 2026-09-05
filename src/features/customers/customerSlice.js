import { createSlice } from '@reduxjs/toolkit';

const initialCustomers = [
  {
    id: 'CUST-001',
    name: 'Ali Ahmed',
    phone: '+92 300 1234567',
    cnic: '37405-1234567-1',
    address: 'House 42, Street 10, F-8/2, Islamabad',
    category: 'Domestic',
    activeCylindersCount: 1,
    assignedCylinders: ['CYL-2026-002'],
    securityDeposit: 4500,
    balance: 0,
    status: 'Active',
    createdDate: '2026-01-15',
  },
  {
    id: 'CUST-002',
    name: 'Sara Khan',
    phone: '+92 312 9876543',
    cnic: '37405-9876543-2',
    address: 'Flat 304, Executive Heights, E-11, Islamabad',
    category: 'Domestic',
    activeCylindersCount: 1,
    assignedCylinders: ['CYL-2026-006'],
    securityDeposit: 4500,
    balance: 2850,
    status: 'Active',
    createdDate: '2026-03-20',
  },
  {
    id: 'CUST-003',
    name: 'Usman Commercial Hotel',
    phone: '+92 334 5558822',
    cnic: '37405-5558822-3',
    address: 'Plot 12, Commercial Market, Rawalpindi',
    category: 'Commercial',
    activeCylindersCount: 1,
    assignedCylinders: ['CYL-2026-003'],
    securityDeposit: 15000,
    balance: 0,
    status: 'Active',
    createdDate: '2026-02-10',
  },
  {
    id: 'CUST-004',
    name: 'Kashif Bakers',
    phone: '+92 322 1113344',
    cnic: '37405-1113344-4',
    address: 'Shop 5, G-9 Markaz, Islamabad',
    category: 'Commercial',
    activeCylindersCount: 0,
    assignedCylinders: [],
    securityDeposit: 12000,
    balance: -1500,
    status: 'Active',
    createdDate: '2026-05-12',
  },
];

const initialState = {
  customers: initialCustomers,
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = { ...state.customers[index], ...action.payload };
      }
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    returnCylinder: (state, action) => {
      const { customerId, cylinderId } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.assignedCylinders = customer.assignedCylinders.filter(id => id !== cylinderId);
        customer.activeCylindersCount = Math.max(0, customer.activeCylindersCount - 1);
      }
    },
    assignCylinder: (state, action) => {
      const { customerId, cylinderId } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        if (!customer.assignedCylinders.includes(cylinderId)) {
          customer.assignedCylinders.push(cylinderId);
          customer.activeCylindersCount += 1;
        }
      }
    },
    updateCustomerBalance: (state, action) => {
      const { customerId, amountToAdd } = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.balance = (customer.balance || 0) + Number(amountToAdd);
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