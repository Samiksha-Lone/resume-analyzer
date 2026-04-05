const path = require('path');
const fs = require('fs');

// Load role→skills knowledge base once at startup
let roleSkillsDB = null;
function getRoleSkillsDB() {
  if (!roleSkillsDB) {
    const dataPath = path.join(__dirname, '../data/skills-by-role.json');
    roleSkillsDB = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }
  return roleSkillsDB;
}

/**
 * Simple TF-IDF term weight for a token within a document.
 * We use term frequency (TF) only since the corpus is small and static.
 * @param {string} term
 * @param {string[]} tokens
 * @returns {number}
 */
function tf(term, tokens) {
  const count = tokens.filter(t => t === term).length;
  return count / (tokens.length || 1);
}

/**
 * Cosine similarity between two sparse weighted vectors.
 * Both vectors are Maps of { term → weight }.
 * @param {Map<string,number>} vecA
 * @param {Map<string,number>} vecB
 * @returns {number} 0–1
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, wa] of vecA) {
    dot += wa * (vecB.get(term) || 0);
    normA += wa * wa;
  }
  for (const [, wb] of vecB) {
    normB += wb * wb;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Tokenize and normalize a string.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Builds a TF-weighted vector for resume text using the skill vocabulary.
 * @param {string} resumeText
 * @param {string[]} vocabulary - all unique skill terms
 * @returns {Map<string,number>}
 */
function buildResumeVector(resumeText, vocabulary) {
  const tokens = tokenize(resumeText);
  const vec = new Map();
  for (const term of vocabulary) {
    const termTokens = term.split(/\s+/);
    // Multi-word skill matching: check if all words appear near each other
    const termText = tokenize(term).join(' ');
    const resumeLower = resumeText.toLowerCase();
    const found = resumeLower.includes(termText);
    const tfVal = found ? tf(term, tokens) + 0.1 : 0; // Bump if found
    if (tfVal > 0) vec.set(term, tfVal);
  }
  return vec;
}

/**
 * Builds a weighted vector for a role using the knowledge base weights.
 * @param {string} roleName
 * @param {string[]} vocabulary
 * @returns {Map<string,number>}
 */
function buildRoleVector(roleName, vocabulary) {
  const db = getRoleSkillsDB();
  const roleData = db[roleName];
  if (!roleData) return new Map();

  const vec = new Map();
  roleData.skills.forEach((skill, i) => {
    const weight = roleData.weights[i] || 0.5;
    if (vocabulary.includes(skill)) {
      vec.set(skill, weight);
    }
  });
  return vec;
}

/**
 * Main function: detect the closest matching role for a resume and return
 * skills that are industry-standard but missing from the resume.
 *
 * @param {string} resumeText
 * @returns {Object} { detectedRole, similarity, missingSkills, matchedSkills, allRoleScores }
 */
function analyzeIndustryBenchmark(resumeText) {
  const db = getRoleSkillsDB();
  const roles = Object.keys(db);

  // Build vocabulary from all role skills
  const vocabulary = [...new Set(roles.flatMap(r => db[r].skills))];

  // Build resume vector once
  const resumeVec = buildResumeVector(resumeText, vocabulary);
  const resumeSkillSet = new Set(resumeVec.keys());

  // Score each role
  const roleScores = roles.map(roleName => {
    const roleVec = buildRoleVector(roleName, vocabulary);
    const similarity = cosineSimilarity(resumeVec, roleVec);
    return { role: roleName, similarity };
  });

  // Sort by similarity descending
  roleScores.sort((a, b) => b.similarity - a.similarity);
  const best = roleScores[0];

  if (!best || best.similarity < 0.01) {
    return {
      detectedRole: 'general',
      similarity: 0,
      missingSkills: [],
      matchedSkills: [],
      allRoleScores: roleScores.slice(0, 5)
    };
  }

  const bestRoleData = db[best.role];

  // Identify matched and missing skills (weighted by importance)
  const matchedSkills = [];
  const missingSkills = [];

  bestRoleData.skills.forEach((skill, i) => {
    const weight = bestRoleData.weights[i] || 0.5;
    const skillTokens = tokenize(skill).join(' ');
    const resumeLower = resumeText.toLowerCase();
    const found = resumeLower.includes(skillTokens);

    if (found) {
      matchedSkills.push({ skill, weight });
    } else if (weight >= 0.7) {
      // Only report high-importance missing skills
      missingSkills.push({ skill, weight });
    }
  });

  // Sort missing by weight (most critical first)
  missingSkills.sort((a, b) => b.weight - a.weight);

  return {
    detectedRole: best.role,
    similarity: Math.round(best.similarity * 100),
    missingSkills: missingSkills.slice(0, 12).map(s => s.skill),
    matchedSkills: matchedSkills.slice(0, 15).map(s => s.skill),
    allRoleScores: roleScores.slice(0, 5),
    benchmarkCoverage: bestRoleData.skills.length > 0
      ? Math.round((matchedSkills.length / bestRoleData.skills.length) * 100)
      : 0
  };
}

module.exports = { analyzeIndustryBenchmark };
