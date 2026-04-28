function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function extractContactInfo(text) {
  const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const phone = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})\b/.test(text);
  return { email, phone, contactFound: email || phone };
}

function findSections(text) {
  const headers = [
    'experience',
    'work experience',
    'professional experience',
    'education',
    'skills',
    'projects',
    'certifications',
    'summary',
    'objective',
    'achievements',
    'technical skills'
  ];

  return headers.filter((header) => text.includes(header)).map((header) => header);
}

function extractKeywords(text) {
  return Array.from(new Set(
    String(text || '')
      .toLowerCase()
      .match(/\b[a-zA-Z0-9+#.+-]{2,}\b/g) || []
  ));
}

// Enhanced formatting quality checks
function checkFormattingQuality(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / Math.max(1, lines.length);
  
  // Check for proper bullet points and formatting
  const bulletPoints = (text.match(/[•\-*]\s+/g) || []).length;
  const hasNumbers = /\d+/.test(text);
  const properSpacing = lines.length > 10; // Decent length and spacing
  
  // Score formatting quality (0-20 points)
  let formatScore = 0;
  if (bulletPoints >= 3) formatScore += 8;   // Good use of bullets
  if (avgLineLength < 100 && avgLineLength > 30) formatScore += 6;  // Good line length
  if (properSpacing) formatScore += 4;       // Good spacing
  if (hasNumbers) formatScore += 2;          // Has metrics
  
  return Math.min(20, formatScore);
}

// Check for keyword stuffing penalties
function checkKeywordDensity(text, keywords) {
  const wordCount = text.split(/\s+/).length;
  const keywordDensity = (keywords.length / Math.max(1, wordCount)) * 100;
  
  // Penalize if keyword density is too high (keyword stuffing)
  if (keywordDensity > 8) return -10;  // High penalty for stuffing
  if (keywordDensity > 5) return -5;   // Moderate penalty
  return 0;
}

// Validate critical sections exist and have substance
function validateSectionQuality(text) {
  const normalized = normalize(text);
  let qualityScore = 0;
  
  // Check experience section has substance
  const experienceMatch = text.match(/(?:experience|work experience|professional experience)[^a-z]*([^]*?)(?=(?:education|skills|projects|$))/i);
  if (experienceMatch && experienceMatch[1].length > 100) qualityScore += 15;
  else if (experienceMatch) qualityScore += 5;
  
  // Check education section
  const educationMatch = text.match(/education[^a-z]*([^]*?)(?=(?:skills|experience|projects|$))/i);
  if (educationMatch && educationMatch[1].length > 50) qualityScore += 10;
  
  // Check skills section
  const skillsMatch = text.match(/skills[^a-z]*([^]*?)(?=(?:experience|education|projects|$))/i);
  if (skillsMatch && skillsMatch[1].length > 50) qualityScore += 15;
  else if (skillsMatch) qualityScore += 5;
  
  return Math.min(40, qualityScore);
}

function computeAtsCompatibility(text) {
  const normalized = normalize(text);
  const contact = extractContactInfo(text);
  const sections = findSections(normalized);
  const keywords = extractKeywords(normalized);

  // Improved Scoring (more conservative and accurate)
  // Base: Contact + Core sections (required)
  const contactScore = (contact.email ? 10 : 0) + (contact.phone ? 5 : 0); // Max 15
  const essentialSections = [
    (sections.includes('experience') || sections.includes('work experience') || sections.includes('professional experience')) ? 15 : 0,
    sections.includes('education') ? 10 : 0,
    sections.includes('skills') ? 15 : 0
  ].reduce((a, b) => a + b, 0); // Max 40
  
  // Quality checks
  const formatScore = checkFormattingQuality(text); // Max 20
  const sectionQuality = validateSectionQuality(text); // Max 40
  const keywordPenalty = checkKeywordDensity(text, keywords);
  
  // Keyword scoring (more conservative)
  const keywordScore = Math.min(15, Math.floor(keywords.length / 8)); // Reduced from 30
  
  // Calculate final score with penalties
  let score = contactScore + essentialSections + formatScore + sectionQuality + keywordScore + keywordPenalty;
  score = Math.max(0, Math.min(85, score)); // Max 85% (more realistic)
  
  const label = score >= 70
    ? '✅ ATS-friendly resume structure'
    : score >= 50
    ? '⚠️ Resume has some ATS parsing risks'
    : '❌ Resume may struggle with ATS parsing';

  const suggestions = [];
  if (!contact.email) suggestions.push('Add a professional email address in the contact section.');
  if (!contact.phone) suggestions.push('Include a phone number (optional but recommended).');
  if (!sections.includes('skills')) suggestions.push('Add a dedicated skills section with clearly separated keywords.');
  if (!sections.includes('experience') && !sections.includes('work experience')) suggestions.push('Add a clear experience section with company names and dates.');
  if (keywords.length < 20) suggestions.push('Include more relevant technical keywords related to your target role.');
  if (keywords.length > 50) suggestions.push('Reduce keyword density to avoid appearing like keyword stuffing.');

  // Generate simulation hotspots for the heatmap
  const hotspots = [];
  if (contact.contactFound) hotspots.push({ x: 10, y: 10, size: 20, color: 'accent' });
  if (sections.includes('skills')) hotspots.push({ x: 70, y: 20, size: 25, color: 'emerald' });
  if (sections.includes('experience')) hotspots.push({ x: 40, y: 50, size: 30, color: 'accent' });
  if (keywords.length > 20 && keywords.length < 50) hotspots.push({ x: 20, y: 80, size: 15, color: 'emerald' });

  return {
    score,
    label,
    sections,
    contact,
    keywordCount: keywords.length,
    suggestions,
    simulation: {
      hotspots,
      scanTime: 5.5 + (sections.length * 0.15),
      density: keywords.length > 50 ? 'HIGH' : keywords.length > 25 ? 'MEDIUM' : 'LOW'
    },
    summary: 'ATS score based on section structure, contact info, formatting quality, and keyword relevance (not density).'
  };
}

module.exports = {
  computeAtsCompatibility
};