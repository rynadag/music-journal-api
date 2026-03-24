const { v4: uuidv4 } = require("uuid");

// Seed data — pre-loaded songs, reviews, and logs for testing and development
const SEED_SONGS = [
  {
    id: "a1b2c3d4-0001-0001-0001-000000000001",
    title: "I Want You To Love Me",
    artist: "Fiona Apple",
    album: "Fetch The Bolt Cutters",
    genre: "Art Rock",
    releaseYear: 2020,
    durationSeconds: 237,
    status: "liked",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "a1b2c3d4-0002-0002-0002-000000000002",
    title: "Hard Feelings/Loveless",
    artist: "Lorde",
    album: "Melodrama",
    genre: "Synth-pop",
    releaseYear: 2017,
    durationSeconds: 367,
    status: "liked",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "a1b2c3d4-0003-0003-0003-000000000003",
    title: "A&W",
    artist: "Lana Del Rey",
    album: "Did You Know That There's a Tunnel Under Ocean Blvd",
    genre: "Art Pop",
    releaseYear: 2023,
    durationSeconds: 433,
    status: "neutral",
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
];

const SEED_REVIEWS = [
  {
    id: "b2c3d4e5-0001-0001-0001-000000000001",
    songId: "a1b2c3d4-0001-0001-0001-000000000001",
    reviewer: "Emma",
    rating: 10,
    comment: "She's back with her magnum opus, the raw emotion in this track is palpable.",
    listenedAt: "2024-03-10",
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-03-10T09:00:00.000Z",
  },
  {
    id: "b2c3d4e5-0002-0002-0002-000000000002",
    songId: "a1b2c3d4-0002-0002-0002-000000000002",
    reviewer: "Ryan",
    rating: 10,
    comment: "Such a masterpiece! Lorde's songwriting is on another level here.",
    listenedAt: "2024-03-12",
    createdAt: "2024-03-12T14:00:00.000Z",
    updatedAt: "2024-03-12T14:00:00.000Z",
  },
];

const SEED_LOGS = [
  {
    id: "c3d4e5f6-0001-0001-0001-000000000001",
    songId: "a1b2c3d4-0001-0001-0001-000000000001",
    listener: "Emma",
    listenedAt: "2024-03-10T08:30:00.000Z",
    mood: "nostalgic",
    device: "laptop",
    createdAt: "2024-03-10T08:30:00.000Z",
  },
  {
    id: "c3d4e5f6-0002-0002-0002-000000000002",
    songId: "a1b2c3d4-0002-0002-0002-000000000002",
    listener: "Ryan",
    listenedAt: "2024-03-12T13:00:00.000Z",
    mood: "focused",
    device: "phone",
    createdAt: "2024-03-12T13:00:00.000Z",
  },
];

// Deep clone seed data so reset always gives a fresh copy
const freshCopy = (data) => JSON.parse(JSON.stringify(data));

const db = {
  songs: freshCopy(SEED_SONGS),
  reviews: freshCopy(SEED_REVIEWS),
  logs: freshCopy(SEED_LOGS),

  // Reset to seed state — used in tests
  reset() {
    this.songs = freshCopy(SEED_SONGS);
    this.reviews = freshCopy(SEED_REVIEWS);
    this.logs = freshCopy(SEED_LOGS);
  },
};

module.exports = db;
