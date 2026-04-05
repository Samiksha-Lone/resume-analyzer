const ScorePool = require('../models/scorepool.model');

// Realistic synthetic score distributions per role (bootstrapped on first run)
const SEED_DATA_BY_ROLE = {
  'frontend developer': { readinessMean: 52, matchMean: 55, realityMean: 48, authMean: 62 },
  'backend developer': { readinessMean: 54, matchMean: 57, realityMean: 50, authMean: 64 },
  'full stack developer': { readinessMean: 50, matchMean: 53, realityMean: 46, authMean: 60 },
  'data scientist': { readinessMean: 56, matchMean: 60, realityMean: 52, authMean: 66 },
  'machine learning engineer': { readinessMean: 55, matchMean: 58, realityMean: 51, authMean: 63 },
  'devops engineer': { readinessMean: 53, matchMean: 56, realityMean: 49, authMean: 65 },
  'general': { readinessMean: 51, matchMean: 54, realityMean: 47, authMean: 61 }
};

// Normal distribution random sample (Box-Muller)
function gaussianRandom(mean, stdDev) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, Math.min(100, Math.round(mean + z * stdDev)));
}

/**
 * Seeds score pool with synthetic entries for a role if not already seeded.
 * @param {string} roleName
 */
async function ensureSeeded(roleName) {
  const existing = await ScorePool.countDocuments({ jobTitle: roleName, isSeeded: true });
  if (existing >= 150) return; // Already seeded

  const dist = SEED_DATA_BY_ROLE[roleName] || SEED_DATA_BY_ROLE['general'];
  const docs = [];

  for (let i = 0; i < 200; i++) {
    docs.push({
      jobTitle: roleName,
      readinessScore: gaussianRandom(dist.readinessMean, 14),
      jobMatchScore: gaussianRandom(dist.matchMean, 16),
      realityScore: gaussianRandom(dist.realityMean, 13),
      authenticityScore: gaussianRandom(dist.authMean, 15),
      isSeeded: true
    });
  }

  await ScorePool.insertMany(docs, { ordered: false }).catch(() => {
    // Ignore duplicate errors during concurrent seeding
  });
}

/**
 * Normalizes a job title string to a known role key.
 * @param {string} rawTitle
 * @returns {string}
 */
function normalizeRole(rawTitle) {
  if (!rawTitle) return 'general';
  const lower = rawTitle.toLowerCase();

  if (lower.includes('frontend') || lower.includes('front-end') || lower.includes('front end')) return 'frontend developer';
  if (lower.includes('backend') || lower.includes('back-end') || lower.includes('back end')) return 'backend developer';
  if (lower.includes('full stack') || lower.includes('fullstack')) return 'full stack developer';
  if (lower.includes('data scientist')) return 'data scientist';
  if (lower.includes('machine learning') || lower.includes('ml engineer')) return 'machine learning engineer';
  if (lower.includes('devops') || lower.includes('dev ops') || lower.includes('sre')) return 'devops engineer';
  if (lower.includes('react')) return 'frontend developer';
  if (lower.includes('node') || lower.includes('python developer')) return 'backend developer';
  if (lower.includes('data engineer')) return 'data scientist';
  if (lower.includes('android') || lower.includes('ios') || lower.includes('mobile')) return 'general';

  return 'general';
}

/**
 * Pushes a new score entry to the pool and returns the user's percentile rank.
 * @param {Object} params
 * @returns {Promise<Object>} percentile breakdown
 */
async function pushAndRank({ jobTitle, readinessScore, jobMatchScore, realityScore, authenticityScore }) {
  const role = normalizeRole(jobTitle);

  // Ensure pool is seeded for this role
  await ensureSeeded(role);

  // Insert the new real score
  await ScorePool.create({
    jobTitle: role,
    readinessScore,
    jobMatchScore,
    realityScore,
    authenticityScore,
    isSeeded: false
  });

  // Compute percentile rankings via aggregation
  const [result] = await ScorePool.aggregate([
    { $match: { jobTitle: role } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        belowReadiness: { $sum: { $cond: [{ $lt: ['$readinessScore', readinessScore] }, 1, 0] } },
        belowMatch: { $sum: { $cond: [{ $lt: ['$jobMatchScore', jobMatchScore] }, 1, 0] } },
        belowReality: { $sum: { $cond: [{ $lt: ['$realityScore', realityScore] }, 1, 0] } },
        belowAuth: { $sum: { $cond: [{ $lt: ['$authenticityScore', authenticityScore] }, 1, 0] } }
      }
    }
  ]);

  if (!result || result.totalCount < 2) {
    return { role, readinessPercentile: 50, matchPercentile: 50, realityPercentile: 50, authPercentile: 50, totalCandidates: 1 };
  }

  const pct = (below) => Math.round((below / result.totalCount) * 100);

  return {
    role,
    readinessPercentile: pct(result.belowReadiness),
    matchPercentile: pct(result.belowMatch),
    realityPercentile: pct(result.belowReality),
    authPercentile: pct(result.belowAuth),
    totalCandidates: result.totalCount
  };
}

module.exports = { pushAndRank, normalizeRole };
