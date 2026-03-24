const express = require("express");
const router  = express.Router({ mergeParams: true });
const {
  getReviewsBySong, getReviewById,
  createReview, updateReview, deleteReview,
} = require("../controllers/reviewController");

router.route("/").get(getReviewsBySong).post(createReview);
router.route("/:reviewId").get(getReviewById).put(updateReview).delete(deleteReview);

module.exports = router;
