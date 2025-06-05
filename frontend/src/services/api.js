import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create a map to store pending requests for cancellation
const pendingRequests = new Map();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Loading state management
let activeRequests = 0;
const loadingCallbacks = new Set();

export const subscribeToLoadingState = (callback) => {
  loadingCallbacks.add(callback);
  return () => loadingCallbacks.delete(callback);
};

const updateLoadingState = () => {
  const isLoading = activeRequests > 0;
  loadingCallbacks.forEach(callback => callback(isLoading));
};

// Request interceptor for adding auth token and cancellation
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request cancellation
    const requestKey = `${config.method}:${config.url}`;
    
    // Cancel any existing request to the same endpoint
    if (pendingRequests.has(requestKey)) {
      const cancel = pendingRequests.get(requestKey);
      cancel('Duplicate request cancelled');
    }

    // Create new cancellation token
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    pendingRequests.set(requestKey, source.cancel);

    // Update loading state
    activeRequests++;
    updateLoadingState();

    return config;
  },
  (error) => {
    activeRequests--;
    updateLoadingState();
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retries
api.interceptors.response.use(
  (response) => {
    // Remove from pending requests
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);
    
    // Update loading state
    activeRequests--;
    updateLoadingState();
    
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Remove from pending requests
    if (config) {
      const requestKey = `${config.method}:${config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    // Update loading state
    activeRequests--;
    updateLoadingState();

    // Don't retry cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Network error detection
    if (!response && error.message === 'Network Error') {
      toast.error('Network error: Please check your internet connection');
      return Promise.reject(error);
    }

    // Timeout error
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout: The server took too long to respond');
      return Promise.reject(error);
    }

    // Handle different HTTP status codes
    if (response) {
      switch (response.status) {
        case 400:
          toast.error(response.data?.message || 'Bad request: Please check your input');
          break;
        case 401:
          // Handle token expiration
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied: You don\'t have permission to perform this action');
          break;
        case 404:
          toast.error('Not found: The requested resource doesn\'t exist');
          break;
        case 422:
          // Validation errors
          const validationErrors = response.data?.errors;
          if (validationErrors) {
            Object.values(validationErrors).flat().forEach(error => {
              toast.error(error);
            });
          } else {
            toast.error(response.data?.message || 'Validation error');
          }
          break;
        case 429:
          toast.error('Too many requests: Please slow down');
          break;
        case 500:
          toast.error('Server error: Something went wrong on our end');
          break;
        case 502:
          toast.error('Bad gateway: Server is temporarily unavailable');
          break;
        case 503:
          toast.error('Service unavailable: Please try again later');
          break;
        default:
          toast.error(response.data?.message || `Error: ${response.statusText}`);
      }
    }

    // Implement retry logic for certain errors
    const isRetryableError = 
      !response || // Network errors
      (response && [408, 429, 500, 502, 503, 504].includes(response.status));

    if (isRetryableError && config && !config.__retryCount) {
      config.__retryCount = config.__retryCount || 0;
      
      // Retry up to 3 times with exponential backoff
      if (config.__retryCount < 3) {
        config.__retryCount++;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, config.__retryCount - 1) * 1000;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Update loading state for retry
        activeRequests++;
        updateLoadingState();
        
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

// Cancel all pending requests
export const cancelAllRequests = (reason = 'All requests cancelled') => {
  pendingRequests.forEach((cancel) => {
    cancel(reason);
  });
  pendingRequests.clear();
};

// Cancel specific request
export const cancelRequest = (method, url, reason = 'Request cancelled') => {
  const requestKey = `${method}:${url}`;
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel(reason);
    pendingRequests.delete(requestKey);
  }
};

// Helper to check if error is cancellation
export const isCancelError = (error) => {
  return axios.isCancel(error);
};

// Helper to create a cancelable request
export const createCancelableRequest = () => {
  const source = axios.CancelToken.source();
  return {
    token: source.token,
    cancel: source.cancel,
  };
};

export default api;