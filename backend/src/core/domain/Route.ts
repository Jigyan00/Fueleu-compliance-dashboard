export type RouteProps = {
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

export class Route {
    readonly routeId: string;
    readonly vesselType: string;
    readonly fuelType: string;
    readonly year: number;
    readonly ghgIntensity: number;
    readonly fuelConsumption: number;
    readonly distance: number;
    readonly totalEmissions: number;
    readonly isBaseline: boolean;

    constructor(props: RouteProps) {
        this.routeId = props.routeId;
        this.vesselType = props.vesselType;
        this.fuelType = props.fuelType;
        this.year = props.year;
        this.ghgIntensity = props.ghgIntensity;
        this.fuelConsumption = props.fuelConsumption;
        this.distance = props.distance;
        this.totalEmissions = props.totalEmissions;
        this.isBaseline = props.isBaseline;
    }
}
