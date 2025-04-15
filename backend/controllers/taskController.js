const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, labels } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      creator: req.user._id,
      assignedTo: assignedTo || [],
      labels: labels || [],
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
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
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is creator or assigned to the task
    const isCreator = task.creator._id.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isCreator && !isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is creator or admin
    if (
      task.creator.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is creator or admin
    if (
      task.creator.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.remove();

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Assign task to user
// @route   POST /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is creator or admin
    if (
      task.creator.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to assign this task' });
    }
    
    // Check if user is already assigned
    if (task.assignedTo.includes(userId)) {
      return res.status(400).json({ message: 'User already assigned to this task' });
    }
    
    task.assignedTo.push(userId);
    
    await task.save();
    
    const updatedTask = await Task.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task or user not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Unassign task from user
// @route   POST /api/tasks/:id/unassign
// @access  Private
const unassignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is creator or admin
    if (
      task.creator.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to unassign this task' });
    }
    
    // Check if user is assigned
    if (!task.assignedTo.includes(userId)) {
      return res.status(400).json({ message: 'User not assigned to this task' });
    }
    
    task.assignedTo = task.assignedTo.filter(
      (id) => id.toString() !== userId.toString()
    );
    
    await task.save();
    
    const updatedTask = await Task.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task or user not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is creator, assigned, or admin
    const isCreator = task.creator.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === req.user._id.toString()
    );
    
    if (!isCreator && !isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    task.status = status;
    
    await task.save();
    
    const updatedTask = await Task.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');
    
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

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