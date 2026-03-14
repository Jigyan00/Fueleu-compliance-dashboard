import { useEffect, useMemo, useState } from "react";
import type { Route } from "../../../core/domain/models";
import { getRoutes, setRouteBaseline } from "../../infrastructure/httpClient";

export function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVesselType, setSelectedVesselType] = useState("all");
    const [selectedFuelType, setSelectedFuelType] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");

    async function loadRoutes() {
        setLoading(true);
        setError(null);

        try {
            const data = await getRoutes();
            setRoutes(data);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to fetch routes");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadRoutes();
    }, []);

    const vesselTypes = useMemo(() => Array.from(new Set(routes.map((route) => route.vesselType))), [routes]);
    const fuelTypes = useMemo(() => Array.from(new Set(routes.map((route) => route.fuelType))), [routes]);
    const years = useMemo(() => Array.from(new Set(routes.map((route) => String(route.year)))), [routes]);

    const filteredRoutes = useMemo(
        () =>
            routes.filter((route) => {
                const vesselTypeMatch = selectedVesselType === "all" || route.vesselType === selectedVesselType;
                const fuelTypeMatch = selectedFuelType === "all" || route.fuelType === selectedFuelType;
                const yearMatch = selectedYear === "all" || String(route.year) === selectedYear;

                return vesselTypeMatch && fuelTypeMatch && yearMatch;
            }),
        [routes, selectedVesselType, selectedFuelType, selectedYear]
    );

    async function handleSetBaseline(routeId: string) {
        setError(null);

        try {
            await setRouteBaseline(routeId);
            await loadRoutes();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Failed to set baseline");
        }
    }

    return (
        <section>
            <h2 className="text-xl font-semibold text-slate-900">Routes</h2>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
                <select
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={selectedVesselType}
                    onChange={(event) => setSelectedVesselType(event.target.value)}
                >
                    <option value="all">All vessel types</option>
                    {vesselTypes.map((vesselType) => (
                        <option key={vesselType} value={vesselType}>
                            {vesselType}
                        </option>
                    ))}
                </select>

                <select
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={selectedFuelType}
                    onChange={(event) => setSelectedFuelType(event.target.value)}
                >
                    <option value="all">All fuel types</option>
                    {fuelTypes.map((fuelType) => (
                        <option key={fuelType} value={fuelType}>
                            {fuelType}
                        </option>
                    ))}
                </select>

                <select
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                >
                    <option value="all">All years</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="mt-3 text-sm text-slate-600">Loading routes...</p>}

            <div className="mt-4 overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="px-3 py-2">routeId</th>
                            <th className="px-3 py-2">vesselType</th>
                            <th className="px-3 py-2">fuelType</th>
                            <th className="px-3 py-2">year</th>
                            <th className="px-3 py-2">ghgIntensity</th>
                            <th className="px-3 py-2">fuelConsumption</th>
                            <th className="px-3 py-2">distance</th>
                            <th className="px-3 py-2">totalEmissions</th>
                            <th className="px-3 py-2">action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoutes.map((route) => (
                            <tr key={route.routeId} className="border-t border-slate-200">
                                <td className="px-3 py-2">{route.routeId}</td>
                                <td className="px-3 py-2">{route.vesselType}</td>
                                <td className="px-3 py-2">{route.fuelType}</td>
                                <td className="px-3 py-2">{route.year}</td>
                                <td className="px-3 py-2">{route.ghgIntensity}</td>
                                <td className="px-3 py-2">{route.fuelConsumption}</td>
                                <td className="px-3 py-2">{route.distance}</td>
                                <td className="px-3 py-2">{route.totalEmissions}</td>
                                <td className="px-3 py-2">
                                    <button
                                        className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
                                        disabled={route.isBaseline}
                                        onClick={() => void handleSetBaseline(route.routeId)}
                                    >
                                        Set Baseline
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
