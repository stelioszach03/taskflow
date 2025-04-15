// Task Priorities
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Task Statuses
export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// API Routes
export const API_ROUTES = {
  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  
  // Task routes
  TASKS: '/tasks',
  TASK_BY_ID: (id) => `/tasks/${id}`,
  TASK_ASSIGN: (id) => `/tasks/${id}/assign`,
  TASK_UNASSIGN: (id) => `/tasks/${id}/unassign`,
  TASK_STATUS: (id) => `/tasks/${id}/status`,
  
  // User routes
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_SEARCH: '/users/search',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  MEDIUM: 'MMMM DD, YYYY',
  LONG: 'dddd, MMMM DD, YYYY',
  TIME: 'h:mm A',
  DATETIME: 'MMM DD, YYYY h:mm A',
};

// Theme options
export const THEME = {
  COLORS: [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
  ],
  DEFAULT_COLOR: '#6366f1',
};

// Error messages
export const ERROR_MESSAGES = {
  DEFAULT: 'An error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  NETWORK: 'Network error. Please check your connection.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  USER_UPDATED: 'User updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
};

export default {
  TASK_PRIORITIES,
  TASK_STATUSES,
  USER_ROLES,
  API_ROUTES,
  STORAGE_KEYS,
  PAGINATION,
  DATE_FORMATS,
  THEME,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};