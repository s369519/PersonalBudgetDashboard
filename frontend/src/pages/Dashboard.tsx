import { useEffect, useState } from "react";
import api from "../api/client";
import type {
    DashboardSummary,
    CategorySpending,
} from "../types/dashboard";

import SummaryCard from "../components/cards/SummaryCard";

export default function Dashboard() {
    const [summary, setSummary] =
        useState<DashboardSummary | null>(null);

    const [categories, setCategories] =
        useState<CategorySpending[]>([]);

    useEffect(() => {
        api.get("/Dashboard/summary").then((response) => {
            setSummary(response.data);
        });

        api.get("/Dashboard/categories").then((response) => {
            setCategories(response.data);
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
            <div className="mx-auto max-w-7xl p-10">

                <h1 className="mb-8 text-4xl font-bold">
                    Personal Finance Dashboard
                </h1>
                
                <div className="grid gap-6 md:grid-cols-3">
                    <SummaryCard
                        title="Balance"
                        value={`${summary.totalBalance.toLocaleString()} kr`}
                    />
                    <SummaryCard
                        title="Income"
                        value={`${summary.monthlyIncome.toLocaleString()} kr`}
                    />
                    <SummaryCard
                        title="Expenses"
                        value={`${summary.monthlyExpenses.toLocaleString()} kr`}
                    />
                </div>

                <div className="mt-10 rounded-xl bg-white p-6 shadow-md">

                    <h2 className="mb-4 text-xl font-semibold">
                        Spending by Category
                    </h2>

                    {categories.map((category) => (
                        <div
                            key={category.category}
                            className="flex justify-between border-b py-2"
                        >
                            <span>{category.category}</span>

                            <span>
                                {category.amount.toLocaleString()} kr
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}