import { createSlice } from '@reduxjs/toolkit';

const loadSavedTransactions = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_sales_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(t => !t.id?.startsWith('TXN-2026-00'));
    }
  } catch (e) {
    console.error('Failed to load transactions from localStorage', e);
  }
  return [];
};

const saveTransactionsToStorage = (transactions) => {
  try {
    localStorage.setItem('lpg_erp_sales_data', JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
};

const initialState = {
  transactions: loadSavedTransactions(),
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload;
      saveTransactionsToStorage(state.transactions);
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      saveTransactionsToStorage(state.transactions);
    },
    updateTransaction: (state, action) => {
      const targetId = action.payload.originalId || action.payload.id;
      const index = state.transactions.findIndex(t => t.id === targetId);
      if (index !== -1) {
        const updatedObj = { ...action.payload };
        delete updatedObj.originalId;
        state.transactions[index] = { ...state.transactions[index], ...updatedObj };
        saveTransactionsToStorage(state.transactions);
      }
    },
    markEmptyCylinderReturned: (state, action) => {
      const { txnId, returnedCylinderRegNo } = action.payload;
      const txn = state.transactions.find(t => t.id === txnId);
      if (txn) {
        txn.emptyReturned = true;
        txn.returnedCylinderRegNo = returnedCylinderRegNo || 'CYL-RET-EMPTY';
        if (txn.remainingBalance === 0) {
          txn.status = 'Completed';
        }
        saveTransactionsToStorage(state.transactions);
      }
    },
    payOutstandingBalance: (state, action) => {
      const { txnId, paymentReceived } = action.payload;
      const txn = state.transactions.find(t => t.id === txnId);
      if (txn) {
        txn.paidAmount = (txn.paidAmount || 0) + Number(paymentReceived);
        txn.remainingBalance = Math.max(0, (txn.totalBill || txn.amount) - txn.paidAmount);
        if (txn.remainingBalance === 0 && txn.emptyReturned) {
          txn.status = 'Completed';
        }
        saveTransactionsToStorage(state.transactions);
      }
    },
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      saveTransactionsToStorage(state.transactions);
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
  setTransactions, 
  addTransaction, 
  updateTransaction, 
  markEmptyCylinderReturned,
  payOutstandingBalance,
  deleteTransaction,
  setLoading, 
  setError 
} = salesSlice.actions;
export default salesSlice.reducer;