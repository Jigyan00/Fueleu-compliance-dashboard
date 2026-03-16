export type AdjustedCbShip = {
    shipId: string;
    adjustedCB: number;
};

export type PoolMemberAllocation = {
    shipId: string;
    cb_before: number;
    cb_after: number;
};

export class CreatePool {
    execute(ships: AdjustedCbShip[]): PoolMemberAllocation[] {
        if (ships.length === 0) {
            return [];
        }

        const totalAdjustedCb = ships.reduce((sum, ship) => sum + ship.adjustedCB, 0);

        if (totalAdjustedCb < 0) {
            throw new Error("POOL_SUM_MUST_BE_NON_NEGATIVE");
        }

        const members = ships.map((ship) => ({
            shipId: ship.shipId,
            cbBefore: ship.adjustedCB,
            cbAfter: ship.adjustedCB
        }));

        const surplusMembers = members
            .filter((member) => member.cbAfter > 0)
            .sort((left, right) => right.cbAfter - left.cbAfter);

        const deficitMembers = members
            .filter((member) => member.cbAfter < 0)
            .sort((left, right) => left.cbAfter - right.cbAfter);

        for (const deficitMember of deficitMembers) {
            let needed = Math.abs(deficitMember.cbAfter);

            for (const surplusMember of surplusMembers) {
                if (needed <= 0) {
                    break;
                }

                if (surplusMember.cbAfter <= 0) {
                    continue;
                }

                const transfer = Math.min(surplusMember.cbAfter, needed);
                surplusMember.cbAfter -= transfer;
                deficitMember.cbAfter += transfer;
                needed -= transfer;
            }
        }

        for (const member of members) {
            if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
                throw new Error("DEFICIT_SHIP_CANNOT_EXIT_WORSE");
            }

            if (member.cbBefore >= 0 && member.cbAfter < 0) {
                throw new Error("SURPLUS_SHIP_CANNOT_EXIT_NEGATIVE");
            }
        }

        return members.map((member) => ({
            shipId: member.shipId,
            cb_before: member.cbBefore,
            cb_after: member.cbAfter
        }));
    }
}
