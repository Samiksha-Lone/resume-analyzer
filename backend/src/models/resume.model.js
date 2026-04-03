const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      default: 'upload'
    },
    extractedText: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String
    },
    storageId: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'parsed', 'analyzed'],
      default: 'parsed'
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', resumeSchema);