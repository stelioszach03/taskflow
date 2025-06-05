const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
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

// Search users (accessible by all authenticated users)
router.route('/search')
  .get(
    [
      query('q').notEmpty().withMessage('Search query is required')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Search query must be between 2 and 50 characters')
        .escape(),
      handleValidationErrors
    ],
    searchUsers
  );

// Admin-only routes
router.use(admin);

router.route('/')
  .get(
    [
      validationRules.page,
      validationRules.limit,
      handleValidationErrors
    ],
    getUsers
  );

router.route('/:id')
  .get(
    [
      validationRules.mongoId,
      handleValidationErrors
    ],
    getUserById
  )
  .put(
    [
      validationRules.mongoId,
      body('name').optional().trim().isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
      body('email').optional().isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
      body('role').optional().isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin'),
      body('isActive').optional().isBoolean()
        .withMessage('isActive must be a boolean value'),
      handleValidationErrors
    ],
    updateUser
  )
  .delete(
    [
      validationRules.mongoId,
      handleValidationErrors
    ],
    deleteUser
  );

module.exports = router;