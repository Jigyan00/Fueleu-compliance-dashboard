export type BankSurplusInput = {
    cbValue: number;
    amountToBank?: number;
};

export type BankingResult = {
    cb_before: number;
    applied: number;
    cb_after: number;
};

export class BankSurplus {
    execute(input: BankSurplusInput): BankingResult {
        if (input.cbValue <= 0) {
            throw new Error("BANKING_REQUIRES_POSITIVE_CB");
        }

        const bankAmount = input.amountToBank ?? input.cbValue;

        if (bankAmount <= 0) {
            throw new Error("BANK_AMOUNT_MUST_BE_POSITIVE");
        }

        if (bankAmount > input.cbValue) {
            throw new Error("BANK_AMOUNT_EXCEEDS_CB");
        }

        return {
            cb_before: input.cbValue,
            applied: bankAmount,
            cb_after: input.cbValue - bankAmount
        };
    }
}
