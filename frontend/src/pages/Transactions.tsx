import { useEffect, useState } from "react";

import api from "../api/client";

import TransactionForm from "../components/forms/TransactionForm";
import TransactionTable from "../components/tables/TransactionTable";

import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type {
    CreateTransaction,
    Transaction,
} from "../types/transaction";

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadData() {
        try {
            setIsLoading(true);
            setError(null);

            const [
                transactionsResponse,
                accountsResponse,
                categoriesResponse,
            ] = await Promise.all([
                api.get<Transaction[]>("/Transactions"),
                api.get<Account[]>("/Accounts"),
                api.get<Category[]>("/Categories"),
            ]);

            const sortedTransactions = [...transactionsResponse.data].sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime(),
            );

            setTransactions(sortedTransactions);
            setAccounts(accountsResponse.data);
            setCategories(categoriesResponse.data);
        } catch (requestError) {
            console.error("Could not load transactions page:", requestError);

            setError(
                "Could not load transactions. Make sure the backend is running.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleCreateTransaction(
        transaction: CreateTransaction,
    ) {
        await api.post("/Transactions", transaction);
        await loadData();
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h1 className="text-lg font-semibold text-red-800">
                    Transactions unavailable
                </h1>

                <p className="mt-2 text-sm text-red-700">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Transactions
                </h1>

                <p className="mt-2 text-slate-500">
                    View and manage your income and expenses.
                </p>
            </header>

            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                <TransactionForm
                    accounts={accounts}
                    categories={categories}
                    onSubmit={handleCreateTransaction}
                />

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            All Transactions
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {transactions.length} transaction
                            {transactions.length === 1 ? "" : "s"} recorded.
                        </p>
                    </div>

                    <TransactionTable transactions={transactions} />
                </section>
            </div>
        </div>
    );
}