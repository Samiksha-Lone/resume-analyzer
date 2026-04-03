const { ApiError, success } = require('../utils/apiResponse');
const { getResumeById, storeMatchAnalysis } = require('../services/resume.service');
const { analyzeResumeMatch } = require('../services/match.service');

async function matchResume(req, res, next) {
  try {
    const resumeId = req.params.id;
    const { jobDescription, rawResumeText, jobTitle, targetSkills } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      throw new ApiError(400, 'Job description text is required.');
    }

    let normalizedTargetSkills = [];
    if (Array.isArray(targetSkills)) {
      normalizedTargetSkills = targetSkills.filter(Boolean).map((item) => String(item).trim());
    } else if (typeof targetSkills === 'string' && targetSkills.trim()) {
      normalizedTargetSkills = targetSkills.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const resume = await getResumeById(resumeId);
    if (!resume) {
      throw new ApiError(404, 'Resume not found.');
    }

    const resumeText = rawResumeText && rawResumeText.trim() ? rawResumeText : resume.extractedText;
    if (!resumeText || !resumeText.trim()) {
      throw new ApiError(400, 'Resume text is required for matching.');
    }

    const analysis = await analyzeResumeMatch({ resumeText, jobDescription, jobTitle, targetSkills: normalizedTargetSkills });
    const updated = await storeMatchAnalysis(resumeId, analysis);

    return success(res, {
      resumeId: updated._id,
      match: analysis
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  matchResume
};