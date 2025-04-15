import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import TaskItem from './TaskItem';
import Loader from '../Common/Loader';
import Alert from '../Common/Alert';

const TaskList = () => {
  const { 
    tasks, 
    loading, 
    error, 
    getTasks, 
    filters, 
    pagination, 
    clearError 
  } = useTask();
  const { primaryColor } = useTheme();
  const [localFilters, setLocalFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  // Load tasks on component mount
  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters({
      status: filters.status || '',
      priority: filters.priority || '',
      search: filters.search || '',
    });
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    getTasks(localFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setLocalFilters({
      status: '',
      priority: '',
      search: '',
    });
    getTasks({ status: '', priority: '', search: '', page: 1 });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      getTasks({ ...filters, page: newPage });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Tasks</h1>
        <Link 
          to="/tasks/new" 
          className="flex items-center px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: primaryColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Task
        </Link>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={clearError} 
        />
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={localFilters.status}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm dark:text-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={localFilters.priority}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm dark:text-white"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search by title or description"
              value={localFilters.search}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm dark:text-white"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: primaryColor }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      {loading ? (
        <Loader message="Loading tasks..." />
      ) : tasks.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-gray-900 dark:text-white font-medium">No tasks found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Create a new task or adjust your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && tasks.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((pagination.page - 1) * filters.limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * filters.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded-md text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pagination.page === i + 1
                    ? 'text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                style={pagination.page === i + 1 ? { backgroundColor: primaryColor } : {}}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 rounded-md text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;