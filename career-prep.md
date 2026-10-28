# Career Preparation — Presenting CareerTrack

## Resume project entry (edit to reflect your actual contribution)

**CareerTrack — Job Application Tracker | Python, FastAPI, React, TypeScript, SQLite, Docker**
- Built a full-stack application with authenticated REST endpoints for managing job applications, including search, status filtering, analytics, and CSV export.
- Added SQLite persistence, per-user data isolation, indexed queries, and salted password hashing with expiring signed tokens.
- Created a responsive React/TypeScript dashboard and added automated backend tests, frontend API-client tests, Docker configuration, and GitHub Actions CI.

Only list features you have personally run, understood, and can explain in an interview.

## Interview questions to practice

1. Why did you choose FastAPI for this project?
2. What is the difference between authentication and authorization?
3. How does a bearer token get validated on a protected endpoint?
4. Why should database queries be parameterized?
5. What is a foreign key, and why does `applications.user_id` reference `users.id`?
6. How does an index improve a query, and what trade-off does it introduce?
7. What is the difference between REST and WebSocket communication?
8. Why are tests isolated with a temporary database?
9. What would you change before scaling to many concurrent users?
10. How does the CI workflow catch regressions?

## Self-review checklist

- [ ] I can explain every major file I submit.
- [ ] I can register, log in, create/edit/delete, search/filter, and export records.
- [ ] I can explain how data is isolated between users.
- [ ] I ran backend tests and the frontend build locally.
- [ ] I changed the development secret before any deployment.
- [ ] I can describe current limitations honestly.
