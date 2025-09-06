import axios from 'axios';

// Use your backend server's URL
const API_URL = 'http://localhost:5080/api/auth/';

const login = (username, password) => {
  return axios.post(API_URL + 'login', {
    username,
    password,
  });
};

const authService = {
  login,
};

export default authService;