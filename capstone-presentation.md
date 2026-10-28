# Capstone Presentation Notes

## 60-second elevator pitch

CareerTrack is a full-stack job application tracker designed for job seekers. It provides a responsive React and TypeScript interface backed by a FastAPI REST API. Users can create a private account, organize applications by company and role, track statuses from Wishlist through Offer or Rejected, search and filter their pipeline, view summary analytics, and export their records to CSV. SQLite makes the project easy to run locally without installing a separate database server. The repository includes tests, Docker configuration, CI, API documentation, and a user guide.

## Demo sequence

1. Open the app and register a demo account.
2. Add an application such as a Junior Python Developer role.
3. Change its status to Interview and show the dashboard statistics.
4. Search for the company and filter by Interview.
5. Export the applications to CSV.
6. Sign out and register a second demo account to show that user records are isolated.
7. Open `/docs` and show the documented API.

Use fictional data in public demos. Do not expose real email addresses, tokens, or secrets.

## Architecture talking points

- FastAPI provides validation, automatic OpenAPI documentation, and HTTP/WebSocket endpoints.
- SQLite persists data; indexes support common user/status and updated-time queries.
- Each protected route scopes database access to the authenticated user.
- React components separate the dashboard, forms, and API client.
- GitHub Actions runs backend tests and builds the frontend on changes.

## Honest limitations to discuss

The WebSocket endpoint demonstrates an authenticated real-time connection and heartbeat; it is not yet a distributed notification broker. Local SQLite is intended for a small single-instance demo. Cloud deployment, monitoring/alerting, OAuth, managed migrations, and external background queues require further configuration and verification.
