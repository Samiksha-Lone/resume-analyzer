const { analyzeMatchWithOllama } = require('./ai.service');
const { computeAtsCompatibility } = require('./ats.service');
const { fetchGithubRepos, verifySkillsAgainstGithub } = require('./github.service');

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
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
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
  if (aiToneCount > 0) {
    suggestions.push('Reduce AI-style buzzwords and template phrases; make each bullet feel specific to your work.');
  }
  if (genericPhraseCount > 0) {
    suggestions.push('Replace generic descriptions with concrete results or technologies used in your project.');
  }
  if (longSentenceCount > 0) {
    suggestions.push('Shorten overly polished sentences into concise resume bullets.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Add more personalized details about the actual impact and scope of your work.');
  }

  return {
    confidence,
    label,
    aiToneCount,
    genericPhraseCount,
    longSentenceCount,
    suggestions
  };
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

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce((count, pattern) => {
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const found = lower.match(regex);
    return count + (found ? found.length : 0);
  }, 0);
}

function extractNumericHighlights(text) {
  const matches = text.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
  return matches.length;
}

function computeProjectDepthAnalysis(text) {
  const normalized = normalize(text);
  const projectDepthCount = countMatches(normalized, projectDepthIndicators);
  const advancedCount = countMatches(normalized, advancedProjectIndicators);
  const apiCount = countMatches(normalized, [
    'api integration', 'rest api', 'graphql', 'third-party api', 'api', 'integration'
  ]);
  const authCount = countMatches(normalized, [
    'jwt', 'oauth', 'authentication', 'authorization', 'secure login', 'identity', 'access control'
  ]);
  const scalingCount = countMatches(normalized, [
    'scaling', 'scalable', 'load balancing', 'performance optimization', 'distributed', 'cloud',
    'deployment', 'production', 'high availability', 'monitoring', 'caching'
  ]);
  const crudPhraseCount = countMatches(normalized, genericCrudPhrases);

  const score = Math.max(0, Math.min(100,
    projectDepthCount * 12 + advancedCount * 7 + apiCount * 5 + authCount * 6 + scalingCount * 6 - crudPhraseCount * 8
  ));

  const label = score >= 55
    ? 'Project descriptions show good technical depth'
    : 'Project descriptions are likely too shallow or CRUD-focused';

  const suggestions = [];
  if (crudPhraseCount > 0 && advancedCount === 0) {
    suggestions.push('Add JWT authentication implementation or OAuth details for a stronger technical narrative.');
  }
  if (apiCount === 0) {
    suggestions.push('Mention API integration, REST/GraphQL work, or external service orchestration.');
  }
  if (authCount === 0) {
    suggestions.push('Include authentication/authorization design decisions and security patterns.');
  }
  if (scalingCount === 0) {
    suggestions.push('Mention performance optimization strategies, deployment, or scaling considerations.');
  }
  if (projectDepthCount === 0) {
    suggestions.push('Emphasize real-world complexity by describing data flow, system architecture, or production readiness.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Continue highlighting integration, security, and scaling details in project descriptions.');
  }

  return {
    score,
    label,
    projectDepthCount,
    advancedCount,
    apiCount,
    authCount,
    scalingCount,
    crudPhraseCount,
    suggestions
  };
}

function computeRealityCheck(text) {
  const normalized = normalize(text);
  const impactCount = countMatches(normalized, impactWords);
  const depthCount = countMatches(normalized, projectDepthIndicators);
  const buzzwordCount = countMatches(normalized, genericBuzzwords);
  const genericPhraseCount = countMatches(normalized, genericCrudPhrases);
  const numberCount = extractNumericHighlights(normalized);

  const impactScore = Math.min(40, impactCount * 10);
  const numberScore = Math.min(25, numberCount * 8);
  const depthScore = Math.min(30, depthCount * 10);

  const genericPenalty = Math.min(40, buzzwordCount * 8 + genericPhraseCount * 6);
  const weaknessPenalty = normalized.includes('responsible for') || normalized.includes('worked on') ? 8 : 0;

  let rawScore = impactScore + numberScore + depthScore - genericPenalty - weaknessPenalty;
  rawScore = Math.max(0, Math.min(100, rawScore));

  const label = rawScore >= 60
    ? '✅ Likely to pass screening'
    : '⚠️ High chance of rejection';

  const reasons = [];
  if (impactCount > 0) reasons.push(`Impact language found (${impactCount})`);
  if (numberCount > 0) reasons.push(`Numbers/metrics present (${numberCount})`);
  if (depthCount > 0) reasons.push(`Project depth indicators found (${depthCount})`);
  if (buzzwordCount > 0) reasons.push(`Buzzwords penalized (${buzzwordCount})`);
  if (genericPhraseCount > 0) reasons.push(`Generic phrasing detected (${genericPhraseCount})`);
  if (reasons.length === 0) reasons.push('No strong impact signals detected.');

  return {
    score: rawScore,
    label,
    impactCount,
    numberCount,
    depthCount,
    buzzwordCount,
    genericPhraseCount,
    reasons
  };
}

async function analyzeResumeMatch({ resumeText, jobDescription, jobTitle, targetSkills = [], githubUsername }) {
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

  const baseScore = Math.round(((skillCoverage * 0.7) + (keywordCoverage * 0.3)) * 100);
  const realityCheck = computeRealityCheck(resumeText);
  const projectDepthAnalysis = computeProjectDepthAnalysis(resumeText);
  const atsAnalysis = computeAtsCompatibility(resumeText);

  let aiResult = {
    aiMatchScore: 0,
    matchedSkills,
    skillGaps,
    recommendations: [],
    summary: 'AI analysis unavailable.',
    rewriteSuggestions: [],
    projectDepthRecommendations: [],
    aiToneScore: 0,
    aiToneLabel: 'Human-tone analysis unavailable.',
    humanizationSuggestions: []
  };

  try {
    aiResult = await analyzeMatchWithOllama({ resumeText: normalizedResume, jobDescription: normalizedJD, jobTitle, targetSkills: jdSkills });
  } catch (error) {
    // AI fallback: keep heuristics and continue
  }

  const aiToneAnalysis = computeAiToneAnalysis(resumeText);
  
  let githubVerification = null;
  if (githubUsername) {
    const githubData = await fetchGithubRepos(githubUsername);
    if (githubData) {
      githubVerification = verifySkillsAgainstGithub(matchedSkills, githubData);
    }
  }

  return {
    baseScore,
    aiScore: aiResult.aiMatchScore,
    matchedSkills: aiResult.matchedSkills || matchedSkills,
    skillGaps: aiResult.skillGaps || skillGaps,
    recommendations: aiResult.recommendations || [],
    summary: aiResult.summary || '',
    rewriteSuggestions: aiResult.rewriteSuggestions || [],
    projectDepthRecommendations: aiResult.projectDepthRecommendations || projectDepthAnalysis.suggestions,
    projectDepthAnalysis,
    aiToneAnalysis: {
      confidence: aiResult.aiToneScore || aiToneAnalysis.confidence,
      label: aiResult.aiToneLabel || aiToneAnalysis.label,
      suggestions: aiResult.humanizationSuggestions || aiToneAnalysis.suggestions,
      aiToneCount: aiToneAnalysis.aiToneCount,
      genericPhraseCount: aiToneAnalysis.genericPhraseCount,
      longSentenceCount: aiToneAnalysis.longSentenceCount
    },
    realityCheck,
    atsAnalysis,
    githubVerification,
    rawAi: aiResult
  };
}

function compareResumes(analysisA, analysisB) {
  const scoreA = analysisA.aiScore || analysisA.baseScore || 0;
  const scoreB = analysisB.aiScore || analysisB.baseScore || 0;
  const matchedA = Array.isArray(analysisA.matchedSkills) ? analysisA.matchedSkills : [];
  const matchedB = Array.isArray(analysisB.matchedSkills) ? analysisB.matchedSkills : [];

  return {
    scoreDelta: scoreB - scoreA,
    skillsDelta: {
      added: matchedB.filter(s => !matchedA.includes(s)),
      removed: matchedA.filter(s => !matchedB.includes(s)),
    },
    realityCheckDelta: {
      scoreDelta: (analysisB.realityCheck?.score || 0) - (analysisA.realityCheck?.score || 0),
      labelChange: analysisA.realityCheck?.label !== analysisB.realityCheck?.label
    },
    betterVersion: scoreB > scoreA ? 'B' : scoreA > scoreB ? 'A' : 'Equal',
    rationale: scoreB > scoreA 
      ? 'Version B has better alignment with job requirements and higher impact scores.' 
      : scoreA > scoreB 
        ? 'Version A maintains stronger technical depth and keyword coverage.'
        : 'Both versions perform similarly across key metrics.'
  };
}

module.exports = {
  analyzeResumeMatch,
  compareResumes
};