import { ComplianceBalance } from "../domain/ComplianceBalance";
import { Route } from "../domain/Route";

const TARGET_INTENSITY_GCO2E_PER_MJ = 89.3368;
const ENERGY_PER_TON_MJ = 41000;

export class ComputeComplianceBalance {
    execute(route: Route): ComplianceBalance {
        const energyInScope = route.fuelConsumption * ENERGY_PER_TON_MJ;
        const cbValue = (TARGET_INTENSITY_GCO2E_PER_MJ - route.ghgIntensity) * energyInScope;

        return new ComplianceBalance({
            shipId: route.routeId,
            year: route.year,
            cbValue
        });
    }
}
