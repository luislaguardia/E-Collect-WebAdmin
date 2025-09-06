import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; 
import L from 'leaflet';
import adminService from '../services/adminService';
import './KioskFinderPage.css';

const kioskCoordinates = {
    "Makati City": [14.5547, 121.0244],
    "Pasig City": [14.5608, 121.0776],
    "Taguig City": [14.5306, 121.0575],
};

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);

  return null;
}
// ------------------------------------


const KioskFinderPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        const response = await adminService.getAllKiosks();
        setKiosks(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedKiosk(response.data.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch kiosks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKiosks();
  }, []);

  const mapPosition = selectedKiosk ? kioskCoordinates[selectedKiosk.location] || [14.5995, 120.9842] : [14.5995, 120.9842];
  const mapZoom = 13;

  if (loading) {
    return <div>Loading kiosks...</div>;
  }

  return (
    <div className="kiosk-finder-container">
      <div className="kiosk-list-panel">
        <h2>All Kiosks</h2>
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
              <h3>Kiosk#: {selectedKiosk.kioskNumber}</h3>
              <p><strong>Location:</strong> {selectedKiosk.location}</p>
              <p><strong>Status:</strong> <span className={`status ${selectedKiosk.status?.toLowerCase()}`}>{selectedKiosk.status}</span></p>
            </div>
            {/* The initial center is still set here */}
            <MapContainer center={mapPosition} zoom={mapZoom} className="map-view">
              {/* --- 2. ADD THE HELPER COMPONENT INSIDE --- */}
              <ChangeMapView center={mapPosition} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={mapPosition} icon={redIcon}>
                <Popup>
                  Kiosk #{selectedKiosk.kioskNumber} <br /> {selectedKiosk.location}
                </Popup>
              </Marker>
            </MapContainer>
          </>
        ) : (
          <p>Select a kiosk to see its location.</p>
        )}
      </div>
    </div>
  );
};

export default KioskFinderPage;