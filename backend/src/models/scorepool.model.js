const mongoose = require('mongoose');

/**
 * ScorePool — aggregates anonymized scores for percentile ranking.
 * One document per analysis across all users (privacy: no PII stored).
 */
const scorepoolSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, default: 'general', index: true },
    readinessScore: { type: Number, required: true },
    jobMatchScore: { type: Number, required: true },
    realityScore: { type: Number, required: true },
    authenticityScore: { type: Number, required: true },
    isSeeded: { type: Boolean, default: false } // true = synthetic bootstrap entry
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScorePool', scorepoolSchema);
