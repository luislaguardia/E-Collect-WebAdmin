import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './LoginPage.css';
import ewasteImage from '../assets/ewaste-bin.png';
import logo from '../assets/ecollect-logo.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(username, password);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToInfo = () => {
    navigate('/info');
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-header">
          <img src={logo} alt="E-Collect Logo" className="logo" />
          <h1 className="login-title">Admin Login</h1>
          <p className="login-subtitle">Access the E-Collect Management System</p>
        </div>
        
        <div className="login-card">
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth={2}/>
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth={2}/>
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth={2}/>
                </svg>
                {error}
              </div>
            )}
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                  </svg>
                  Signing In...
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button onClick={handleGoToInfo} className="info-button">
            <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={2}/>
              <path d="M12 16v-4" strokeWidth={2} strokeLinecap="round"/>
              <path d="M12 8h.01" strokeWidth={2} strokeLinecap="round"/>
            </svg>
            View System Information
          </button>
        </div>

        <div className="login-footer">
          <p>&copy; 2025 E-Collect System. All rights reserved.</p>
        </div>
      </div>

      <div className="login-image-section">
        <div className="image-content">
          <div className="floating-elements">
            <div className="floating-circle circle-1"></div>
            <div className="floating-circle circle-2"></div>
            <div className="floating-circle circle-3"></div>
          </div>
          <img src={ewasteImage} alt="E-Waste Management" className="main-image" />
          <div className="image-overlay">
            <h2>Smart E-Waste Management</h2>
            <p>Revolutionizing electronic waste collection with intelligent kiosks and reward systems.</p>
            <div className="features-list">
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Real-time monitoring</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Automated sorting</span>
              </div>
              <div className="feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Reward system</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;