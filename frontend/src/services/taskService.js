import api from './api';

// Create task
const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Get all tasks with optional filters
const getTasks = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  const url = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Get task by ID
const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

// Update task
const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

// Delete task
const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Assign task to user
const assignTask = async (taskId, userId) => {
  const response = await api.post(`/tasks/${taskId}/assign`, { userId });
  return response.data;
};

// Unassign task from user
const unassignTask = async (taskId, userId) => {
  const response = await api.post(`/tasks/${taskId}/unassign`, { userId });
  return response.data;
};

// Update task status
const updateTaskStatus = async (taskId, status) => {
  const response = await api.put(`/tasks/${taskId}/status`, { status });
  return response.data;
};

// Search users
const searchUsers = async (searchTerm) => {
  const response = await api.get(`/users/search?q=${searchTerm}`);
  return response.data;
};

const taskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  updateTaskStatus,
  searchUsers
};

export default taskService;