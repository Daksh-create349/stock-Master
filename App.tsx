import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { OperationsList } from './components/OperationsList';
import { StockAdjustment } from './components/StockAdjustment';
import { LoginScreen } from './components/Auth';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Contacts } from './components/Contacts';

const AppContent = () => {
  const { currentUser } = useInventory();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="operations" element={<OperationsList />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="adjustments" element={<StockAdjustment />} />
        <Route path="settings" element={<Settings />} />
        <Route path="history" element={<History />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <InventoryProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </InventoryProvider>
  );
};

export default App;