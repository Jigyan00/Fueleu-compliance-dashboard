import { PoolMember } from "./PoolMember";

export type PoolProps = {
    id: string;
    year: number;
    members: PoolMember[];
};

export class Pool {
    readonly id: string;
    readonly year: number;
    readonly members: PoolMember[];

    constructor(props: PoolProps) {
        this.id = props.id;
        this.year = props.year;
        this.members = props.members;
    }
}
