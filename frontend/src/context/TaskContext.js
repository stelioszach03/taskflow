import React, { createContext, useReducer, useContext, useCallback } from 'react';
import taskService from '../services/taskService';

// Initial state
const initialState = {
  tasks: [],
  task: null,
  filteredTasks: {
    pending: [],
    'in-progress': [],
    completed: []
  },
  pagination: {
    page: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null,
  searchResults: [],
  filters: {
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10
  }
};

// Create context
const TaskContext = createContext(initialState);

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'GET_TASKS_SUCCESS':
      return {
        ...state,
        tasks: action.payload.tasks,
        pagination: {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total
        },
        loading: false
      };
    case 'GET_TASK_SUCCESS':
      return {
        ...state,
        task: action.payload,
        loading: false
      };
    case 'CREATE_TASK_SUCCESS':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        loading: false
      };
    case 'UPDATE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        ),
        task: action.payload,
        loading: false
      };
    case 'DELETE_TASK_SUCCESS':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        loading: false
      };
    case 'TASK_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_TASK':
      return {
        ...state,
        task: null
      };
    case 'SEARCH_USERS_SUCCESS':
      return {
        ...state,
        searchResults: action.payload,
        loading: false
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    case 'ORGANIZE_TASKS_BY_STATUS':
      const pendingTasks = state.tasks.filter(task => task.status === 'pending');
      const inProgressTasks = state.tasks.filter(task => task.status === 'in-progress');
      const completedTasks = state.tasks.filter(task => task.status === 'completed');
      
      return {
        ...state,
        filteredTasks: {
          pending: pendingTasks,
          'in-progress': inProgressTasks,
          completed: completedTasks
        }
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
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Get all tasks
  const getTasks = useCallback(async (filterParams = {}) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      // Merge current filters with new filters
      const filters = { ...state.filters, ...filterParams };
      dispatch({ type: 'SET_FILTERS', payload: filterParams });
      
      const data = await taskService.getTasks(filters);
      
      dispatch({
        type: 'GET_TASKS_SUCCESS',
        payload: data
      });
      
      dispatch({ type: 'ORGANIZE_TASKS_BY_STATUS' });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error fetching tasks'
      });
    }
  }, [state.filters]);

  // Get task by ID
  const getTaskById = async (taskId) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.getTaskById(taskId);
      
      dispatch({
        type: 'GET_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error fetching task'
      });
    }
  };

  // Create task
  const createTask = async (taskData) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.createTask(taskData);
      
      dispatch({
        type: 'CREATE_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error creating task'
      });
      throw error;
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.updateTask(taskId, taskData);
      
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error updating task'
      });
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      await taskService.deleteTask(taskId);
      
      dispatch({
        type: 'DELETE_TASK_SUCCESS',
        payload: taskId
      });
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error deleting task'
      });
      throw error;
    }
  };

  // Assign task to user
  const assignTask = async (taskId, userId) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.assignTask(taskId, userId);
      
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error assigning task'
      });
      throw error;
    }
  };

  // Unassign task from user
  const unassignTask = async (taskId, userId) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.unassignTask(taskId, userId);
      
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error unassigning task'
      });
      throw error;
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.updateTaskStatus(taskId, status);
      
      dispatch({
        type: 'UPDATE_TASK_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error updating task status'
      });
      throw error;
    }
  };

  // Search users
  const searchUsers = async (searchTerm) => {
    dispatch({ type: 'SET_LOADING' });
    
    try {
      const data = await taskService.searchUsers(searchTerm);
      
      dispatch({
        type: 'SEARCH_USERS_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'TASK_ERROR',
        payload: error.response?.data?.message || 'Error searching users'
      });
    }
  };

  // Clear current task
  const clearTask = () => {
    dispatch({ type: 'CLEAR_TASK' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <TaskContext.Provider
      value={{
        ...state,
        getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        assignTask,
        unassignTask,
        updateTaskStatus,
        searchUsers,
        clearTask,
        clearError
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook
export const useTask = () => useContext(TaskContext);