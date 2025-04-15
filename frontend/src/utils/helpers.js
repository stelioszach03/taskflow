// Format date with options
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', mergedOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Format time
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid time';
  }
};

// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid date/time';
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return names[0][0].toUpperCase();
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

// Check if a date is in the past
export const isDatePast = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Set time to midnight for date comparison
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return date < now;
};

// Check if a date is today
export const isDateToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

// Format number with commas for thousands
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Convert array to object with IDs as keys
export const arrayToObject = (array, key = '_id') => {
  if (!array || !Array.isArray(array)) return {};
  
  return array.reduce((acc, item) => {
    if (item && item[key]) {
      acc[item[key]] = item;
    }
    return acc;
  }, {});
};

// Debounce function for search inputs
export const debounce = (func, delay = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
};

// Sort array of objects by a property
export const sortByProperty = (array, property, direction = 'asc') => {
  if (!array || !Array.isArray(array)) return [];
  
  const sortedArray = [...array];
  
  return sortedArray.sort((a, b) => {
    let valueA = a[property];
    let valueB = b[property];
    
    // Handle dates
    if (property.toLowerCase().includes('date')) {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }
    
    // Handle strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle numbers
    return direction === 'asc' ? valueA - valueB : valueB - valueA;
  });
};

// Get contrast text color based on background
export const getContrastTextColor = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string') return 'text-gray-900';
  
  // Convert hex to RGB
  let r, g, b;
  
  if (hexColor.startsWith('#')) {
    const hex = hexColor.slice(1);
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else {
    return 'text-gray-900';
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return text color based on luminance
  return luminance > 0.5 ? 'text-gray-900' : 'text-white';
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  truncateText,
  getInitials,
  getRelativeTime,
  isDatePast,
  isDateToday,
  formatNumber,
  arrayToObject,
  debounce,
  sortByProperty,
  getContrastTextColor,
};