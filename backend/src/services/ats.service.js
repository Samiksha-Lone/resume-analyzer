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

function computeAtsCompatibility(text) {
  const normalized = normalize(text);
  const contact = extractContactInfo(text);
  const sections = findSections(normalized);
  const keywords = extractKeywords(normalized);

  const sectionScore = Math.min(40, sections.length * 8);
  const contactScore = contact.contactFound ? 30 : 0;
  const keywordScore = Math.min(30, Math.floor(keywords.length / 4));

  const score = Math.max(0, Math.min(100, sectionScore + contactScore + keywordScore));
  const label = score >= 65
    ? '✅ ATS-friendly resume structure'
    : '⚠️ Resume may struggle with ATS parsing';

  const suggestions = [];
  if (!contact.email) {
    suggestions.push('Add a professional email address in the contact section.');
  }
  if (!contact.phone) {
    suggestions.push('Include a phone number to make the resume easily reachable.');
  }
  if (!sections.includes('skills')) {
    suggestions.push('Add a dedicated skills section with clearly separated keywords.');
  }
  if (!sections.includes('experience') && !sections.includes('work experience') && !sections.includes('professional experience')) {
    suggestions.push('Add a distinct experience section with company names and dates.');
  }
  if (keywords.length < 30) {
    suggestions.push('Add more relevant technical keywords and keywords from the job description.');
  }

  // Generate simulation hotspots for the heatmap
  const hotspots = [];
  if (contact.contactFound) hotspots.push({ x: 10, y: 10, size: 20, color: 'accent' });
  if (sections.includes('skills')) hotspots.push({ x: 70, y: 20, size: 25, color: 'emerald' });
  if (sections.includes('experience')) hotspots.push({ x: 40, y: 50, size: 30, color: 'accent' });
  if (keywords.length > 20) hotspots.push({ x: 20, y: 80, size: 15, color: 'emerald' });

  return {
    score,
    label,
    sections,
    contact,
    keywordCount: keywords.length,
    suggestions,
    simulation: {
      hotspots,
      scanTime: 6.8 + (sections.length * 0.1),
      density: keywords.length > 40 ? 'HIGH' : keywords.length > 20 ? 'MEDIUM' : 'LOW'
    },
    summary: 'This ATS simulation score is based on section structure, contact information, and keyword density.'
  };
}

module.exports = {
  computeAtsCompatibility
};