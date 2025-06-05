// User-friendly error messages for different scenarios
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long. Please try again.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters long.',
  
  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This resource already exists.',
  
  // Server errors
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  MAINTENANCE: 'The service is currently under maintenance. Please try again later.',
  
  // Task-specific errors
  TASK_NOT_FOUND: 'Task not found or has been deleted.',
  TASK_PERMISSION_DENIED: 'You don\'t have permission to modify this task.',
  TASK_ALREADY_ASSIGNED: 'This task is already assigned to another user.',
  
  // Generic errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please contact support if the problem persists.',
};

// Helper function to get user-friendly error message
export const getErrorMessage = (error, defaultMessage = ERROR_MESSAGES.GENERIC_ERROR) => {
  // Check if error has a response with a message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Check for network errors
  if (!error?.response && error?.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Check for timeout errors
  if (error?.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  
  // Check for specific HTTP status codes
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.SESSION_EXPIRED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.ALREADY_EXISTS;
      case 423:
        return ERROR_MESSAGES.ACCOUNT_LOCKED;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return ERROR_MESSAGES.MAINTENANCE;
      default:
        return defaultMessage;
    }
  }
  
  // Return default message if no specific error found
  return defaultMessage;
};

// Helper function to check if error is retryable
export const isRetryableError = (error) => {
  // Network errors are retryable
  if (!error?.response) {
    return true;
  }
  
  // Certain status codes are retryable
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.response.status);
};

// Helper function to get retry delay based on attempt number
export const getRetryDelay = (attemptNumber, baseDelay = 1000) => {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
};