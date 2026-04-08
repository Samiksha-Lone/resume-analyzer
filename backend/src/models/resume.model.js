/**
 * Resume Model
 *
 * Defines the MongoDB schema for resume documents in the Resume Analyzer application.
 * Stores resume metadata, extracted text content, and analysis results.
 *
 * Schema Fields:
 * - userId: Reference to the user who owns the resume
 * - originalName: Original filename of uploaded resume
 * - filename: Stored filename (may be modified)
 * - mimeType: File MIME type (PDF, DOCX, etc.)
 * - size: File size in bytes
 * - source: Upload source (default: 'upload')
 * - extractedText: Full text content extracted from the resume
 * - fileUrl: URL to access the stored file
 * - storageId: Storage service identifier
 * - status: Processing status (pending, parsed, analyzed)
 * - analysis: Analysis results and scores
 * - timestamps: createdAt and updatedAt automatically managed
 *
 * @module models/resume
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Resume Schema Definition
 *
 * Defines the structure for resume documents including file metadata,
 * extracted content, and analysis results.
 *
 * @type {mongoose.Schema}
 */
const resumeSchema = new mongoose.Schema(
  {
    /**
     * Reference to the user who owns this resume
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref 'User'
     * @required
     * @index
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    /**
     * Original filename as uploaded by user
     * @type {String}
     * @required
     * @example "John_Doe_Resume.pdf"
     */
    originalName: {
      type: String,
      required: true
    },

    /**
     * Current filename in storage (may include timestamp/uuid)
     * @type {String}
     * @required
     */
    filename: {
      type: String,
      required: true
    },

    /**
     * MIME type of the uploaded file
     * @type {String}
     * @required
     * @enum ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
     * @example "application/pdf"
     */
    mimeType: {
      type: String,
      required: true
    },

    /**
     * File size in bytes
     * @type {Number}
     * @required
     * @min 1
     */
    size: {
      type: Number,
      required: true,
      min: [1, 'File size must be greater than 0']
    },

    /**
     * Source of the resume upload
     * @type {String}
     * @default 'upload'
     * @example "upload", "linkedin", "api"
     */
    source: {
      type: String,
      default: 'upload'
    },

    /**
     * Full text content extracted from the resume file
     * Used for analysis and matching algorithms
     * @type {String}
     * @required
     */
    extractedText: {
      type: String,
      required: true
    },

    /**
     * Public URL to access the stored resume file
     * @type {String}
     * @example "https://storage.example.com/resumes/123.pdf"
     */
    fileUrl: {
      type: String
    },

    /**
     * Storage service identifier for the file
     * Used for file management and deletion
     * @type {String}
     */
    storageId: {
      type: String
    },

    /**
     * Processing status of the resume
     * @type {String}
     * @enum ['pending', 'parsed', 'analyzed']
     * @default 'parsed'
     */
    status: {
      type: String,
      enum: ['pending', 'parsed', 'analyzed'],
      default: 'parsed'
    },

    /**
     * Analysis results and scoring data
     * Stored as flexible object to accommodate various analysis types
     * @type {mongoose.Schema.Types.Mixed}
     * @default {}
     */
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
 * Resume Model
 *
 * The compiled Mongoose model for Resume documents.
 * Provides database operations for resume management.
 *
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Resume', resumeSchema);
