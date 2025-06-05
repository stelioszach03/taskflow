const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const config = require('../config/config');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');

// Generate Access Token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    config.jwtConfig.accessSecret,
    { expiresIn: config.jwtConfig.accessExpiresIn }
  );
};

// Generate Refresh Token and save to database
const generateRefreshToken = async (userId, ipAddress) => {
  const refreshToken = RefreshToken.generateToken();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  await RefreshToken.create({
    user: userId,
    token: refreshToken,
    expires: expiresAt,
    createdByIp: ipAddress
  });
  
  return refreshToken;
};

// Get client IP address
const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const ipAddress = getClientIp(req);

  // Check if user exists
  const userExists = await User.findOne({ email: email.toLowerCase() });

  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, ipAddress);

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    accessToken,
    refreshToken
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = getClientIp(req);

  // Check for user email
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AppError('Account is locked due to too many failed login attempts. Please try again later.', 423);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new AppError('Invalid email or password', 401);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Revoke all existing refresh tokens for this user
  await RefreshToken.updateMany(
    { user: user._id, revoked: null },
    { revoked: Date.now(), revokedByIp: ipAddress }
  );

  // Generate new tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, ipAddress);

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    accessToken,
    refreshToken
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const ipAddress = getClientIp(req);

  if (!refreshToken) {
    throw new AppError('Refresh token not provided', 401);
  }

  // Find the refresh token in database
  const storedToken = await RefreshToken.findOne({ token: refreshToken })
    .populate('user');

  if (!storedToken || !storedToken.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check if user still exists and is active
  const user = storedToken.user;
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401);
  }

  // Replace old refresh token with a new one (rotate)
  const newRefreshToken = await generateRefreshToken(user._id, ipAddress);
  await storedToken.revoke(ipAddress, newRefreshToken);

  // Generate new access token
  const accessToken = generateAccessToken(user._id);

  // Set new refresh token cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    accessToken,
    refreshToken: newRefreshToken
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const ipAddress = getClientIp(req);

  if (refreshToken) {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (storedToken && storedToken.isActive) {
      await storedToken.revoke(ipAddress);
    }
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update fields
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email.toLowerCase();
  if (req.body.avatar) user.avatar = req.body.avatar;

  // Handle password update separately
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  // Generate new access token if email was changed
  const accessToken = req.body.email ? generateAccessToken(updatedUser._id) : undefined;

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    emailVerified: updatedUser.emailVerified,
    ...(accessToken && { accessToken })
  });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new AppError('No user found with that email address', 404);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset token
  // For now, return token in response (remove in production)
  res.json({
    message: 'Password reset token sent to email',
    resetToken: resetToken // Remove this in production
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Revoke all refresh tokens
  await RefreshToken.updateMany(
    { user: user._id, revoked: null },
    { revoked: Date.now(), revokedByIp: 'password-reset' }
  );

  res.json({
    message: 'Password reset successful. Please login with your new password.'
  });
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
};