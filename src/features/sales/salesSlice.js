import { createSlice } from '@reduxjs/toolkit';

const initialTransactions = [
  {
    id: 'TXN-2026-001',
    type: 'sale', // sale | return | refill | purchase
    isRegisteredCustomer: true,
    customerId: 'CUST-001',
    customerName: 'Ali Ahmed',
    cylinderId: 'CYL-2026-002',
    issuedCylinderRegNo: 'LPG-PK-11802',
    issuedCylinderType: 'Domestic 11.8 kg',
    cylinderType: 'Domestic 11.8 kg',
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    amount: 2850,
    totalBill: 2850,
    paidAmount: 2850,
    remainingBalance: 0,
    deposit: 4500,
    securityDeposit: 4500,
    emptyReturned: true,
    returnedCylinderRegNo: 'LPG-PK-11801',
    paymentMethod: 'Cash',
    date: '2026-09-01T10:30:00Z',
    status: 'Completed',
  },
  {
    id: 'TXN-2026-002',
    type: 'sale',
    isRegisteredCustomer: true,
    customerId: 'CUST-003',
    customerName: 'Usman Commercial Hotel',
    cylinderId: 'CYL-2026-003',
    issuedCylinderRegNo: 'LPG-PK-45401',
    issuedCylinderType: 'Commercial 45.4 kg',
    cylinderType: 'Commercial 45.4 kg',
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    amount: 9500,
    totalBill: 9500,
    paidAmount: 9500,
    remainingBalance: 0,
    deposit: 15000,
    securityDeposit: 15000,
    emptyReturned: true,
    returnedCylinderRegNo: 'LPG-PK-45402',
    paymentMethod: 'Online Bank Transfer',
    date: '2026-08-30T14:15:00Z',
    status: 'Completed',
  },
  {
    id: 'TXN-2026-003',
    type: 'sale',
    isRegisteredCustomer: true,
    customerId: 'CUST-002',
    customerName: 'Sara Khan',
    cylinderId: 'CYL-2026-006',
    issuedCylinderRegNo: 'LPG-PK-11804',
    issuedCylinderType: 'Domestic 11.8 kg',
    cylinderType: 'Domestic 11.8 kg',
    shopId: 'SHOP-002',
    shopName: 'Blue Area City Branch',
    amount: 2850,
    totalBill: 2850,
    paidAmount: 2000,
    remainingBalance: 850,
    deposit: 4500,
    securityDeposit: 4500,
    emptyReturned: false,
    returnedCylinderRegNo: null,
    paymentMethod: 'Cash',
    date: '2026-08-25T11:20:00Z',
    status: 'Pending Balance & Empty',
  },
  {
    id: 'TXN-2026-004',
    type: 'return',
    isRegisteredCustomer: true,
    customerId: 'CUST-004',
    customerName: 'Kashif Bakers',
    cylinderId: 'CYL-2026-005',
    issuedCylinderRegNo: '-',
    cylinderType: 'Domestic 11.8 kg',
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    amount: 0,
    totalBill: 0,
    paidAmount: 0,
    remainingBalance: 0,
    depositRefunded: 4500,
    securityDeposit: 12000,
    emptyReturned: true,
    returnedCylinderRegNo: 'LPG-PK-11803',
    paymentMethod: 'Cash',
    date: '2026-08-29T16:45:00Z',
    status: 'Completed',
  },
  {
    id: 'TXN-2026-005',
    type: 'purchase',
    isRegisteredCustomer: false,
    shopId: 'SHOP-001',
    shopName: 'Main Central Depot',
    quantity: 25,
    cylinderType: 'Domestic 11.8 kg',
    amount: 55000,
    totalBill: 55000,
    paidAmount: 55000,
    remainingBalance: 0,
    paymentMethod: 'Company Cheque',
    date: '2026-08-28T09:00:00Z',
    status: 'Completed',
  },
];

const initialState = {
  transactions: initialTransactions,
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action) => {
      const targetId = action.payload.originalId || action.payload.id;
      const index = state.transactions.findIndex(t => t.id === targetId);
      if (index !== -1) {
        const updatedObj = { ...action.payload };
        delete updatedObj.originalId;
        state.transactions[index] = { ...state.transactions[index], ...updatedObj };
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
      }
    },
    deleteTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
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