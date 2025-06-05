import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';

// Page Components
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import KanbanBoard from './pages/KanbanBoard';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';

// Common Components
import PrivateRoute from './components/Common/PrivateRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ToastProvider from './components/Common/ToastProvider';
import NetworkStatus from './components/Common/NetworkStatus';

// Styles
import './App.css';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-20px',
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: '20px',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

// Layout wrapper component for animated routes
const AnimatedLayout = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

// Animated Routes component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={
          <AnimatedLayout>
            <Login />
          </AnimatedLayout>
        } />
        <Route path="/register" element={
          <AnimatedLayout>
            <Register />
          </AnimatedLayout>
        } />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <AnimatedLayout>
              <Dashboard />
            </AnimatedLayout>
          } />
          <Route path="/tasks/*" element={
            <AnimatedLayout>
              <TasksPage />
            </AnimatedLayout>
          } />
          <Route path="/kanban" element={
            <AnimatedLayout>
              <KanbanBoard />
            </AnimatedLayout>
          } />
          <Route path="/team" element={
            <AnimatedLayout>
              <TeamPage />
            </AnimatedLayout>
          } />
          <Route path="/profile" element={
            <AnimatedLayout>
              <Profile />
            </AnimatedLayout>
          } />
        </Route>
        
        {/* Admin Routes */}
        <Route element={<PrivateRoute requireAdmin={true} />}>
          <Route path="/settings" element={
            <AnimatedLayout>
              <SettingsPage />
            </AnimatedLayout>
          } />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <TaskProvider>
              <div className="app-container relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Network Status Monitor */}
                <NetworkStatus />
                
                {/* Toast Notifications */}
                <ToastProvider />
                
                {/* Main App Content */}
                <AnimatedRoutes />
              </div>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;