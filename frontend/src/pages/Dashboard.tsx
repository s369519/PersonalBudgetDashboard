import { useEffect, useState } from "react";

import api from "../api/client";

import SummaryCard from "../components/cards/SummaryCard";
import SpendingPieChart from "../components/charts/SpendingPieChart";
import TransactionTable from "../components/tables/TransactionTable";

import type {
    CategorySpending,
    DashboardSummary,
} from "../types/dashboard";

import type { Transaction } from "../types/transaction";

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [categories, setCategories] = useState<CategorySpending[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setIsLoading(true);
                setError(null);

                const [
                    summaryResponse,
                    categoriesResponse,
                    transactionsResponse,
                ] = await Promise.all([
                    api.get<DashboardSummary>("/Dashboard/summary"),
                    api.get<CategorySpending[]>("/Dashboard/categories"),
                    api.get<Transaction[]>("/Transactions"),
                ]);

                setSummary(summaryResponse.data);
                setCategories(categoriesResponse.data);

                const sortedTransactions = [...transactionsResponse.data].sort(
                    (a, b) =>
                        new Date(b.date).getTime() -
                        new Date(a.date).getTime(),
                );

                setTransactions(sortedTransactions);
            } catch (requestError) {
                console.error("Could not load dashboard:", requestError);

                setError(
                    "Could not load the dashboard. Make sure the backend is running.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboard();
    }, []);

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
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                    Personal Finance Dashboard
                </h1>

                <p className="mt-2 text-slate-500">
                    Overview of your finances and recent activity.
                </p>
            </header>

            <section className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                    title="Balance"
                    value={`${summary.totalBalance.toLocaleString("nb-NO")} kr`}
                />

                <SummaryCard
                    title="Income"
                    value={`${summary.monthlyIncome.toLocaleString("nb-NO")} kr`}
                />

                <SummaryCard
                    title="Expenses"
                    value={`${summary.monthlyExpenses.toLocaleString("nb-NO")} kr`}
                />
            </section>

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            Spending by Category
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Distribution of your expenses.
                        </p>
                    </div>

                    <div className="mt-4">
                        {categories.length > 0 ? (
                            <SpendingPieChart data={categories} />
                        ) : (
                            <div className="flex h-72 items-center justify-center text-slate-500">
                                No category spending available.
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Recent Transactions
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your latest account activity.
                        </p>
                    </div>

                    <TransactionTable
                        transactions={transactions.slice(0, 5)}
                    />
                </section>
            </div>
        </div>
    );
}