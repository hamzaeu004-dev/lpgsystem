import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/pages/Dashboard';
import Shops from './components/pages/Shops';
import Inventory from './components/pages/Inventory';
import Purchase from './components/pages/Purchase';
import Sales from './components/pages/Sales';
import Expense from './components/pages/Expense';
import CommitteeCollection from './components/pages/CommitteeCollection';
import Customers from './components/pages/Customers';
import Cylinders from './components/pages/Cylinders';
import Reports from './components/pages/Reports';
import Settings from './components/pages/Settings';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shops" element={<Shops />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="sales" element={<Sales />} />
          <Route path="expense" element={<Expense />} />
          <Route path="committee-collection" element={<CommitteeCollection />} />
          <Route path="customers" element={<Customers />} />
          <Route path="cylinders" element={<Cylinders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;