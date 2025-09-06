import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import CategoryPieChart from '../components/CategoryPieChart';
import './DashboardPage.css';

const DashboardPage = () => {
  // ... (all your existing state and useEffect code remains the same) ...
  const [stats, setStats] = useState({ users: 0, kiosks: 0, ewaste: 0, kioskStatus: 'LOADING' });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, summaryResponse] = await Promise.all([
          adminService.getStats(),
          adminService.getEwasteSummary()
        ]);
        
        setStats(statsResponse.data.data);
        
        const summaryData = summaryResponse.data.data;
        const formattedChartData = {
          labels: summaryData.map(item => item._id),
          data: summaryData.map(item => item.count),
        };
        setChartData(formattedChartData);

      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className={`status-card ${stats.kioskStatus === 'FULL' ? 'full' : 'available'}`}>
          <h2>Kiosk Status:</h2>
          <p className="status-text">{stats.kioskStatus}</p>
          {stats.kioskStatus === 'FULL' && <small>*Collect it now to ensure it's recycled properly.</small>}
        </div>
        <div className="stat-card">
          <h3># of kiosk</h3>
          <p>{stats.kiosks}</p>
        </div>
        <div className="stat-card">
          <h3># of ewaste</h3>
          <p>{stats.ewaste}</p>
        </div>
        <div className="stat-card">
          <h3># of users</h3>
          <p>{stats.users}</p>
        </div>
      </div>

      <div className="chart-container">
        {chartData && chartData.labels.length > 0 ? (
          // WRAP THE CHART IN THIS DIV
          <div className="chart-wrapper">
            <CategoryPieChart chartData={chartData} />
          </div>
        ) : (
          <p>No e-waste category data to display yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;