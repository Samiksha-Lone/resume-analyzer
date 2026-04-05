const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { ApiError } = require('../utils/apiResponse');

/**
 * Extract text from PDF file buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 * @throws {ApiError} If PDF extraction fails
 */
async function extractTextFromPdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, 'PDF file buffer is empty or invalid');
  }

  try {
    const data = await pdf(buffer, {
      max: 10, // Limit pages to prevent excessive processing
    });

    if (!data || typeof data.text !== 'string') {
      throw new Error('PDF parsing returned invalid data');
    }

    // Clean up extracted text
    const cleanedText = data.text
      .replace(/\0/g, '') // Remove null characters
      .replace(/\f/g, '\n') // Replace form feeds with newlines
      .trim();

    return cleanedText;

  } catch (error) {
    if (error.message?.includes('Invalid PDF')) {
      throw new ApiError(400, 'The uploaded file is not a valid PDF document');
    }

    if (error.message?.includes('Password protected')) {
      throw new ApiError(400, 'Password-protected PDFs are not supported');
    }

    console.error('PDF extraction error:', error.message);
    throw new ApiError(500, 'Failed to extract text from PDF. The file may be corrupted or in an unsupported format');
  }
}

/**
 * Extract text from DOCX file buffer
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 * @throws {ApiError} If DOCX extraction fails
 */
async function extractTextFromDocx(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, 'DOCX file buffer is empty or invalid');
  }

  try {
    const result = await mammoth.extractRawText({
      buffer,
      errorHandler: (error) => {
        // Log warnings but don't fail completely
        console.warn('DOCX extraction warning:', error.message);
      }
    });

    if (!result || typeof result.value !== 'string') {
      throw new Error('DOCX parsing returned invalid data');
    }

    // Clean up extracted text
    const cleanedText = result.value
      .replace(/\0/g, '') // Remove null characters
      .trim();

    return cleanedText;

  } catch (error) {
    if (error.message?.includes('Invalid ZIP')) {
      throw new ApiError(400, 'The uploaded file is not a valid DOCX document');
    }

    console.error('DOCX extraction error:', error.message);
    throw new ApiError(500, 'Failed to extract text from DOCX. The file may be corrupted or in an unsupported format');
  }
}

/**
 * Extract text from resume file based on file type
 * @param {Object} file - Multer file object with buffer and metadata
 * @returns {Promise<string>} Extracted text content
 * @throws {ApiError} If file type is unsupported or extraction fails
 */
async function extractText(file) {
  if (!file) {
    throw new ApiError(400, 'File object is required');
  }

  if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new ApiError(400, 'File buffer is missing or invalid');
  }

  if (!file.originalname) {
    throw new ApiError(400, 'Original filename is required');
  }

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Validate file type by both extension and MIME type
  const isPdf = (mimeType === 'application/pdf' || fileExtension === '.pdf');
  const isDocx = (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileExtension === '.docx'
  );

  if (isPdf) {
    return await extractTextFromPdf(file.buffer);
  }

  if (isDocx) {
    return await extractTextFromDocx(file.buffer);
  }

  // Unsupported file type
  const supportedTypes = 'PDF (.pdf) and DOCX (.docx)';
  throw new ApiError(400, `Unsupported file type. Only ${supportedTypes} files are supported. Detected: ${mimeType || 'unknown'} with extension ${fileExtension || 'none'}`);
}

module.exports = {
  extractText,
  extractTextFromPdf,
  extractTextFromDocx
};
