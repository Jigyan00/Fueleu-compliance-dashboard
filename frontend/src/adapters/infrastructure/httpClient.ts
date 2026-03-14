import type {
    AdjustedCbShip,
    BankingResult,
    PoolMember,
    Route,
    RoutesComparison
} from "../../core/domain/models";
import { requestJson } from "../../shared/http";

export function getRoutes() {
    return requestJson<Route[]>("/routes");
}

export function setRouteBaseline(routeId: string) {
    return requestJson<Route>(`/routes/${routeId}/baseline`, {
        method: "POST"
    });
}

export function getRoutesComparison() {
    return requestJson<RoutesComparison>("/routes/comparison");
}

export function getComplianceCb() {
    return requestJson<unknown>("/compliance/cb");
}

export function bankSurplus() {
    return requestJson<BankingResult>("/banking/bank", {
        method: "POST"
    });
}

export function applyBanked() {
    return requestJson<BankingResult>("/banking/apply", {
        method: "POST"
    });
}

export function getAdjustedCb(year: number) {
    const query = new URLSearchParams({ year: String(year) });
    return requestJson<AdjustedCbShip[]>(`/compliance/adjusted-cb?${query.toString()}`);
}

export function createPool(payload: { year: number; members: AdjustedCbShip[] }) {
    return requestJson<{ pool_members: PoolMember[] }>("/pools", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
