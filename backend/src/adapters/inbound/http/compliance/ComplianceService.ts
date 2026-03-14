import { ComputeComplianceBalance } from "../../../../core/application/ComputeComplianceBalance";
import { Route } from "../../../../core/domain/Route";
import { RoutesService } from "../routes/RoutesService";

type ComplianceRequest = {
    shipId?: string;
    year?: number;
};

type RouteSnapshot = ReturnType<RoutesService["getAllRoutes"]>[number];

export type ComplianceSnapshot = {
    shipId: string;
    year: number;
    cbValue: number;
};

export type AdjustedCbSnapshot = {
    shipId: string;
    adjustedCB: number;
};

export class ComplianceService {
    private readonly computeComplianceBalance = new ComputeComplianceBalance();

    constructor(
        private readonly routesService: RoutesService,
        private readonly bankLedger: Map<string, number>
    ) { }

    getComplianceCb(request: ComplianceRequest): ComplianceSnapshot {
        const routes = this.filterRoutesByYear(request.year);
        const selectedRoute = this.selectRoute(routes, request.shipId);
        const cbValue = this.computeRouteCb(selectedRoute);

        return {
            shipId: selectedRoute.routeId,
            year: selectedRoute.year,
            cbValue
        };
    }

    getAdjustedComplianceCb(request: ComplianceRequest): ComplianceSnapshot {
        const routes = this.filterRoutesByYear(request.year);

        if (routes.length === 0) {
            throw new Error("ROUTE_NOT_FOUND");
        }

        const candidates = routes.map((route) => {
            const baseCb = this.computeRouteCb(route);
            const banked = this.bankLedger.get(route.routeId) ?? 0;

            return {
                route,
                adjustedCb: baseCb + banked
            };
        });

        if (request.shipId) {
            const selected = candidates.find((candidate) => candidate.route.routeId === request.shipId);

            if (!selected) {
                throw new Error("ROUTE_NOT_FOUND");
            }

            return {
                shipId: selected.route.routeId,
                year: selected.route.year,
                cbValue: selected.adjustedCb
            };
        }

        const selected = candidates.reduce((best, current) =>
            current.adjustedCb > best.adjustedCb ? current : best
        );

        return {
            shipId: selected.route.routeId,
            year: selected.route.year,
            cbValue: selected.adjustedCb
        };
    }

    getAdjustedCbList(request: ComplianceRequest): AdjustedCbSnapshot[] {
        const routes = this.filterRoutesByYear(request.year);
        const adjustedList = routes.map((route) => ({
            shipId: route.routeId,
            adjustedCB: this.computeRouteCb(route) + (this.bankLedger.get(route.routeId) ?? 0)
        }));

        if (request.shipId) {
            const selected = adjustedList.find((item) => item.shipId === request.shipId);

            if (!selected) {
                throw new Error("ROUTE_NOT_FOUND");
            }

            return [selected];
        }

        return adjustedList;
    }

    private filterRoutesByYear(year?: number): RouteSnapshot[] {
        const routes = this.routesService.getAllRoutes();

        if (typeof year !== "number" || Number.isNaN(year)) {
            return routes;
        }

        return routes.filter((route) => route.year === year);
    }

    private selectRoute(routes: RouteSnapshot[], shipId?: string): RouteSnapshot {
        if (routes.length === 0) {
            throw new Error("ROUTE_NOT_FOUND");
        }

        if (shipId) {
            const selected = routes.find((route) => route.routeId === shipId);

            if (!selected) {
                throw new Error("ROUTE_NOT_FOUND");
            }

            return selected;
        }

        const sorted = [...routes].sort((left, right) => this.computeRouteCb(right) - this.computeRouteCb(left));
        const selected = sorted[0];

        if (!selected) {
            throw new Error("ROUTE_NOT_FOUND");
        }

        return selected;
    }

    private computeRouteCb(route: RouteSnapshot): number {
        const domainRoute = new Route({
            routeId: route.routeId,
            vesselType: route.vesselType,
            fuelType: route.fuelType,
            year: route.year,
            ghgIntensity: route.ghgIntensity,
            fuelConsumption: route.fuelConsumption,
            distance: route.distance,
            totalEmissions: route.totalEmissions,
            isBaseline: route.isBaseline
        });

        return this.computeComplianceBalance.execute(domainRoute).cbValue;
    }
}
