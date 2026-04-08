/**
 * MongoDB Database Connection Configuration
 *
 * This module handles the connection to MongoDB using Mongoose ODM.
 * It provides a single connection function that can be called once during
 * application startup.
 *
 * Environment Variables:
 * - MONGO_URI: MongoDB connection string (default: mongodb://127.0.0.1:27017/resume-analyzer)
 *
 * @module config/db
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database
 *
 * Connects to MongoDB using the connection string from environment variables.
 * Sets up connection event handlers for logging and error handling.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails
 *
 * @example
 * ```javascript
 * const connectDB = require('./config/db');
 * await connectDB();
 * console.log('Database connected');
 * ```
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-analyzer');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectDB;