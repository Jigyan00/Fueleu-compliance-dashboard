import type { BankingResult } from "./BankSurplus";

export type ApplyBankedInput = {
    cbValue: number;
    availableBank: number;
    amountToApply?: number;
};

export class ApplyBanked {
    execute(input: ApplyBankedInput): BankingResult {
        if (input.cbValue >= 0) {
            throw new Error("APPLY_REQUIRES_DEFICIT_CB");
        }

        if (input.availableBank <= 0) {
            throw new Error("NO_AVAILABLE_BANKED_SURPLUS");
        }

        const deficitMagnitude = Math.abs(input.cbValue);
        const requestedAmount = input.amountToApply ?? Math.min(input.availableBank, deficitMagnitude);

        if (requestedAmount <= 0) {
            throw new Error("APPLY_AMOUNT_MUST_BE_POSITIVE");
        }

        if (requestedAmount > input.availableBank) {
            throw new Error("APPLY_AMOUNT_EXCEEDS_AVAILABLE_BANK");
        }

        if (requestedAmount > deficitMagnitude) {
            throw new Error("APPLY_AMOUNT_EXCEEDS_DEFICIT");
        }

        return {
            cb_before: input.cbValue,
            applied: requestedAmount,
            cb_after: input.cbValue + requestedAmount
        };
    }
}
