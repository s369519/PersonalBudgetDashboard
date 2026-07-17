import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type {
    Account,
    UpdateAccount,
} from "../../types/account";

type EditAccountFormProps = {
    account: Account;
    onSubmit: (
        id: string,
        account: UpdateAccount,
    ) => Promise<void>;
    onCancel: () => void;
};

export default function EditAccountForm({
    account,
    onSubmit,
    onCancel,
}: EditAccountFormProps) {
    const [form, setForm] = useState<UpdateAccount>({
        name: account.name,
        startingBalance: account.startingBalance,
        visibility: account.visibility,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm({
            name: account.name,
            startingBalance: account.startingBalance,
            visibility: account.visibility,
        });
    }, [account]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("Account name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit(account.id, {
                name: form.name.trim(),
                startingBalance: form.startingBalance,
                visibility: form.visibility,
            });
        } catch (requestError) {
            console.error(
                "Could not update account:",
                requestError,
            );
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not update the account.",
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
                    Edit Account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    The current balance is calculated automatically from the starting balance and transactions.
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
                        htmlFor="edit-account-name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Account name
                    </label>

                    <input
                        id="edit-account-name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                name: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="edit-account-balance"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Starting balance
                    </label>

                    <input
                        id="edit-account-balance"
                        type="number"
                        step="0.01"
                        value={form.startingBalance}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                startingBalance: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="edit-account-visibility"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Visibility
                    </label>

                    <select
                        id="edit-account-visibility"
                        value={form.visibility}
                        onChange={(event) =>
                            setForm({
                                ...form,
                                visibility: event.target.value as UpdateAccount["visibility"],
                            })
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="Personal">Personal</option>
                        <option value="Shared">Shared household account</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
