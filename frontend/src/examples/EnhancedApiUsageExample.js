import React, { useEffect, useState } from 'react';
import { useApiCall, useParallelApiCalls } from '../hooks/useApiCall';
import taskService from '../services/taskService';
import authService from '../services/authService';
import loadingService from '../services/loadingService';
import { cancelRequest, cancelAllRequests } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Example component demonstrating all the enhanced API features
 */
const EnhancedApiUsageExample = () => {
  const [globalLoading, setGlobalLoading] = useState(false);

  // Example 1: Simple API call with loading state
  const {
    data: tasks,
    loading: tasksLoading,
    error: tasksError,
    execute: fetchTasks,
    cancel: cancelTasksFetch,
  } = useApiCall(taskService.getTasks, {
    immediate: true, // Fetch immediately on mount
    dependencies: [], // Re-fetch when these dependencies change
    onSuccess: (data) => {
      console.log('Tasks loaded successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to load tasks:', error);
    },
  });

  // Example 2: API call with parameters
  const {
    data: taskDetails,
    loading: taskLoading,
    execute: fetchTaskDetails,
  } = useApiCall(taskService.getTaskById);

  // Example 3: Parallel API calls
  const {
    data: parallelData,
    loading: parallelLoading,
    execute: fetchParallelData,
  } = useParallelApiCalls([
    taskService.getTasks,
    authService.getUserProfile,
    taskService.getTaskStats,
  ]);

  // Example 4: Subscribe to global loading state
  useEffect(() => {
    const unsubscribe = loadingService.subscribe((isLoading) => {
      setGlobalLoading(isLoading);
    });

    return unsubscribe;
  }, []);

  // Example 5: Create task with error handling
  const handleCreateTask = async () => {
    try {
      const newTask = await taskService.createTask({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        dueDate: new Date().toISOString(),
      });
      
      // Refresh tasks list after creation
      fetchTasks();
    } catch (error) {
      // Error is already handled by the service
      console.error('Task creation failed:', error);
    }
  };

  // Example 6: Update task with optimistic UI
  const handleUpdateTask = async (taskId) => {
    const originalTasks = tasks;
    
    try {
      // Optimistically update UI
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'completed' }
          : task
      );
      
      // Update local state immediately
      // In a real app, you'd update your state management here
      
      // Make API call
      await taskService.updateTaskStatus(taskId, 'completed');
    } catch (error) {
      // Revert optimistic update on error
      // In a real app, you'd revert your state here
      toast.error('Failed to update task. Changes reverted.');
    }
  };

  // Example 7: Delete with confirmation
  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      await taskService.deleteTask(taskId);
      fetchTasks(); // Refresh list
    } catch (error) {
      // Error already handled by service
    }
  };

  // Example 8: Batch operations
  const handleBatchDelete = async (taskIds) => {
    try {
      await taskService.deleteTasks(taskIds);
      fetchTasks(); // Refresh list
    } catch (error) {
      // Error already handled by service
    }
  };

  // Example 9: Search with debounce (cancelling previous requests)
  const handleSearch = async (searchTerm) => {
    try {
      // Cancel any previous search request
      cancelRequest('GET', '/users/search', 'New search initiated');
      
      const results = await taskService.searchUsers(searchTerm);
      console.log('Search results:', results);
    } catch (error) {
      if (error.message !== 'New search initiated') {
        // Handle actual errors
      }
    }
  };

  // Example 10: Export with progress
  const handleExport = async () => {
    try {
      await taskService.exportTasks(
        { status: 'completed' }, // filters
        'csv' // format
      );
    } catch (error) {
      // Error already handled by service
    }
  };

  // Example 11: Cancel all requests on unmount
  useEffect(() => {
    return () => {
      cancelAllRequests('Component unmounted');
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Enhanced API Usage Examples</h1>

      {/* Global Loading Indicator */}
      {globalLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Loading...
        </div>
      )}

      {/* Tasks List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        
        {tasksLoading ? (
          <div>Loading tasks...</div>
        ) : tasksError ? (
          <div className="text-red-500">Failed to load tasks</div>
        ) : (
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleUpdateTask(task.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Task
        </button>

        <button
          onClick={() => fetchTaskDetails('task-id-here')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Fetch Task Details
        </button>

        <button
          onClick={() => fetchParallelData()}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          disabled={parallelLoading}
        >
          {parallelLoading ? 'Loading...' : 'Fetch Multiple Data'}
        </button>

        <button
          onClick={cancelTasksFetch}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel Tasks Fetch
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export Tasks
        </button>
      </div>
    </div>
  );
};

export default EnhancedApiUsageExample;