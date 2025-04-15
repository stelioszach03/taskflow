import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../Common/Loader';
import Alert from '../Common/Alert';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    createTask, 
    updateTask, 
    getTaskById, 
    task, 
    loading, 
    error, 
    clearTask, 
    clearError,
    searchUsers,
    searchResults
  } = useTask();
  const { primaryColor } = useTheme();
  
  // Local state for form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: [],
    labels: [],
  });
  
  // Additional state
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [mode, setMode] = useState('create');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [labelInput, setLabelInput] = useState('');
  
  // Fetch task data if in edit mode
  useEffect(() => {
    if (id) {
      setMode('edit');
      getTaskById(id);
    } else {
      clearTask();
      setMode('create');
    }
    
    return () => clearTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Set form data when task is loaded for editing
  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo || [],
        labels: task.labels || [],
      });
    }
  }, [task, mode]);
  
  // Handle error from context
  useEffect(() => {
    if (error) {
      setAlert({ show: true, type: 'error', message: error });
      clearError();
    }
  }, [error, clearError]);
  
  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Date change handler - converts to ISO format
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Search users for assignment
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      try {
        await searchUsers(value);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }
  };
  
  // Add user to assignees
  const handleAssignUser = (selectedUser) => {
    // Check if user is already assigned
    const isAlreadyAssigned = formData.assignedTo.some(
      (user) => user._id === selectedUser._id
    );
    
    if (!isAlreadyAssigned) {
      setFormData({
        ...formData,
        assignedTo: [...formData.assignedTo, selectedUser],
      });
    }
    
    // Clear search
    setSearchTerm('');
  };
  
  // Remove user from assignees
  const handleRemoveUser = (userId) => {
    setFormData({
      ...formData,
      assignedTo: formData.assignedTo.filter((user) => user._id !== userId),
    });
  };
  
  // Add label
  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, labelInput.trim()],
      });
      setLabelInput('');
    }
  };
  
  // Remove label
  const handleRemoveLabel = (label) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((l) => l !== label),
    });
  };
  
  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get only the IDs for assignedTo
    const assignedToIds = formData.assignedTo.map(user => user._id || user);
    
    try {
      if (mode === 'create') {
        await createTask({
          ...formData,
          assignedTo: assignedToIds,
        });
        navigate('/tasks');
      } else {
        await updateTask(id, {
          ...formData,
          assignedTo: assignedToIds,
        });
        navigate(`/tasks/${id}`);
      }
    } catch (err) {
      // Error is handled by the useEffect
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Task' : 'Edit Task'}
        </h2>
        
        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ ...alert, show: false })} 
          />
        )}
        
        {loading && mode === 'edit' ? (
          <Loader message="Loading task data..." />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  placeholder="Task description"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleDateChange}
                    className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign To
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search users by name or email"
                    className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 mb-2 dark:bg-gray-700 dark:text-white"
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-2">
                      <Loader size="small" />
                    </div>
                  )}
                  
                  {searchTerm.length >= 2 && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                      <ul className="py-1">
                        {searchResults.map((user) => (
                          <li 
                            key={user._id}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                            onClick={() => handleAssignUser(user)}
                          >
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 overflow-hidden">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="text-gray-800 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Current assignees */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.assignedTo.map((assignee) => (
                    <div 
                      key={assignee._id} 
                      className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-1 overflow-hidden">
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {assignee.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      {assignee.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(assignee._id)}
                        className="ml-1 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {formData.assignedTo.length === 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No users assigned yet
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Labels
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Add a label"
                    className="shadow-sm flex-grow sm:text-sm border-gray-300 dark:border-gray-600 rounded-l-md p-2 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.labels.map((label) => (
                    <div 
                      key={label} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        className="ml-1 flex-shrink-0 inline-flex text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {formData.labels.length === 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No labels added yet
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? <Loader size="small" /> : mode === 'create' ? 'Create Task' : 'Update Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TaskForm;