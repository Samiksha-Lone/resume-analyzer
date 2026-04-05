const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        throw new ApiError(401, 'User not found, not authorized');
      }

      return next();
    } catch (error) {
      console.error(error);
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }

  return next(new ApiError(401, 'Not authorized, no token'));
};

module.exports = { protect };
