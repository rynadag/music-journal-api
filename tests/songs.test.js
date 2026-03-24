const request = require("supertest");
const app = require("../src/app");
const db  = require("../src/db");

beforeEach(() => db.reset());

// ── GET /songs ──────────────────────────────────────────────
describe("GET /songs", () => {
  it("returns all songs (seed: 3)", async () => {
    const res = await request(app).get("/songs");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.data).toHaveLength(3);
  });

  it("filters by genre (case-insensitive)", async () => {
    const res = await request(app).get("/songs?genre=pop");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((s) => expect(s.genre.toLowerCase()).toContain("pop"));
  });

  it("filters by status=liked", async () => {
    const res = await request(app).get("/songs?status=liked");
    expect(res.status).toBe(200);
    res.body.data.forEach((s) => expect(s.status).toBe("liked"));
  });

  it("returns 422 for invalid status filter", async () => {
    const res = await request(app).get("/songs?status=unknown");
    expect(res.status).toBe(422);
    expect(res.body.status).toBe("ERROR");
  });

  it("filters by artist (partial match)", async () => {
    const res = await request(app).get("/songs?artist=queen");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].artist).toBe("Queen");
  });
});

// ── POST /songs ─────────────────────────────────────────────
describe("POST /songs", () => {
  it("creates a song with all fields", async () => {
    const payload = {
      title: "Starboy", artist: "The Weeknd",
      genre: "Pop", status: "liked",
      album: "Starboy", releaseYear: 2016, durationSeconds: 230,
    };
    const res = await request(app).post("/songs").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe("Starboy");
    expect(res.body.data.status).toBe("liked");
  });

  it("defaults status to neutral if not provided", async () => {
    const res = await request(app).post("/songs").send({ title: "X", artist: "Y", genre: "Z" });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("neutral");
  });

  it("returns 422 when title is missing", async () => {
    const res = await request(app).post("/songs").send({ artist: "Y", genre: "Z" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toContain("title is required");
  });

  it("returns 422 when genre is missing", async () => {
    const res = await request(app).post("/songs").send({ title: "X", artist: "Y" });
    expect(res.status).toBe(422);
    expect(res.body.errors).toContain("genre is required");
  });

  it("returns 422 for invalid status value", async () => {
    const res = await request(app).post("/songs").send({ title: "X", artist: "Y", genre: "Z", status: "bad" });
    expect(res.status).toBe(422);
  });
});

// ── GET /songs/:songId ──────────────────────────────────────
describe("GET /songs/:songId", () => {
  it("returns a seeded song by id", async () => {
    const id = db.songs[0].id;
    const res = await request(app).get(`/songs/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("returns 404 for non-existent id", async () => {
    const res = await request(app).get("/songs/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.status).toBe("ERROR");
  });
});

// ── PUT /songs/:songId ──────────────────────────────────────
describe("PUT /songs/:songId", () => {
  it("fully updates a song", async () => {
    const id = db.songs[0].id;
    const res = await request(app).put(`/songs/${id}`).send({
      title: "Updated", artist: "Updated Artist", genre: "Jazz", status: "disliked",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated");
    expect(res.body.data.status).toBe("disliked");
  });

  it("returns 422 if required fields are missing", async () => {
    const id = db.songs[0].id;
    const res = await request(app).put(`/songs/${id}`).send({ title: "Only title" });
    expect(res.status).toBe(422);
  });

  it("returns 404 for unknown song", async () => {
    const res = await request(app).put("/songs/fake").send({
      title: "T", artist: "A", genre: "G", status: "liked",
    });
    expect(res.status).toBe(404);
  });
});

// ── PATCH /songs/:songId ────────────────────────────────────
describe("PATCH /songs/:songId", () => {
  it("partially updates only status", async () => {
    const id = db.songs[2].id; // neutral seed song
    const res = await request(app).patch(`/songs/${id}`).send({ status: "liked" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("liked");
    expect(res.body.data.title).toBe(db.songs[2].title); // title unchanged
  });

  it("returns 422 for invalid status in patch", async () => {
    const id = db.songs[0].id;
    const res = await request(app).patch(`/songs/${id}`).send({ status: "invalid" });
    expect(res.status).toBe(422);
  });
});

// ── DELETE /songs/:songId ───────────────────────────────────
describe("DELETE /songs/:songId", () => {
  it("deletes a song and its reviews/logs", async () => {
    const id = db.songs[0].id;
    const del = await request(app).delete(`/songs/${id}`);
    expect(del.status).toBe(200);

    const get = await request(app).get(`/songs/${id}`);
    expect(get.status).toBe(404);

    // Reviews for that song should also be gone
    const reviews = await request(app).get(`/songs/${id}/reviews`);
    expect(reviews.status).toBe(404); // song gone → 404
  });

  it("returns 404 for unknown song", async () => {
    const res = await request(app).delete("/songs/fake");
    expect(res.status).toBe(404);
  });
});
