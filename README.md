# FuelEU Maritime Compliance Dashboard

Full-stack monorepo for FuelEU Maritime compliance workflows (routes, comparison, banking, pooling) built with a hexagonal architecture.

## Overview

- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Node.js + TypeScript + Express
- Database assets: PostgreSQL schema + seed SQL scripts in backend infrastructure
- Testing: Jest unit tests for core use cases

## Repository Structure

```text
frontend/
backend/
README.md
AGENT_WORKFLOW.md
REFLECTION.md
```

## Hexagonal Architecture

Backend:

```text
backend/src/
	core/
		domain/
		application/
		ports/
	adapters/
		inbound/http/
		outbound/postgres/
	infrastructure/
		db/
		server/
	shared/
```

Frontend:

```text
frontend/src/
	core/
		domain/
		application/
		ports/
	adapters/
		ui/
		infrastructure/
	shared/
```

## Implemented Features

- Routes tab: `/routes` fetch, filters, baseline update (`POST /routes/:id/baseline`)
- Compare tab: comparison table + Recharts bar chart from `/routes/comparison`
- Banking tab: KPI cards (`cb_before`, `applied`, `cb_after`) and actions via `/compliance/cb`, `/banking/bank`, `/banking/apply`
- Pooling tab: selectable ships, pool sum indicator (green/red), create pool via `POST /pools`

## Backend Endpoints

- `GET /health`
- `GET /routes`
- `POST /routes/:id/baseline`
- `GET /routes/comparison`
- `GET /compliance/cb`
- `GET /compliance/adjusted-cb`
- `GET /banking/records`
- `POST /banking/bank`
- `POST /banking/apply`
- `POST /pools`

## Setup & Run

### 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2) Start backend

```bash
cd backend
npm run dev
```

Windows PowerShell (if `npm` is blocked by execution policy):

```bash
cd backend
npm.cmd run dev
```

Backend runs on `http://localhost:4000`.

### 3) Start frontend

```bash
cd frontend
npm run dev
```

Windows PowerShell alternative:

```bash
cd frontend
npm.cmd run dev
```

Frontend runs on `http://localhost:5173` and calls backend on `http://localhost:4000` by default.

In development, frontend API calls use `/api/*` and are proxied by Vite to `http://localhost:4000`.
You can override this by setting `VITE_API_BASE_URL` (for example, to point to a deployed backend).

### Troubleshooting: `Request failed with status 500` in frontend

If Routes (or other tabs) show `500` while calling `/api/*`, the backend is usually not running.

1. Start backend on port `4000`:

```bash
cd backend
npm.cmd run dev
```

2. Verify health:

```bash
curl http://localhost:4000/health
```

3. Keep frontend running on `5173` so Vite proxy can forward `/api/*` to backend.

## Tests

Backend tests:

```bash
cd backend
npm test
```

Covered use cases:

- `ComputeComplianceBalance`
- `BankSurplus`
- `ApplyBanked`
- `CreatePool`

Integration coverage (Supertest):

- `GET /routes`
- `POST /routes/:id/baseline`
- `GET /banking/records`

## PostgreSQL Schema & Seeds

SQL scripts are located at:

- `backend/src/infrastructure/db/migrations/001_init_schema.sql`
- `backend/src/infrastructure/db/seeds/001_seed_routes.sql`

### Quick local PostgreSQL bootstrap (Docker)

```bash
docker run --name fueleu-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=fueleu -p 5432:5432 -d postgres:16
```

Apply schema and seed (from repo root):

```bash
psql "postgresql://postgres:postgres@localhost:5432/fueleu" -f backend/src/infrastructure/db/migrations/001_init_schema.sql
psql "postgresql://postgres:postgres@localhost:5432/fueleu" -f backend/src/infrastructure/db/seeds/001_seed_routes.sql
```

## Sample Requests / Responses

### `GET /routes`

Response (sample):

```json
[
	{
		"routeId": "R001",
		"vesselType": "Container",
		"fuelType": "HFO",
		"year": 2024,
		"ghgIntensity": 91,
		"fuelConsumption": 5000,
		"distance": 12000,
		"totalEmissions": 4500,
		"isBaseline": true
	}
]
```

### `POST /routes/R004/baseline`

Response (sample):

```json
{
	"routeId": "R004",
	"vesselType": "RoRo",
	"fuelType": "HFO",
	"year": 2025,
	"ghgIntensity": 89.2,
	"fuelConsumption": 4900,
	"distance": 11800,
	"totalEmissions": 4300,
	"isBaseline": true
}
```

### `GET /routes/comparison`

Response (sample):

```json
{
	"baseline": {
		"routeId": "R001",
		"ghgIntensity": 91,
		"percentDiff": 0,
		"compliant": false
	},
	"comparisons": [
		{
			"routeId": "R002",
			"ghgIntensity": 88,
			"percentDiff": -3.2967032967032965,
			"compliant": true
		}
	]
}
```

### `POST /banking/bank`

Response (sample):

```json
{
	"cb_before": 263082239.99999934,
	"applied": 263082239.99999934,
	"cb_after": 0
}
```

### `GET /banking/records?year=2024`

Response (sample):

```json
[
	{
		"shipId": "R002",
		"year": 2024,
		"amount_gco2eq": 263082239.99999934
	}
]
```

### `POST /pools`

Request (sample):

```json
{
	"year": 2025,
	"members": [
		{ "shipId": "S1", "adjustedCB": 100 },
		{ "shipId": "S2", "adjustedCB": -40 }
	]
}
```

Response (sample):

```json
{
	"pool_members": [
		{ "shipId": "S1", "cb_before": 100, "cb_after": 60 },
		{ "shipId": "S2", "cb_before": -40, "cb_after": 0 }
	]
}
```

## Screenshots

Dashboard screenshots are captured during development and can be attached in submission artifacts.

