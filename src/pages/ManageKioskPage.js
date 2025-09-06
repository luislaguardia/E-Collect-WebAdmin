import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import './ManageKioskPage.css';

const ManageKioskPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the "Add Kiosk" form
  const [newKioskNumber, setNewKioskNumber] = useState('');
  const [newKioskLocation, setNewKioskLocation] = useState('');

  const fetchKiosks = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllKiosks();
      setKiosks(response.data.data);
    } catch (err) {
      console.error("Failed to fetch kiosks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKiosks();
  }, []);

  const handleAddKiosk = async (e) => {
    e.preventDefault();
    if (!newKioskNumber || !newKioskLocation) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      await adminService.createKiosk({ kioskNumber: newKioskNumber, location: newKioskLocation });
      setNewKioskNumber('');
      setNewKioskLocation('');
      fetchKiosks(); // Refresh the list
    } catch (err) {
      console.error("Failed to add kiosk", err);
    }
  };
  
  const handleToggleStatus = async (kiosk) => {
    const newStatus = kiosk.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateKiosk(kiosk._id, { status: newStatus });
      fetchKiosks(); // Refresh the list
    } catch (err) {
      console.error("Failed to update kiosk status", err);
    }
  };

  const handleDeleteKiosk = async (kioskId) => {
    if (window.confirm('Are you sure you want to delete this kiosk?')) {
      try {
        await adminService.deleteKiosk(kioskId);
        fetchKiosks(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete kiosk", err);
      }
    }
  };

  if (loading) {
    return <div>Loading kiosk data...</div>;
  }

  return (
    <div className="manage-kiosk-container">
      <h1>Manage KIOSK</h1>
      
      <form onSubmit={handleAddKiosk} className="add-kiosk-form">
        <h3>Add New Kiosk</h3>
        <input 
          type="text" 
          placeholder="Kiosk #" 
          value={newKioskNumber}
          onChange={(e) => setNewKioskNumber(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Location"
          value={newKioskLocation}
          onChange={(e) => setNewKioskLocation(e.target.value)}
        />
        <button type="submit">Add Kiosk</button>
      </form>

      <div className="kiosk-table-container">
        <table className="kiosk-table">
          <thead>
            <tr>
              <th>KIOSK #</th>
              <th>LOCATION</th>
              <th>SITUATION</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {kiosks.map((kiosk) => (
              <tr key={kiosk._id}>
                <td>{kiosk.kioskNumber}</td>
                <td>{kiosk.location}</td>
                <td><span className={`situation-tag ${kiosk.situation?.toLowerCase()}`}>{kiosk.situation}</span></td>
                <td><span className={`status-tag ${kiosk.status?.toLowerCase()}`}>{kiosk.status}</span></td>
                <td className="action-buttons">
                  <button onClick={() => handleToggleStatus(kiosk)} className="btn-status">
                    {kiosk.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDeleteKiosk(kiosk._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageKioskPage;