import { useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type {
    Account,
    UpdateSavingsGoal,
} from "../../types/account";

type SavingsGoalFormProps = {
    account: Account;
    onSubmit: (goal: UpdateSavingsGoal) => Promise<void>;
    onClear: () => Promise<void>;
    onCancel: () => void;
};

function tomorrowAsInputValue() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
}

export default function SavingsGoalForm({
    account,
    onSubmit,
    onClear,
    onCancel,
}: SavingsGoalFormProps) {
    const [targetAmount, setTargetAmount] = useState(
        account.savingsGoalAmount ?? Math.max(account.balance, 0),
    );
    const [targetDate, setTargetDate] = useState(
        account.savingsGoalDate ?? "",
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (targetAmount <= 0 || !targetDate) {
            setError("Enter a target amount and a future date.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await onSubmit({ targetAmount, targetDate });
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not save the savings goal.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleClear() {
        try {
            setIsSubmitting(true);
            setError(null);
            await onClear();
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not remove the savings goal.",
                ),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm"
        >
            <h2 className="text-xl font-semibold text-slate-900">
                Savings goal
            </h2>
            <p className="mt-1 text-sm text-slate-500">
                Set a goal for {account.name}.
            </p>

            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="savings-target"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Target amount
                    </label>
                    <input
                        id="savings-target"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={targetAmount}
                        onChange={(event) =>
                            setTargetAmount(Number(event.target.value))
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="savings-date"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Target date
                    </label>
                    <input
                        id="savings-date"
                        type="date"
                        min={tomorrowAsInputValue()}
                        value={targetDate}
                        onChange={(event) => setTargetDate(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                    {isSubmitting ? "Saving..." : "Save goal"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
                {account.savingsGoalAmount !== null && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={isSubmitting}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Remove goal
                    </button>
                )}
            </div>
        </form>
    );
}
