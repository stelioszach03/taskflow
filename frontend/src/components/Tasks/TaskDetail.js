import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../Common/Loader';
import Alert from '../Common/Alert';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getTaskById, 
    task, 
    loading, 
    error, 
    clearError,
    deleteTask,
    updateTaskStatus,
    assignTask,
    unassignTask,
    searchUsers,
    searchResults
  } = useTask();
  const { primaryColor } = useTheme();
  
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Load task data on component mount
  useEffect(() => {
    getTaskById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Handle error from context
  useEffect(() => {
    if (error) {
      setAlert({ show: true, type: 'error', message: error });
      clearError();
    }
  }, [error, clearError]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    try {
      await updateTaskStatus(id, newStatus);
      setAlert({
        show: true,
        type: 'success',
        message: 'Task status updated successfully',
      });
    } catch (err) {
      // Error is handled by useEffect
    }
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      // Error is handled by useEffect
    }
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
  
  // Handle assign user
  const handleAssignUser = async (selectedUser) => {
    // Check if user is already assigned
    const isAlreadyAssigned = task.assignedTo.some(
      (assignee) => assignee._id === selectedUser._id
    );
    
    if (!isAlreadyAssigned) {
      try {
        await assignTask(id, selectedUser._id);
        setAlert({
          show: true,
          type: 'success',
          message: `${selectedUser.name} assigned to task`,
        });
      } catch (err) {
        // Error is handled by useEffect
      }
    }
    
    // Clear search
    setSearchTerm('');
  };
  
  // Handle unassign user
  const handleUnassignUser = async (userId) => {
    try {
      await unassignTask(id, userId);
      setAlert({
        show: true,
        type: 'success',
        message: 'User unassigned from task',
      });
    } catch (err) {
      // Error is handled by useEffect
    }
  };
  
  // Check if user is creator
  const isCreator = task?.creator?._id === user?._id;
  
  // Check if user is assigned
  const isAssigned = task?.assignedTo?.some(
    (assignee) => assignee._id === user?._id
  );
  
  // Check if user can edit/delete (creator or admin)
  const canEditOrDelete = isCreator || user?.role === 'admin';
  
  // Check if user can assign (creator, assignee, or admin)
  const canAssign = isCreator || isAssigned || user?.role === 'admin';
  
  // Priority badge styles
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  // Status badge styles
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {loading ? (
        <Loader message="Loading task details..." />
      ) : task ? (
        <>
          {alert.show && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert({ ...alert, show: false })} 
            />
          )}
          
          {/* Task Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">{task.title}</h1>
              
              <div className="flex items-center space-x-2">
                {canEditOrDelete && (
                  <>
                    <Link
                      to={`/tasks/edit/${id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
              
              {canAssign ? (
                <select
                  value={task.status}
                  onChange={handleStatusChange}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium border-none focus:outline-none focus:ring-1 cursor-pointer ${statusColors[task.status]}`}
                >
                  <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pending</option>
                  <option value="in-progress" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">In Progress</option>
                  <option value="completed" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Completed</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${statusColors[task.status]}`}
                >
                  {task.status === 'in-progress'
                    ? 'In Progress'
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              )}
              
              {task.dueDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line mb-6">
              {task.description}
            </p>
            
            {task.labels && task.labels.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Created by:</span>
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-1 overflow-hidden">
                    {task.creator?.avatar ? (
                      <img
                        src={task.creator.avatar}
                        alt={task.creator.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {task.creator?.name.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-300">
                    {task.creator?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Created: {formatDate(task.createdAt)}
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <span> | Updated: {formatDate(task.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Assignees Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Assignees</h2>
            </div>
            
            {canAssign && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search users to assign"
                    className="shadow-sm block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700 dark:text-white"
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
              </div>
            )}
            
            {task.assignedTo && task.assignedTo.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {task.assignedTo.map((assignee) => (
                  <li key={assignee._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            {assignee.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{assignee.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{assignee.email}</div>
                      </div>
                    </div>
                    
                    {canAssign && (
                      <button
                        onClick={() => handleUnassignUser(assignee._id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No assignees yet</p>
              </div>
            )}
          </div>
          
          {/* Back to tasks button */}
          <div className="flex">
            <Link
              to="/tasks"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Tasks
            </Link>
          </div>
          
          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                </div>
                
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                          Delete Task
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this task? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleDeleteTask}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">Task not found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="mt-6">
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Go to Tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;