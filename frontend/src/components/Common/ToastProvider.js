import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const ToastProvider = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        
        // Custom styles for different toast types
        success: {
          style: {
            background: theme === 'dark' ? '#065f46' : '#d1fae5',
            color: theme === 'dark' ? '#d1fae5' : '#065f46',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#10b981' : '#059669',
            secondary: theme === 'dark' ? '#065f46' : '#d1fae5',
          },
        },
        
        error: {
          style: {
            background: theme === 'dark' ? '#991b1b' : '#fee2e2',
            color: theme === 'dark' ? '#fee2e2' : '#991b1b',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#ef4444' : '#dc2626',
            secondary: theme === 'dark' ? '#991b1b' : '#fee2e2',
          },
        },
        
        loading: {
          style: {
            background: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
            color: theme === 'dark' ? '#dbeafe' : '#1e3a8a',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
            secondary: theme === 'dark' ? '#1e3a8a' : '#dbeafe',
          },
        },
      }}
    />
  );
};

export default ToastProvider;