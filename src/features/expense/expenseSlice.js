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

const initialExpenses = [];

// Helper to load from localStorage
const loadSavedData = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_expenses_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleanedExpenses = (parsed.expenses || []).filter(
        (e) => !e.id?.startsWith('EXP-2026-00')
      );
      return {
        expenses: cleanedExpenses,
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
