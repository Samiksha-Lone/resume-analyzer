const { Ollama } = require('ollama');
const { ApiError } = require('../utils/apiResponse');

// Initialize Ollama client with configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud';

let ollamaClient = null;

/**
 * Get or create Ollama client instance
 * @returns {Ollama} Ollama client instance
 * @throws {ApiError} If client cannot be initialized
 */
function getOllamaClient() {
  if (!ollamaClient) {
    try {
      ollamaClient = new Ollama({
        host: OLLAMA_HOST,
        timeout: 30000 // 30 second timeout
      });
    } catch (error) {
      throw new ApiError(500, `Failed to initialize AI client: ${error.message}`);
    }
  }
  return ollamaClient;
}

/**
 * Test Ollama connection and model availability
 * @returns {Promise<boolean>} True if connection is working
 */
async function testOllamaConnection() {
  try {
    const client = getOllamaClient();
    await client.list();
    return true;
  } catch (error) {
    console.warn('Ollama connection test failed:', error.message);
    return false;
  }
}

/**
 * Generate text using Ollama AI
 * @param {string} prompt - Text prompt for AI generation
 * @param {Object} options - Additional generation options
 * @returns {Promise<string>} Generated text response
 * @throws {ApiError} If generation fails
 */
async function generateText(prompt, options = {}) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new ApiError(400, 'Prompt is required and must be a non-empty string');
  }

  if (prompt.length > 10000) {
    throw new ApiError(400, 'Prompt is too long (maximum 10,000 characters)');
  }

  try {
    const client = getOllamaClient();

    const generationOptions = {
      model: OLLAMA_MODEL,
      prompt: prompt.trim(),
      temperature: 0.2,
      top_p: 0.9,
      num_predict: 1000, // Limit response length
      ...options
    };

    const response = await client.generate(generationOptions);

    if (!response || typeof response.response !== 'string') {
      throw new Error('Invalid or empty response from AI service');
    }

    const cleanedResponse = response.response.trim();
    if (cleanedResponse.length === 0) {
      throw new Error('AI service returned empty response');
    }

    return cleanedResponse;

  } catch (error) {
    // Handle specific Ollama errors
    if (error.message?.includes('connect ECONNREFUSED')) {
      throw new ApiError(503, 'AI service is currently unavailable. Please ensure Ollama is running and accessible');
    }

    if (error.message?.includes('model not found') || error.message?.includes('model not available')) {
      throw new ApiError(503, `AI model '${OLLAMA_MODEL}' is not available. Please ensure the model is installed in Ollama`);
    }

    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      throw new ApiError(504, 'AI service request timed out. Please try again');
    }

    // Log the original error for debugging
    console.error('AI generation error:', {
      message: error.message,
      promptLength: prompt.length,
      model: OLLAMA_MODEL,
      host: OLLAMA_HOST
    });

    throw new ApiError(500, `AI generation failed: ${error.message}`);
  }
}

/**
 * Parse JSON response from AI, handling common formatting issues
 * @param {string} raw - Raw response string from AI
 * @returns {Object} Parsed JSON object
 * @throws {ApiError} If parsing fails
 */
function extractJsonString(raw) {
  let cleaned = raw.trim();

  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) {
    return cleaned;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  let endIndex = -1;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }

  return endIndex !== -1 ? cleaned.slice(firstBrace, endIndex + 1) : cleaned.slice(firstBrace);
}

function escapeStringNewlines(jsonString) {
  return jsonString.replace(/"((?:\\.|[\s\S])*?)"/g, (match, content) => {
    const escaped = content.replace(/\r?\n/g, '\\n');
    return `"${escaped}"`;
  });
}

function removeTrailingCommas(jsonString) {
  return jsonString.replace(/,\s*(?=[}\]])/g, '');
}

function parseJsonResponse(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new ApiError(500, 'Invalid response format from AI service');
  }

  try {
    let cleaned = extractJsonString(raw);
    cleaned = removeTrailingCommas(cleaned);
    cleaned = escapeStringNewlines(cleaned);

    const parsed = JSON.parse(cleaned);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed response is not a valid object');
    }

    return parsed;
  } catch (parseError) {
    console.error('JSON parsing error:', {
      rawResponse: raw.substring(0, 200) + '...',
      error: parseError.message
    });

    throw new ApiError(500, 'Failed to parse AI response as valid JSON. The AI service may have returned malformed data');
  }
}

module.exports = {
  generateText,
  parseJsonResponse,
  testOllamaConnection,
  getOllamaClient
};

async function analyzeMatchWithOllama({ resumeText, jobDescription, jobTitle, targetSkills }) {
  const resumePreview = resumeText.length > 2500 ? `${resumeText.slice(0, 2500)}\n...[truncated]` : resumeText;
  const jdPreview = jobDescription.length > 2500 ? `${jobDescription.slice(0, 2500)}\n...[truncated]` : jobDescription;

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and high-level technical recruiter. 
Compare the resume text and the job description and return ONLY valid JSON.

Resume Text:
${resumePreview}

Job Description:
${jdPreview}

${jobTitle ? `Target Job Title: ${jobTitle}\n` : ''}${targetSkills && targetSkills.length ? `Priority Skills: ${targetSkills.join(', ')}\n` : ''}

CRITICAL EXTRACTION RULES for "matchedSkills" and "skillGaps":
1. ONLY include professional skills, technical tools, frameworks, and specific certifications.
2. EXCLUDE all generic verbs, pronouns, and noise words (e.g., "we", "seeking", "build", "maintain", "creating", "strong", "involves", "developing", "role", "using", "applications").
3. DO NOT include common English stop words or phrases that do not represent a specific skill or keyword a recruiter would search for.
4. Focus on high-impact keywords like "React", "Node.js", "AWS", "Agile", "PostgreSQL".

Output JSON with keys:
{
  "aiMatchScore": number, // 0-100 score
  "summary": string, // Professional summary of the match
  "matchedSkills": string[], // Significant technical/professional skills found in both
  "skillGaps": string[], // Significant technical/professional skills in JD but missing in resume
  "recommendations": string[], // Actionable steps to improve the resume
  "rewriteSuggestions": [
    {
      "original": string,
      "rewrite": string,
      "reason": string
    }
  ],
  "learningRoadmap": [
    {
      "week": number,
      "title": string,
      "tasks": string[]
    }
  ],
  "interviewPreparation": [
    {
      "area": string, 
      "advice": string,
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "mockInterviewQuestions": [
    {
      "question": string,
      "type": "Technical" | "Behavioral",
      "expectedAnswer": string
    }
  ],
  "aiToneScore": number,
  "aiToneLabel": string,
  "humanizationSuggestions": string[]
}

Focus on depth and clarity. Only return JSON. No additional text.`;

  const raw = await generateText(prompt);
  return parseJsonResponse(raw);
}

module.exports = {
  analyzeMatchWithOllama
};