class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function success(res, data, status = 200) {
  return res.status(status).json(data);
}

function error(res, message = 'Internal server error', status = 500) {
  return res.status(status).json({ error: message });
}

module.exports = {
  ApiError,
  success,
  error
};
