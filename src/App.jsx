
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DevicesPage from './pages/DevicesPage';
import DeviceHistoryPage from './pages/DeviceHistoryPage';
import LiveMapPage from './pages/LiveMapPage';
import HistoryPage from './pages/HistoryPage';
import GeofencingPage from './pages/GeofencingPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/" 
                element={<PrivateRoute><Navigate to="/dashboard" /></PrivateRoute>}
              />
              <Route
                path="/dashboard"
                element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
              >
                <Route index element={<DashboardPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="device-history" element={<DeviceHistoryPage />} />
                <Route path="device-history/:deviceId" element={<DeviceHistoryPage />} />
                <Route path="live" element={<LiveMapPage />} />
                <Route path="live/:deviceId" element={<LiveMapPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="geofencing" element={<GeofencingPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
