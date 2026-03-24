const request = require("supertest");
const app = require("../src/app");
const db  = require("../src/db");

beforeEach(() => db.reset());

// ── Reviews ──────────────────────────────────────────────────
describe("Reviews API", () => {
  const SEED_SONG_ID = "a1b2c3d4-0001-0001-0001-000000000001"; // Bohemian Rhapsody

  describe("GET /songs/:songId/reviews", () => {
    it("returns seeded reviews for a song", async () => {
      const res = await request(app).get(`/songs/${SEED_SONG_ID}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("returns 404 if song does not exist", async () => {
      const res = await request(app).get("/songs/fake-id/reviews");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /songs/:songId/reviews", () => {
    it("creates a valid review", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Charlie", rating: 9, comment: "Timeless classic." });
      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(9);
      expect(res.body.data.songId).toBe(SEED_SONG_ID);
    });

    it("returns 422 if reviewer is missing", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ rating: 7, comment: "Good." });
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain("reviewer is required");
    });

    it("returns 422 if comment is missing", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Dave", rating: 7 });
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain("comment is required");
    });

    it("returns 422 if rating > 10", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Eve", rating: 11, comment: "Too much." });
      expect(res.status).toBe(422);
    });

    it("returns 422 if rating < 1", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Eve", rating: 0, comment: "Zero?" });
      expect(res.status).toBe(422);
    });
  });

  describe("PUT /songs/:songId/reviews/:reviewId", () => {
    it("updates an existing review", async () => {
      const created = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Frank", rating: 6, comment: "Decent." });

      const reviewId = created.body.data.id;
      const res = await request(app)
        .put(`/songs/${SEED_SONG_ID}/reviews/${reviewId}`)
        .send({ reviewer: "Frank", rating: 8, comment: "Actually great!" });

      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(8);
      expect(res.body.data.comment).toBe("Actually great!");
    });

    it("returns 404 for unknown review", async () => {
      const res = await request(app)
        .put(`/songs/${SEED_SONG_ID}/reviews/fake-review`)
        .send({ reviewer: "X", rating: 5, comment: "X" });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /songs/:songId/reviews/:reviewId", () => {
    it("deletes a review", async () => {
      const created = await request(app)
        .post(`/songs/${SEED_SONG_ID}/reviews`)
        .send({ reviewer: "Grace", rating: 5, comment: "Meh." });

      const reviewId = created.body.data.id;
      const del = await request(app).delete(`/songs/${SEED_SONG_ID}/reviews/${reviewId}`);
      expect(del.status).toBe(200);
      expect(del.body.data.id).toBe(reviewId);
    });
  });
});

// ── Listen Logs ──────────────────────────────────────────────
describe("Listen Logs API", () => {
  const SEED_SONG_ID = "a1b2c3d4-0002-0002-0002-000000000002"; // Blinding Lights

  describe("GET /songs/:songId/logs", () => {
    it("returns seeded logs for a song", async () => {
      const res = await request(app).get(`/songs/${SEED_SONG_ID}/logs`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /songs/:songId/logs", () => {
    it("creates a listen log with all fields", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/logs`)
        .send({ listener: "Hana", mood: "happy", device: "earphones" });
      expect(res.status).toBe(201);
      expect(res.body.data.listener).toBe("Hana");
      expect(res.body.data.mood).toBe("happy");
    });

    it("returns 422 if listener is missing", async () => {
      const res = await request(app)
        .post(`/songs/${SEED_SONG_ID}/logs`)
        .send({ mood: "chill" });
      expect(res.status).toBe(422);
      expect(res.body.errors).toContain("listener is required");
    });

    it("returns 404 for unknown song", async () => {
      const res = await request(app)
        .post("/songs/fake-song/logs")
        .send({ listener: "X" });
      expect(res.status).toBe(404);
    });
  });

  describe("GET /logs (global)", () => {
    it("returns all logs with enriched song info", async () => {
      const res = await request(app).get("/logs");
      expect(res.status).toBe(200);
      expect(res.body.data[0].songTitle).toBeDefined();
      expect(res.body.data[0].songArtist).toBeDefined();
    });

    it("filters by listener name", async () => {
      const res = await request(app).get("/logs?listener=alice");
      expect(res.status).toBe(200);
      res.body.data.forEach((l) =>
        expect(l.listener.toLowerCase()).toContain("alice")
      );
    });
  });

  describe("DELETE /songs/:songId/logs/:logId", () => {
    it("deletes a listen log", async () => {
      const created = await request(app)
        .post(`/songs/${SEED_SONG_ID}/logs`)
        .send({ listener: "Ivan" });

      const logId = created.body.data.id;
      const del = await request(app).delete(`/songs/${SEED_SONG_ID}/logs/${logId}`);
      expect(del.status).toBe(200);
      expect(del.body.data.id).toBe(logId);
    });

    it("returns 404 for unknown log", async () => {
      const res = await request(app).delete(`/songs/${SEED_SONG_ID}/logs/fake-log`);
      expect(res.status).toBe(404);
    });
  });
});
