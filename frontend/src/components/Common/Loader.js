import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

const Loader = ({ size = 'medium', fullScreen = false, message = '' }) => {
  const { primaryColor } = useTheme();

  // Define sizes
  const sizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  // Custom primary color SVG
  const spinnerStyle = {
    borderTopColor: primaryColor,
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80">
        <div className={`${sizes[size]} border-4 border-gray-200 border-t-4 rounded-full animate-spin`} style={spinnerStyle}></div>
        {message && <p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-4 rounded-full animate-spin`} style={spinnerStyle}></div>
      {message && <p className="mt-2 text-gray-700 dark:text-gray-300">{message}</p>}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
};

export default Loader;