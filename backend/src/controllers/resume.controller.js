const { ApiError, success } = require('../utils/apiResponse');
const { extractText } = require('../services/extraction.service');
const { uploadResumeFile } = require('../services/storage.service');
const { createResume, listResumes, getResumeById } = require('../services/resume.service');

async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Resume file is required.');
    }

    const extractedText = await extractText(req.file);

    if (!extractedText || !extractedText.trim()) {
      throw new ApiError(400, 'Unable to extract text from the uploaded resume.');
    }

    const uploadResult = await uploadResumeFile(req.file);

    const saved = await createResume({
      userId: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
      fileUrl: uploadResult.url,
      storageId: uploadResult.fileId
    });

    return success(
      res,
      {
        resumeId: saved._id,
        filename: saved.filename,
        status: saved.status,
        fileUrl: saved.fileUrl,
        extractedTextPreview: extractedText.slice(0, 500)
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

async function getResumes(req, res, next) {
  try {
    const resumes = await listResumes(req.user._id);
    return success(res, resumes);
  } catch (err) {
    next(err);
  }
}

async function getResumeDetail(req, res, next) {
  try {
    const resumeId = req.params.id;
    const resume = await getResumeById(resumeId, req.user._id);

    if (!resume) {
      throw new ApiError(404, 'Resume not found.');
    }

    return success(res, resume);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadResume,
  getResumes,
  getResumeDetail
};

