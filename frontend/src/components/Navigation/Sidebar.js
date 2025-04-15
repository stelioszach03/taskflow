import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { sidebarCollapsed, primaryColor } = useTheme();
  
  // Nav items structure
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      title: 'Kanban Board',
      path: '/kanban',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      title: 'Team',
      path: '/team',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];
  
  // Only show admin settings if user is admin
  if (user?.role === 'admin') {
    navItems.push({
      title: 'Settings',
      path: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    });
  }

  // Default sidebar width classes
  let sidebarClasses = 'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out';
  let logoTextClasses = 'text-lg font-semibold text-gray-900 dark:text-white';
  
  // If sidebar is collapsed, adjust the classes
  if (sidebarCollapsed) {
    sidebarClasses = 'fixed inset-y-0 left-0 z-30 w-16 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out';
    logoTextClasses = 'hidden';
  }
  
  // Effect to adjust main content margin when sidebar collapses/expands
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (sidebarCollapsed) {
        mainContent.classList.remove('ml-64');
        mainContent.classList.add('ml-16');
      } else {
        mainContent.classList.remove('ml-16');
        mainContent.classList.add('ml-64');
      }
    }
  }, [sidebarCollapsed]);

  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              TF
            </div>
            <span className={`ml-2 ${logoTextClasses}`}>TaskFlow</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? `text-white`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                  style={({ isActive }) => 
                    isActive ? { backgroundColor: primaryColor } : {}
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Profile Link (at bottom) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/profile"
            className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {!sidebarCollapsed && <span>Profile</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;