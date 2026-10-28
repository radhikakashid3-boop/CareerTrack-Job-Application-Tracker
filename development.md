# Development Guide

## Prerequisites

- Python 3.11+ (Python 3.12 recommended)
- Node.js 20+ and npm
- GitHub account for source hosting (Git CLI is not required to run locally)
- Docker Desktop is optional

## Local workflow

Run backend and frontend in separate terminals. Backend: `cd backend`, activate the virtual environment, install `requirements.txt`, then `uvicorn src.main:app --reload`. Frontend: `cd frontend`, `npm install`, `npm run dev`.

## Quality checks

- Backend tests: `python -m pytest -v` from `backend`.
- Frontend test: `npm test` from `frontend`.
- Production bundle: `npm run build` from `frontend`.
- API manual checks: use `/docs` and create a test account.

## Review checklist

- Keep route handlers thin; put persistence operations in `ApplicationService`.
- Use Pydantic validation and parameterized SQL.
- Check user ownership on every record operation.
- Do not commit `.venv`, `node_modules`, `.env`, database files, or credentials.
- Add tests for every bug fix and user-facing feature.
