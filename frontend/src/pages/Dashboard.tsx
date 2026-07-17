import { useEffect, useState } from "react";

import api from "../api/client";

import SummaryCard from "../components/cards/SummaryCard";
import SpendingPieChart from "../components/charts/SpendingPieChart";

import type {
    CategorySpending,
    DashboardSummary,
} from "../types/dashboard";

export default function Dashboard() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [categoryMonths, setCategoryMonths] = useState(1);
    const [chartMode, setChartMode] = useState<"pie" | "bar">("pie");
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [categories, setCategories] = useState<CategorySpending[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadMonths() {
            try {
                const response = await api.get<string[]>("/Dashboard/months");
                const values = response.data.map((value) => value.slice(0, 7));
                setAvailableMonths(values);
                if (values.length > 0) {
                    setMonth(values[0]);
                }
            } catch (requestError) {
                console.error("Could not load available months:", requestError);
            }
        }

        loadMonths();
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            try {
                setIsLoading(true);
                setError(null);

                const summaryResponse = await api.get<DashboardSummary>(
                    `/Dashboard/summary?month=${month}-01&months=${categoryMonths}`,
                );

                if (!cancelled) {
                    setSummary(summaryResponse.data);
                }

            } catch (requestError) {
                console.error("Could not load dashboard:", requestError);

                if (!cancelled) {
                    setError(
                        "Could not load the dashboard. Make sure the backend is running.",
                    );
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [month, categoryMonths]);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                setIsCategoriesLoading(true);
                const response = await api.get<CategorySpending[]>(
                    `/Dashboard/categories?month=${month}-01&months=${categoryMonths}`,
                );
                if (!cancelled) setCategories(response.data);
            } catch (requestError) {
                console.error("Could not load category spending:", requestError);
                if (!cancelled) setCategories([]);
            } finally {
                if (!cancelled) setIsCategoriesLoading(false);
            }
        }

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, [month, categoryMonths]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h1 className="text-lg font-semibold text-red-800">
                    Dashboard unavailable
                </h1>

                <p className="mt-2 text-sm text-red-700">
                    {error ?? "No dashboard data was returned."}
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                        Personal Finance Dashboard
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Monthly overview of your income, expenses and categories.
                    </p>
                </div>
                <select
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    aria-label="Dashboard month"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5"
                >
                    {(availableMonths.length > 0
                        ? availableMonths
                        : [month]
                    ).map((value) => (
                        <option key={value} value={value}>
                            {new Intl.DateTimeFormat("nb-NO", {
                                month: "long",
                                year: "numeric",
                            }).format(new Date(`${value}-01T00:00:00`))}
                        </option>
                    ))}
                </select>
            </header>

            <section className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                    title="Balance"
                    value={`${summary.totalBalance.toLocaleString("nb-NO")} kr`}
                />

                <SummaryCard
                    title={`Income · ${categoryMonths}M`}
                    value={`${summary.monthlyIncome.toLocaleString("nb-NO")} kr`}
                />

                <SummaryCard
                    title={`Expenses · ${categoryMonths}M`}
                    value={`${summary.monthlyExpenses.toLocaleString("nb-NO")} kr`}
                />
            </section>

            <div className="mt-10">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Spending by Category
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Distribution through the selected month.
                        </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                        <div className="flex rounded-lg bg-slate-100 p-1">
                            {[1, 3, 6, 12].map((period) => (
                                <button
                                    key={period}
                                    type="button"
                                    onClick={() => setCategoryMonths(period)}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                        categoryMonths === period
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {period}M
                                </button>
                            ))}
                        </div>
                        <div className="flex rounded-lg bg-slate-100 p-1">
                            {(["pie", "bar"] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setChartMode(mode)}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                                        chartMode === mode
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {mode === "pie" ? "Pie" : "Bars"}
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {isCategoriesLoading ? (
                            <div className="flex h-72 items-center justify-center text-slate-500">
                                Loading category spending...
                            </div>
                        ) : categories.length > 0 ? (
                            <SpendingPieChart data={categories} mode={chartMode} />
                        ) : (
                            <div className="flex h-72 items-center justify-center text-slate-500">
                                No category spending available.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
