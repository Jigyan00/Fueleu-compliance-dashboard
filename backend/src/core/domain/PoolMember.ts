export type PoolMemberProps = {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
};

export class PoolMember {
    readonly shipId: string;
    readonly cbBefore: number;
    readonly cbAfter: number;

    constructor(props: PoolMemberProps) {
        this.shipId = props.shipId;
        this.cbBefore = props.cbBefore;
        this.cbAfter = props.cbAfter;
    }
}
