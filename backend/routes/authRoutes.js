const express = require('express');
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  authLimiter, 
  createAccountLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiter');
const { 
  validationRules, 
  handleValidationErrors,
  body,
  param
} = require('../middleware/validation');

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/register', 
  createAccountLimiter,
  [
    validationRules.name,
    validationRules.email,
    validationRules.password,
    handleValidationErrors
  ],
  registerUser
);

router.post('/login', 
  authLimiter,
  [
    validationRules.email,
    validationRules.password,
    handleValidationErrors
  ],
  loginUser
);

router.post('/refresh-token', refreshAccessToken);

router.post('/forgot-password',
  passwordResetLimiter,
  [
    validationRules.email,
    handleValidationErrors
  ],
  forgotPassword
);

router.post('/reset-password/:token',
  passwordResetLimiter,
  [
    param('token').notEmpty().withMessage('Reset token is required'),
    validationRules.password,
    handleValidationErrors
  ],
  resetPassword
);

// Protected routes
router.use(protect); // Apply protect middleware to all routes below

router.post('/logout', logoutUser);

router.route('/profile')
  .get(getUserProfile)
  .put(
    [
      body('name').optional().trim().isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      body('email').optional().isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
      body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
      body('password').optional().isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number and special character'),
      handleValidationErrors
    ],
    updateUserProfile
  );

module.exports = router;