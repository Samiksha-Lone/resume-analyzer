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

async function ensureUploadFolder() {
  await fs.promises.mkdir(uploadsDir, { recursive: true });
}

function generateLocalFileUrl(fileName) {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${serverUrl}/uploads/resumes/${encodeURIComponent(fileName)}`;
}

async function saveLocalResume(file) {
  await ensureUploadFolder();
  const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_\.]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeName);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: generateLocalFileUrl(safeName),
    fileId: safeName
  };
}

async function uploadResumeFile(file) {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'Invalid resume upload.');
  }

  if (canUseImageKit) {
    const base64File = file.buffer.toString('base64');
    try {
      const response = await imagekit.upload({
        file: base64File,
        fileName: file.originalname,
        folder: '/resumes',
        useUniqueFileName: true
      });
      return response;
    } catch (error) {
      console.warn('[UPLOAD FALLBACK] ImageKit upload failed, saving locally:', error.message);
    }
  }

  return saveLocalResume(file);
}

module.exports = {
  uploadResumeFile
};
