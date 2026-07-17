import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type { Account } from "../../types/account";
import type { Category } from "../../types/category";
import type {
    Transaction,
    UpdateTransaction,
} from "../../types/transaction";

type EditTransactionFormProps = {
    transaction: Transaction;
    accounts: Account[];
    categories: Category[];
    onSubmit: (
        id: string,
        transaction: UpdateTransaction,
    ) => Promise<void>;
    onCancel: () => void;
};

export default function EditTransactionForm({
    transaction,
    accounts,
    categories,
    onSubmit,
    onCancel,
}: EditTransactionFormProps) {
    const selectedAccount = accounts.find(
        (account) => account.name === transaction.accountName,
    );

    const selectedCategory = categories.find(
        (category) => category.name === transaction.categoryName,
    );

    const [form, setForm] = useState<UpdateTransaction>({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date.slice(0, 7),
        accountId: selectedAccount?.id ?? "",
        categoryId: selectedCategory?.id ?? "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const account = accounts.find(
            (item) => item.name === transaction.accountName,
        );

        const category = categories.find(
            (item) => item.name === transaction.categoryName,
        );

        setForm({
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date.slice(0, 7),
            accountId: account?.id ?? "",
            categoryId: category?.id ?? "",
        });
    }, [transaction, accounts, categories]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!form.accountId || !form.categoryId) {
            setError("Account and category are required.");
            return;
        }

        if (form.amount === 0) {
            setError("Amount cannot be zero.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit(transaction.id, {
                ...form,
                description: form.description.trim(),
                date: new Date(`${form.date}-01T00:00:00Z`).toISOString(),
            });
        } catch (requestError) {
            console.error(
                "Could not update transaction:",
                requestError,
            );
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not update the transaction.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    Edit Transaction
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Update the selected transaction.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Description
                    </label>

                    <input
                        type="text"
                        value={form.description}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                description: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Amount
                    </label>

                    <input
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                amount: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Month
                    </label>

                    <input
                        type="month"
                        value={form.date}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                date: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Account
                    </label>

                    <select
                        value={form.accountId}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                accountId: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Category
                    </label>

                    <select
                        value={form.categoryId}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                categoryId: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <div className="mt-6 flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
