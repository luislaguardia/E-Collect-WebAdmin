import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/ecollect-logo.png'; // Make sure you have the logo in src/assets

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="E-Collect Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/kiosk-finder" className="nav-link">Kiosk Finder</NavLink>
        <NavLink to="/manage-ewaste" className="nav-link">Manage EWASTE</NavLink>
        <NavLink to="/manage-kiosk" className="nav-link">Manage KIOSK</NavLink>
        <NavLink to="/manage-users" className="nav-link">Manage Users</NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">Log-out</button>
      </div>
    </div>
  );
};

export default Sidebar;