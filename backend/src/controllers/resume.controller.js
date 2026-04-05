const { ApiError, success, notFound } = require('../utils/apiResponse');
const { extractText } = require('../services/extraction.service');
const { uploadResumeFile } = require('../services/storage.service');
const { createResume, listResumes, getResumeById, deleteResumeById } = require('../services/resume.service');

/**
 * Validate uploaded file
 * @param {Object} file - Multer file object
 * @throws {ApiError} If file validation fails
 */
const validateResumeFile = (file) => {
  if (!file) {
    throw new ApiError(400, 'Resume file is required');
  }

  // Check file size (10MB limit)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
  if (file.size > maxSize) {
    throw new ApiError(400, `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(400, 'Invalid file type. Only PDF and DOCX files are allowed');
  }

  // Check file extension as additional validation
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

  if (!allowedExtensions.includes(fileExtension)) {
    throw new ApiError(400, 'Invalid file extension. Only .pdf, .docx, and .doc files are allowed');
  }
};

/**
 * Upload and process a resume file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function uploadResume(req, res, next) {
  try {
    // Validate file
    validateResumeFile(req.file);

    // Extract text from resume
    let extractedText;
    try {
      extractedText = await extractText(req.file);
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      throw new ApiError(400, 'Failed to extract text from resume. Please ensure the file is not corrupted and contains readable text');
    }

    if (!extractedText || !extractedText.trim()) {
      throw new ApiError(400, 'No readable text found in the resume. Please ensure the file contains text content');
    }

    // Upload file to storage
    let uploadResult;
    try {
      uploadResult = await uploadResumeFile(req.file);
    } catch (uploadError) {
      console.error('File upload failed:', uploadError);
      throw new ApiError(500, 'Failed to store resume file. Please try again');
    }

    // Save resume metadata to database
    let savedResume;
    try {
      savedResume = await createResume({
        userId: req.user._id,
        originalName: req.file.originalname,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extractedText,
        fileUrl: uploadResult.url,
        storageId: uploadResult.fileId
      });
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      // Note: File is already uploaded, but we couldn't save metadata
      // In production, you might want to clean up the uploaded file here
      throw new ApiError(500, 'Failed to save resume information. Please try again');
    }

    return success(res, {
      resumeId: savedResume._id,
      filename: savedResume.filename,
      status: savedResume.status,
      fileUrl: savedResume.fileUrl,
      extractedTextPreview: extractedText.slice(0, 500),
      textLength: extractedText.length
    }, 201, 'Resume uploaded successfully');

  } catch (error) {
    console.error('Resume upload error:', {
      message: error.message,
      userId: req.user?._id,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });

    next(error);
  }
}

/**
 * Get all resumes for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getResumes(req, res, next) {
  try {
    const resumes = await listResumes(req.user._id);

    return success(res, {
      resumes,
      count: resumes.length
    }, 200, 'Resumes retrieved successfully');

  } catch (error) {
    console.error('Get resumes error:', {
      message: error.message,
      userId: req.user?._id
    });

    next(error);
  }
}

/**
 * Get a specific resume by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getResumeDetail(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(400, 'Invalid resume ID format');
    }

    const resume = await getResumeById(id, req.user._id);

    if (!resume) {
      return notFound(res, 'Resume');
    }

    return success(res, {
      resume
    }, 200, 'Resume retrieved successfully');

  } catch (error) {
    console.error('Get resume detail error:', {
      message: error.message,
      resumeId: req.params?.id,
      userId: req.user?._id
    });

    next(error);
  }
}

/**
 * Delete a resume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(400, 'Invalid resume ID format');
    }

    const deletedResume = await deleteResumeById(id, req.user._id);

    if (!deletedResume) {
      return notFound(res, 'Resume');
    }

    return success(res, null, 200, 'Resume deleted successfully');

  } catch (error) {
    console.error('Delete resume error:', {
      message: error.message,
      resumeId: req.params?.id,
      userId: req.user?._id
    });

    next(error);
  }
}

module.exports = {
  uploadResume,
  getResumes,
  getResumeDetail,
  deleteResume
};


