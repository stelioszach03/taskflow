import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Common/Loader';
import Alert from '../components/Common/Alert';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiSearch, FiFilter, FiX, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { BsKanban } from 'react-icons/bs';

// Sortable Task Card Component
const TaskCard = ({ task, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isHovered, setIsHovered] = useState(false);

  // Priority badge colors
  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    high: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  // Format due date
  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Today', color: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'text-blue-600 dark:text-blue-400' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, color: 'text-gray-600 dark:text-gray-400' };
    }
    
    return {
      text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-gray-600 dark:text-gray-400'
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative ${isOverlay ? 'shadow-2xl rotate-3' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 ${
          isDragging ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <Link to={`/tasks/${task._id}`} className="block">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            {dueDateInfo && (
              <span className={`inline-flex items-center text-xs ${dueDateInfo.color}`}>
                <FiCalendar className="mr-1" />
                {dueDateInfo.text}
              </span>
            )}
          </div>

          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {task.assignedTo.slice(0, 3).map((assignee) => (
                  <div
                    key={assignee._id}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden hover:z-10 transition-transform hover:scale-110"
                    title={assignee.name}
                  >
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium">
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                
                {task.assignedTo.length > 3 && (
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                    +{task.assignedTo.length - 3}
                  </span>
                )}
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Hover preview */}
        <AnimatePresence>
          {isHovered && !isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute z-50 left-0 right-0 top-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none"
              style={{ minWidth: '300px' }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <FiClock className="mr-1" />
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </span>
                {task.completedAt && (
                  <span className="flex items-center">
                    <FiClock className="mr-1" />
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Column Component
const Column = ({ status, tasks, children, color, icon, onAddTask }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { createTask } = useTask();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      await onAddTask({ title: newTaskTitle, status });
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const columnColors = {
    pending: 'from-gray-500 to-gray-600',
    'in-progress': 'from-blue-500 to-blue-600',
    completed: 'from-emerald-500 to-emerald-600'
  };

  const columnBgColors = {
    pending: 'bg-gray-50 dark:bg-gray-900/50',
    'in-progress': 'bg-blue-50 dark:bg-blue-900/20',
    completed: 'bg-emerald-50 dark:bg-emerald-900/20'
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`bg-gradient-to-r ${columnColors[status]} p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-xl">{icon}</span>
            <h2 className="text-lg font-bold text-white">
              {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-sm font-semibold rounded-full px-3 py-1">
              {tasks.length}
            </span>
            <button
              onClick={() => setIsAddingTask(true)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              title="Quick add task"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 ${columnBgColors[status]} p-4 rounded-b-lg overflow-hidden`}>
        {isAddingTask && (
          <form onSubmit={handleQuickAdd} className="mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="h-full overflow-y-auto custom-scrollbar">
          <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 pb-4">
              {children}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { getTasks, filteredTasks, loading, error, clearError, updateTaskStatus, createTask } = useTask();
  const { primaryColor } = useTheme();
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks on component mount
  useEffect(() => {
    getTasks({ limit: 100 });
  }, []);

  // Filter tasks based on search and priority
  const filterTasksByStatus = useCallback((status) => {
    let tasks = filteredTasks[status] || [];
    
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterPriority) {
      tasks = tasks.filter(task => task.priority === filterPriority);
    }
    
    return tasks;
  }, [filteredTasks, searchTerm, filterPriority]);

  const pendingTasks = filterTasksByStatus('pending');
  const inProgressTasks = filterTasksByStatus('in-progress');
  const completedTasks = filterTasksByStatus('completed');

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = [...pendingTasks, ...inProgressTasks, ...completedTasks].find(
      task => task._id === active.id
    );

    if (!activeTask) {
      setActiveId(null);
      return;
    }

    // Determine which column the task was dropped in
    let newStatus = activeTask.status;
    
    // Check if dropped in a different column
    const overTask = [...pendingTasks, ...inProgressTasks, ...completedTasks].find(
      task => task._id === over.id
    );
    
    if (overTask) {
      newStatus = overTask.status;
    } else {
      // Check if dropped on column itself
      if (over.id === 'pending' || over.id === 'in-progress' || over.id === 'completed') {
        newStatus = over.id;
      }
    }

    if (activeTask.status !== newStatus) {
      try {
        await updateTaskStatus(activeTask._id, newStatus);
        await getTasks({ limit: 100 });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }

    setActiveId(null);
  };

  const handleQuickAddTask = async (taskData) => {
    try {
      await createTask(taskData);
      await getTasks({ limit: 100 });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const activeTask = activeId
    ? [...pendingTasks, ...inProgressTasks, ...completedTasks].find(task => task._id === activeId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <BsKanban className="text-2xl text-gray-700 dark:text-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiFilter className="mr-2" />
                  Filters
                  {filterPriority && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </h3>
                        <select
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">All</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        {filterPriority && (
                          <button
                            onClick={() => setFilterPriority('')}
                            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Create Task Button */}
              <button
                onClick={() => navigate('/tasks/new')}
                className="flex items-center px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <FiPlus className="mr-2" />
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <Alert type="error" message={error} onClose={clearError} />
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader message="Loading tasks..." />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Pending Column */}
              <Column
                status="pending"
                tasks={pendingTasks}
                color="gray"
                icon={<FiClock />}
                onAddTask={handleQuickAddTask}
              >
                {pendingTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
                {pendingTasks.length === 0 && !searchTerm && !filterPriority && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No pending tasks</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Click the + button to add a task
                    </p>
                  </div>
                )}
              </Column>

              {/* In Progress Column */}
              <Column
                status="in-progress"
                tasks={inProgressTasks}
                color="blue"
                icon={<FiUser />}
                onAddTask={handleQuickAddTask}
              >
                {inProgressTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
                {inProgressTasks.length === 0 && !searchTerm && !filterPriority && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No tasks in progress</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Drag tasks here to start working
                    </p>
                  </div>
                )}
              </Column>

              {/* Completed Column */}
              <Column
                status="completed"
                tasks={completedTasks}
                color="green"
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>}
                onAddTask={handleQuickAddTask}
              >
                {completedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
                {completedTasks.length === 0 && !searchTerm && !filterPriority && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No completed tasks</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Complete tasks to see them here
                    </p>
                  </div>
                )}
              </Column>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
          </DndContext>

          {/* No results message */}
          {(searchTerm || filterPriority) && 
           pendingTasks.length === 0 && 
           inProgressTasks.length === 0 && 
           completedTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No tasks found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterPriority('');
                }}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;