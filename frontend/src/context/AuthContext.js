import React, { createContext, useReducer, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Create context
const AuthContext = createContext(initialState);

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'PROFILE_UPDATE_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const user = authService.getCurrentUser();
        
        if (user) {
          // Verify token is still valid by getting profile
          const profile = await authService.getUserProfile();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: profile
          });
        } else {
          dispatch({
            type: 'AUTH_FAIL',
            payload: null
          });
        }
      } catch (error) {
        authService.logout();
        dispatch({
          type: 'AUTH_FAIL',
          payload: null
        });
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const user = await authService.register(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: user
      });
      return user;
    } catch (error) {
      dispatch({
        type: 'AUTH_FAIL',
        payload: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const user = await authService.login(email, password);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: user
      });
      return user;
    } catch (error) {
      dispatch({
        type: 'AUTH_FAIL',
        payload: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    dispatch({ type: 'PROFILE_UPDATE_START' });
    
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: updatedUser
      });
      return updatedUser;
    } catch (error) {
      dispatch({
        type: 'AUTH_FAIL',
        payload: error.response?.data?.message || 'Profile update failed'
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);