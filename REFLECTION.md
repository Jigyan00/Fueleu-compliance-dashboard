# Reflection

Building this FuelEU assignment with AI assistance highlighted the difference between fast code generation and production-ready delivery. The biggest learning was that agent outputs are strongest when prompts are narrow, staged, and anchored to architecture boundaries. Asking for one bounded change at a time (domain entity, then use case, then inbound adapter, then UI tab) produced cleaner results than broad "build everything" prompts.

I observed clear efficiency gains in scaffolding and repetitive implementation. Hexagonal folder setup, boilerplate TS classes, endpoint handlers, table UIs, and test templates were generated very quickly. This reduced mechanical coding effort and let me spend more time on correctness checks, API shape alignment, and enforcing FuelEU-specific constraints like pooling validity and banking guardrails.

At the same time, AI output required active validation. A few gaps appeared (missing endpoints consumed by frontend, placeholder docs left incomplete, runtime CORS omission) that were only caught through integration testing and smoke calls. The key lesson is that AI accelerates implementation but does not replace verification discipline.

If I repeat this project, I would improve in three ways:

1. Define API contracts first (OpenAPI or typed shared contracts) to avoid frontend/backend drift.
2. Add integration tests earlier (Supertest for each endpoint) to catch runtime gaps sooner.
3. Wire PostgreSQL adapters into runtime flows earlier instead of relying on in-memory state during intermediate stages.

Overall, AI materially improved development speed and reduced boilerplate effort, while final quality still depended on iterative validation, clear architectural boundaries, and incremental commits.
