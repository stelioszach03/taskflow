const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { 
  validationRules, 
  handleValidationErrors,
  body,
  param,
  query
} = require('../middleware/validation');

const router = express.Router();

// Apply protection and rate limiting to all routes
router.use(protect);
router.use(apiLimiter);

// Task CRUD operations with validation
router.route('/')
  .post(
    [
      validationRules.title,
      validationRules.description,
      validationRules.priority,
      validationRules.dueDate,
      body('assignedTo').optional().isArray().withMessage('Assigned users must be an array'),
      body('assignedTo.*').optional().isMongoId().withMessage('Invalid user ID'),
      body('labels').optional().isArray().withMessage('Labels must be an array'),
      body('labels.*').optional().isString().trim().escape(),
      handleValidationErrors
    ],
    createTask
  )
  .get(
    [
      validationRules.page,
      validationRules.limit,
      validationRules.search,
      query('status').optional().isIn(['todo', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
      query('priority').optional().isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
      handleValidationErrors
    ],
    getTasks
  );

router.route('/:id')
  .get(
    [
      validationRules.mongoId,
      handleValidationErrors
    ],
    getTaskById
  )
  .put(
    [
      validationRules.mongoId,
      body('title').optional().trim().isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters').escape(),
      body('description').optional().trim().isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters').escape(),
      body('priority').optional().isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
      body('status').optional().isIn(['todo', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
      body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
      body('assignedTo').optional().isArray().withMessage('Assigned users must be an array'),
      body('assignedTo.*').optional().isMongoId().withMessage('Invalid user ID'),
      body('labels').optional().isArray().withMessage('Labels must be an array'),
      body('labels.*').optional().isString().trim().escape(),
      handleValidationErrors
    ],
    updateTask
  )
  .delete(
    [
      validationRules.mongoId,
      handleValidationErrors
    ],
    deleteTask
  );

router.route('/:id/assign')
  .post(
    [
      validationRules.mongoId,
      body('userId').notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID'),
      handleValidationErrors
    ],
    assignTask
  );

router.route('/:id/unassign')
  .post(
    [
      validationRules.mongoId,
      body('userId').notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid user ID'),
      handleValidationErrors
    ],
    unassignTask
  );

router.route('/:id/status')
  .put(
    [
      validationRules.mongoId,
      body('status').notEmpty().withMessage('Status is required')
        .isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
      handleValidationErrors
    ],
    updateTaskStatus
  );

module.exports = router;