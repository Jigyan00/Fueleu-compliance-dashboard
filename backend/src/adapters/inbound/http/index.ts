import { Router } from "express";
import { RoutesController } from "./routes/RoutesController";
import { RoutesService } from "./routes/RoutesService";

export function createHttpRouter(): Router {
    const router = Router();
    const routesService = new RoutesService();
    const routesController = new RoutesController(routesService);

    router.use(routesController.router());

    return router;
}

