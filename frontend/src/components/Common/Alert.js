import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Alert = ({ type, message, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss alert after duration
  useEffect(() => {
    if (!duration) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible || !message) return null;

  // Alert styles based on type
  const alertStyles = {
    success: 'bg-green-50 text-green-800 border-green-400 dark:bg-green-900/50 dark:text-green-100',
    error: 'bg-red-50 text-red-800 border-red-400 dark:bg-red-900/50 dark:text-red-100',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-100',
    info: 'bg-blue-50 text-blue-800 border-blue-400 dark:bg-blue-900/50 dark:text-blue-100',
  };

  const iconMap = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd"></path>
      </svg>
    ),
  };

  return (
    <div className={`flex items-center p-4 mb-4 text-sm rounded-lg border ${alertStyles[type] || alertStyles.info}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
        {iconMap[type] || iconMap.info}
      </div>
      <div className="flex-1">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
        onClick={handleClose}
        aria-label="Close"
      >
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  type: 'info',
  duration: 5000,
};

export default Alert;