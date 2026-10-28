# Architecture

## Overview

The application uses a React + TypeScript single-page UI and a FastAPI REST API. The browser calls `/api` with a bearer token. FastAPI validates the token and scopes application queries to the authenticated user's database ID. SQLite stores user and application records and creates indexes on `(user_id, status)` and `(user_id, updated_at)`.

```text
Browser (React/TypeScript)
  ├── REST/JSON + Bearer token ──> FastAPI routes/authentication
  └── WebSocket + token ─────────> Live connection/heartbeat endpoint
                                      │
                                      v
                                 SQLite database
```

## Data model

- **User**: unique email, salted password hash, creation timestamp.
- **Application**: owner foreign key, company, role, location, job URL, status, application date, notes, created/updated timestamps.
- Status values: Wishlist, Applied, Interview, Offer, Rejected.

## Security and performance

Password verification uses `hashlib.scrypt`; bearer tokens are signed with HMAC-SHA256 and expire. Application routes always filter by owner ID. SQLite foreign keys, WAL mode, and indexes help integrity and query performance. Search uses parameterized SQL; user input is not interpolated into SQL statements.

## Limitations

The WebSocket currently provides connection/heartbeat notifications, not a durable event broker. SQLite is intended for a single-instance demo. Before production, add managed database migrations, rate limiting, refresh-token/session revocation, structured logging, metrics/alerts, and security review.
