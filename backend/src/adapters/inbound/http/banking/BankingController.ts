import { Request, Response, Router } from "express";
import { BankingService } from "./BankingService";

function parseYear(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function parseAmount(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export class BankingController {
    constructor(private readonly bankingService: BankingService) { }

    router(): Router {
        const router = Router();

        router.get("/banking/available", this.getAvailableBank.bind(this));
        router.get("/banking/records", this.getRecords.bind(this));
        router.post("/banking/bank", this.bank.bind(this));
        router.post("/banking/apply", this.apply.bind(this));

        return router;
    }

    private getAvailableBank(_req: Request, res: Response) {
        try {
            const result = this.bankingService.getAvailableBank();
            res.status(200).json(result);
        } catch {
            res.status(500).json({ message: "Unexpected error" });
        }
    }

    private bank(req: Request, res: Response) {
        try {
            const result = this.bankingService.bank({
                shipId: typeof req.body.shipId === "string" ? req.body.shipId : undefined,
                year: parseYear(req.body.year),
                amount: parseAmount(req.body.amount)
            });

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }

    private getRecords(req: Request, res: Response) {
        try {
            const result = this.bankingService.getRecords({
                shipId: typeof req.query.shipId === "string" ? req.query.shipId : undefined,
                year: parseYear(req.query.year)
            });

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
                res.status(404).json({ message: "Route not found for banking records" });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }

    private apply(req: Request, res: Response) {
        try {
            const result = this.bankingService.apply({
                shipId: typeof req.body.shipId === "string" ? req.body.shipId : undefined,
                year: parseYear(req.body.year),
                amount: parseAmount(req.body.amount)
            });

            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }
}
