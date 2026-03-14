type RouteRecord = {
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

type RouteComparisonRecord = {
    routeId: string;
    ghgIntensity: number;
    percentDiff: number;
    compliant: boolean;
};

type RoutesComparisonResponse = {
    baseline: RouteComparisonRecord;
    comparisons: RouteComparisonRecord[];
};

const COMPLIANCE_TARGET = 89.3368;

const initialRoutes: RouteRecord[] = [
    {
        routeId: "R001",
        vesselType: "Container",
        fuelType: "HFO",
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true
    },
    {
        routeId: "R002",
        vesselType: "BulkCarrier",
        fuelType: "LNG",
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false
    },
    {
        routeId: "R003",
        vesselType: "Tanker",
        fuelType: "MGO",
        year: 2024,
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        isBaseline: false
    },
    {
        routeId: "R004",
        vesselType: "RoRo",
        fuelType: "HFO",
        year: 2025,
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        isBaseline: false
    },
    {
        routeId: "R005",
        vesselType: "Container",
        fuelType: "LNG",
        year: 2025,
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        isBaseline: false
    }
];

export class RoutesService {
    private routes: RouteRecord[];

    constructor(seedRoutes: RouteRecord[] = initialRoutes) {
        this.routes = seedRoutes.map((route) => ({ ...route }));
    }

    getAllRoutes(): RouteRecord[] {
        return this.routes.map((route) => ({ ...route }));
    }

    setBaseline(routeId: string): RouteRecord {
        const selectedRoute = this.routes.find((route) => route.routeId === routeId);

        if (!selectedRoute) {
            throw new Error("ROUTE_NOT_FOUND");
        }

        this.routes = this.routes.map((route) => ({
            ...route,
            isBaseline: route.routeId === routeId
        }));

        return { ...this.routes.find((route) => route.routeId === routeId)! };
    }

    getComparison(): RoutesComparisonResponse {
        const baselineRoute = this.routes.find((route) => route.isBaseline);

        if (!baselineRoute) {
            throw new Error("BASELINE_NOT_FOUND");
        }

        const baseline = this.toComparisonRecord(baselineRoute, baselineRoute.ghgIntensity);
        const comparisons = this.routes
            .filter((route) => route.routeId !== baselineRoute.routeId)
            .map((route) => this.toComparisonRecord(route, baselineRoute.ghgIntensity));

        return {
            baseline,
            comparisons
        };
    }

    private toComparisonRecord(route: RouteRecord, baselineIntensity: number): RouteComparisonRecord {
        const percentDiff = ((route.ghgIntensity / baselineIntensity) - 1) * 100;

        return {
            routeId: route.routeId,
            ghgIntensity: route.ghgIntensity,
            percentDiff,
            compliant: route.ghgIntensity <= COMPLIANCE_TARGET
        };
    }
}
