# music-journal-api

> A RESTful API for logging, reviewing, and tracking personal music listening history.

![CI & Security Scan](https://github.com/YOUR_USERNAME/music-journal-api/actions/workflows/ci-cs.yml/badge.svg)
![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)
![Express](https://img.shields.io/badge/express-4.x-lightgrey)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker](#run-with-docker)
  - [Run Locally](#run-locally)
- [API Reference](#api-reference)
  - [Base URL](#base-url)
  - [Response Format](#response-format)
  - [Endpoints](#endpoints)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Git Workflow](#git-workflow)
- [Project Structure](#project-structure)
- [Examples](#examples)
- [License](#license)

---

## Overview

**music-journal-api** is a lightweight RESTful API that lets users manage a personal music catalog, write reviews with numerical ratings, and record listening history. The API ships with seed data so it works immediately after startup — no manual input required.

---

## Features

- 🎵 **Song Catalog** — Create, read, update, and delete songs with metadata (artist, album, genre, duration, release year)
- 🏷️ **Status Tagging** — Mark songs as `liked`, `disliked`, or `neutral`
- ⭐ **Reviews** — Write reviews with a 1–10 rating scale and required comment per song
- 📋 **Listen Logs** — Record every listening session with mood and device metadata
- 🔍 **Filtering** — Query songs by title, artist, genre, or status; filter logs by listener
- 🗑️ **Cascade Delete** — Deleting a song automatically removes all associated reviews and logs
- 🐳 **Docker Ready** — Single command to spin up the entire stack
- ✅ **Automated Testing** — Jest unit tests with Supertest covering 30+ cases
- 🔒 **CI/CD** — GitHub Actions pipeline for automated testing and security scanning

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Testing | Jest + Supertest |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Security Scanning | npm audit + Gitleaks |
| ID Generation | uuid v9 |

---

## Getting Started

### Prerequisites

Choose one of the following:

- **Docker** (recommended) — Docker Engine + Docker Compose
- **Local** — Node.js 20+, npm

### Run with Docker

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/music-journal-api.git
cd music-journal-api

# 2. Build and start the container
docker-compose up --build

# 3. The API is now available at:
#    http://localhost:3000
```

To stop the container:

```bash
docker-compose down
```

**Port mapping:**

| Host | Container | Service |
|---|---|---|
| `3000` | `3000` | music-journal-api |

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/music-journal-api.git
cd music-journal-api

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Or start in production mode
npm start

# The API is available at http://localhost:3000
```

---

## API Reference

### Base URL

```
http://localhost:3000
```

### Response Format

All endpoints return a consistent JSON envelope.

**Success `2xx`**

```json
{
  "status": "OK",
  "message": "Song added to log successfully",
  "data": { ... },
  "errors": null
}
```

**Error `4xx` / `5xx`**

```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "data": null,
  "errors": [
    "title is required",
    "genre is required"
  ]
}
```

---

### Endpoints

#### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check API status |

---

#### Songs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/songs` | List all songs |
| `POST` | `/songs` | Add a new song |
| `GET` | `/songs/:songId` | Get a single song |
| `PUT` | `/songs/:songId` | Full update of a song |
| `PATCH` | `/songs/:songId` | Partial update (e.g. status only) |
| `DELETE` | `/songs/:songId` | Delete song + cascade reviews & logs |

**Query parameters for `GET /songs`:**

| Parameter | Type | Description | Example |
|---|---|---|---|
| `title` | string | Filter by title (case-insensitive, partial match) | `?title=bohemian` |
| `artist` | string | Filter by artist | `?artist=queen` |
| `genre` | string | Filter by genre | `?genre=rock` |
| `status` | string | Filter by status (`liked`, `disliked`, `neutral`) | `?status=liked` |

**Song object fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | — |
| `artist` | string | ✅ | — |
| `genre` | string | ✅ | — |
| `album` | string | ❌ | Defaults to `null` |
| `releaseYear` | number | ❌ | — |
| `durationSeconds` | number | ❌ | — |
| `status` | string | ❌ | `liked` / `disliked` / `neutral` — defaults to `neutral` |

---

#### Reviews

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/songs/:songId/reviews` | List all reviews for a song |
| `POST` | `/songs/:songId/reviews` | Add a review |
| `GET` | `/songs/:songId/reviews/:reviewId` | Get a single review |
| `PUT` | `/songs/:songId/reviews/:reviewId` | Update a review |
| `DELETE` | `/songs/:songId/reviews/:reviewId` | Delete a review |

**Review object fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `reviewer` | string | ✅ | — |
| `rating` | number | ✅ | Integer between `1` and `10` |
| `comment` | string | ✅ | Cannot be empty |
| `listenedAt` | string | ❌ | ISO date (`YYYY-MM-DD`), defaults to today |

---

#### Listen Logs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/songs/:songId/logs` | List listen logs for a song |
| `POST` | `/songs/:songId/logs` | Record a new listening session |
| `DELETE` | `/songs/:songId/logs/:logId` | Delete a listen log |
| `GET` | `/logs` | All listen logs (enriched with song info) |

**Query parameters for `GET /logs`:**

| Parameter | Type | Description | Example |
|---|---|---|---|
| `listener` | string | Filter by listener name (partial match) | `?listener=alice` |

**Listen log object fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `listener` | string | ✅ | — |
| `listenedAt` | string | ❌ | ISO datetime, defaults to now |
| `mood` | string | ❌ | e.g. `nostalgic`, `focused`, `happy` |
| `device` | string | ❌ | e.g. `laptop`, `phone`, `headphones` |

---

## Running Tests

```bash
npm test
```

Runs the full Jest suite with coverage report. All 30+ test cases must pass.

```
PASS  tests/songs.test.js
PASS  tests/reviews-logs.test.js

Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
```

---

## CI/CD Pipeline

The workflow at `.github/workflows/ci-cs.yml` triggers automatically on:
- **Push** to `main` or `develop`
- **Pull Request** targeting `develop`

| Step | Type | Description |
|---|---|---|
| Checkout Code | — | Fetch repository contents |
| Set up Node.js | — | Configure Node 20 runtime |
| Install Dependencies | — | `npm install` |
| Run Unit Tests | **CI** | `npm test` via Jest |
| Audit Dependencies | **CS** | `npm audit --audit-level=high` |
| Check for Secrets | **CS** | Gitleaks — detect leaked credentials |

---

## Git Workflow

### Branch Strategy

```
main
└── develop
    ├── feature/be/init-project       ← express bootstrap + in-memory db
    ├── feature/be/songs-crud         ← songs controller & routes
    ├── feature/be/reviews            ← reviews controller & routes
    ├── feature/be/listen-logs        ← listen logs controller & routes
    ├── feature/be/docker             ← Dockerfile, .dockerignore, docker-compose
    ├── feature/be/ci-cs              ← GitHub Actions workflow
    └── feature/be/tests-and-docs     ← unit tests + README
```

All feature branches merge into `develop` via `--no-ff`. Once stable, `develop` is merged into `main` as a release.

### Conventional Commits

Format: `<type>(<scope>): <description>`

| Type | Used for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Build, config, tooling |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `ci` | CI/CD configuration |
| `refactor` | Code restructure without behavior change |

---

## Project Structure

```
music-journal-api/
├── .github/
│   └── workflows/
│       └── ci-cs.yml         # GitHub Actions CI & security scan
├── src/
│   ├── controllers/
│   │   ├── songController.js
│   │   ├── reviewController.js
│   │   └── logController.js
│   ├── middleware/
│   │   └── response.js       # Standardized JSON response helpers
│   ├── routes/
│   │   ├── songs.js
│   │   ├── reviews.js
│   │   └── logs.js
│   ├── db.js                 # In-memory store with seed data
│   └── app.js                # Express app entry point
├── tests/
│   ├── songs.test.js
│   └── reviews-logs.test.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── package.json
└── README.md
```

---

## Examples

```bash
# Health check
curl http://localhost:3000/health

# List all songs (seed data pre-loaded)
curl http://localhost:3000/songs

# Filter songs by status
curl "http://localhost:3000/songs?status=liked"

# Add a new song
curl -X POST http://localhost:3000/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Starboy",
    "artist": "The Weeknd",
    "genre": "Pop",
    "album": "Starboy",
    "releaseYear": 2016,
    "status": "liked"
  }'

# Partial update — change status only
curl -X PATCH http://localhost:3000/songs/<songId> \
  -H "Content-Type: application/json" \
  -d '{"status": "disliked"}'

# Add a review
curl -X POST http://localhost:3000/songs/<songId>/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer": "Alice",
    "rating": 9,
    "comment": "Incredibly catchy, perfect for late-night drives.",
    "listenedAt": "2026-03-14"
  }'

# Record a listening session
curl -X POST http://localhost:3000/songs/<songId>/logs \
  -H "Content-Type: application/json" \
  -d '{
    "listener": "Alice",
    "mood": "nostalgic",
    "device": "laptop"
  }'

# Get all listen logs filtered by listener
curl "http://localhost:3000/logs?listener=alice"

# Delete a song (cascades to its reviews and logs)
curl -X DELETE http://localhost:3000/songs/<songId>
```

---

## License

This project is licensed under the [MIT License](LICENSE).