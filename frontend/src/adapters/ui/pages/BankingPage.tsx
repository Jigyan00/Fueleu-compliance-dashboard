import { useEffect, useState } from "react";
import type { BankingResult } from "../../../core/domain/models";
import { applyBanked, bankSurplus, getAvailableBank, getComplianceCb } from "../../infrastructure/httpClient";
import { formatCbTonnes } from "../../../shared";

type ComplianceResponse = {
    shipId?: string;
    year?: number;
    cbValue: number;
};

function extractCompliance(payload: unknown): ComplianceResponse | null {
    if (typeof payload === "number") {
        return { cbValue: payload };
    }

    if (typeof payload === "object" && payload !== null) {
        const record = payload as Record<string, unknown>;
        const candidates = [record.cbValue, record.cb_gco2eq, record.cb, record.value];

        for (const candidate of candidates) {
            if (typeof candidate === "number") {
                return {
                    shipId: typeof record.shipId === "string" ? record.shipId : undefined,
                    year: typeof record.year === "number" ? record.year : undefined,
                    cbValue: candidate
                };
            }
        }
    }

    return null;
}

export function BankingPage() {
    const [selectedYear, setSelectedYear] = useState<number>(2024);
    const [currentCb, setCurrentCb] = useState<number | null>(null);
    const [currentShipId, setCurrentShipId] = useState<string | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    const [result, setResult] = useState<BankingResult | null>(null);
    const [availableBank, setAvailableBank] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function refreshAvailableBank() {
        const snapshot = await getAvailableBank();
        setAvailableBank(snapshot.amount_gco2eq);
    }

    async function handleFetchCb() {
        setLoading(true);
        setError(null);

        try {
            const data = await getComplianceCb(selectedYear);
            const compliance = extractCompliance(data);

            if (compliance === null) {
                throw new Error("Invalid CB response format");
            }

            setCurrentCb(compliance.cbValue);
            setCurrentShipId(compliance.shipId ?? null);
            setCurrentYear(compliance.year ?? null);
            await refreshAvailableBank();
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
            const data = await bankSurplus({
                shipId: currentShipId ?? undefined,
                year: currentYear ?? selectedYear
            });
            setResult(data);
            setCurrentCb(data.cb_after);
            await refreshAvailableBank();
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
            const data = await applyBanked({
                shipId: currentShipId ?? undefined,
                year: currentYear ?? selectedYear
            });
            setResult(data);
            setCurrentCb(data.cb_after);
            await refreshAvailableBank();
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
    const applyDisabled = currentCb === null || currentCb >= 0 || availableBank <= 0 || loading;

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-900">Banking</h2>

            <div className="mt-3 w-52">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Year</label>
                <select
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                    disabled={loading}
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                </select>
            </div>

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
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result ? formatCbTonnes(result.cb_before) : "-"}</p>
                </div>
                <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">applied</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result ? formatCbTonnes(result.applied) : "-"}</p>
                </div>
                <div className="rounded border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">cb_after</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{result ? formatCbTonnes(result.cb_after) : "-"}</p>
                </div>
            </div>

            <p className="mt-3 text-sm text-slate-600">Current CB: {currentCb === null ? "Not loaded" : formatCbTonnes(currentCb)}</p>
            <p className="mt-1 text-sm text-slate-600">Available Banked Surplus: {formatCbTonnes(availableBank)}</p>
            <p className="mt-1 text-xs text-slate-500">
                Context: {currentShipId ?? "-"} / {currentYear ?? selectedYear}
            </p>
        </section>
    );
}
