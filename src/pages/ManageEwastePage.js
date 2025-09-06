import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import './ManageEwastePage.css';

const ManageEwastePage = () => {
  const [ewasteData, setEwasteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEwasteData = async () => {
      try {
        const response = await adminService.getAllEwaste();
        setEwasteData(response.data.data);
      } catch (err) {
        setError('Failed to fetch e-waste data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEwasteData();
  }, []);

  if (loading) {
    return <div>Loading e-waste records...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="ewaste-container">
      <div className="ewaste-header">
        <h1>Manage EWASTE</h1>
        {/* Placeholder for a filter dropdown */}
        <select className="filter-dropdown">
          <option>Filter by...</option>
        </select>
      </div>

      <div className="ewaste-table-container">
        <table className="ewaste-table">
          <thead>
            <tr>
              <th>USERS</th>
              <th>DATE</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>INCENTIVES</th>
            </tr>
          </thead>
          <tbody>
            {ewasteData.length > 0 ? (
              ewasteData.map((item) => (
                <tr key={item._id}>
                  <td>{item.userId?.fullName || 'N/A'}</td>
                  <td>{new Date(item.scannedDate).toLocaleDateString()}</td>
                  <td>{item.category}</td>
                  <td>{item.phpValue}</td>
                  <td>{item.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No e-waste data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageEwastePage;