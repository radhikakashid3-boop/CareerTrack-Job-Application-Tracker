# Deployment Guide

## Local Docker

Set a unique `CAREERTRACK_SECRET_KEY` in the shell and run `docker compose up --build` from the repository root. The backend health check must pass before the frontend container starts. SQLite data is persisted in the `careertrack_data` named volume.

## Cloud deployment checklist

1. Choose a host that supports Docker and persistent storage, or use a managed PostgreSQL service for multi-instance deployments.
2. Configure `CAREERTRACK_SECRET_KEY` as a platform secret; never use the development fallback.
3. Set `CORS_ORIGINS` to the exact HTTPS frontend origin(s).
4. Configure HTTPS/TLS, domain, backups, and retention.
5. Add error tracking, metrics, uptime alerts, and log retention.
6. Run tests and a dependency/security scan in CI before deploying.
7. Smoke-test registration, login, per-user isolation, CRUD, export, and health after release.

Cloud resources, DNS/SSL, provider secrets, monitoring integrations, and Terraform/Kubernetes execution are not automatically provisioned by this repository. Complete and verify them in the chosen provider before describing the project as cloud-deployed or production-ready.
