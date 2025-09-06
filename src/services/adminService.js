import axios from 'axios';

const API_URL = 'http://localhost:5080/api/admin/';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
const getStats = () => {
  return axios.get(API_URL + 'stats', getAuthHeaders());
};
const getAllKiosks = () => {
    return axios.get(API_URL + 'kiosks', getAuthHeaders());
  };
const getAllEwaste = () => {
    return axios.get(API_URL + 'ewaste', getAuthHeaders());
  };
const createKiosk = (kioskData) => {
  return axios.post(API_URL + 'kiosks', kioskData, getAuthHeaders());
};
const updateKiosk = (id, kioskData) => {
  return axios.put(API_URL + `kiosks/${id}`, kioskData, getAuthHeaders());
};
const deleteKiosk = (id) => {
  return axios.delete(API_URL + `kiosks/${id}`, getAuthHeaders());
};
const getAllUsers = () => {
    return axios.get(API_URL + 'users', getAuthHeaders());
  };

const getEwasteSummary = () => { // new
  return axios.get(API_URL + 'ewaste-summary', getAuthHeaders());
};


const adminService = {
  getStats,
  getAllKiosks,
  getAllEwaste,
  createKiosk,
  updateKiosk,
  deleteKiosk,
  getAllUsers,
  getEwasteSummary, // new
};

export default adminService;