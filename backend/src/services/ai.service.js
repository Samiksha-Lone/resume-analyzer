const { Ollama } = require('ollama');
const { ApiError } = require('../utils/apiResponse');

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });

async function generateText(prompt, options = {}) {
  try {
    const response = await ollama.generate({
      model: process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud',
      prompt,
      temperature: 0.2,
      top_p: 0.9,
      ...options
    });

    if (!response || typeof response.response !== 'string') {
      throw new Error('Invalid AI response');
    }

    return response.response.trim();
  } catch (error) {
    throw new ApiError(500, `AI generation failed: ${error.message}`);
  }
}

function parseJsonResponse(raw) {
  const cleaned = raw.trim().replace(/^[\s\S]*?({[\s\S]*})[\s\S]*$/, '$1');
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new ApiError(500, 'Unable to parse AI response as JSON.');
  }
}

async function analyzeMatchWithOllama({ resumeText, jobDescription, jobTitle, targetSkills }) {
  const resumePreview = resumeText.length > 2500 ? `${resumeText.slice(0, 2500)}\n...[truncated]` : resumeText;
  const jdPreview = jobDescription.length > 2500 ? `${jobDescription.slice(0, 2500)}\n...[truncated]` : jobDescription;

  const prompt = `You are an expert resume analyst. Compare the resume text and the job description and return ONLY valid JSON.

Resume Text:\n${resumePreview}\n\nJob Description:\n${jdPreview}\n\n` +
    (jobTitle ? `Job Title: ${jobTitle}\n\n` : '') +
    (targetSkills && targetSkills.length ? `Target Skills: ${targetSkills.join(', ')}\n\n` : '') +
    `Output JSON with keys:\n{
  "aiMatchScore": number, // 0-100
  "summary": string,
  "matchedSkills": string[],
  "skillGaps": string[],
  "recommendations": string[],
  "rewriteSuggestions": [
    {
      "original": string,
      "rewrite": string,
      "reason": string
    }
  ],
  "projectDepthRecommendations": string[],
  "aiToneScore": number, // 0-100
  "aiToneLabel": string,
  "humanizationSuggestions": string[],
  "learningRoadmap": [
    {
      "week": number,
      "title": string,
      "tasks": string[]
    }
  ]
}

Also evaluate whether project descriptions are overly CRUD-focused or missing API/auth/scaling depth. Suggest specific improvements such as "Add JWT authentication implementation", "Mention performance optimization strategies", or "Document API integration and deployment design". Provide exact bullet rewrite examples based on the job description, not generic advice. Evaluate whether the resume sounds AI-generated or overly polished, and return specific humanizing edit suggestions. For any skill gaps found, generate a personalized 2-week learning roadmap. Only return JSON. No additional text.`;

  const raw = await generateText(prompt);
  return parseJsonResponse(raw);
}

module.exports = {
  analyzeMatchWithOllama
};