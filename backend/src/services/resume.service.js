const Resume = require('../models/resume.model');

async function createResume({ userId, originalName, filename, mimeType, size, extractedText, fileUrl, storageId, source = 'upload' }) {
  return Resume.create({
    userId,
    originalName,
    filename,
    mimeType,
    size,
    extractedText,
    fileUrl,
    storageId,
    source,
    status: 'parsed'
  });
}

async function listResumes(userId) {
  return Resume.find({ userId }).sort({ createdAt: -1 });
}

async function getResumeById(id, userId) {
  return Resume.findOne({ _id: id, userId });
}

async function storeMatchAnalysis(resumeId, matchAnalysis) {
  return Resume.findByIdAndUpdate(
    resumeId,
    {
      analysis: {
        match: matchAnalysis
      },
      status: 'analyzed'
    },
    { new: true }
  );
}

async function updateResumeAnalysis(resumeId, analysis) {
  return Resume.findByIdAndUpdate(
    resumeId,
    {
      analysis,
      status: 'analyzed'
    },
    { new: true }
  );
}

async function storeAtsAnalysis(resumeId, atsAnalysis) {
  return Resume.findByIdAndUpdate(
    resumeId,
    {
      $set: {
        'analysis.ats': atsAnalysis
      },
      status: 'analyzed'
    },
    { new: true }
  );
}

module.exports = {
  createResume,
  listResumes,
  getResumeById,
  storeMatchAnalysis,
  updateResumeAnalysis,
  storeAtsAnalysis
};
