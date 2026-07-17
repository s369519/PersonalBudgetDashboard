import { useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import type { CreateTransaction } from "../../types/transaction";

type TransactionFormProps = {
    accounts: Account[];
    categories: Category[];
    onSubmit: (transaction: CreateTransaction) => Promise<void>;
};

const initialForm: CreateTransaction = {
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    accountId: "",
    categoryId: "",
};

export default function TransactionForm({
    accounts,
    categories,
    onSubmit,
}: TransactionFormProps) {
    const [form, setForm] = useState<CreateTransaction>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!form.accountId) {
            setError("Select an account.");
            return;
        }

        if (!form.categoryId) {
            setError("Select a category.");
            return;
        }

        if (form.amount === 0) {
            setError("Amount cannot be zero.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit({
                ...form,
                description: form.description.trim(),
                date: new Date(`${form.date}T00:00:00Z`).toISOString(),
            });

            setForm({
                ...initialForm,
                date: new Date().toISOString().split("T")[0],
                accountId: accounts[0]?.id ?? "",
                categoryId: categories[0]?.id ?? "",
            });
        } catch (requestError) {
            console.error(
                "Could not create transaction:",
                requestError,
            );

            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not create the transaction.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    Add Transaction
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Use negative amounts for expenses and positive amounts for
                    income.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Description
                    </label>

                    <input
                        id="description"
                        type="text"
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description: event.target.value,
                            })
                        }
                        placeholder="For example: Grocery shopping"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="amount"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Amount
                    </label>

                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                amount: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="date"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Date
                    </label>

                    <input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                date: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="account"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Account
                    </label>

                    <select
                        id="account"
                        value={form.accountId}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                accountId: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Select account</option>

                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="category"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Category
                    </label>

                    <select
                        id="category"
                        value={form.categoryId}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                categoryId: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Select category</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Saving..." : "Add Transaction"}
            </button>
        </form>
    );
}