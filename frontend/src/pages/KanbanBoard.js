import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Common/Loader';
import Alert from '../components/Common/Alert';

const KanbanBoard = () => {
  const { getTasks, filteredTasks, loading, error, clearError, updateTaskStatus } = useTask();
  const { primaryColor } = useTheme();
  const [draggedTask, setDraggedTask] = useState(null);

  // Load tasks on component mount
  useEffect(() => {
    getTasks({ limit: 100 }); // Get more tasks for Kanban view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle drag start
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e, status) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask._id, status);
    }
    
    setDraggedTask(null);
  };

  // Priority badge colors
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Format due date
  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    
    const dueDate = new Date(date);
    return dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Kanban Board</h1>
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

      {loading ? (
        <Loader message="Loading tasks..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'pending')}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                Pending
                <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full px-2 py-1">
                  {filteredTasks.pending.length}
                </span>
              </h2>
            </div>
            <div className="p-4 h-[calc(100vh-220px)] overflow-y-auto">
              {filteredTasks.pending.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.pending.map((task) => (
                    <div
                      key={task._id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 shadow-sm border border-gray-100 dark:border-gray-800 cursor-grab"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <Link to={`/tasks/${task._id}`} className="block">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {truncateText(task.description)}
                        </p>
                        <div className="flex justify-between items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <div className="mt-2 flex -space-x-2 overflow-hidden">
                            {task.assignedTo.slice(0, 3).map((assignee) => (
                              <div 
                                key={assignee._id} 
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                                title={assignee.name}
                              >
                                {assignee.avatar ? (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                    {assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {task.assignedTo.length > 3 && (
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                                +{task.assignedTo.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No pending tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'in-progress')}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                In Progress
                <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full px-2 py-1">
                  {filteredTasks['in-progress'].length}
                </span>
              </h2>
            </div>
            <div className="p-4 h-[calc(100vh-220px)] overflow-y-auto">
              {filteredTasks['in-progress'].length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks['in-progress'].map((task) => (
                    <div
                      key={task._id}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 shadow-sm border border-blue-100 dark:border-blue-900/50 cursor-grab"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <Link to={`/tasks/${task._id}`} className="block">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {truncateText(task.description)}
                        </p>
                        <div className="flex justify-between items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <div className="mt-2 flex -space-x-2 overflow-hidden">
                            {task.assignedTo.slice(0, 3).map((assignee) => (
                              <div 
                                key={assignee._id} 
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                                title={assignee.name}
                              >
                                {assignee.avatar ? (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                    {assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {task.assignedTo.length > 3 && (
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                                +{task.assignedTo.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No tasks in progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'completed')}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Completed
                <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full px-2 py-1">
                  {filteredTasks.completed.length}
                </span>
              </h2>
            </div>
            <div className="p-4 h-[calc(100vh-220px)] overflow-y-auto">
              {filteredTasks.completed.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.completed.map((task) => (
                    <div
                      key={task._id}
                      className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 shadow-sm border border-green-100 dark:border-green-900/50 cursor-grab"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <Link to={`/tasks/${task._id}`} className="block">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {truncateText(task.description)}
                        </p>
                        <div className="flex justify-between items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                        {task.assignedTo && task.assignedTo.length > 0 && (
                          <div className="mt-2 flex -space-x-2 overflow-hidden">
                            {task.assignedTo.slice(0, 3).map((assignee) => (
                              <div 
                                key={assignee._id} 
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden"
                                title={assignee.name}
                              >
                                {assignee.avatar ? (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
                                    {assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {task.assignedTo.length > 3 && (
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                                +{task.assignedTo.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No completed tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;