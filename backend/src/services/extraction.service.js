const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { ApiError } = require('../utils/apiResponse');

async function extractTextFromPdf(buffer) {
  const data = await pdf(buffer);
  return data.text || '';
}

async function extractTextFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype === 'application/pdf' || ext === '.pdf') {
    return extractTextFromPdf(file.buffer);
  }

  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    return extractTextFromDocx(file.buffer);
  }

  throw new ApiError(400, 'Unsupported resume file type. Only PDF and DOCX are supported.');
}

module.exports = {
  extractText
};
