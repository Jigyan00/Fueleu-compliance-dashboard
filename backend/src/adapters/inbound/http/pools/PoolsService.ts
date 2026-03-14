import { CreatePool } from "../../../../core/application/CreatePool";
import { ComplianceService } from "../compliance/ComplianceService";

export type CreatePoolRequest = {
    year?: number;
    members?: Array<{
        shipId: string;
        adjustedCB: number;
    }>;
};

export class PoolsService {
    private readonly createPoolUseCase = new CreatePool();

    constructor(private readonly complianceService: ComplianceService) { }

    createPool(request: CreatePoolRequest) {
        const members = request.members && request.members.length > 0
            ? request.members
            : this.complianceService.getAdjustedCbList({ year: request.year });

        const poolMembers = this.createPoolUseCase.execute(members);

        return {
            pool_members: poolMembers
        };
    }
}
