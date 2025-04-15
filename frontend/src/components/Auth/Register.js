import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Alert from '../Common/Alert';
import Loader from '../Common/Loader';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const { name, email, password, confirmPassword } = formData;
  const { register, isAuthenticated, error, loading, clearError } = useAuth();
  const { primaryColor } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (error) {
      setAlert({ show: true, type: 'error', message: error });
      clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Passwords do not match' 
      });
      return;
    }
    
    if (password.length < 6) {
      setAlert({ 
        show: true, 
        type: 'error', 
        message: 'Password must be at least 6 characters' 
      });
      return;
    }
    
    try {
      await register({ name, email, password });
    } catch (err) {
      // Error is handled in the useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link 
              to="/login" 
              className="font-medium hover:text-opacity-80 transition-colors"
              style={{ color: primaryColor }}
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ ...alert, show: false })} 
          />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Full name"
                value={name}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Email address"
                value={email}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={onChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <Loader size="small" /> : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;