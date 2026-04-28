const { protect } = require('../middlewares/auth.middleware');
const express = require('express');
const { uploadResumeFile } = require('../middlewares/upload.middleware');
const { uploadResume, getResumes, getResumeDetail, deleteResume } = require('../controllers/resume.controller');
const { matchResume } = require('../controllers/match.controller');
const { analyzeResume, getAnalysisStatus } = require('../controllers/analysis.controller');
const { getHistory, compareHistory, getHistoryDetail, deleteHistory } = require('../controllers/history.controller');
const router = express.Router();

router.use(protect);

router.post('/resumes', uploadResumeFile, uploadResume);
router.get('/resumes', getResumes);
router.get('/analysis/status/:jobId', getAnalysisStatus);
router.get('/resumes/:id', getResumeDetail);
router.delete('/resumes/:id', deleteResume);
router.post('/resumes/:id/match', matchResume);
router.post('/resumes/:id/analyze', analyzeResume);

// ML Feature 3 & 4: History routes
router.get('/history', getHistory);
router.get('/history/compare', compareHistory);
router.get('/history/:id', getHistoryDetail);
router.delete('/history/:id', deleteHistory);

module.exports = router;
