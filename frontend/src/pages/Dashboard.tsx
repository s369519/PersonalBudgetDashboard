import SpendingPieChart from "../components/charts/SpendingPieChart";
import { useEffect, useState } from "react";
import api from "../api/client";
import type {
    DashboardSummary,
    CategorySpending,
} from "../types/dashboard";
import TransactionTable from "../components/tables/TransactionTable";
import type { Transaction } from "../types/transaction";
import SummaryCard from "../components/cards/SummaryCard";

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    const [categories, setCategories] = useState<CategorySpending[]>([]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        api.get("/Dashboard/summary").then((response) => {
            setSummary(response.data);
        });

        api.get("/Dashboard/categories").then((response) => {
            setCategories(response.data);
        });

        api.get("/Transactions").then((response) => {
            setTransactions(response.data);
        });
    }, []);

    if (!summary) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <main className="mx-auto max-w-7xl p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                        Personal Finance Dashboard
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Overview of your finances and recent activity.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
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
                </div>

                <div className="mt-10 grid gap-6 xl:grid-cols-2">
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Spending by Category
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Distribution of your expenses.
                        </p>

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
            </main>
        </div>
    );
}