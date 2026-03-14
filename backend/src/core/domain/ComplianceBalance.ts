export type ComplianceBalanceProps = {
    shipId: string;
    year: number;
    cbValue: number;
};

export class ComplianceBalance {
    readonly shipId: string;
    readonly year: number;
    readonly cbValue: number;

    constructor(props: ComplianceBalanceProps) {
        this.shipId = props.shipId;
        this.year = props.year;
        this.cbValue = props.cbValue;
    }
}
