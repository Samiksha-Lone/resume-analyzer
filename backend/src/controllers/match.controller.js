const { ApiError, success, notFound } = require('../utils/apiResponse');
const { getResumeById, updateResumeAnalysis } = require('../services/resume.service');
const { analyzeResumeMatch } = require('../services/match.service');

/**
 * Validate and normalize target skills
 * @param {any} targetSkills - Raw target skills input
 * @returns {string[]} Normalized array of skill strings
 * @throws {ApiError} If skills validation fails
 */
const validateAndNormalizeSkills = (targetSkills) => {
  let normalizedSkills = [];

  if (targetSkills === undefined || targetSkills === null) {
    return normalizedSkills;
  }

  if (Array.isArray(targetSkills)) {
    normalizedSkills = targetSkills
      .filter(skill => skill != null)
      .map(skill => String(skill).trim())
      .filter(skill => skill.length > 0);
  } else if (typeof targetSkills === 'string') {
    normalizedSkills = targetSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  } else {
    throw new ApiError(400, 'Target skills must be an array or comma-separated string');
  }

  if (normalizedSkills.length > 20) {
    throw new ApiError(400, 'Too many target skills (maximum 20)');
  }

  if (normalizedSkills.some(skill => skill.length > 100)) {
    throw new ApiError(400, 'Individual skill names must be less than 100 characters');
  }

  return normalizedSkills;
};

/**
 * Validate match request input
 * @param {Object} input - Request input data
 * @param {string} input.resumeId - Resume ID
 * @param {string} input.jobDescription - Job description text
 * @param {string} input.resumeText - Resume text to match
 * @throws {ApiError} If validation fails
 */
const validateMatchInput = ({ resumeId, jobDescription, resumeText }) => {
  if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, 'Invalid resume ID format');
  }

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
    throw new ApiError(400, 'Job description is required and must contain at least 10 characters');
  }

  if (jobDescription.length > 10000) {
    throw new ApiError(400, 'Job description is too long (maximum 10,000 characters)');
  }

  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 10) {
    throw new ApiError(400, 'Resume text is required and must contain at least 10 characters');
  }

  if (resumeText.length > 50000) {
    throw new ApiError(400, 'Resume text is too long (maximum 50,000 characters)');
  }
};

/**
 * Match resume against job description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function matchResume(req, res, next) {
  try {
    const resumeId = req.params.id;
    const { jobDescription, rawResumeText, jobTitle, targetSkills } = req.body;

    // Validate and normalize target skills
    const normalizedTargetSkills = validateAndNormalizeSkills(targetSkills);

    // Get resume from database
    const resume = await getResumeById(resumeId, req.user._id);
    if (!resume) {
      return notFound(res, 'Resume');
    }

    // Determine resume text to use
    const resumeText = rawResumeText && rawResumeText.trim() ? rawResumeText.trim() : resume.extractedText;

    // Validate all input
    validateMatchInput({
      resumeId,
      jobDescription: jobDescription.trim(),
      resumeText
    });

    // Perform matching analysis
    let analysis;
    try {
      analysis = await analyzeResumeMatch({
        resumeText,
        jobDescription: jobDescription.trim(),
        jobTitle: jobTitle?.trim(),
        targetSkills: normalizedTargetSkills
      });
    } catch (analysisError) {
      console.error('Resume matching analysis failed:', analysisError);
      throw new ApiError(500, 'Failed to analyze resume match. Please try again');
    }

    // Update resume with analysis results
    let updatedResume;
    try {
      updatedResume = await updateResumeAnalysis(resumeId, analysis);
    } catch (dbError) {
      console.error('Failed to save analysis results:', dbError);
      // Analysis was successful, but we couldn't save it
      // Return analysis anyway, but log the issue
      console.warn('Analysis completed but not saved to database');
    }

    return success(res, {
      resumeId: updatedResume?._id || resumeId,
      match: analysis,
      saved: !!updatedResume
    }, 200, 'Resume matching completed successfully');

  } catch (error) {
    console.error('Match resume error:', {
      message: error.message,
      resumeId: req.params?.id,
      userId: req.user?._id,
      hasJobDescription: !!req.body?.jobDescription,
      hasRawResumeText: !!req.body?.rawResumeText,
      targetSkillsCount: Array.isArray(req.body?.targetSkills) ? req.body.targetSkills.length : 'N/A'
    });

    next(error);
  }
}

module.exports = {
  matchResume
};