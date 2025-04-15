import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Common/Loader';
import Alert from '../components/Common/Alert';
import api from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const { 
    darkMode, 
    toggleDarkMode, 
    primaryColor, 
    changePrimaryColor 
  } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Color options
  const colorOptions = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
  ];
  
  // Only allow admin access
  useEffect(() => {
    if (user?.role !== 'admin') {
      setAlert({
        show: true,
        type: 'error',
        message: 'You do not have permission to access this page'
      });
      return;
    }
    
    // Fetch users if admin
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Failed to load users'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);
  
  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      setAlert({
        show: true,
        type: 'success',
        message: 'User role updated successfully'
      });
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to update user role'
      });
    }
  };
  
  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${userId}`);
        
        // Update local state
        setUsers(users.filter(user => user._id !== userId));
        
        setAlert({
          show: true,
          type: 'success',
          message: 'User deleted successfully'
        });
      } catch (err) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Failed to delete user'
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {alert.show && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ ...alert, show: false })} 
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* App Settings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">App Settings</h2>
          
          {/* Theme Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</h3>
            <div className="flex items-center mb-4">
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={darkMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            {/* Color Settings */}
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => changePrimaryColor(color.value)}
                  className={`h-8 w-full rounded-md transition-all ${
                    primaryColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Management</h2>
          
          {loading ? (
            <Loader message="Loading users..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((userItem) => (
                    <tr key={userItem._id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {userItem.avatar ? (
                              <img
                                src={userItem.avatar}
                                alt={userItem.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {userItem.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{userItem.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{userItem.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                          className="text-sm rounded-md border-gray-300 dark:border-gray-600 py-1 pl-2 pr-8 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent"
                          disabled={userItem._id === user?._id} // Cannot change own role
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          disabled={userItem._id === user?._id} // Cannot delete self
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;