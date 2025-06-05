import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTask } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import TaskItem from './TaskItem';
import Loader from '../Common/Loader';
import Alert from '../Common/Alert';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiLoader,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiGrid,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';

// Skeleton component for loading states
const TaskSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-4 border border-gray-200/50 dark:border-gray-700/50"
  >
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex -space-x-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

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
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (localFilters.status) {
      filtered = filtered.filter(task => task.status === localFilters.status);
    }

    // Apply priority filter
    if (localFilters.priority) {
      filtered = filtered.filter(task => task.priority === localFilters.priority);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'dueDate':
          compareValue = new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [tasks, searchTerm, localFilters, sortBy, sortOrder]);

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
    setSearchTerm('');
    getTasks({ status: '', priority: '', search: '', page: 1 });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      getTasks({ ...filters, page: newPage });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const filterVariants = {
    closed: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    },
    open: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    }
  };

  // Priority icon component
  const PriorityIcon = ({ priority }) => {
    switch (priority) {
      case 'high':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <FiTrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <FiTrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <FiActivity className="w-4 h-4 text-gray-400" />;
    }
  };

  // Status icon component
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <FiCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your tasks efficiently</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/tasks/new" 
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: primaryColor,
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}ee 100%)`
            }}
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Create Task
          </Link>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Alert 
            type="error" 
            message={error} 
            onClose={clearError} 
          />
        </motion.div>
      )}

      {/* Search and View Toggle */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-2xl p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
              style={{ '--tw-ring-color': primaryColor }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 text-sm"
                style={{ '--tw-ring-color': primaryColor }}
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Order Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {sortOrder === 'asc' ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </motion.button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-r-lg transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <FiFilter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {(localFilters.status || localFilters.priority) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              variants={filterVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={localFilters.status}
                      onChange={handleFilterChange}
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryColor }}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={localFilters.priority}
                      onChange={handleFilterChange}
                      className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ '--tw-ring-color': primaryColor }}
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      style={{ 
                        backgroundColor: primaryColor,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                      }}
                    >
                      Apply
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={resetFilters}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Reset
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task List/Grid */}
      {loading ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
        >
          {[...Array(6)].map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </motion.div>
      ) : filteredAndSortedTasks.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedTasks.map((task, index) => (
              <motion.div
                key={task._id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                transition={{ delay: index * 0.05 }}
              >
                <TaskItem task={task} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="max-w-md mx-auto">
            {/* Empty State Illustration */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-48 h-48 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full animate-pulse"></div>
              <svg 
                className="w-full h-full relative z-10" 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M100 40C100 40 60 40 60 80V120C60 160 100 160 100 160C100 160 140 160 140 120V80C140 40 100 40 100 40Z" 
                  fill="url(#gradient1)" 
                  fillOpacity="0.2"
                />
                <path 
                  d="M80 70H120M80 90H120M80 110H100" 
                  stroke="url(#gradient2)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                <path 
                  d="M100 130L110 140L130 120" 
                  stroke="#10B981" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="60" y1="40" x2="140" y2="160">
                    <stop stopColor={primaryColor} />
                    <stop offset="1" stopColor={primaryColor} stopOpacity="0.5" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="80" y1="70" x2="120" y2="110">
                    <stop stopColor={primaryColor} />
                    <stop offset="1" stopColor={primaryColor} stopOpacity="0.7" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
            >
              No tasks found
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 mb-6"
            >
              {searchTerm || localFilters.status || localFilters.priority 
                ? "Try adjusting your filters or search terms"
                : "Create your first task to get started"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {searchTerm || localFilters.status || localFilters.priority ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/tasks/new"
                  className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ 
                    backgroundColor: primaryColor,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}ee 100%)`
                  }}
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Create Your First Task
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && filteredAndSortedTasks.length > 0 && pagination.pages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-8"
        >
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((pagination.page - 1) * filters.limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * filters.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600 transition-all duration-200"
            >
              Previous
            </motion.button>
            
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pagination.page === i + 1
                      ? 'text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                  style={pagination.page === i + 1 ? { 
                    backgroundColor: primaryColor,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                  } : {}}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600 transition-all duration-200"
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TaskList;