import api, { isCancelError, createCancelableRequest } from './api';
import toast from 'react-hot-toast';

// Helper function to handle task errors
const handleTaskError = (error, defaultMessage) => {
  // Don't show toast for cancelled requests
  if (isCancelError(error)) {
    throw error;
  }

  // Check for specific error messages from the server
  const errorMessage = error.response?.data?.message || defaultMessage;
  
  // Only show custom toast for specific cases
  if (error.response?.status === 404) {
    toast.error('Task not found');
  } else if (error.response?.status === 403) {
    toast.error('You don\'t have permission to perform this action');
  } else if (!error.response || (error.response.status < 400 || error.response.status >= 500)) {
    // Let the interceptor handle other errors
  } else {
    toast.error(errorMessage);
  }
  
  throw error;
};

// Create task
const createTask = async (taskData) => {
  try {
    const loadingToast = toast.loading('Creating task...');
    const response = await api.post('/tasks', taskData);
    toast.dismiss(loadingToast);
    toast.success('Task created successfully!');
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to create task');
  }
};

// Get all tasks with optional filters and cancellation support
const getTasks = async (filters = {}, cancelToken) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const config = cancelToken ? { cancelToken } : {};
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    if (!isCancelError(error)) {
      return handleTaskError(error, 'Failed to load tasks');
    }
    throw error;
  }
};

// Get task by ID with cancellation support
const getTaskById = async (taskId, cancelToken) => {
  try {
    const config = cancelToken ? { cancelToken } : {};
    const response = await api.get(`/tasks/${taskId}`, config);
    return response.data;
  } catch (error) {
    if (!isCancelError(error)) {
      return handleTaskError(error, 'Failed to load task details');
    }
    throw error;
  }
};

// Update task
const updateTask = async (taskId, taskData) => {
  try {
    const loadingToast = toast.loading('Updating task...');
    const response = await api.put(`/tasks/${taskId}`, taskData);
    toast.dismiss(loadingToast);
    toast.success('Task updated successfully!');
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to update task');
  }
};

// Delete task
const deleteTask = async (taskId) => {
  try {
    const loadingToast = toast.loading('Deleting task...');
    const response = await api.delete(`/tasks/${taskId}`);
    toast.dismiss(loadingToast);
    toast.success('Task deleted successfully!');
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to delete task');
  }
};

// Batch delete tasks
const deleteTasks = async (taskIds) => {
  try {
    const loadingToast = toast.loading(`Deleting ${taskIds.length} tasks...`);
    const response = await api.post('/tasks/batch-delete', { taskIds });
    toast.dismiss(loadingToast);
    toast.success(`${taskIds.length} tasks deleted successfully!`);
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to delete tasks');
  }
};

// Assign task to user
const assignTask = async (taskId, userId) => {
  try {
    const loadingToast = toast.loading('Assigning task...');
    const response = await api.post(`/tasks/${taskId}/assign`, { userId });
    toast.dismiss(loadingToast);
    toast.success('Task assigned successfully!');
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to assign task');
  }
};

// Unassign task from user
const unassignTask = async (taskId, userId) => {
  try {
    const loadingToast = toast.loading('Unassigning task...');
    const response = await api.post(`/tasks/${taskId}/unassign`, { userId });
    toast.dismiss(loadingToast);
    toast.success('Task unassigned successfully!');
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to unassign task');
  }
};

// Update task status
const updateTaskStatus = async (taskId, status) => {
  try {
    const statusMessages = {
      'todo': 'moved to To Do',
      'in-progress': 'moved to In Progress',
      'completed': 'marked as completed',
      'cancelled': 'cancelled'
    };
    
    const loadingToast = toast.loading('Updating task status...');
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    toast.dismiss(loadingToast);
    toast.success(`Task ${statusMessages[status] || 'status updated'}!`);
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to update task status');
  }
};

// Search users with cancellation support
const searchUsers = async (searchTerm, cancelToken) => {
  try {
    const config = cancelToken ? { cancelToken } : {};
    const response = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`, config);
    return response.data;
  } catch (error) {
    if (!isCancelError(error)) {
      return handleTaskError(error, 'Failed to search users');
    }
    throw error;
  }
};

// Get task statistics
const getTaskStats = async (filters = {}, cancelToken) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `/tasks/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const config = cancelToken ? { cancelToken } : {};
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    if (!isCancelError(error)) {
      return handleTaskError(error, 'Failed to load task statistics');
    }
    throw error;
  }
};

// Bulk update tasks
const bulkUpdateTasks = async (taskIds, updates) => {
  try {
    const loadingToast = toast.loading(`Updating ${taskIds.length} tasks...`);
    const response = await api.post('/tasks/bulk-update', { taskIds, updates });
    toast.dismiss(loadingToast);
    toast.success(`${taskIds.length} tasks updated successfully!`);
    return response.data;
  } catch (error) {
    return handleTaskError(error, 'Failed to update tasks');
  }
};

// Export tasks
const exportTasks = async (filters = {}, format = 'csv') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const loadingToast = toast.loading('Exporting tasks...');
    const response = await api.get(`/tasks/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    toast.dismiss(loadingToast);
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks-export-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Tasks exported successfully!');
    return true;
  } catch (error) {
    return handleTaskError(error, 'Failed to export tasks');
  }
};

const taskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  deleteTasks,
  assignTask,
  unassignTask,
  updateTaskStatus,
  searchUsers,
  getTaskStats,
  bulkUpdateTasks,
  exportTasks,
  createCancelableRequest,
};

export default taskService;