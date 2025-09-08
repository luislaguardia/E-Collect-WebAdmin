import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import adminService from '../services/adminService';
import './KioskFinderPage.css';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';

// --- Custom icon for the map marker ---
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- Helper component to change map view smoothly ---
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  return null;
}

const KioskFinderPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const response = await adminService.getAllKiosks();
        // Filter for kiosks that have coordinates and are active
        const validKiosks = response.data.data.filter(
          k => k.status === 'ACTIVE' && k.coordinates?.latitude && k.coordinates?.longitude
        );
        setKiosks(validKiosks);
        if (validKiosks.length > 0) {
          setSelectedKiosk(validKiosks[0]);
        }
      } catch (err) {
        console.error("Failed to fetch kiosks", err);
        setError("Could not load kiosk data.");
      } finally {
        setLoading(false);
      }
    };
    fetchKiosks();
  }, []);
  
  // Default map position if no kiosk is selected (e.g., Taguig)
  const mapPosition = selectedKiosk
    ? [selectedKiosk.coordinates.latitude, selectedKiosk.coordinates.longitude]
    : [14.5306, 121.0575];

  if (loading) {
    return (
      <div className="loading-container">
        <FiLoader className="loading-spinner" />
        <p>Loading Kiosks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FiAlertCircle size={48} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="kiosk-finder-container">
      <div className="kiosk-list-panel">
        <div className="panel-header">
          <FiMapPin />
          <h2>Available Kiosks</h2>
        </div>
        <ul>
          {kiosks.map((kiosk) => (
            <li
              key={kiosk._id}
              className={selectedKiosk?._id === kiosk._id ? 'selected' : ''}
              onClick={() => setSelectedKiosk(kiosk)}
            >
              <strong>Kiosk #{kiosk.kioskNumber}</strong>
              <p>{kiosk.location}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="kiosk-map-panel">
        {selectedKiosk ? (
          <>
            <div className="kiosk-details">
              <h3>Kiosk #{selectedKiosk.kioskNumber}</h3>
              <div className="details-row">
                <p><strong>Location:</strong> {selectedKiosk.location}</p>
                <p>
                  <strong>Status:</strong>
                  <span className={`status ${selectedKiosk.status?.toLowerCase()}`}>
                    {selectedKiosk.status}
                  </span>
                </p>
              </div>
            </div>
            <MapContainer center={mapPosition} zoom={15} className="map-view">
              <ChangeMapView center={mapPosition} zoom={15} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <Marker position={mapPosition} icon={greenIcon}>
                <Popup>
                  Kiosk #{selectedKiosk.kioskNumber} <br /> {selectedKiosk.location}
                </Popup>
              </Marker>
            </MapContainer>
          </>
        ) : (
          <div className="no-kiosk-selected">
            <FiMapPin size={48} />
            <p>No active kiosks available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskFinderPage;