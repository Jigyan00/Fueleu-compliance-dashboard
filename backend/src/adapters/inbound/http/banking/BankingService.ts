import { ApplyBanked } from "../../../../core/application/ApplyBanked";
import { BankSurplus } from "../../../../core/application/BankSurplus";
import { ComplianceService } from "../compliance/ComplianceService";

export type BankingRequest = {
    shipId?: string;
    year?: number;
    amount?: number;
};

export type BankingRecord = {
    shipId: string;
    year: number;
    amount_gco2eq: number;
};

const GLOBAL_BANK_KEY = "__global__";

export class BankingService {
    private readonly bankSurplusUseCase = new BankSurplus();
    private readonly applyBankedUseCase = new ApplyBanked();

    constructor(
        private readonly complianceService: ComplianceService,
        private readonly bankLedger: Map<string, number>
    ) { }

    bank(request: BankingRequest) {
        const compliance = this.complianceService.getAdjustedComplianceCb({
            shipId: request.shipId,
            year: request.year
        });

        const result = this.bankSurplusUseCase.execute({
            cbValue: compliance.cbValue,
            amountToBank: request.amount
        });

        const available = this.bankLedger.get(compliance.shipId) ?? 0;
        this.bankLedger.set(compliance.shipId, available + result.applied);

        const globalAvailable = this.bankLedger.get(GLOBAL_BANK_KEY) ?? 0;
        this.bankLedger.set(GLOBAL_BANK_KEY, globalAvailable + result.applied);

        return result;
    }

    apply(request: BankingRequest) {
        const compliance = request.shipId
            ? this.complianceService.getAdjustedComplianceCb({
                shipId: request.shipId,
                year: request.year
            })
            : this.getDefaultDeficitCompliance(request);

        const availableBank = this.bankLedger.get(GLOBAL_BANK_KEY) ?? 0;

        const result = this.applyBankedUseCase.execute({
            cbValue: compliance.cbValue,
            availableBank,
            amountToApply: request.amount
        });

        const perRouteAvailable = this.bankLedger.get(compliance.shipId) ?? 0;
        this.bankLedger.set(compliance.shipId, perRouteAvailable + result.applied);
        this.bankLedger.set(GLOBAL_BANK_KEY, availableBank - result.applied);

        return result;
    }

    getRecords(request: Pick<BankingRequest, "shipId" | "year">): BankingRecord[] {
        if (request.shipId) {
            const compliance = this.complianceService.getComplianceCb({
                shipId: request.shipId,
                year: request.year
            });

            return [
                {
                    shipId: request.shipId,
                    year: compliance.year,
                    amount_gco2eq: this.bankLedger.get(request.shipId) ?? 0
                }
            ];
        }

        const adjustedList = this.complianceService.getAdjustedCbList({
            year: request.year
        });

        return adjustedList
            .map((item) => {
                const year = this.complianceService.getComplianceCb({
                    shipId: item.shipId,
                    year: request.year
                }).year;

                return {
                    shipId: item.shipId,
                    year,
                    amount_gco2eq: this.bankLedger.get(item.shipId) ?? 0
                };
            })
            .filter((record) => record.amount_gco2eq > 0);
    }

    private getDefaultDeficitCompliance(request: BankingRequest) {
        const adjustedList = this.complianceService.getAdjustedCbList({
            year: request.year
        });

        const deficitCandidate = adjustedList.reduce((best, current) =>
            current.adjustedCB < best.adjustedCB ? current : best
        );

        return this.complianceService.getAdjustedComplianceCb({
            shipId: deficitCandidate.shipId,
            year: request.year
        });
    }
}
