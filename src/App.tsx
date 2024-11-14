import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from './store/auth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/Login';
import { CalendarPage } from './pages/Calendar';
import { EmployeesPage } from './pages/Employees';
import { SettingsPage } from './pages/Settings';
import { ShiftsPage } from './pages/Shifts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CalendarPage />} />
          <Route path="shifts" element={<ShiftsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;