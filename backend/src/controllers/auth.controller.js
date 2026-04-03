const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { ApiError, success } = require('../utils/apiResponse');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      return success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: 'User registered successfully'
      }, 201);
    } else {
      throw new ApiError(400, 'Invalid user data');
    }
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return success(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: 'Logged in successfully'
      });
    } else {
      throw new ApiError(401, 'Invalid email or password');
    }
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return success(res, user);
    } else {
      throw new ApiError(404, 'User not found');
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile
};
