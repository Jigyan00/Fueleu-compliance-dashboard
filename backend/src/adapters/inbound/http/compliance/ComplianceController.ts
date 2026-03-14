import { Request, Response, Router } from "express";
import { ComplianceService } from "./ComplianceService";

function parseYear(value: unknown): number | undefined {
    if (typeof value !== "string" || value.trim().length === 0) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export class ComplianceController {
    constructor(private readonly complianceService: ComplianceService) { }

    router(): Router {
        const router = Router();

        router.get("/compliance/cb", this.getComplianceCb.bind(this));
        router.get("/compliance/adjusted-cb", this.getAdjustedCb.bind(this));

        return router;
    }

    private getComplianceCb(req: Request, res: Response) {
        try {
            const snapshot = this.complianceService.getComplianceCb({
                shipId: typeof req.query.shipId === "string" ? req.query.shipId : undefined,
                year: parseYear(req.query.year)
            });

            res.status(200).json(snapshot);
        } catch (error) {
            if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
                res.status(404).json({ message: "Route not found for compliance calculation" });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }

    private getAdjustedCb(req: Request, res: Response) {
        try {
            const adjusted = this.complianceService.getAdjustedCbList({
                shipId: typeof req.query.shipId === "string" ? req.query.shipId : undefined,
                year: parseYear(req.query.year)
            });

            res.status(200).json(adjusted);
        } catch (error) {
            if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
                res.status(404).json({ message: "Route not found for adjusted CB" });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }
}
