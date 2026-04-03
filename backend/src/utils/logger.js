const isProduction = process.env.NODE_ENV === 'production';

function info(...args) {
  if (!isProduction) {
    console.log('[INFO]', ...args);
  }
}

function warn(...args) {
  console.warn('[WARN]', ...args);
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

module.exports = {
  info,
  warn,
  error
};
