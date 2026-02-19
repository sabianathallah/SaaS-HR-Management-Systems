/**
 * Standardized API response helpers
 * All responses follow: { success, message, data?, pagination? }
 */

const ok = (res, message, data = null, pagination = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (pagination !== null) response.pagination = pagination;
  return res.status(200).json(response);
};

const created = (res, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(201).json(response);
};

const badRequest = (res, message) =>
  res.status(400).json({ success: false, message });

const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json({ success: false, message });

const forbidden = (res, message = 'Access forbidden') =>
  res.status(403).json({ success: false, message });

const notFound = (res, message) =>
  res.status(404).json({ success: false, message });

const serverError = (res, message = 'Internal server error') =>
  res.status(500).json({ success: false, message });

module.exports = { ok, created, badRequest, unauthorized, forbidden, notFound, serverError };
