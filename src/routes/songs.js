const express = require("express");
const router  = express.Router();
const {
  getAllSongs, getSongById,
  createSong, updateSong, patchSong, deleteSong,
} = require("../controllers/songController");

router.route("/").get(getAllSongs).post(createSong);
router.route("/:songId").get(getSongById).put(updateSong).patch(patchSong).delete(deleteSong);

module.exports = router;
