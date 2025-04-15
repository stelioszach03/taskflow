import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Login user
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get current user
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Update profile
const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Get user profile
const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUserProfile
};

export default authService;