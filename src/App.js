// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// --- ADD THIS FIX ---
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// --------------------

// Pages and Components
import InfoPage from './pages/InfoPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KioskFinderPage from './pages/KioskFinderPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

import ManageEwastePage from './pages/ManageEwastePage';
import ManageKioskPage from './pages/ManageKioskPage';
import ManageUsersPage from './pages/ManageUsersPage';

// --- ADD THIS CODE SNIPPET ---
// This code fixes the missing marker icon issue in React-Leaflet
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow
});
// -----------------------------

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Info Page - Shows kiosk map and system info */}
        <Route path="/info" element={<InfoPage />} />
        
        {/* Admin Login Page */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/kiosk-finder" element={<KioskFinderPage />} />
            <Route path="/manage-ewaste" element={<ManageEwastePage />} />
            <Route path="/manage-kiosk" element={<ManageKioskPage />} />
            <Route path="/manage-users" element={<ManageUsersPage />} />
          </Route>
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/info" />} />
        <Route path="*" element={<Navigate to="/info" />} />
      </Routes>
    </Router>
  );
}

export default App;