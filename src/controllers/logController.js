const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { success, error } = require("../middleware/response");

// GET /songs/:songId/logs
const getLogsBySong = (req, res) => {
  const song = db.songs.find((s) => s.id === req.params.songId);
  if (!song) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const logs = db.logs.filter((l) => l.songId === req.params.songId);
  return success(res, logs, "Listen logs retrieved successfully");
};

// GET /logs — global, enriched with song info, filterable by listener
const getAllLogs = (req, res) => {
  let logs = [...db.logs];
  const { listener } = req.query;

  if (listener) {
    logs = logs.filter((l) => l.listener.toLowerCase().includes(listener.toLowerCase()));
  }

  const enriched = logs.map((l) => {
    const song = db.songs.find((s) => s.id === l.songId);
    return {
      ...l,
      songTitle:  song ? song.title  : "Unknown",
      songArtist: song ? song.artist : "Unknown",
    };
  });

  return success(res, enriched, "Listen logs retrieved successfully");
};

// POST /songs/:songId/logs
const createLog = (req, res) => {
  const song = db.songs.find((s) => s.id === req.params.songId);
  if (!song) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const { listener, listenedAt, mood, device } = req.body;
  if (!listener) return error(res, "Validation failed", ["listener is required"], 422);

  const now = new Date().toISOString();
  const newLog = {
    id: uuidv4(),
    songId: req.params.songId,
    listener,
    listenedAt: listenedAt || now,
    mood:   mood   || null,
    device: device || null,
    createdAt: now,
  };

  db.logs.push(newLog);
  return success(res, newLog, "Listen log created successfully", 201);
};

// DELETE /songs/:songId/logs/:logId
const deleteLog = (req, res) => {
  const index = db.logs.findIndex(
    (l) => l.id === req.params.logId && l.songId === req.params.songId
  );
  if (index === -1) return error(res, "Listen log not found", [`Log with id '${req.params.logId}' does not exist`], 404);

  const deleted = db.logs.splice(index, 1)[0];
  return success(res, deleted, "Listen log deleted successfully");
};

module.exports = { getLogsBySong, getAllLogs, createLog, deleteLog };
