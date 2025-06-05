import api, { isCancelError, createCancelableRequest } from './api';
import toast from 'react-hot-toast';

// Helper function to handle auth responses
const handleAuthResponse = (response, successMessage) => {
  if (response.data) {
    // Store user data (without tokens)
    const userData = { ...response.data };
    delete userData.accessToken;
    delete userData.refreshToken;
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store access token
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    
    if (successMessage) {
      toast.success(successMessage);
    }
  }
  return response.data;
};

// Helper function to handle auth errors
const handleAuthError = (error, defaultMessage) => {
  // Don't show toast for cancelled requests
  if (isCancelError(error)) {
    throw error;
  }

  // Check for specific error messages from the server
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  // Don't show duplicate toast if already shown by interceptor
  if (!error.response || error.response.status >= 500) {
    // Server errors are already handled by interceptor
  } else if (error.response?.status === 422) {
    // Validation errors are already handled by interceptor
  } else {
    toast.error(errorMessage);
  }
  
  throw error;
};

// Register user
const register = async (userData) => {
  try {
    const loadingToast = toast.loading('Creating your account...');
    const response = await api.post('/auth/register', userData);
    toast.dismiss(loadingToast);
    
    return handleAuthResponse(response, 'Registration successful! Welcome aboard!');
  } catch (error) {
    return handleAuthError(error, 'Registration failed. Please try again.');
  }
};

// Login user
const login = async (email, password) => {
  try {
    const loadingToast = toast.loading('Logging you in...');
    const response = await api.post('/auth/login', { email, password });
    toast.dismiss(loadingToast);
    
    return handleAuthResponse(response, 'Welcome back!');
  } catch (error) {
    return handleAuthError(error, 'Invalid email or password');
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  toast.success('Logged out successfully');
};

// Get current user
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Update profile
const updateProfile = async (userData) => {
  try {
    const loadingToast = toast.loading('Updating your profile...');
    const response = await api.put('/auth/profile', userData);
    toast.dismiss(loadingToast);
    
    return handleAuthResponse(response, 'Profile updated successfully!');
  } catch (error) {
    return handleAuthError(error, 'Failed to update profile');
  }
};

// Get user profile with cancellation support
const getUserProfile = async (cancelToken) => {
  try {
    const config = cancelToken ? { cancelToken } : {};
    const response = await api.get('/auth/profile', config);
    return response.data;
  } catch (error) {
    if (!isCancelError(error)) {
      return handleAuthError(error, 'Failed to load profile');
    }
    throw error;
  }
};

// Change password
const changePassword = async (passwordData) => {
  try {
    const loadingToast = toast.loading('Changing your password...');
    const response = await api.post('/auth/change-password', passwordData);
    toast.dismiss(loadingToast);
    
    toast.success('Password changed successfully!');
    return response.data;
  } catch (error) {
    return handleAuthError(error, 'Failed to change password');
  }
};

// Request password reset
const requestPasswordReset = async (email) => {
  try {
    const loadingToast = toast.loading('Sending reset instructions...');
    const response = await api.post('/auth/forgot-password', { email });
    toast.dismiss(loadingToast);
    
    toast.success('Password reset instructions sent to your email!');
    return response.data;
  } catch (error) {
    return handleAuthError(error, 'Failed to send reset instructions');
  }
};

// Reset password with token
const resetPassword = async (token, newPassword) => {
  try {
    const loadingToast = toast.loading('Resetting your password...');
    const response = await api.post('/auth/reset-password', { token, newPassword });
    toast.dismiss(loadingToast);
    
    toast.success('Password reset successful! You can now log in.');
    return response.data;
  } catch (error) {
    return handleAuthError(error, 'Failed to reset password');
  }
};

// Verify email
const verifyEmail = async (token) => {
  try {
    const loadingToast = toast.loading('Verifying your email...');
    const response = await api.post('/auth/verify-email', { token });
    toast.dismiss(loadingToast);
    
    toast.success('Email verified successfully!');
    return response.data;
  } catch (error) {
    return handleAuthError(error, 'Failed to verify email');
  }
};

// Resend verification email
const resendVerificationEmail = async () => {
  try {
    const loadingToast = toast.loading('Sending verification email...');
    const response = await api.post('/auth/resend-verification');
    toast.dismiss(loadingToast);
    
    toast.success('Verification email sent!');
    return response.data;
  } catch (error) {
    return handleAuthError(error, 'Failed to send verification email');
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getCurrentUser();
  return !!(token && user);
};

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  isAuthenticated,
  getAuthToken,
  createCancelableRequest,
};

export default authService;