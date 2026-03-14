import { Request, Response, Router } from "express";
import { RoutesService } from "./RoutesService";

export class RoutesController {
    constructor(private readonly routesService: RoutesService) { }

    router(): Router {
        const router = Router();

        router.get("/routes", this.getRoutes.bind(this));
        router.post("/routes/:id/baseline", this.setBaseline.bind(this));
        router.get("/routes/comparison", this.getComparison.bind(this));

        return router;
    }

    private getRoutes(_req: Request, res: Response) {
        const routes = this.routesService.getAllRoutes();
        res.status(200).json(routes);
    }

    private setBaseline(req: Request, res: Response) {
        const routeId = req.params.id;

        if (!routeId) {
            res.status(400).json({ message: "Route id is required" });
            return;
        }

        try {
            const updatedRoute = this.routesService.setBaseline(routeId);
            res.status(200).json(updatedRoute);
        } catch (error) {
            if (error instanceof Error && error.message === "ROUTE_NOT_FOUND") {
                res.status(404).json({ message: "Route not found" });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }

    private getComparison(_req: Request, res: Response) {
        try {
            const comparison = this.routesService.getComparison();
            res.status(200).json(comparison);
        } catch (error) {
            if (error instanceof Error && error.message === "BASELINE_NOT_FOUND") {
                res.status(404).json({ message: "Baseline route not found" });
                return;
            }

            res.status(500).json({ message: "Unexpected error" });
        }
    }
}
