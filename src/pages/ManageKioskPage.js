import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import adminService from '../services/adminService';
import { FiMapPin, FiSearch, FiSliders, FiEdit, FiTrash2, FiToggleLeft, FiPlus, FiChevronLeft, FiChevronRight, FiLoader } from 'react-icons/fi';
import './ManageKioskPage.css';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

const ManageKioskPage = () => {
  const [formData, setFormData] = useState({
    kioskNumber: '', location: '', status: 'ACTIVE', description: '',
    capacity: { current: 0, max: 100 },
    operatingHours: { open: '06:00', close: '22:00' }
  });
  
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [kiosks, setKiosks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingKiosks, setFetchingKiosks] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchKiosks();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchKiosks = async () => {
    try {
      setFetchingKiosks(true);
      const params = { page: currentPage, limit: 12, search: searchTerm, status: statusFilter };
      const response = await adminService.getAllKiosks(params);
      setKiosks(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching kiosks:', error);
      showMessage('Failed to fetch kiosks', 'error');
    } finally {
      setFetchingKiosks(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => { /* ... (validation logic remains the same) ... */ return true; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const kioskData = {
        kioskNumber: formData.kioskNumber.trim(), location: formData.location.trim(),
        coordinates: { latitude: parseFloat(selectedPosition.lat), longitude: parseFloat(selectedPosition.lng) },
        status: formData.status,
        capacity: { current: parseInt(formData.capacity.current), max: parseInt(formData.capacity.max) },
        operatingHours: { open: formData.operatingHours.open, close: formData.operatingHours.close },
        description: formData.description.trim() || undefined
      };
      if (editingId) {
        await adminService.updateKiosk(editingId, kioskData);
        showMessage('Kiosk updated successfully!', 'success');
      } else {
        await adminService.createKiosk(kioskData);
        showMessage('Kiosk created successfully!', 'success');
      }
      resetForm();
      fetchKiosks();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error saving kiosk.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kiosk) => {
    setFormData({
      kioskNumber: kiosk.kioskNumber, location: kiosk.location, status: kiosk.status, description: kiosk.description || '',
      capacity: { current: kiosk.capacity?.current || 0, max: kiosk.capacity?.max || 100 },
      operatingHours: { open: kiosk.operatingHours?.open || '06:00', close: kiosk.operatingHours?.close || '22:00' }
    });
    if (kiosk.coordinates?.latitude && kiosk.coordinates?.longitude) {
      setSelectedPosition({ lat: kiosk.coordinates.latitude, lng: kiosk.coordinates.longitude });
    } else {
      setSelectedPosition(null);
      showMessage('Missing coordinates. Please select a location on the map.', 'error');
    }
    setEditingId(kiosk._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this kiosk?')) return;
    try {
      await adminService.deleteKiosk(id);
      showMessage('Kiosk deleted successfully!', 'success');
      fetchKiosks();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error deleting kiosk.';
      showMessage(errorMessage, 'error');
    }
  };
  
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminService.updateKioskStatus(id, newStatus);
      showMessage(`Kiosk status updated to ${newStatus}!`, 'success');
      fetchKiosks();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error updating kiosk status.';
      showMessage(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      kioskNumber: '', location: '', status: 'ACTIVE', description: '',
      capacity: { current: 0, max: 100 },
      operatingHours: { open: '06:00', close: '22:00' }
    });
    setSelectedPosition(null);
    setEditingId(null);
    setMessage('');
  };

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleStatusFilterChange = (e) => { setStatusFilter(e.target.value); setCurrentPage(1); };
  const formatStatus = (status) => status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Unknown';

  return (
    <div className="manage-kiosk-page">
      <div className="page-header">
        <h1>Kiosk Management</h1>
        <p>Add, edit, and manage all e-waste collection points.</p>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="layout-grid">
        <div className="form-container glass-card">
          <h2><FiPlus /> {editingId ? 'Edit Kiosk' : 'Add New Kiosk'}</h2>
          <form onSubmit={handleSubmit} className="kiosk-form">
            <div className="form-group">
              <label>Kiosk Number *</label>
              <input type="text" name="kioskNumber" value={formData.kioskNumber} onChange={handleInputChange} required placeholder="e.g., K001" />
            </div>
            <div className="form-group">
              <label>Location Name *</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g., SM Mall Makati" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Optional details..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input type="number" name="capacity.max" value={formData.capacity.max} onChange={handleInputChange} min="1" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Opening Time</label>
                <input type="time" name="operatingHours.open" value={formData.operatingHours.open} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Closing Time</label>
                <input type="time" name="operatingHours.close" value={formData.operatingHours.close} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Location Coordinates *</label>
              <div className="coords-display">
                {selectedPosition ? `Lat: ${selectedPosition.lat.toFixed(6)}, Lng: ${selectedPosition.lng.toFixed(6)}` : 'Click on the map to select'}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : (editingId ? 'Update Kiosk' : 'Create Kiosk')}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="map-container glass-card">
          <h2><FiMapPin /> Select Location</h2>
          <p className="map-instruction">Click on the map to set the kiosk's exact coordinates.</p>
          <div className="map-wrapper">
          <MapContainer center={[14.5547, 121.0244]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
/>      
<LocationMarker position={selectedPosition} setPosition={setSelectedPosition} />
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="list-container glass-card">
        <div className="list-header">
          <h2>Existing Kiosks</h2>
          <div className="filter-controls">
            <div className="search-wrapper">
              <FiSearch />
              <input type="text" placeholder="Search kiosks..." value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div className="filter-wrapper">
              <FiSliders />
              <select value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
        {fetchingKiosks ? (
          <div className="loading-state"><FiLoader className="spinner" /> Loading kiosks...</div>
        ) : kiosks.length === 0 ? (
          <div className="empty-state">No kiosks found.</div>
        ) : (
          <>
            <div className="kiosk-grid">
              {kiosks.map((kiosk) => (
                <div key={kiosk._id} className="kiosk-card">
                  <div className="card-header">
                    <h3>Kiosk #{kiosk.kioskNumber}</h3>
                    <span className={`status-badge ${kiosk.status?.toLowerCase()}`}>{formatStatus(kiosk.status)}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Location:</strong> {kiosk.location}</p>
                    <p><strong>Capacity:</strong> {kiosk.capacity?.current || 0} / {kiosk.capacity?.max || 100}</p>
                    <p><strong>Hours:</strong> {kiosk.operatingHours?.open} - {kiosk.operatingHours?.close}</p>
                  </div>
                  <div className="card-footer">
                    <button onClick={() => handleEdit(kiosk)} className="card-btn btn-edit"><FiEdit /> Edit</button>
                    <select onChange={(e) => { if (e.target.value) handleStatusUpdate(kiosk._id, e.target.value); }} value="" className="card-btn btn-status">
                      <option value="">Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                    <button onClick={() => handleDelete(kiosk._id)} className="card-btn btn-delete"><FiTrash2 /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><FiChevronLeft /> Previous</button>
                <span>Page {currentPage} of {pagination.totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.totalPages))} disabled={currentPage === pagination.totalPages}>Next <FiChevronRight /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageKioskPage;