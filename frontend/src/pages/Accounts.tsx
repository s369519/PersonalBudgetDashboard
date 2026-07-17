import { useEffect, useState } from "react";
import { Pencil, Target, Trash2, WalletCards } from "lucide-react";
import { getApiErrorMessage } from "../utils/getApiError";
import api from "../api/client";
import AccountForm from "../components/forms/AccountForm";
import EditAccountForm from "../components/forms/EditAccountForm";
import SavingsGoalForm from "../components/forms/SavingsGoalForm";

import type {
    Account,
    CreateAccount,
    UpdateAccount,
    UpdateSavingsGoal,
} from "../types/account";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function Accounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [goalAccount, setGoalAccount] = useState<Account | null>(null);

    async function loadAccounts() {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<Account[]>("/Accounts");
            setAccounts(response.data);
        } catch (requestError) {
            console.error("Could not load accounts:", requestError);

            setError(
                "Could not load accounts. Make sure the backend is running.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadAccounts();
    }, []);

    async function handleCreateAccount(account: CreateAccount) {
        await api.post("/Accounts", account);
        await loadAccounts();
    }

    async function handleUpdateAccount(
        id: string,
        account: UpdateAccount,
    ) {
        await api.put(`/Accounts/${id}`, account);

        setEditingAccount(null);

        await loadAccounts();
    }

    async function handleSaveGoal(goal: UpdateSavingsGoal) {
        if (!goalAccount) return;

        await api.put(`/Accounts/${goalAccount.id}/savings-goal`, goal);
        setGoalAccount(null);
        await loadAccounts();
    }

    async function handleClearGoal() {
        if (!goalAccount) return;

        await api.delete(`/Accounts/${goalAccount.id}/savings-goal`);
        setGoalAccount(null);
        await loadAccounts();
    }

    async function handleDeleteAccount(account: Account) {
        const shouldDelete = window.confirm(
            `Delete the account "${account.name}"?`,
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(account.id);
            setError(null);

            await api.delete(`/Accounts/${account.id}`);

            setAccounts((currentAccounts) =>
                currentAccounts.filter(
                    (currentAccount) => currentAccount.id !== account.id,
                ),
            );
            if (editingAccount?.id === account.id) {
                setEditingAccount(null);
            }
        } catch (requestError) {
            console.error("Could not delete account:", requestError);

            setError(
                getApiErrorMessage(
                    requestError,
                    "The account could not be deleted. It may have transactions connected to it.",
                ),
            );
        } finally {
            setDeletingId(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading accounts...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Accounts
                </h1>

                <p className="mt-2 text-slate-500">
                    View and manage your financial accounts.
                </p>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                {editingAccount ? (
                    <EditAccountForm
                        account={editingAccount}
                        onSubmit={handleUpdateAccount}
                        onCancel={() => setEditingAccount(null)}
                    />
                ) : goalAccount ? (
                    <SavingsGoalForm
                        account={goalAccount}
                        onSubmit={handleSaveGoal}
                        onClear={handleClearGoal}
                        onCancel={() => setGoalAccount(null)}
                    />
                ) : (
                    <AccountForm onSubmit={handleCreateAccount} />
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Your Accounts
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {accounts.length} account
                            {accounts.length === 1 ? "" : "s"} registered.
                        </p>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-slate-100 p-4">
                                <WalletCards
                                    className="text-slate-500"
                                    size={28}
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-800">
                                No accounts yet
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Add your first account using the form.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {accounts.map((account) => (
                                <article
                                    key={account.id}
                                    className="rounded-xl border border-slate-200 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Account
                                            </p>

                                            <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                                {account.name}
                                            </h3>

                                            <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                account.visibility === "Shared"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {account.visibility}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingAccount(null);
                                                    setGoalAccount(account);
                                                }}
                                                aria-label={`Set savings goal for ${account.name}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <Target size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setGoalAccount(null);
                                                    setEditingAccount(account);
                                                }}
                                                aria-label={`Edit ${account.name}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAccount(account)}
                                                disabled={deletingId === account.id}
                                                aria-label={`Delete ${account.name}`}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-8 text-2xl font-bold text-slate-900">
                                        {formatCurrency(account.balance)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Starting balance: {formatCurrency(account.startingBalance)}
                                    </p>

                                    {account.savingsGoalAmount !== null &&
                                        account.savingsGoalDate && (
                                        <div className="mt-5 border-t border-slate-100 pt-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">
                                                    Goal by {new Intl.DateTimeFormat("nb-NO").format(
                                                        new Date(`${account.savingsGoalDate}T00:00:00`),
                                                    )}
                                                </span>
                                                <span className="font-medium text-slate-700">
                                                    {formatCurrency(account.savingsGoalAmount)}
                                                </span>
                                            </div>

                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            Math.max(0, account.balance / account.savingsGoalAmount * 100),
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-3 text-sm text-slate-600">
                                                Save <span className="font-semibold text-emerald-700">
                                                    {formatCurrency(account.requiredMonthlySavings ?? 0)}
                                                </span> per month
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {formatCurrency(account.savingsGoalRemaining ?? 0)} remaining
                                            </p>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
