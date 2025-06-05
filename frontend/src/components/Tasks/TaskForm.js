import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import ReactQuill from 'react-quill';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  FiCalendar, 
  FiFlag, 
  FiTag, 
  FiPaperclip, 
  FiCheck, 
  FiX,
  FiUpload,
  FiUser,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import Loader from '../Common/Loader';

// Import CSS for react-datepicker and react-quill
import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';
import './TaskForm.css';

// Validation schema
const validationSchema = yup.object({
  title: yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  priority: yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority')
    .required('Priority is required'),
  status: yup.string()
    .oneOf(['pending', 'in-progress', 'completed'], 'Invalid status')
    .required('Status is required'),
  dueDate: yup.date()
    .nullable()
    .when('$isEditMode', {
      is: false,
      then: (schema) => schema.min(new Date(), 'Due date cannot be in the past'),
      otherwise: (schema) => schema
    }),
  assignedTo: yup.array(),
  labels: yup.array()
});

// Priority options with colors and icons
const priorityOptions = [
  { value: 'low', label: 'Low', color: '#10b981', icon: '🟢' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
  { value: 'high', label: 'High', color: '#ef4444', icon: '🔴' }
];

// Status options
const statusOptions = [
  { value: 'pending', label: 'Pending', color: '#6b7280' },
  { value: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#10b981' }
];

// Predefined tags for autocomplete
const predefinedTags = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'enhancement', label: 'Enhancement' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'review', label: 'Review' },
  { value: 'testing', label: 'Testing' },
  { value: 'design', label: 'Design' }
];

// Rich text editor modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    createTask, 
    updateTask, 
    getTaskById, 
    task, 
    loading, 
    error, 
    clearTask, 
    clearError,
    searchUsers,
    searchResults
  } = useTask();
  const { primaryColor } = useTheme();
  
  // Form state
  const [mode, setMode] = useState('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const searchRef = useRef(null);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    context: { isEditMode: mode === 'edit' },
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: null,
      assignedTo: [],
      labels: []
    }
  });

  // Watch form values for progress calculation
  const watchedFields = watch();

  // Calculate form progress
  useEffect(() => {
    const fields = ['title', 'description', 'priority', 'status', 'dueDate', 'assignedTo', 'labels'];
    const filledFields = fields.filter(field => {
      const value = watchedFields[field];
      if (Array.isArray(value)) return value.length > 0;
      if (field === 'dueDate') return value !== null;
      return value && value.length > 0;
    });
    setFormProgress((filledFields.length / fields.length) * 100);
  }, [watchedFields]);

  // Fetch task data if in edit mode
  useEffect(() => {
    if (id) {
      setMode('edit');
      getTaskById(id);
    } else {
      clearTask();
      setMode('create');
    }
    
    return () => clearTask();
  }, [id]);

  // Set form data when task is loaded for editing
  useEffect(() => {
    if (mode === 'edit' && task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignedTo: task.assignedTo || [],
        labels: task.labels || []
      });
      
      // Set attachments if any
      if (task.attachments) {
        setAttachments(task.attachments);
      }
    }
  }, [task, mode, reset]);

  // Handle error from context
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users debounced
  const handleUserSearch = useCallback(async (value) => {
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
  }, [searchUsers]);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    const newAttachments = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    maxSize: 5242880 // 5MB
  });

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Form submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Prepare task data
      const taskData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        assignedTo: data.assignedTo.map(user => user._id || user),
        labels: data.labels.map(label => label.value || label)
      };

      // TODO: Handle attachments separately when backend supports it
      // For now, we'll just note that attachments were selected
      if (attachments.length > 0) {
        taskData.attachmentCount = attachments.length;
      }

      if (mode === 'create') {
        await createTask(taskData);
        setShowSuccess(true);
        toast.success('Task created successfully!');
        setTimeout(() => {
          navigate('/tasks');
        }, 1500);
      } else {
        await updateTask(id, taskData);
        setShowSuccess(true);
        toast.success('Task updated successfully!');
        setTimeout(() => {
          navigate(`/tasks/${id}`);
        }, 1500);
      }
    } catch (err) {
      // Error is handled by the useEffect
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom select styles
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? primaryColor : provided.borderColor,
      boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : provided.boxShadow,
      '&:hover': {
        borderColor: primaryColor
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: `${primaryColor}20`
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: primaryColor
    })
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header with progress */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${formProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/80 text-sm mt-2">
            {Math.round(formProgress)}% Complete
          </p>
        </div>

        <div className="p-6">
          {loading && mode === 'edit' ? (
            <Loader message="Loading task data..." />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title field with floating label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <input
                  {...register('title')}
                  type="text"
                  placeholder=" "
                  className={`peer w-full px-4 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${
                    errors.title 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  } dark:bg-gray-700 dark:text-white`}
                />
                <label className="absolute left-4 top-3 text-gray-500 transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75 bg-white dark:bg-gray-700 px-1">
                  Task Title *
                </label>
                <AnimatePresence>
                  {errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm mt-1 flex items-center"
                    >
                      <FiAlertCircle className="mr-1" />
                      {errors.title.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Rich text editor for description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div className={`rounded-lg border-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}>
                      <ReactQuill
                        {...field}
                        theme="snow"
                        modules={quillModules}
                        className="bg-white dark:bg-gray-700"
                        placeholder="Describe your task in detail..."
                      />
                    </div>
                  )}
                />
                <AnimatePresence>
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-500 text-sm flex items-center"
                    >
                      <FiAlertCircle className="mr-1" />
                      {errors.description.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority selector with visual indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiFlag className="inline mr-1" />
                    Priority
                  </label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        {priorityOptions.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              {...field}
                              value={option.value}
                              checked={field.value === option.value}
                              className="sr-only"
                            />
                            <span className="text-2xl mr-2">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </motion.div>

                {/* Status selector */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={statusOptions}
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        value={statusOptions.find(opt => opt.value === field.value)}
                        onChange={(selected) => field.onChange(selected.value)}
                      />
                    )}
                  />
                </motion.div>

                {/* Date picker with calendar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiCalendar className="inline mr-1" />
                    Due Date
                  </label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="MMMM d, yyyy"
                        minDate={new Date()}
                        placeholderText="Select due date"
                        className={`w-full px-4 py-2 border-2 rounded-lg ${
                          errors.dueDate ? 'border-red-500' : 'border-gray-300'
                        } dark:bg-gray-700 dark:text-white`}
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                        popperPlacement="bottom-start"
                      />
                    )}
                  />
                  <AnimatePresence>
                    {errors.dueDate && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.dueDate.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* User assignment with search */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiUser className="inline mr-1" />
                  Assign To
                </label>
                <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3">
                      <Loader size="small" />
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {searchTerm.length >= 2 && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto mt-1 custom-scrollbar"
                      >
                        {searchResults.map((user) => (
                          <motion.div
                            key={user._id}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                            className="px-4 py-3 cursor-pointer flex items-center"
                            onClick={() => {
                              const currentAssigned = watch('assignedTo');
                              if (!currentAssigned.find(u => u._id === user._id)) {
                                setValue('assignedTo', [...currentAssigned, user]);
                              }
                              setSearchTerm('');
                            }}
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Assigned users */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {watch('assignedTo').map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {user.name}
                        <button
                          type="button"
                          onClick={() => {
                            const currentAssigned = watch('assignedTo');
                            setValue('assignedTo', currentAssigned.filter(u => u._id !== user._id));
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tags with autocomplete */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiTag className="inline mr-1" />
                  Labels
                </label>
                <Controller
                  name="labels"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      {...field}
                      isMulti
                      options={predefinedTags}
                      styles={selectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Add labels..."
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  )}
                />
              </motion.div>

              {/* File attachments */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiPaperclip className="inline mr-1" />
                  Attachments
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: Images, PDFs, Word, Excel (Max 5MB)
                  </p>
                </div>
                
                {/* Attachment previews */}
                {attachments.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {attachments.map((attachment, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group"
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {attachment.preview && attachment.file.type.startsWith('image/') ? (
                              <img
                                src={attachment.preview}
                                alt={attachment.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPaperclip className="text-3xl text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {attachment.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>

              {/* Form actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    isValid 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                      : 'bg-gray-400'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader size="small" />
                  ) : mode === 'create' ? (
                    'Create Task'
                  ) : (
                    'Update Task'
                  )}
                </button>
              </motion.div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-full p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FiCheckCircle className="text-6xl text-green-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskForm;