const { protect } = require('../middlewares/auth.middleware');
const express = require('express');
const { uploadResumeFile } = require('../middlewares/upload.middleware');
const { uploadResume, getResumes, getResumeDetail } = require('../controllers/resume.controller');
const { matchResume } = require('../controllers/match.controller');
const { analyzeResume, simulateAts, compareAnalysis, getAnalysisStatus } = require('../controllers/analysis.controller');
const router = express.Router();

router.use(protect);

router.post('/resumes', uploadResumeFile, uploadResume);
router.get('/resumes', getResumes);
router.post('/resumes/compare', compareAnalysis);
router.get('/analysis/status/:jobId', getAnalysisStatus);
router.get('/resumes/:id', getResumeDetail);
router.post('/resumes/:id/match', matchResume);
router.post('/resumes/:id/analyze', analyzeResume);
router.post('/resumes/:id/ats', simulateAts);

module.exports = router;
