const { analyzeMatchWithOllama } = require('./ai.service');
const { analyzeIndustryBenchmark } = require('./benchmark.service');
const { pushAndRank } = require('./percentile.service');

const stopwords = new Set([
  'and', 'or', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'with', 'by', 'from',
  'that', 'this', 'is', 'are', 'as', 'at', 'be', 'have', 'has', 'had', 'will', 'would',
  'should', 'can', 'may', 'must', 'if', 'else', 'about', 'it', 'its', 'which', 'their'
]);

const impactWords = [
  'increased', 'decreased', 'improved', 'optimized', 'scaled', 'built', 'launched',
  'spearheaded', 'accelerated', 'generated', 'created', 'delivered', 'reduced', 'saved',
  'automated', 'streamlined', 'transformed', 'expanded', 'negotiated', 'led', 'architected'
];

const projectDepthIndicators = [
  'architected', 'designed', 'launched', 'scaled', 'automated', 'optimized', 'integrated',
  'migrated', 'orchestrated', 'modeled', 'analyzed', 'built', 'deployed', 'mentored', 'owned'
];

const genericBuzzwords = [
  'hardworking', 'team player', 'detail-oriented', 'self-motivated', 'self starter',
  'fast learner', 'good communication', 'excellent communication', 'results-driven',
  'problem solver', 'responsible for', 'worked on', 'helped', 'assisted', 'tasked with'
];

const genericCrudPhrases = [
  'crud', 'basic operations', 'simple application', 'maintenance', 'support', 'daily tasks',
  'assisting with', 'working with', 'helping with', 'supporting the team'
];

const advancedProjectIndicators = [
  'jwt', 'oauth', 'authentication', 'authorization', 'api integration', 'rest api', 'graphql',
  'microservices', 'docker', 'kubernetes', 'ci/cd', 'load balancing', 'caching', 'cloud',
  'scaling', 'performance optimization', 'monitoring', 'logging', 'security', 'production',
  'deployment', 'multi-tenant', 'distributed', 'third-party api', 'real-world', 'customer-facing'
];

const aiToneIndicators = [
  'proven track record', 'passionate', 'experienced', 'results-driven', 'highly motivated',
  'detail oriented', 'excellent communication', 'team player', 'strong work ethic',
  'fast learner', 'self starter', 'innovative', 'strategic thinker', 'driven', 'passion for'
];

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

function extractContactInfo(text) {
  const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const phone = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b/.test(text);
  return { email, phone, contactFound: email || phone };
}

function findSections(text) {
  const headers = [
    'experience', 'work experience', 'professional experience', 'education', 'skills',
    'projects', 'certifications', 'summary', 'objective', 'achievements', 'technical skills'
  ];
  return headers.filter((header) => text.includes(header));
}

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce((count, pattern) => {
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const found = lower.match(regex);
    return count + (found ? found.length : 0);
  }, 0);
}

function computeAiToneAnalysis(text) {
  const normalized = normalize(text);
  const sentenceList = splitSentences(text);
  const longSentenceCount = sentenceList.filter((sentence) => sentence.trim().split(/\s+/).length >= 28).length;
  const aiToneCount = countMatches(normalized, aiToneIndicators);
  const genericPhraseCount = countMatches(normalized, genericBuzzwords.concat(genericCrudPhrases));

  const confidence = Math.min(100, Math.max(0,
    20 + aiToneCount * 12 + genericPhraseCount * 8 + longSentenceCount * 7
  ));

  const label = confidence >= 55
    ? `Resume sounds AI-generated (${confidence}% confidence)`
    : `Resume sounds human-like (${confidence}% confidence)`;

  const suggestions = [];
  if (aiToneCount > 0) suggestions.push('Reduce AI-style buzzwords and template phrases.');
  if (genericPhraseCount > 0) suggestions.push('Replace generic descriptions with concrete results.');
  if (longSentenceCount > 0) suggestions.push('Shorten overly polished sentences.');
  if (suggestions.length === 0) suggestions.push('Add more personalized details.');

  return { confidence, label, suggestions };
}

function tokenize(text) {
  return (text.match(/\b[a-zA-Z0-9+#.+-]{2,}\b/g) || [])
    .map((token) => token.toLowerCase())
    .filter((token) => !stopwords.has(token));
}

function unique(array) {
  return Array.from(new Set(array));
}

function extractCandidateSkills(text, limit = 40) {
  const tokens = tokenize(normalize(text));
  const frequency = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}

function intersection(a, b) {
  const setB = new Set(b);
  return a.filter((item) => setB.has(item));
}

function difference(a, b) {
  const setB = new Set(b);
  return a.filter((item) => !setB.has(item));
}

function extractNumericHighlights(text) {
  const matches = text.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
  return matches.length;
}

/**
 * Consolidated Reality Check Score
 * Integrates: Hiring Signals, Project Depth, and ATS Parsing logic
 */
function computeRealityCheck(text) {
  const normalized = normalize(text);
  
  // 1. Hiring Signals (Impact & Metrics)
  const impactCount = countMatches(normalized, impactWords);
  const numberCount = extractNumericHighlights(normalized);
  const buzzwordCount = countMatches(normalized, genericBuzzwords);
  const genericPhraseCount = countMatches(normalized, genericCrudPhrases);
  
  // 2. Technical Depth (Advanced indicators)
  const depthCount = countMatches(normalized, projectDepthIndicators);
  const advancedCount = countMatches(normalized, advancedProjectIndicators);
  
  // 3. ATS Structure
  const contact = extractContactInfo(text);
  const sections = findSections(normalized);
  const keywordCount = unique(tokenize(normalized)).length;

  // Scoring Logic
  const impactScore = Math.min(30, impactCount * 8);
  const numberScore = Math.min(20, numberCount * 6);
  const depthScore = Math.min(25, depthCount * 8 + advancedCount * 4);
  const atsScore = Math.min(25, (contact.contactFound ? 10 : 0) + (sections.length * 3));
  
  const penalties = Math.min(30, buzzwordCount * 5 + genericPhraseCount * 5);
  
  let rawScore = impactScore + numberScore + depthScore + atsScore - penalties;
  rawScore = Math.max(0, Math.min(100, rawScore));

  const label = rawScore >= 65 ? '✅ Strong hiring potential' : rawScore >= 40 ? '⚠️ Moderate screening risk' : '❌ High rejection probability';

  const reasons = [];
  if (impactCount > 2) reasons.push('Strong use of action-oriented impact language.');
  if (numberCount > 1) reasons.push('Quantifiable metrics found (shows results-driven mindset).');
  if (depthCount > 2) reasons.push('Project descriptions show good technical ownership.');
  if (advancedCount > 1) reasons.push('Advanced technologies (Auth/Scaling/APIs) detected.');
  if (!contact.contactFound) reasons.push('Contact information (email/phone) is missing or unparseable.');
  if (sections.length < 4) reasons.push('Resume structure is missing standard professional sections.');
  if (buzzwordCount > 3) reasons.push('Overuse of generic buzzwords detected.');

  return {
    score: rawScore,
    label,
    reasons,
    details: {
      impactCount,
      numberCount,
      depthCount,
      atsCompatible: sections.length >= 5 && contact.contactFound,
      scanTime: 6.0 + (sections.length * 0.2)
    }
  };
}

async function analyzeResumeMatch({ resumeText, jobDescription, jobTitle, targetSkills = [] }) {
  const normalizedResume = normalize(resumeText);
  const normalizedJD = normalize(jobDescription);

  const jdSkills = targetSkills.length
    ? unique(targetSkills.map((skill) => normalize(skill)))
    : extractCandidateSkills(normalizedJD, 30);

  const resumeTokens = unique(tokenize(normalizedResume));
  const matchedSkills = intersection(jdSkills, resumeTokens);
  const skillGaps = difference(jdSkills, matchedSkills);

  const skillCoverage = jdSkills.length ? matchedSkills.length / jdSkills.length : 0;
  const keywordOverlap = unique(tokenize(normalizedJD)).filter((token) => resumeTokens.includes(token)).length;
  const keywordCoverage = normalizedJD ? keywordOverlap / unique(tokenize(normalizedJD)).length : 0;

  const matchScore = Math.round(((skillCoverage * 0.7) + (keywordCoverage * 0.3)) * 100);
  const realityCheck = computeRealityCheck(resumeText);
  const aiToneAnalysis = computeAiToneAnalysis(resumeText);

  let aiResult = {
    aiMatchScore: matchScore,
    summary: 'AI analysis result',
    recommendations: [],
    rewriteSuggestions: [],
    learningRoadmap: [],
    interviewPreparation: [],
    mockInterviewQuestions: []
  };

  try {
    const aiResponse = await analyzeMatchWithOllama({ 
      resumeText: normalizedResume, 
      jobDescription: normalizedJD, 
      jobTitle, 
      targetSkills: jdSkills 
    });
    aiResult = { ...aiResult, ...aiResponse };
  } catch (error) {
    // Fallback to heuristics
  }

  const finalJobMatchScore = aiResult.aiMatchScore || matchScore;
  const finalReadinessScore = Math.round((finalJobMatchScore + realityCheck.score) / 2);
  const finalAuthScore = 100 - (aiResult.aiToneScore || aiToneAnalysis.confidence);

  // --- ML Feature 1: Industry Benchmark (TF-IDF + Cosine Similarity) ---
  let benchmarkResult = null;
  try {
    benchmarkResult = analyzeIndustryBenchmark(resumeText);
  } catch (e) {
    console.warn('Benchmark ML failed (non-fatal):', e.message);
  }

  // --- ML Feature 2: Percentile Ranking (MongoDB aggregation) ---
  let percentileRank = null;
  try {
    percentileRank = await pushAndRank({
      jobTitle: jobTitle || (benchmarkResult?.detectedRole) || 'general',
      readinessScore: finalReadinessScore,
      jobMatchScore: finalJobMatchScore,
      realityScore: realityCheck.score,
      authenticityScore: finalAuthScore
    });
  } catch (e) {
    console.warn('Percentile ML failed (non-fatal):', e.message);
  }

  return {
    jobMatchScore: finalJobMatchScore,
    readinessScore: finalReadinessScore,
    matchedSkills: aiResult.matchedSkills || matchedSkills,
    skillGaps: aiResult.skillGaps || skillGaps,
    summary: aiResult.summary,
    recommendations: aiResult.recommendations,
    rewriteSuggestions: aiResult.rewriteSuggestions,
    realityCheck,
    aiToneAnalysis: {
      ...aiToneAnalysis,
      confidence: aiResult.aiToneScore || aiToneAnalysis.confidence,
      label: aiResult.aiToneLabel || aiToneAnalysis.label,
      suggestions: aiResult.humanizationSuggestions || aiToneAnalysis.suggestions
    },
    learningRoadmap: aiResult.learningRoadmap || [],
    interviewPreparation: aiResult.interviewPreparation || [],
    mockInterviewQuestions: aiResult.mockInterviewQuestions || [],
    // ML features
    industryBenchmark: benchmarkResult,
    percentileRank
  };
}

module.exports = {
  analyzeResumeMatch
};