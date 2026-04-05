const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { ApiError, success, validationError } = require('../utils/apiResponse');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 * @throws {Error} If JWT_SECRET is not configured
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }

  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Validate user registration input
 * @param {Object} input - User input data
 * @param {string} input.name - User's full name
 * @param {string} input.email - User's email address
 * @param {string} input.password - User's password
 * @throws {ApiError} If validation fails
 */
const validateRegistrationInput = ({ name, email, password }) => {
  const errors = {};

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.name = 'Name is required and must be a string';
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (trimmedName.length > 50) {
      errors.name = 'Name must be less than 50 characters long';
    } else if (/\d/.test(trimmedName)) {
      errors.name = 'Name cannot contain numeric digits';
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.email = 'Email is required and must be a string';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    } else if (email.length > 254) {
      errors.email = 'Email address is too long';
    }
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required and must be a string';
  } else {
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (password.length > 128) {
      errors.password = 'Password must be less than 128 characters long';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'Validation failed', true, '', errors);
  }
};

/**
 * Register a new user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input data
    validateRegistrationInput({ name, email, password });

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    if (!user) {
      throw new ApiError(500, 'Failed to create user account');
    }

    // Generate authentication token
    const token = generateToken(user._id);

    return success(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }, 201, 'User registered successfully');

  } catch (error) {
    // Log error for monitoring (don't log sensitive data)
    console.error('Registration error:', {
      message: error.message,
      email: req.body?.email ? 'provided' : 'missing'
    });

    // If it's our custom ApiError, pass it through
    if (error instanceof ApiError) {
      return next(error);
    }

    // For unexpected errors, create a generic one
    const apiError = new ApiError(500, 'Registration failed due to server error');
    next(apiError);
  }
};

/**
 * Validate user login input
 * @param {Object} input - User input data
 * @param {string} input.email - User's email address
 * @param {string} input.password - User's password
 * @throws {ApiError} If validation fails
 */
const validateLoginInput = ({ email, password }) => {
  const errors = {};

  if (!email || typeof email !== 'string') {
    errors.email = 'Email is required and must be a string';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please provide a valid email address';
    } else if (email.length > 254) {
      errors.email = 'Email address is too long';
    }
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required and must be a string';
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'Validation failed', true, '', errors);
  }
};

/**
 * Authenticate user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input data
    validateLoginInput({ email, password });

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate authentication token
    const token = generateToken(user._id);

    return success(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    }, 200, 'Login successful');

  } catch (error) {
    // Log error for monitoring
    console.error('Login error:', {
      message: error.message,
      email: req.body?.email ? 'provided' : 'missing'
    });

    next(error);
  }
};

/**
 * Logout user (client-side token removal)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    return success(res, null, 200, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error.message);
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object (user attached by auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(new ApiError(401, 'Not authorized, no user information found'));
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return success(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};
