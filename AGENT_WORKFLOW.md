# AI Agent Workflow Log

## Agents Used

- GitHub Copilot (GPT-5.3-Codex)

## Prompts & Outputs

- Prompt (original):
	- "Create a monorepo project structure for a FuelEU Maritime compliance platform."
- Output:
	- Created frontend/backend scaffolds with hexagonal folders, strict TypeScript configs, Tailwind/Vite frontend setup, Express backend bootstrap, and root docs.

- Prompt (original):
	- "Generate a minimal Node.js + TypeScript Express server for the backend."
- Output:
	- Added `backend/src/infrastructure/server/app.ts` and `backend/src/infrastructure/server/server.ts` with JSON middleware and `GET /health`.

- Prompt (original):
	- "Create PostgreSQL schema and seed scripts for the FuelEU Maritime backend."
- Output:
	- Added migration + seed SQL:
		- `backend/src/infrastructure/db/migrations/001_init_schema.sql`
		- `backend/src/infrastructure/db/seeds/001_seed_routes.sql`
	- Seeded routes R001–R005 and baseline R001.

- Prompt (original):
	- "Create domain entities for the FuelEU compliance system inside: src/core/domain"
- Output:
	- Added entities: `Route`, `ComplianceBalance`, `BankEntry`, `Pool`, `PoolMember` with simple constructors only.

- Prompt (original):
	- "Create a use case ComputeComplianceBalance inside: src/core/application"
- Output:
	- Added `ComputeComplianceBalance` use case implementing:
		- `EnergyInScope = fuelConsumption * 41000`
		- `ComplianceBalance = (89.3368 - ghgIntensity) * EnergyInScope`

- Prompt (original):
	- "Implement inbound HTTP adapters for routes."
- Output:
	- Implemented:
		- `GET /routes`
		- `POST /routes/:id/baseline`
		- `GET /routes/comparison`
	- Included `% difference` and `compliant <= 89.3368` logic.

- Prompt (original):
	- "Implement banking use cases."
- Output:
	- Added `BankSurplus` and `ApplyBanked` with validations and return shape:
		- `cb_before`, `applied`, `cb_after`.

- Prompt (original):
	- "Implement pooling algorithm according to FuelEU Article 21."
- Output:
	- Added `CreatePool` use case with:
		- `sum(adjustedCB) >= 0`
		- greedy surplus-to-deficit allocation
		- constraints for deficit/surplus post-state safety.

- Prompt (original):
	- "Create a React + TypeScript dashboard with TailwindCSS."
- Output:
	- Added sidebar layout and tab pages:
		- `RoutesPage`, `ComparePage`, `BankingPage`, `PoolingPage`
	- Added fetch-based infrastructure client.

- Prompt (original):
	- "Create Routes table UI."
- Output:
	- Implemented routes table with required columns, filters (vesselType/fuelType/year), and `Set Baseline` action.

- Prompt (original):
	- "Create a comparison chart using Recharts."
- Output:
	- Added bar chart to Compare tab for baseline/comparison `ghgIntensity` and compliant indicators (green check / red cross).

- Prompt (original):
	- "Create banking dashboard."
- Output:
	- Implemented KPIs (`cb_before`, `applied`, `cb_after`) and actions:
		- `Bank Surplus`
		- `Apply Banked`
	- Disabled actions when `cb <= 0`.

- Prompt (original):
	- "Create pooling interface."
- Output:
	- Added selectable ship list with `adjustedCB`, before/after CB display, pool sum indicator (green/red), and `Create Pool` action.

- Prompt (original):
	- "Write unit tests for the following use cases ... Use Jest. Place tests in: /tests"
- Output:
	- Set up Jest (`jest.config.cjs`, `tsconfig.jest.json`) and added `backend/tests/usecases.test.ts` covering:
		- `ComputeComplianceBalance`
		- `BankSurplus`
		- `ApplyBanked`
		- `CreatePool`

- Prompt (original):
	- "check proejct criteria is anything left to do and the dashboard doesnt works"
- Output:
	- Diagnosed runtime gap and implemented missing backend endpoints for compliance/banking/pools.
	- Added CORS middleware to allow frontend-to-backend browser calls.

## Validation / Corrections

- Verified strict TypeScript with editor diagnostics after each change.
- Ran backend unit tests (`npm test`) after core logic and API changes.
- Ran frontend production build (`npm run build`) after UI integration work.
- Performed endpoint smoke checks with PowerShell `Invoke-RestMethod` for routes/compliance/banking/pooling.
- Corrected issues found during validation:
	- `tsconfig rootDir/include` mismatch for backend test config.
	- frontend `import.meta.env` typing by adding `vite-env.d.ts`.
	- missing backend endpoints causing dashboard runtime failures.
	- missing CORS in backend blocking frontend requests.

## Observations

- Where agent saved time
	- Rapidly scaffolded hexagonal folder structures and boilerplate across frontend/backend.
	- Accelerated repetitive UI/table/form wiring and endpoint integration.
	- Produced use-case tests quickly with broad edge-case coverage.

- Where agent failed / hallucinated / needed correction
	- Initial backend HTTP layer did not include all frontend-consumed endpoints.
	- Early docs were placeholders and required completion near submission.
	- Some runtime assumptions required manual endpoint smoke validation.

- How tools were combined effectively
	- Prompt-driven generation for baseline implementation.
	- Iterative compile/test/smoke checks to validate and correct outputs.
	- Git commits after each stage to preserve incremental progress trace.

## Best Practices Followed

- Kept core business logic isolated in use cases (`core/application`) with no framework coupling.
- Preserved domain entities as data-focused classes (`core/domain`).
- Used controller-service separation for inbound HTTP adapters.
- Validated each stage before commit (type checks/build/tests/smoke checks).
- Maintained incremental commit history aligned with staged prompts.
