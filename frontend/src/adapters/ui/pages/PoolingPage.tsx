import { useEffect, useMemo, useState } from "react";
import type { AdjustedCbShip, PoolMember } from "../../../core/domain/models";
import { createPool, getAdjustedCb } from "../../infrastructure/httpClient";
import { formatCbTonnes } from "../../../shared";

function normalizePoolMembers(payload: unknown): PoolMember[] {
    if (Array.isArray(payload)) {
        return payload as PoolMember[];
    }

    if (typeof payload === "object" && payload !== null && "pool_members" in payload) {
        const value = (payload as { pool_members?: unknown }).pool_members;
        if (Array.isArray(value)) {
            return value as PoolMember[];
        }
    }

    return [];
}

export function PoolingPage() {
    const [year, setYear] = useState(2025);
    const [members, setMembers] = useState<AdjustedCbShip[]>([]);
    const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
    const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedMembers = useMemo(
        () => members.filter((member) => selectedShipIds.includes(member.shipId)),
        [members, selectedShipIds]
    );

    const poolSum = useMemo(
        () => selectedMembers.reduce((sum, member) => sum + member.adjustedCB, 0),
        [selectedMembers]
    );

    const memberResultById = useMemo(
        () => new Map(poolMembers.map((member) => [member.shipId, member])),
        [poolMembers]
    );

    async function handleLoadAdjustedCb() {
        setLoading(true);
        setError(null);

        try {
            const data = await getAdjustedCb(year);
            setMembers(data);
            setSelectedShipIds(data.filter((member) => member.adjustedCB > 0).map((member) => member.shipId));
            setPoolMembers([]);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to fetch adjusted CB");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void handleLoadAdjustedCb();
    }, []);

    async function handleCreatePool() {
        setLoading(true);
        setError(null);

        try {
            const data = await createPool({ year, members: selectedMembers });
            setPoolMembers(normalizePoolMembers(data));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to create pool");
        } finally {
            setLoading(false);
        }
    }

    function toggleShipSelection(shipId: string) {
        setSelectedShipIds((current) =>
            current.includes(shipId)
                ? current.filter((id) => id !== shipId)
                : [...current, shipId]
        );
    }

    const createDisabled = loading || selectedMembers.length === 0 || poolSum < 0;

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-900">Pooling</h2>

            <div className="mt-4 flex flex-wrap gap-3">
                <input
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                    type="number"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                />
                <button
                    className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                    onClick={() => void handleLoadAdjustedCb()}
                    disabled={loading}
                >
                    Load Adjusted CB
                </button>
                <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                    onClick={() => void handleCreatePool()}
                    disabled={createDisabled}
                >
                    Create Pool
                </button>
            </div>

            <div
                className={`mt-4 inline-block rounded px-3 py-1 text-sm font-medium ${poolSum >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
            >
                Pool Sum: {formatCbTonnes(poolSum)}
            </div>

            {selectedMembers.length > 0 && poolSum < 0 && (
                <p className="mt-2 text-sm text-red-600">Pool sum must be non-negative. Deselect some deficit ships or add more surplus ships.</p>
            )}

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-4 overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-3 py-2">select</th>
                            <th className="px-3 py-2">shipId</th>
                            <th className="px-3 py-2">adjustedCB</th>
                            <th className="px-3 py-2">cb_before</th>
                            <th className="px-3 py-2">cb_after</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => {
                            const memberResult = memberResultById.get(member.shipId);
                            const cbBefore = memberResult?.cb_before ?? member.adjustedCB;
                            const cbAfter = memberResult?.cb_after ?? member.adjustedCB;
                            const isSelected = selectedShipIds.includes(member.shipId);

                            return (
                                <tr key={member.shipId} className="border-t border-slate-200">
                                    <td className="px-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleShipSelection(member.shipId)}
                                            disabled={loading}
                                        />
                                    </td>
                                    <td className="px-3 py-2">{member.shipId}</td>
                                    <td className="px-3 py-2">{formatCbTonnes(member.adjustedCB)}</td>
                                    <td className="px-3 py-2">{formatCbTonnes(cbBefore)}</td>
                                    <td className="px-3 py-2">{formatCbTonnes(cbAfter)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
