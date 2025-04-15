import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Common/Loader';
import Alert from '../components/Common/Alert';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, getTasks, loading, error, clearError } = useTask();
  const { primaryColor } = useTheme();
  const [dashboardStats, setDashboardStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    highPriorityTasks: 0,
    overdueTasksCount: 0,
    recentTasks: [],
  });

  // Load tasks on component mount
  useEffect(() => {
    getTasks({ limit: 100 }); // Get a larger number of tasks for dashboard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate dashboard statistics
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const today = new Date();
      
      // Filter tasks for different categories
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const pendingTasks = tasks.filter(task => task.status === 'pending');
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
      const highPriorityTasks = tasks.filter(task => task.priority === 'high');
      
      // Overdue tasks (due date is in the past and task is not completed)
      const overdueTasks = tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < today && 
        task.status !== 'completed'
      );
      
      // Get 5 most recent tasks
      const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setDashboardStats({
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        overdueTasksCount: overdueTasks.length,
        recentTasks,
      });
    }
  }, [tasks]);

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

  // Calculate completion percentage
  const completionPercentage = dashboardStats.totalTasks > 0 
    ? Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100) 
    : 0;

  // Priority colors
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Status colors
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        <Link 
          to="/tasks/new" 
          className="mt-4 md:mt-0 flex items-center px-4 py-2 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
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
        <Loader message="Loading dashboard data..." />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{dashboardStats.totalTasks}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{dashboardStats.completedTasks}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{dashboardStats.inProgressTasks}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{dashboardStats.overdueTasksCount}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Completion</h2>
              
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{completionPercentage}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ width: `${completionPercentage}%`, backgroundColor: primaryColor }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardStats.pendingTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{dashboardStats.highPriorityTasks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
                <Link 
                  to="/tasks" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  View All
                </Link>
              </div>
              
              {dashboardStats.recentTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {dashboardStats.recentTasks.map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link 
                              to={`/tasks/${task._id}`} 
                              className="text-sm font-medium hover:underline"
                              style={{ color: primaryColor }}
                            >
                              {task.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColors[task.status]}`}>
                              {task.status === 'in-progress'
                                ? 'In Progress'
                                : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {formatDueDate(task.dueDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;