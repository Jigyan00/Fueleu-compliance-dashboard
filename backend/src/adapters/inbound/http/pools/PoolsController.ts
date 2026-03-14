import { Request, Response, Router } from "express";
import { PoolsService } from "./PoolsService";

function parseYear(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

type UnknownMember = {
    shipId?: unknown;
    adjustedCB?: unknown;
};

function parseMembers(value: unknown): Array<{ shipId: string; adjustedCB: number }> | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const parsedMembers = value
        .map((member) => member as UnknownMember)
        .filter((member) => typeof member.shipId === "string" && typeof member.adjustedCB === "number")
        .map((member) => ({
            shipId: member.shipId as string,
            adjustedCB: member.adjustedCB as number
        }));

    return parsedMembers;
}

export class PoolsController {
    constructor(private readonly poolsService: PoolsService) { }

    router(): Router {
        const router = Router();

        router.post("/pools", this.createPool.bind(this));

        return router;
    }

    private createPool(req: Request, res: Response) {
        try {
            const result = this.poolsService.createPool({
                year: parseYear(req.body.year),
                members: parseMembers(req.body.members)
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
