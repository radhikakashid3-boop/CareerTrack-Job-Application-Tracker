# API Reference

Interactive OpenAPI/Swagger UI: `http://localhost:8000/docs`.

All routes below use `http://localhost:8000` as the local base URL. Protected HTTP routes require `Authorization: Bearer <access_token>`.

## Authentication

- `POST /api/auth/register` — body `{ "email": "you@example.com", "password": "at-least-8-characters" }`; returns `access_token`, `token_type`, and user profile.
- `POST /api/auth/login` — same body; returns a bearer token.
- `GET /api/auth/me` — returns current user.

## Applications

- `GET /api/applications?search=python&application_status=Applied` — list, search and filter.
- `POST /api/applications` — create.
- `GET /api/applications/{id}` — read one owned record.
- `PUT /api/applications/{id}` — replace editable fields.
- `DELETE /api/applications/{id}` — delete.
- `GET /api/applications/export.csv` — download the user's records as CSV.
- `GET /api/stats` — total, count per status, interview rate.
- `GET /health` — health check (no authentication).
- `WS /ws/notifications?token=<access_token>` — authenticated WebSocket connection and ping/pong heartbeat.

## Application payload example

```json
{
  "company": "Example Ltd",
  "role": "Junior Python Developer",
  "location": "Pune",
  "job_url": "https://example.com/jobs/123",
  "status": "Applied",
  "applied_date": "2026-10-28",
  "notes": "Follow up next week"
}
```

Status is one of `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`. Company and role must not be blank. Common responses: `201` created, `401` missing/invalid token, `404` record not found or not owned by the user, `409` duplicate email, and `422` validation error.
