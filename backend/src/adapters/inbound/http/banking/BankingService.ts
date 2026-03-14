import { ApplyBanked } from "../../../../core/application/ApplyBanked";
import { BankSurplus } from "../../../../core/application/BankSurplus";
import { ComplianceService } from "../compliance/ComplianceService";

export type BankingRequest = {
    shipId?: string;
    year?: number;
    amount?: number;
};

export class BankingService {
    private readonly bankSurplusUseCase = new BankSurplus();
    private readonly applyBankedUseCase = new ApplyBanked();

    constructor(
        private readonly complianceService: ComplianceService,
        private readonly bankLedger: Map<string, number>
    ) { }

    bank(request: BankingRequest) {
        const compliance = this.complianceService.getComplianceCb({
            shipId: request.shipId,
            year: request.year
        });

        const result = this.bankSurplusUseCase.execute({
            cbValue: compliance.cbValue,
            amountToBank: request.amount
        });

        const available = this.bankLedger.get(compliance.shipId) ?? 0;
        this.bankLedger.set(compliance.shipId, available + result.applied);

        return result;
    }

    apply(request: BankingRequest) {
        const compliance = this.complianceService.getAdjustedComplianceCb({
            shipId: request.shipId,
            year: request.year
        });

        const availableBank = this.bankLedger.get(compliance.shipId) ?? 0;

        const result = this.applyBankedUseCase.execute({
            cbValue: compliance.cbValue,
            availableBank,
            amountToApply: request.amount
        });

        this.bankLedger.set(compliance.shipId, availableBank - result.applied);

        return result;
    }
}
