import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ecollect-server.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // --- Kiosk Management ---
  getAllKiosks: (params = {}) => {
    // Normalize status parameter for backend
    if (params.status && params.status !== 'all') {
      params.status = params.status.toUpperCase();
    }
    return api.get('/admin/kiosks', { params });
  },

  getKioskById: (id) => {
    if (!id) {
      return Promise.reject(new Error('Kiosk ID is required'));
    }
    return api.get(`/admin/kiosks/${id}`);
  },

  createKiosk: (kioskData) => {
    // Validate required fields before sending
    if (!kioskData.kioskNumber || !kioskData.location) {
      return Promise.reject(new Error('Kiosk number and location are required'));
    }
    
    if (!kioskData.coordinates || !kioskData.coordinates.latitude || !kioskData.coordinates.longitude) {
      return Promise.reject(new Error('Coordinates are required'));
    }

    // Normalize data
    const normalizedData = {
      ...kioskData,
      kioskNumber: kioskData.kioskNumber.trim().toUpperCase(),
      location: kioskData.location.trim(),
      status: kioskData.status ? kioskData.status.toUpperCase() : 'ACTIVE'
    };

    return api.post('/admin/kiosks', normalizedData);
  },

  updateKiosk: (id, kioskData) => {
    if (!id) {
      return Promise.reject(new Error('Kiosk ID is required'));
    }

    // Normalize data
    const normalizedData = { ...kioskData };
    if (normalizedData.kioskNumber) {
      normalizedData.kioskNumber = normalizedData.kioskNumber.trim().toUpperCase();
    }
    if (normalizedData.location) {
      normalizedData.location = normalizedData.location.trim();
    }
    if (normalizedData.status) {
      normalizedData.status = normalizedData.status.toUpperCase();
    }

    return api.put(`/admin/kiosks/${id}`, normalizedData);
  },

  updateKioskStatus: (id, status) => {
    if (!id) {
      return Promise.reject(new Error('Kiosk ID is required'));
    }
    if (!status) {
      return Promise.reject(new Error('Status is required'));
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
    const normalizedStatus = status.toUpperCase();
    
    if (!validStatuses.includes(normalizedStatus)) {
      return Promise.reject(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    return api.patch(`/admin/kiosks/${id}/status`, { status: normalizedStatus });
  },

  deleteKiosk: (id) => {
    if (!id) {
      return Promise.reject(new Error('Kiosk ID is required'));
    }
    return api.delete(`/admin/kiosks/${id}`);
  },

  getNearbyKiosks: (lat, lng, radius = 10, limit = 20) => {
    if (!lat || !lng) {
      return Promise.reject(new Error('Latitude and longitude are required'));
    }

    const validation = adminService.validateCoordinates(lat, lng);
    if (!validation.valid) {
      return Promise.reject(new Error(validation.error));
    }

    return api.get('/admin/kiosks/nearby', {
      params: { lat, lng, radius, limit }
    });
  },

  // --- User Management ---
  getAllUsers: (params = {}) => {
    return api.get('/admin/users', { params });
  },

  // --- E-Waste Management ---
  getAllEwaste: (params = {}) => {
    return api.get('/admin/ewaste', { params });
  },

  getEwasteSummary: () => {
    return api.get('/admin/ewaste-summary');
  },

  // --- Dashboard ---
  getDashboardStats: () => {
    return api.get('/admin/stats');
  },

  // --- Health Check ---
  healthCheck: () => {
    return api.get('/admin/health');
  },

  // --- Utility Functions ---
  
  // Calculate distance between two coordinates
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  },

  // Format coordinates for display
  formatCoordinates: (lat, lng, precision = 4) => {
    if (!lat || !lng) return 'N/A';
    return `${parseFloat(lat).toFixed(precision)}, ${parseFloat(lng).toFixed(precision)}`;
  },

  // Validate coordinates
  validateCoordinates: (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return { valid: false, error: 'Coordinates must be valid numbers' };
    }
    
    if (latitude < -90 || latitude > 90) {
      return { valid: false, error: 'Latitude must be between -90 and 90' };
    }
    
    if (longitude < -180 || longitude > 180) {
      return { valid: false, error: 'Longitude must be between -180 and 180' };
    }
    
    return { valid: true, latitude, longitude };
  },

  // Normalize status for consistency
  normalizeStatus: (status) => {
    if (!status) return 'ACTIVE';
    return status.toUpperCase();
  },

  // Format status for display
  formatStatus: (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0) + status.slice(1).toLowerCase();
  },

  // Validate kiosk data
  validateKioskData: (kioskData) => {
    const errors = [];

    if (!kioskData.kioskNumber || !kioskData.kioskNumber.trim()) {
      errors.push('Kiosk number is required');
    }

    if (!kioskData.location || !kioskData.location.trim()) {
      errors.push('Location is required');
    }

    if (!kioskData.coordinates || !kioskData.coordinates.latitude || !kioskData.coordinates.longitude) {
      errors.push('Coordinates are required');
    } else {
      const coordValidation = adminService.validateCoordinates(
        kioskData.coordinates.latitude, 
        kioskData.coordinates.longitude
      );
      if (!coordValidation.valid) {
        errors.push(coordValidation.error);
      }
    }

    if (kioskData.capacity) {
      if (kioskData.capacity.max && kioskData.capacity.max < 1) {
        errors.push('Maximum capacity must be at least 1');
      }
      if (kioskData.capacity.current && kioskData.capacity.current < 0) {
        errors.push('Current capacity cannot be negative');
      }
      if (kioskData.capacity.current && kioskData.capacity.max && 
          kioskData.capacity.current > kioskData.capacity.max) {
        errors.push('Current capacity cannot exceed maximum capacity');
      }
    }

    if (kioskData.status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
      if (!validStatuses.includes(kioskData.status.toUpperCase())) {
        errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Get user's current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  },

  // Handle API errors consistently
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data.error || error.response.data.message || 'Server error occurred';
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred';
    }
  }
};

export default adminService;