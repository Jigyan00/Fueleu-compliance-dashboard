export type Route = {
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    fuelConsumption: number;
    distance: number;
    totalEmissions: number;
    isBaseline: boolean;
};

export type ComparisonRow = {
    routeId: string;
    ghgIntensity: number;
    percentDiff: number;
    compliant: boolean;
};

export type RoutesComparison = {
    baseline: ComparisonRow;
    comparisons: ComparisonRow[];
};

export type BankingResult = {
    cb_before: number;
    applied: number;
    cb_after: number;
};

export type AdjustedCbShip = {
    shipId: string;
    adjustedCB: number;
};

export type PoolMember = {
    shipId: string;
    cb_before: number;
    cb_after: number;
};
