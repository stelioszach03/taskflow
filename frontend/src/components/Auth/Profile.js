import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';

const Profile = () => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const { primaryColor } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: '',
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [avatarPreview, setAvatarPreview] = useState('');

  // Set form data when user info is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Handle error from context
  useEffect(() => {
    if (error) {
      setAlert({ show: true, type: 'error', message: error });
      clearError();
    }
  }, [error, clearError]);

  const { name, email, password, confirmPassword, avatar } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onAvatarChange = (e) => {
    if (e.target.files[0]) {
      // Convert to base64 for this demo
      // In a production app, you'd use proper file upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Passwords do not match' 
      });
      return;
    }
    
    if (password && password.length < 6) {
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Password must be at least 6 characters' 
      });
      return;
    }
    
    // Only send password if it was changed
    const userData = {
      name,
      email,
      avatar,
      ...(password ? { password } : {}),
    };
    
    try {
      await updateProfile(userData);
      setAlert({
        show: true,
        type: 'success',
        message: 'Profile updated successfully',
      });
      
      // Reset password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      // Error is handled by useEffect
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profile Settings</h2>
        
        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ ...alert, show: false })} 
          />
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 mx-auto border-2 border-gray-200 dark:border-gray-700">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-2 right-0 p-1 rounded-full bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 cursor-pointer"
                style={{ color: primaryColor }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={onAvatarChange}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader size="small" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;