import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* This is where the page content will be rendered */}
      </main>
    </div>
  );
};

export default MainLayout;