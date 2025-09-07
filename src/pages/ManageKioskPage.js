import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import adminService from '../services/adminService';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
}

const ManageKioskPage = () => {
  const [formData, setFormData] = useState({
    kioskNumber: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    capacity: {
      current: 0,
      max: 100
    },
    operatingHours: {
      open: '06:00',
      close: '22:00'
    }
  });
  
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [kiosks, setKiosks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingKiosks, setFetchingKiosks] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch kiosks on component mount
  useEffect(() => {
    fetchKiosks();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchKiosks = async () => {
    try {
      setFetchingKiosks(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        status: statusFilter
      };

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
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.kioskNumber.trim()) {
      showMessage('Kiosk number is required', 'error');
      return false;
    }
    
    if (!formData.location.trim()) {
      showMessage('Location is required', 'error');
      return false;
    }
    
    if (!selectedPosition) {
      showMessage('Please select a location on the map', 'error');
      return false;
    }

    const validation = adminService.validateCoordinates(
      selectedPosition.lat, 
      selectedPosition.lng
    );
    
    if (!validation.valid) {
      showMessage(validation.error, 'error');
      return false;
    }

    if (formData.capacity.max < 1) {
      showMessage('Maximum capacity must be at least 1', 'error');
      return false;
    }

    if (formData.capacity.current < 0) {
      showMessage('Current capacity cannot be negative', 'error');
      return false;
    }

    if (formData.capacity.current > formData.capacity.max) {
      showMessage('Current capacity cannot exceed maximum capacity', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const kioskData = {
        kioskNumber: formData.kioskNumber.trim(),
        location: formData.location.trim(),
        coordinates: {
          latitude: parseFloat(selectedPosition.lat),
          longitude: parseFloat(selectedPosition.lng)
        },
        status: formData.status, // Keep as is, backend will normalize
        capacity: {
          current: parseInt(formData.capacity.current),
          max: parseInt(formData.capacity.max)
        },
        operatingHours: {
          open: formData.operatingHours.open,
          close: formData.operatingHours.close
        }
      };

      if (formData.description.trim()) {
        kioskData.description = formData.description.trim();
      }

      if (editingId) {
        // Update existing kiosk
        await adminService.updateKiosk(editingId, kioskData);
        showMessage('Kiosk updated successfully!', 'success');
      } else {
        // Create new kiosk
        await adminService.createKiosk(kioskData);
        showMessage('Kiosk created successfully!', 'success');
      }

      // Reset form and refresh kiosks
      resetForm();
      fetchKiosks();
    } catch (error) {
      console.error('Error saving kiosk:', error);
      const errorMessage = error.response?.data?.error || 'Error saving kiosk. Please try again.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (kiosk) => {
    setFormData({
      kioskNumber: kiosk.kioskNumber,
      location: kiosk.location,
      status: kiosk.status, // Use backend status as-is (uppercase)
      description: kiosk.description || '',
      capacity: {
        current: kiosk.capacity?.current || 0,
        max: kiosk.capacity?.max || 100
      },
      operatingHours: {
        open: kiosk.operatingHours?.open || '06:00',
        close: kiosk.operatingHours?.close || '22:00'
      }
    });
    
    // Handle coordinates safely
    if (kiosk.coordinates && kiosk.coordinates.latitude && kiosk.coordinates.longitude) {
      setSelectedPosition({
        lat: kiosk.coordinates.latitude,
        lng: kiosk.coordinates.longitude
      });
    } else {
      setSelectedPosition(null);
      showMessage('This kiosk has missing coordinates. Please select a location on the map.', 'error');
    }
    
    setEditingId(kiosk._id);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this kiosk? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteKiosk(id);
      showMessage('Kiosk deleted successfully!', 'success');
      fetchKiosks();
    } catch (error) {
      console.error('Error deleting kiosk:', error);
      const errorMessage = error.response?.data?.error || 'Error deleting kiosk. Please try again.';
      showMessage(errorMessage, 'error');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminService.updateKioskStatus(id, newStatus);
      showMessage(`Kiosk status updated to ${newStatus}!`, 'success');
      fetchKiosks();
    } catch (error) {
      console.error('Error updating kiosk status:', error);
      const errorMessage = error.response?.data?.error || 'Error updating kiosk status.';
      showMessage(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      kioskNumber: '',
      location: '',
      status: 'ACTIVE',
      description: '',
      capacity: {
        current: 0,
        max: 100
      },
      operatingHours: {
        open: '06:00',
        close: '22:00'
      }
    });
    setSelectedPosition(null);
    setEditingId(null);
    setMessage('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case 'ACTIVE':
        return { bg: '#c6f6d5', color: '#22543d' };
      case 'INACTIVE':
        return { bg: '#fed7d7', color: '#c53030' };
      case 'MAINTENANCE':
        return { bg: '#fbb6ce', color: '#97266d' };
      default:
        return { bg: '#e2e8f0', color: '#4a5568' };
    }
  };

  const formatStatusForDisplay = (status) => {
    return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Unknown';
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#2d3748', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Kiosk Management
      </h1>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: messageType === 'error' ? '#fed7d7' : '#c6f6d5',
          color: messageType === 'error' ? '#c53030' : '#22543d',
          borderRadius: '8px',
          border: `1px solid ${messageType === 'error' ? '#feb2b2' : '#9ae6b4'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Form Section */}
        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            {editingId ? 'Edit Kiosk' : 'Add New Kiosk'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                Kiosk Number: *
              </label>
              <input
                type="text"
                name="kioskNumber"
                value={formData.kioskNumber}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., K001"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                Location Name: *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., SM Mall Makati"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                Description:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #cbd5e0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Optional description..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Status:
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Max Capacity:
                </label>
                <input
                  type="number"
                  name="capacity.max"
                  value={formData.capacity.max}
                  onChange={handleInputChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Opening Time:
                </label>
                <input
                  type="time"
                  name="operatingHours.open"
                  value={formData.operatingHours.open}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Closing Time:
                </label>
                <input
                  type="time"
                  name="operatingHours.close"
                  value={formData.operatingHours.close}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e0',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                Location Coordinates: *
              </label>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: '#edf2f7',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: '#4a5568'
              }}>
                {selectedPosition ? (
                  <>
                    Lat: {selectedPosition.lat.toFixed(6)}, 
                    Lng: {selectedPosition.lng.toFixed(6)}
                  </>
                ) : (
                  'Click on the map to select coordinates'
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading ? '#a0aec0' : '#94c83d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : (editingId ? 'Update Kiosk' : 'Create Kiosk')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#e2e8f0',
                    color: '#4a5568',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Map Section */}
        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Select Location
          </h2>
          <p style={{ 
            marginBottom: '1rem', 
            fontSize: '0.9rem', 
            color: '#718096' 
          }}>
            Click on the map to set the kiosk location
          </p>
          
          <div style={{ 
            height: '400px', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid #cbd5e0'
          }}>
            <MapContainer
              center={[14.5995, 120.9842]} // Manila, Philippines
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker 
                position={selectedPosition} 
                setPosition={setSelectedPosition} 
              />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search kiosks..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={{
            padding: '0.75rem',
            border: '1px solid #cbd5e0',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Existing Kiosks List */}
      <div style={{
        backgroundColor: '#f7fafc',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, color: '#2d3748' }}>
            Existing Kiosks
          </h2>
          {pagination && (
            <div style={{ fontSize: '0.9rem', color: '#718096' }}>
              Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, pagination.totalKiosks)} of {pagination.totalKiosks}
            </div>
          )}
        </div>
        
        {fetchingKiosks ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: '#718096' }}>Loading kiosks...</div>
          </div>
        ) : kiosks.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            {searchTerm || statusFilter !== 'all' ? 'No kiosks found matching your criteria.' : 'No kiosks found. Add your first kiosk above.'}
          </p>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {kiosks.map((kiosk) => {
                const statusColors = getStatusColor(kiosk.status);
                return (
                  <div
                    key={kiosk._id}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ 
                        margin: 0, 
                        color: '#2d3748',
                        fontSize: '1.1rem'
                      }}>
                        Kiosk #{kiosk.kioskNumber}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            textTransform: 'capitalize',
                            backgroundColor: statusColors.bg,
                            color: statusColors.color
                          }}
                        >
                          {formatStatusForDisplay(kiosk.status)}
                        </span>
                        {kiosk.capacityPercentage !== undefined && (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#718096',
                            textAlign: 'right'
                          }}>
                            {kiosk.capacity?.current || 0}/{kiosk.capacity?.max || 100} ({kiosk.capacityPercentage}%)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ 
                        margin: '0.5rem 0', 
                        color: '#4a5568',
                        fontSize: '0.9rem'
                      }}>
                        <strong>Location:</strong> {kiosk.location}
                      </p>
                      
                      {kiosk.description && (
                        <p style={{ 
                          margin: '0.5rem 0', 
                          color: '#718096',
                          fontSize: '0.85rem'
                        }}>
                          {kiosk.description}
                        </p>
                      )}
                      
                      <p style={{ 
                        margin: '0.5rem 0', 
                        color: '#718096',
                        fontSize: '0.8rem'
                      }}>
                        <strong>Coordinates:</strong><br/>
                        {kiosk.coordinates.latitude.toFixed(6)}, {kiosk.coordinates.longitude.toFixed(6)}
                      </p>
                      
                      {kiosk.operatingHours && (
                        <p style={{ 
                          margin: '0.5rem 0', 
                          color: '#718096',
                          fontSize: '0.8rem'
                        }}>
                          <strong>Hours:</strong> {kiosk.operatingHours.open} - {kiosk.operatingHours.close}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr', 
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => handleEdit(kiosk)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#3182ce',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusUpdate(kiosk._id, e.target.value);
                            e.target.value = ''; // Reset select
                          }
                        }}
                        value=""
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                      
                      <button
                        onClick={() => handleDelete(kiosk._id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === 1 ? '#e2e8f0' : '#3182ce',
                    color: currentPage === 1 ? '#a0aec0' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                
                <span style={{ 
                  padding: '0.5rem 1rem',
                  color: '#4a5568'
                }}>
                  Page {currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === pagination.totalPages ? '#e2e8f0' : '#3182ce',
                    color: currentPage === pagination.totalPages ? '#a0aec0' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageKioskPage;