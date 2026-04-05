const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const { ApiError } = require('../utils/apiResponse');

const imagekitId = process.env.IMAGEKIT_ID
  || process.env.IMAGEKIT_IMAGEKIT_ID
  || (process.env.IMAGEKIT_URL_ENDPOINT
    ? process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '').split('/').pop()
    : undefined);
const apiKey = process.env.IMAGEKIT_API_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
const apiSecret = process.env.IMAGEKIT_API_SECRET || process.env.IMAGEKIT_PRIVATE_KEY;

const canUseImageKit = Boolean(imagekitId && apiKey && apiSecret);
const imagekit = canUseImageKit
  ? new ImageKit({ imagekitId, apiKey, apiSecret })
  : null;

const uploadsDir = path.join(__dirname, '../../uploads/resumes');

/**
 * Ensure upload directory exists
 * @throws {ApiError} If directory creation fails
 */
async function ensureUploadFolder() {
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    throw new ApiError(500, 'File storage system is currently unavailable');
  }
}

/**
 * Generate local file URL for stored files
 * @param {string} fileName - Safe filename
 * @returns {string} Full URL to access the file
 */
function generateLocalFileUrl(fileName) {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${serverUrl}/uploads/resumes/${encodeURIComponent(fileName)}`;
}

/**
 * Save resume file to local storage
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Upload result with URL and file ID
 * @throws {ApiError} If local storage fails
 */
async function saveLocalResume(file) {
  if (!file || !file.buffer || !file.originalname) {
    throw new ApiError(400, 'Invalid file object for local storage');
  }

  try {
    await ensureUploadFolder();

    // Generate safe filename
    const timestamp = Date.now();
    const safeName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.\-_\.]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);

    // Check if file already exists (unlikely but possible)
    try {
      await fs.promises.access(filePath);
      // File exists, generate a new name
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const newSafeName = `${timestamp}-${randomSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.\-_\.]/g, '_')}`;
      const newFilePath = path.join(uploadsDir, newSafeName);

      await fs.promises.writeFile(newFilePath, file.buffer);
      return {
        url: generateLocalFileUrl(newSafeName),
        fileId: newSafeName
      };
    } catch {
      // File doesn't exist, proceed with original name
      await fs.promises.writeFile(filePath, file.buffer);
      return {
        url: generateLocalFileUrl(safeName),
        fileId: safeName
      };
    }

  } catch (error) {
    console.error('Local file storage error:', error);

    if (error.code === 'ENOSPC') {
      throw new ApiError(507, 'Insufficient storage space on server');
    }

    if (error.code === 'EACCES') {
      throw new ApiError(500, 'File system permission denied');
    }

    throw new ApiError(500, 'Failed to save file locally. Please try again');
  }
}

/**
 * Upload resume file to ImageKit cloud storage
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Upload result with URL and file ID
 * @throws {ApiError} If ImageKit upload fails
 */
async function uploadToImageKit(file) {
  if (!file || !file.buffer || !file.originalname) {
    throw new ApiError(400, 'Invalid file object for cloud storage');
  }

  if (!canUseImageKit) {
    throw new ApiError(500, 'Cloud storage is not configured');
  }

  try {
    const base64File = file.buffer.toString('base64');
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.\-_\.]/g, '_')}`;

    const uploadResult = await imagekit.upload({
      file: base64File,
      fileName: safeFileName,
      folder: '/resumes/',
      useUniqueFileName: true
    });

    if (!uploadResult || !uploadResult.url || !uploadResult.fileId) {
      throw new Error('Invalid upload response from ImageKit');
    }

    return {
      url: uploadResult.url,
      fileId: uploadResult.fileId
    };

  } catch (error) {
    console.error('ImageKit upload error:', error);

    // Handle specific ImageKit errors
    if (error.message?.includes('Unauthorized')) {
      throw new ApiError(500, 'Cloud storage authentication failed');
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new ApiError(507, 'Cloud storage quota exceeded');
    }

    if (error.message?.includes('file size')) {
      throw new ApiError(413, 'File too large for cloud storage');
    }

    throw new ApiError(500, 'Failed to upload file to cloud storage. Please try again');
  }
}

/**
 * Upload resume file with fallback to local storage
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Upload result with URL and file ID
 * @throws {ApiError} If both storage methods fail
 */
async function uploadResumeFile(file) {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'Invalid resume upload. File data is missing');
  }

  // Try cloud storage first if available
  if (canUseImageKit) {
    try {
      return await uploadToImageKit(file);
    } catch (cloudError) {
      console.warn('Cloud storage failed, falling back to local storage:', cloudError.message);
      // Fall through to local storage
    }
  }

  // Use local storage as fallback
  try {
    return await saveLocalResume(file);
  } catch (localError) {
    console.error('Both cloud and local storage failed:', {
      cloudError: canUseImageKit ? 'failed' : 'not configured',
      localError: localError.message
    });

    throw new ApiError(500, 'File storage is currently unavailable. Please try again later');
  }
}

module.exports = {
  uploadResumeFile,
  saveLocalResume,
  uploadToImageKit,
  canUseImageKit,
  generateLocalFileUrl
};
