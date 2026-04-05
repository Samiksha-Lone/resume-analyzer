/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 */
function success(res, data, statusCode = 200, message = null) {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
}

/**
 * Send error response (use ApiError instead for consistency)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
function error(res, message = 'Internal server error', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 */
function validationError(res, errors) {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that was not found
 */
function notFound(res, resource = 'Resource') {
  return res.status(404).json({
    success: false,
    error: `${resource} not found`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
function unauthorized(res, message = 'Unauthorized access') {
  return res.status(401).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
function forbidden(res, message = 'Forbidden access') {
  return res.status(403).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  ApiError,
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden
};
