import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiClipboard, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiZap,
  FiTarget,
  FiAward,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
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
    upcomingDeadlines: [],
    recentActivity: [],
    weeklyProgress: 0,
    monthlyProgress: 0,
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
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
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
      
      // Get upcoming deadlines (next 7 days)
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks
        .filter(task => 
          task.dueDate && 
          new Date(task.dueDate) >= today && 
          new Date(task.dueDate) <= nextWeek &&
          task.status !== 'completed'
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      
      // Generate recent activity
      const recentActivity = [...tasks]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 8)
        .map(task => ({
          id: task._id,
          title: task.title,
          action: task.status === 'completed' ? 'completed' : 
                  task.updatedAt > task.createdAt ? 'updated' : 'created',
          timestamp: task.updatedAt || task.createdAt,
          status: task.status,
          priority: task.priority
        }));
      
      // Calculate weekly and monthly progress
      const weeklyCompleted = completedTasks.filter(task => 
        new Date(task.updatedAt || task.createdAt) >= weekAgo
      ).length;
      const weeklyTotal = tasks.filter(task => 
        new Date(task.createdAt) >= weekAgo
      ).length;
      const weeklyProgress = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
      
      const monthlyCompleted = completedTasks.filter(task => 
        new Date(task.updatedAt || task.createdAt) >= monthAgo
      ).length;
      const monthlyTotal = tasks.filter(task => 
        new Date(task.createdAt) >= monthAgo
      ).length;
      const monthlyProgress = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;
      
      setDashboardStats({
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        overdueTasksCount: overdueTasks.length,
        recentTasks,
        upcomingDeadlines,
        recentActivity,
        weeklyProgress,
        monthlyProgress,
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

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const statsCardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div 
        className="container mx-auto px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {user?.name}!
                </h1>
                <p className="text-blue-100 text-lg">
                  Here's what's happening with your tasks today
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/tasks/new'}
                  className="flex items-center px-5 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <FiPlus className="mr-2" size={20} />
                  Create Task
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/kanban'}
                  className="flex items-center px-5 py-3 bg-blue-500 bg-opacity-20 text-white rounded-lg font-medium hover:bg-opacity-30 transition-colors"
                >
                  <FiTarget className="mr-2" size={20} />
                  Kanban Board
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

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
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              variants={containerVariants}
            >
              <motion.div
                variants={statsCardVariants}
                whileHover="hover"
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalTasks}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <FiTrendingUp className="text-green-500 mr-1" />
                      <span className="text-green-500">+12%</span>
                      <span className="text-gray-500 ml-2">vs last week</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                    <FiClipboard className="text-white" size={28} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={statsCardVariants}
                whileHover="hover"
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardStats.completedTasks}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <FiArrowUp className="text-green-500 mr-1" />
                      <span className="text-green-500">{completionPercentage}%</span>
                      <span className="text-gray-500 ml-2">completion rate</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                    <FiCheckCircle className="text-white" size={28} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={statsCardVariants}
                whileHover="hover"
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardStats.inProgressTasks}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <FiActivity className="text-blue-500 mr-1" />
                      <span className="text-blue-500">Active</span>
                      <span className="text-gray-500 ml-2">right now</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-2xl shadow-lg">
                    <FiClock className="text-white" size={28} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={statsCardVariants}
                whileHover="hover"
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardStats.overdueTasksCount}</p>
                    <div className="flex items-center mt-2 text-sm">
                      {dashboardStats.overdueTasksCount > 0 ? (
                        <>
                          <FiAlertCircle className="text-red-500 mr-1" />
                          <span className="text-red-500">Needs attention</span>
                        </>
                      ) : (
                        <>
                          <FiAward className="text-green-500 mr-1" />
                          <span className="text-green-500">All on track!</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                    <FiAlertCircle className="text-white" size={28} />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              variants={containerVariants}
            >
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/tasks'}
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg mb-3">
                  <FiClipboard className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Tasks</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/team'}
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-3 rounded-xl shadow-lg mb-3">
                  <FiUsers className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/settings'}
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg mb-3">
                  <FiZap className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Add</span>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/profile'}
                className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg mb-3">
                  <FiAward className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</span>
              </motion.button>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Task Progress & Charts */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <FiBarChart2 className="mr-2 text-blue-500" />
                      Task Analytics
                    </h2>
                    <select className="text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Progress</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{dashboardStats.weeklyProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div 
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${dashboardStats.weeklyProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Progress</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{dashboardStats.monthlyProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div 
                          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${dashboardStats.monthlyProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
                    <FiPieChart className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">Task distribution chart coming soon</p>
                  </div>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FiActivity className="mr-2 text-purple-500" />
                    Recent Activity
                  </h2>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dashboardStats.recentActivity.length > 0 ? (
                      dashboardStats.recentActivity.map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className={`p-2 rounded-lg ${
                            activity.action === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                            activity.action === 'created' ? 'bg-blue-100 dark:bg-blue-900' :
                            'bg-yellow-100 dark:bg-yellow-900'
                          }`}>
                            {activity.action === 'completed' ? 
                              <FiCheckCircle className="text-green-600 dark:text-green-300" size={16} /> :
                              activity.action === 'created' ? 
                              <FiPlus className="text-blue-600 dark:text-blue-300" size={16} /> :
                              <FiClock className="text-yellow-600 dark:text-yellow-300" size={16} />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">
                              You {activity.action} <Link to={`/tasks/${activity.id}`} className="font-medium hover:underline" style={{ color: primaryColor }}>
                                {activity.title}
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[activity.priority]}`}>
                            {activity.priority}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No recent activity
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Upcoming Deadlines */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FiCalendar className="mr-2 text-orange-500" />
                    Upcoming Deadlines
                  </h2>
                  
                  <div className="space-y-3">
                    {dashboardStats.upcomingDeadlines.length > 0 ? (
                      dashboardStats.upcomingDeadlines.map((task) => (
                        <motion.div
                          key={task._id}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-1">
                            <Link 
                              to={`/tasks/${task._id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
                            >
                              {task.title}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Due {formatDueDate(task.dueDate)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiCalendar className="mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No upcoming deadlines
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to="/tasks" 
                    className="mt-4 block text-center text-sm font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    View all tasks →
                  </Link>
                </motion.div>

                {/* Task Distribution */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FiTarget className="mr-2 text-green-500" />
                    Task Overview
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">High Priority</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">{dashboardStats.highPriorityTasks}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</span>
                      <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{dashboardStats.pendingTasks}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{dashboardStats.inProgressTasks}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;