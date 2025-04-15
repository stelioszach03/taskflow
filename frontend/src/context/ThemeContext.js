import React, { createContext, useState, useContext, useEffect } from 'react';

// Initial state
const initialState = {
  darkMode: false,
  primaryColor: '#6366f1', // Indigo
  sidebarCollapsed: false
};

// Create context
const ThemeContext = createContext(initialState);

// Provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load theme settings from localStorage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      const { darkMode, primaryColor, sidebarCollapsed } = JSON.parse(savedTheme);
      setDarkMode(darkMode);
      setPrimaryColor(primaryColor);
      setSidebarCollapsed(sidebarCollapsed);
    }
    
    // Apply dark mode class to body if needed
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save theme settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify({
      darkMode,
      primaryColor,
      sidebarCollapsed
    }));
    
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, primaryColor, sidebarCollapsed]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Change primary color
  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        primaryColor,
        sidebarCollapsed,
        toggleDarkMode,
        changePrimaryColor,
        toggleSidebar
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => useContext(ThemeContext);