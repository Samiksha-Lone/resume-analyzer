const { ApiError, success } = require('../utils/apiResponse');
const { getResumeById, updateResumeAnalysis, storeAtsAnalysis } = require('../services/resume.service');
const { analyzeResumeMatch, compareResumes } = require('../services/match.service');
const { computeAtsCompatibility } = require('../services/ats.service');
const analysisQueue = require('../utils/queue');

async function analyzeResume(req, res, next) {
  try {
    const resumeId = req.params.id;
    const { jobDescription = '', rawResumeText, jobTitle, targetSkills, githubUsername } = req.body;

    const resume = await getResumeById(resumeId, req.user._id);
    if (!resume) {
      throw new ApiError(404, 'Resume not found.');
    }

    const resumeText = rawResumeText && rawResumeText.trim() ? rawResumeText : resume.extractedText;
    if (!resumeText || !resumeText.trim()) {
      throw new ApiError(400, 'Resume text is required for analysis.');
    }

    const jobId = `job_${Date.now()}_${resumeId}`;
    
    // Background task (simulating microservice call)
    analysisQueue.addJob(jobId, async () => {
      const analysis = await analyzeResumeMatch({
        resumeText,
        jobDescription: jobDescription.trim(),
        jobTitle,
        targetSkills,
        githubUsername
      });
      await updateResumeAnalysis(resumeId, analysis);
      return { resumeId, analysis };
    });

    return success(res, {
      jobId,
      status: 'pending',
      message: 'Analysis job queued successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function getAnalysisStatus(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = analysisQueue.getJobStatus(jobId);
    
    if (!job) {
      throw new ApiError(404, 'Job not found.');
    }

    return success(res, {
      status: job.status,
      result: job.result,
      error: job.error
    });
  } catch (err) {
    next(err);
  }
}

async function simulateAts(req, res, next) {
  try {
    const resumeId = req.params.id;
    const { rawResumeText } = req.body;

    const resume = await getResumeById(resumeId, req.user._id);
    if (!resume) {
      throw new ApiError(404, 'Resume not found.');
    }

    const resumeText = rawResumeText && rawResumeText.trim() ? rawResumeText : resume.extractedText;
    if (!resumeText || !resumeText.trim()) {
      throw new ApiError(400, 'Resume text is required for ATS simulation.');
    }

    const atsAnalysis = computeAtsCompatibility(resumeText);
    const updated = await storeAtsAnalysis(resumeId, atsAnalysis);

    return success(res, {
      resumeId: updated._id,
      atsAnalysis
    });
  } catch (err) {
    next(err);
  }
}

async function compareAnalysis(req, res, next) {
  try {
    const { idA, idB } = req.body;
    if (!idA || !idB) {
      throw new ApiError(400, 'Both resume IDs are required for comparison.');
    }

    const resumeA = await getResumeById(idA, req.user._id);
    const resumeB = await getResumeById(idB, req.user._id);

    if (!resumeA || !resumeB) {
      throw new ApiError(404, 'One or both resumes not found.');
    }

    if (!resumeA.analysis || !resumeB.analysis) {
       throw new ApiError(400, 'Both resumes must be analyzed before comparison.');
    }

    const comparison = compareResumes(resumeA.analysis, resumeB.analysis);

    return success(res, {
      comparison,
      resumeA: { id: resumeA._id, name: resumeA.originalName, analysis: resumeA.analysis },
      resumeB: { id: resumeB._id, name: resumeB.originalName, analysis: resumeB.analysis }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeResume,
  simulateAts,
  compareAnalysis,
  getAnalysisStatus
};