const { ApiError, success, notFound } = require('../utils/apiResponse');
const { getResumeById, updateResumeAnalysis } = require('../services/resume.service');
const { analyzeResumeMatch } = require('../services/match.service');
const { saveSnapshot, cleanupOldHistory } = require('../services/history.service');
const analysisQueue = require('../utils/queue');

/**
 * Validate analysis request input
 * @param {Object} input - Request input data
 * @param {string} input.resumeId - Resume ID
 * @param {string} input.jobDescription - Job description text
 * @param {string} input.resumeText - Resume text to analyze
 * @throws {ApiError} If validation fails
 */
const validateAnalysisInput = ({ resumeId, jobDescription, resumeText }) => {
  if (!resumeId || !resumeId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, 'Invalid resume ID format');
  }

  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 10) {
    throw new ApiError(400, 'Resume text is required and must contain at least 10 characters');
  }

  if (resumeText.length > 50000) {
    throw new ApiError(400, 'Resume text is too long (maximum 50,000 characters)');
  }

  if (jobDescription && typeof jobDescription !== 'string') {
    throw new ApiError(400, 'Job description must be a string');
  }

  if (jobDescription && jobDescription.length > 10000) {
    throw new ApiError(400, 'Job description is too long (maximum 10,000 characters)');
  }
};

/**
 * Start resume analysis job
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function analyzeResume(req, res, next) {
  try {
    const resumeId = req.params.id;
    const { jobDescription = '', rawResumeText, jobTitle, targetSkills } = req.body;

    // Get resume from database
    const resume = await getResumeById(resumeId, req.user._id);
    if (!resume) {
      return notFound(res, 'Resume');
    }

    // Determine resume text to analyze
    const resumeText = rawResumeText && rawResumeText.trim() ? rawResumeText.trim() : resume.extractedText;

    // Validate input
    validateAnalysisInput({
      resumeId,
      jobDescription,
      resumeText
    });

    // Validate target skills if provided
    if (targetSkills) {
      if (!Array.isArray(targetSkills)) {
        throw new ApiError(400, 'Target skills must be an array');
      }
      if (targetSkills.length > 20) {
        throw new ApiError(400, 'Too many target skills (maximum 20)');
      }
      if (targetSkills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new ApiError(400, 'All target skills must be non-empty strings');
      }
    }

    // Generate unique job ID
    const jobId = `analysis_${Date.now()}_${resumeId}_${Math.random().toString(36).substr(2, 9)}`;

    // Add analysis job to queue
    try {
      analysisQueue.addJob(jobId, async () => {
        try {
          const analysis = await analyzeResumeMatch({
            resumeText,
            jobDescription: jobDescription.trim(),
            jobTitle: jobTitle?.trim(),
            targetSkills
          });

          await updateResumeAnalysis(resumeId, analysis);

          // ML Feature 3 & 4: Save history snapshot for version comparison & tracking
          try {
            await saveSnapshot({
              userId: req.user._id,
              resumeId,
              resumeName: resume.originalName,
              jobTitle: jobTitle?.trim() || '',
              analysis
            });
            await cleanupOldHistory(req.user._id, 20);
          } catch (histErr) {
            console.warn('History save failed (non-fatal):', histErr.message);
          }

          return { resumeId, analysis, status: 'completed' };
        } catch (analysisError) {
          console.error('Analysis job failed:', {
            jobId,
            resumeId,
            error: analysisError.message
          });
          throw analysisError;
        }
      });
    } catch (queueError) {
      console.error('Failed to queue analysis job:', queueError);
      throw new ApiError(500, 'Failed to queue analysis job. Please try again');
    }

    return success(res, {
      jobId,
      status: 'pending',
      message: 'Analysis job queued successfully. Check status using the job ID.'
    }, 202);

  } catch (error) {
    console.error('Analyze resume error:', {
      message: error.message,
      resumeId: req.params?.id,
      userId: req.user?._id,
      hasJobDescription: !!req.body?.jobDescription,
      hasRawResumeText: !!req.body?.rawResumeText
    });

    next(error);
  }
}

/**
 * Get analysis job status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAnalysisStatus(req, res, next) {
  try {
    const { jobId } = req.params;

    if (!jobId || typeof jobId !== 'string' || jobId.length < 10) {
      throw new ApiError(400, 'Invalid job ID format');
    }

    const job = analysisQueue.getJobStatus(jobId);

    if (!job) {
      throw new ApiError(404, 'Analysis job not found. It may have expired or completed');
    }

    // If job is completed, include result
    const response = {
      jobId,
      status: job.status,
      createdAt: job.createdAt,
      ...(job.status === 'completed' && { result: job.result }),
      ...(job.status === 'failed' && { error: job.error })
    };

    const statusCode = job.status === 'completed' ? 200 : 202;
    return success(res, response, statusCode);

  } catch (error) {
    console.error('Get analysis status error:', {
      message: error.message,
      jobId: req.params?.jobId,
      userId: req.user?._id
    });

    next(error);
  }
}

module.exports = {
  analyzeResume,
  getAnalysisStatus
};