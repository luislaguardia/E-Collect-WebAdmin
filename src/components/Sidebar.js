import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/ecollect-logo.png';

// Import icons from the react-icons library
import {
  FiGrid,
  FiMapPin,
  FiTrash2,
  FiCpu,
  FiUsers,
  FiLogOut
} from 'react-icons/fi';

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
        <NavLink to="/dashboard" className="nav-link">
          <FiGrid className="nav-icon" /> Dashboard
        </NavLink>
        <NavLink to="/kiosk-finder" className="nav-link">
          <FiMapPin className="nav-icon" /> Kiosk Finder
        </NavLink>
        <NavLink to="/manage-ewaste" className="nav-link">
          <FiTrash2 className="nav-icon" /> Manage EWASTE
        </NavLink>
        <NavLink to="/manage-kiosk" className="nav-link">
          <FiCpu className="nav-icon" /> Manage KIOSK
        </NavLink>
        <NavLink to="/manage-users" className="nav-link">
          <FiUsers className="nav-icon" /> Manage Users
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <FiLogOut className="nav-icon" /> Log-out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;