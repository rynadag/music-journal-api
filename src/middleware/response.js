/*
 * Standard JSON response helpers.
 * Provides a consistent structure for API responses, including success and error formats.
 */

const success = (res, data, message = "Success", statusCode = 200) =>
  res.status(statusCode).json({
    status: "OK",
    message,
    data,
    errors: null,
  });

const error = (res, message = "An error occurred", errors = [], statusCode = 400) =>
  res.status(statusCode).json({
    status: "ERROR",
    message,
    data: null,
    errors: errors.length ? errors : [message],
  });

module.exports = { success, error };
