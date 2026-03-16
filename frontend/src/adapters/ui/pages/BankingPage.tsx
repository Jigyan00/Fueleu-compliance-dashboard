import { useEffect, useState } from "react";
import type { BankingResult } from "../../../core/domain/models";
import { applyBanked, bankSurplus, getComplianceCb } from "../../infrastructure/httpClient";

function extractCbValue(payload: unknown): number | null {
    if (typeof payload === "number") {
        return payload;
    }

    if (typeof payload === "object" && payload !== null) {
        const record = payload as Record<string, unknown>;
        const candidates = [record.cbValue, record.cb_gco2eq, record.cb, record.value];

        for (const candidate of candidates) {
            if (typeof candidate === "number") {
                return candidate;
            }
        }
    }

    return null;
}

export function BankingPage() {
    const [currentCb, setCurrentCb] = useState<number | null>(null);
    const [result, setResult] = useState<BankingResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFetchCb() {
        setLoading(true);
        setError(null);

        try {
            const data = await getComplianceCb();
            const cbValue = extractCbValue(data);

            if (cbValue === null) {
                throw new Error("Invalid CB response format");
            }

            setCurrentCb(cbValue);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to fetch CB");
        } finally {
            setLoading(false);
        }
    }

    async function handleBank() {
        setLoading(true);
        setError(null);

        try {
            const data = await bankSurplus();
            setResult(data);
            setCurrentCb(data.cb_after);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to bank surplus");
        } finally {
            setLoading(false);
        }
    }

    async function handleApply() {
        setLoading(true);
        setError(null);

        try {
            const data = await applyBanked();
            setResult(data);
            setCurrentCb(data.cb_after);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to apply banked amount");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void handleFetchCb();
    }, []);

    const bankDisabled = currentCb === null || currentCb <= 0 || loading;
    const applyDisabled = currentCb === null || loading;

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-900">Banking</h2>

            <div className="mt-3 flex gap-2">
                <button
                    className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                    onClick={() => void handleFetchCb()}
                    disabled={loading}
                >
                    Fetch CB
                </button>
                <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                    onClick={() => void handleBank()}
                    disabled={bankDisabled}
                >
                    Bank Surplus
                </button>
                <button
                    className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                    onClick={() => void handleApply()}
                    disabled={applyDisabled}
                >
                    Apply Banked
                </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">cb_before</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result?.cb_before ?? "-"}</p>
                </div>
                <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">applied</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result?.applied ?? "-"}</p>
                </div>
                <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">cb_after</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result?.cb_after ?? "-"}</p>
                </div>
            </div>

            <p className="mt-3 text-sm text-slate-600">Current CB: {currentCb ?? "Not loaded"}</p>
        </section>
    );
}
