import { useEffect, useMemo, useState } from "react";
import type { ComparisonRow, RoutesComparison } from "../../../core/domain/models";
import { getRoutesComparison } from "../../infrastructure/httpClient";

const TARGET_INTENSITY = 89.3368;

export function ComparePage() {
    const [comparison, setComparison] = useState<RoutesComparison | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadComparison() {
            setLoading(true);
            setError(null);

            try {
                const data = await getRoutesComparison();
                setComparison(data);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Failed to fetch comparison data");
            } finally {
                setLoading(false);
            }
        }

        void loadComparison();
    }, []);

    const rows = useMemo<ComparisonRow[]>(() => {
        if (!comparison) {
            return [];
        }

        return [comparison.baseline, ...comparison.comparisons];
    }, [comparison]);

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-900">Compare</h2>
            <p className="mt-2 text-sm text-slate-600">Target intensity: {TARGET_INTENSITY} gCO₂e/MJ</p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="mt-3 text-sm text-slate-600">Loading comparison...</p>}

            <div className="mt-4 overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-3 py-2">routeId</th>
                            <th className="px-3 py-2">ghgIntensity</th>
                            <th className="px-3 py-2">% difference</th>
                            <th className="px-3 py-2">compliant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.routeId} className="border-t border-slate-200">
                                <td className="px-3 py-2">{row.routeId}</td>
                                <td className="px-3 py-2">{row.ghgIntensity.toFixed(4)}</td>
                                <td className="px-3 py-2">{row.percentDiff.toFixed(2)}%</td>
                                <td className="px-3 py-2">{row.compliant ? "✅" : "❌"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 rounded border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
                Chart section intentionally deferred for a later stage.
            </div>
        </section>
    );
}
