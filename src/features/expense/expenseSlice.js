import { createSlice } from '@reduxjs/toolkit';

const defaultCategories = [
  'Transport & Fuel',
  'Staff Salary & Wages',
  'Utilities & Bills',
  'Tea & Refreshments',
  'Maintenance & Repair',
  'Shop & Depot Rent',
  'Government & License Fees',
  'Miscellaneous',
];

const initialExpenses = [
  {
    id: 'EXP-2026-001',
    title: 'Delivery Truck Fuel Refill',
    category: 'Transport & Fuel',
    amount: 6500,
    date: '2026-09-04T11:30:00Z',
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    paymentMethod: 'Cash',
    status: 'Paid',
    paidTo: 'PSO Station F-8',
    notes: 'Fuel for delivery truck # LES-4920',
  },
  {
    id: 'EXP-2026-002',
    title: 'Staff Monthly Tea & Snacks Allowance',
    category: 'Tea & Refreshments',
    amount: 3200,
    date: '2026-09-03T16:00:00Z',
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    paymentMethod: 'Cash',
    status: 'Paid',
    paidTo: 'Madina Grocery Store',
    notes: 'Tea leaves, sugar, and daily snacks for depot staff',
  },
  {
    id: 'EXP-2026-003',
    title: 'Electricity Bill Blue Area Branch',
    category: 'Utilities & Bills',
    amount: 14800,
    date: '2026-09-02T10:15:00Z',
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    paymentMethod: 'Online Bank Transfer',
    status: 'Paid',
    paidTo: 'IESCO',
    notes: 'August electricity bill payment',
  },
  {
    id: 'EXP-2026-004',
    title: 'Cylinder Valve Repairing & Servicing',
    category: 'Maintenance & Repair',
    amount: 4200,
    date: '2026-09-01T14:45:00Z',
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    paymentMethod: 'Cash',
    status: 'Paid',
    paidTo: 'Auto Care Workshop',
    notes: 'Replaced 6 faulty cylinder safety valves',
  },
  {
    id: 'EXP-2026-005',
    title: 'Blue Area Shop Rent (September)',
    category: 'Shop & Depot Rent',
    amount: 35000,
    date: '2026-09-01T09:00:00Z',
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    paymentMethod: 'Company Cheque',
    status: 'Pending',
    paidTo: 'Malik Property Plaza',
    notes: 'Monthly rental voucher - Cheque processing',
  },
];

// Helper to load from localStorage
const loadSavedData = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_expenses_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        expenses: parsed.expenses || initialExpenses,
        categories: parsed.categories || defaultCategories,
      };
    }
  } catch (e) {
    console.error('Failed to load expense data from localStorage', e);
  }
  return {
    expenses: initialExpenses,
    categories: defaultCategories,
  };
};

const savedState = loadSavedData();

const initialState = {
  expenses: savedState.expenses,
  categories: savedState.categories,
  loading: false,
  error: null,
};

// Helper to save to localStorage
const saveStateToStorage = (state) => {
  try {
    localStorage.setItem(
      'lpg_erp_expenses_data',
      JSON.stringify({
        expenses: state.expenses,
        categories: state.categories,
      })
    );
  } catch (e) {
    console.error('Failed to save expense data to localStorage', e);
  }
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
      saveStateToStorage(state);
    },
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
      saveStateToStorage(state);
    },
    updateExpense: (state, action) => {
      const index = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = { ...state.expenses[index], ...action.payload };
        saveStateToStorage(state);
      }
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      saveStateToStorage(state);
    },
    addCategory: (state, action) => {
      const newCat = action.payload.trim();
      if (newCat && !state.categories.includes(newCat)) {
        state.categories.push(newCat);
        saveStateToStorage(state);
      }
    },
  },
});

export const {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
} = expenseSlice.actions;

export default expenseSlice.reducer;
