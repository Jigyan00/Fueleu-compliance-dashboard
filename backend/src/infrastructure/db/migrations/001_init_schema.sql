CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id TEXT NOT NULL UNIQUE,
    vessel_type TEXT NOT NULL,
    fuel_type TEXT NOT NULL,
    year INT NOT NULL,
    ghg_intensity DOUBLE PRECISION NOT NULL,
    fuel_consumption DOUBLE PRECISION NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    total_emissions DOUBLE PRECISION NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ship_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id TEXT NOT NULL,
    year INT NOT NULL,
    cb_gco2eq DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id TEXT NOT NULL,
    year INT NOT NULL,
    amount_gco2eq DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_members (
    pool_id UUID NOT NULL,
    ship_id TEXT NOT NULL,
    cb_before DOUBLE PRECISION NOT NULL,
    cb_after DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (pool_id, ship_id),
    CONSTRAINT fk_pool_members_pool
        FOREIGN KEY (pool_id)
        REFERENCES pools(id)
        ON DELETE CASCADE
);
