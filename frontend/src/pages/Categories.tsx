import { useEffect, useState } from "react";
import { Pencil, Tags, Trash2 } from "lucide-react";

import api from "../api/client";
import CategoryForm from "../components/forms/CategoryForm";
import EditCategoryForm from "../components/forms/EditCategoryForm";
import type {
    Category,
    CreateCategory,
    UpdateCategory,
} from "../types/category";

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    async function loadCategories() {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<Category[]>("/Categories");

            const sortedCategories = [...response.data].sort((a, b) =>
                a.name.localeCompare(b.name),
            );

            setCategories(sortedCategories);
        } catch (requestError) {
            console.error("Could not load categories:", requestError);

            setError(
                "Could not load categories. Make sure the backend is running.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    async function handleCreateCategory(category: CreateCategory) {
        await api.post("/Categories", category);
        await loadCategories();
    }

    async function handleDeleteCategory(category: Category) {
        const shouldDelete = window.confirm(
            `Delete the category "${category.name}"?`,
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(category.id);
            setError(null);
            await api.delete(`/Categories/${category.id}`);
            setCategories((currentCategories) =>
                currentCategories.filter(
                    (currentCategory) =>
                        currentCategory.id !== category.id,
                ),
            );

            if (editingCategory?.id === category.id) {
                setEditingCategory(null);
            }
        } catch (requestError) {
            console.error("Could not delete category:", requestError);
            
            setError(
                "The category could not be deleted. It may have transactions connected to it.",
            );
        } finally {
            setDeletingId(null);
        }
    }


    async function handleUpdateCategory(
        id: string,
        category: UpdateCategory,
    ) {
        await api.put(`/Categories/${id}`, category);
        setEditingCategory(null);
        await loadCategories();
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading categories...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Categories
                </h1>

                <p className="mt-2 text-slate-500">
                    Organize your income and expenses.
                </p>
            </header>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                {editingCategory ? (
                    <EditCategoryForm
                        category={editingCategory}
                        onSubmit={handleUpdateCategory}
                        onCancel={() => setEditingCategory(null)}
                    />
                ) : (
                    <CategoryForm onSubmit={handleCreateCategory} />
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Your Categories
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {categories.length} categor
                            {categories.length === 1 ? "y" : "ies"} registered.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-slate-100 p-4">
                                <Tags
                                    className="text-slate-500"
                                    size={28}
                                />
                            </div>

                            <h3 className="mt-4 font-semibold text-slate-800">
                                No categories yet
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Add your first category using the form.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <article
                                    key={category.id}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                            <Tags size={18} />
                                        </div>

                                        <p className="truncate font-medium text-slate-900">
                                            {category.name}
                                        </p>
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory(category)}
                                            aria-label={`Edit ${category.name}`}
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCategory(category)}
                                            disabled={deletingId === category.id}
                                            aria-label={`Delete ${category.name}`}
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}