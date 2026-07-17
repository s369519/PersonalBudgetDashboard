import { useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type { CreateAccount } from "../../types/account";

type AccountFormProps = {
    onSubmit: (account: CreateAccount) => Promise<void>;
};

const initialForm: CreateAccount = {
    name: "",
    balance: 0,
};

export default function AccountForm({
    onSubmit,
}: AccountFormProps) {
    const [form, setForm] = useState<CreateAccount>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("Account name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit({
                name: form.name.trim(),
                balance: form.balance,
            });

            setForm(initialForm);
        } catch (requestError) {
            console.error(
                "Could not create account:",
                requestError,
            );
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not create the account.",
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
                    Add Account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Create a bank, savings or cash account.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label
                        htmlFor="account-name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Account name
                    </label>

                    <input
                        id="account-name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                name: event.target.value,
                            })
                        }
                        placeholder="For example: Savings account"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="account-balance"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Starting balance
                    </label>

                    <input
                        id="account-balance"
                        type="number"
                        step="0.01"
                        value={form.balance}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                balance: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Saving..." : "Add Account"}
            </button>
        </form>
    );
}