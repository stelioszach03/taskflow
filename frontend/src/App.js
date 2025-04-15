import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Styles
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <TaskProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks/*" element={<TasksPage />} />
                <Route path="/kanban" element={<KanbanBoard />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<PrivateRoute requireAdmin={true} />}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TaskProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;