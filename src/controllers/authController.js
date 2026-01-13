const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { config } = require('../config');
const { asyncHandler, AppError } = require('../utils/errorHandler');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Please provide username and password', 400);
  }

  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  req.session.userId = user._id;
  req.session.username = user.username;
  req.session.token = token;

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      lastLogin: user.lastLogin,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new AppError('Could not log out', 500);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.session.userId) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await User.findById(req.session.userId).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  const user = await User.findById(req.session.userId);

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

module.exports = {
  login,
  logout,
  getCurrentUser,
  changePassword,
};
