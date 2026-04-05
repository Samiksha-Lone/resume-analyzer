const AnalysisHistory = require('../models/history.model');

/**
 * Save a snapshot of an analysis result to history.
 */
async function saveSnapshot({ userId, resumeId, resumeName, jobTitle, analysis }) {
  const readinessScore = analysis.readinessScore || 0;
  const jobMatchScore = analysis.jobMatchScore || 0;
  const realityScore = analysis.realityCheck?.score || 0;
  const authenticityScore = 100 - (analysis.aiToneAnalysis?.confidence || 0);

  return AnalysisHistory.create({
    userId,
    resumeId,
    resumeName: resumeName || 'Resume',
    jobTitle: jobTitle || '',
    scores: { readinessScore, jobMatchScore, realityScore, authenticityScore },
    snapshot: analysis
  });
}

/**
 * Get all analysis history entries for a user, newest first.
 */
async function getUserHistory(userId) {
  return AnalysisHistory.find({ userId })
    .sort({ createdAt: -1 })
    .select('resumeId resumeName jobTitle scores createdAt')
    .lean();
}

/**
 * Get two specific history entries by ID and compute score deltas.
 */
async function compareSnapshots(id1, id2, userId) {
  const [a, b] = await Promise.all([
    AnalysisHistory.findOne({ _id: id1, userId }).lean(),
    AnalysisHistory.findOne({ _id: id2, userId }).lean()
  ]);

  if (!a || !b) return null;

  // a = newer/current, b = older/baseline
  const delta = {
    readinessScore: (a.scores.readinessScore - b.scores.readinessScore),
    jobMatchScore: (a.scores.jobMatchScore - b.scores.jobMatchScore),
    realityScore: (a.scores.realityScore - b.scores.realityScore),
    authenticityScore: (a.scores.authenticityScore - b.scores.authenticityScore)
  };

  return { current: a, baseline: b, delta };
}

/**
 * Delete all history entries older than 30 days (optional cleanup).
 */
async function cleanupOldHistory(userId, keepCount = 20) {
  const entries = await AnalysisHistory.find({ userId })
    .sort({ createdAt: -1 })
    .select('_id')
    .lean();

  if (entries.length > keepCount) {
    const toDelete = entries.slice(keepCount).map(e => e._id);
    await AnalysisHistory.deleteMany({ _id: { $in: toDelete } });
  }
}

module.exports = { saveSnapshot, getUserHistory, compareSnapshots, cleanupOldHistory };
