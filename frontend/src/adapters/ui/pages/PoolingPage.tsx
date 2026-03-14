import { useMemo, useState } from "react";
import type { AdjustedCbShip, PoolMember } from "../../../core/domain/models";
import { createPool, getAdjustedCb } from "../../infrastructure/httpClient";

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
    const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const poolSum = useMemo(
        () => members.reduce((sum, member) => sum + member.adjustedCB, 0),
        [members]
    );

    async function handleLoadAdjustedCb() {
        setLoading(true);
        setError(null);

        try {
            const data = await getAdjustedCb(year);
            setMembers(data);
            setPoolMembers([]);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to fetch adjusted CB");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreatePool() {
        setLoading(true);
        setError(null);

        try {
            const data = await createPool({ year, members });
            setPoolMembers(normalizePoolMembers(data));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to create pool");
        } finally {
            setLoading(false);
        }
    }

    const createDisabled = loading || members.length === 0 || poolSum < 0;

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
                Pool Sum: {poolSum.toFixed(2)}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-4 overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-3 py-2">shipId</th>
                            <th className="px-3 py-2">cb_before</th>
                            <th className="px-3 py-2">cb_after</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(poolMembers.length > 0
                            ? poolMembers
                            : members.map((member) => ({
                                shipId: member.shipId,
                                cb_before: member.adjustedCB,
                                cb_after: member.adjustedCB
                            }))
                        ).map((member) => (
                            <tr key={member.shipId} className="border-t border-slate-200">
                                <td className="px-3 py-2">{member.shipId}</td>
                                <td className="px-3 py-2">{member.cb_before}</td>
                                <td className="px-3 py-2">{member.cb_after}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
