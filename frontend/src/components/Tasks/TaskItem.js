import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUser,
  FiTag
} from 'react-icons/fi';

const TaskItem = ({ task, viewMode = 'list' }) => {
  const { user } = useAuth();
  const { updateTaskStatus } = useTask();
  const { primaryColor } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Format due date with dynamic styling
  const formatDueDate = (date) => {
    if (!date) return { text: 'No due date', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' };
    
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    if (diffDays < 0) {
      return { 
        text: `Overdue: ${formattedDate}`, 
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: FiAlertCircle
      };
    } else if (diffDays === 0) {
      return { 
        text: 'Due Today', 
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        icon: FiClock
      };
    } else if (diffDays <= 3) {
      return { 
        text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, 
        color: 'text-yellow-600 dark:text-yellow-400', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: FiClock
      };
    } else {
      return { 
        text: formattedDate, 
        color: 'text-gray-600 dark:text-gray-400', 
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        icon: FiCalendar
      };
    }
  };
  
  // Priority configurations
  const priorityConfig = {
    low: {
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: FiTrendingDown,
      label: 'Low Priority'
    },
    medium: {
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: FiTrendingUp,
      label: 'Medium Priority'
    },
    high: {
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: FiAlertCircle,
      label: 'High Priority'
    }
  };
  
  // Status configurations
  const statusConfig = {
    pending: {
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      icon: FiCircle,
      label: 'Pending'
    },
    'in-progress': {
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: FiLoader,
      label: 'In Progress',
      animate: true
    },
    completed: {
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: FiCheckCircle,
      label: 'Completed'
    }
  };
  
  // Check if user is assigned to this task
  const isAssigned = task.assignedTo?.some(
    (assignee) => assignee._id === user?._id
  );
  
  // Check if user is creator of this task
  const isCreator = task.creator?._id === user?._id;
  
  // Handle status change
  const handleStatusChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = e.target.value;
    if (newStatus !== task.status) {
      try {
        await updateTaskStatus(task._id, newStatus);
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };
  
  // Truncate description
  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const dueDateInfo = formatDueDate(task.dueDate);
  const priority = priorityConfig[task.priority] || priorityConfig.low;
  const status = statusConfig[task.status] || statusConfig.pending;

  // Grid view card
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative"
      >
        <Link to={`/tasks/${task._id}`} className="block">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 h-full">
            {/* Card Header with Status */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  {(isCreator || isAssigned) && (
                    <select
                      value={task.status}
                      onChange={handleStatusChange}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg py-1 px-2 pr-8 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                      style={{ '--tw-ring-color': primaryColor }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiMoreVertical className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                {truncateText(task.description, 120)}
              </p>

              {/* Priority and Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.color}`}>
                  <priority.icon className="w-3 h-3" />
                  {priority.label}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                  <status.icon className={`w-3 h-3 ${status.animate ? 'animate-spin' : ''}`} />
                  {status.label}
                </span>
              </div>

              {/* Due Date */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}>
                {dueDateInfo.icon && <dueDateInfo.icon className="w-3 h-3" />}
                <span>{dueDateInfo.text}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <FiTag className="w-3 h-3" />
                    <span>{task.labels.slice(0, 2).join(', ')}</span>
                    {task.labels.length > 2 && <span>+{task.labels.length - 2}</span>}
                  </div>
                )}

                {/* Assignees */}
                <div className="flex -space-x-2">
                  {task.assignedTo && task.assignedTo.slice(0, 3).map((assignee) => (
                    <motion.div
                      key={assignee._id}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className="relative"
                    >
                      <div 
                        className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                        title={assignee.name}
                      >
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {task.assignedTo && task.assignedTo.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                      +{task.assignedTo.length - 3}
                    </div>
                  )}
                  {(!task.assignedTo || task.assignedTo.length === 0) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // List view (default)
  return (
    <motion.li
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link to={`/tasks/${task._id}`} className="block">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-3">
                      {task.title}
                      {(isCreator || isAssigned) && (
                        <select
                          value={task.status}
                          onChange={handleStatusChange}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg py-1 px-2 pr-8 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                          style={{ '--tw-ring-color': primaryColor }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {truncateText(task.description)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Badges */}
              <div className="sm:ml-4 flex flex-wrap gap-2">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${priority.bgColor} ${priority.color} ${priority.borderColor}`}
                >
                  <priority.icon className="w-4 h-4" />
                  {priority.label}
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                >
                  <status.icon className={`w-4 h-4 ${status.animate ? 'animate-spin' : ''}`} />
                  {status.label}
                </motion.span>
              </div>
            </div>
            
            {/* Footer Info */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Due Date */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${dueDateInfo.bgColor} ${dueDateInfo.color}`}
                >
                  {dueDateInfo.icon && <dueDateInfo.icon className="w-4 h-4" />}
                  <span className="font-medium">{dueDateInfo.text}</span>
                </motion.div>
                
                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <FiTag className="w-4 h-4" />
                    <span>
                      {task.labels.slice(0, 2).join(', ')}
                      {task.labels.length > 2 && ` +${task.labels.length - 2} more`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Assignees */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {task.assignedTo && task.assignedTo.slice(0, 3).map((assignee) => (
                    <motion.div
                      key={assignee._id}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      className="relative"
                    >
                      <div 
                        className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden shadow-sm"
                        title={assignee.name}
                      >
                        {assignee.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                            {assignee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {task.assignedTo && task.assignedTo.length > 3 && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800 shadow-sm"
                    >
                      +{task.assignedTo.length - 3}
                    </motion.div>
                  )}
                  
                  {(!task.assignedTo || task.assignedTo.length === 0) && (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <FiUser className="w-4 h-4" />
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.li>
  );
};

TaskItem.propTypes = {
  task: PropTypes.object.isRequired,
  viewMode: PropTypes.oneOf(['list', 'grid'])
};

export default TaskItem;