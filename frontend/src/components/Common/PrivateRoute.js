import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';
import Sidebar from '../Navigation/Sidebar';
import Navbar from '../Navigation/Navbar';

const PrivateRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // If still loading, show loader
  if (loading) {
    return <Loader fullScreen message="Loading..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin required but user is not admin, redirect to dashboard
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the main application layout for authenticated users
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-64 transition-all duration-300" id="main-content">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

PrivateRoute.propTypes = {
  requireAdmin: PropTypes.bool
};

export default PrivateRoute;