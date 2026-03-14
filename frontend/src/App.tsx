import { useMemo, useState } from "react";
import { BankingPage, ComparePage, PoolingPage, RoutesPage } from "./adapters/ui";

type TabKey = "routes" | "compare" | "banking" | "pooling";

const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "routes", label: "Routes" },
    { key: "compare", label: "Compare" },
    { key: "banking", label: "Banking" },
    { key: "pooling", label: "Pooling" }
];

function App() {
    const [activeTab, setActiveTab] = useState<TabKey>("routes");

    const activeContent = useMemo(() => {
        switch (activeTab) {
            case "routes":
                return <RoutesPage />;
            case "compare":
                return <ComparePage />;
            case "banking":
                return <BankingPage />;
            case "pooling":
                return <PoolingPage />;
            default:
                return null;
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-7xl">
                <aside className="w-56 border-r border-slate-200 bg-white p-4">
                    <h1 className="text-lg font-semibold">FuelEU Dashboard</h1>
                    <nav className="mt-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                className={`w-full rounded px-3 py-2 text-left text-sm font-medium ${activeTab === tab.key
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 p-6">{activeContent}</main>
            </div>
        </div>
    );
}

export default App;
