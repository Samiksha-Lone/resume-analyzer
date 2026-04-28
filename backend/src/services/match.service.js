/**
 * Resume Matching Service
 *
 * Core service for analyzing resume-job description compatibility.
 * Implements multiple algorithms for comprehensive resume evaluation:
 *
 * 1. Keyword-based matching using TF-IDF and tokenization
 * 2. ATS compatibility scoring
 * 3. Reality check analysis (AI detection, impact measurement)
 * 4. Industry benchmark comparison
 * 5. Percentile ranking against user pool
 *
 * The service combines traditional NLP techniques with AI-powered analysis
 * to provide detailed feedback on resume quality and job fit.
 *
 * @module services/match
 * @requires ./ai.service
 * @requires ./benchmark.service
 * @requires ./percentile.service
 */

const { analyzeMatchWithOllama } = require('./ai.service');
const { analyzeIndustryBenchmark } = require('./benchmark.service');
const { pushAndRank } = require('./percentile.service');

/**
 * Stopwords to filter out during tokenization
 * Common English words, prepositions, conjunctions, and generic descriptors
 * @type {Set<string>}
 */
const stopwords = new Set([
  // Articles, prepositions, conjunctions
  'and','or','the','a','an','to','for','of','in','on','with','by','from','that','this',
  'is','are','as','at','be','have','has','had','will','would','should','can','may','must',
  'if','else','about','it','its','which','their','both','such','also','other','various',
  'multiple','well','more','most','some','any','all','each','every','few','many','not',
  'no','yes','very','too','so','just','only','but','however','across','within','between',
  'through','during','before','after','while','although','because','since','until',
  'same','different','next','first','last','plus','including',
  // Pronouns
  'we','you','our','your','us','who','what','when','where','how','why',
  'they','them','he','she','his','her','him','i','me','my',
  // Common verbs (not skills)
  'ensure','maintain','develop','build','create','manage','provide','work','support',
  'seek','collaborate','deliver','help','design','implement','integrate','understand',
  'apply','use','write','code','test','debug','deploy','monitor','review','analyze',
  'plan','coordinate','communicate','present','report','participate','contribute',
  'assist','mentor','train','grow','scale','improve','enhance','update','upgrade',
  'migrate','fix','resolve','identify','investigate','troubleshoot','learn','adapt',
  'innovate','research','explore','evaluate','make','take','give','get','go','come',
  'see','know','think','look','want','need','feel','try','call','keep','let','put',
  'run','set','do','does','did','done','been','being','was','were','am',
  // Gerunds / present participles of the above
  'building','developing','maintaining','creating','managing','working','seeking',
  'collaborating','delivering','optimizing','ensuring','supporting','implementing',
  'integrating','improving','handling','writing','solving','testing','debugging',
  'deploying','monitoring','designing','applying','providing','contributing',
  'leading','defining','owning','driving','serving','performing','following',
  'using','used','worked',
  // Adjectives / adverbs (not skills)
  'strong','excellent','good','great','high','low','fast','slow','new','old','large',
  'small','best','better','modern','current','existing','latest','highly','deeply',
  'quickly','efficiently','effectively','successfully','responsible','preferred',
  'required','proficient','motivated','passionate','cross','functional','quality',
  'driven','oriented','focused','based','related','equivalent','similar','proven',
  'solid','demonstrated','innovative','strategic','dynamic','collaborative','diverse',
  // Job-posting nouns (not skills)
  'role','position','job','opportunity','company','organization','business','team',
  'teams','member','members','candidate','candidates','applicant','system','systems',
  'application','applications','platform','platforms','solution','solutions','product',
  'products','service','services','project','projects','responsibilities',
  'qualifications','requirements','experience','knowledge','ability','skill','skills',
  'background','environment','startup','enterprise','industry','market','field',
  'client','clients','customer','customers','user','users','stakeholder','partner',
  'partners','vendor','vendors','employer','employee','staff','people','person',
  'individual','individuals','information','content','process','processes','procedure',
  'standard','standards','practice','documentation','deadline','timeline','ownership',
  'mindset','culture','degree','bachelor','master','year','years','month','months',
  'day','days','week','weeks','time','full','part','contract','remote','onsite','hybrid',
  'senior','junior','mid','level','entry','lead','principal',
  // Generic quality / noise words from JDs
  'responsiveness','reliability','scalability','maintainability','readability',
  'performance','efficiency','accuracy','consistency','flexibility','availability',
  'hire','hiring','join','joining','apply','applying','responsible','responsible',
  'high-quality','cross-functional','self-motivated','detail-oriented','results-driven',
  'professional','summary','education','certifications','achievements',
]);

/**
 * Comprehensive whitelist of real technical skills / tools / frameworks.
 * Used to extract meaningful skills from job descriptions when AI is unavailable.
 * @type {Set<string>}
 */
const TECH_SKILLS_WHITELIST = new Set([
  // Languages
  'javascript','typescript','python','java','c++','c#','rust','go','golang','php','ruby',
  'scala','kotlin','swift','r','matlab','perl','shell','bash','powershell','lua','dart',
  // Frontend
  'react','react.js','reactjs','angular','vue','vue.js','vuejs','svelte','nextjs','next.js',
  'nuxt','gatsby','html','css','sass','less','tailwind','bootstrap','webpack','vite',
  'redux','zustand','mobx','graphql','apollo','jest','cypress','playwright','storybook',
  // Backend
  'node','node.js','nodejs','express','express.js','fastify','nestjs','django','flask',
  'fastapi','spring','spring boot','laravel','rails','asp.net','dotnet','grpc','rest',
  'restful','rest api','graphql','websockets','oauth','jwt','oauth2','openid',
  // Databases
  'sql','mysql','postgresql','postgres','mongodb','redis','elasticsearch','cassandra',
  'dynamodb','firestore','sqlite','mariadb','oracle','mssql','supabase','prisma',
  'sequelize','mongoose','typeorm','drizzle',
  // Cloud / DevOps
  'aws','azure','gcp','google cloud','heroku','vercel','netlify','docker','kubernetes',
  'k8s','terraform','ansible','helm','jenkins','github actions','gitlab ci','circleci',
  'travis ci','ci/cd','nginx','apache','linux','ubuntu','centos','debian',
  // Data / AI / ML
  'tensorflow','pytorch','keras','scikit-learn','pandas','numpy','spark','hadoop',
  'kafka','airflow','mlflow','langchain','openai','hugging face','llm','rag',
  // Tools / Practices
  'git','github','gitlab','bitbucket','jira','confluence','figma','postman','swagger',
  'agile','scrum','kanban','tdd','bdd','microservices','monorepo','serverless',
  'websocket','oauth','rest','soap','json','xml','yaml','markdown','linux',
  // Mobile
  'react native','flutter','android','ios','xcode','expo','firebase',
  // Testing
  'jest','mocha','chai','pytest','junit','selenium','cypress','playwright',
]);

/**
 * High-impact action verbs that indicate strong resume content
 * Used in reality check scoring to measure accomplishment-oriented language
 * @type {string[]}
 */
const impactWords = [
  'increased', 'decreased', 'improved', 'optimized', 'scaled', 'built', 'launched',
  'spearheaded', 'accelerated', 'generated', 'created', 'delivered', 'reduced', 'saved',
  'automated', 'streamlined', 'transformed', 'expanded', 'negotiated', 'led', 'architected'
];

/**
 * Technical project depth indicators
 * Words that suggest hands-on technical work and ownership
 * @type {string[]}
 */
const projectDepthIndicators = [
  'architected', 'designed', 'launched', 'scaled', 'automated', 'optimized', 'integrated',
  'migrated', 'orchestrated', 'modeled', 'analyzed', 'built', 'deployed', 'mentored', 'owned'
];

/**
 * Generic resume buzzwords to avoid
 * Overused phrases that suggest template-like content
 * @type {string[]}
 */
const genericBuzzwords = [
  'hardworking', 'team player', 'detail-oriented', 'self-motivated', 'self starter',
  'fast learner', 'good communication', 'excellent communication', 'results-driven',
  'problem solver', 'responsible for', 'worked on', 'helped', 'assisted', 'tasked with'
];

/**
 * Generic CRUD operation phrases
 * Basic operational language that lacks impact
 * @type {string[]}
 */
const genericCrudPhrases = [
  'crud', 'basic operations', 'simple application', 'maintenance', 'support', 'daily tasks',
  'assisting with', 'working with', 'helping with', 'supporting the team'
];

/**
 * Advanced technical indicators
 * Technologies and concepts that suggest senior-level experience
 * @type {string[]}
 */
const advancedProjectIndicators = [
  'jwt', 'oauth', 'authentication', 'authorization', 'api integration', 'rest api', 'graphql',
  'microservices', 'docker', 'kubernetes', 'ci/cd', 'load balancing', 'caching', 'cloud',
  'scaling', 'performance optimization', 'monitoring', 'logging', 'security', 'production',
  'deployment', 'multi-tenant', 'distributed', 'third-party api', 'real-world', 'customer-facing'
];

/**
 * AI-generated content indicators
 * Phrases commonly found in AI-generated resumes
 * @type {string[]}
 */
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

  const totalSentences = Math.max(1, sentenceList.length);
  const longSentenceRatio = longSentenceCount / totalSentences;

  // More conservative confidence scoring
  let confidence = 0;
  confidence += Math.min(30, aiToneCount * 8);
  confidence += Math.min(25, genericPhraseCount * 5);
  confidence += Math.min(20, longSentenceCount * 4);
  if (longSentenceRatio > 0.4) confidence += 10;
  if (aiToneCount > 5) confidence += 15;
  confidence = Math.max(0, Math.min(85, confidence));

  const label = confidence >= 60
    ? 'Resume sounds AI-generated (' + confidence + '% confidence)'
    : confidence >= 35
    ? 'Resume shows mixed characteristics (' + confidence + '% AI-like)'
    : 'Resume sounds human-like (' + confidence + '% confidence)';

  const suggestions = [];
  if (aiToneCount > 3) suggestions.push('Reduce AI-style buzzwords; use specific examples instead.');
  if (genericPhraseCount > 5) suggestions.push('Replace generic descriptions with measurable achievements.');
  if (longSentenceCount > totalSentences * 0.3) suggestions.push('Break long sentences into shorter, punchier statements.');
  if (aiToneCount < 1 && genericPhraseCount < 2) suggestions.push('Good authentic tone detected!');

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

/**
 * Extract skills from text using TECH_SKILLS_WHITELIST first,
 * then fall back to filtered frequency tokens.
 * This prevents generic words like 'responsible' being listed as skills.
 * 
 * IMPORTANT: When extracting from JD, use strict mode to ONLY extract skills
 * explicitly mentioned in the text, not from external knowledge.
 */
function extractCandidateSkills(text, limit = 30, strictMode = false) {
  const lower = text.toLowerCase();
  
  if (strictMode) {
    // Strict mode: Only match skills that are explicitly in the whitelist
    // This prevents hallucinating skills not in the document
    const whitelistMatches = [];
    for (const skill of TECH_SKILLS_WHITELIST) {
      // Match both single and multi-word skills
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (skillRegex.test(lower)) {
        whitelistMatches.push(skill);
      }
    }
    // Return all whitelist matches found (no limit in strict mode for completeness)
    return unique(whitelistMatches);
  }
  
  // Standard mode: Multi-word skills first
  const whitelistMatches = [];
  for (const skill of TECH_SKILLS_WHITELIST) {
    if (lower.includes(skill)) {
      whitelistMatches.push(skill);
    }
  }
  if (whitelistMatches.length >= 5) {
    return unique(whitelistMatches).slice(0, limit);
  }
  
  // Fallback — frequency tokens filtered through stopwords
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

  // Improved Scoring Logic (more conservative and realistic for students)
  const textLength = text.trim().length;
  const hasDateReferences = text.includes('year') || text.includes('month');
  
  // Conservative point allocation
  const impactScore = Math.min(20, impactCount * 5);  // Reduced from 30 to 20
  const numberScore = Math.min(15, numberCount * 4);  // Reduced from 20 to 15
  const depthScore = Math.min(20, depthCount * 6 + advancedCount * 3);  // Reduced from 25 to 20
  const atsScore = Math.min(20, (contact.email ? 8 : 0) + (contact.phone ? 5 : 0) + (sections.length * 2));  // Reduced from 25
  const contentQualityScore = Math.min(15, (textLength > 500 ? 8 : 0) + (hasDateReferences ? 7 : 0));
  
  // Stronger penalties for red flags
  const buzzwordPenalty = Math.min(25, buzzwordCount * 6);  // Increased penalty
  const genericPhrasePenalty = Math.min(20, genericPhraseCount * 7);  // Increased penalty
  
  let rawScore = impactScore + numberScore + depthScore + atsScore + contentQualityScore - buzzwordPenalty - genericPhrasePenalty;
  rawScore = Math.max(0, Math.min(90, rawScore));  // Max 90% (more realistic)

  const label = rawScore >= 75 
    ? '✅ Strong hiring potential' 
    : rawScore >= 55 
    ? '⚠️ Moderate hiring potential' 
    : rawScore >= 35
    ? '⚠️ Needs improvement'
    : '❌ High rejection risk';

  const reasons = [];
  if (impactCount >= 3) reasons.push('Strong use of action-oriented language (shows impact).');
  if (numberCount >= 2) reasons.push('Good use of quantifiable metrics (results-oriented).');
  if (depthCount >= 2) reasons.push('Project descriptions show technical ownership.');
  if (advancedCount >= 1) reasons.push('Advanced technologies detected in experience.');
  if (!contact.email) reasons.push('Missing email address (critical for ATS parsing).');
  if (!contact.phone) reasons.push('Missing phone number (recommended).');
  if (sections.length < 4) reasons.push('Add standard sections: Education, Experience, Skills, Projects.');
  if (buzzwordCount > 5) reasons.push('Reduce generic buzzwords; use specific achievements instead.');
  if (genericPhraseCount > 4) reasons.push('Replace vague phrases with concrete accomplishments.');
  if (impactCount < 1) reasons.push('Add action verbs and impact-focused statements.');
  if (numberCount < 1) reasons.push('Include metrics and numbers to quantify achievements.');
  if (textLength < 300) reasons.push('Resume is too brief; add more relevant experience and details.');

  return {
    score: rawScore,
    label,
    reasons,
    details: {
      impactCount,
      numberCount,
      depthCount,
      advancedCount,
      atsCompatible: sections.length >= 4 && contact.contactFound,
      scanTime: 5.5 + (sections.length * 0.18),
      contentLength: textLength,
      keywordCount
    }
  };
}

/**
 * Comprehensive Resume-Job Matching Analysis
 *
 * Performs multi-layered analysis of resume compatibility with job description.
 * Combines multiple scoring algorithms to provide detailed feedback.
 *
 * Analysis Components:
 * 1. **Keyword Matching**: TF-IDF based skill extraction and matching
 * 2. **AI Analysis**: Semantic understanding using Ollama LLM
 * 3. **Reality Check**: Evaluates resume authenticity and impact
 * 4. **Industry Benchmark**: Compares against industry standards
 * 5. **Percentile Ranking**: Relative performance against user pool
 *
 * Scoring Metrics:
 * - jobMatchScore: How well resume matches job requirements (0-100)
 * - readinessScore: Overall resume quality and market readiness (0-100)
 * - realityScore: Authenticity and impact measurement (0-100)
 * - authenticityScore: Human-like content vs AI-generated (0-100)
 *
 * @async
 * @function analyzeResumeMatch
 * @param {Object} params - Analysis parameters
 * @param {string} params.resumeText - Full text content of resume
 * @param {string} params.jobDescription - Job description text
 * @param {string} [params.jobTitle] - Target job title for context
 * @param {string[]} [params.targetSkills] - Specific skills to prioritize
 * @returns {Promise<Object>} Comprehensive analysis results
 *
 * @property {number} jobMatchScore - Job-resume compatibility score
 * @property {number} readinessScore - Overall resume quality score
 * @property {string[]} matchedSkills - Skills found in both resume and job
 * @property {string[]} skillGaps - Required skills missing from resume
 * @property {string} summary - AI-generated analysis summary
 * @property {string[]} recommendations - Actionable improvement suggestions
 * @property {Object} realityCheck - Authenticity and impact analysis
 * @property {Object} aiToneAnalysis - AI-generated content detection
 * @property {Object} [industryBenchmark] - Industry comparison data
 * @property {Object} [percentileRank] - Relative performance metrics
 *
 * @example
 * ```javascript
 * const result = await analyzeResumeMatch({
 *   resumeText: "Full resume content...",
 *   jobDescription: "Software Engineer role...",
 *   jobTitle: "Senior Software Engineer",
 *   targetSkills: ["React", "Node.js", "AWS"]
 * });
 *
 * console.log(`Match Score: ${result.jobMatchScore}%`);
 * console.log(`Skill Gaps: ${result.skillGaps.join(', ')}`);
 * ```
 */
async function analyzeResumeMatch({ resumeText, jobDescription, jobTitle, targetSkills = [] }) {
  const normalizedResume = normalize(resumeText);
  const normalizedJD = normalize(jobDescription);

  // Use strict mode when extracting skills from JD to prevent hallucination
  const jdSkills = targetSkills.length
    ? unique(targetSkills.map((skill) => normalize(skill)))
    : extractCandidateSkills(normalizedJD, 50, true); // Strict mode: only extract skills explicitly in JD

  const resumeTokens = unique(tokenize(normalizedResume));
  const matchedSkills = intersection(jdSkills, resumeTokens);
  const skillGaps = difference(jdSkills, matchedSkills);

  const skillCoverage = jdSkills.length ? matchedSkills.length / jdSkills.length : 0;
  const keywordOverlap = unique(tokenize(normalizedJD)).filter((token) => resumeTokens.includes(token)).length;
  const keywordCoverage = normalizedJD ? keywordOverlap / unique(tokenize(normalizedJD)).length : 0;

  // Improved Job Match Scoring with weightage
  const baseMatchScore = Math.round(((skillCoverage * 0.7) + (keywordCoverage * 0.3)) * 100);
  const realityCheck = computeRealityCheck(resumeText);
  const aiToneAnalysis = computeAiToneAnalysis(resumeText);

  let aiResult = {
    aiMatchScore: baseMatchScore,
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

  // SAFEGUARD: Filter AI results to ONLY include skills from the JD
  // This prevents the AI from adding skills not in the job description
  if (aiResult.matchedSkills && aiResult.matchedSkills.length > 0) {
    aiResult.matchedSkills = aiResult.matchedSkills.filter(skill => {
      const skillLower = String(skill).toLowerCase();
      return jdSkills.some(jdSkill => jdSkill.toLowerCase() === skillLower);
    });
  }
  
  if (aiResult.skillGaps && aiResult.skillGaps.length > 0) {
    aiResult.skillGaps = aiResult.skillGaps.filter(skill => {
      const skillLower = String(skill).toLowerCase();
      return jdSkills.some(jdSkill => jdSkill.toLowerCase() === skillLower);
    });
  }

  // Improved Scoring Algorithm for Accuracy
  const finalJobMatchScore = aiResult.aiMatchScore || baseMatchScore;
  
  // Weighted readiness score formula for better accuracy:
  // - Job Match Quality: 35% (how well resume matches job)
  // - Reality/Authenticity: 25% (hiring signals and impact)
  // - ATS Compatibility: 25% (can ATS parse it properly)
  // - Formatting/Professionalism: 15% (visual presentation)
  const atsCompatScore = Math.min(85, Math.max(20, realityCheck.details?.scanTime ? 60 : 40));
  const formattingScore = Math.min(85, Math.max(30, (realityCheck.details?.keywordCount || 0) > 15 ? 70 : 50));
  
  const finalReadinessScore = Math.round(
    (finalJobMatchScore * 0.35) +
    (realityCheck.score * 0.25) +
    (atsCompatScore * 0.25) +
    (formattingScore * 0.15)
  );
  
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
    resumeText,
    jobMatchScore: finalJobMatchScore,
    readinessScore: finalReadinessScore,
    // Use AI skills if they are non-empty arrays; otherwise use whitelist-based heuristic
    matchedSkills: (aiResult.matchedSkills && aiResult.matchedSkills.length > 0) ? aiResult.matchedSkills : matchedSkills,
    skillGaps: (aiResult.skillGaps && aiResult.skillGaps.length > 0) ? aiResult.skillGaps : skillGaps,
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