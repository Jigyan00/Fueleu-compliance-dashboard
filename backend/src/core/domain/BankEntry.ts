export type BankEntryProps = {
    shipId: string;
    year: number;
    amount: number;
};

export class BankEntry {
    readonly shipId: string;
    readonly year: number;
    readonly amount: number;

    constructor(props: BankEntryProps) {
        this.shipId = props.shipId;
        this.year = props.year;
        this.amount = props.amount;
    }
}

