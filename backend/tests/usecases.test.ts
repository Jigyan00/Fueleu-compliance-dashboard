import { ApplyBanked } from "../src/core/application/ApplyBanked";
import { BankSurplus } from "../src/core/application/BankSurplus";
import { ComputeComplianceBalance } from "../src/core/application/ComputeComplianceBalance";
import { CreatePool } from "../src/core/application/CreatePool";
import { ComplianceService } from "../src/adapters/inbound/http/compliance/ComplianceService";
import { RoutesService } from "../src/adapters/inbound/http/routes/RoutesService";
import { Route } from "../src/core/domain/Route";

describe("ComputeComplianceBalance", () => {
    it("computes positive compliance balance for lower intensity route", () => {
        const useCase = new ComputeComplianceBalance();
        const route = new Route({
            routeId: "R100",
            vesselType: "Container",
            fuelType: "LNG",
            year: 2025,
            ghgIntensity: 88,
            fuelConsumption: 100,
            distance: 500,
            totalEmissions: 300,
            isBaseline: false
        });

        const result = useCase.execute(route);

        expect(result.shipId).toBe("R100");
        expect(result.year).toBe(2025);
        expect(result.cbValue).toBeCloseTo(5480880, 6);
    });

    it("computes negative compliance balance for higher intensity route", () => {
        const useCase = new ComputeComplianceBalance();
        const route = new Route({
            routeId: "R101",
            vesselType: "Tanker",
            fuelType: "HFO",
            year: 2025,
            ghgIntensity: 91,
            fuelConsumption: 100,
            distance: 500,
            totalEmissions: 300,
            isBaseline: false
        });

        const result = useCase.execute(route);

        expect(result.cbValue).toBeCloseTo(-6819120, 6);
    });
});

describe("BankSurplus", () => {
    it("banks full surplus by default", () => {
        const useCase = new BankSurplus();

        const result = useCase.execute({ cbValue: 120 });

        expect(result).toEqual({
            cb_before: 120,
            applied: 120,
            cb_after: 0
        });
    });

    it("banks provided amount when valid", () => {
        const useCase = new BankSurplus();

        const result = useCase.execute({ cbValue: 120, amountToBank: 40 });

        expect(result).toEqual({
            cb_before: 120,
            applied: 40,
            cb_after: 80
        });
    });

    it("throws when CB is not positive", () => {
        const useCase = new BankSurplus();

        expect(() => useCase.execute({ cbValue: 0 })).toThrow("BANKING_REQUIRES_POSITIVE_CB");
    });

    it("throws when amount exceeds CB", () => {
        const useCase = new BankSurplus();

        expect(() => useCase.execute({ cbValue: 100, amountToBank: 101 })).toThrow("BANK_AMOUNT_EXCEEDS_CB");
    });
});

describe("ApplyBanked", () => {
    it("applies default amount up to deficit or available bank", () => {
        const useCase = new ApplyBanked();

        const result = useCase.execute({ cbValue: -90, availableBank: 40 });

        expect(result).toEqual({
            cb_before: -90,
            applied: 40,
            cb_after: -50
        });
    });

    it("applies explicit valid amount", () => {
        const useCase = new ApplyBanked();

        const result = useCase.execute({ cbValue: -100, availableBank: 80, amountToApply: 60 });

        expect(result).toEqual({
            cb_before: -100,
            applied: 60,
            cb_after: -40
        });
    });

    it("throws when amount exceeds available bank", () => {
        const useCase = new ApplyBanked();

        expect(() => useCase.execute({ cbValue: -100, availableBank: 50, amountToApply: 60 })).toThrow(
            "APPLY_AMOUNT_EXCEEDS_AVAILABLE_BANK"
        );
    });

    it("throws when CB is not deficit", () => {
        const useCase = new ApplyBanked();

        expect(() => useCase.execute({ cbValue: 10, availableBank: 50 })).toThrow("APPLY_REQUIRES_DEFICIT_CB");
    });
});

describe("CreatePool", () => {
    it("allocates surplus to deficits greedily", () => {
        const useCase = new CreatePool();

        const result = useCase.execute([
            { shipId: "S1", adjustedCB: 100 },
            { shipId: "S2", adjustedCB: -60 },
            { shipId: "S3", adjustedCB: -20 }
        ]);

        expect(result).toEqual([
            { shipId: "S1", cb_before: 100, cb_after: 20 },
            { shipId: "S2", cb_before: -60, cb_after: 0 },
            { shipId: "S3", cb_before: -20, cb_after: 0 }
        ]);
    });

    it("throws when sum of adjusted CB is negative", () => {
        const useCase = new CreatePool();

        expect(() =>
            useCase.execute([
                { shipId: "S1", adjustedCB: -20 },
                { shipId: "S2", adjustedCB: 5 }
            ])
        ).toThrow("POOL_SUM_MUST_BE_NON_NEGATIVE");
    });

    it("returns empty list for empty input", () => {
        const useCase = new CreatePool();

        const result = useCase.execute([]);

        expect(result).toEqual([]);
    });

    it("keeps zero-balance ships non-negative after allocation", () => {
        const useCase = new CreatePool();

        const result = useCase.execute([
            { shipId: "S1", adjustedCB: 40 },
            { shipId: "S2", adjustedCB: -40 },
            { shipId: "S3", adjustedCB: 0 }
        ]);

        const zeroShip = result.find((member) => member.shipId === "S3");

        expect(zeroShip).toBeDefined();
        expect(zeroShip?.cb_after).toBeGreaterThanOrEqual(0);
    });
});

describe("ComplianceService", () => {
    it("selects highest-CB route by default instead of baseline", () => {
        const routesService = new RoutesService();
        const complianceService = new ComplianceService(routesService, new Map<string, number>());

        const result = complianceService.getComplianceCb({ year: 2024 });

        expect(result.shipId).toBe("R002");
        expect(result.cbValue).toBeGreaterThan(0);
    });
});
