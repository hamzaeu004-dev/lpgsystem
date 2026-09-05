import { configureStore } from '@reduxjs/toolkit';

import shopReducer from '../features/shops/shopSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import customerReducer from '../features/customers/customerSlice';
import salesReducer from '../features/sales/salesSlice';
import expenseReducer from '../features/expense/expenseSlice';

export const store = configureStore({
  reducer: {
    shops: shopReducer,
    inventory: inventoryReducer,
    customers: customerReducer,
    sales: salesReducer,
    expenses: expenseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});