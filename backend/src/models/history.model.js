const mongoose = require('mongoose');

/**
 * AnalysisHistory — stores a snapshot of every completed analysis for a user.
 * Enables version comparison and score history tracking.
 */
const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    resumeName: { type: String, default: 'Resume' },
    jobTitle: { type: String, default: '' },
    scores: {
      readinessScore: { type: Number, default: 0 },
      jobMatchScore: { type: Number, default: 0 },
      realityScore: { type: Number, default: 0 },
      authenticityScore: { type: Number, default: 0 }
    },
    // Full analysis snapshot (for comparison view)
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalysisHistory', historySchema);
