const express = require("express");
const router  = express.Router({ mergeParams: true });
const { getLogsBySong, createLog, deleteLog } = require("../controllers/logController");

router.route("/").get(getLogsBySong).post(createLog);
router.route("/:logId").delete(deleteLog);

module.exports = router;
