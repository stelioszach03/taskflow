import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';

const TaskItem = ({ task }) => {
  const { user } = useAuth();
  const { updateTaskStatus } = useTask();
  
  // Format due date
  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    
    const dueDate = new Date(date);
    return dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Priority badge colors
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  // Status badge colors
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
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

  return (
    <li>
      <Link to={`/tasks/${task._id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                {task.title}
                {(isCreator || isAssigned) && (
                  <div className="inline-flex ml-3">
                    <select
                      value={task.status}
                      onChange={handleStatusChange}
                      onClick={(e) => e.stopPropagation()}
                      className="block text-sm rounded-md border-gray-300 py-1 pl-2 pr-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {truncateText(task.description)}
              </p>
            </div>
            <div className="sm:ml-2 flex flex-shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
              <span
                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColors[task.status]}`}
              >
                {task.status === 'in-progress'
                  ? 'In Progress'
                  : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="mt-4 sm:flex sm:justify-between">
            <div className="sm:flex">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-1">{formatDueDate(task.dueDate)}</span>
              </div>
              
              {task.labels && task.labels.length > 0 && (
                <div className="mt-2 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="ml-1">
                    {task.labels.slice(0, 2).join(', ')}
                    {task.labels.length > 2 && ` +${task.labels.length - 2} more`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center">
              <div className="flex -space-x-2 overflow-hidden">
                {task.assignedTo && task.assignedTo.slice(0, 3).map((assignee) => (
                  <div 
                    key={assignee._id} 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                    title={assignee.name}
                  >
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                
                {task.assignedTo && task.assignedTo.length > 3 && (
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                    +{task.assignedTo.length - 3}
                  </span>
                )}
                
                {(!task.assignedTo || task.assignedTo.length === 0) && (
                  <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                    No assignees
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

TaskItem.propTypes = {
  task: PropTypes.object.isRequired,
};

export default TaskItem;