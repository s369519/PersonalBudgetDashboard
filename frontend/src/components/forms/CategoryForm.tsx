import { useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiError";
import type { CreateCategory } from "../../types/category";

type CategoryFormProps = {
    onSubmit: (category: CreateCategory) => Promise<void>;
};

const initialForm: CreateCategory = {
    name: "",
};

export default function CategoryForm({
    onSubmit,
}: CategoryFormProps) {
    const [form, setForm] = useState<CreateCategory>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = form.name.trim();

        if (!trimmedName) {
            setError("Category name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await onSubmit({
                name: trimmedName,
            });

            setForm(initialForm);
        } catch (requestError) {
            console.error(
                "Could not create category:",
                requestError,
            );
            setError(
                getApiErrorMessage(
                    requestError,
                    "Could not create the category.",
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
                    Add Category
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Create categories for income and expenses.
                </p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor="category-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Category name
                </label>

                <input
                    id="category-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                        setForm({
                            ...form,
                            name: event.target.value,
                        })
                    }
                    placeholder="For example: Transport"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Saving..." : "Add Category"}
            </button>
        </form>
    );
}