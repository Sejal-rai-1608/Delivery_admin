import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useSocketStore } from './store/socketStore';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Drivers } from './pages/Drivers';
import { DriverDetail } from './pages/DriverDetail';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Analytics } from './pages/Analytics';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { updateDriverLocation } = useSocketStore();

  // Mock Socket Connection for Live Map Updates
  useEffect(() => {
    // Simulate receiving driver location updates every 3 seconds
    const interval = setInterval(() => {
      // Mock driver drv-1 moving slightly
      const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
      const lng = -74.0060 + (Math.random() - 0.5) * 0.01;
      updateDriverLocation('drv-1', lat, lng);
    }, 3000);

    return () => clearInterval(interval);
  }, [updateDriverLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/drivers/:id" element={<DriverDetail />} />
            
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
