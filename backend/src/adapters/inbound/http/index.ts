import { Router } from "express";
import { BankingController } from "./banking/BankingController";
import { BankingService } from "./banking/BankingService";
import { ComplianceController } from "./compliance/ComplianceController";
import { ComplianceService } from "./compliance/ComplianceService";
import { PoolsController } from "./pools/PoolsController";
import { PoolsService } from "./pools/PoolsService";
import { RoutesController } from "./routes/RoutesController";
import { RoutesService } from "./routes/RoutesService";

export function createHttpRouter(): Router {
    const router = Router();
    const bankLedger = new Map<string, number>();
    const routesService = new RoutesService();
    const complianceService = new ComplianceService(routesService, bankLedger);
    const bankingService = new BankingService(complianceService, bankLedger);
    const poolsService = new PoolsService(complianceService);

    const routesController = new RoutesController(routesService);
    const complianceController = new ComplianceController(complianceService);
    const bankingController = new BankingController(bankingService);
    const poolsController = new PoolsController(poolsService);

    router.use(routesController.router());
    router.use(complianceController.router());
    router.use(bankingController.router());
    router.use(poolsController.router());

    return router;
}

