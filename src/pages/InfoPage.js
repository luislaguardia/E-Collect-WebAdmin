import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import 'leaflet/dist/leaflet.css';
import './InfoPage.css';
import logo from '../assets/ecollect-logo.png';

// Coordinate mapping for kiosk locations
const kioskCoordinates = {
  "Makati City": [14.5547, 121.0244],
  "Pasig City": [14.5608, 121.0776],
  "Taguig City": [14.5306, 121.0575],
  // Add more locations as needed
};

const InfoPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchKiosks();
  }, []);

  const fetchKiosks = async () => {
    try {
      // Try to fetch without authentication first for public info
      const response = await adminService.getAllKiosks();
      if (response.data.success) {
        setKiosks(response.data.data);
      }
    } catch (err) {
      // If admin service fails, create mock data for demo
      console.warn('Failed to fetch kiosks, using demo data:', err);
      setKiosks([
        {
          _id: '1',
          kioskNumber: 'K001',
          location: 'Makati City',
          status: 'active'
        },
        {
          _id: '2',
          kioskNumber: 'K002',
          location: 'Pasig City',
          status: 'active'
        },
        {
          _id: '3',
          kioskNumber: 'K003',
          location: 'Taguig City',
          status: 'inactive'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    navigate('/login');
  };

  // Default center (Manila, Philippines)
  const defaultCenter = [14.5995, 120.9842];

  return (
    <div className="info-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-header">
            <img src={logo} alt="E-Collect Logo" className="hero-logo" />
            <div className="hero-text">
              <h1 className="hero-title">E-Collect System</h1>
              <p className="hero-subtitle">Smart E-Waste Collection Network</p>
            </div>
            <button onClick={handleAdminLogin} className="admin-login-btn">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Admin Portal
            </button>
          </div>
          
          <div className="hero-banner">
            <h2>Revolutionizing E-Waste Management</h2>
            <p>Join us in creating a sustainable future through intelligent waste collection and recycling rewards</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">{kiosks.length}</span>
                <span className="stat-label">Active Kiosks</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Items Recycled</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose E-Collect?</h2>
            <p>Discover the benefits of our smart e-waste management system</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon eco">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3>Eco-Friendly Solution</h3>
              <p>Help protect our planet by responsibly disposing of electronic waste through our certified recycling network.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon tech">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Smart Technology</h3>
              <p>Advanced QR code scanning and AI-powered categorization ensure accurate sorting and processing of e-waste.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon reward">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3>Reward System</h3>
              <p>Earn valuable points for every item you recycle and redeem them for exciting rewards and discounts.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3>Convenient Locations</h3>
              <p>Find our smart kiosks conveniently located throughout the city for easy access and hassle-free recycling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="section-header">
            <h2>Find Kiosks Near You</h2>
            <p>Locate the nearest E-Collect kiosk using our interactive map</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading kiosk locations...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="map-container">
                <MapContainer
                  center={defaultCenter}
                  zoom={11}
                  style={{ height: '500px', width: '100%' }}
                  className="leaflet-map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {kiosks.map((kiosk) => {
                    const position = kioskCoordinates[kiosk.location] || defaultCenter;
                    return (
                      <Marker key={kiosk._id} position={position}>
                        <Popup>
                          <div className="popup-content">
                            <h4>Kiosk #{kiosk.kioskNumber}</h4>
                            <p><strong>Location:</strong> {kiosk.location}</p>
                            <p><strong>Status:</strong> 
                              <span className={`status ${kiosk.status?.toLowerCase() || 'active'}`}>
                                {kiosk.status || 'Active'}
                              </span>
                            </p>
                            {kiosk.capacity && (
                              <p><strong>Capacity:</strong> {kiosk.capacity.current}/{kiosk.capacity.max}</p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              <div className="kiosk-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3>{kiosks.length}</h3>
                  <p>Total Kiosks</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>{kiosks.filter(k => k.status?.toLowerCase() !== 'inactive').length}</h3>
                  <p>Active Kiosks</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon coverage">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>3</h3>
                  <p>Cities Covered</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of users who are already contributing to a cleaner, more sustainable future.</p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Get Started
              </button>
              <button className="cta-btn secondary" onClick={handleAdminLogin}>
                Admin Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="info-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src={logo} alt="E-Collect Logo" className="footer-logo" />
              {/* <h3>E-Collect</h3> */}
              <p>Building a sustainable future through smart e-waste management.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4>Contact</h4>
                <p>📧 info@ecollect.com</p>
                <p>📞 +63 123 456 7890</p>
                <p>📍 Metro Manila, Philippines</p>
              </div>
              
              <div className="footer-section">
                <h4>Services</h4>
                <p>E-Waste Collection</p>
                <p>Recycling Programs</p>
                <p>Corporate Solutions</p>
              </div>
              
              <div className="footer-section">
                <h4>Connect</h4>
                <p>Facebook</p>
                <p>Twitter</p>
                <p>LinkedIn</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 E-Collect System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfoPage;