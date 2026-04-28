const { success, notFound } = require('../utils/apiResponse');
const { getUserHistory, compareSnapshots, getHistoryById, deleteHistoryById } = require('../services/history.service');

/**
 * GET /api/history
 * Returns the current user's full analysis history (newest first).
 */
async function getHistory(req, res, next) {
  try {
    const entries = await getUserHistory(req.user._id);
    return success(res, { history: entries });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/history/compare?v1=id&v2=id
 * Compares two history snapshots and returns score deltas.
 */
async function compareHistory(req, res, next) {
  try {
    const { v1, v2 } = req.query;
    if (!v1 || !v2) {
      return res.status(400).json({ message: 'Both v1 and v2 query params are required.' });
    }
    const result = await compareSnapshots(v1, v2, req.user._id);
    if (!result) return notFound(res, 'History entries');
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/history/:id
 * Returns a specific history entry.
 */
async function getHistoryDetail(req, res, next) {
  try {
    const entry = await getHistoryById(req.params.id, req.user._id);
    if (!entry) return notFound(res, 'History entry');
    return success(res, { history: entry });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/history/:id
 * Deletes a specific history entry.
 */
async function deleteHistory(req, res, next) {
  try {
    const deleted = await deleteHistoryById(req.params.id, req.user._id);
    if (!deleted) return notFound(res, 'History entry');
    return success(res, null, 200, 'History entry deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getHistory, compareHistory, getHistoryDetail, deleteHistory };
