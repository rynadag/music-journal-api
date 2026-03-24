const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { success, error } = require("../middleware/response");

const VALID_STATUSES = ["liked", "disliked", "neutral"];

// GET /songs
const getAllSongs = (req, res) => {
  let songs = [...db.songs];
  const { title, artist, genre, status } = req.query;

  if (title)  songs = songs.filter((s) => s.title.toLowerCase().includes(title.toLowerCase()));
  if (artist) songs = songs.filter((s) => s.artist.toLowerCase().includes(artist.toLowerCase()));
  if (genre)  songs = songs.filter((s) => s.genre?.toLowerCase().includes(genre.toLowerCase()));
  if (status) {
    if (!VALID_STATUSES.includes(status)) {
      return error(res, "Validation failed", [`status must be one of: ${VALID_STATUSES.join(", ")}`], 422);
    }
    songs = songs.filter((s) => s.status === status);
  }

  return success(res, songs, "Songs retrieved successfully");
};

// GET /songs/:songId
const getSongById = (req, res) => {
  const song = db.songs.find((s) => s.id === req.params.songId);
  if (!song) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);
  return success(res, song, "Song retrieved successfully");
};

// POST /songs
const createSong = (req, res) => {
  const { title, artist, album, genre, releaseYear, durationSeconds, status } = req.body;
  const errors = [];

  if (!title)  errors.push("title is required");
  if (!artist) errors.push("artist is required");
  if (!genre)  errors.push("genre is required");
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (errors.length) return error(res, "Validation failed", errors, 422);

  const now = new Date().toISOString();
  const newSong = {
    id: uuidv4(),
    title,
    artist,
    album: album || null,
    genre,
    releaseYear: releaseYear ? Number(releaseYear) : null,
    durationSeconds: durationSeconds ? Number(durationSeconds) : null,
    status: status || "neutral",
    createdAt: now,
    updatedAt: now,
  };

  db.songs.push(newSong);
  return success(res, newSong, "Song added to log successfully", 201);
};

// PUT /songs/:songId — full update
const updateSong = (req, res) => {
  const index = db.songs.findIndex((s) => s.id === req.params.songId);
  if (index === -1) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const { title, artist, album, genre, releaseYear, durationSeconds, status } = req.body;
  const errors = [];

  if (!title)  errors.push("title is required");
  if (!artist) errors.push("artist is required");
  if (!genre)  errors.push("genre is required");
  if (!status) errors.push("status is required");
  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (errors.length) return error(res, "Validation failed", errors, 422);

  db.songs[index] = {
    ...db.songs[index],
    title,
    artist,
    album: album ?? db.songs[index].album,
    genre,
    releaseYear: releaseYear ? Number(releaseYear) : db.songs[index].releaseYear,
    durationSeconds: durationSeconds ? Number(durationSeconds) : db.songs[index].durationSeconds,
    status,
    updatedAt: new Date().toISOString(),
  };

  return success(res, db.songs[index], "Song updated successfully");
};

// PATCH /songs/:songId — partial update
const patchSong = (req, res) => {
  const index = db.songs.findIndex((s) => s.id === req.params.songId);
  if (index === -1) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  const { title, artist, album, genre, releaseYear, durationSeconds, status } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return error(res, "Validation failed", [`status must be one of: ${VALID_STATUSES.join(", ")}`], 422);
  }

  db.songs[index] = {
    ...db.songs[index],
    ...(title !== undefined && { title }),
    ...(artist !== undefined && { artist }),
    ...(album !== undefined && { album }),
    ...(genre !== undefined && { genre }),
    ...(releaseYear !== undefined && { releaseYear: Number(releaseYear) }),
    ...(durationSeconds !== undefined && { durationSeconds: Number(durationSeconds) }),
    ...(status !== undefined && { status }),
    updatedAt: new Date().toISOString(),
  };

  return success(res, db.songs[index], "Song updated successfully");
};

// DELETE /songs/:songId
const deleteSong = (req, res) => {
  const index = db.songs.findIndex((s) => s.id === req.params.songId);
  if (index === -1) return error(res, "Song not found", [`Song with id '${req.params.songId}' does not exist`], 404);

  db.songs.splice(index, 1);
  // Cascade delete: delete associated reviews and logs
  db.reviews = db.reviews.filter((r) => r.songId !== req.params.songId);
  db.logs    = db.logs.filter((l) => l.songId !== req.params.songId);

  return success(res, null, "Song deleted successfully");
};

module.exports = { getAllSongs, getSongById, createSong, updateSong, patchSong, deleteSong };
