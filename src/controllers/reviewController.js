const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { success, error } = require("../middleware/response");

// GET /songs/:songId/reviews
const getReviewsBySong = (req, res) => {
  const song = db.songs.find((s) => s.id === req.params.songId);
  if (!song) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const reviews = db.reviews.filter((r) => r.songId === req.params.songId);
  return success(res, reviews, "Reviews retrieved successfully");
};

// GET /songs/:songId/reviews/:reviewId
const getReviewById = (req, res) => {
  const review = db.reviews.find(
    (r) => r.id === req.params.reviewId && r.songId === req.params.songId
  );
  if (!review) return error(res, "Review not found", [`Review with id '${req.params.reviewId}' does not exist`], 404);
  return success(res, review, "Review retrieved successfully");
};

// POST /songs/:songId/reviews
const createReview = (req, res) => {
  const song = db.songs.find((s) => s.id === req.params.songId);
  if (!song) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const { reviewer, rating, comment, listenedAt } = req.body;
  const errors = [];

  if (!reviewer)                           errors.push("reviewer is required");
  if (rating === undefined || rating === null) errors.push("rating is required");
  if (rating !== undefined && (isNaN(rating) || Number(rating) < 1 || Number(rating) > 10))
    errors.push("rating must be a number between 1 and 10");
  if (!comment)                            errors.push("comment is required");

  if (errors.length) return error(res, "Validation failed", errors, 422);

  const now = new Date().toISOString();
  const newReview = {
    id: uuidv4(),
    songId: req.params.songId,
    reviewer,
    rating: Number(rating),
    comment,
    listenedAt: listenedAt || now.split("T")[0],
    createdAt: now,
    updatedAt: now,
  };

  db.reviews.push(newReview);
  return success(res, newReview, "Review added successfully", 201);
};

// PUT /songs/:songId/reviews/:reviewId
const updateReview = (req, res) => {
  const index = db.reviews.findIndex(
    (r) => r.id === req.params.reviewId && r.songId === req.params.songId
  );
  if (index === -1) return error(res, "Review not found", [`Review with id '${req.params.reviewId}' does not exist`], 404);

  const { reviewer, rating, comment, listenedAt } = req.body;
  const errors = [];

  if (!reviewer)                               errors.push("reviewer is required");
  if (rating === undefined || rating === null) errors.push("rating is required");
  if (rating !== undefined && (isNaN(rating) || Number(rating) < 1 || Number(rating) > 10))
    errors.push("rating must be a number between 1 and 10");
  if (!comment)                                errors.push("comment is required");

  if (errors.length) return error(res, "Validation failed", errors, 422);

  db.reviews[index] = {
    ...db.reviews[index],
    reviewer,
    rating: Number(rating),
    comment,
    listenedAt: listenedAt || db.reviews[index].listenedAt,
    updatedAt: new Date().toISOString(),
  };

  return success(res, db.reviews[index], "Review updated successfully");
};

// DELETE /songs/:songId/reviews/:reviewId
const deleteReview = (req, res) => {
  const index = db.reviews.findIndex(
    (r) => r.id === req.params.reviewId && r.songId === req.params.songId
  );
  if (index === -1) return error(res, "Review not found", [`Review with id '${req.params.reviewId}' does not exist`], 404);

  const deleted = db.reviews.splice(index, 1)[0];
  return success(res, deleted, "Review deleted successfully");
};

module.exports = { getReviewsBySong, getReviewById, createReview, updateReview, deleteReview };
