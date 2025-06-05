const Task = require('../models/Task');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignedTo, labels } = req.body;

  // Validate assigned users exist
  if (assignedTo && assignedTo.length > 0) {
    const users = await User.find({ _id: { $in: assignedTo } });
    if (users.length !== assignedTo.length) {
      throw new AppError('One or more assigned users not found', 400);
    }
  }

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    creator: req.user._id,
    assignedTo: assignedTo || [],
    labels: labels || [],
  });

  const populatedTask = await Task.findById(task._id)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  res.status(201).json(populatedTask);
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = {};
  
  // Filter tasks by user (either created by or assigned to)
  queryObj.$or = [
    { creator: req.user._id },
    { assignedTo: { $in: [req.user._id] } }
  ];
  
  // Filter by status if provided
  if (req.query.status) {
    queryObj.status = req.query.status;
  }
  
  // Filter by priority if provided
  if (req.query.priority) {
    queryObj.priority = req.query.priority;
  }

  // Search by title or description if provided
  if (req.query.search) {
    queryObj.$and = [
      queryObj.$or,
      {
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      }
    ];
    delete queryObj.$or;
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const tasks = await Task.find(queryObj)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Task.countDocuments(queryObj);
  
  res.json({
    tasks,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is creator or assigned to the task
  const isCreator = task.creator._id.toString() === req.user._id.toString();
  const isAssigned = task.assignedTo.some(
    (user) => user._id.toString() === req.user._id.toString()
  );

  if (!isCreator && !isAssigned && req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this task', 403);
  }

  res.json(task);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is creator or admin
  if (
    task.creator.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to update this task', 403);
  }

  // Validate assigned users if updating
  if (req.body.assignedTo && req.body.assignedTo.length > 0) {
    const users = await User.find({ _id: { $in: req.body.assignedTo } });
    if (users.length !== req.body.assignedTo.length) {
      throw new AppError('One or more assigned users not found', 400);
    }
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  res.json(task);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check if user is creator or admin
  if (
    task.creator.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to delete this task', 403);
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({ message: 'Task removed' });
});

// @desc    Assign task to user
// @route   POST /api/tasks/:id/assign
// @access  Private
const assignTask = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  // Check if user is creator or admin
  if (
    task.creator.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to assign this task', 403);
  }
  
  // Check if user is already assigned
  if (task.assignedTo.includes(userId)) {
    throw new AppError('User already assigned to this task', 400);
  }
  
  task.assignedTo.push(userId);
  
  await task.save();
  
  const updatedTask = await Task.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');
  
  res.json(updatedTask);
});

// @desc    Unassign task from user
// @route   POST /api/tasks/:id/unassign
// @access  Private
const unassignTask = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  // Check if user is creator or admin
  if (
    task.creator.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to unassign this task', 403);
  }
  
  // Check if user is assigned
  if (!task.assignedTo.includes(userId)) {
    throw new AppError('User not assigned to this task', 400);
  }
  
  task.assignedTo = task.assignedTo.filter(
    (id) => id.toString() !== userId.toString()
  );
  
  await task.save();
  
  const updatedTask = await Task.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');
  
  res.json(updatedTask);
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  
  // Check if user is creator, assigned, or admin
  const isCreator = task.creator.toString() === req.user._id.toString();
  const isAssigned = task.assignedTo.some(
    (id) => id.toString() === req.user._id.toString()
  );
  
  if (!isCreator && !isAssigned && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this task', 403);
  }
  
  task.status = status;
  
  await task.save();
  
  const updatedTask = await Task.findById(req.params.id)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar');
  
  res.json(updatedTask);
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  updateTaskStatus,
};