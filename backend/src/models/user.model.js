/**
 * User Model
 *
 * Defines the MongoDB schema for user accounts in the Resume Analyzer application.
 * Handles user authentication data including password hashing and validation.
 *
 * Schema Fields:
 * - name: User's full name (required, trimmed)
 * - email: User's email address (required, unique, lowercase, validated)
 * - password: User's password (required, minimum 6 characters, hashed)
 * - timestamps: createdAt and updatedAt automatically managed
 *
 * Features:
 * - Password hashing with bcrypt before saving
 * - Password validation method for authentication
 * - Email uniqueness constraint
 * - Input validation and sanitization
 *
 * @module models/user
 * @requires mongoose
 * @requires bcryptjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 *
 * Defines the structure and validation rules for user documents in MongoDB.
 * Includes pre-save middleware for password hashing and instance methods for
 * password verification.
 *
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * User's full name
     * @type {String}
     * @required
     * @trim
     * @minlength 2
     * @maxlength 50
     * @example "John Doe"
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be less than 50 characters'],
      validate: {
        validator: function(v) {
          // Name should not contain only numbers
          return !/^\d+$/.test(v);
        },
        message: 'Name cannot contain only numbers'
      }
    },

    /**
     * User's email address
     * @type {String}
     * @required
     * @unique
     * @lowercase
     * @example "john.doe@example.com"
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      maxlength: [254, 'Email address is too long']
    },

    /**
     * User's password (hashed)
     * @type {String}
     * @required
     * @minlength 6
     * @maxlength 128
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      maxlength: [128, 'Password must be less than 128 characters']
    }
  },
  {
    /**
     * Enable automatic timestamps
     * Adds createdAt and updatedAt fields
     */
    timestamps: true
  }
);

/**
 * Pre-save middleware: Hash password before saving
 *
 * Automatically hashes the password using bcrypt before saving the user document.
 * Only runs if the password field has been modified.
 *
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
userSchema.pre('save', async function() {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) return;

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
});

/**
 * Instance method: Match entered password against stored hash
 *
 * Compares a plain text password with the hashed password stored in the database.
 * Used during user authentication/login.
 *
 * @param {string} enteredPassword - Plain text password to verify
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 *
 * @example
 * ```javascript
 * const user = await User.findOne({ email: 'user@example.com' });
 * const isValid = await user.matchPassword('userpassword');
 * ```
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * User Model
 *
 * The compiled Mongoose model for User documents.
 * Provides database operations and schema validation.
 *
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('User', userSchema);
