# ThreatLens

**Website Security Assessment Platform**

ThreatLens helps assess website security through automated checks, deterministic risk scoring, findings analysis, and actionable remediation guidance.

## Features

- Automated website security assessments
- Security findings with severity classifications
- Deterministic scoring and risk classification
- Scan history and persisted results
- Analysis, remediation, and verification guidance
- English and Hindi analysis guidance
- English PDF reports
- FastAPI backend and Next.js frontend

## Project Structure

- `backend/` — FastAPI API, scanning engine, scoring, analysis, reports, and tests
- `frontend/ThreatLens/` — Next.js web application
- `scanner/` — separate scanner package

## Technology Stack

- Python and FastAPI
- Next.js and TypeScript
- SQLite
- Pytest and frontend testing tools

## Local Development

### Backend

Install the dependencies listed in `backend/requirements.txt`, then run:

```bash
cd backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health endpoint: `http://127.0.0.1:8000/api/health`

### Frontend

In a second terminal:

```bash
cd frontend/ThreatLens
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

Use the provided `.env.example` files as configuration references where applicable. Review the project documentation for any additional setup requirements.

## Security Notes

- Only scan websites you own or have explicit permission to assess.
- Do not commit API keys, credentials, real environment files, private certificates, or local databases.
- Backend authentication enforcement and independent domain-ownership verification remain outstanding production requirements.
- The separate scanner package may require additional dependencies before its tests can run.

## Testing

The last recorded verification reported 98 backend tests passing, 7 frontend tests passing, a successful frontend lint check, and a successful production build. These results should be revalidated against the current commit.

## Project Status

This repository contains a release candidate. It is not yet ready to operate as a public production scanning service until the outstanding security requirements are addressed.
