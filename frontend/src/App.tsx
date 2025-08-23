import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import CinemaDetail from '@/pages/CinemaDetail';
import SeatSelection from '@/pages/SeatSelection';
import BookingConfirmation from '@/pages/BookingConfirmation';
import BookingHistory from '@/pages/BookingHistory';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cinema/:cinemaId" 
        element={
          <ProtectedRoute>
            <Layout>
              <CinemaDetail />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking/:showId" 
        element={
          <ProtectedRoute>
            <Layout>
              <SeatSelection />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking-confirmation" 
        element={
          <ProtectedRoute>
            <Layout>
              <BookingConfirmation />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bookings" 
        element={
          <ProtectedRoute>
            <Layout>
              <BookingHistory />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cinemax-theme">
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;